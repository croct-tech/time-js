import {Period} from './period';
import {Duration} from './duration';
import {LocalTime} from './localTime';
import {intDiv} from './math';

export class PeriodDuration {
    /**
     * The period.
     */
    private readonly period: Period;

    /**
     * The duration.
     */
    private readonly duration: Duration;

    public constructor(period: Period, duration: Duration) {
        this.period = period;
        this.duration = duration;
    }

    public static of(period: Period, duration: Duration): PeriodDuration {
        if (period.isZero() && duration.isZero()) {
            return PeriodDuration.zero();
        }

        return new PeriodDuration(period, duration);
    }

    public static zero(): PeriodDuration {
        return new PeriodDuration(Period.zero(), Duration.zero());
    }

    public static ofPeriod(period: Period): PeriodDuration {
        return PeriodDuration.of(period, Duration.zero());
    }

    public static ofDuration(duration: Duration): PeriodDuration {
        return PeriodDuration.of(Period.zero(), duration);
    }

    public static ofParts(years: number, months: number, days: number, seconds = 0, nanos = 0): PeriodDuration {
        return new PeriodDuration(
            Period.of(years, months, days),
            Duration.ofSeconds(seconds, nanos),
        );
    }

    public isZero(): boolean {
        return this.period.isZero() && this.duration.isZero();
    }

    public getPeriod(): Period {
        return this.period;
    }

    public getDuration(): Duration {
        return this.duration;
    }

    public getYears(): number {
        return this.period.getYears();
    }

    public getMonths(): number {
        return this.period.getMonths();
    }

    public getDays(): number {
        return this.period.getDays();
    }

    public getSeconds(): number {
        return this.duration.getSeconds();
    }

    public getNanos(): number {
        return this.duration.getNanos();
    }

    public equals(periodDuration: unknown): boolean {
        return periodDuration instanceof PeriodDuration
            && this.period.equals(periodDuration.period)
            && this.duration.equals(periodDuration.duration);
    }

    public withPeriod(period: Period): PeriodDuration {
        if (this.period.equals(period)) {
            return this;
        }

        return PeriodDuration.of(period, this.duration);
    }

    public withDuration(duration: Duration): PeriodDuration {
        if (this.duration.equals(duration)) {
            return this;
        }

        return PeriodDuration.of(this.period, duration);
    }

    public withYears(years: number): PeriodDuration {
        if (this.period.getYears() === years) {
            return this;
        }

        return this.withPeriod(this.period.withYears(years));
    }

    public withMonths(months: number): PeriodDuration {
        if (this.period.getMonths() === months) {
            return this;
        }

        return this.withPeriod(this.period.withMonths(months));
    }

    public withDays(days: number): PeriodDuration {
        if (this.period.getDays() === days) {
            return this;
        }

        return this.withPeriod(this.period.withDays(days));
    }

    public withSeconds(seconds: number): PeriodDuration {
        if (this.duration.getSeconds() === seconds) {
            return this;
        }

        return this.withDuration(this.duration.withSeconds(seconds));
    }

    public withNanos(nanoOfSecond: number): PeriodDuration {
        if (this.duration.getNanos() === nanoOfSecond) {
            return this;
        }

        return this.withDuration(this.duration.withNanos(nanoOfSecond));
    }

    public plusPeriodDuration(periodDuration: PeriodDuration): PeriodDuration {
        const period = this.period.plusPeriod(periodDuration.period);
        const duration = this.duration.plusDuration(periodDuration.duration);

        return PeriodDuration.of(period, duration);
    }

    public minusPeriodDuration(periodDuration: PeriodDuration): PeriodDuration {
        const period = this.period.minusPeriod(periodDuration.period);
        const duration = this.duration.minusDuration(periodDuration.duration);

        return PeriodDuration.of(period, duration);
    }

    public plusYears(years: number): PeriodDuration {
        return this.withPeriod(this.period.plusYears(years));
    }

    public minusYears(years: number): PeriodDuration {
        return this.withPeriod(this.period.minusYears(years));
    }

    public plusMonths(months: number): PeriodDuration {
        return this.withPeriod(this.period.plusMonths(months));
    }

    public minusMonths(months: number): PeriodDuration {
        return this.withPeriod(this.period.minusMonths(months));
    }

    public plusWeeks(weeks: number): PeriodDuration {
        return this.withPeriod(this.period.plusWeeks(weeks));
    }

    public minusWeeks(weeks: number): PeriodDuration {
        return this.withPeriod(this.period.minusWeeks(weeks));
    }

    public plusDays(days: number): PeriodDuration {
        return this.withPeriod(this.period.plusDays(days));
    }

    public minusDays(days: number): PeriodDuration {
        return this.withPeriod(this.period.minusDays(days));
    }

    public plusHours(hours: number): PeriodDuration {
        return this.withDuration(this.duration.plusHours(hours));
    }

    public minusHours(hours: number): PeriodDuration {
        return this.withDuration(this.duration.minusHours(hours));
    }

    public plusMinutes(minutes: number): PeriodDuration {
        return this.withDuration(this.duration.plusMinutes(minutes));
    }

    public minusMinutes(minutes: number): PeriodDuration {
        return this.withDuration(this.duration.minusMinutes(minutes));
    }

    public plusSeconds(seconds: number): PeriodDuration {
        return this.withDuration(this.duration.plusSeconds(seconds));
    }

    public minusSeconds(seconds: number): PeriodDuration {
        return this.withDuration(this.duration.minusSeconds(seconds));
    }

    public plusMillis(millis: number): PeriodDuration {
        return this.withDuration(this.duration.plusMillis(millis));
    }

    public minusMillis(millis: number): PeriodDuration {
        return this.withDuration(this.duration.minusMillis(millis));
    }

    public plusMicros(micros: number): PeriodDuration {
        return this.withDuration(this.duration.plusMicros(micros));
    }

    public minusMicros(micros: number): PeriodDuration {
        return this.withDuration(this.duration.minusMicros(micros));
    }

    public plusNanos(nanos: number): PeriodDuration {
        return this.withDuration(this.duration.plusNanos(nanos));
    }

    public minusNanos(nanos: number): PeriodDuration {
        return this.withDuration(this.duration.minusNanos(nanos));
    }

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

    public normalized(): PeriodDuration {
        return this.withPeriod(this.period.normalized());
    }

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
