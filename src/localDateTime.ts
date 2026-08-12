import type {Clock} from './clock';
import {DefaultClockProvider} from './defaultClockProvider';
import {Instant} from './instant';
import {LocalDate} from './localDate';
import {LocalTime} from './localTime';
import {addExact, floorDiv, floorMod, intDiv, multiplyExact, subtractExact} from './math';
import type {TimeZone} from './timeZone';
import {ZonedDateTime} from './zonedDateTime';
import {PeriodDuration} from './periodDuration';

/**
 * A date-time without a time-zone in the ISO-8601 calendar system, such as 2007-12-03T10:15:30.
 *
 * LocalDateTime is an immutable date-time object that represents a date-time,
 * often viewed as year-month-day-hour-minute-second. Time is represented to
 * nanosecond precision. For example, the value "2nd October 2007 at 13:45.30.123456789"
 * can be represented by `LocalDateTime`.
 *
 * This class does not store or represent a time-zone. Instead, it is a description
 * of the date, as used for birthdays, combined with the local time as seen on a
 * wall clock. It cannot represent an instant on the time-line without
 * additional information such as an offset or time-zone.
 */
export class LocalDateTime {
    /**
     * The local date.
     */
    private readonly date: LocalDate;

    /**
     * The local time.
     */
    private readonly time: LocalTime;

    /**
     * Initializes a local date-time from its components.
     */
    private constructor(date: LocalDate, time: LocalTime) {
        this.date = date;
        this.time = time;
    }

    /**
     * Returns the current date-time from the default or given clock in the given time-zone.
     *
     * Fractional seconds have three digits of precision due to the JavaScript date-time
     * limitations.
     *
     * @param zone The time-zone to use.
     * @param clock The clock to use. The default clock is used if one is not give.
     */
    public static nowIn(zone: TimeZone, clock: Clock = DefaultClockProvider.getClock()): LocalDateTime {
        return LocalDateTime.ofInstant(clock.getInstant(), zone);
    }

    /**
     * Returns the current date-time from the given clock in the clock's time-zone.
     *
     * Fractional seconds have three digits of precision due to the JavaScript date-time
     * limitations.
     *
     * @param clock The clock to use.
     */
    public static now(clock: Clock = DefaultClockProvider.getClock()): LocalDateTime {
        return LocalDateTime.ofInstant(clock.getInstant(), clock.getZone());
    }

    /**
     * Obtains the local date-time at the given instant in the given time-zone.
     *
     * @param instant The instant to convert.
     * @param zone    The time-zone to express the instant in.
     */
    public static ofInstant(instant: Instant, zone: TimeZone): LocalDateTime {
        const offset = zone.getRules().getOffset(instant);

        return LocalDateTime.ofEpochSecond(
            addExact(instant.getSeconds(), offset.getTotalSeconds()),
            instant.getNano(),
        );
    }

    /**
     * Obtains a local date time using seconds from the epoch and nanoseconds from the second.
     *
     * @param {number} epochSecond The number of seconds from the epoch of 1970-01-01T00:00:00Z
     * @param {number} nanoOfSecond The nanoseconds of the second, in the range 0 to 999,999,999.
     */
    public static ofEpochSecond(epochSecond: number, nanoOfSecond = 0): LocalDateTime {
        if (!Number.isSafeInteger(epochSecond) || !Number.isSafeInteger(nanoOfSecond)) {
            throw new Error('The timestamp must be a safe integer.');
        }

        const epochDay = floorDiv(epochSecond, LocalTime.SECONDS_PER_DAY);
        const secondOfDay = floorMod(epochSecond, LocalTime.SECONDS_PER_DAY);
        const date = LocalDate.ofEpochDay(epochDay);
        const time = LocalTime.ofSecondOfDay(secondOfDay, nanoOfSecond);

        return LocalDateTime.of(date, time);
    }

    /**
     * Obtains the date-time from the native date object.
     *
     * @param date The native date object.
     */
    public static fromNative(date: Date): LocalDateTime {
        return LocalDateTime.of(LocalDate.fromNative(date), LocalTime.fromNative(date));
    }

