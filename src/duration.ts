import {LocalTime} from './localTime';
import {addExact, intDiv, multiplyExact, subtractExact} from './math';

/**
 * A calendar agnostic amount of time, such as '34.5 seconds'.
 *
 * This class models a quantity or amount of time in terms of seconds and
 * nanoseconds.
 */
export class Duration {
    private readonly seconds: number;

    private readonly nanos: number;

    // eslint-disable-next-line max-len -- Regex literal cannot be split.
    private static PATTERN = /^(?<sign>[-+]?)P(?:(?<day>[-+]?[0-9]+)D)?(?<time>T(?:(?<hour>[-+]?[0-9]+)H)?(?:(?<minute>[-+]?[0-9]+)M)?(?:(?<second>[-+]?[0-9]+)(?:[.,](?<fraction>[0-9]{0,9}))?S)?)?$/i;

    /**
     * Creates an instance of Duration.
     */
    private constructor(seconds: number, nanos = 0) {
        this.seconds = seconds;
        this.nanos = nanos;
    }

    /**
     * Obtains a Duration from an ISO-8601 based string
     * such as 'P1DT2H3M45.678S'.
     *
     * @param value - The string to parse
     */
    public static parse(value: string): Duration {
        const {groups} = value.match(Duration.PATTERN) ?? {};

        if (groups === undefined) {
            throw new Error(`Unrecognized ISO-8601 duration string "${value}".`);
        }

        const isDayUndefined = groups.day === undefined;
        const isTimeUndefined = groups.hour === undefined && groups.minute === undefined && groups.second === undefined;
        const isTimeSpecified = groups.time?.[0] === 'T';

        if (isDayUndefined && isTimeUndefined) {
            throw new Error(`Unrecognized ISO-8601 duration string "${value}".`);
        }

        if (isTimeSpecified && isTimeUndefined) {
            throw new Error(`Unrecognized ISO-8601 duration string "${value}".`);
        }

        const daysInSeconds = Number.parseInt(groups.day ?? '0', 10) * LocalTime.SECONDS_PER_DAY;
        const hoursInSeconds = Number.parseInt(groups.hour ?? '0', 10) * LocalTime.SECONDS_PER_HOUR;
        const minutesInSeconds = Number.parseInt(groups.minute ?? '0', 10) * LocalTime.SECONDS_PER_MINUTE;
        const seconds = Number.parseInt(groups.second ?? '0', 10);
        const fraction = Number.parseInt(groups.fraction?.padEnd(9, '0') ?? '0', 10);

        const totalSeconds = [daysInSeconds, hoursInSeconds, minutesInSeconds, seconds].reduce(addExact, 0);
        const nanos = groups.second?.[0] === '-' && fraction > 0 ? (fraction * -1) : fraction;

        const negate = groups.sign === '-';
        const finalSeconds = totalSeconds !== 0 && negate ? -totalSeconds : totalSeconds;
        const finalNanos = nanos !== 0 && negate ? -nanos : nanos;

        return Duration.ofSeconds(finalSeconds, finalNanos);
    }

    /**
     * Obtains a Duration representing zero amount of time.
     */
    public static zero(): Duration {
        return new Duration(0);
    }

    /**
     * Obtains a Duration representing an amount of standard weeks.
     *
     * @param weeks - The amount of weeks
     */
    public static ofWeeks(weeks: number): Duration {
        return Duration.ofSeconds(multiplyExact(weeks, LocalTime.SECONDS_PER_DAY * 7));
    }

    /**
     * Obtains a Duration representing an amount of standard 24-hour days.
     *
     * @param days - The amount of days
     */
    public static ofDays(days: number): Duration {
        return Duration.ofSeconds(multiplyExact(days, LocalTime.SECONDS_PER_DAY));
    }

    /**
     * Obtains a Duration representing an amount of hours.
     *
     * @param hours - The amount of hours
     */
    public static ofHours(hours: number): Duration {
        return Duration.ofSeconds(multiplyExact(hours, LocalTime.SECONDS_PER_HOUR));
    }

