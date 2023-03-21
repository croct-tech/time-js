import {Instant} from './instant';

export class TimeInterval {
    private readonly start: Instant;

    private readonly end: Instant;

    private constructor(start: Instant, end: Instant) {
        this.start = start;
        this.end = end;
    }

    /**
     * Returns an interval over the whole time-line.
     */
    public static all(): TimeInterval {
        return new TimeInterval(Instant.MIN, Instant.MAX);
    }

    /**
     * Returns an interval from the start and end instant.
     */
    public static between(startInclusive: Instant, endExclusive: Instant): TimeInterval {
        if (endExclusive.isBefore(startInclusive)) {
            throw new Error('The end instant must be equal or after start instant.');
        }

        return new TimeInterval(startInclusive, endExclusive);
    }

    /**
     * Parses an interval from its ISO-8601 representation.
     */
    public static parse(value: string): TimeInterval {
        const [start, end] = value.split('/');

        return TimeInterval.between(Instant.parse(start), Instant.parse(end));
    }

    /**
     * Returns an interval with a specified start instant and unbounded end.
     */
    public static startingAt(startInclusive: Instant): TimeInterval {
        return TimeInterval.all().withStart(startInclusive);
    }

    /**
     * Returns an interval with a specified end instant and unbounded start.
     */
    public static endingAt(endExclusive: Instant): TimeInterval {
        return TimeInterval.all().withEnd(endExclusive);
    }

    /**
     * Creates a copy of this interval with a given start instant.
     */
    public withStart(startInclusive: Instant): TimeInterval {
        return TimeInterval.between(startInclusive, this.end);
    }

    /**
     * Creates a copy of this interval with a given end instant.
     */
    public withEnd(endExclusive: Instant): TimeInterval {
        return TimeInterval.between(this.start, endExclusive);
    }

    /**
     * Gets the start of this time interval, inclusive.
     */
    public getStart(): Instant {
        return this.start;
    }

    /**
     * Gets the end of this time interval, exclusive.
     */
    public getEnd(): Instant {
        return this.end;
    }

    /**
     * Checks if the start instant is equal to the end instant.
     */
    public isEmpty(): boolean {
        return this.start.equals(this.end);
    }

    /**
     * Checks if the start of the interval is unbounded.
     */
    public isUnboundedStart(): boolean {
        return this.start.equals(Instant.MIN);
    }

    /**
     * Checks if the end of the interval is unbounded.
     */
    public isUnboundedEnd(): boolean {
        return this.end.equals(Instant.MAX);
    }

    /**
     * Checks if the bounds of a given interval are within the bounds of this interval.
     */
    public encloses(other: TimeInterval): boolean {
        return this.start.isBeforeOrEqual(other.start) && this.end.isAfterOrEqual(other.end);
    }

    /**
     * Checks if the end of this interval is the start of a given interval, or vice versa.
     */
    public abuts(other: TimeInterval): boolean {
        return this.start.equals(other.end) || this.end.equals(other.start);
    }

    /**
     * Checks if the two intervals have an enclosed interval in common, even if that interval is empty.
     */
    public isConnected(other: TimeInterval): boolean {
        return this.equals(other) || (this.start.isBeforeOrEqual(other.end) && this.end.isAfterOrEqual(other.start));
    }

    /**
     * Checks if the two intervals share some part of the time-line.
     */
    public overlaps(other: TimeInterval): boolean {
        return this.equals(other) || (this.start.isBefore(other.end) && this.end.isAfter(other.start));
    }

    /**
     * Calculates the interval that is the intersection of this interval and a given interval.
     */
    public intersection(other: TimeInterval): TimeInterval {
        if (!this.isConnected(other)) {
            throw new Error('The intervals are not connected.');
        }

        if (this.start.isAfterOrEqual(other.start) && this.end.isBefore(other.end)) {
            return this;
        }

        if (other.start.isAfterOrEqual(this.start) && other.end.isBeforeOrEqual(this.end)) {
            return other;
        }

        return TimeInterval.between(
            this.start.isAfterOrEqual(other.start) ? this.start : other.start,
            this.end.isBeforeOrEqual(other.end) ? this.end : other.end,
        );
    }

    /**
     * Calculates the interval that is the union of this interval and a given interval.
     */
    public union(other: TimeInterval): TimeInterval {
        if (!this.isConnected(other)) {
            throw new Error('The intervals are not connected.');
        }

        if (this.start.isAfterOrEqual(other.start) && this.end.isBefore(other.end)) {
            return other;
        }

        if (other.start.isAfterOrEqual(this.start) && other.end.isBeforeOrEqual(this.end)) {
            return this;
        }

        return TimeInterval.between(
            this.start.isAfterOrEqual(other.start) ? other.start : this.start,
            this.end.isBeforeOrEqual(other.end) ? other.end : this.end,
        );
    }

    /**
     * Calculates the smallest interval that encloses this interval and the specified interval.
     */
    public span(other: TimeInterval): TimeInterval {
        return TimeInterval.between(
            this.start.isAfterOrEqual(other.start) ? other.start : this.start,
            this.end.isBeforeOrEqual(other.end) ? other.end : this.end,
        );
    }

    /**
     * Checks if this interval starts after the end of a given interval.
     */
    public isAfter(other: TimeInterval): boolean {
        return this.start.isAfterOrEqual(other.end) && !this.equals(other);
    }

    /**
     * Checks if this interval starts before the start of a given interval.
     */
    public isBefore(other: TimeInterval): boolean {
        return this.end.isBeforeOrEqual(other.start) && !this.equals(other);
    }

    /**
     * Checks if this interval starts on or before a given instant.
     */
    public startsBefore(instant: Instant): boolean {
        return this.start.isBefore(instant);
    }

    /**
     * Checks if this interval starts at or before a given instant.
     */
    public startsAtOrBefore(instant: Instant): boolean {
        return this.start.isBeforeOrEqual(instant);
    }

    /**
     * Checks if this interval starts on or after a given instant.
     */
    public startsAfter(instant: Instant): boolean {
        return this.start.isAfter(instant);
    }

    /**
     * Checks if this interval starts at or after a given instant.
     */
    public startsAtOrAfter(instant: Instant): boolean {
        return this.start.isAfterOrEqual(instant);
    }

    /**
     * Checks if this interval ends on or before a given instant.
     */
    public endsBefore(instant: Instant): boolean {
        return this.end.isBefore(instant);
    }

    /**
     * Checks if this interval ends at or before a given instant.
     */
    public endsAtOrBefore(instant: Instant): boolean {
        return this.end.isBeforeOrEqual(instant);
    }

    /**
     * Checks if this interval ends on or after a given instant.
     */
    public endsAfter(instant: Instant): boolean {
        return this.end.isAfter(instant);
    }

    /**
     * Checks if this interval ends at or after a given instant.
     */
    public endsAtOrAfter(instant: Instant): boolean {
        return this.end.isAfterOrEqual(instant);
    }

    /**
     * Checks if this interval contains a given instant.
     */
    public contains(instant: Instant): boolean {
        return this.start.isBeforeOrEqual(instant) && this.end.isAfter(instant);
    }

    /**
     * Checks if this interval is equal a given interval.
     */
    public equals(other: unknown): boolean {
        return other instanceof TimeInterval && this.start.equals(other.start) && this.end.equals(other.end);
    }

    /**
     * Converts this instant range to a string interval in ISO-8601 format.
     */
    public toString(): string {
        return `${this.start.toString()}/${this.end.toString()}`;
    }

    /**
     * Serializes this instant range to a JSON value.
     */
    public toJSON(): string {
        return this.toString();
    }
}
