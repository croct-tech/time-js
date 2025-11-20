import {addExact, intDiv, multiplyExact, subtractExact} from './math';
import {LocalDate} from './localDate';

/**
 * A date-based amount of time in the ISO-8601 calendar system,
 * such as '2 years, 3 months and 4 days'.
 *
 * This class models a quantity or amount of time in terms of years,
 * months and days. A period is a directed distance between two dates
 * in calendar.
 */
export class Period {
    /**
     * The number of years.
     */
    private readonly years: number;

    /**
     * The number of months.
     */
    private readonly months: number;

    /**
     * The number of days.
     */
    private readonly days: number;

    // eslint-disable-next-line max-len -- Regex literal cannot be split.
    private static PATTERN = /^(?<sign>[-+]?)P(?:(?<year>[-+]?[0-9]+)Y)?(?:(?<month>[-+]?[0-9]+)M)?(?:(?<week>[-+]?[0-9]+)W)?(?:(?<day>[-+]?[0-9]+)D)?$/i;

    /**
     * Creates an instance of Period.
     */
    private constructor(years: number, months: number, days: number) {
        this.years = years;
        this.months = months;
        this.days = days;
    }

    /**
     * Obtains a Period amounts of years, months and days.
     *
     * @param years - The amount of years
     * @param months - The amount of months
     * @param days - The amount of days
     */
    public static of(years: number, months: number, days: number): Period {
        if (years === 0 && months === 0 && days === 0) {
            return Period.zero();
        }

        return new Period(years, months, days);
    }

    /**
     * Obtains a Period representing a zero length of time.
     */
    public static zero(): Period {
        return new Period(0, 0, 0);
    }

    /**
     * Obtains a Period from an amount of years.
     *
     * @param years - The number of years
     */
    public static ofYears(years: number): Period {
        return Period.of(years, 0, 0);
    }

    /**
     * Obtains a Period from an amount of months.
     *
     * @param months - The number of months
     */
    public static ofMonths(months: number): Period {
        return Period.of(0, months, 0);
    }

    /**
     * Obtains a Period from an amount of weeks.
     *
     * @param weeks - The number of weeks
     */
    public static ofWeeks(weeks: number): Period {
        return Period.of(0, 0, multiplyExact(weeks, 7));
    }

    /**
     * Obtains a Period from an amount of days.
     *
     * @param days - The number of days
     */
    public static ofDays(days: number): Period {
        return Period.of(0, 0, days);
    }

    /**
     * Obtains a Period between two dates.
     *
     * @param start - The start date
     * @param end - The end date
     */
    public static between(start: LocalDate, end: LocalDate): Period {
        return start.periodUntil(end);
    }

    /**
     * Parses a period from an ISO-8601 based string. Such as 'P1Y2M3W4D'.
     *
     * @param value The string to parse.
     */
    public static parse(value: string): Period {
        const {groups} = value.match(Period.PATTERN) ?? {};

        if (groups === undefined) {
            throw new Error(`Unrecognized ISO-8601 period string "${value}".`);
        }

        const sign = groups.sign === '-' ? -1 : 1;

        const isYearUndefined = groups.year === undefined;
        const isMonthUndefined = groups.month === undefined;
        const isWeekUndefined = groups.week === undefined;
        const isDayUndefined = groups.day === undefined;

        if (isYearUndefined && isMonthUndefined && isWeekUndefined && isDayUndefined) {
            throw new Error(`Unrecognized ISO-8601 period string "${value}".`);
        }

        const years = Number.parseInt(groups.year ?? '0', 10);
        const months = Number.parseInt(groups.month ?? '0', 10);
        const weeks = Number.parseInt(groups.week ?? '0', 10);
        const days = Number.parseInt(groups.day ?? '0', 10);
        const totalDays = addExact(days, multiplyExact(weeks, 7));

        return Period.of(sign * years, sign * months, sign * totalDays);
    }

    /**
     * Checks if this period is zero.
     */
    public isZero(): boolean {
        return this.years === 0 && this.months === 0 && this.days === 0;
    }

    /**
     * Checks if any of the fields of this period is negative.
     */
    public isNegative(): boolean {
        return this.years < 0 || this.months < 0 || this.days < 0;
    }

    /**
     * Gets the amount of years of this period.
     */
    public getYears(): number {
        return this.years;
    }

    /**
     * Gets the amount of months of this period.
     */
    public getMonths(): number {
        return this.months;
    }

    /**
     * Gets the amount of days of this period.
     */
    public getDays(): number {
        return this.days;
    }

    /**
     * Checks if this period is equal to another period.
     *
     * @param other - The other period
     */
    public equals(other: unknown): boolean {
        if (this === other) {
            return true;
        }

        return other instanceof Period
            && this.years === other.years
            && this.months === other.months
            && this.days === other.days;
    }

    /**
     * Returns a copy of this period with the specified amount of years.
     *
     * @param years - The years to represent
     */
    public withYears(years: number): Period {
        if (years === this.years) {
            return this;
        }

        return Period.of(years, this.months, this.days);
    }

    /**
     * Returns a copy of this period with the specified amount of months.
     *
     * @param months - The months to represent
     */
    public withMonths(months: number): Period {
        if (months === this.months) {
            return this;
        }

        return Period.of(this.years, months, this.days);
    }

    /**
     * Returns a copy of this period with the specified amount of days.
     *
     * @param days - The days to represent
     */
    public withDays(days: number): Period {
        if (days === this.days) {
            return this;
        }

        return Period.of(this.years, this.months, days);
    }