    /**
     * Obtains a Duration representing an amount of minutes.
     *
     * @param minutes - The amount of minutes
     */
    public static ofMinutes(minutes: number): Duration {
        return Duration.ofSeconds(multiplyExact(minutes, LocalTime.SECONDS_PER_MINUTE));
    }

    /**
     * Obtains a Duration representing an amount of seconds and an adjustment
     * in nanoseconds.
     *
     * @param seconds - The amount of seconds
     * @param nanoAdjustment - The nanosecond adjustment
     */
    public static ofSeconds(seconds: number, nanoAdjustment = 0): Duration {
        if (seconds === 0 && nanoAdjustment === 0) {
            return new Duration(0);
        }

        if (nanoAdjustment >= 0 && nanoAdjustment < LocalTime.NANOS_PER_SECOND) {
            return new Duration(seconds, nanoAdjustment);
        }

        const extraSeconds = intDiv(nanoAdjustment, LocalTime.NANOS_PER_SECOND);
        let finalNanoAdjustment = nanoAdjustment % LocalTime.NANOS_PER_SECOND;

        let finalSeconds = addExact(seconds, extraSeconds);

        if (nanoAdjustment < 0) {
            finalNanoAdjustment += LocalTime.NANOS_PER_SECOND;
            finalSeconds = subtractExact(finalSeconds, 1);
        }

        return new Duration(finalSeconds, finalNanoAdjustment);
    }

    /**
     * Obtains a Duration representing an amount of milliseconds.
     *
     * @param millis - The amount of milliseconds
     */
    public static ofMillis(millis: number): Duration {
        const seconds = intDiv(millis, LocalTime.MILLIS_PER_SECOND);
        const nanos = (millis % LocalTime.MILLIS_PER_SECOND) * LocalTime.NANOS_PER_MILLI;

        return Duration.ofSeconds(seconds, nanos);
    }

    /**
     * Obtains a Duration representing an amount of microseconds.
     *
     * @param micros - The amount of microseconds
     */
    public static ofMicros(micros: number): Duration {
        const seconds = intDiv(micros, LocalTime.MICROS_PER_SECOND);
        const nanos = (micros % LocalTime.MICROS_PER_SECOND) * LocalTime.NANOS_PER_MICRO;

        return Duration.ofSeconds(seconds, nanos);
    }

    /**
     * Obtains a Duration representing an amount of nanoseconds.
     *
     * @param nanos - The amount of nanoseconds
     */
    public static ofNanos(nanos: number): Duration {
        return Duration.ofSeconds(0, nanos);
    }

    /**
     * Checks if this duration is zero length.
     */
    public isZero(): boolean {
        return this.seconds === 0 && this.nanos === 0;
    }

    /**
     * Checks if this duration is negative.
     */
    public isNegative(): boolean {
        return this.seconds < 0;
    }

    /**
     * Checks if this duration is negative or zero.
     */
    public isNegativeOrZero(): boolean {
        return this.seconds < 0 || (this.seconds === 0 && this.nanos === 0);
    }

    /**
     * Checks if this duration is positive.
     */
    public isPositive(): boolean {
        return this.seconds > 0 || (this.seconds === 0 && this.nanos !== 0);
    }

    /**
     * Checks if this duration is positive or zero
     */
    public isPositiveOrZero(): boolean {
        return this.seconds > 0 || (this.seconds === 0 && this.nanos >= 0);
    }

    /**
     * Gets the number of seconds in this duration.
     */
    public getSeconds(): number {
        return this.seconds;
    }

    /**
     * Gets the number of nanoseconds within the second in this duration.
     */
    public getNanos(): number {
        return this.nanos;
    }

    /**
     * Returns a copy of this duration with the specified amount of seconds.
     *
     * @param seconds - The number of seconds
     */
    public withSeconds(seconds: number): Duration {
        if (seconds === this.seconds) {
            return this;
        }

        return Duration.ofSeconds(seconds, this.nanos);
    }

    /**
     * Returns a copy of this duration with the specified nano-of-second.
     *
     * @param nanos - The nano-of-second to represent
     */
    public withNanos(nanos: number): Duration {
        if (nanos === this.nanos) {
            return this;
        }

        return Duration.ofSeconds(this.seconds, nanos);
    }

