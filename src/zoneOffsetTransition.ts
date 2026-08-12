import {Duration} from './duration';
import type {Instant} from './instant';
import {LocalDateTime} from './localDateTime';
import {addExact} from './math';
import type {ZoneOffset} from './timeZone';

/**
 * A transition between two offsets caused by a discontinuity in the local time-line.
 *
 * A transition is either a gap or an overlap:
 *
 * - A gap occurs where there are local date-times that do not exist, which is
 *   typically the case when clocks move forward for daylight savings.
 * - An overlap occurs where there are local date-times that exist twice, which is
 *   typically the case when clocks move back.
 */
export class ZoneOffsetTransition {
    /**
     * The local date-time at the transition, expressed with the offset before it.
     */
    private readonly dateTime: LocalDateTime;

    /**
     * The offset before the transition.
     */
    private readonly offsetBefore: ZoneOffset;

    /**
     * The offset after the transition.
     */
    private readonly offsetAfter: ZoneOffset;

    /**
     * Initializes a transition.
     */
    private constructor(dateTime: LocalDateTime, offsetBefore: ZoneOffset, offsetAfter: ZoneOffset) {
        this.dateTime = dateTime;
        this.offsetBefore = offsetBefore;
        this.offsetAfter = offsetAfter;
    }

    /**
     * Creates a transition from the local date-time at which it occurs.
     *
     * @param dateTime     The local date-time at the transition, expressed with the offset before it.
     * @param offsetBefore The offset before the transition.
     * @param offsetAfter  The offset after the transition.
     *
     * @throws {Error} If the offsets are equal, the date-time is not truncated to second
     *                 precision, or the date-time after the transition is out of range.
     */
    public static of(
        dateTime: LocalDateTime,
        offsetBefore: ZoneOffset,
        offsetAfter: ZoneOffset,
    ): ZoneOffsetTransition {
        if (offsetBefore.equals(offsetAfter)) {
            throw new Error('The offset before and after the transition cannot be the same.');
        }

        if (dateTime.getNano() !== 0) {
            throw new Error('The time must be truncated to second precision.');
        }

        const duration = offsetAfter.getTotalSeconds() - offsetBefore.getTotalSeconds();

        try {
            dateTime.plusSeconds(duration);
        } catch {
            const kind = duration > 0 ? 'gap' : 'overlap';

            throw new Error(
                `The local date-time after the ${kind} at ${dateTime.toString()} `
                + `from ${offsetBefore.toString()} to ${offsetAfter.toString()} `
                + 'exceeds the supported date-time range.',
            );
        }

        return new ZoneOffsetTransition(dateTime, offsetBefore, offsetAfter);
    }

    /**
     * Creates a transition from the epoch second at which it occurs.
     *
     * @param epochSecond  The number of seconds from the epoch of 1970-01-01T00:00:00Z.
     * @param offsetBefore The offset before the transition.
     * @param offsetAfter  The offset after the transition.
     *
     * @throws {Error} If the offsets are equal, or the transition is out of range.
     */
    public static ofEpochSecond(
        epochSecond: number,
        offsetBefore: ZoneOffset,
        offsetAfter: ZoneOffset,
    ): ZoneOffsetTransition {
        return ZoneOffsetTransition.of(
            LocalDateTime.ofEpochSecond(addExact(epochSecond, offsetBefore.getTotalSeconds())),
            offsetBefore,
            offsetAfter,
        );
    }

    /**
     * Returns the instant at which the transition occurs.
     */
    public getInstant(): Instant {
        return this.dateTime.toInstant(this.offsetBefore);
    }

    /**
     * Returns the local date-time at the transition, expressed with the offset before it.
     *
     * This is the first date-time after the discontinuity for a gap, and the first
     * date-time that is repeated for an overlap.
     */
    public getDateTimeBefore(): LocalDateTime {
        return this.dateTime;
    }

    /**
     * Returns the local date-time at the transition, expressed with the offset after it.
     *
     * This is the first date-time after the discontinuity for an overlap, and the first
     * date-time that is skipped for a gap.
     */
    public getDateTimeAfter(): LocalDateTime {
        return this.dateTime.plusSeconds(this.getDurationSeconds());
    }

