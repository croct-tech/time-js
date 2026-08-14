import type {Clock} from './clock';
import {DefaultClockProvider} from './defaultClockProvider';
import {Instant} from './instant';
import type {LocalDate} from './localDate';
import {LocalDateTime} from './localDateTime';
import type {LocalTime} from './localTime';
import {PeriodDuration} from './periodDuration';
import {TimeZone, ZoneOffset} from './timeZone';

/**
 * A date-time with a time-zone in the ISO-8601 calendar system,
 * such as 2007-12-03T10:15:30-03:00[America/Sao_Paulo].
 *
 * This class stores all date and time fields to a precision of nanoseconds, along
 * with a time-zone and the offset from UTC/Greenwich that applies at that point.
 * Storing the offset as well as the zone is what allows a date-time that falls in
 * an overlap, and therefore occurs twice, to denote a single point on the time-line.
 */
export class ZonedDateTime {
    /**
     * A regular expression that matches ISO-8601 zoned date-time strings.
     */
    private static PATTERN = /^(?<dateTime>.+)(?<offset>Z|[+-]\d{2}:\d{2}(?::\d{2})?)(?:\[(?<zone>[^[\]]+)\])?$/;

    /**
     * The local date-time.
     */
    private readonly dateTime: LocalDateTime;

    /**
     * The offset from UTC/Greenwich that applies at this point on the time-line.
     */
    private readonly offset: ZoneOffset;

    /**
     * The time-zone.
     */
    private readonly zone: TimeZone;

    /**
     * Initializes a zoned date-time.
     */
    private constructor(dateTime: LocalDateTime, offset: ZoneOffset, zone: TimeZone) {
        this.dateTime = dateTime;
        this.offset = offset;
        this.zone = zone;
    }

    /**
     * Returns the current date-time from the given clock in the clock's time-zone.
     *
     * @param clock The clock to use. The default clock is used if one is not given.
     */
    public static now(clock: Clock = DefaultClockProvider.getClock()): ZonedDateTime {
        return ZonedDateTime.ofInstant(clock.getInstant(), clock.getZone());
    }

    /**
     * Returns the current date-time from the default or given clock in the given time-zone.
     *
     * @param zone  The time-zone to use.
     * @param clock The clock to use. The default clock is used if one is not given.
     */
    public static nowIn(zone: TimeZone, clock: Clock = DefaultClockProvider.getClock()): ZonedDateTime {
        return ZonedDateTime.ofInstant(clock.getInstant(), zone);
    }

    /**
     * Creates a zoned date-time from a local date-time and a time-zone.
     *
     * In most cases there is only one valid offset for a local date-time. When the
     * local date-time falls in an overlap, and therefore has two valid offsets, the
     * preferred offset is used if it is one of them, and the earlier offset otherwise.
     * When it falls in a gap, and therefore has none, the date-time is shifted
     * forward by the length of the gap.
     *
     * @param dateTime        The local date-time.
     * @param zone            The time-zone.
     * @param preferredOffset The offset to prefer when the local date-time is ambiguous.
     */
    public static of(
        dateTime: LocalDateTime,
        zone: TimeZone,
        preferredOffset?: ZoneOffset,
    ): ZonedDateTime {
        if (zone instanceof ZoneOffset) {
            return new ZonedDateTime(dateTime, zone, zone);
        }

        const rules = zone.getRules();
        const offsets = rules.getValidOffsets(dateTime);

        if (offsets.length === 1) {
            return new ZonedDateTime(dateTime, offsets[0], zone);
        }

        if (offsets.length > 1) {
            const [earlier, later] = offsets;

            return new ZonedDateTime(
                dateTime,
                preferredOffset?.equals(later) === true ? later : earlier,
                zone,
            );
        }

        const transition = rules.getTransition(dateTime);

        if (transition === null) {
            // A local date-time with no valid offset falls in a gap, which always has a
            // transition. Reaching this point means the time-zone data of the runtime
            // reported the two inconsistently.
            throw new Error(
                `Unable to resolve the offset of ${dateTime.toString()} `
                + `in zone "${zone.toString()}".`,
            );
        }

        return new ZonedDateTime(
            dateTime.plusSeconds(transition.getDuration().getSeconds()),
            transition.getOffsetAfter(),
            zone,
        );
    }

