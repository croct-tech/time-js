/**
 * A time without a time-zone in the ISO-8601 calendar system, such as 10:15:30.
 *
 * `LocalTime` is an immutable date-time object that represents a time,
 * often presented as hour-minute-second. Time is represented to nanosecond precision.
 * For example, the value "13:45.30.123456789" can be stored in a `LocalTime`.
 *
 * This class does not store or represent a date or time-zone. Instead, it is a description
 * of the local time as seen on a wall clock. It cannot represent an instant on the
 * time-line without additional information such as an offset or time-zone.
 */
export class LocalTime {
    /**
     * A regular expression that matches ISO-8601 time strings without a time zone.
     */
    // eslint-disable-next-line max-len -- Regex literals can't be split
    private static PATTERN = /^(?<hour>\d{2}):(?<minute>\d{2})(?::(?<second>\d{2})(?:.(?<fraction>\d{1,9}))?)?$/;

    /**
     * Hours per day.
     */
    public static HOURS_PER_DAY = 24;

    /**
     * Minutes per day.
     */
    public static MINUTES_PER_DAY = 1_440;

    /**
     * Minutes per hour.
     */
    public static MINUTES_PER_HOUR = 60;

    /**
     * Seconds per day.
     */
    public static SECONDS_PER_DAY = 86_400;

    /**
     * Seconds per hour.
     */
    public static SECONDS_PER_HOUR = 3_600;

    /**
     * Seconds per minute.
     */
    public static SECONDS_PER_MINUTE = 60;

    /**
     * Microseconds per day.
     */
    public static MICROS_PER_DAY = 86_400_000_000;

    /**
     * Microseconds per second.
     */
    public static MICROS_PER_SECOND = 1_000_000;

    /**
     * Milliseconds per day.
     */
    public static MILLIS_PER_DAY = 86_400_000;

    /**
     * Milliseconds per second.
     */
    public static MILLIS_PER_SECOND = 1_000;

    /**
     * Nanoseconds per day.
     */
    public static NANOS_PER_DAY = 86_400_000_000_000;

    /**
     * Nanoseconds per hour.
     */
    public static NANOS_PER_HOUR = 3_600_000_000_000;

    /**
     * Nanoseconds per minute.
     */
    public static NANOS_PER_MINUTE = 60_000_000_000;

    /**
     * Nanoseconds per second.
     */
    public static NANOS_PER_SECOND = 1_000_000_000;

    /**
     * Nanoseconds per millisecond.
     */
    public static NANOS_PER_MILLI = 1_000_000;

    /**
     * Nanoseconds per microsecond.
     */
    public static NANOS_PER_MICRO = 1_000;

    /**
     * The hour.
     */
    private readonly hour: number;

    /**
     * The minute.
     */
    private readonly minute: number;

    /**
     * The second.
     */
    private readonly second: number;

    /**
     * The nanoseconds in a second.
     */
    private readonly nanos: number;

    /**
     * Initializes a local time from its components.
     */
    private constructor(hour: number, minute: number, second: number, nanos: number) {
        this.hour = hour;
        this.minute = minute;
        this.second = second;
        this.nanos = nanos;
    }

    /**
     * Creates a local time from its components.
     *
     * @param hour   The hour of the day, in the range 0 to 23.
     * @param minute The minute of the hour, in the range 0 to 59.
     * @param second The second of the minute, in the range 0 to 59.
     * @param nanos  The nanosecond of the second, in the range 0 to 999,999,999.
     */
    public static of(hour: number, minute = 0, second = 0, nanos = 0): LocalTime {
        if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
            throw new Error('Hour must be an integer between 0 and 23.');
        }