    /**
     * Returns a copy of this duration with the specified duration added.
     *
     * @param duration - The duration to add
     */
    public plusDuration(duration: Duration): Duration {
        if (duration.isZero()) {
            return this;
        }

        const totalSeconds = addExact(this.seconds, duration.getSeconds());
        const totalNanos = addExact(this.nanos, duration.getNanos());

        return Duration.ofSeconds(totalSeconds, totalNanos);
    }

    /**
     * Returns a copy of this duration with the specified duration subtracted.
     *
     * @param duration - The duration to subtract
     */
    public minusDuration(duration: Duration): Duration {
        if (duration.isZero()) {
            return this;
        }

        const totalSeconds = subtractExact(this.seconds, duration.getSeconds());
        const totalNanos = subtractExact(this.nanos, duration.getNanos());

        return Duration.ofSeconds(totalSeconds, totalNanos);
    }

    /**
     * Returns a copy of this duration with the specified number of 24-hour
     * days added.
     *
     * @param days - The days to add
     */
    public plusDays(days: number): Duration {
        if (days === 0) {
            return this;
        }

        const seconds = multiplyExact(days, LocalTime.SECONDS_PER_DAY);
        const totalSeconds = addExact(this.seconds, seconds);

        return Duration.ofSeconds(totalSeconds, this.nanos);
    }

    /**
     * Returns a copy of this duration with the specified number of 24-hour
     * days subtracted.
     *
     * @param days - The days to subtract
     */
    public minusDays(days: number): Duration {
        return this.plusDays(-days);
    }

    /**
     * Returns a copy of this duration with the specified number of hours
     * added.
     *
     * @param hours - The hours to add
     */
    public plusHours(hours: number): Duration {
        if (hours === 0) {
            return this;
        }

        const seconds = multiplyExact(hours, LocalTime.SECONDS_PER_HOUR);
        const totalSeconds = addExact(this.seconds, seconds);

        return Duration.ofSeconds(totalSeconds, this.nanos);
    }

    /**
     * Returns a copy of this duration with the specified number of hours
     * subtracted.
     *
     * @param hours - The hours to subtract
     */
    public minusHours(hours: number): Duration {
        return this.plusHours(-hours);
    }

    /**
     * Returns a copy of this duration with the specified number of minutes
     * added.
     *
     * @param minutes - The minutes to add
     */
    public plusMinutes(minutes: number): Duration {
        if (minutes === 0) {
            return this;
        }

        const seconds = multiplyExact(minutes, LocalTime.SECONDS_PER_MINUTE);
        const totalSeconds = addExact(this.seconds, seconds);

        return Duration.ofSeconds(totalSeconds, this.nanos);
    }

    /**
     * Returns a copy of this duration with the specified number of minutes
     * subtracted.
     *
     * @param minutes - The minutes to subtract
     */
    public minusMinutes(minutes: number): Duration {
        return this.plusMinutes(-minutes);
    }

    /**
     * Returns a copy of this duration with the specified number of seconds
     * added.
     *
     * @param seconds - The seconds to add
     */
    public plusSeconds(seconds: number): Duration {
        if (seconds === 0) {
            return this;
        }

        const totalSeconds = addExact(this.seconds, seconds);

        return Duration.ofSeconds(totalSeconds, this.nanos);
    }

    /**
     * Returns a copy of this duration with the specified number of seconds
     * subtracted.
     *
     * @param seconds - The seconds to subtract
     */
    public minusSeconds(seconds: number): Duration {
        return this.plusSeconds(-seconds);
    }

    /**
     * Returns a copy of this duration with the specified number of milliseconds
     * added.
     *
     * @param millis - The milliseconds to add
     */
    public plusMillis(millis: number): Duration {
        if (millis === 0) {
            return this;
        }

        const seconds = intDiv(millis, LocalTime.MILLIS_PER_SECOND);
        const totalSeconds = addExact(this.seconds, seconds);

        const remainder = millis % LocalTime.MILLIS_PER_SECOND;
        const nanos = this.nanos + (remainder * LocalTime.NANOS_PER_MILLI);

        return Duration.ofSeconds(totalSeconds, nanos);
    }

