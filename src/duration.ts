import {LocalTime} from './localTime';
import {addExact, intDiv, multiplyExact, subtractExact} from './math';
import {Instant} from './instant';

export class Duration {
    private readonly seconds: number;

    private readonly nanos: number;

    // eslint-disable-next-line max-len -- Regex literal cannot be split.
    private static PATTERN = /^(?<sign>[-+]?)P(?:(?<day>[-+]?[0-9]+)D)?(?<time>T(?:(?<hour>[-+]?[0-9]+)H)?(?:(?<minute>[-+]?[0-9]+)M)?(?:(?<second>[-+]?[0-9]+)(?:[.,](?<fraction>[0-9]{0,9}))?S)?)?$/i;

    private constructor(seconds: number, nanos = 0) {
        this.seconds = seconds;
        this.nanos = nanos;
    }

    public static parse(value: string): Duration {
        const {groups} = value.match(Duration.PATTERN) ?? {};

        if (groups === undefined) {
            throw new Error(`Unrecognized ISO-8601 duration string "${value}".`);
        }

        const isDayUndefined = groups.day === undefined;
        const isTimeUndefined = groups.hour === undefined && groups.minute === undefined && groups.second === undefined;
        const isTimeSpecified = groups.time?.[0] === 'T';

        if (isDayUndefined && isTimeUndefined) {
            throw new Error(`Unrecognized ISO-8601 duration string "${value}".`);
        }

        if (isTimeSpecified && isTimeUndefined) {
            throw new Error(`Unrecognized ISO-8601 duration string "${value}".`);
        }

        const daysAsSeconds = Number.parseInt(groups.day ?? '0', 10) * LocalTime.SECONDS_PER_DAY;
        const hoursAsSeconds = Number.parseInt(groups.hour ?? '0', 10) * LocalTime.SECONDS_PER_HOUR;
        const minutesAsSeconds = Number.parseInt(groups.minute ?? '0', 10) * LocalTime.SECONDS_PER_MINUTE;
        const seconds = Number.parseInt(groups.second ?? '0', 10);
        const fraction = Number.parseInt(groups.fraction?.padEnd(9, '0') ?? '0', 10);

        const totalSeconds = Duration.safeMultiAdd(daysAsSeconds, hoursAsSeconds, minutesAsSeconds, seconds);
        const nanos = groups.second?.[0] === '-' && fraction > 0 ? (fraction * -1) : fraction;

        const negate = groups.sign === '-';
        const finalSeconds = totalSeconds !== 0 && negate ? -totalSeconds : totalSeconds;
        const finalNanos = nanos !== 0 && negate ? -nanos : nanos;

        return Duration.ofSeconds(finalSeconds, finalNanos);
    }

    public static zero(): Duration {
        return new Duration(0);
    }

    public static ofWeeks(weeks: number): Duration {
        return Duration.ofSeconds(multiplyExact(weeks, LocalTime.SECONDS_PER_DAY * 7));
    }

    public static ofDays(days: number): Duration {
        return Duration.ofSeconds(multiplyExact(days, LocalTime.SECONDS_PER_DAY));
    }

    public static ofHours(hours: number): Duration {
        return Duration.ofSeconds(multiplyExact(hours, LocalTime.SECONDS_PER_HOUR));
    }

    public static ofMinutes(minutes: number): Duration {
        return Duration.ofSeconds(multiplyExact(minutes, LocalTime.SECONDS_PER_MINUTE));
    }

    public static ofSeconds(seconds: number, nanoAdjustment = 0): Duration {
        if (seconds === 0 && nanoAdjustment === 0) {
            return new Duration(0);
        }

        if (nanoAdjustment >= 0 && nanoAdjustment < LocalTime.NANOS_PER_SECOND) {
            return new Duration(seconds, nanoAdjustment);
        }

        const extraSeconds = intDiv(nanoAdjustment, LocalTime.NANOS_PER_SECOND);
        let finalNanoAdjustment = nanoAdjustment % LocalTime.NANOS_PER_SECOND;

        let finalSeconds = addExact(seconds, extraSeconds);

        if (nanoAdjustment < 0) {
            finalNanoAdjustment += LocalTime.NANOS_PER_SECOND;
            finalSeconds = subtractExact(finalSeconds, 1);
        }

        return new Duration(finalSeconds, finalNanoAdjustment);
    }

    public static ofMillis(millis: number): Duration {
        const seconds = intDiv(millis, LocalTime.MILLIS_PER_SECOND);
        const nanos = (millis % LocalTime.MILLIS_PER_SECOND) * LocalTime.NANOS_PER_MILLI;

        return Duration.ofSeconds(seconds, nanos);
    }

