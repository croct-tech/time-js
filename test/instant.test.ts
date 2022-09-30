import {Instant} from '../src';

describe('A value object representing an instant in time', () => {
    it('can be created from the number of milliseconds since the epoch', () => {
        const unixMillis = 123456;
        const instant = Instant.fromEpochMillis(unixMillis);

        expect(instant.toMillis()).toBe(123456);
    });

    it('can be created from the number of seconds since the epoch', () => {
        const unixSeconds = 123;
        const instant = Instant.fromEpochSeconds(unixSeconds);

        expect(instant.toMillis()).toBe(123000);
    });

    it('should reject fractional seconds timestamp', () => {
        expect(() => Instant.fromEpochSeconds(1.5))
            .toThrowError('The timestamp must be a safe integer.');
    });

    it('should reject unsafe seconds timestamp', () => {
        expect(() => Instant.fromEpochSeconds(2 ** 52))
            .toThrowError('The timestamp 4503599627370496 cannot be represented accurately.');
    });

    it('should reject unsafe milliseconds timestamp', () => {
        expect(() => Instant.fromEpochMillis(2 ** 53))
            .toThrowError('The timestamp must be an integer.');
    });

    it('can be created from a native Date object', () => {
        const date = new Date(123456);
        const instant = Instant.fromDate(date);

        expect(instant.toMillis()).toBe(123456);
    });

    it('can be created from a string in the ISO-8601 format', () => {
        const date = '2015-08-30T12:34:56Z';
        const instant = Instant.parse(date);

        expect(instant.toMillis()).toBe(1440938096000);
    });

    it('should obtain the current instant from the system clock', () => {
        const currentTimestamp = 123456789;

        jest.spyOn(Date, 'now').mockReturnValueOnce(currentTimestamp);

        const instant = Instant.now();

        expect(instant.toMillis()).toBe(currentTimestamp);
    });

    it('can be converted to an epoch millisecond', () => {
        const instant = Instant.fromEpochMillis(123456789);

        expect(instant.toMillis()).toBe(123456789);
    });

    it('can be converted to a native Date object', () => {
        const instant = Instant.fromEpochMillis(123456789);

        expect(instant.toDate()).toEqual(new Date(123456789));
    });

    it('can be converted to a string in the ISO-8601 format', () => {
        const instant = Instant.fromEpochMillis(123456789);

        expect(instant.toString()).toBe('1970-01-02T10:17:36.789Z');
    });

    it('should create a copy with an amount of time added', () => {
        const instant = Instant.fromEpochMillis(123456789);
        const forwardShift = instant.plusSeconds(876543);
        const backwardShift = instant.plusSeconds(-123456);

        expect(forwardShift).not.toBe(instant);
        expect(backwardShift).not.toBe(instant);

        expect(instant.toMillis()).toBe(123456789);
        expect(forwardShift.toMillis()).toBe(999999789);
        expect(backwardShift.toMillis()).toBe(789);
    });

    it('should be comparable', () => {
        const one = Instant.fromEpochMillis(1000000);
        const two = Instant.fromEpochMillis(2000000);
        const three = Instant.fromEpochMillis(1000000);

        expect(one.isAfter(two)).toBe(false);
        expect(two.isAfter(one)).toBe(true);

        expect(one.isBefore(two)).toBe(true);
        expect(two.isBefore(one)).toBe(false);

        expect(one.isAfter(three)).toBe(false);
        expect(one.isBefore(three)).toBe(false);

        expect(one.isAfterOrEqual(two)).toBe(false);
        expect(two.isAfterOrEqual(one)).toBe(true);

        expect(one.isAfterOrEqual(three)).toBe(true);
        expect(one.isAfterOrEqual(three)).toBe(true);

        expect(one.isBeforeOrEqual(two)).toBe(true);
        expect(two.isBeforeOrEqual(one)).toBe(false);

        expect(one.isBeforeOrEqual(three)).toBe(true);
        expect(one.isBeforeOrEqual(three)).toBe(true);

        expect(one.equals(one)).toBe(true);
        expect(one.equals(three)).toBe(true);
        expect(one.equals(two)).toBe(false);
        expect(one.equals(three)).toBe(true);
    });

    it('should be sortable in ascending order', () => {
        const values = [
            Instant.fromEpochMillis(100001),
            Instant.fromEpochMillis(100000),
            Instant.fromEpochMillis(123456),
            Instant.fromEpochMillis(100001),
        ];

        const sorted = [...values].sort(Instant.compareAscending);

        expect(sorted).toEqual([
            Instant.fromEpochMillis(100000),
            Instant.fromEpochMillis(100001),
            Instant.fromEpochMillis(100001),
            Instant.fromEpochMillis(123456),
        ]);
    });

    it('should be sortable in descending order', () => {
        const values = [
            Instant.fromEpochMillis(100001),
            Instant.fromEpochMillis(100000),
            Instant.fromEpochMillis(123456),
            Instant.fromEpochMillis(100001),
        ];

        const sorted = [...values].sort(Instant.compareDescending);

        expect(sorted).toEqual([
            Instant.fromEpochMillis(123456),
            Instant.fromEpochMillis(100001),
            Instant.fromEpochMillis(100001),
            Instant.fromEpochMillis(100000),
        ]);
    });

    it('should serialize to JSON as the epoch millisecond', () => {
        const instant = Instant.fromEpochMillis(5000);

        expect(JSON.stringify(instant)).toEqual('5000');
    });
});
