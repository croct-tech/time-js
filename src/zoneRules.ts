import type {Instant} from './instant';
import type {LocalDateTime} from './localDateTime';
import {LocalTime} from './localTime';
import {addExact, intDiv, multiplyExact} from './math';
import {ZoneOffset} from './timeZone';
import {ZoneOffsetTransition} from './zoneOffsetTransition';

/**
 * The rules defining how the offset of a time zone varies over time.
 *
 * Region-based rules are derived from the time-zone data of the JavaScript
 * runtime, which does not expose the underlying transition table. Consequently,
 * transitions are discovered by probing the offset around a point in time rather
 * than being read from a list, and the rules cannot report whether an offset is
 * a daylight savings offset or a standard one. The data is also only reachable for
 * the points in time a native date object can represent, which is a narrower range
 * than the one of an instant, so points beyond it are rejected.
 */
export abstract class ZoneRules {
    /**
     * The cache of region-based rules, keyed by time-zone ID.
     */
    private static REGION_RULES = new Map<string, ZoneRules>();

    /**
     * Creates rules for a fixed offset that never varies.
     *
     * @param offset The fixed offset from UTC/Greenwich.
     */
    public static ofFixed(offset: ZoneOffset): ZoneRules {
        return new FixedZoneRules(offset);
    }

    /**
     * Creates rules for a region-based time zone.
     *
     * Rules are cached per time-zone ID, as each instance holds a formatter that
     * is expensive to construct.
     *
     * @param id The time-zone ID.
     */
    public static ofRegion(id: string): ZoneRules {
        let rules = ZoneRules.REGION_RULES.get(id);

        if (rules === undefined) {
            rules = new IntlZoneRules(id);

            ZoneRules.REGION_RULES.set(id, rules);
        }

        return rules;
    }

    /**
     * Checks whether the offset is the same for all points in time.
     */
    public abstract isFixedOffset(): boolean;

    /**
     * Returns the offset that applies at the given instant.
     *
     * @param instant The instant to find the offset for.
     *
     * @throws {Error} If the instant is outside the range region-based rules support.
     */
    public abstract getOffset(instant: Instant): ZoneOffset;

    /**
     * Returns the offsets that are valid for the given local date-time.
     *
     * The result holds exactly one offset for a local date-time that occurs once,
     * no offsets for one that falls in a gap, and two offsets for one that falls in
     * an overlap, ordered from the offset before the transition to the offset after it.
     *
     * @param dateTime The local date-time to find the offsets for.
     *
     * @throws {Error} If the local date-time is outside the range region-based rules support.
     */
    public abstract getValidOffsets(dateTime: LocalDateTime): ZoneOffset[];

    /**
     * Returns the transition at the given local date-time, if any.
     *
     * The result is `null` unless the local date-time falls in a gap or an overlap.
     *
     * @param dateTime The local date-time to find the transition for.
     *
     * @throws {Error} If the local date-time is outside the range region-based rules support.
     */
    public abstract getTransition(dateTime: LocalDateTime): ZoneOffsetTransition | null;

    /**
     * Returns the first transition after the given instant, if any.
     *
     * Region-based rules search a bounded window into the future, and report no
     * transition beyond it. See {@link ZoneRules} for the rationale.
     *
     * @param instant The instant to search from, exclusive.
     *
     * @throws {Error} If the instant is outside the range region-based rules support.
     */
    public abstract getNextTransition(instant: Instant): ZoneOffsetTransition | null;

    /**
     * Returns the last transition before the given instant, if any.
     *
     * Region-based rules search a bounded window into the past, and report no
     * transition beyond it. See {@link ZoneRules} for the rationale.
     *
     * @param instant The instant to search from, exclusive.
     *
     * @throws {Error} If the instant is outside the range region-based rules support.
     */
    public abstract getPreviousTransition(instant: Instant): ZoneOffsetTransition | null;

    /**
     * Returns the string representation of these rules.
     */
    public abstract toString(): string;