    /**
     * Creates a local date-time from its components.
     *
     * @param date The local date in ISO-8601 format.
     * @param time The local time in ISO-8601 format.
     */
    public static of(date: LocalDate, time?: LocalTime): LocalDateTime {
        return new LocalDateTime(date, time ?? LocalTime.startOfDay());
    }

    /**
     * Parses a local date-time from its ISO-8601 representation.
     *
     * @param value The local date-time in ISO-8601 format.
     *
     * @throws {Error} If the value is not a valid local date-time in ISO-8601 format.
     */
    public static parse(value: string): LocalDateTime {
        const parts = value.split('T');

        if (parts.length !== 2) {
            throw new Error(`Malformed local date-time "${value}".`);
        }

        return LocalDateTime.of(
            LocalDate.parse(parts[0]),
            LocalTime.parse(parts[1]),
        );
    }

    /**
     * Returns the local date.
     */
    public getLocalDate(): LocalDate {
        return this.date;
    }

    /**
     * Returns the local time.
     */
    public getLocalTime(): LocalTime {
        return this.time;
    }

    /**
     * Returns the day of month.
     */
    public getDay(): number {
        return this.date.getDay();
    }

    /**
     * Returns the month of year.
     */
    public getMonth(): number {
        return this.date.getMonth();
    }

    /**
     * Returns year.
     */
    public getYear(): number {
        return this.date.getYear();
    }

    /**
     * Returns the hour of day.
     */
    public getHour(): number {
        return this.time.getHour();
    }

    /**
     * Returns the minute of hour.
     */
    public getMinute(): number {
        return this.time.getMinute();
    }

    /**
     * Returns seconds of minute.
     */
    public getSecond(): number {
        return this.time.getSecond();
    }

    /**
     * Returns the nano of second.
     */
    public getNano(): number {
        return this.time.getNano();
    }

    /**
     * Adds a duration in years to this local date-time.
     *
     * @param years The number of years to add.
     *
     * @throws {Error} If the result is out of the range of supported local date-times.
     */
    public plusYears(years: number): LocalDateTime {
        return LocalDateTime.of(this.date.plusYears(years), this.time);
    }

    /**
     * Subtracts a duration in years from local date-time.
     *
     * @param years The number of years to subtract.
     *
     * @throws {Error} If the result is out of the range of supported local date-times.
     */
    public minusYears(years: number): LocalDateTime {
        return this.plusYears(-years);
    }

    /**
     * Adds a duration in months to this local date-time.
     *
     * @param months The number of months to add.
     *
     * @throws {Error} If the result is out of the range of supported local date-times.
     */
    public plusMonths(months: number): LocalDateTime {
        return LocalDateTime.of(this.date.plusMonths(months), this.time);
    }

    /**
     * Subtracts a duration in months from local date-time.
     *
     * @param months The number of months to subtract.
     *
     * @throws {Error} If the result is out of the range of supported local date-times.
     */
    public minusMonths(months: number): LocalDateTime {
        return this.plusMonths(-months);
    }

    /**
     * Adds a duration in weeks to this local date-time.
     *
     * @param weeks The number of weeks to add.
     *
     * @throws {Error} If the result is out of the range of supported local date-times.
     */
    public plusWeeks(weeks: number): LocalDateTime {
        return LocalDateTime.of(this.date.plusWeeks(weeks), this.time);
    }

    /**
     * Subtracts a duration in weeks from local date-time.
     *
     * @param weeks The number of weeks to subtract.
     *
     * @throws {Error} If the result is out of the range of supported local date-times.
     */
    public minusWeeks(weeks: number): LocalDateTime {
        return this.plusWeeks(-weeks);
    }

    /**
     * Adds a duration in days to this local date-time.
     *
     * @param days The number of days to add.
     *
     * @throws {Error} If the result is out of the range of supported local date-times.
     */
    public plusDays(days: number): LocalDateTime {
        return LocalDateTime.of(this.date.plusDays(days), this.time);
    }

