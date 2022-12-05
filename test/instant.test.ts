import {Instant} from '../src';

describe('A value object representing an instant in time', () => {
    it('can be created from the number of milliseconds since the epoch', () => {
        const unixMillis = 123456;
        const instant = Instant.ofEpochMilli(unixMillis);

        expect(instant.toEpochMillis()).toBe(123456);
    });

    it.each([
        [123, undefined, 123000],
        [0, undefined, 0],
        [123, 100_000_000, 123100],
        [-123, 100_000_000, -122900],
        [123, -100_000_000, 122900],
        [-123, -100_000_000, -123100],
        [123, 1_000_000_000, 124000],
    ])('can be created from the number of seconds since the epoch', (seconds, nanoseconds, result) => {
        expect(Instant.ofEpochSecond(seconds, nanoseconds).toEpochMillis()).toBe(result);
    });

    it.each(Object.entries({
        'fractional seconds timestamp': 1.5,
        'unsafe seconds timestamp': Number.MAX_VALUE,
        'non-numeric seconds timestamp': NaN,
        'infinity seconds timestamp': Infinity,
    }))('should reject %s', (_, seconds) => {
        expect(() => Instant.ofEpochSecond(seconds)).toThrowError('The timestamp must be a safe integer.');
    });

    it.each(Object.entries({
        'fractional nanosecond adjustment': 1.5,
        'unsafe nanosecond adjustment': Number.MAX_VALUE,
        'non-numeric nanosecond adjustment': NaN,
        'infinity nanosecond adjustment': Infinity,
    }))('should reject %s', (_, nanoseconds) => {
        expect(() => Instant.ofEpochSecond(0, nanoseconds)).toThrowError('The timestamp must be a safe integer.');
    });

    it('should reject seconds timestamp out of accuracy range', () => {
        expect(() => Instant.ofEpochSecond(2 ** 52)).toThrowError(
            'The value 4503599627370496 is out of the range [-31619087596800 - 31494784780799] of instant.',
        );
    });

    it('should reject unsafe milliseconds timestamp', () => {
        expect(() => Instant.ofEpochMilli(Number.MAX_VALUE))
            .toThrowError('The timestamp must be a safe integer.');
    });

    it('can be created from a native Date object', () => {
        const date = new Date(123456);
        const instant = Instant.fromDate(date);

        expect(instant.toEpochMillis()).toBe(123456);
    });

    it.each([
        ['-2015-08-30T12:34:56.155155155Z', -125733554703845, 155155155],
        ['+2015-08-30T12:34:56.155155155Z', 1440938096155, 155155155],
        ['2015-08-30T12:34:56.155155155Z', 1440938096155, 155155155],
        ['2015-08-30T12:34:56.155155Z', 1440938096155, 155155000],
        ['2015-08-30T12:34:56.155Z', 1440938096155, 155000000],
        ['2015-08-30T12:34:56.1Z', 1440938096100, 100000000],
        ['2015-08-30T12:34:56Z', 1440938096000, 0],
        ['2015-08-30T12:34Z', 1440938040000, 0],
        ['2015-08-30T12Z', 1440936000000, 0],
    ])('can be created from a string in the ISO-8601 UTC date-time format', (dateTime, milli, nano) => {
        const instant = Instant.parse(dateTime);

        expect(instant.getNano()).toBe(nano);
        expect(instant.toEpochMillis()).toBe(milli);
    });

    it.each([
        ['2015-08-30T12:34:56.155'],
        ['2015-08-30T12:34:56.155-03:00'],
    ])('cannot be created from a non explicit UTC date-time', dateTime => {
        expect(() => Instant.parse(dateTime)).toThrow(`Unrecognized UTC ISO-8601 date-time string "${dateTime}".`);
    });

    it.each([
        ['2015-08-30'],
        ['2015-08'],
        ['2015'],
    ])('cannot be created from a date-time hiding anything before minutes', dateTime => {
        expect(() => Instant.parse(dateTime)).toThrow(`Unrecognized UTC ISO-8601 date-time string "${dateTime}".`);
    });

    it.each([
        ['2015-08-30T12:00.155'],
        ['2015-08-30T12.155'],
        ['2015-08-30T155'],
    ])('should contain seconds if fraction was passed', dateTime => {
        expect(() => Instant.parse(dateTime)).toThrow(`Unrecognized UTC ISO-8601 date-time string "${dateTime}".`);
    });

    it.each([
        ['2015-08-30T12:34:56.'],
        ['2015-08-30T12:34:'],
        ['2015-08-30T12:'],
        ['2015-08-30T'],
        ['2015-08-30T12:34:0.'],
        ['2015-08-30T12:34:0'],
        ['2015-08-30T12:0'],
        ['2015-08-30T0'],
        ['2015-08-30T00:00:000'],
    ])('should throw error if badly formatted date-time was received', dateTime => {
        expect(() => Instant.parse(dateTime)).toThrow(`Unrecognized UTC ISO-8601 date-time string "${dateTime}".`);
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