    /**
     * Returns a copy of this duration with the specified number of milliseconds
     * subtracted.
     *
     * @param millis - The milliseconds to subtract
     */
    public minusMillis(millis: number): Duration {
        return this.plusMillis(-millis);
    }

    /**
     * Returns a copy of this duration with the specified number of microseconds
     * added.
     *
     * @param micros - The microseconds to add
     */
    public plusMicros(micros: number): Duration {
        if (micros === 0) {
            return this;
        }

        const seconds = intDiv(micros, LocalTime.MICROS_PER_SECOND);
        const totalSeconds = addExact(this.seconds, seconds);

        const remainder = micros % LocalTime.MICROS_PER_SECOND;
        const nanos = this.nanos + (remainder * LocalTime.NANOS_PER_MICRO);

        return Duration.ofSeconds(totalSeconds, nanos);
    }

    /**
     * Returns a copy of this duration with the specified number of
     * microseconds subtracted.
     *
     * @param micros - The microseconds to subtract
     */
    public minusMicros(micros: number): Duration {
        return this.plusMicros(-micros);
    }

    /**
     * Returns a copy of this duration with the specified number of nanoseconds
     * added.
     *
     * @param nanos - The nanoseconds to add
     */
    public plusNanos(nanos: number): Duration {
        if (nanos === 0) {
            return this;
        }

        const seconds = intDiv(nanos, LocalTime.NANOS_PER_SECOND);
        const totalSeconds = addExact(this.seconds, seconds);

        const remainder = nanos % LocalTime.NANOS_PER_SECOND;
        const newNanos = this.nanos + remainder;

        return Duration.ofSeconds(totalSeconds, newNanos);
    }

    /**
     * Returns a copy of this duration with the specified number of nanoseconds
     * subtracted.
     *
     * @param nanos - The nanoseconds to subtract
     */
    public minusNanos(nanos: number): Duration {
        return this.plusNanos(-nanos);
    }

    /**
     * Checks if this duration is equal to another duration.
     *
     * @param other - The other duration
     */
    public equals(other: Duration): boolean {
        return this.seconds === other.seconds && this.nanos === other.nanos;
    }

    /**
     * Returns a copy of this duration multiplied by the specified multiplier.
     *
     * @param multiplier - The multiplier
     */
    public multipliedBy(multiplier: number): Duration {
        if (multiplier === 0) {
            return Duration.zero();
        }

        if (multiplier === 1) {
            return this;
        }

        const seconds = multiplyExact(this.seconds, multiplier);
        const nanos = multiplyExact(this.nanos, multiplier);

        return Duration.ofSeconds(seconds, nanos);
    }

    /**
     * Gets the number of days in this duration.
     */
    public toDays(): number {
        return intDiv(this.seconds, LocalTime.SECONDS_PER_DAY);
    }

    /**
     * Gets the number of hours in this duration.
     */
    public toHours(): number {
        return intDiv(this.seconds, LocalTime.SECONDS_PER_HOUR);
    }

    /**
     * Gets the number of minutes in this duration.
     */
    public toMinutes(): number {
        return intDiv(this.seconds, LocalTime.SECONDS_PER_MINUTE);
    }

    /**
     * Gets the number of seconds in this duration.
     */
    public toSeconds(): number {
        if (this.seconds < 0 && this.nanos > 0) {
            return this.seconds + 1;
        }

        return this.seconds;
    }

    /**
     * Converts this duration to the total length in milliseconds.
     */
    public toMillis(): number {
        return addExact(
            multiplyExact(this.seconds, LocalTime.MILLIS_PER_SECOND),
            intDiv(this.nanos, LocalTime.NANOS_PER_MILLI),
        );
    }

    /**
     * Converts this duration to the total length in microseconds.
     */
    public toMicros(): number {
        return addExact(
            multiplyExact(this.seconds, LocalTime.MICROS_PER_SECOND),
            intDiv(this.nanos, LocalTime.NANOS_PER_MICRO),
        );
    }

