import {LocalDate} from './localDate';
import {LocalTime} from './localTime';

/**
 * A local date-time.
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