    public static ofMicros(micros: number): Duration {
        const seconds = intDiv(micros, LocalTime.MICROS_PER_SECOND);
        const nanos = (micros % LocalTime.MICROS_PER_SECOND) * LocalTime.NANOS_PER_MICRO;

        return Duration.ofSeconds(seconds, nanos);
    }

    public static ofNanos(nanos: number): Duration {
        return Duration.ofSeconds(0, nanos);
    }

    public static between(start: Instant, end: Instant): Duration {
        const seconds = subtractExact(end.getSeconds(), start.getSeconds());
        const nanos = subtractExact(end.getNano(), start.getNano());

        return Duration.ofSeconds(seconds, nanos);
    }

    public isZero(): boolean {
        return this.seconds === 0 && this.nanos === 0;
    }

    public isNegative(): boolean {
        return this.seconds < 0;
    }

    public isNegativeOrZero(): boolean {
        return this.seconds < 0 || (this.seconds === 0 && this.nanos === 0);
    }

    public isPositive(): boolean {
        return this.seconds > 0 || (this.seconds === 0 && this.nanos !== 0);
    }

    public isPositiveOrZero(): boolean {
        return this.seconds > 0 || (this.seconds === 0 && this.nanos >= 0);
    }

    public getSeconds(): number {
        return this.seconds;
    }

    public getNanos(): number {
        return this.nanos;
    }

    public withSeconds(seconds: number): Duration {
        if (seconds === this.seconds) {
            return this;
        }

        return Duration.ofSeconds(seconds, this.nanos);
    }

    public withNanos(nanos: number): Duration {
        if (nanos === this.nanos) {
            return this;
        }

        return Duration.ofSeconds(this.seconds, nanos);
    }

    public plusDays(days: number): Duration {
        if (days === 0) {
            return this;
        }

        const seconds = multiplyExact(days, LocalTime.SECONDS_PER_DAY);
        const totalSeconds = addExact(this.seconds, seconds);

        return Duration.ofSeconds(totalSeconds, this.nanos);
    }

    public minusDays(days: number): Duration {
        return this.plusDays(-days);
    }

    public plusHours(hours: number): Duration {
        if (hours === 0) {
            return this;
        }

        const seconds = multiplyExact(hours, LocalTime.SECONDS_PER_HOUR);
        const totalSeconds = addExact(this.seconds, seconds);

        return Duration.ofSeconds(totalSeconds, this.nanos);
    }

    public minusHours(hours: number): Duration {
        return this.plusHours(-hours);
    }

    public plusMinutes(minutes: number): Duration {
        if (minutes === 0) {
            return this;
        }

        const seconds = multiplyExact(minutes, LocalTime.SECONDS_PER_MINUTE);
        const totalSeconds = addExact(this.seconds, seconds);

        return Duration.ofSeconds(totalSeconds, this.nanos);
    }

    public minusMinutes(minutes: number): Duration {
        return this.plusMinutes(-minutes);
    }

    public plusSeconds(seconds: number): Duration {
        if (seconds === 0) {
            return this;
        }

        const totalSeconds = addExact(this.seconds, seconds);

        return Duration.ofSeconds(totalSeconds, this.nanos);
    }

    public minusSeconds(seconds: number): Duration {
        return this.plusSeconds(-seconds);
    }

    public plusMillis(millis: number): Duration {
        if (millis === 0) {
            return this;
        }

        const seconds = intDiv(millis, LocalTime.MILLIS_PER_SECOND);
        const totalSeconds = addExact(this.seconds, seconds);

        const remainder = millis % LocalTime.MILLIS_PER_SECOND;
        const nanos = this.nanos + (remainder * LocalTime.NANOS_PER_MILLI);

        return Duration.ofSeconds(totalSeconds, nanos);
    }

    public minusMillis(millis: number): Duration {
        return this.plusMillis(-millis);
    }

    public plusMicros(micros: number): Duration {
        if (micros === 0) {
            return this;
        }

        const seconds = intDiv(micros, LocalTime.MICROS_PER_SECOND);
        const totalSeconds = addExact(this.seconds, seconds);

        const remainder = micros % LocalTime.MICROS_PER_SECOND;
        const nanos = this.nanos + (remainder * LocalTime.NANOS_PER_MICRO);

        return Duration.ofSeconds(totalSeconds, nanos);
    }

    public minusMicros(micros: number): Duration {
        return this.plusMicros(-micros);
    }

    public plusNanos(nanos: number): Duration {
        if (nanos === 0) {
            return this;
        }

        const seconds = intDiv(nanos, LocalTime.NANOS_PER_SECOND);
        const totalSeconds = addExact(this.seconds, seconds);

        const remainder = nanos % LocalTime.NANOS_PER_SECOND;
        const newNanos = this.nanos + remainder;

        return Duration.ofSeconds(totalSeconds, newNanos);
    }