    /**
     * Subtracts a duration in days from local date-time.
     *
     * @param days The number of days to subtract.
     *
     * @throws {Error} If the result is out of the range of supported local date-times.
     */
    public minusDays(days: number): LocalDateTime {
        return this.plusDays(-days);
    }

    /**
     * Adds a duration in hours to this local date-time.
     *
     * @param hours The number of hours to add.
     *
     * @throws {Error} If the result is out of the range of supported local date-times.
     */
    public plusHours(hours: number): LocalDateTime {
        if (hours === 0) {
            return this;
        }

        const extraDays = intDiv(hours, LocalTime.HOURS_PER_DAY);
        const remainder = hours % LocalTime.HOURS_PER_DAY;
        const total = (remainder * LocalTime.NANOS_PER_HOUR) + this.time.toNanoOfDay();
        const days = extraDays + floorDiv(total, LocalTime.NANOS_PER_DAY);

        return LocalDateTime.of(this.date.plusDays(days), this.time.plusHours(remainder));
    }

    /**
     * Subtracts a duration in hours from local date-time.
     *
     * @param hours The number of hours to subtract.
     *
     * @throws {Error} If the result is out of the range of supported local date-times.
     */
    public minusHours(hours: number): LocalDateTime {
        return this.plusHours(-hours);
    }

    /**
     * Adds a duration in minutes to this local date-time.
     *
     * @param minutes The number of minutes to add.
     *
     * @throws {Error} If the result is out of the range of supported local date-times.
     */
    public plusMinutes(minutes: number): LocalDateTime {
        if (minutes === 0) {
            return this;
        }

        const extraDays = intDiv(minutes, LocalTime.MINUTES_PER_DAY);
        const remainder = minutes % LocalTime.MINUTES_PER_DAY;
        const total = (remainder * LocalTime.NANOS_PER_MINUTE) + this.time.toNanoOfDay();
        const days = extraDays + floorDiv(total, LocalTime.NANOS_PER_DAY);

        return LocalDateTime.of(this.date.plusDays(days), this.time.plusMinutes(remainder));
    }

    /**
     * Subtracts a duration in minutes from local date-time.
     *
     * @param minutes The number of minutes to subtract.
     *
     * @throws {Error} If the result is out of the range of supported local date-times.
     */
    public minusMinutes(minutes: number): LocalDateTime {
        return this.plusMinutes(-minutes);
    }

    /**
     * Adds a duration in seconds to this local date-time.
     *
     * @param seconds The number of seconds to add.
     *
     * @throws {Error} If the result is out of the range of supported local date-times.
     */
    public plusSeconds(seconds: number): LocalDateTime {
        if (seconds === 0) {
            return this;
        }

        const extraDays = intDiv(seconds, LocalTime.SECONDS_PER_DAY);
        const remainder = seconds % LocalTime.SECONDS_PER_DAY;
        const total = (remainder * LocalTime.NANOS_PER_SECOND) + this.time.toNanoOfDay();
        const days = extraDays + floorDiv(total, LocalTime.NANOS_PER_DAY);

        return LocalDateTime.of(this.date.plusDays(days), this.time.plusSeconds(remainder));
    }

    /**
     * Subtracts a duration in seconds from local date-time.
     *
     * @param seconds The number of seconds to subtract.
     *
     * @throws {Error} If the result is out of the range of supported local date-times.
     */
    public minusSeconds(seconds: number): LocalDateTime {
        return this.plusSeconds(-seconds);
    }

    /**
     * Adds a duration in milliseconds to this local date-time.
     *
     * @param millis The number of milliseconds to add.
     *
     * @throws {Error} If the result is out of the range of supported local date-times.
     */
    public plusMillis(millis: number): LocalDateTime {
        if (millis === 0) {
            return this;
        }

        const extraDays = intDiv(millis, LocalTime.MILLIS_PER_DAY);
        const remainder = millis % LocalTime.MILLIS_PER_DAY;
        const total = (remainder * LocalTime.NANOS_PER_MILLI) + this.time.toNanoOfDay();
        const days = extraDays + floorDiv(total, LocalTime.NANOS_PER_DAY);

        return LocalDateTime.of(this.date.plusDays(days), this.time.plusMillis(remainder));
    }