        if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
            throw new Error('Minute must be an integer between 0 and 59.');
        }

        if (!Number.isInteger(second) || second < 0 || second > 59) {
            throw new Error('Second must be an integer between 0 and 59.');
        }

        if (!Number.isInteger(nanos) || nanos < 0 || nanos > 999_999_999) {
            throw new Error('Nanosecond of second must be an integer between 0 and 999999999.');
        }

        return new LocalTime(hour, minute, second, nanos);
    }

    /**
     * Obtains the local time from a native date object.
     *
     * @param date The native date object.
     */
    public static fromDate(date: Date): LocalTime {
        return new LocalTime(
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds() * LocalTime.NANOS_PER_MILLI,
        );
    }

    /**
     * Returns a local time at the start of the day.
     */
    public static startOfDay(): LocalTime {
        return new LocalTime(0, 0, 0, 0);
    }

    /**
     * Returns a local time at the end of the day.
     */
    public static endOfDay(): LocalTime {
        return new LocalTime(23, 59, 59, 999_999_999);
    }

    /**
     * Parses a local time from an ISO-8601 time string without a timezone.
     *
     * @param value The ISO-8601 time string.
     */
    public static parse(value: string): LocalTime {
        const {groups} = value.match(LocalTime.PATTERN) ?? {};

        if (groups === undefined) {
            throw new Error(`Invalid ISO-8601 time string: ${value}`);
        }

        const hour = Number.parseInt(groups.hour, 10);
        const minute = Number.parseInt(groups.minute, 10);
        const second = Number.parseInt(groups.second ?? '0', 10);
        const nanos = Number.parseInt(groups.fraction?.padEnd(9, '0') ?? '0', 10);

        return new LocalTime(hour, minute, second, nanos);
    }

    /**
     * Returns the hour of the day, in the range 0 to 23.
     */
    public getHour(): number {
        return this.hour;
    }

    /**
     * Returns the minute of the hour, in the range 0 to 59.
     */
    public getMinute(): number {
        return this.minute;
    }

    /**
     * Returns the second of the minute, in the range 0 to 59.
     */
    public getSecond(): number {
        return this.second;
    }

    /**
     * Returns the nanosecond of the second, in the range 0 to 999,999,999.
     */
    public getNano(): number {
        return this.nanos;
    }

    /**
     * Checks if this local time is equal to another.
     *
     * @param other The other local time.
     */
    public equals(other: LocalTime): boolean {
        if (this === other) {
            return true;
        }

        return this.hour === other.hour
            && this.minute === other.minute
            && this.second === other.second
            && this.nanos === other.nanos;
    }

    /**
     * Checks whether this time comes after another in the local time-line.
     *
     * @param time The time to compare.
     */
    public isAfter(time: LocalTime): boolean {
        return this.compare(time) > 0;
    }

    /**
     * Checks whether this time comes after or is equal to another in the local time-line.
     *
     * @param time The time to compare.
     */
    public isAfterOrEqual(time: LocalTime): boolean {
        return this.compare(time) >= 0;
    }

    /**
     * Checks whether this time comes before another in the local time-line.
     *
     * @param time The time to compare.
     */
    public isBefore(time: LocalTime): boolean {
        return this.compare(time) < 0;
    }

    /**
     * Checks whether this time comes before or is equal to another in the local time-line.
     *
     * @param time The time to compare.
     */
    public isBeforeOrEqual(time: LocalTime): boolean {
        return this.compare(time) <= 0;
    }

    /**
     * Compares this time to another for order.
     *
     * @param time The time to compare.
     *
     * @returns A negative, zero or positive number if this time is less than, equal to or
     *          greater than the other time, respectively.
     */
    public compare(time: LocalTime): number {
        if (this.hour !== time.hour) {
            return this.hour - time.hour;
        }

        if (this.minute !== time.minute) {
            return this.minute - time.minute;
        }

        if (this.second !== time.second) {
            return this.second - time.second;
        }

        return this.nanos - time.nanos;
    }

    /**
     * Returns the ISO-8601 time representation of this local time.
     */
    public toString(): string {
        const hour = `${this.hour}`.padStart(2, '0');
        const minute = `${this.minute}`.padStart(2, '0');

        let string = `${hour}:${minute}`;

        if (this.second === 0 && this.nanos === 0) {
            return string;
        }

        const second = `${this.second}`.padStart(2, '0');

        string += `:${second}`;

        if (this.nanos > 0) {
            const fraction = `${this.nanos}`.padStart(9, '0').replace(/0+$/, '');
            const scale = Math.floor((fraction.length + 2) / 3) * 3;

            string += `.${fraction.padEnd(scale, '0')}`;
        }

        return string;
    }

    /**
     * Returns the JSON representation of this local time.
     */
    public toJSON(): string {
        return this.toString();
    }
}