    /**
     * Returns the offset that applies to the given local date-time.
     *
     * The offset before the transition is returned for a local date-time that falls
     * in either a gap or an overlap. For an overlap that is the earlier of the two
     * valid offsets, typically "summer" time. For a gap, where no offset is valid,
     * it is the offset that shifts the local date-time forward by the length of the
     * gap once it is converted to an instant and back.
     *
     * @param dateTime The local date-time to resolve the offset for.
     */
    public resolveOffset(dateTime: LocalDateTime): ZoneOffset {
        const offsets = this.getValidOffsets(dateTime);

        if (offsets.length > 0) {
            return offsets[0];
        }

        const transition = this.getTransition(dateTime);

        if (transition === null) {
            // A local date-time with no valid offset falls in a gap, which always has a
            // transition. Reaching this point means the time-zone data of the runtime
            // reported the two inconsistently.
            throw new Error(
                `Unable to resolve the offset of ${dateTime.toString()} in ${this.toString()}.`,
            );
        }

        return transition.getOffsetBefore();
    }

    /**
     * Checks whether the given offset is valid for the given local date-time.
     *
     * @param dateTime The local date-time to check.
     * @param offset   The offset to check.
     */
    public isValidOffset(dateTime: LocalDateTime, offset: ZoneOffset): boolean {
        return this.getValidOffsets(dateTime).some(candidate => candidate.equals(offset));
    }

    /**
     * Checks whether these rules are equal to another.
     *
     * @param rules The rules to compare.
     */
    public equals(rules: ZoneRules): boolean {
        return this === rules || this.toString() === rules.toString();
    }
}

/**
 * Rules for a time zone whose offset never varies.
 *
 * @internal
 */
class FixedZoneRules extends ZoneRules {
    /**
     * The fixed offset from UTC/Greenwich.
     */
    private readonly offset: ZoneOffset;

    public constructor(offset: ZoneOffset) {
        super();

        this.offset = offset;
    }

    public isFixedOffset(): boolean {
        return true;
    }

    public getOffset(): ZoneOffset {
        return this.offset;
    }

    public getValidOffsets(): ZoneOffset[] {
        return [this.offset];
    }

    public getTransition(): null {
        return null;
    }

    public getNextTransition(): null {
        return null;
    }

    public getPreviousTransition(): null {
        return null;
    }

    public toString(): string {
        return `FixedRules[${this.offset.toString()}]`;
    }
}

/**
 * Rules for a region-based time zone, derived from the runtime's time-zone data.
 *
 * @internal
 */
class IntlZoneRules extends ZoneRules {
    /**
     * The offsets probed around a local date-time to find its candidate offsets.
     *
     * The window spans two days on either side so that transitions which shift the
     * local time-line by a full day, such as the ones that moved Pacific/Apia and
     * Pacific/Kiritimati across the international date line, are still bracketed.
     */
    private static PROBE_OFFSETS?: number[];

    private static get PROBES(): number[] {
        IntlZoneRules.PROBE_OFFSETS ??= [
            -2 * LocalTime.SECONDS_PER_DAY,
            -LocalTime.SECONDS_PER_DAY,
            -intDiv(LocalTime.SECONDS_PER_DAY, 2),
            0,
            intDiv(LocalTime.SECONDS_PER_DAY, 2),
            LocalTime.SECONDS_PER_DAY,
            2 * LocalTime.SECONDS_PER_DAY,
        ];

        return IntlZoneRules.PROBE_OFFSETS;
    }

    /**
     * The window, in seconds, searched on either side of a local date-time
     * when locating the transition that affects it.
     */
    private static get TRANSITION_WINDOW(): number {
        return 2 * LocalTime.SECONDS_PER_DAY;
    }

    /**
     * The step, in seconds, between coarse probes when scanning for an adjacent
     * transition. Transitions are months apart in practice, so a week-long step
     * cannot skip over one.
     */
    private static get SCAN_STEP(): number {
        return 7 * LocalTime.SECONDS_PER_DAY;
    }

    /**
     * The distance, in seconds, scanned when searching for an adjacent transition.
     *
     * Five years covers any zone that observes daylight savings, while bounding the
     * cost for the many zones that have no further transition at all.
     */
    private static get SCAN_HORIZON(): number {
        return 5 * 365 * LocalTime.SECONDS_PER_DAY;
    }

    /**
     * The largest number of seconds representable by a native date object.
     */
    private static get MAX_DATE_SECOND(): number {
        return intDiv(8_640_000_000_000_000, LocalTime.MILLIS_PER_SECOND);
    }