    /**
     * Subtracts a duration in milliseconds from local date-time.
     *
     * @param millis The number of milliseconds to subtract.
     *
     * @throws {Error} If the result is out of the range of supported local date-times.
     */
    public minusMillis(millis: number): LocalDateTime {
        return this.plusMillis(-millis);
    }

    /**
     * Adds a duration in microseconds to this local date-time.
     *
     * @param micros The number of microseconds to add.
     *
     * @throws {Error} If the result is out of the range of supported local date-times.
     */
    public plusMicros(micros: number): LocalDateTime {
        if (micros === 0) {
            return this;
        }

        const extraDays = intDiv(micros, LocalTime.MICROS_PER_DAY);
        const remainder = micros % LocalTime.MICROS_PER_DAY;
        const total = (remainder * LocalTime.NANOS_PER_MICRO) + this.time.toNanoOfDay();
        const days = extraDays + floorDiv(total, LocalTime.NANOS_PER_DAY);

        return LocalDateTime.of(this.date.plusDays(days), this.time.plusMicros(remainder));
    }

    /**
     * Subtracts a duration in microseconds from local date-time.
     *
     * @param micros The number of microseconds to subtract.
     *
     * @throws {Error} If the result is out of the range of supported local date-times.
     */
    public minusMicros(micros: number): LocalDateTime {
        return this.plusMicros(-micros);
    }

    /**
     * Adds a duration in nanoseconds to this local date-time.
     *
     * @param nanos The number of nanoseconds to add.
     *
     * @throws {Error} If the result is out of the range of supported local date-times.
     */
    public plusNanos(nanos: number): LocalDateTime {
        if (nanos === 0) {
            return this;
        }

        const extraDays = intDiv(nanos, LocalTime.NANOS_PER_DAY);
        const remainder = nanos % LocalTime.NANOS_PER_DAY;
        const total = remainder + this.time.toNanoOfDay();
        const days = extraDays + floorDiv(total, LocalTime.NANOS_PER_DAY);

        return LocalDateTime.of(this.date.plusDays(days), this.time.plusNanos(remainder));
    }

    /**
     * Subtracts a duration in nanoseconds from local date-time.
     *
     * @param nanos The number of nanoseconds to subtract.
     *
     * @throws {Error} If the result is out of the range of supported local date-times.
     */
    public minusNanos(nanos: number): LocalDateTime {
        return this.plusNanos(-nanos);
    }

    /**
     * Returns a copy of this local date-time with the given local date.
     *
     * @param date The local date.
     */
    public withDate(date: LocalDate): LocalDateTime {
        if (this.date.equals(date)) {
            return this;
        }

        return LocalDateTime.of(date, this.time);
    }

    /**
     * Returns a copy of this local date-time with the given local time.
     *
     * @param time The local time.
     */
    public withTime(time: LocalTime): LocalDateTime {
        if (this.time.equals(time)) {
            return this;
        }

        return LocalDateTime.of(this.date, time);
    }

    /**
     * Returns a copy of this local date-time with the given year.
     *
     * If the day of month is invalid for the resulting year and month, it is
     * adjusted to the last valid day.
     *
     * @param year The year in the ISO-8601 calendar system.
     *
     * @throws {Error} If the year is out of range.
     */
    public withYear(year: number): LocalDateTime {
        return this.withDate(this.date.withYear(year));
    }

    /**
     * Returns a copy of this local date-time with the given month of year.
     *
     * If the day of month is invalid for the resulting year and month, it is
     * adjusted to the last valid day.
     *
     * @param month The month of year, in the range 1 to 12.
     *
     * @throws {Error} If the month is out of range.
     */
    public withMonth(month: number): LocalDateTime {
        return this.withDate(this.date.withMonth(month));
    }