    /**
     * Returns the offset before the transition.
     */
    public getOffsetBefore(): ZoneOffset {
        return this.offsetBefore;
    }

    /**
     * Returns the offset after the transition.
     */
    public getOffsetAfter(): ZoneOffset {
        return this.offsetAfter;
    }

    /**
     * Returns the size of the gap or overlap.
     */
    public getDuration(): Duration {
        return Duration.ofSeconds(this.getDurationSeconds());
    }

    /**
     * Checks whether this transition represents a gap in the local time-line.
     */
    public isGap(): boolean {
        return this.getDurationSeconds() > 0;
    }

    /**
     * Checks whether this transition represents an overlap in the local time-line.
     */
    public isOverlap(): boolean {
        return this.getDurationSeconds() < 0;
    }

    /**
     * Checks whether the given offset is valid during this transition.
     *
     * No offset is valid during a gap, as the local date-times do not exist.
     *
     * @param offset The offset to check.
     */
    public isValidOffset(offset: ZoneOffset): boolean {
        if (this.isGap()) {
            return false;
        }

        return this.offsetBefore.equals(offset) || this.offsetAfter.equals(offset);
    }

    /**
     * Returns the offsets that are valid during this transition.
     *
     * The list is empty for a gap, and holds both offsets for an overlap.
     */
    public getValidOffsets(): ZoneOffset[] {
        if (this.isGap()) {
            return [];
        }

        return [this.offsetBefore, this.offsetAfter];
    }

    /**
     * Checks whether this transition overlaps another on the local time-line.
     *
     * @param transition The transition to check.
     */
    public intersects(transition: ZoneOffsetTransition): boolean {
        const [start, end] = this.getLocalRange();
        const [otherStart, otherEnd] = transition.getLocalRange();

        return start.isBeforeOrEqual(otherEnd) && otherStart.isBeforeOrEqual(end);
    }

    /**
     * Returns the earliest local date-time affected by this transition.
     */
    public getEarliestDateTime(): LocalDateTime {
        if (this.isGap()) {
            return this.getDateTimeBefore();
        }

        return this.getDateTimeAfter();
    }

    /**
     * Returns the latest local date-time affected by this transition.
     */
    public getLatestDateTime(): LocalDateTime {
        if (this.isGap()) {
            return this.getDateTimeAfter();
        }

        return this.getDateTimeBefore();
    }

    /**
     * Returns the number of seconds from the epoch at which the transition occurs.
     */
    public toEpochSecond(): number {
        return this.getInstant().getSeconds();
    }

    /**
     * Compares this transition to another for order, by the instant at which they occur.
     *
     * @param transition The transition to compare.
     */
    public compare(transition: ZoneOffsetTransition): number {
        return this.getInstant().compare(transition.getInstant());
    }

    /**
     * Checks whether this transition is equal to another.
     *
     * @param transition The transition to compare.
     */
    public equals(transition: ZoneOffsetTransition): boolean {
        return this.dateTime.equals(transition.dateTime)
            && this.offsetBefore.equals(transition.offsetBefore)
            && this.offsetAfter.equals(transition.offsetAfter);
    }

    /**
     * Returns the string representation of this transition.
     */
    public toString(): string {
        const kind = this.isGap() ? 'Gap' : 'Overlap';

        return `Transition[${kind} at ${this.dateTime.toString()}${this.offsetBefore.toString()}`
            + ` to ${this.offsetAfter.toString()}]`;
    }

    /**
     * Returns the range of local date-times affected by this transition, in ascending order.
     */
    private getLocalRange(): [LocalDateTime, LocalDateTime] {
        if (this.isOverlap()) {
            return [this.getDateTimeAfter(), this.getDateTimeBefore()];
        }

        return [this.getDateTimeBefore(), this.getDateTimeAfter()];
    }

    /**
     * Returns the size of the gap or overlap in seconds.
     */
    private getDurationSeconds(): number {
        return this.offsetAfter.getTotalSeconds() - this.offsetBefore.getTotalSeconds();
    }
}