    public minusNanos(nanos: number): Duration {
        return this.plusNanos(-nanos);
    }

    public equals(other: Duration): boolean {
        return this.seconds === other.seconds && this.nanos === other.nanos;
    }

    public addTo(instant: Instant): Instant {
        return instant.plusNanos(this.nanos).plusSeconds(this.seconds);
    }

    public subtractFrom(instant: Instant): Instant {
        return instant.minusNanos(this.nanos).minusSeconds(this.seconds);
    }

    public toDays(): number {
        return intDiv(this.seconds, LocalTime.SECONDS_PER_DAY);
    }

    public toHours(): number {
        return intDiv(this.seconds, LocalTime.SECONDS_PER_HOUR);
    }

    public toMinutes(): number {
        return intDiv(this.seconds, LocalTime.SECONDS_PER_MINUTE);
    }

    public toSeconds(): number {
        if (this.seconds < 0 && this.nanos > 0) {
            return this.seconds + 1;
        }

        return this.seconds;
    }

    public toMillis(): number {
        return addExact(
            multiplyExact(this.seconds, LocalTime.MILLIS_PER_SECOND),
            intDiv(this.nanos, LocalTime.NANOS_PER_MILLI),
        );
    }

    public toMicros(): number {
        return addExact(
            multiplyExact(this.seconds, LocalTime.MICROS_PER_SECOND),
            intDiv(this.nanos, LocalTime.NANOS_PER_MICRO),
        );
    }

    public toNanos(): number {
        return addExact(
            multiplyExact(this.seconds, LocalTime.NANOS_PER_SECOND),
            this.nanos,
        );
    }

    public toDaysPart(): number {
        return this.toDays();
    }

    public toHoursPart(): number {
        return this.toHours() % LocalTime.HOURS_PER_DAY;
    }

    public toMinutesPart(): number {
        return this.toMinutes() % LocalTime.MINUTES_PER_HOUR;
    }

    public toSecondsPart(): number {
        return this.toSeconds() % LocalTime.SECONDS_PER_MINUTE;
    }

    public toMillisPart(): number {
        return intDiv(this.toNanosPart(), LocalTime.NANOS_PER_MILLI);
    }

    public toMicrosPart(): number {
        return intDiv(this.toNanosPart(), LocalTime.NANOS_PER_MICRO);
    }

    public toNanosPart(): number {
        if (this.seconds < 0 && this.nanos > 0) {
            return this.nanos - LocalTime.NANOS_PER_SECOND;
        }

        return this.nanos;
    }

    public isLongerThan(other: Duration): boolean {
        if (this.seconds > other.seconds) {
            return true;
        }

        return this.seconds === other.seconds && this.nanos > other.nanos;
    }

    public isLongerThanOrEqualTo(other: Duration): boolean {
        if (this.seconds > other.seconds) {
            return true;
        }

        return this.seconds === other.seconds && this.nanos >= other.nanos;
    }

    public isShorterThan(other: Duration): boolean {
        if (this.seconds < other.seconds) {
            return true;
        }

        return this.seconds === other.seconds && this.nanos < other.nanos;
    }

    public isShorterThanOrEqualTo(other: Duration): boolean {
        if (this.seconds < other.seconds) {
            return true;
        }

        return this.seconds === other.seconds && this.nanos <= other.nanos;
    }

    public toString(): string {
        let {seconds, nanos} = this;

        if (seconds === 0 && nanos === 0) {
            return 'PT0S';
        }

        const sign = seconds < 0;

        if (seconds < 0 && nanos !== 0) {
            seconds++;
            nanos = LocalTime.NANOS_PER_SECOND - nanos;
        }

        const hours = intDiv(seconds, LocalTime.SECONDS_PER_HOUR);
        const minutes = intDiv(seconds % LocalTime.SECONDS_PER_HOUR, LocalTime.SECONDS_PER_MINUTE);

        seconds %= LocalTime.SECONDS_PER_MINUTE;

        let output = 'PT';

        if (hours !== 0) {
            output += `${hours}H`;
        }

        if (minutes !== 0) {
            output += `${minutes}M`;
        }

        if (seconds === 0 && nanos === 0) {
            return output;
        }

        output += seconds === 0 && sign ? '-0S' : `${seconds}`;

        if (nanos !== 0) {
            const fraction = `${nanos}`.padStart(9, '0').replace(/0+$/, '');
            const scale = intDiv(fraction.length + 2, 3) * 3;

            output += `.${fraction.padEnd(scale, '0')}`;
        }

        output += 'S';

        return output;
    }

    private static safeMultiAdd(...elements: number[]): number {
        let result = 0;

        for (const element of elements) {
            result = addExact(result, element);
        }

        return result;
    }
}