    /**
     * Returns a copy of this local date-time with the given day of month.
     *
     * @param day The day of month, in the range 1 to 31.
     *
     * @throws {Error} If the day is invalid for the year and month of this date-time.
     */
    public withDay(day: number): LocalDateTime {
        return this.withDate(this.date.withDay(day));
    }

    /**
     * Returns a copy of this local date-time with the given hour of day.
     *
     * @param hour The hour of the day, in the range 0 to 23.
     *
     * @throws {Error} If the hour is out of range.
     */
    public withHour(hour: number): LocalDateTime {
        return this.withTime(this.time.withHour(hour));
    }

    /**
     * Returns a copy of this local date-time with the given minute of hour.
     *
     * @param minute The minute of the hour, in the range 0 to 59.
     *
     * @throws {Error} If the minute is out of range.
     */
    public withMinute(minute: number): LocalDateTime {
        return this.withTime(this.time.withMinute(minute));
    }

    /**
     * Returns a copy of this local date-time with the given second of minute.
     *
     * @param second The second of the minute, in the range 0 to 59.
     *
     * @throws {Error} If the second is out of range.
     */
    public withSecond(second: number): LocalDateTime {
        return this.withTime(this.time.withSecond(second));
    }

    /**
     * Returns a copy of this local date-time with the given millisecond of second.
     *
     * The remaining sub-millisecond part of the second is discarded.
     *
     * @param millis The millisecond of the second, in the range 0 to 999.
     *
     * @throws {Error} If the millisecond is out of range.
     */
    public withMilli(millis: number): LocalDateTime {
        return this.withTime(this.time.withMilli(millis));
    }

    /**
     * Returns a copy of this local date-time with the given microsecond of second.
     *
     * The remaining sub-microsecond part of the second is discarded.
     *
     * @param micros The microsecond of the second, in the range 0 to 999,999.
     *
     * @throws {Error} If the microsecond is out of range.
     */
    public withMicro(micros: number): LocalDateTime {
        return this.withTime(this.time.withMicro(micros));
    }

    /**
     * Returns a copy of this local date-time with the given nanosecond of second.
     *
     * @param nanos The nanosecond of the second, in the range 0 to 999,999,999.
     *
     * @throws {Error} If the nanosecond is out of range.
     */
    public withNano(nanos: number): LocalDateTime {
        return this.withTime(this.time.withNano(nanos));
    }

    /**
     * Add a period-duration to this local date-time.
     *
     * @param periodDuration The period-duration to add.
     */
    public plus(periodDuration: PeriodDuration): LocalDateTime {
        const period = periodDuration.getPeriod();
        const duration = periodDuration.getDuration();

        return this.plusMonths(period.toMonths())
            .plusDays(period.toDaysPart())
            .plusSeconds(duration.getSeconds())
            .plusNanos(duration.getNanos());
    }

    /**
     * Subtract a period-duration from this local date-time.
     *
     * @param periodDuration The period-duration to subtract.
     */
    public minus(periodDuration: PeriodDuration): LocalDateTime {
        const period = periodDuration.getPeriod();
        const duration = periodDuration.getDuration();

        return this.minusMonths(period.toMonths())
            .minusDays(period.toDaysPart())
            .minusSeconds(duration.getSeconds())
            .minusNanos(duration.getNanos());
    }

    /**
     * Returns the period between this date and the given date.
     *
     * @param dateTime The date to compare.
     */
    public until(dateTime: LocalDateTime): PeriodDuration {
        if (this.equals(dateTime)) {
            return PeriodDuration.zero();
        }

        let end = dateTime;
        let duration = this.time.until(dateTime.time);

        if (this.time.isBefore(dateTime.time) && this.isAfterOrEqual(dateTime)) {
            end = end.plusDays(1);
            duration = duration.minusDays(1);
        } else if (this.time.isAfter(dateTime.time) && this.isBeforeOrEqual(dateTime)) {
            end = end.minusDays(1);
            duration = duration.plusDays(1);
        }

        const period = this.date.until(end.date);

        return PeriodDuration.of(period, duration);
    }