    /**
     * Creates a zoned date-time from an instant and a time-zone.
     *
     * @param instant The instant.
     * @param zone    The time-zone.
     */
    public static ofInstant(instant: Instant, zone: TimeZone): ZonedDateTime {
        // Resolving the offset against the rules of the zone is the expensive part,
        // so the local date-time is derived from the offset already resolved.
        const offset = zone.getRules().getOffset(instant);

        return new ZonedDateTime(LocalDateTime.ofInstant(instant, offset), offset, zone);
    }

    /**
     * Creates a zoned date-time from a local date-time, an offset and a time-zone,
     * keeping the instant that the first two denote.
     *
     * The offset of the result is the one that the time-zone actually observes at
     * that instant, which is not necessarily the given offset.
     *
     * @param dateTime The local date-time.
     * @param offset   The offset the local date-time is expressed in.
     * @param zone     The time-zone.
     */
    public static ofResolved(
        dateTime: LocalDateTime,
        offset: ZoneOffset,
        zone: TimeZone,
    ): ZonedDateTime {
        return ZonedDateTime.ofInstant(dateTime.toInstant(offset), zone);
    }

    /**
     * Creates a zoned date-time from a number of seconds from the epoch and a time-zone.
     *
     * @param epochSecond    The number of seconds from the epoch of 1970-01-01T00:00:00Z.
     * @param nanoAdjustment The nanosecond adjustment to the number of seconds.
     * @param zone           The time-zone.
     */
    public static ofEpochSecond(
        epochSecond: number,
        nanoAdjustment: number,
        zone: TimeZone,
    ): ZonedDateTime {
        return ZonedDateTime.ofInstant(Instant.ofEpochSecond(epochSecond, nanoAdjustment), zone);
    }

    /**
     * Creates a zoned date-time from a local date-time, an offset and a time-zone,
     * rejecting any combination that the time-zone does not observe.
     *
     * @param dateTime The local date-time.
     * @param offset   The offset the local date-time is expressed in.
     * @param zone     The time-zone.
     *
     * @throws {Error} If the offset is not valid for the local date-time in the time-zone.
     */
    public static ofStrict(
        dateTime: LocalDateTime,
        offset: ZoneOffset,
        zone: TimeZone,
    ): ZonedDateTime {
        const rules = zone.getRules();

        if (!rules.isValidOffset(dateTime, offset)) {
            const transition = rules.getTransition(dateTime);

            if (transition?.isGap() === true) {
                throw new Error(
                    `Local date-time ${dateTime.toString()} does not exist in zone `
                    + `"${zone.toString()}" due to a gap in the local time-line, `
                    + 'typically caused by daylight savings.',
                );
            }

            throw new Error(
                `Zone offset "${offset.toString()}" is not valid for local date-time `
                + `${dateTime.toString()} in zone "${zone.toString()}".`,
            );
        }

        return new ZonedDateTime(dateTime, offset, zone);
    }

    /**
     * Creates a zoned date-time from a local date-time, an offset and a time-zone,
     * without checking that the time-zone observes the offset.
     *
     * @param dateTime The local date-time.
     * @param offset   The offset the local date-time is expressed in.
     * @param zone     The time-zone.
     *
     * @throws {Error} If the time-zone is a fixed offset that differs from the given offset.
     */
    public static ofLenient(
        dateTime: LocalDateTime,
        offset: ZoneOffset,
        zone: TimeZone,
    ): ZonedDateTime {
        if (zone instanceof ZoneOffset && !zone.equals(offset)) {
            throw new Error('The time zone must match the zone offset.');
        }

        return new ZonedDateTime(dateTime, offset, zone);
    }

    /**
     * Obtains the zoned date-time at the point in time denoted by a native date object.
     *
     * A native date object denotes an instant, so the result is the local date-time
     * observed in the given time-zone at that instant.
     *
     * @param date The native date object.
     * @param zone The time-zone.
     */
    public static fromNative(date: Date, zone: TimeZone): ZonedDateTime {
        return ZonedDateTime.ofInstant(Instant.fromDate(date), zone);
    }

