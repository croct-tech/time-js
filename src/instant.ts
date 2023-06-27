import {Clock} from './clock';
import {DefaultClockProvider} from './defaultClockProvider';
import {LocalDate} from './localDate';
import {LocalDateTime} from './localDateTime';
import {LocalTime} from './localTime';
import {addExact, floorDiv, floorMod, intDiv, multiplyExact, subtractExact} from './math';

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
     * The instant representing the epoch of 1970-01-01T00:00:00Z.
     */
    public static EPOCH = new Instant(0, 0);

    /**
     * The minimum supported epoch second.
     *
     * The minimum is defined as the instant `-999999-01-01T00:00:00Z`.
     */
    private static MIN_SECOND = -31619087596800;

    /**
     * The minimum supported instant.
     *
     * The minimum is defined as the instant `-999999-01-01T00:00:00Z`.
     */
    public static MIN = new Instant(Instant.MIN_SECOND, 0);

    /**
     * The maximum supported epoch second.
     *
     * The maximum is defined as the instant `+999999-12-31T23:59:59Z`.
     */
    private static MAX_SECOND = 31494784780799;

    /**
     * The maximum supported instant.
     *
     * The maximum is defined as the instant `+999999-12-31T23:59:59.999999999Z`.
     */
    public static MAX = new Instant(Instant.MAX_SECOND, 999999999);

    /**
     * A regular expression that matches ISO-8601 date-time strings in UTC.
     */
    // eslint-disable-next-line max-len -- Regex literal cannot be split.
    private static PATTERN = /^(?<year>[+-]?\d{4,19})-(?<month>\d{2})-(?<day>\d{2})T(?<hour>\d{2})(?::(?<minute>\d{2})(:(?<second>\d{2})(?:.(?<fraction>\d{1,9}))?)?)?Z$/;

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
     *
     * @param clock The clock to use.
     */
    public static now(clock: Clock = DefaultClockProvider.getClock()): Instant {
        return clock.getInstant();
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
     * Supported formats:
     * - YYYY-MM-DDTHHZ
     * - YYYY-MM-DDTHH:MMZ
     * - YYYY-MM-DDTHH:MM:SSZ
     * - YYYY-MM-DDTHH:MM:SS.fZ
     *
     * @param value The string to parse.
     *
     * @returns The parsed instant.
     */
    public static parse(value: string): Instant {
        const matches = value.match(Instant.PATTERN);
        const groups = matches?.groups;

        if (groups == null) {
            throw new Error(`Unrecognized UTC ISO-8601 date-time string "${value}".`);
        }

        const daysSinceEpoch = LocalDate.of(
            Number.parseInt(groups.year, 10),
            Number.parseInt(groups.month, 10),
            Number.parseInt(groups.day, 10),
        ).toEpochDay();

        const nanoOfDay = LocalTime.of(
            Number.parseInt(groups.hour, 10),
            Number.parseInt(groups.minute ?? '0', 10),
            Number.parseInt(groups.second ?? '0', 10),
            Number.parseInt(groups.fraction?.padEnd(9, '0') ?? '0', 10),
        ).toNanoOfDay();

        return Instant.ofEpochSecond(
            multiplyExact(daysSinceEpoch, LocalTime.SECONDS_PER_DAY),
            nanoOfDay,
        );
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
        // 1970 - 400 < year of cycle < 1970 + 400
        const secondOfCycle = this.seconds % (146097 * 86400);
        const dateTime = LocalDateTime.ofEpochSecond(secondOfCycle, this.nanos);
        const year = dateTime.getYear() + intDiv(this.seconds, 146097 * 86400) * 400;
        let prefix = '';

        if (year < 0) {
            prefix = '-';
        } else if (year > 9999) {
            prefix = '+';
        }

        const paddedYear = prefix + Math.abs(year)
            .toString()
            .padStart(4, '0');

        let string = paddedYear + dateTime.toString().slice(4);

        if (dateTime.getSecond() === 0 && dateTime.getNano() === 0) {
            string += ':00';
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
     * Adds a duration in days to this instant, considering a day as a fixed number of seconds.
     *
     * This method does not account for timezone or calendar adjustments,
     * as it considers a day always to have the same number of seconds.
     *
     * @param days The number of days to add.
     *
     * @throws {Error} If the result is out of the range of supported instants.
     */
    public plusDays(days: number): Instant {
        if (days === 0) {
            return this;
        }

        const seconds = multiplyExact(days, LocalTime.SECONDS_PER_DAY);

        return this.plusSeconds(seconds);
    }

    /**
     * Subtracts a duration in days from this instant, considering a day as a fixed number of seconds.
     *
     * This method does not account for timezone or calendar adjustments,
     * as it considers a day always to have the same number of seconds.
     *
     * @param days The number of days to subtract.
     *
     * @throws {Error} If the result is out of the range of supported instants.
     */
    public minusDays(days: number): Instant {
        if (days === 0) {
            return this;
        }

        const seconds = multiplyExact(days, LocalTime.SECONDS_PER_DAY);

        return this.minusSeconds(seconds);
    }

    /**
     * Adds a duration in hours to this instant.
     *
     * @param hours The number of hours to add.
     *
     * @throws {Error} If the result is out of the range of supported instants.
     */
    public plusHours(hours: number): Instant {
        if (hours === 0) {
            return this;
        }

        const seconds = multiplyExact(hours, LocalTime.SECONDS_PER_HOUR);

        return this.plusSeconds(seconds);
    }

    /**
     * Subtracts a duration in hours from this instant.
     *
     * @param hours The number of hours to subtract.
     *
     * @throws {Error} If the result is out of the range of supported instants.
     */
    public minusHours(hours: number): Instant {
        if (hours === 0) {
            return this;
        }

        const seconds = multiplyExact(hours, LocalTime.SECONDS_PER_HOUR);

        return this.minusSeconds(seconds);
    }

    /**
     * Adds a duration in minutes to this instant.
     *
     * @param minutes The number of minutes to add.
     *
     * @throws {Error} If the result is out of the range of supported instants.
     */
    public plusMinutes(minutes: number): Instant {
        if (minutes === 0) {
            return this;
        }

        const seconds = multiplyExact(minutes, LocalTime.SECONDS_PER_MINUTE);

        return this.plusSeconds(seconds);
    }

    /**
     * Subtracts a duration in minutes from this instant.
     *
     * @param minutes The number of minutes to subtract.
     *
     * @throws {Error} If the result is out of the range of supported instants.
     */
    public minusMinutes(minutes: number): Instant {
        if (minutes === 0) {
            return this;
        }

        const seconds = multiplyExact(minutes, LocalTime.SECONDS_PER_MINUTE);

        return this.minusSeconds(seconds);
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
     * Adds a duration in milliseconds to this instant.
     *
     * @param millis The number of milliseconds to add.
     *
     * @throws {Error} If the result is out of the range of supported instants.
     */
    public plusMillis(millis: number): Instant {
        if (millis === 0) {
            return this;
        }

        const extra = intDiv(millis, LocalTime.MILLIS_PER_SECOND);
        const seconds = addExact(this.seconds, extra);

        const remainder = millis % LocalTime.MILLIS_PER_SECOND;
        const nanos = this.nanos + (remainder * LocalTime.NANOS_PER_MILLI);

        return Instant.ofEpochSecond(seconds, nanos);
    }

    /**
     * Subtracts a duration in milliseconds from this instant.
     *
     * @param millis The number of milliseconds to subtract.
     *
     * @throws {Error} If the result is out of the range of supported instants.
     */
    public minusMillis(millis: number): Instant {
        return this.plusMillis(-millis);
    }

    /**
     * Adds a duration in microseconds to this instant.
     *
     * @param micros The number of microseconds to add.
     *
     * @throws {Error} If the result is out of the range of supported instants.
     */
    public plusMicros(micros: number): Instant {
        if (micros === 0) {
            return this;
        }

        const extra = intDiv(micros, LocalTime.MICROS_PER_SECOND);
        const seconds = addExact(this.seconds, extra);

        const remainder = micros % LocalTime.MICROS_PER_SECOND;
        const nanos = this.nanos + (remainder * LocalTime.NANOS_PER_MICRO);

        return Instant.ofEpochSecond(seconds, nanos);
    }

    /**
     * Subtracts a duration in microseconds from this instant.
     *
     * @param micros The number of microseconds to subtract.
     *
     * @throws {Error} If the result is out of the range of supported instants.
     */
    public minusMicros(micros: number): Instant {
        return this.plusMicros(-micros);
    }

    /**
     * Adds a duration in nanoseconds to this instant.
     *
     * @param nanos The number of nanoseconds to add.
     *
     * @throws {Error} If the result is out of the range of supported instants.
     */
    public plusNanos(nanos: number): Instant {
        if (nanos === 0) {
            return this;
        }

        const extra = intDiv(nanos, LocalTime.NANOS_PER_SECOND);
        const seconds = addExact(this.seconds, extra);

        const remainder = nanos % LocalTime.NANOS_PER_SECOND;
        const newNanos = this.nanos + remainder;

        return Instant.ofEpochSecond(seconds, newNanos);
    }

    /**
     * Subtracts a duration in nanoseconds from this instant.
     *
     * @param nanos The number of nanoseconds to subtract.
     *
     * @throws {Error} If the result is out of the range of supported instants.
     */
    public minusNanos(nanos: number): Instant {
        return this.plusNanos(-nanos);
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
     * Checks whether the given string is a valid ISO-8601 instant.
     *
     * In addition to checking that the string is well-formed, this method also validates that the instant is valid.
     *
     * For example, this method returns false for points on the time-line such as February 29 in a non-leap year.
     *
     * See the {@link Instant#parse|parse} method for more information about the expected format.
     *
     * @param value The instant string to validate.
     * @return `true` if the instant is well-formed and valid, `false` otherwise.
     */
    public static isValid(value: string): boolean {
        try {
            Instant.parse(value);
        } catch {
            return false;
        }

        return true;
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
}