    /**
     * Returns a copy of this period with the specified period added.
     *
     * @param period - The period to add
     */
    public plusPeriod(period: Period): Period {
        const years = addExact(this.years, period.years);
        const months = addExact(this.months, period.months);
        const days = addExact(this.days, period.days);

        return Period.of(years, months, days);
    }

    /**
     * Returns a copy of this period with the specified period subtracted.
     *
     * @param period - The period to subtract
     */
    public minusPeriod(period: Period): Period {
        const years = subtractExact(this.years, period.years);
        const months = subtractExact(this.months, period.months);
        const days = subtractExact(this.days, period.days);

        return Period.of(years, months, days);
    }

    /**
     * Returns a copy of this period with the specified amount of years added.
     *
     * @param years - The years to add
     */
    public plusYears(years: number): Period {
        if (years === 0) {
            return this;
        }

        const newYear = addExact(this.years, years);

        return Period.of(newYear, this.months, this.days);
    }

    /**
     * Returns a copy of this period with the specified amount of years
     * subtracted.
     *
     * @param years - The years to subtract
     */
    public minusYears(years: number): Period {
        if (years === 0) {
            return this;
        }

        const newYears = subtractExact(this.years, years);

        return Period.of(newYears, this.months, this.days);
    }

    /**
     * Returns a copy of this period with the specified amount of months added.
     *
     * @param months - The months to add
     */
    public plusMonths(months: number): Period {
        if (months === 0) {
            return this;
        }

        const newMonth = addExact(this.months, months);

        return Period.of(this.years, newMonth, this.days);
    }

    /**
     * Returns a copy of this period with the specified amount of months
     * subtracted.
     *
     * @param months - The months to subtract
     */
    public minusMonths(months: number): Period {
        if (months === 0) {
            return this;
        }

        const newMonth = subtractExact(this.months, months);

        return Period.of(this.years, newMonth, this.days);
    }

    /**
     * Returns a copy of this period with the specified amount of days added.
     *
     * @param days - The days to add
     */
    public plusDays(days: number): Period {
        if (days === 0) {
            return this;
        }

        const newDay = addExact(this.days, days);

        return Period.of(this.years, this.months, newDay);
    }

    /**
     * Returns a copy of this period with the specified amount of days
     * subtracted.
     *
     * @param days - The days to subtract
     */
    public minusDays(days: number): Period {
        if (days === 0) {
            return this;
        }

        const newDay = subtractExact(this.days, days);

        return Period.of(this.years, this.months, newDay);
    }

    /**
     * Returns a copy of this period with the specified amount of weeks added.
     *
     * @param weeks - The weeks to add
     */
    public plusWeeks(weeks: number): Period {
        if (weeks === 0) {
            return this;
        }

        return this.plusDays(multiplyExact(weeks, 7));
    }

    /**
     * Returns a copy of this period with the specified amount of weeks
     * subtracted.
     *
     * @param weeks - The weeks to subtract
     */
    public minusWeeks(weeks: number): Period {
        if (weeks === 0) {
            return this;
        }

        return this.minusDays(multiplyExact(weeks, 7));
    }

    /**
     * Returns a copy of this period with each field multiplied by the
     * specified scalar.
     *
     * @param scalar - The scalar to multiply by
     */
    public multipliedBy(scalar: number): Period {
        if (scalar === 1 || this.isZero()) {
            return this;
        }

        if (scalar === 0) {
            return Period.zero();
        }

        const years = multiplyExact(this.years, scalar);
        const months = multiplyExact(this.months, scalar);
        const days = multiplyExact(this.days, scalar);

        return Period.of(years, months, days);
    }

    /**
     * Returns a copy of this period with the years and months normalized
     * leaving the days unchanged.
     */
    public normalized(): Period {
        const totalMonths = this.toMonths();
        const splitYears = intDiv(totalMonths, 12);
        const splitMonths = totalMonths % 12;

        if (splitYears === this.years && splitMonths === this.months) {
            return this;
        }

        return Period.of(splitYears, splitMonths, this.days);
    }

    /**
     * Gets the total number of months in this period.
     */
    public toMonths(): number {
        return this.years * 12 + this.months;
    }

    /**
     * Gets the total number of years in this period.
     */
    public toYears(): number {
        return intDiv(this.toMonths(), 12);
    }

    /**
     * Gets the days part of this period.
     */
    public toDaysPart(): number {
        return this.days;
    }

    /**
     * Gets the months part of this period after normalizing years and months.
     */
    public toMonthsPart(): number {
        return this.toMonths() % 12;
    }

    /**
     * Gets the years part of this period after normalizing years and months.
     */
    public toYearsPart(): number {
        return this.toYears();
    }

    /**
     * Adds this period to the specified local date.
     */
    public addToLocalDate(date: LocalDate): LocalDate {
        if (this.months === 0) {
            return date.plusYears(this.years).plusDays(this.days);
        }

        const totalMonths = this.toMonths();

        return date.plusMonths(totalMonths).plusDays(this.days);
    }

    /**
     * Subtracts this period from the specified date.
     */
    public subtractFromLocalDate(date: LocalDate): LocalDate {
        if (this.months === 0) {
            return date.minusYears(this.years).minusDays(this.days);
        }

        const totalMonths = this.toMonths();

        return date.minusMonths(totalMonths).minusDays(this.days);
    }

    /**
     * Converts this period to a string in ISO-8601 format.
     */
    public toString(): string {
        if (this.isZero()) {
            return 'P0D';
        }

        let output = 'P';

        if (this.years !== 0) {
            output += `${this.years}Y`;
        }

        if (this.months !== 0) {
            output += `${this.months}M`;
        }

        if (this.days !== 0) {
            output += `${this.days}D`;
        }

        return output;
    }
}