    /**
     * Parses a zoned date-time from its ISO-8601 representation.
     *
     * The offset is used to determine the instant, and the offset of the result is
     * the one that the time-zone observes at that instant.
     *
     * @param value The zoned date-time in ISO-8601 format, such as
     *              `2007-12-03T10:15:30-03:00[America/Sao_Paulo]`.
     *
     * @throws {Error} If the value is not a valid zoned date-time in ISO-8601 format.
     */
    public static parse(value: string): ZonedDateTime {
        const groups = value.match(ZonedDateTime.PATTERN)?.groups;

        if (groups === undefined) {
            throw new Error(`Malformed zoned date-time "${value}".`);
        }

        const offset = ZoneOffset.of(groups.offset);
        const zone = groups.zone === undefined ? offset : TimeZone.of(groups.zone);

        return ZonedDateTime.ofResolved(LocalDateTime.parse(groups.dateTime), offset, zone);
    }

    /**
     * Checks whether the given string is a valid ISO-8601 zoned date-time.
     *
     * See the {@link ZonedDateTime#parse|parse} method for more information
     * about the expected format.
     *
     * @param value The zoned date-time string to validate.
     */
    public static isValid(value: string): boolean {
        try {
            ZonedDateTime.parse(value);
        } catch {
            return false;
        }

        return true;
    }

    /**
     * Returns the offset from UTC/Greenwich that applies at this point on the time-line.
     */
    public getOffset(): ZoneOffset {
        return this.offset;
    }

    /**
     * Returns the time-zone.
     */
    public getZone(): TimeZone {
        return this.zone;
    }

    /**
     * Returns the year.
     */
    public getYear(): number {
        return this.dateTime.getYear();
    }

    /**
     * Returns the month of the year, from 1 to 12.
     */
    public getMonth(): number {
        return this.dateTime.getMonth();
    }

    /**
     * Returns the day of the month, from 1 to 31.
     */
    public getDay(): number {
        return this.dateTime.getDay();
    }

    /**
     * Returns the hour of the day, from 0 to 23.
     */
    public getHour(): number {
        return this.dateTime.getHour();
    }

    /**
     * Returns the minute of the hour, from 0 to 59.
     */
    public getMinute(): number {
        return this.dateTime.getMinute();
    }

    /**
     * Returns the second of the minute, from 0 to 59.
     */
    public getSecond(): number {
        return this.dateTime.getSecond();
    }

    /**
     * Returns the nanosecond of the second, from 0 to 999,999,999.
     */
    public getNano(): number {
        return this.dateTime.getNano();
    }

    /**
     * Returns a copy of this date-time with the earlier of the two offsets valid
     * at an overlap.
     *
     * This method has no effect unless this date-time falls in an overlap.
     */
    public withEarlierOffsetAtOverlap(): ZonedDateTime {
        const transition = this.zone
            .getRules()
            .getTransition(this.dateTime);

        if (transition?.isOverlap() !== true) {
            return this;
        }

        const earlier = transition.getOffsetBefore();

        if (earlier.equals(this.offset)) {
            return this;
        }

        return new ZonedDateTime(this.dateTime, earlier, this.zone);
    }

    /**
     * Returns a copy of this date-time with the later of the two offsets valid
     * at an overlap.
     *
     * This method has no effect unless this date-time falls in an overlap.
     */
    public withLaterOffsetAtOverlap(): ZonedDateTime {
        const transition = this.zone
            .getRules()
            .getTransition(this.dateTime);

        if (transition?.isOverlap() !== true) {
            return this;
        }

        const later = transition.getOffsetAfter();

        if (later.equals(this.offset)) {
            return this;
        }

        return new ZonedDateTime(this.dateTime, later, this.zone);
    }

