import {addExact, floorDiv, floorMod, intDiv, multiplyExact, subtractExact} from './math';
import {LocalTime} from './localTime';

/**
 * An instantaneous point on the time-line.
 *
 * This class models a single instantaneous point on the time-line.
 * This might be used to record event time-stamps in the application.
 *
 * The range of an instant requires the storage of a number larger than a 64-bit long.
 * To achieve this, the class stores a long representing epoch-seconds and an integer
 * representing nanosecond-of-second, which will always be between 0 and 999,999,999.
 * The epoch-seconds are measured from the standard UNIX epoch of 1970-01-01T00:00:00Z
 * where instants after the epoch have positive values, and earlier instants have
 * negative values. For both the epoch-second and nanosecond parts,
 * a larger value is always later on the time-line than a smaller value.
 */
export class Instant {
    /**
     * The minimum supported epoch second.
     *
     * The minimum is defined as the instant `-999999-01-01T00:00:00Z`.
     */
    private static MIN_SECOND = -31619087596800;

    /**
     * The maximum supported epoch second.
     *
     * The maximum is defined as the instant `+999999-12-31T23:59:59Z`.
     */
    private static MAX_SECOND = 31494784780799;

    /**
     * The instant representing the epoch of 1970-01-01T00:00:00Z.
     */
    public static EPOCH = new Instant(0, 0);

    /**
     * The minimum supported instant.
     *
     * The minimum is defined as the instant `-999999-01-01T00:00:00Z`.
     */
    public static MIN = new Instant(Instant.MIN_SECOND, 0);

    /**
     * The maximum supported instant.
     *
     * The maximum is defined as the instant `+999999-12-31T23:59:59.999999999Z`.
     */
    public static MAX = new Instant(Instant.MAX_SECOND, 999999999);

    /**
     * The point on the time-line as seconds since the epoch.
     */
    private readonly seconds: number;

    /**
     * The nanosecond part of the time, from 0 to 999,999,999.
     */
    private readonly nanos: number = 0;

    /**
     * Initializes a new instant.
     */
    private constructor(seconds: number, nanos: number) {
        this.seconds = seconds;
        this.nanos = nanos;
    }

    /**
     * Obtains the current instant from the system clock.
     */
    public static now(): Instant {
        return Instant.ofEpochMilli(Date.now());
    }

    /**
     * Obtains the instant from a native date object.
     */
    public static fromDate(date: Date): Instant {
        return Instant.ofEpochMilli(date.getTime());
    }

    /**
     * Create an Instant object from milliseconds since epoch. (integer)
     */
    public static ofEpochMilli(epochMilli: number): Instant {
        const epochSecond = floorDiv(epochMilli, LocalTime.MILLIS_PER_SECOND);
        const milliAdjustment = floorMod(epochMilli, LocalTime.MILLIS_PER_SECOND);
        const nanos = milliAdjustment * LocalTime.NANOS_PER_MILLI;

        return Instant.ofEpochSecond(epochSecond, nanos);
    }

    /**
     * Obtains an instant using seconds from the epoch and nanosecond fraction of second.
     *
     * @param {number} epochSecond The number of seconds from the epoch of 1970-01-01T00:00:00Z
     * @param {number} nanoAdjustment The nanosecond adjustment to the number of seconds,
     *                                positive or negative.
     */
    public static ofEpochSecond(epochSecond: number, nanoAdjustment = 0): Instant {
        if (!Number.isSafeInteger(epochSecond) || !Number.isSafeInteger(nanoAdjustment)) {
            throw new Error('The timestamp must be a safe integer.');
        }

        if (epochSecond === 0 && nanoAdjustment === 0) {
            return Instant.EPOCH;
        }

        if (epochSecond < Instant.MIN_SECOND || epochSecond > Instant.MAX_SECOND) {
            throw new Error(
                `The value ${epochSecond} is out of the range `
                + `[${Instant.MIN_SECOND} - ${Instant.MAX_SECOND}] of instant.`,
            );
        }

        let seconds = epochSecond;
        let nanos = nanoAdjustment;

        if (nanoAdjustment !== 0) {
            seconds = addExact(seconds, floorDiv(nanoAdjustment, LocalTime.NANOS_PER_SECOND));
            nanos = floorMod(nanoAdjustment, LocalTime.NANOS_PER_SECOND);
        }

        return new Instant(seconds, nanos);
    }

    /**
     * Parses an instant from a string.
     *
     * Supported ISO-8601 formats:
     *
     * YYYY-MM
     *
     * YYYY-MM-DD
     *
     * YYYY-MM-DDTHH:MM:SSTZ
     *
     * YYYY-MM-DDTHH:MM:SS.mmmTZ
     *
     * @param value The string to parse.
     *
     * @returns The parsed instant.
     */
    public static parse(value: string): Instant {
        const isInvalidDateTime = !Instant.isValidDateTimeString(value);

        if (isInvalidDateTime) {
            throw new Error(
                'Invalid string format. Must be an ISO-8601 date or an ISO-8601 date-time with seconds and timezone',
            );
        }

        return Instant.ofEpochMilli(Date.parse(value));
    }

    /**
     * Compares this instant to another for ascending order.
     *
     * @param left  The first instant to compare.
     * @param right The second instant to compare.
     */
    public static compareAscending(left: Instant, right: Instant): number {
        return left.compare(right);
    }

