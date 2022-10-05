import {zonedTimeToUtc} from 'date-fns-tz';
import {LocalDate} from './localDate';
import {LocalTime} from './localTime';
import {TimeZone} from './timeZone';
import {Instant} from './instant';
import {intDiv} from './math';

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
     * Returns the current date-time from the system clock in the specified time-zone.
     *
     * Fractional seconds have three digits of precision due to the JavaScript date-time
     * limitations.
     *
     * @param zone The time-zone to use.
     */
    public static now(zone: TimeZone): LocalDateTime {
        const now = new Date().toLocaleString('en-US', {
            timeZone: zone.getId(),
            calendar: 'iso8601',
            hour12: false,
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
        const matches = now.match(/(?<month>\d{2})\/(?<day>\d{2})\/(?<year>\d{4}), (?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2})\.(?<fraction>\d{3})/);
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
            throw new Error('Invalid date time format.');
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
        const zonedDateTime = zonedTimeToUtc(
            new Date(
                this.date.getYear(),
                this.date.getMonth() - 1,
                this.date.getDay(),
                this.time.getHour(),
                this.time.getMinute(),
                this.time.getSecond(),
                // Assumes that the time-zone offset is at least 1 second.
                // Historically, the tz database has never had a time-zone
                // offset less than 1 minute, so assuming a second precision
                // should be safe.
                0,
            ),
            zone.getId(),
        );

        const epochSeconds = intDiv(zonedDateTime.getTime(), LocalTime.MILLIS_PER_SECOND);
        const nanoAdjustment = this.time.getNano();

        return Instant.ofEpochSecond(epochSeconds, nanoAdjustment);
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