    /**
     * Returns a copy of this date-time in the given time-zone, keeping the local date-time.
     *
     * The result denotes a different point on the time-line, unless the new time-zone
     * observes the same offset.
     *
     * @param zone The time-zone.
     */
    public withZoneSameLocal(zone: TimeZone): ZonedDateTime {
        if (this.zone.equals(zone)) {
            return this;
        }

        return ZonedDateTime.of(this.dateTime, zone, this.offset);
    }

    /**
     * Returns a copy of this date-time in the given time-zone, keeping the instant.
     *
     * @param zone The time-zone.
     */
    public withZoneSameInstant(zone: TimeZone): ZonedDateTime {
        if (this.zone.equals(zone)) {
            return this;
        }

        return ZonedDateTime.ofInstant(this.toInstant(), zone);
    }

    /**
     * Returns a copy of this date-time whose time-zone is its current offset.
     *
     * The result denotes the same point on the time-line, but no longer observes
     * the rules of the original time-zone.
     */
    public withFixedOffsetZone(): ZonedDateTime {
        if (this.zone.equals(this.offset)) {
            return this;
        }

        return new ZonedDateTime(this.dateTime, this.offset, this.offset);
    }

    /**
     * Returns a copy of this date-time with the given year.
     *
     * The offset is resolved again for the resulting local date-time, following
     * the rules described in {@link ZonedDateTime.of}.
     *
     * @param year The year in the ISO-8601 calendar system.
     *
     * @throws {Error} If the year is out of range.
     */
    public withYear(year: number): ZonedDateTime {
        return this.resolveLocal(this.dateTime.withYear(year));
    }

    /**
     * Returns a copy of this date-time with the given month of year.
     *
     * @param month The month of year, in the range 1 to 12.
     *
     * @throws {Error} If the month is out of range.
     */
    public withMonth(month: number): ZonedDateTime {
        return this.resolveLocal(this.dateTime.withMonth(month));
    }

    /**
     * Returns a copy of this date-time with the given day of month.
     *
     * @param day The day of month, in the range 1 to 31.
     *
     * @throws {Error} If the day is invalid for the year and month of this date-time.
     */
    public withDay(day: number): ZonedDateTime {
        return this.resolveLocal(this.dateTime.withDay(day));
    }

    /**
     * Returns a copy of this date-time with the given hour of day.
     *
     * @param hour The hour of the day, in the range 0 to 23.
     *
     * @throws {Error} If the hour is out of range.
     */
    public withHour(hour: number): ZonedDateTime {
        return this.resolveLocal(this.dateTime.withHour(hour));
    }

    /**
     * Returns a copy of this date-time with the given minute of hour.
     *
     * @param minute The minute of the hour, in the range 0 to 59.
     *
     * @throws {Error} If the minute is out of range.
     */
    public withMinute(minute: number): ZonedDateTime {
        return this.resolveLocal(this.dateTime.withMinute(minute));
    }

    /**
     * Returns a copy of this date-time with the given second of minute.
     *
     * @param second The second of the minute, in the range 0 to 59.
     *
     * @throws {Error} If the second is out of range.
     */
    public withSecond(second: number): ZonedDateTime {
        return this.resolveLocal(this.dateTime.withSecond(second));
    }

    /**
     * Returns a copy of this date-time with the given millisecond of second.
     *
     * The remaining sub-millisecond part of the second is discarded.
     *
     * @param millis The millisecond of the second, in the range 0 to 999.
     *
     * @throws {Error} If the millisecond is out of range.
     */
    public withMilli(millis: number): ZonedDateTime {
        return this.resolveLocal(this.dateTime.withMilli(millis));
    }

    /**
     * Returns a copy of this date-time with the given microsecond of second.
     *
     * The remaining sub-microsecond part of the second is discarded.
     *
     * @param micros The microsecond of the second, in the range 0 to 999,999.
     *
     * @throws {Error} If the microsecond is out of range.
     */
    public withMicro(micros: number): ZonedDateTime {
        return this.resolveLocal(this.dateTime.withMicro(micros));
    }

    /**
     * Returns a copy of this date-time with the given nanosecond of second.
     *
     * @param nanos The nanosecond of the second, in the range 0 to 999,999,999.
     *
     * @throws {Error} If the nanosecond is out of range.
     */
    public withNano(nanos: number): ZonedDateTime {
        return this.resolveLocal(this.dateTime.withNano(nanos));
    }

