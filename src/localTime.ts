/**
 * A local time.
 */
export class LocalTime {
    /**
     * A regular expression that matches ISO-8601 time strings without a time zone.
     */
    // eslint-disable-next-line max-len -- Regex literals can't be split
    private static PATTERN = /^(?<hour>\d{2}):(?<minute>\d{2})(?::(?<second>\d{2})(?:.(?<fraction>\d{1,9}))?)?$/;

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