    /**
     * Compares this instant to another for ascending order.
     *
     * @param left  The first instant to compare.
     * @param right The second instant to compare.
     */
    public static compareDescending(left: Instant, right: Instant): number {
        return right.compare(left);
    }

    /**
     * Returns the number of seconds from the epoch of 1970-01-01T00:00:00Z.
     */
    public getSeconds(): number {
        return this.seconds;
    }

    /**
     * Returns nanosecond-of-second part of the instant.
     */
    public getNano(): number {
        return this.nanos;
    }

    /**
     * Converts this instant to the number of milliseconds since the epoch.
     *
     * @throws {Error} If the instant cannot be represented as a number of milliseconds.
     */
    public toEpochMillis(): number {
        if (this.seconds < 0 && this.nanos > 0) {
            const millis = multiplyExact(this.seconds + 1, LocalTime.MILLIS_PER_SECOND);
            const adjustment = intDiv(this.nanos, LocalTime.NANOS_PER_MILLI) - LocalTime.MILLIS_PER_SECOND;

            return addExact(millis, adjustment);
        }

        const millis = multiplyExact(this.seconds, LocalTime.MILLIS_PER_SECOND);
        const adjustment = intDiv(this.nanos, LocalTime.NANOS_PER_MILLI);

        return addExact(millis, adjustment);
    }

    /**
     * Converts this instant to a native date object.
     */
    public toDate(): Date {
        return new Date(this.toEpochMillis());
    }

    /**
     * Converts this instant to a string in ISO-8601 format.
     */
    public toString(): string {
        let string = new Date(this.seconds * LocalTime.MILLIS_PER_SECOND).toISOString();

        // Strip the milliseconds and zone ID from the end of the string.
        string = string.slice(0, string.indexOf('.'));

        if (this.nanos > 0) {
            const fraction = `${this.nanos}`.padStart(9, '0').replace(/0+$/, '');
            const scale = Math.floor((fraction.length + 2) / 3) * 3;

            string += `.${fraction.padEnd(scale, '0')}`;
        }

        string += 'Z';

        return string;
    }

    /**
     * Serializes this instant to a JSON value.
     */
    public toJSON(): string {
        return this.toString();
    }

    /**
     * Checks whether this instant is equal to another.
     *
     * @param instant The instant to compare.
     */
    public equals(instant: Instant): boolean {
        return this.seconds === instant.seconds && this.nanos === instant.nanos;
    }

    /**
     * Adds a duration in seconds to this instant.
     *
     * @param seconds The number of seconds to add.
     *
     * @throws {Error} If the result is out of the range of supported instants.
     */
    public plusSeconds(seconds: number): Instant {
        if (seconds === 0) {
            return this;
        }

        return Instant.ofEpochSecond(addExact(this.seconds, seconds), this.nanos);
    }

    /**
     * Subtracts a duration in seconds from this instant.
     *
     * @param seconds The number of seconds to subtract.
     *
     * @throws {Error} If the result is out of the range of supported instants.
     */
    public minusSeconds(seconds: number): Instant {
        if (seconds === 0) {
            return this;
        }

        return Instant.ofEpochSecond(subtractExact(this.seconds, seconds), this.nanos);
    }

    /**
     * Checks whether this instant is after another.
     *
     * @param instant The instant to compare.
     */
    public isAfter(instant: Instant): boolean {
        return this.compare(instant) > 0;
    }

    /**
     * Checks whether this instant is after or equal to another.
     *
     * @param instant The instant to compare.
     */
    public isAfterOrEqual(instant: Instant): boolean {
        return this.compare(instant) >= 0;
    }

    /**
     * Checks whether this instant is before another.
     *
     * @param instant The instant to compare.
     */
    public isBefore(instant: Instant): boolean {
        return this.compare(instant) < 0;
    }

    /**
     * Checks whether this instant is before or equal to another.
     *
     * @param instant The instant to compare.
     */
    public isBeforeOrEqual(instant: Instant): boolean {
        return this.compare(instant) <= 0;
    }

    /**
     * Compares this instant to another for order.
     *
     * @param instant The instant to compare.
     */
    public compare(instant: Instant): number {
        if (this.seconds !== instant.seconds) {
            return this.seconds - instant.seconds;
        }

        return this.nanos - instant.nanos;
    }

    /**
         * Checks if a string is a valid ISO-8601 date time.
         *
         * Supported formats:
         *
         * YYYY-MM
         *
         * YYYY-MM-DD
         *
         * YYYY-MM-DDTHH:MM:SSTZ
         *
         * YYYY-MM-DDTHH:MM:SS.mmmTZ
         *
         * @param value The date-time string to validate.
         *
         * @returns The result of validation.
         */
    private static isValidDateTimeString(value: string): boolean {
        let isValid = false;

        // Checks YYYY
        isValid = isValid || /\d{4}$/.test(value);
        // Checks YYYY-MM
        isValid = isValid || /\d{4}-[01]\d$/.test(value);
        // Checks YYYY-MM-DD
        isValid = isValid || /\d{4}-[01]\d-[0-3]\d$/.test(value);
        // Checks YYYY-MM-DDTHH:MM:SSTZ
        isValid = isValid || /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)$/.test(value);
        // Checks YYYY-MM-DDTHH:MM:SS.mmmTZ
        isValid = isValid || /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/.test(value);

        return isValid;
    }
}