    /**
     * Returns a copy of this date-time with the given number of years added.
     *
     * @param years The number of years to add.
     */
    public plusYears(years: number): ZonedDateTime {
        return this.resolveLocal(this.dateTime.plusYears(years));
    }

    /**
     * Returns a copy of this date-time with the given number of years subtracted.
     *
     * @param years The number of years to subtract.
     */
    public minusYears(years: number): ZonedDateTime {
        return this.resolveLocal(this.dateTime.minusYears(years));
    }

    /**
     * Returns a copy of this date-time with the given number of months added.
     *
     * @param months The number of months to add.
     */
    public plusMonths(months: number): ZonedDateTime {
        return this.resolveLocal(this.dateTime.plusMonths(months));
    }

    /**
     * Returns a copy of this date-time with the given number of months subtracted.
     *
     * @param months The number of months to subtract.
     */
    public minusMonths(months: number): ZonedDateTime {
        return this.resolveLocal(this.dateTime.minusMonths(months));
    }

    /**
     * Returns a copy of this date-time with the given number of weeks added.
     *
     * @param weeks The number of weeks to add.
     */
    public plusWeeks(weeks: number): ZonedDateTime {
        return this.resolveLocal(this.dateTime.plusWeeks(weeks));
    }

    /**
     * Returns a copy of this date-time with the given number of weeks subtracted.
     *
     * @param weeks The number of weeks to subtract.
     */
    public minusWeeks(weeks: number): ZonedDateTime {
        return this.resolveLocal(this.dateTime.minusWeeks(weeks));
    }

    /**
     * Returns a copy of this date-time with the given number of days added.
     *
     * @param days The number of days to add.
     */
    public plusDays(days: number): ZonedDateTime {
        return this.resolveLocal(this.dateTime.plusDays(days));
    }

    /**
     * Returns a copy of this date-time with the given number of days subtracted.
     *
     * @param days The number of days to subtract.
     */
    public minusDays(days: number): ZonedDateTime {
        return this.resolveLocal(this.dateTime.minusDays(days));
    }

    /**
     * Returns a copy of this date-time with the given number of hours added.
     *
     * @param hours The number of hours to add.
     */
    public plusHours(hours: number): ZonedDateTime {
        return this.resolveInstant(this.dateTime.plusHours(hours));
    }

    /**
     * Returns a copy of this date-time with the given number of hours subtracted.
     *
     * @param hours The number of hours to subtract.
     */
    public minusHours(hours: number): ZonedDateTime {
        return this.resolveInstant(this.dateTime.minusHours(hours));
    }

    /**
     * Returns a copy of this date-time with the given number of minutes added.
     *
     * @param minutes The number of minutes to add.
     */
    public plusMinutes(minutes: number): ZonedDateTime {
        return this.resolveInstant(this.dateTime.plusMinutes(minutes));
    }

    /**
     * Returns a copy of this date-time with the given number of minutes subtracted.
     *
     * @param minutes The number of minutes to subtract.
     */
    public minusMinutes(minutes: number): ZonedDateTime {
        return this.resolveInstant(this.dateTime.minusMinutes(minutes));
    }

    /**
     * Returns a copy of this date-time with the given number of seconds added.
     *
     * @param seconds The number of seconds to add.
     */
    public plusSeconds(seconds: number): ZonedDateTime {
        return this.resolveInstant(this.dateTime.plusSeconds(seconds));
    }

    /**
     * Returns a copy of this date-time with the given number of seconds subtracted.
     *
     * @param seconds The number of seconds to subtract.
     */
    public minusSeconds(seconds: number): ZonedDateTime {
        return this.resolveInstant(this.dateTime.minusSeconds(seconds));
    }

    /**
     * Returns a copy of this date-time with the given number of milliseconds added.
     *
     * @param millis The number of milliseconds to add.
     */
    public plusMillis(millis: number): ZonedDateTime {
        return this.resolveInstant(this.dateTime.plusMillis(millis));
    }

