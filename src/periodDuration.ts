import {Period} from './period';
import {Duration} from './duration';
import {LocalTime} from './localTime';
import {intDiv} from './math';

export type PeriodDurationParts = {
    years: number,
    months: number,
    days: number,
    seconds: number,
    nanos: number,
};

/**
 * A combination of a period and duration that represents an amount of
 * date-time.
 */
export class PeriodDuration {
    /**
     * The period.
     */
    private readonly period: Period;

    /**
     * The duration.
     */
    private readonly duration: Duration;

    /**
     * Creates an instance of period duration.
     *
     * @param period - The period component
     * @param duration - The duration component
     */
    private constructor(period: Period, duration: Duration) {
        this.period = period;
        this.duration = duration;
    }

    /**
     * Obtains a period duration from period and duration components.
     *
     * @param period - The period component
     * @param duration - The duration component
     */
    public static of(period: Period, duration: Duration): PeriodDuration {
        if (period.isZero() && duration.isZero()) {
            return PeriodDuration.zero();
        }

        return new PeriodDuration(period, duration);
    }

    /**
     * Obtains a period duration representing zero length of time.
     */
    public static zero(): PeriodDuration {
        return new PeriodDuration(Period.zero(), Duration.zero());
    }

    /**
     * Obtains a period duration from a period with zero duration.
     *
     * @param period - The period component
     */
    public static ofPeriod(period: Period): PeriodDuration {
        return PeriodDuration.of(period, Duration.zero());
    }

    /**
     * Obtains a period duration from a duration with zero period.
     *
     * @param duration - The duration component
     */
    public static ofDuration(duration: Duration): PeriodDuration {
        return PeriodDuration.of(Period.zero(), duration);
    }

    /**
     * Obtains a period duration from individual time components.
     *
     * @param parts - The period duration components
     */
    public static ofParts(parts: Partial<PeriodDurationParts>): PeriodDuration {
        const {years = 0, months = 0, days = 0, seconds = 0, nanos = 0} = parts;

        return new PeriodDuration(
            Period.of(years, months, days),
            Duration.ofSeconds(seconds, nanos),
        );
    }

    /**
     * Obtains a period duration from a text string.
     *
     * The string must represent a valid ISO-8601 period and/or duration.
     *
     * @param value - The text to parse
     */
    public static parse(value: string): PeriodDuration {
        if (value[0] !== 'P') {
            throw new Error(`Unrecognized ISO-8601 period string "${value}".`);
        }

        const [date, time] = value.slice(1).split('T');
        const sTime = time ?? '';

        return PeriodDuration.of(
            date !== '' ? Period.parse(`P${date}`) : Period.zero(),
            sTime !== '' ? Duration.parse(`PT${sTime}`) : Duration.zero(),
        );
    }

    /**
     * Checks if this period duration is zero length.
     */
    public isZero(): boolean {
        return this.period.isZero() && this.duration.isZero();
    }

    /**
     * Gets the period component of this period duration.
     */
    public getPeriod(): Period {
        return this.period;
    }

    /**
     * Gets the duration component of this period duration.
     */
    public getDuration(): Duration {
        return this.duration;
    }

    /**
     * Gets the number of years in this period duration.
     */
    public getYears(): number {
        return this.period.getYears();
    }

    /**
     * Gets the number of months in this period duration.
     */
    public getMonths(): number {
        return this.period.getMonths();
    }

    /**
     * Gets the number of days in this period duration.
     */
    public getDays(): number {
        return this.period.getDays();
    }

    /**
     * Gets the number of seconds in this period duration.
     */
    public getSeconds(): number {
        return this.duration.getSeconds();
    }

    /**
     * Gets the number of nanoseconds in this period duration.
     */
    public getNanos(): number {
        return this.duration.getNanos();
    }

    /**
     * Checks if this period duration is equal to another period duration.
     *
     * @param other - The other period duration to check
     */
    public equals(other: unknown): boolean {
        return other instanceof PeriodDuration
            && this.period.equals(other.period)
            && this.duration.equals(other.duration);
    }

    /**
     * Returns a copy of this period duration with the specified period.
     *
     * @param period - The period
     */
    public withPeriod(period: Period): PeriodDuration {
        if (this.period.equals(period)) {
            return this;
        }

        return PeriodDuration.of(period, this.duration);
    }

    /**
     * Returns a copy of this period duration with the specified duration.
     *
     * @param duration - The duration
     */
    public withDuration(duration: Duration): PeriodDuration {
        if (this.duration.equals(duration)) {
            return this;
        }

        return PeriodDuration.of(this.period, duration);
    }

    /**
     * Returns a copy of this period duration with the specified number of
     * years.
     *
     * @param years - The number of years
     */
    public withYears(years: number): PeriodDuration {
        if (this.period.getYears() === years) {
            return this;
        }

        return this.withPeriod(this.period.withYears(years));
    }