    /**
     * The distance, in seconds, kept from the bounds of the native date range when
     * checking a local date-time.
     *
     * Resolving a local date-time reads the offset as far as the probing window from
     * it, and the offset it resolves to denotes an instant as far as the largest one
     * a zone can observe, eighteen hours. Neither reach compounds the other, so their
     * sum leaves room for both the reads and the instant they resolve to.
     */
    private static get LOCAL_MARGIN(): number {
        return (2 * LocalTime.SECONDS_PER_DAY) + (18 * LocalTime.SECONDS_PER_HOUR);
    }

    /**
     * A regular expression that matches the offset reported by the runtime.
     */
    private static PATTERN = /^GMT(?:(?<sign>[+-])(?<hours>\d{1,2}):(?<minutes>\d{2})(?::(?<seconds>\d{2}))?)?$/;

    /**
     * The time-zone ID.
     */
    private readonly id: string;

    /**
     * The formatter reporting the offset of the zone, lazily created.
     *
     * Constructing a formatter is an order of magnitude more expensive than using
     * one, so a single instance is reused for the lifetime of these rules.
     */
    private formatter?: Intl.DateTimeFormat;

    public constructor(id: string) {
        super();

        this.id = id;
    }

    public isFixedOffset(): boolean {
        return false;
    }

    public getOffset(instant: Instant): ZoneOffset {
        const second = instant.getSeconds();

        this.checkSupported(second, instant);

        return ZoneOffset.ofTotalSeconds(this.getOffsetAt(second));
    }

    public getValidOffsets(dateTime: LocalDateTime): ZoneOffset[] {
        const local = this.toSupportedEpochSecond(dateTime);

        return this.getCandidates(local)
            .filter(offset => this.getOffsetAt(local - offset) === offset)
            .map(offset => ZoneOffset.ofTotalSeconds(offset));
    }

    public getTransition(dateTime: LocalDateTime): ZoneOffsetTransition | null {
        const local = this.toSupportedEpochSecond(dateTime);
        const valid = this.getCandidates(local)
            .filter(offset => this.getOffsetAt(local - offset) === offset);

        if (valid.length === 1) {
            return null;
        }

        return this.findTransition(
            local - IntlZoneRules.TRANSITION_WINDOW,
            local + IntlZoneRules.TRANSITION_WINDOW,
        );
    }

    public getNextTransition(instant: Instant): ZoneOffsetTransition | null {
        const second = instant.getSeconds();

        this.checkSupported(second, instant);

        return this.scan(second, 1);
    }

    public getPreviousTransition(instant: Instant): ZoneOffsetTransition | null {
        const second = instant.getSeconds();

        this.checkSupported(second, instant);

        // Transitions occur on whole seconds, so the last second before the instant
        // is the second of the instant itself when it has a fraction, and the one
        // before it otherwise.
        return this.scan(instant.getNano() > 0 ? second : second - 1, -1);
    }

    public toString(): string {
        return `ZoneRules[${this.id}]`;
    }

    /**
     * Returns the local date-time as a number of seconds, read as if it were in UTC.
     *
     * @throws {Error} If the local date-time is outside the supported range.
     */
    private toSupportedEpochSecond(dateTime: LocalDateTime): number {
        const local = addExact(
            multiplyExact(dateTime.getLocalDate().toEpochDay(), LocalTime.SECONDS_PER_DAY),
            dateTime.getLocalTime().toSecondOfDay(),
        );

        this.checkSupported(local, dateTime, IntlZoneRules.LOCAL_MARGIN);

        return local;
    }

    /**
     * Checks that the given point in time is one the runtime can resolve an offset for.
     *
     * The time-zone data of the runtime is only reachable through a native date
     * object, whose range is narrower than the one of an instant. Rejecting the
     * points beyond it keeps these rules from reporting an offset that merely looks
     * plausible, as the offset of the closest representable point is unrelated to
     * the one in effect at a point hundreds of thousands of years away from it.
     *
     * @param epochSecond The number of seconds from the epoch to check.
     * @param point       The point in time the number of seconds was derived from.
     * @param margin      The distance to keep from the bounds of the native date range.
     *
     * @throws {Error} If the point in time is outside the supported range.
     */
    private checkSupported(
        epochSecond: number,
        point: Instant | LocalDateTime,
        margin = 0,
    ): void {
        if (Math.abs(epochSecond) > IntlZoneRules.MAX_DATE_SECOND - margin) {
            throw new Error(
                `Unable to determine the offset of the timezone ${this.id} at `
                + `${point.toString()}, as it is outside the range the runtime supports.`,
            );
        }
    }

