import {Instant, TimeInterval} from '../src';

describe('A value object representing a time interval', () => {
    it('can create an interval over the whole time-line', () => {
        const interval = TimeInterval.all();

        expect(interval.getStart()).toBe(Instant.MIN);
        expect(interval.getEnd()).toBe(Instant.MAX);
    });

    it('can be created from a start and an end instant', () => {
        const start = Instant.ofEpochSecond(0);
        const end = Instant.ofEpochSecond(1);
        const interval = TimeInterval.between(start, end);

        expect(interval.getStart().equals(start)).toBe(true);
        expect(interval.getEnd().equals(end)).toBe(true);
    });

    it('cannot be created from a start and an end instant if the end is before the start', () => {
        const start = Instant.ofEpochSecond(1);
        const end = Instant.ofEpochSecond(0);

        expect(() => TimeInterval.between(start, end))
            .toThrow('The end instant must be equal or after start instant.');
    });

    it('can be created with a specified start instant and unbounded end', () => {
        const start = Instant.ofEpochSecond(0);
        const interval = TimeInterval.startingAt(start);

        expect(interval.getStart().equals(start)).toBe(true);
        expect(interval.getEnd().equals(Instant.MAX)).toBe(true);
    });

    it('can be created with a specified end instant and unbounded start', () => {
        const end = Instant.ofEpochSecond(0);
        const interval = TimeInterval.endingAt(end);

        expect(interval.getStart().equals(Instant.MIN)).toBe(true);
        expect(interval.getEnd().equals(end)).toBe(true);
    });

    it('has a start instant', () => {
        const interval = TimeInterval.all();

        expect(interval.getStart().equals(Instant.MIN)).toBe(true);
    });

    it('has an end instant', () => {
        const interval = TimeInterval.all();

        expect(interval.getEnd().equals(Instant.MAX)).toBe(true);
    });

    it('can provide a copy with a given start instant', () => {
        const instant = Instant.ofEpochSecond(0);
        const interval = TimeInterval.all();
        const newInterval = interval.withStart(instant);

        expect(interval.getStart().equals(Instant.MIN)).toBe(true);
        expect(interval.getEnd().equals(Instant.MAX)).toBe(true);
        expect(newInterval.getStart().equals(instant)).toBe(true);
        expect(newInterval.getEnd().equals(Instant.MAX)).toBe(true);
    });

    it('can provide a copy with a given end instant', () => {
        const instant = Instant.ofEpochSecond(0);
        const interval = TimeInterval.all();
        const newInterval = interval.withEnd(instant);

        expect(interval.getStart().equals(Instant.MIN)).toBe(true);
        expect(interval.getEnd().equals(Instant.MAX)).toBe(true);
        expect(newInterval.getStart().equals(Instant.MIN)).toBe(true);
        expect(newInterval.getEnd().equals(instant)).toBe(true);
    });

    it('can determine whether the interval is empty', () => {
        expect(TimeInterval.all().isEmpty()).toBe(false);
        expect(TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(0)).isEmpty()).toBe(true);
    });

    it('can determine whether the start is unbounded', () => {
        expect(TimeInterval.all().isUnboundedStart()).toBe(true);
        expect(TimeInterval.between(Instant.ofEpochSecond(0), Instant.MAX).isUnboundedStart()).toBe(false);
    });

    it('can determine whether the end is unbounded', () => {
        expect(TimeInterval.all().isUnboundedEnd()).toBe(true);
        expect(TimeInterval.between(Instant.MIN, Instant.ofEpochSecond(0)).isUnboundedEnd()).toBe(false);
    });

    it.each(Object.entries({
        '[1, 2] encloses the interval [1, 2]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            expected: true,
        },
        '[1, 2] encloses the interval [0, 2]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(2)),
            expected: false,
        },
        '[1, 2] encloses the interval [1, 3]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(3)),
            expected: false,
        },
        '[1, 2] encloses the interval [0, 3]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(3)),
            expected: false,
        },
        '[1, 2] encloses the interval [0, 1]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(1)),
            expected: false,
        },
        '[1, 2] encloses the interval [2, 3]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(2), Instant.ofEpochSecond(3)),
            expected: false,
        },
        '[1, 2] encloses the interval [3, 4]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(3), Instant.ofEpochSecond(4)),
            expected: false,
        },
        '[1, 2] encloses the interval [1, 1]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            expected: true,
        },
        '[1, 2] encloses the interval [2, 2]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(2), Instant.ofEpochSecond(2)),
            expected: true,
        },
        '[1, 1] encloses the interval [1, 1]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            expected: true,
        },
    }))('can determine whether the interval %s', (_, scenario) => {
        const {interval, other, expected} = scenario;

        expect(interval.encloses(other)).toBe(expected);
    });

    it.each(Object.entries({
        '[1, 2] abuts the interval [1, 2]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            expected: false,
        },
        '[1, 2] abuts the interval [0, 2]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(2)),
            expected: false,
        },
        '[1, 2] abuts the interval [1, 3]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(3)),
            expected: false,
        },
        '[1, 2] abuts the interval [0, 3]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(3)),
            expected: false,
        },
        '[1, 2] abuts the interval [0, 1]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(1)),
            expected: true,
        },
        '[1, 2] abuts the interval [2, 3]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(2), Instant.ofEpochSecond(3)),
            expected: true,
        },
        '[1, 2] abuts the interval [3, 4]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(3), Instant.ofEpochSecond(4)),
            expected: false,
        },
        '[1, 2] abuts the interval [1, 1]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            expected: true,
        },
        '[1, 2] abuts the interval [2, 2]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(2), Instant.ofEpochSecond(2)),
            expected: true,
        },
        '[1, 1] abuts the interval [1, 1]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            expected: true,
        },
    }))('can determine whether the interval %s', (_, scenario) => {
        const {interval, other, expected} = scenario;

        expect(interval.abuts(other)).toBe(expected);
    });

    it.each(Object.entries({
        '[1, 2] is connected to interval [1, 2]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            expected: true,
        },
        '[1, 2] is connected to interval [0, 2]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(2)),
            expected: true,
        },
        '[1, 2] is connected to interval [1, 3]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(3)),
            expected: true,
        },
        '[1, 2] is connected to interval [0, 3]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(3)),
            expected: true,
        },
        '[1, 2] is connected to interval [0, 1]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(1)),
            expected: true,
        },
        '[1, 2] is connected to interval [2, 3]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(2), Instant.ofEpochSecond(3)),
            expected: true,
        },
        '[1, 2] is connected to interval [3, 4]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(3), Instant.ofEpochSecond(4)),
            expected: false,
        },
        '[1, 2] is connected to interval [1, 1]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            expected: true,
        },
        '[1, 2] is connected to interval [2, 2]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(2), Instant.ofEpochSecond(2)),
            expected: true,
        },
        '[1, 1] is connected to interval [1, 1]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            expected: true,
        },
    }))('can determine whether the interval %s', (_, scenario) => {
        const {interval, other, expected} = scenario;

        expect(interval.isConnected(other)).toBe(expected);
    });

    it.each(Object.entries({
        '[1, 2] overlaps the interval [1, 2]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            expected: true,
        },
        '[1, 2] overlaps the interval [0, 2]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(2)),
            expected: true,
        },
        '[1, 2] overlaps the interval [1, 3]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(3)),
            expected: true,
        },
        '[1, 2] overlaps the interval [0, 3]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(3)),
            expected: true,
        },
        '[1, 2] overlaps the interval [0, 1]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(1)),
            expected: false,
        },
        '[1, 2] overlaps the interval [2, 3]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(2), Instant.ofEpochSecond(3)),
            expected: false,
        },
        '[1, 2] overlaps the interval [3, 4]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(3), Instant.ofEpochSecond(4)),
            expected: false,
        },
        '[1, 2] overlaps the interval [1, 1]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            expected: false,
        },
        '[1, 2] overlaps the interval [2, 2]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(2), Instant.ofEpochSecond(2)),
            expected: false,
        },
        '[1, 1] overlaps the interval [1, 1]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            expected: true,
        },
    }))('can determine whether the interval %s', (_, scenario) => {
        const {interval, other, expected} = scenario;

        expect(interval.overlaps(other)).toBe(expected);
    });

    it.each(Object.entries({
        '[1, 2] and [1, 2]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            expected: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
        },
        '[1, 2] and [0, 2]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(2)),
            expected: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
        },
        '[1, 2] and [1, 3]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(3)),
            expected: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
        },
        '[1, 2] and [0, 3]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(3)),
            expected: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
        },
        '[1, 2] and [0, 1]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(1)),
            expected: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
        },
        '[1, 2] and [2, 3]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(2), Instant.ofEpochSecond(3)),
            expected: TimeInterval.between(Instant.ofEpochSecond(2), Instant.ofEpochSecond(2)),
        },
        '[1, 2] and [1, 1]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            expected: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
        },
        '[1, 2] and [2, 2]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(2), Instant.ofEpochSecond(2)),
            expected: TimeInterval.between(Instant.ofEpochSecond(2), Instant.ofEpochSecond(2)),
        },
        '[1, 1] and [1, 1]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            expected: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
        },
    }))('can compute the interval intersection from %s', (_, scenario) => {
        const {interval, other, expected} = scenario;

        expect(interval.intersection(other).equals(expected)).toBe(true);
    });

    it('cannot compute the intersection of disconnected intervals', () => {
        const interval = TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2));
        const other = TimeInterval.between(Instant.ofEpochSecond(3), Instant.ofEpochSecond(4));

        expect(() => interval.intersection(other)).toThrow('The intervals are not connected.');
    });

    it.each(Object.entries({
        '[1, 2] and [1, 2]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            expected: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
        },
        '[1, 2] and [0, 2]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(2)),
            expected: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(2)),
        },
        '[1, 2] and [1, 3]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(3)),
            expected: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(3)),
        },
        '[1, 2] and [0, 3]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(3)),
            expected: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(3)),
        },
        '[1, 2] and [0, 1]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(1)),
            expected: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(2)),
        },
        '[1, 2] and [2, 3]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(2), Instant.ofEpochSecond(3)),
            expected: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(3)),
        },
        '[1, 2] and [1, 1]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            expected: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
        },
        '[1, 2] and [2, 2]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(2), Instant.ofEpochSecond(2)),
            expected: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
        },
        '[1, 1] and [1, 1]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            expected: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
        },
    }))('can compute the interval union from %s', (_, scenario) => {
        const {interval, other, expected} = scenario;

        expect(interval.union(other).equals(expected)).toBe(true);
    });

    it('cannot compute the union of disconnected intervals', () => {
        const interval = TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2));
        const other = TimeInterval.between(Instant.ofEpochSecond(3), Instant.ofEpochSecond(4));

        expect(() => interval.union(other)).toThrow('The intervals are not connected.');
    });

    it.each(Object.entries({
        '[1, 2] and [1, 2]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            expected: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
        },
        '[1, 2] and [0, 2]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(2)),
            expected: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(2)),
        },
        '[1, 2] and [1, 3]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(3)),
            expected: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(3)),
        },
        '[1, 2] and [0, 3]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(3)),
            expected: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(3)),
        },
        '[1, 2] and [0, 1]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(1)),
            expected: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(2)),
        },
        '[1, 2] and [2, 3]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(2), Instant.ofEpochSecond(3)),
            expected: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(3)),
        },
        '[1, 2] and [3, 4]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(3), Instant.ofEpochSecond(4)),
            expected: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(4)),
        },
        '[1, 2] and [1, 1]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            expected: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
        },
        '[1, 2] and [2, 2]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(2), Instant.ofEpochSecond(2)),
            expected: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
        },
        '[1, 1] and [1, 1]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            expected: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
        },
    }))('can compute the smallest interval that encloses the intervals %s', (_, scenario) => {
        const {interval, other, expected} = scenario;

        expect(interval.span(other).equals(expected)).toBe(true);
    });

    it.each(Object.entries({
        '[1, 2] is after the interval [1, 2]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            expected: false,
        },
        '[1, 2] is after the interval [0, 2]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(2)),
            expected: false,
        },
        '[1, 2] is after the interval [1, 3]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(3)),
            expected: false,
        },
        '[1, 2] is after the interval [0, 3]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(3)),
            expected: false,
        },
        '[1, 2] is after the interval [0, 1]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(1)),
            expected: true,
        },
        '[1, 2] is after the interval [2, 3]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(2), Instant.ofEpochSecond(3)),
            expected: false,
        },
        '[1, 2] is after the interval [3, 4]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(3), Instant.ofEpochSecond(4)),
            expected: false,
        },
        '[1, 2] is after  the interval[1, 1]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            expected: true,
        },
        '[1, 2] is after the interval [2, 2]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(2), Instant.ofEpochSecond(2)),
            expected: false,
        },
        '[1, 1] is after the interval [1, 1]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            expected: false,
        },
    }))('can determine whether the interval %s', (_, scenario) => {
        const {interval, other, expected} = scenario;

        expect(interval.isAfter(other)).toBe(expected);
    });

    it.each(Object.entries({
        '[1, 2] is before the interval [1, 2]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            expected: false,
        },
        '[1, 2] is before the interval [0, 2]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(2)),
            expected: false,
        },
        '[1, 2] is before the interval [1, 3]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(3)),
            expected: false,
        },
        '[1, 2] is before the interval [0, 3]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(3)),
            expected: false,
        },
        '[1, 2] is before the interval [0, 1]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(0), Instant.ofEpochSecond(1)),
            expected: false,
        },
        '[1, 2] is before the interval [2, 3]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(2), Instant.ofEpochSecond(3)),
            expected: true,
        },
        '[1, 2] is before the interval [3, 4]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(3), Instant.ofEpochSecond(4)),
            expected: true,
        },
        '[1, 2] is before the interval [1, 1]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            expected: false,
        },
        '[1, 2] is before the interval [2, 2]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            other: TimeInterval.between(Instant.ofEpochSecond(2), Instant.ofEpochSecond(2)),
            expected: true,
        },
        '[1, 1] is before the interval [1, 1]': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            other: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            expected: false,
        },
    }))('can determine whether the interval %s', (_, scenario) => {
        const {interval, other, expected} = scenario;

        expect(interval.isBefore(other)).toBe(expected);
    });

    it.each(Object.entries({
        '[1, 2] starts before the instant 0': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(0),
            expected: false,
        },
        '[1, 2] starts before the instant 1': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(1),
            expected: false,
        },
        '[1, 2] starts before the instant 2': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(2),
            expected: true,
        },
        '[1, 2] starts before the instant 3': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(3),
            expected: true,
        },
        '[1, 1] starts before the instant 1': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            instant: Instant.ofEpochSecond(1),
            expected: false,
        },
    }))('can determine whether the interval %s', (_, scenario) => {
        const {interval, instant, expected} = scenario;

        expect(interval.startsBefore(instant)).toBe(expected);
    });

    it.each(Object.entries({
        '[1, 2] starts at or before the instant 0': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(0),
            expected: false,
        },
        '[1, 2] starts at or before the instant 1': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(1),
            expected: true,
        },
        '[1, 2] starts at or before the instant 2': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(2),
            expected: true,
        },
        '[1, 2] starts at or before the instant 3': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(3),
            expected: true,
        },
        '[1, 1] starts at or before the instant 1': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            instant: Instant.ofEpochSecond(1),
            expected: true,
        },
    }))('can determine whether the interval %s', (_, scenario) => {
        const {interval, instant, expected} = scenario;

        expect(interval.startsAtOrBefore(instant)).toBe(expected);
    });

    it.each(Object.entries({
        '[1, 2] starts after the instant 0': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(0),
            expected: true,
        },
        '[1, 2] starts after the instant 1': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(1),
            expected: false,
        },
        '[1, 2] starts after the instant 2': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(2),
            expected: false,
        },
        '[1, 2] starts after the instant 3': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(3),
            expected: false,
        },
        '[1, 1] starts after the instant 1': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            instant: Instant.ofEpochSecond(1),
            expected: false,
        },
    }))('can determine whether the interval %s', (_, scenario) => {
        const {interval, instant, expected} = scenario;

        expect(interval.startsAfter(instant)).toBe(expected);
    });

    it.each(Object.entries({
        '[1, 2] starts at or after the instant 0': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(0),
            expected: true,
        },
        '[1, 2] starts at or after the instant 1': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(1),
            expected: true,
        },
        '[1, 2] starts at or after the instant 2': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(2),
            expected: false,
        },
        '[1, 2] starts at or after the instant 3': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(3),
            expected: false,
        },
        '[1, 1] starts at or after the instant 1': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            instant: Instant.ofEpochSecond(1),
            expected: true,
        },
    }))('can determine whether the interval %s', (_, scenario) => {
        const {interval, instant, expected} = scenario;

        expect(interval.startsAtOrAfter(instant)).toBe(expected);
    });

    it.each(Object.entries({
        '[1, 2] ends before the instant 0': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(0),
            expected: false,
        },
        '[1, 2] ends before the instant 1': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(1),
            expected: false,
        },
        '[1, 2] ends before the instant 2': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(2),
            expected: false,
        },
        '[1, 2] ends before the instant 3': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(3),
            expected: true,
        },
        '[1, 1] ends before the instant 1': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            instant: Instant.ofEpochSecond(1),
            expected: false,
        },
    }))('can determine whether the interval %s', (_, scenario) => {
        const {interval, instant, expected} = scenario;

        expect(interval.endsBefore(instant)).toBe(expected);
    });

    it.each(Object.entries({
        '[1, 2] ends at or before the instant 0': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(0),
            expected: false,
        },
        '[1, 2] ends at or before the instant 1': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(1),
            expected: false,
        },
        '[1, 2] ends at or before the instant 2': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(2),
            expected: true,
        },
        '[1, 2] ends at or before the instant 3': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(3),
            expected: true,
        },
        '[1, 1] ends at or before the instant 1': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            instant: Instant.ofEpochSecond(1),
            expected: true,
        },
    }))('can determine whether the interval %s', (_, scenario) => {
        const {interval, instant, expected} = scenario;

        expect(interval.endsAtOrBefore(instant)).toBe(expected);
    });

    it.each(Object.entries({
        '[1, 2] ends after the instant 0': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(0),
            expected: true,
        },
        '[1, 2] ends after the instant 1': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(1),
            expected: true,
        },
        '[1, 2] ends after the instant 2': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(2),
            expected: false,
        },
        '[1, 2] ends after the instant 3': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(3),
            expected: false,
        },
        '[1, 1] ends after the instant 1': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            instant: Instant.ofEpochSecond(1),
            expected: false,
        },
    }))('can determine whether the interval %s', (_, scenario) => {
        const {interval, instant, expected} = scenario;

        expect(interval.endsAfter(instant)).toBe(expected);
    });

    it.each(Object.entries({
        '[1, 2] ends at or after the instant 0': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(0),
            expected: true,
        },
        '[1, 2] ends at or after the instant 1': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(1),
            expected: true,
        },
        '[1, 2] ends at or after the instant 2': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(2),
            expected: true,
        },
        '[1, 2] ends at or after the instant 3': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(3),
            expected: false,
        },
        '[1, 1] ends at or after the instant 1': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            instant: Instant.ofEpochSecond(1),
            expected: true,
        },
    }))('can determine whether the interval %s', (_, scenario) => {
        const {interval, instant, expected} = scenario;

        expect(interval.endsAtOrAfter(instant)).toBe(expected);
    });

    it.each(Object.entries({
        '[1, 2] contains the instant 0': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(0),
            expected: false,
        },
        '[1, 2] contains the instant 1': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(1),
            expected: true,
        },
        '[1, 2] contains the instant 2': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(2),
            expected: false,
        },
        '[1, 2] contains the instant 3': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)),
            instant: Instant.ofEpochSecond(3),
            expected: false,
        },
        '[1, 1] contains the instant 1': {
            interval: TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(1)),
            instant: Instant.ofEpochSecond(1),
            expected: false,
        },
    }))('can determine whether the interval %s', (_, scenario) => {
        const {interval, instant, expected} = scenario;

        expect(interval.contains(instant)).toBe(expected);
    });

    it('can determine whether the interval is logically equal to another interval', () => {
        const start = Instant.ofEpochSecond(1);
        const end = Instant.ofEpochSecond(2);
        const interval = TimeInterval.between(start, end);

        // TimeInterval is always equal to itself
        expect(interval.equals(interval)).toBe(true);

        // TimeInterval with different start
        expect(interval.equals(TimeInterval.between(Instant.ofEpochSecond(0), end))).toBe(false);

        // TimeInterval with different end
        expect(interval.equals(TimeInterval.between(start, Instant.ofEpochSecond(3)))).toBe(false);

        // Other object class
        expect(interval.equals({})).toBe(false);

        // TimeInterval logically equal
        expect(interval.equals(TimeInterval.between(Instant.ofEpochSecond(1), Instant.ofEpochSecond(2)))).toBe(true);
    });

    it.each([
        ['1970-01-01T00:00:00Z1970-01-01T00:00:01Z', false],
        ['invalid date time/1970-01-01T00:00:01Z', false],
        ['1970-01-01T00:00:00Z/invalid date time', false],
        ['1970-01-01T00:00:00Z/1970-01-01T00:00:01Z', true],
    ])('can determine if a value is a valid time interval', (value: string, expected: boolean) => {
        expect(TimeInterval.isValid(value)).toBe(expected);
    });

    it('can be converted to a string in the ISO-8601 format', () => {
        const start = Instant.ofEpochSecond(0);
        const end = Instant.ofEpochSecond(1);
        const interval = TimeInterval.between(start, end);

        expect(interval.toString()).toBe('1970-01-01T00:00:00Z/1970-01-01T00:00:01Z');
    });

    it('can be serialized to a string interval in the ISO-8601 format', () => {
        const start = Instant.ofEpochSecond(0);
        const end = Instant.ofEpochSecond(1);
        const interval = TimeInterval.between(start, end);

        expect(interval.toJSON()).toBe('1970-01-01T00:00:00Z/1970-01-01T00:00:01Z');
    });

    it('can be parsed from a string interval in the ISO-8601 format', () => {
        const start = Instant.ofEpochSecond(0);
        const end = Instant.ofEpochSecond(1);
        const interval = TimeInterval.parse('1970-01-01T00:00:00Z/1970-01-01T00:00:01Z');

        expect(interval.equals(TimeInterval.between(start, end))).toBe(true);
    });

    it.each([
        '',
        '/',
        '1970-01-01T00:00:00Z',
        '1970-01-01T00:00:00Z/',
        '1970-01-01T00:00:00Z/1970-01-01T00:00:01Z/',
        '/1970-01-01T00:00:00Z/1970-01-01T00:00:01Z',
        '1970-01-01T00:00:00Z//1970-01-01T00:00:01Z',
    ])('cannot be parsed from a malformed string interval in the ISO-8601 format', value => {
        expect(() => TimeInterval.parse(value)).toThrow(`Malformed time interval "${value}".`);
    });
});
