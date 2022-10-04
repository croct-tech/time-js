import {Instant} from '../src';

describe('A value object representing an instant in time', () => {
    it('can be created from the number of milliseconds since the epoch', () => {
        const unixMillis = 123456;
        const instant = Instant.ofEpochMilli(unixMillis);

        expect(instant.toEpochMillis()).toBe(123456);
    });

    it('can be created from the number of seconds since the epoch', () => {
        expect(Instant.ofEpochSecond(123).toEpochMillis()).toBe(123000);

        expect(Instant.ofEpochSecond(0).toEpochMillis()).toBe(0);
    });

    it('should reject fractional seconds timestamp', () => {
        expect(() => Instant.ofEpochSecond(1.5))
            .toThrowError('The timestamp must be a safe integer.');
    });

    it('should reject unsafe seconds timestamp', () => {
        expect(() => Instant.ofEpochSecond(2 ** 52)).toThrowError(
            'The value 4503599627370496 is out of the range [-31619087596800 - 31494753331199] of instant.',
        );
    });

    it('should reject unsafe milliseconds timestamp', () => {
        expect(() => Instant.ofEpochMilli(2 ** 63))
            .toThrowError('The timestamp must be a safe integer.');
    });

    it('can be created from a native Date object', () => {
        const date = new Date(123456);
        const instant = Instant.fromDate(date);

        expect(instant.toEpochMillis()).toBe(123456);
    });

    it('can be created from a string in the ISO-8601 format', () => {
        const date = '2015-08-30T12:34:56Z';
        const instant = Instant.parse(date);

        expect(instant.toEpochMillis()).toBe(1440938096000);
    });

    it('should obtain the current instant from the system clock', () => {
        const currentTimestamp = 123456789;

        jest.spyOn(Date, 'now').mockReturnValueOnce(currentTimestamp);

        const instant = Instant.now();

        expect(instant.toEpochMillis()).toBe(currentTimestamp);
    });

    it('can be converted to an epoch millisecond', () => {
        const instant = Instant.ofEpochMilli(123456789);

        expect(instant.toEpochMillis()).toBe(123456789);
    });

    it('can be converted to a native Date object', () => {
        const instant = Instant.ofEpochMilli(123456789);

        expect(instant.toDate()).toEqual(new Date(123456789));
    });

    it('can be converted to a string in the ISO-8601 format', () => {
        const instant = Instant.ofEpochMilli(123456789);

        expect(instant.toString()).toBe('1970-01-02T10:17:36.789Z');
    });

    it('should create a copy with an amount of time added', () => {
        const instant = Instant.ofEpochMilli(123456789);
        const forwardShift = instant.plusSeconds(876543);
        const backwardShift = instant.plusSeconds(-123456);
        const noShift = instant.plusSeconds(0);

        expect(forwardShift).not.toBe(instant);
        expect(backwardShift).not.toBe(instant);
        expect(noShift).toBe(instant);

        expect(instant.toEpochMillis()).toBe(123456789);
        expect(forwardShift.toEpochMillis()).toBe(999999789);
        expect(backwardShift.toEpochMillis()).toBe(789);
        expect(noShift.toEpochMillis()).toBe(123456789);
    });

    it('should create a copy with an amount of time subtracted', () => {
        const instant = Instant.ofEpochMilli(123456789);
        const forwardShift = instant.minusSeconds(876543);
        const backwardShift = instant.minusSeconds(-123456);
        const noShift = instant.minusSeconds(0);

        expect(forwardShift).not.toBe(instant);
        expect(backwardShift).not.toBe(instant);
        expect(noShift).toBe(instant);

        expect(instant.toEpochMillis()).toBe(123456789);
        expect(forwardShift.toEpochMillis()).toBe(-753086211);
        expect(backwardShift.toEpochMillis()).toBe(246912789);
        expect(noShift.toEpochMillis()).toBe(123456789);
    });

    it('should be comparable', () => {
        const one = Instant.ofEpochMilli(1000000);
        const two = Instant.ofEpochMilli(2000000);
        const three = Instant.ofEpochMilli(1000000);

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
        expect(one.equals(two)).toBe(false);
        expect(one.equals(three)).toBe(true);
    });

    it('should be sortable in ascending order', () => {
        const values = [
            Instant.ofEpochMilli(100001),
            Instant.ofEpochMilli(100000),
            Instant.ofEpochMilli(123456),
            Instant.ofEpochMilli(100001),
        ];

        const sorted = [...values].sort(Instant.compareAscending);

        expect(sorted).toEqual([
            Instant.ofEpochMilli(100000),
            Instant.ofEpochMilli(100001),
            Instant.ofEpochMilli(100001),
            Instant.ofEpochMilli(123456),
        ]);
    });

    it('should be sortable in descending order', () => {
        const values = [
            Instant.ofEpochMilli(100001),
            Instant.ofEpochMilli(100000),
            Instant.ofEpochMilli(123456),
            Instant.ofEpochMilli(100001),
        ];

        const sorted = [...values].sort(Instant.compareDescending);

        expect(sorted).toEqual([
            Instant.ofEpochMilli(123456),
            Instant.ofEpochMilli(100001),
            Instant.ofEpochMilli(100001),
            Instant.ofEpochMilli(100000),
        ]);
    });

    it('should serialize to JSON as the epoch millisecond', () => {
        const instant = Instant.ofEpochMilli(4321);

        expect(JSON.stringify(instant)).toEqual('"1970-01-01T00:00:04.321Z"');
    });

    it('should return the seconds', () => {
        const instant = Instant.ofEpochMilli(4321);

        expect(instant.getSeconds()).toEqual(4);
    });

    it('should return the nanoseconds', () => {
        const instant = Instant.ofEpochMilli(4321);

        expect(instant.getNano()).toEqual(321000000);
    });
});