    /**
     * Returns the distinct offsets observed around the given local date-time,
     * ordered from the earliest probe to the latest.
     */
    private getCandidates(local: number): number[] {
        const candidates: number[] = [];

        for (const probe of IntlZoneRules.PROBES) {
            const offset = this.getOffsetAt(local + probe);

            if (!candidates.includes(offset)) {
                candidates.push(offset);
            }
        }

        return candidates;
    }

    /**
     * Scans for the closest transition in the given direction, if any.
     *
     * The offset observed at the given point is the reference the scan compares
     * against, so a transition falling exactly on it is reported when scanning
     * backward, but not when scanning forward.
     *
     * @param from      The number of seconds from the epoch to scan from.
     * @param direction Positive to scan forward, negative to scan backward.
     */
    private scan(from: number, direction: number): ZoneOffsetTransition | null {
        const offset = this.getOffsetAt(from);
        const limit = from + (direction * IntlZoneRules.SCAN_HORIZON);
        let near = from;

        while (near !== limit) {
            const far = direction > 0
                ? Math.min(near + IntlZoneRules.SCAN_STEP, limit)
                : Math.max(near - IntlZoneRules.SCAN_STEP, limit);

            if (this.getOffsetAt(far) !== offset) {
                return direction > 0 ? this.findTransition(near, far) : this.findTransition(far, near);
            }

            near = far;
        }

        return null;
    }

    /**
     * Locates the transition between two points in time with differing offsets.
     *
     * @param start The number of seconds from the epoch to search from.
     * @param end   The number of seconds from the epoch to search to.
     */
    private findTransition(start: number, end: number): ZoneOffsetTransition | null {
        const offsetBefore = this.getOffsetAt(start);

        if (this.getOffsetAt(end) === offsetBefore) {
            return null;
        }

        let low = start;
        let high = end;

        while (low + 1 < high) {
            const middle = low + intDiv(high - low, 2);

            if (this.getOffsetAt(middle) === offsetBefore) {
                low = middle;
            } else {
                high = middle;
            }
        }

        return ZoneOffsetTransition.ofEpochSecond(
            high,
            ZoneOffset.ofTotalSeconds(offsetBefore),
            ZoneOffset.ofTotalSeconds(this.getOffsetAt(high)),
        );
    }

    /**
     * Returns the offset in seconds that applies at the given number of seconds
     * from the epoch.
     *
     * Points beyond the range of a native date object are clamped to the closest
     * representable one. Only the scan for an adjacent transition can reach that far,
     * as the reads around a local date-time are kept within the range by the margin
     * checked upfront. Clamping merely makes the scan see a constant offset past the
     * bound, so it reports no transition there rather than a wrong one.
     */
    private getOffsetAt(epochSecond: number): number {
        const second = Math.max(
            -IntlZoneRules.MAX_DATE_SECOND,
            Math.min(IntlZoneRules.MAX_DATE_SECOND, epochSecond),
        );

        this.formatter ??= new Intl.DateTimeFormat('en-US', {
            timeZone: this.id,
            timeZoneName: 'longOffset',
        });

        const parts = this.formatter.formatToParts(new Date(second * LocalTime.MILLIS_PER_SECOND));
        const name = parts.find(part => part.type === 'timeZoneName')?.value ?? '';
        const groups = name.match(IntlZoneRules.PATTERN)?.groups;

        if (groups === undefined) {
            throw new Error(`Unable to determine the offset of the timezone ${this.id}.`);
        }

        if (groups.sign === undefined) {
            return 0;
        }

        const sign = groups.sign === '-' ? -1 : 1;

        return sign * (
            (Number.parseInt(groups.hours, 10) * LocalTime.SECONDS_PER_HOUR)
            + (Number.parseInt(groups.minutes, 10) * LocalTime.SECONDS_PER_MINUTE)
            + Number.parseInt(groups.seconds ?? '0', 10)
        );
    }
}
