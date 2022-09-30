/**
 * A local date in the ISO 8601 calendar system, such as 2007-12-03.
 */
export class LocalDate {
    /**
     * A regular expression that matches ISO-8601 date strings.
     */
    private static PATTERN = /^(?<year>[+-]?\d{4,19})-(?<month>\d{2})-(?<day>\d{2})$/;

    /**
     * The year.
     */
    private readonly year: number;

    /**
     * The month of year.
     */
    private readonly month: number;

    /**
     * The day of month.
     */
    private readonly day: number;

    /**
     * Instantiates a local date from its components.
     */
    private constructor(year: number, month: number, day: number) {
        this.year = year;
        this.month = month;
        this.day = day;
    }

    /**
     * Creates a local date from its components.
     *
     * @param year  The year in the ISO-8601 calendar system.
     * @param month The month of year, in the range 1 to 12.
     * @param day   The day of month, in the range 1 to 31.
     */
    public static of(year: number, month: number, day: number): LocalDate {
        if (!Number.isSafeInteger(year)) {
            throw new Error('Year must be a safe integer.');
        }

        if (!Number.isInteger(month) || month < 1 || month > 12) {
            throw new Error('Month must be an integer between 1 and 12.');
        }

        const maxDay = LocalDate.getMonthLength(month, LocalDate.isLeapYear(year));

        if (!Number.isInteger(day) || day < 1 || day > maxDay) {
            throw new Error(`Day must be an integer between 1 and ${maxDay}.`);
        }

        return new LocalDate(year, month, day);
    }

    public static parse(value: string): LocalDate {
        const {groups} = value.match(LocalDate.PATTERN) ?? {};

        if (groups === undefined) {
            throw new Error(`Invalid ISO-8601 date string: ${value}`);
        }

        const year = Number.parseInt(groups.year, 10);
        const month = Number.parseInt(groups.month, 10);
        const day = Number.parseInt(groups.day, 10);

        return LocalDate.of(year, month, day);
    }

    /**
     * Returns the year in the ISO-8601 calendar system.
     */
    public getYear(): number {
        return this.year;
    }

    /**
     * Returns the month of year.
     */
    public getMonth(): number {
        return this.month;
    }

    /**
     * Returns the day of month.
     */
    public getDay(): number {
        return this.day;
    }

    /**
     * Checks whether this date is equal to the given date.
     *
     * @param other The other date.
     */
    public equals(other: LocalDate): boolean {
        if (this === other) {
            return true;
        }

        return this.year === other.year && this.month === other.month && this.day === other.day;
    }

    /**
     * Returns the ISO-8601 string representation of this date.
     */
    public toString(): string {
        const month = `${this.month}`.padStart(2, '0');
        const day = `${this.day}`.padStart(2, '0');

        return `${this.year}-${month}-${day}`;
    }

    /**
     * Checks if the given year is a leap year.
     *
     * @param year The year in the ISO-8601 calendar system.
     */
    private static isLeapYear(year: number): boolean {
        return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    }

    /**
     * Gets the length of the given month in the given year.
     *
     * @param dayOfMonth The month in the ISO-8601 calendar system.
     * @param leapYear   Whether the year is a leap year.
     */
    private static getMonthLength(dayOfMonth: number, leapYear: boolean): number {
        switch (dayOfMonth) {
            case 2:
                return leapYear ? 29 : 28;
            case 4:
            case 6:
            case 9:
            case 11:
                return 30;

            default:
                return 31;
        }
    }

    /**
     * Returns the JSON representation of this local date.
     */
    public toJSON(): string {
        return this.toString();
    }
}