    /**
     * Returns a copy of this date-time with the given number of milliseconds subtracted.
     *
     * @param millis The number of milliseconds to subtract.
     */
    public minusMillis(millis: number): ZonedDateTime {
        return this.resolveInstant(this.dateTime.minusMillis(millis));
    }

    /**
     * Returns a copy of this date-time with the given number of microseconds added.
     *
     * @param micros The number of microseconds to add.
     */
    public plusMicros(micros: number): ZonedDateTime {
        return this.resolveInstant(this.dateTime.plusMicros(micros));
    }

    /**
     * Returns a copy of this date-time with the given number of microseconds subtracted.
     *
     * @param micros The number of microseconds to subtract.
     */
    public minusMicros(micros: number): ZonedDateTime {
        return this.resolveInstant(this.dateTime.minusMicros(micros));
    }

    /**
     * Returns a copy of this date-time with the given number of nanoseconds added.
     *
     * @param nanos The number of nanoseconds to add.
     */
    public plusNanos(nanos: number): ZonedDateTime {
        return this.resolveInstant(this.dateTime.plusNanos(nanos));
    }

    /**
     * Returns a copy of this date-time with the given number of nanoseconds subtracted.
     *
     * @param nanos The number of nanoseconds to subtract.
     */
    public minusNanos(nanos: number): ZonedDateTime {
        return this.resolveInstant(this.dateTime.minusNanos(nanos));
    }

    /**
     * Returns a copy of this date-time with the given amount added.
     *
     * The date part of the amount is added to the local date-time, so that adding
     * one day always lands on the same local time of the next day, even when a
     * daylight savings transition makes that day longer or shorter. The time part is
     * added to the instant, so that adding 24 hours always advances the time-line by
     * exactly that much.
     *
     * @param amount The amount to add.
     */
    public plus(amount: PeriodDuration): ZonedDateTime {
        const shifted = this.resolveLocal(
            this.dateTime.plus(PeriodDuration.ofPeriod(amount.getPeriod())),
        );

        return shifted.resolveInstant(
            shifted.dateTime.plus(PeriodDuration.ofDuration(amount.getDuration())),
        );
    }

    /**
     * Returns a copy of this date-time with the given amount subtracted.
     *
     * See the {@link ZonedDateTime#plus|plus} method for how the date and time parts
     * of the amount are treated.
     *
     * @param amount The amount to subtract.
     */
    public minus(amount: PeriodDuration): ZonedDateTime {
        const shifted = this.resolveLocal(
            this.dateTime.minus(PeriodDuration.ofPeriod(amount.getPeriod())),
        );

        return shifted.resolveInstant(
            shifted.dateTime.minus(PeriodDuration.ofDuration(amount.getDuration())),
        );
    }

    /**
     * Returns the amount of time between this and the given date-time.
     *
     * The given date-time is converted to this time-zone before the amount is measured.
     *
     * @param dateTime The date-time to measure to.
     */
    public until(dateTime: ZonedDateTime): PeriodDuration {
        return this.dateTime.until(dateTime.withZoneSameInstant(this.zone).dateTime);
    }

    /**
     * Checks whether this date-time is equal to another.
     *
     * Two date-times denoting the same point on the time-line in different time-zones
     * are not equal. Compare {@link ZonedDateTime#toInstant|toInstant} instead to
     * check whether they denote the same point.
     *
     * @param dateTime The date-time to compare.
     */
    public equals(dateTime: ZonedDateTime): boolean {
        return this.dateTime.equals(dateTime.dateTime)
            && this.offset.equals(dateTime.offset)
            && this.zone.equals(dateTime.zone);
    }

    /**
     * Compares this date-time to another for order, primarily by the point on the
     * time-line that each denotes.
     *
     * The local date-time and the time-zone break ties, so that date-times denoting
     * the same point in different time-zones are ordered consistently rather than
     * reported as equal. Use {@link ZonedDateTime#isBefore|isBefore} and
     * {@link ZonedDateTime#isAfter|isAfter} to compare by the point alone.
     *
     * @param dateTime The date-time to compare.
     */
    public compare(dateTime: ZonedDateTime): number {
        const instant = this.compareInstant(dateTime);

        if (instant !== 0) {
            return instant;
        }

        const local = this.dateTime.compare(dateTime.dateTime);

        if (local !== 0) {
            return local;
        }

        return this.zone
            .getId()
            .localeCompare(dateTime.zone.getId());
    }