    /**
     * Checks whether this local date-time is equal to the given one.
     *
     * @param other The other local date-time.
     */
    public equals(other: LocalDateTime): boolean {
        if (this === other) {
            return true;
        }

        return this.date.equals(other.date) && this.time.equals(other.time);
    }

    /**
     * Checks whether this date time comes after another in the local time-line.
     *
     * @param date The date to compare.
     */
    public isAfter(date: LocalDateTime): boolean {
        return this.compare(date) > 0;
    }

    /**
     * Checks whether this date time comes after or is equal to another in the local time-line.
     *
     * @param date The date to compare.
     */
    public isAfterOrEqual(date: LocalDateTime): boolean {
        return this.compare(date) >= 0;
    }

    /**
     * Checks whether this date time comes before another in the local time-line.
     *
     * @param date The date to compare.
     */
    public isBefore(date: LocalDateTime): boolean {
        return this.compare(date) < 0;
    }

    /**
     * Checks whether this date time comes before or is equal to another in the local time-line.
     *
     * @param date The date to compare.
     */
    public isBeforeOrEqual(date: LocalDateTime): boolean {
        return this.compare(date) <= 0;
    }

    /**
     * Checks whether the given string is a valid ISO-8601 date time without a timezone.
     *
     * In addition to checking that the string is well-formed,
     * this method also validates that the date time is valid.
     *
     * For example, this method returns false for date times
     * such as February 29 in a non-leap year.
     *
     * See the {@link LocalDateTime#parse|parse} method for more information
     * about the expected format.
     *
     * @param value The date time string to validate.
     * @return `true` if the date-time is well-formed and valid, `false` otherwise.
     */
    public static isValid(value: string): boolean {
        try {
            LocalDateTime.parse(value);
        } catch {
            return false;
        }

        return true;
    }

    /**
     * Compares this date time to another for order.
     *
     * @param dateTime The date time to compare.
     *
     * @returns A negative, zero or positive number if this date time is less than, equal to or
     *          greater than the other date, respectively.
     */
    public compare(dateTime: LocalDateTime): number {
        const dateComparison = this.date.compare(dateTime.date);

        if (dateComparison !== 0) {
            return dateComparison;
        }

        return this.time.compare(dateTime.time);
    }

    /**
     * Converts this local date-time to point in the UTC time-line.
     *
     * @param zone The time-zone.
     *
     * @returns The instant in the UTC time-line.
     */
    public toInstant(zone: TimeZone): Instant {
        // For local date-times that fall in an overlap, the earlier offset is used,
        // typically "summer" time. For those that fall in a gap, the offset after the
        // transition is used, which shifts the result forwards by the length of the gap.
        const offset = zone.getRules().resolveOffset(this);

        return Instant.ofEpochSecond(
            subtractExact(this.toEpochSecond(), offset.getTotalSeconds()),
            this.time.getNano(),
        );
    }

    /**
     * Returns this local date-time in the given time-zone.
     *
     * When this local date-time is ambiguous or does not exist in the time-zone,
     * see {@link ZonedDateTime.of} for how it is resolved.
     *
     * @param zone The time-zone.
     */
    public atZone(zone: TimeZone): ZonedDateTime {
        return ZonedDateTime.of(this, zone);
    }

    /**
     * Converts this local date-time to a number of seconds, read as if it were in UTC.
     */
    private toEpochSecond(): number {
        return addExact(
            multiplyExact(this.date.toEpochDay(), LocalTime.SECONDS_PER_DAY),
            this.time.toSecondOfDay(),
        );
    }

    /**
     * Returns the ISO-8601 string representation of this local date-time.
     */
    public toString(): string {
        return `${this.date.toString()}T${this.time.toString()}`;
    }

    /**
     * Returns the JSON representation of this local date-time.
     */
    public toJSON(): string {
        return this.toString();
    }
}
