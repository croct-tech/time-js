import {Clock} from './clock';
import {DefaultClockProvider} from './defaultClockProvider';
import {Instant} from './instant';
import {LocalDate} from './localDate';
import {LocalTime} from './localTime';
import {addExact, floorDiv, floorMod, intDiv, multiplyExact, subtractExact} from './math';
import {TimeZone} from './timeZone';

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

    public static ofInstant(instant: Instant, zone: TimeZone): LocalDateTime {
        return LocalDateTime.fromZonedDate(instant.toDate(), zone);
    }

    private static fromZonedDate(date: Date, zone: TimeZone): LocalDateTime {
        const localDateTime = date.toLocaleString('en-US', {
            timeZone: zone.getId(),
            calendar: 'iso8601',
            hourCycle: 'h23',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- Missing type definition.
            // @ts-ignore
            fractionalSecondDigits: 3,
        });

        // eslint-disable-next-line max-len -- Regex literal cannot be split.
        const matches = localDateTime.match(/(?<month>\d{2})\/(?<day>\d{2})\/(?<year>\d{1,4}), (?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2})\.(?<fraction>\d{3})/);
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain -- Safe assertion.
        const groups = matches?.groups!;

        return LocalDateTime.of(
            LocalDate.of(
                Number.parseInt(groups.year, 10),
                Number.parseInt(groups.month, 10),
                Number.parseInt(groups.day, 10),
            ),
            LocalTime.of(
                Number.parseInt(groups.hour, 10),
                Number.parseInt(groups.minute, 10),
                Number.parseInt(groups.second, 10),
                Number.parseInt(groups.fraction.padEnd(9, '0'), 10),
            ),
        );
    }

    /**
     * Obtains a local date time using seconds from the epoch and nanoseconds from the second.
     *
     * @param {number} epochSecond The number of seconds from the epoch of 1970-01-01T00:00:00Z
     * @param {number} nanoOfSecond The nanoseconds of the second, in the range 0 to 999,999,999.
     */
    public static ofEpochSecond(epochSecond: number, nanoOfSecond: number): LocalDateTime {
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
     * In addition to checking that the string is well-formed, this method also validates that the date time is valid.
     *
     * For example, this method returns false for date times such as February 29 in a non-leap year.
     *
     * See the {@link LocalDateTime#parse|parse} method for more information about the expected format.
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
        // Since JavaScript doesn't expose an API to get the time-zone offset
        // for a given local date-time. The workaround is to convert the local
        // date-time to a point in the UTC time-line and iteravely add/subtract
        // the time-zone offset until finding the correct offset.
        //
        // This is not the most efficient way to do this, but it's
        // the only way to do it in JavaScript without using a third-party
        // library.

        const epochDay = this.date.toEpochDay();
        const seconds = multiplyExact(epochDay, LocalTime.SECONDS_PER_DAY);

        // Assumes the target timezone is in a range of -12 to +14 hours.
        // While most time zones differ from Coordinated Universal Time (UTC) by a number of full
        // hours, some time zones have 30-minute or 45-minute offsets.
        const startFromEpoch = subtractExact(
            addExact(seconds, this.time.toSecondOfDay()),
            14 * LocalTime.SECONDS_PER_HOUR,
        );

        const endFromEpoch = addExact(
            startFromEpoch,
            26 * LocalTime.SECONDS_PER_HOUR,
        );

        const target = LocalDateTime.of(
            this.date,
            LocalTime.of(
                this.time.getHour(),
                this.time.getMinute(),
                this.time.getSecond(),
            ),
        );

        const zonedDateTime = new Date(startFromEpoch * LocalTime.MILLIS_PER_SECOND);
        let localDateTime = LocalDateTime.fromZonedDate(zonedDateTime, zone);

        // Determine the time-zone offset multiple. As of 2023, most time zones
        // have 1h offsets, but some time zones have 30m or 45m offsets.
        // There are cases where the multiple changes during transitions.
        // Lord Howe Island uses an offset of UTC + 11 during the summer. In the winter,
        // after Daylight Saving is over they set the clocks back a half hour (UTC + 10:30).
        const step = Math.min(
            LocalDateTime.getTimeZoneMultiple(zonedDateTime, zone.getId()),
            LocalDateTime.getTimeZoneMultiple(
                new Date(endFromEpoch * LocalTime.MILLIS_PER_SECOND),
                zone.getId(),
            ),
        );

        // Worst case scenario, we have to loop 26 hours * 4 15-minute increments,
        // which is 104 iterations.
        //
        // Benchmarks on a 2020 MacBook Pro (Apple M1 chip 8-core CPU):
        // For Pacific/Niue (UTC-11), the loop runs 25 times and takes on average 1.7ms
        // For America/Sao_Paulo (UTC-3), the loop runs 17 times and takes on average 1.2ms
        while (!localDateTime.equals(target)) {
            zonedDateTime.setTime(addExact(zonedDateTime.getTime(), step * LocalTime.MILLIS_PER_SECOND));
            localDateTime = LocalDateTime.fromZonedDate(zonedDateTime, zone);

            if (localDateTime.isAfter(target)) {
                // There is a gap, the local date-time doesn't exist in the target time-zone.
                // For gaps, the general strategy is that if the local date-time falls in the middle
                // of a gap, then the resulting zoned date-time will have a local date-time shifted
                // forwards by the length of the gap, resulting in a date-time in the later offset,
                // typically "summer" time.

                break;
            }

            // For overlaps, the general strategy is that if the local date-time falls in the
            // middle of an Overlap, then the previous offset will be retained. If there is no
            // previous offset, or the previous offset is invalid, then the earlier offset is used,
            // typically "summer" time.
            // Since the time is shifted forwards, the first local date-time that is equal to
            // the target is the one that meets the criteria.
        }

        const epochSeconds = intDiv(zonedDateTime.getTime(), LocalTime.MILLIS_PER_SECOND);
        const nanoAdjustment = this.time.getNano();

        return Instant.ofEpochSecond(epochSeconds, nanoAdjustment);
    }

    /**
     * Returns the time-zone offset multiple.
     *
     * As of 2023, most time zones have 1h offsets, but some time zones have 30m or 45m offsets.
     * This function returns either 1h, 30m, or 15m, whichever is the smallest multiple of the
     * time-zone offset.
     *
     * @param date     The point in time to check the offset.
     * @param timezone The time zone in which to check the offset.
     *
     * @returns The time-zone offset multiple in seconds.
     */
    private static getTimeZoneMultiple(date: Date, timezone: string): number {
        const offset = Math.abs(LocalDateTime.getTimeZoneOffset(date, timezone));

        if (offset % LocalTime.SECONDS_PER_HOUR === 0) {
            return LocalTime.SECONDS_PER_HOUR;
        }

        if (offset % (LocalTime.SECONDS_PER_HOUR / 2) === 0) {
            return LocalTime.SECONDS_PER_HOUR / 2;
        }

        return LocalTime.SECONDS_PER_HOUR / 4;
    }

    /**
     * Finds the time-zone offset in seconds for the given date at the given time-zone.
     *
     * @param date The point in time to check the offset.
     * @param timezone The time zone in which to check the offset.
     *
     * @returns The time-zone offset in seconds.
     */
    private static getTimeZoneOffset(date: Date, timezone: string): number {
        const timeZoneName = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            calendar: 'iso8601',
            timeZoneName: 'short',
        }).format(date);

        const matches = timeZoneName.match(/([+-]\d+)(?::(\d+))?/);
        const hours = Number.parseInt(matches?.[1] ?? '0', 10);
        const minutes = Number.parseInt(matches?.[2] ?? '0', 10);

        return hours * LocalTime.SECONDS_PER_HOUR
            + minutes * LocalTime.SECONDS_PER_MINUTE;
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