    /**
     * Returns a copy of this period duration with the specified number of
     * months.
     *
     * @param months - The number of months
     */
    public withMonths(months: number): PeriodDuration {
        if (this.period.getMonths() === months) {
            return this;
        }

        return this.withPeriod(this.period.withMonths(months));
    }

    /**
     * Returns a copy of this period duration with the specified number of
     * days.
     *
     * @param days - The number of days
     */
    public withDays(days: number): PeriodDuration {
        if (this.period.getDays() === days) {
            return this;
        }

        return this.withPeriod(this.period.withDays(days));
    }

    /**
     * Returns a copy of this period duration with the specified number of
     * seconds.
     *
     * @param seconds - The number of seconds
     */
    public withSeconds(seconds: number): PeriodDuration {
        if (this.duration.getSeconds() === seconds) {
            return this;
        }

        return this.withDuration(this.duration.withSeconds(seconds));
    }

    /**
     * Returns a copy of this period duration with the specified number of
     * nanoseconds.
     *
     * @param nanoOfSecond - The number of nanoseconds
     */
    public withNanos(nanoOfSecond: number): PeriodDuration {
        if (this.duration.getNanos() === nanoOfSecond) {
            return this;
        }

        return this.withDuration(this.duration.withNanos(nanoOfSecond));
    }

    /**
     * Returns a copy of this period duration with the specified
     * period and/or duration added.
     *
     * @param other - The period duration
     */
    public plus(other: PeriodDuration | Period | Duration): PeriodDuration {
        if (other instanceof Period) {
            return this.withPeriod(this.period.plusPeriod(other));
        }

        if (other instanceof Duration) {
            return this.withDuration(this.duration.plusDuration(other));
        }

        const period = this.period.plusPeriod(other.period);
        const duration = this.duration.plusDuration(other.duration);

        return PeriodDuration.of(period, duration);
    }

    /**
     * Returns a copy of this period duration with the specified
     * period and/or duration subtracted.
     *
     * @param other - The period duration
     */
    public minus(other: PeriodDuration | Period | Duration): PeriodDuration {
        if (other instanceof Period) {
            return this.withPeriod(this.period.minusPeriod(other));
        }

        if (other instanceof Duration) {
            return this.withDuration(this.duration.minusDuration(other));
        }

        const period = this.period.minusPeriod(other.period);
        const duration = this.duration.minusDuration(other.duration);

        return PeriodDuration.of(period, duration);
    }

    /**
     * Returns a copy of this period duration with the specified number of
     * years added.
     *
     * @param years - The number of years
     */
    public plusYears(years: number): PeriodDuration {
        return this.withPeriod(this.period.plusYears(years));
    }

    /**
     * Returns a copy of this period duration with the specified number of
     * years subtracted.
     *
     * @param years - The number of years
     */
    public minusYears(years: number): PeriodDuration {
        return this.withPeriod(this.period.minusYears(years));
    }

    /**
     * Returns a copy of this period duration with the specified number of
     * months added.
     *
     * @param months - The number of months
     */
    public plusMonths(months: number): PeriodDuration {
        return this.withPeriod(this.period.plusMonths(months));
    }

    /**
     * Returns a copy of this period duration with the specified number of
     * months subtracted.
     *
     * @param months - The number of months
     */
    public minusMonths(months: number): PeriodDuration {
        return this.withPeriod(this.period.minusMonths(months));
    }

    /**
     * Returns a copy of this period duration with the specified number of
     * weeks added.
     *
     * @param weeks - The number of weeks
     */
    public plusWeeks(weeks: number): PeriodDuration {
        return this.withPeriod(this.period.plusWeeks(weeks));
    }

    /**
     * Returns a copy of this period duration with the specified number of
     * weeks subtracted.
     *
     * @param weeks - The number of weeks to subtract
     */
    public minusWeeks(weeks: number): PeriodDuration {
        return this.withPeriod(this.period.minusWeeks(weeks));
    }

    /**
     * Returns a copy of this period duration with the specified number of days
     * added.
     *
     * @param days - The number of days
     */
    public plusDays(days: number): PeriodDuration {
        return this.withPeriod(this.period.plusDays(days));
    }

    /**
     * Returns a copy of this period duration with the specified number of days
     * subtracted.
     *
     * @param days - The number of days
     */
    public minusDays(days: number): PeriodDuration {
        return this.withPeriod(this.period.minusDays(days));
    }

    /**
     * Returns a copy of this period duration with the specified number of
     * hours added.
     *
     * @param hours - The number of hours
     */
    public plusHours(hours: number): PeriodDuration {
        return this.withDuration(this.duration.plusHours(hours));
    }

    /**
     * Returns a copy of this period duration with the specified number of
     * hours subtracted.
     *
     * @param hours - The number of hours
     */
    public minusHours(hours: number): PeriodDuration {
        return this.withDuration(this.duration.minusHours(hours));
    }