    /**
     * Converts this duration to the total length in nanoseconds.
     */
    public toNanos(): number {
        return addExact(
            multiplyExact(this.seconds, LocalTime.NANOS_PER_SECOND),
            this.nanos,
        );
    }

    /**
     * Extracts the number of days in the duration.
     */
    public toDaysPart(): number {
        return this.toDays();
    }

    /**
     * Extracts the number of hours part in the duration.
     */
    public toHoursPart(): number {
        return this.toHours() % LocalTime.HOURS_PER_DAY;
    }

    /**
     * Extracts the number of minutes part in the duration.
     */
    public toMinutesPart(): number {
        return this.toMinutes() % LocalTime.MINUTES_PER_HOUR;
    }

    /**
     * Extracts the number of seconds part in the duration.
     */
    public toSecondsPart(): number {
        return this.toSeconds() % LocalTime.SECONDS_PER_MINUTE;
    }

    /**
     * Extracts the number of milliseconds part of the duration.
     */
    public toMillisPart(): number {
        return intDiv(this.toNanosPart(), LocalTime.NANOS_PER_MILLI);
    }

    /**
     * Extracts the number of microseconds part of the duration.
     */
    public toMicrosPart(): number {
        return intDiv(this.toNanosPart(), LocalTime.NANOS_PER_MICRO);
    }

    /**
     * Extracts the number of nanoseconds part of the duration.
     */
    public toNanosPart(): number {
        if (this.seconds < 0 && this.nanos > 0) {
            return this.nanos - LocalTime.NANOS_PER_SECOND;
        }

        return this.nanos;
    }

    /**
     * Checks if this duration is longer than the specified Duration.
     *
     * @param other - The other duration
     */
    public isLongerThan(other: Duration): boolean {
        if (this.seconds > other.seconds) {
            return true;
        }

        return this.seconds === other.seconds && this.nanos > other.nanos;
    }

    /**
     * Checks if this duration is longer than or equal to the specified
     * Duration.
     *
     * @param other - The other duration
     */
    public isLongerThanOrEqualTo(other: Duration): boolean {
        if (this.seconds > other.seconds) {
            return true;
        }

        return this.seconds === other.seconds && this.nanos >= other.nanos;
    }

    /**
     * Checks if this duration is shorter than the specified Duration.
     *
     * @param other - The other duration
     */
    public isShorterThan(other: Duration): boolean {
        if (this.seconds < other.seconds) {
            return true;
        }

        return this.seconds === other.seconds && this.nanos < other.nanos;
    }

    /**
     * Checks if this duration is shorter than or equal to the specified
     * Duration.
     *
     * @param other - The other duration
     */
    public isShorterThanOrEqualTo(other: Duration): boolean {
        if (this.seconds < other.seconds) {
            return true;
        }

        return this.seconds === other.seconds && this.nanos <= other.nanos;
    }

    /**
     * Converts this duration to an ISO-8601 based string representation.
     */
    public toString(): string {
        let {seconds, nanos} = this;

        if (seconds === 0 && nanos === 0) {
            return 'PT0S';
        }

        const sign = seconds < 0;

        if (seconds < 0 && nanos !== 0) {
            seconds++;
            nanos = LocalTime.NANOS_PER_SECOND - nanos;
        }

        const hours = intDiv(seconds, LocalTime.SECONDS_PER_HOUR);
        const minutes = intDiv(seconds % LocalTime.SECONDS_PER_HOUR, LocalTime.SECONDS_PER_MINUTE);

        seconds %= LocalTime.SECONDS_PER_MINUTE;

        let output = 'PT';

        if (hours !== 0) {
            output += `${hours}H`;
        }

        if (minutes !== 0) {
            output += `${minutes}M`;
        }

        if (seconds === 0 && nanos === 0) {
            return output;
        }

        output += seconds === 0 && sign ? '-0S' : `${seconds}`;

        if (nanos !== 0) {
            const fraction = `${nanos}`.padStart(9, '0').replace(/0+$/, '');
            const scale = intDiv(fraction.length + 2, 3) * 3;

            output += `.${fraction.padEnd(scale, '0')}`;
        }

        output += 'S';

        return output;
    }
}