    /**
     * Checks whether this date-time is after another on the time-line.
     *
     * Only the point that each date-time denotes is considered, so two date-times
     * denoting the same point in different time-zones are neither before nor after
     * each other.
     *
     * @param dateTime The date-time to compare.
     */
    public isAfter(dateTime: ZonedDateTime): boolean {
        return this.compareInstant(dateTime) > 0;
    }

    /**
     * Checks whether this date-time is after or equal to another on the time-line.
     *
     * Only the point that each date-time denotes is considered, so two date-times
     * denoting the same point in different time-zones are equal on the time-line.
     *
     * @param dateTime The date-time to compare.
     */
    public isAfterOrEqual(dateTime: ZonedDateTime): boolean {
        return this.compareInstant(dateTime) >= 0;
    }

    /**
     * Checks whether this date-time is before another on the time-line.
     *
     * Only the point that each date-time denotes is considered, so two date-times
     * denoting the same point in different time-zones are neither before nor after
     * each other.
     *
     * @param dateTime The date-time to compare.
     */
    public isBefore(dateTime: ZonedDateTime): boolean {
        return this.compareInstant(dateTime) < 0;
    }

    /**
     * Checks whether this date-time is before or equal to another on the time-line.
     *
     * Only the point that each date-time denotes is considered, so two date-times
     * denoting the same point in different time-zones are equal on the time-line.
     *
     * @param dateTime The date-time to compare.
     */
    public isBeforeOrEqual(dateTime: ZonedDateTime): boolean {
        return this.compareInstant(dateTime) <= 0;
    }

    /**
     * Compares this date-time to another by the point on the time-line that each denotes.
     *
     * @param dateTime The date-time to compare.
     */
    private compareInstant(dateTime: ZonedDateTime): number {
        return this.toInstant().compare(dateTime.toInstant());
    }

    /**
     * Returns the local date part of this date-time.
     */
    public toLocalDate(): LocalDate {
        return this.dateTime.getLocalDate();
    }

    /**
     * Returns the local time part of this date-time.
     */
    public toLocalTime(): LocalTime {
        return this.dateTime.getLocalTime();
    }

    /**
     * Returns the local date-time part of this date-time.
     */
    public toLocalDateTime(): LocalDateTime {
        return this.dateTime;
    }

    /**
     * Converts this date-time to the point it denotes on the UTC time-line.
     */
    public toInstant(): Instant {
        return this.dateTime.toInstant(this.offset);
    }

    /**
     * Returns the number of seconds from the epoch of 1970-01-01T00:00:00Z.
     */
    public toEpochSecond(): number {
        return this.toInstant().getSeconds();
    }

    /**
     * Returns the ISO-8601 string representation of this date-time.
     *
     * The time-zone is appended in brackets unless it is the offset itself.
     */
    public toString(): string {
        const dateTime = this.dateTime.toString() + this.offset.toString();

        if (this.zone.equals(this.offset)) {
            return dateTime;
        }

        return `${dateTime}[${this.zone.toString()}]`;
    }

    /**
     * Returns the JSON representation of this date-time.
     */
    public toJSON(): string {
        return this.toString();
    }

    /**
     * Returns a copy of this date-time with the given local date-time, keeping the
     * time-zone and preferring the current offset when the result is ambiguous.
     */
    private resolveLocal(dateTime: LocalDateTime): ZonedDateTime {
        return ZonedDateTime.of(dateTime, this.zone, this.offset);
    }

    /**
     * Returns a copy of this date-time with the given local date-time read in the
     * current offset, keeping the time-zone and re-deriving the offset from the instant.
     */
    private resolveInstant(dateTime: LocalDateTime): ZonedDateTime {
        return ZonedDateTime.ofResolved(dateTime, this.offset, this.zone);
    }
}