    /**
     * Returns a copy of this period duration with the specified number of
     * minutes added.
     *
     * @param minutes - The number of minutes
     */
    public plusMinutes(minutes: number): PeriodDuration {
        return this.withDuration(this.duration.plusMinutes(minutes));
    }

    /**
     * Returns a copy of this period duration with the specified number of
     * minutes subtracted.
     *
     * @param minutes - The number of minutes
     */
    public minusMinutes(minutes: number): PeriodDuration {
        return this.withDuration(this.duration.minusMinutes(minutes));
    }

    /**
     * Returns a copy of this period duration with the specified number of
     * seconds added.
     *
     * @param seconds - The number of seconds
     */
    public plusSeconds(seconds: number): PeriodDuration {
        return this.withDuration(this.duration.plusSeconds(seconds));
    }

    /**
     * Returns a copy of this period duration with the specified number of
     * seconds subtracted.
     *
     * @param seconds - The number of seconds
     */
    public minusSeconds(seconds: number): PeriodDuration {
        return this.withDuration(this.duration.minusSeconds(seconds));
    }

    /**
     * Returns a copy of this period duration with the specified number of
     * milliseconds added.
     *
     * @param millis - The number of milliseconds
     */
    public plusMillis(millis: number): PeriodDuration {
        return this.withDuration(this.duration.plusMillis(millis));
    }

    /**
     * Returns a copy of this period duration with the specified number of
     * milliseconds subtracted.
     *
     * @param millis - The number of milliseconds
     */
    public minusMillis(millis: number): PeriodDuration {
        return this.withDuration(this.duration.minusMillis(millis));
    }

    /**
     * Returns a copy of this period duration with the specified number of
     * microseconds added.
     *
     * @param micros - The number of microseconds
     */
    public plusMicros(micros: number): PeriodDuration {
        return this.withDuration(this.duration.plusMicros(micros));
    }

    /**
     * Returns a copy of this period duration with the specified number of
     * microseconds subtracted.
     *
     * @param micros - The number of microseconds
     */
    public minusMicros(micros: number): PeriodDuration {
        return this.withDuration(this.duration.minusMicros(micros));
    }

    /**
     * Returns a copy of this period duration with the specified number of
     * nanoseconds added.
     *
     * @param nanos - The number of nanoseconds
     */
    public plusNanos(nanos: number): PeriodDuration {
        return this.withDuration(this.duration.plusNanos(nanos));
    }

    /**
     * Returns a copy of this period duration with the specified number of
     * nanoseconds subtracted.
     *
     * @param nanos - The number of nanoseconds
     */
    public minusNanos(nanos: number): PeriodDuration {
        return this.withDuration(this.duration.minusNanos(nanos));
    }

    /**
     * Returns a copy of this period duration multiplied by the scalar.
     *
     * @param multiplier - The scalar
     */
    public multipliedBy(multiplier: number): PeriodDuration {
        if (multiplier === 0) {
            return PeriodDuration.zero();
        }

        if (multiplier === 1) {
            return this;
        }

        const period = this.period.multipliedBy(multiplier);
        const duration = this.duration.multipliedBy(multiplier);

        return PeriodDuration.of(period, duration);
    }

    /**
     * Returns a copy of this period duration with the years and months
     * normalized, leaving days and time units unchanged.
     */
    public normalized(): PeriodDuration {
        return this.withPeriod(this.period.normalized());
    }

    /**
     * Normalizes the days and seconds in this period duration by converting
     * excess seconds into days.
     */
    public normalizedStandardDays(): PeriodDuration {
        const days = this.getDays();
        const seconds = this.getSeconds();

        const totalSeconds = days * LocalTime.SECONDS_PER_DAY + seconds;
        const splitDays = intDiv(totalSeconds, LocalTime.SECONDS_PER_DAY);
        const splitSeconds = totalSeconds % LocalTime.SECONDS_PER_DAY;

        if (splitDays === days && splitSeconds === seconds) {
            return this;
        }

        const period = this.period.withDays(splitDays);
        const duration = this.duration.withSeconds(splitSeconds);

        return PeriodDuration.of(period, duration);
    }

    /**
     * Returns the individual parts of this period-duration.
     */
    public getParts(): PeriodDurationParts {
        return {
            years: this.getYears(),
            months: this.getMonths(),
            days: this.getDays(),
            seconds: this.getSeconds(),
            nanos: this.getNanos(),
        };
    }

    /**
     * Converts this period duration to a string in ISO-8601 format.
     */
    public toString(): string {
        if (this.period.isZero()) {
            return this.duration.toString();
        }

        if (this.duration.isZero()) {
            return this.period.toString();
        }

        return this.period.toString() + this.duration
            .toString()
            .slice(1);
    }
}
