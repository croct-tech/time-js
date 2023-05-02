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
        ['-22015-08-30T12:34:56.155155155Z', '-22015-08-30T12:34:56.155155155Z'],
        ['+22015-08-30T12:34:56.155155155Z', '+22015-08-30T12:34:56.155155155Z'],
        ['-2015-08-30T12:34:56.155155155Z', '-2015-08-30T12:34:56.155155155Z'],
        ['2015-08-30T12:34:56.155155155Z', '2015-08-30T12:34:56.155155155Z'],
        ['2015-08-30T12:34:56.155155Z', '2015-08-30T12:34:56.155155Z'],
        ['2015-08-30T12:34:56.155Z', '2015-08-30T12:34:56.155Z'],
        ['2015-08-30T12:34:56Z', '2015-08-30T12:34:56Z'],
        ['2015-08-30T12:00:00Z', '2015-08-30T12:00:00Z'],
        ['2015-08-30T12:00Z', '2015-08-30T12:00:00Z'],
        ['2015-08-30T12Z', '2015-08-30T12:00:00Z'],
        ['-0001-08-30T12:00:00Z', '-0001-08-30T12:00:00Z'],
    ])('can parse a ISO-8601 UTC date-time string', (dateTime, expected) => {
        expect(Instant.parse(dateTime).toString()).toBe(expected);
    });

    it.each([
        // Date-times without Z designator.
        ['2015-08-30T12:34:56.155'],
        ['2015-08-30T12:34:56.155-03:00'],
        // Date-only.
        ['2015-08-30'],
        ['2015-08'],
        ['2015'],
        // Date-time with fractions and without the complete time data.
        ['2015-08-30T12:00.155'],
        ['2015-08-30T12.155'],
        ['2015-08-30T155'],
        // Badly formatted date-times.
        ['2015-08-30T12:34:56.'],
        ['2015-08-30T12:34:'],
        ['2015-08-30T12:'],
        ['2015-08-30T'],
        ['2015-08-30T12:34:0.'],
        ['2015-08-30T12:34:0'],
        ['2015-08-30T12:0'],
        ['2015-08-30T0'],
        ['2015-08-30T00:00:000'],
    ])('cannot parse a malformed date-time string', dateTime => {
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

    it.each([
        [-365, Instant.ofEpochSecond(1440979200 - 365 * 24 * 3600)],
        [-2, Instant.ofEpochSecond(1440979200 - 2 * 24 * 3600)],
        [-1, Instant.ofEpochSecond(1440979200 - 24 * 3600)],
        [0, Instant.ofEpochSecond(1440979200)],
        [1, Instant.ofEpochSecond(1440979200 + 24 * 3600)],
        [2, Instant.ofEpochSecond(1440979200 + 2 * 24 * 3600)],
        [366, Instant.ofEpochSecond(1440979200 + 366 * 24 * 3600)],
    ])('can create a copy with a period in days added', (days: number, expected: Instant) => {
        const instant = Instant.ofEpochSecond(1440979200);

        expect(instant.plusDays(days)).toEqual(expected);
    });

    it.each([
        [Number.MAX_SAFE_INTEGER],
        [Number.MIN_SAFE_INTEGER],
    ])('cannot calculate the days addition because the result exceeds the supported range', (days: number) => {
        const instant = Instant.ofEpochSecond(1440979200);

        expect(() => instant.plusDays(days)).toThrowError('The result overflows the range of safe integers.');
    });

    it.each([
        [365, Instant.ofEpochSecond(1440979200 - 365 * 24 * 3600)],
        [2, Instant.ofEpochSecond(1440979200 - 2 * 24 * 3600)],
        [1, Instant.ofEpochSecond(1440979200 - 24 * 3600)],
        [0, Instant.ofEpochSecond(1440979200)],
        [-1, Instant.ofEpochSecond(1440979200 + 24 * 3600)],
        [-2, Instant.ofEpochSecond(1440979200 + 2 * 24 * 3600)],
        [-366, Instant.ofEpochSecond(1440979200 + 366 * 24 * 3600)],
    ])('can create a copy with a period in days subtracted', (days: number, expected: Instant) => {
        const instant = Instant.ofEpochSecond(1440979200);

        expect(instant.minusDays(days)).toEqual(expected);
    });

    it.each([
        [Number.MAX_SAFE_INTEGER],
        [Number.MIN_SAFE_INTEGER],
    ])('cannot calculate the days subtraction because the result exceeds the supported range', (days: number) => {
        const instant = Instant.ofEpochSecond(1440979200);

        expect(() => instant.minusDays(days)).toThrowError('The result overflows the range of safe integers.');
    });

    it.each([
        [-24, Instant.ofEpochSecond(1440979200 - 24 * 3600)],
        [-2, Instant.ofEpochSecond(1440979200 - 2 * 3600)],
        [-1, Instant.ofEpochSecond(1440979200 - 3600)],
        [0, Instant.ofEpochSecond(1440979200)],
        [1, Instant.ofEpochSecond(1440979200 + 3600)],
        [2, Instant.ofEpochSecond(1440979200 + 2 * 3600)],
        [24, Instant.ofEpochSecond(1440979200 + 24 * 3600)],
    ])('can create a copy with a period in hours added', (hours: number, expected: Instant) => {
        const instant = Instant.ofEpochSecond(1440979200);

        expect(instant.plusHours(hours)).toEqual(expected);
    });

    it.each([
        [Number.MAX_SAFE_INTEGER],
        [Number.MIN_SAFE_INTEGER],
    ])('cannot calculate the hours addition because the result exceeds the supported range', (hours: number) => {
        const instant = Instant.ofEpochSecond(1440979200);

        expect(() => instant.plusHours(hours)).toThrowError('The result overflows the range of safe integers.');
    });

    it.each([
        [24, Instant.ofEpochSecond(1440979200 - 24 * 3600)],
        [2, Instant.ofEpochSecond(1440979200 - 2 * 3600)],
        [1, Instant.ofEpochSecond(1440979200 - 3600)],
        [0, Instant.ofEpochSecond(1440979200)],
        [-1, Instant.ofEpochSecond(1440979200 + 3600)],
        [-2, Instant.ofEpochSecond(1440979200 + 2 * 3600)],
        [-24, Instant.ofEpochSecond(1440979200 + 24 * 3600)],
    ])('can create a copy with a period in hours subtracted', (hours: number, expected: Instant) => {
        const instant = Instant.ofEpochSecond(1440979200);

        expect(instant.minusHours(hours)).toEqual(expected);
    });

    it.each([
        [Number.MAX_SAFE_INTEGER],
        [Number.MIN_SAFE_INTEGER],
    ])('cannot calculate the hours subtraction because the result exceeds the supported range', (hours: number) => {
        const instant = Instant.ofEpochSecond(1440979200);

        expect(() => instant.minusHours(hours)).toThrowError('The result overflows the range of safe integers.');
    });

    it.each([
        [-1440, Instant.ofEpochSecond(1440979200 - 1440 * 60)],
        [-2, Instant.ofEpochSecond(1440979200 - 2 * 60)],
        [-1, Instant.ofEpochSecond(1440979200 - 60)],
        [0, Instant.ofEpochSecond(1440979200)],
        [1, Instant.ofEpochSecond(1440979200 + 60)],
        [2, Instant.ofEpochSecond(1440979200 + 2 * 60)],
        [1440, Instant.ofEpochSecond(1440979200 + 1440 * 60)],
    ])('can create a copy with a period in minutes added', (minutes: number, expected: Instant) => {
        const instant = Instant.ofEpochSecond(1440979200);

        expect(instant.plusMinutes(minutes)).toEqual(expected);
    });

    it.each([
        [Number.MAX_SAFE_INTEGER],
        [Number.MIN_SAFE_INTEGER],
    ])('cannot calculate the minutes addition because the result exceeds the supported range', (minutes: number) => {
        const instant = Instant.ofEpochSecond(1440979200);

        expect(() => instant.plusMinutes(minutes)).toThrowError('The result overflows the range of safe integers.');
    });

    it.each([
        [1440, Instant.ofEpochSecond(1440979200 - 1440 * 60)],
        [2, Instant.ofEpochSecond(1440979200 - 2 * 60)],
        [1, Instant.ofEpochSecond(1440979200 - 60)],
        [0, Instant.ofEpochSecond(1440979200)],
        [-1, Instant.ofEpochSecond(1440979200 + 60)],
        [-2, Instant.ofEpochSecond(1440979200 + 2 * 60)],
        [-1440, Instant.ofEpochSecond(1440979200 + 1440 * 60)],
    ])('can create a copy with a period in minutes subtracted', (minutes: number, expected: Instant) => {
        const instant = Instant.ofEpochSecond(1440979200);

        expect(instant.minusMinutes(minutes)).toEqual(expected);
    });

    it.each([
        [Number.MAX_SAFE_INTEGER],
        [Number.MIN_SAFE_INTEGER],
    ])('cannot calculate the minutes subtraction because the result exceeds the supported range', (minutes: number) => {
        const instant = Instant.ofEpochSecond(1440979200);

        expect(() => instant.minusMinutes(minutes)).toThrowError('The result overflows the range of safe integers.');
    });

    it.each([
        [-86400, Instant.ofEpochSecond(1440979200 - 86400)],
        [-2, Instant.ofEpochSecond(1440979200 - 2)],
        [-1, Instant.ofEpochSecond(1440979200 - 1)],
        [0, Instant.ofEpochSecond(1440979200)],
        [1, Instant.ofEpochSecond(1440979200 + 1)],
        [2, Instant.ofEpochSecond(1440979200 + 2)],
        [86400, Instant.ofEpochSecond(1440979200 + 86400)],
    ])('can create a copy with a period in seconds added', (seconds: number, expected: Instant) => {
        const instant = Instant.ofEpochSecond(1440979200);

        expect(instant.plusSeconds(seconds)).toEqual(expected);
    });

    it.each([
        [
            Number.MAX_SAFE_INTEGER,
            'The result overflows the range of safe integers.',
        ],
        [
            Number.MIN_SAFE_INTEGER,
            'The value -9007197813761791 is out of the range [-31619087596800 - 31494784780799] of instant.',
        ],
    ])(
        'cannot calculate the seconds addition because the result exceeds the supported range',
        (seconds: number, errorMessage: string) => {
            const instant = Instant.ofEpochSecond(1440979200);

            expect(() => instant.plusSeconds(seconds)).toThrowError(errorMessage);
        },
    );

    it.each([
        [86400, Instant.ofEpochSecond(1440979200 - 86400)],
        [2, Instant.ofEpochSecond(1440979200 - 2)],
        [1, Instant.ofEpochSecond(1440979200 - 1)],
        [0, Instant.ofEpochSecond(1440979200)],
        [-1, Instant.ofEpochSecond(1440979200 + 1)],
        [-2, Instant.ofEpochSecond(1440979200 + 2)],
        [-86400, Instant.ofEpochSecond(1440979200 + 86400)],
    ])('can create a copy with a period in seconds subtracted', (seconds: number, expected: Instant) => {
        const instant = Instant.ofEpochSecond(1440979200);

        expect(instant.minusSeconds(seconds)).toEqual(expected);
    });

    it.each([
        [
            Number.MAX_SAFE_INTEGER,
            'The value -9007197813761791 is out of the range [-31619087596800 - 31494784780799] of instant.',
        ],
        [
            Number.MIN_SAFE_INTEGER,
            'The result overflows the range of safe integers.',
        ],
    ])(
        'cannot calculate the seconds subtraction because the result exceeds the supported range',
        (seconds: number, errorMessage: string) => {
            const instant = Instant.ofEpochSecond(1440979200);

            expect(() => instant.minusSeconds(seconds)).toThrowError(errorMessage);
        },
    );

    it.each([
        [-86400000, Instant.ofEpochSecond(1440979200 - 86400)],
        [-1000, Instant.ofEpochSecond(1440979200 - 1)],
        [-2, Instant.ofEpochSecond(1440979200, -2000000)],
        [-1, Instant.ofEpochSecond(1440979200, -1000000)],
        [0, Instant.ofEpochSecond(1440979200)],
        [1, Instant.ofEpochSecond(1440979200, 1000000)],
        [2, Instant.ofEpochSecond(1440979200, 2000000)],
        [1000, Instant.ofEpochSecond(1440979200 + 1)],
        [86400000, Instant.ofEpochSecond(1440979200 + 86400)],

        [Number.MAX_SAFE_INTEGER, Instant.ofEpochSecond(9007199254740 + 1440979200, 991000000)],
        [Number.MIN_SAFE_INTEGER, Instant.ofEpochSecond(-9007199254740 + 1440979200, -991000000)],
    ])('can create a copy with a period in milliseconds added', (millis: number, expected: Instant) => {
        const instant = Instant.ofEpochSecond(1440979200);

        expect(instant.plusMillis(millis)).toEqual(expected);
    });

    it.each([
        [86400000, Instant.ofEpochSecond(1440979200 - 86400)],
        [1000, Instant.ofEpochSecond(1440979200 - 1)],
        [2, Instant.ofEpochSecond(1440979200, -2000000)],
        [1, Instant.ofEpochSecond(1440979200, -1000000)],
        [0, Instant.ofEpochSecond(1440979200)],
        [-1, Instant.ofEpochSecond(1440979200, 1000000)],
        [-2, Instant.ofEpochSecond(1440979200, 2000000)],
        [-1000, Instant.ofEpochSecond(1440979200 + 1)],
        [-86400000, Instant.ofEpochSecond(1440979200 + 86400)],

        [Number.MAX_SAFE_INTEGER, Instant.ofEpochSecond(-9007199254740 + 1440979200, -991000000)],
        [Number.MIN_SAFE_INTEGER, Instant.ofEpochSecond(9007199254740 + 1440979200, 991000000)],
    ])('can create a copy with a period in milliseconds subtracted', (millis: number, expected: Instant) => {
        const instant = Instant.ofEpochSecond(1440979200);

        expect(instant.minusMillis(millis)).toEqual(expected);
    });

    it.each([
        [-86400000000, Instant.ofEpochSecond(1440979200 - 86400)],
        [-1000000, Instant.ofEpochSecond(1440979200 - 1)],
        [-2, Instant.ofEpochSecond(1440979200, -2000)],
        [-1, Instant.ofEpochSecond(1440979200, -1000)],
        [0, Instant.ofEpochSecond(1440979200)],
        [1, Instant.ofEpochSecond(1440979200, 1000)],
        [2, Instant.ofEpochSecond(1440979200, 2000)],
        [1000000, Instant.ofEpochSecond(1440979200 + 1)],
        [86400000000, Instant.ofEpochSecond(1440979200 + 86400)],

        [Number.MAX_SAFE_INTEGER, Instant.ofEpochSecond(9007199254 + 1440979200, 740991000)],
        [Number.MIN_SAFE_INTEGER, Instant.ofEpochSecond(-9007199254 + 1440979200, -740991000)],
    ])('can create a copy with a period in microseconds added', (micros: number, expected: Instant) => {
        const instant = Instant.ofEpochSecond(1440979200);

        expect(instant.plusMicros(micros)).toEqual(expected);
    });

    it.each([
        [86400000000, Instant.ofEpochSecond(1440979200 - 86400)],
        [1000000, Instant.ofEpochSecond(1440979200 - 1)],
        [2, Instant.ofEpochSecond(1440979200, -2000)],
        [1, Instant.ofEpochSecond(1440979200, -1000)],
        [0, Instant.ofEpochSecond(1440979200)],
        [-1, Instant.ofEpochSecond(1440979200, 1000)],
        [-2, Instant.ofEpochSecond(1440979200, 2000)],
        [-1000000, Instant.ofEpochSecond(1440979200 + 1)],
        [-86400000000, Instant.ofEpochSecond(1440979200 + 86400)],

        [Number.MAX_SAFE_INTEGER, Instant.ofEpochSecond(-9007199254 + 1440979200, -740991000)],
        [Number.MIN_SAFE_INTEGER, Instant.ofEpochSecond(9007199254 + 1440979200, 740991000)],
    ])('can create a copy with a period in microseconds subtracted', (micros: number, expected: Instant) => {
        const instant = Instant.ofEpochSecond(1440979200);

        expect(instant.minusMicros(micros)).toEqual(expected);
    });

    it.each([
        [-86400000000000, Instant.ofEpochSecond(1440979200 - 86400)],
        [-1000000000, Instant.ofEpochSecond(1440979200 - 1)],
        [-2, Instant.ofEpochSecond(1440979200, -2)],
        [-1, Instant.ofEpochSecond(1440979200, -1)],
        [0, Instant.ofEpochSecond(1440979200)],
        [1, Instant.ofEpochSecond(1440979200, 1)],
        [2, Instant.ofEpochSecond(1440979200, 2)],
        [1000000000, Instant.ofEpochSecond(1440979200 + 1)],
        [86400000000000, Instant.ofEpochSecond(1440979200 + 86400)],

        [Number.MAX_SAFE_INTEGER, Instant.ofEpochSecond(9007199 + 1440979200, 254740991)],
        [Number.MIN_SAFE_INTEGER, Instant.ofEpochSecond(-9007199 + 1440979200, -254740991)],
    ])('can create a copy with a period in nanoseconds added', (nanos: number, expected: Instant) => {
        const instant = Instant.ofEpochSecond(1440979200);

        expect(instant.plusNanos(nanos)).toEqual(expected);
    });

    it.each([
        [86400000000000, Instant.ofEpochSecond(1440979200 - 86400)],
        [1000000000, Instant.ofEpochSecond(1440979200 - 1)],
        [2, Instant.ofEpochSecond(1440979200, -2)],
        [1, Instant.ofEpochSecond(1440979200, -1)],
        [0, Instant.ofEpochSecond(1440979200)],
        [-1, Instant.ofEpochSecond(1440979200, 1)],
        [-2, Instant.ofEpochSecond(1440979200, 2)],
        [-1000000000, Instant.ofEpochSecond(1440979200 + 1)],
        [-86400000000000, Instant.ofEpochSecond(1440979200 + 86400)],

        [Number.MAX_SAFE_INTEGER, Instant.ofEpochSecond(-9007199 + 1440979200, -254740991)],
        [Number.MIN_SAFE_INTEGER, Instant.ofEpochSecond(9007199 + 1440979200, 254740991)],
    ])('can create a copy with a period in nanoseconds subtracted', (nanos: number, expected: Instant) => {
        const instant = Instant.ofEpochSecond(1440979200);

        expect(instant.minusNanos(nanos)).toEqual(expected);
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
