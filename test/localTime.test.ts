import {LocalTime} from '../src';

describe('A value object representing a local time', () => {
    it('can be created from its components', () => {
        const hour = 14;
        const minute = 20;
        const second = 5;
        const nanos = 1000;
        const localTime = LocalTime.of(hour, minute, second, nanos);

        expect(localTime.getHour()).toBe(hour);
        expect(localTime.getMinute()).toBe(minute);
        expect(localTime.getSecond()).toBe(second);
        expect(localTime.getNano()).toBe(nanos);
    });

    it('can be created from a native Date object', () => {
        const date = new Date('August, 31 2015 23:15:30.123');
        const localTime = LocalTime.fromNative(date);

        expect(localTime.toString()).toBe('23:15:30.123');
    });

    it.each(Object.entries({
        'fractional hours number': 1.5,
        'hours number less than 0': -1,
        'hours number greater than 23': 24,
    }))('should reject %s', (_, hour) => {
        expect(() => LocalTime.of(hour)).toThrowError('Hour must be an integer between 0 and 23.');
    });

    it.each(Object.entries({
        'fractional minutes number': 1.5,
        'minutes number less than 0': -1,
        'minutes number greater than 59': 60,
    }))('should reject %s', (_, minute) => {
        expect(() => LocalTime.of(0, minute)).toThrowError('Minute must be an integer between 0 and 59.');
    });

    it.each(Object.entries({
        'fractional seconds number': 1.5,
        'seconds number less than 0': -1,
        'seconds number greater than 59': 60,
    }))('should reject %s', (_, second) => {
        expect(() => LocalTime.of(0, 0, second)).toThrowError('Second must be an integer between 0 and 59.');
    });

    it.each(Object.entries({
        'fractional nanoseconds number': 1.5,
        'nanoseconds number less than 0': -1,
        'nanoseconds number greater than 999999999': 1_000_000_000,
    }))('should reject %s', (_, nanosecond) => {
        expect(() => LocalTime.of(0, 0, 0, nanosecond)).toThrowError(
            'Nanosecond of second must be an integer between 0 and 999999999.',
        );
    });

    it('should return a local time at the start of the day', () => {
        expect(LocalTime.startOfDay().toString()).toBe('00:00');
    });

    it('should return a local time at the end of the day', () => {
        expect(LocalTime.endOfDay().toString()).toBe('23:59:59.999999999');
    });

    it('can be created from a string in the ISO-8601 format', () => {
        expect(LocalTime.parse('14:20:05.123').toString()).toBe('14:20:05.123');

        expect(LocalTime.parse('14:20').toString()).toBe('14:20');
    });

    it.each([
        ['12:00', '12:00'],
        ['12:00:00', '12:00'],
        ['12:01:00', '12:01'],
        ['12:01:01', '12:01:01'],
        ['12:01:01.0', '12:01:01'],
        ['12:01:01.1', '12:01:01.100'],
        ['12:01:01.1001', '12:01:01.100100'],
        ['12:01:01.1001001', '12:01:01.100100100'],
    ])('should parse %s', (value, expected) => {
        expect(LocalTime.parse(value).toString()).toStrictEqual(expected);
    });

    it.each([
        '2015-08-30T12:34:56',
        '123456',
        '12.34.56',
        '12:34:56:78.99',
        '12',
        '122:34:56',
        '12:344:56',
        '12:34:566',
        '12:34:56:0000000056',
    ])('should fail to parse %s', value => {
        expect(() => LocalTime.parse(value)).toThrowError(`Invalid ISO-8601 time string: ${value}`);
    });

    it.each([
        ['12:00', '12:00'],
        ['12:00:00', '12:00'],
        ['12:01:00', '12:01'],
        ['12:01:01', '12:01:01'],
        ['12:01:01.0', '12:01:01'],
        ['12:01:01.1', '12:01:01.100'],
        ['12:01:01.1001', '12:01:01.100100'],
        ['12:01:01.1001001', '12:01:01.100100100'],
    ])('should format %s as %s', (input, expected) => {
        expect(LocalTime.parse(input).toString()).toBe(expected);
    });

    it.each([
        // with nanoseconds
        [LocalTime.ofSecondOfDay(0, 1), '00:00:00.000000001'],
        [LocalTime.ofSecondOfDay(1, 1), '00:00:01.000000001'],
        [LocalTime.ofSecondOfDay(15, 1), '00:00:15.000000001'],
        [LocalTime.ofSecondOfDay(60, 1), '00:01:00.000000001'],
        [LocalTime.ofSecondOfDay(75, 1), '00:01:15.000000001'],
        [LocalTime.ofSecondOfDay(3600, 1), '01:00:00.000000001'],
        [LocalTime.ofSecondOfDay(4500, 1), '01:15:00.000000001'],
        // without nanoseconds
        [LocalTime.ofSecondOfDay(0), '00:00'],
        [LocalTime.ofSecondOfDay(1), '00:00:01'],
        [LocalTime.ofSecondOfDay(15), '00:00:15'],
        [LocalTime.ofSecondOfDay(60), '00:01'],
        [LocalTime.ofSecondOfDay(75), '00:01:15'],
        [LocalTime.ofSecondOfDay(3600), '01:00'],
        [LocalTime.ofSecondOfDay(4500), '01:15'],
    ])('can be created from a second-of-day value', (localTime: LocalTime, expected: string) => {
        expect(localTime.toString()).toEqual(expected);
    });

    it.each([
        -1,
        LocalTime.SECONDS_PER_DAY,
    ])('should fail to create from a second-of-day out of range', (secondOfDay: number) => {
        expect(() => LocalTime.ofSecondOfDay(secondOfDay, 0)).toThrowError(
            `The second value ${secondOfDay} is out of the range `
                + `[0 - ${LocalTime.SECONDS_PER_DAY - 1}] of local time.`,
        );
    });

    it.each([
        -1,
        LocalTime.NANOS_PER_SECOND,
    ])('should fail to create from a second-of-day with nanoseconds out of range', (nanoOfSecond: number) => {
        expect(() => LocalTime.ofSecondOfDay(0, nanoOfSecond)).toThrowError(
            `The nanosecond value ${nanoOfSecond} is out of the range `
                + `[0 - ${LocalTime.NANOS_PER_SECOND - 1}] of local time.`,
        );
    });

    it.each([
        [LocalTime.of(0), 0],
        [LocalTime.of(1), 60],
        [LocalTime.of(1, 2), 62],
        [LocalTime.of(1, 2, 3), 62],
        [LocalTime.of(1, 2, 3, 345678912), 62],
    ])('can be converted to a minute of day', (localTime: LocalTime, expected: number) => {
        expect(localTime.toMinuteOfDay()).toBe(expected);
    });

    it.each([
        [LocalTime.of(0), 0],
        [LocalTime.of(1), 3600],
        [LocalTime.of(1, 2), 3720],
        [LocalTime.of(1, 2, 3), 3723],
        [LocalTime.of(1, 2, 3, 345678912), 3723],
    ])('can be converted to a second of day', (localTime: LocalTime, expected: number) => {
        expect(localTime.toSecondOfDay()).toBe(expected);
    });

    it.each([
        [LocalTime.of(0), 0],
        [LocalTime.of(1), 3600000],
        [LocalTime.of(1, 2), 3720000],
        [LocalTime.of(1, 2, 3), 3723000],
        [LocalTime.of(1, 2, 3, 345678912), 3723345],
    ])('can be converted to a millisecond of day', (localTime: LocalTime, expected: number) => {
        expect(localTime.toMilliOfDay()).toBe(expected);
    });

    it.each([
        [LocalTime.of(0), 0],
        [LocalTime.of(1), 3600000000],
        [LocalTime.of(1, 2), 3720000000],
        [LocalTime.of(1, 2, 3), 3723000000],
        [LocalTime.of(1, 2, 3, 345678912), 3723345678],
    ])('can be converted to a microsecond of day', (localTime: LocalTime, expected: number) => {
        expect(localTime.toMicroOfDay()).toBe(expected);
    });

    it.each([
        [LocalTime.of(0), 0],
        [LocalTime.of(1), 3600000000000],
        [LocalTime.of(1, 2), 3720000000000],
        [LocalTime.of(1, 2, 3), 3723000000000],
        [LocalTime.of(1, 2, 3, 345678912), 3723345678912],
    ])('can be converted to a nanosecond of day', (localTime: LocalTime, expected: number) => {
        expect(localTime.toNanoOfDay()).toBe(expected);
    });

    it.each([
        [-24, LocalTime.of(1, 2, 3)],
        [-5, LocalTime.of(20, 2, 3)],
        [-4, LocalTime.of(21, 2, 3)],
        [-3, LocalTime.of(22, 2, 3)],
        [-2, LocalTime.of(23, 2, 3)],
        [-1, LocalTime.of(0, 2, 3)],
        [0, LocalTime.of(1, 2, 3)],
        [1, LocalTime.of(2, 2, 3)],
        [2, LocalTime.of(3, 2, 3)],
        [3, LocalTime.of(4, 2, 3)],
        [4, LocalTime.of(5, 2, 3)],
        [5, LocalTime.of(6, 2, 3)],
        [24, LocalTime.of(1, 2, 3)],

        [Number.MAX_SAFE_INTEGER, LocalTime.of(8, 2, 3)],
        [Number.MIN_SAFE_INTEGER, LocalTime.of(18, 2, 3)],
    ])('can create a copy with an amount of hours added', (hours: number, expected: LocalTime) => {
        const localTime = LocalTime.of(1, 2, 3);

        expect(localTime.plusHours(hours)).toStrictEqual(expected);
    });

    it.each([
        [24, LocalTime.of(1, 2, 3)],
        [5, LocalTime.of(20, 2, 3)],
        [4, LocalTime.of(21, 2, 3)],
        [3, LocalTime.of(22, 2, 3)],
        [2, LocalTime.of(23, 2, 3)],
        [1, LocalTime.of(0, 2, 3)],
        [-0, LocalTime.of(1, 2, 3)],
        [-1, LocalTime.of(2, 2, 3)],
        [-2, LocalTime.of(3, 2, 3)],
        [-3, LocalTime.of(4, 2, 3)],
        [-4, LocalTime.of(5, 2, 3)],
        [-5, LocalTime.of(6, 2, 3)],
        [-24, LocalTime.of(1, 2, 3)],

        [Number.MAX_SAFE_INTEGER, LocalTime.of(18, 2, 3)],
        [Number.MIN_SAFE_INTEGER, LocalTime.of(8, 2, 3)],
    ])('can create a copy with an amount of hours subtracted', (hours: number, expected: LocalTime) => {
        const localTime = LocalTime.of(1, 2, 3);

        expect(localTime.minusHours(hours)).toStrictEqual(expected);
    });

    it.each([
        [-1440, LocalTime.of(1, 2, 3)],
        [-5, LocalTime.of(0, 57, 3)],
        [-4, LocalTime.of(0, 58, 3)],
        [-3, LocalTime.of(0, 59, 3)],
        [-2, LocalTime.of(1, 0, 3)],
        [-1, LocalTime.of(1, 1, 3)],
        [0, LocalTime.of(1, 2, 3)],
        [1, LocalTime.of(1, 3, 3)],
        [2, LocalTime.of(1, 4, 3)],
        [3, LocalTime.of(1, 5, 3)],
        [4, LocalTime.of(1, 6, 3)],
        [5, LocalTime.of(1, 7, 3)],
        [1440, LocalTime.of(1, 2, 3)],

        [Number.MAX_SAFE_INTEGER, LocalTime.of(1, 33, 3)],
        [Number.MIN_SAFE_INTEGER, LocalTime.of(0, 31, 3)],
    ])('can create a copy with an amount of minutes added', (minutes: number, expected: LocalTime) => {
        const localTime = LocalTime.of(1, 2, 3);

        expect(localTime.plusMinutes(minutes)).toStrictEqual(expected);
    });

    it.each([
        [1440, LocalTime.of(1, 2, 3)],
        [5, LocalTime.of(0, 57, 3)],
        [4, LocalTime.of(0, 58, 3)],
        [3, LocalTime.of(0, 59, 3)],
        [2, LocalTime.of(1, 0, 3)],
        [1, LocalTime.of(1, 1, 3)],
        [0, LocalTime.of(1, 2, 3)],
        [-1, LocalTime.of(1, 3, 3)],
        [-2, LocalTime.of(1, 4, 3)],
        [-3, LocalTime.of(1, 5, 3)],
        [-4, LocalTime.of(1, 6, 3)],
        [-5, LocalTime.of(1, 7, 3)],
        [-1440, LocalTime.of(1, 2, 3)],

        [Number.MAX_SAFE_INTEGER, LocalTime.of(0, 31, 3)],
        [Number.MIN_SAFE_INTEGER, LocalTime.of(1, 33, 3)],
    ])('can create a copy with an amount of minutes subtracted', (minutes: number, expected: LocalTime) => {
        const localTime = LocalTime.of(1, 2, 3);

        expect(localTime.minusMinutes(minutes)).toStrictEqual(expected);
    });

    it.each([
        [-86400, LocalTime.of(1, 2, 3)],
        [-5, LocalTime.of(1, 1, 58)],
        [-4, LocalTime.of(1, 1, 59)],
        [-3, LocalTime.of(1, 2, 0)],
        [-2, LocalTime.of(1, 2, 1)],
        [-1, LocalTime.of(1, 2, 2)],
        [0, LocalTime.of(1, 2, 3)],
        [1, LocalTime.of(1, 2, 4)],
        [2, LocalTime.of(1, 2, 5)],
        [3, LocalTime.of(1, 2, 6)],
        [4, LocalTime.of(1, 2, 7)],
        [5, LocalTime.of(1, 2, 8)],
        [86400, LocalTime.of(1, 2, 3)],

        [Number.MAX_SAFE_INTEGER, LocalTime.of(8, 38, 34)],
        [Number.MIN_SAFE_INTEGER, LocalTime.of(17, 25, 32)],
    ])('can create a copy with an amount of seconds added', (seconds: number, expected: LocalTime) => {
        const localTime = LocalTime.of(1, 2, 3);

        expect(localTime.plusSeconds(seconds)).toStrictEqual(expected);
    });

    it.each([
        [86400, LocalTime.of(1, 2, 3)],
        [5, LocalTime.of(1, 1, 58)],
        [4, LocalTime.of(1, 1, 59)],
        [3, LocalTime.of(1, 2, 0)],
        [2, LocalTime.of(1, 2, 1)],
        [1, LocalTime.of(1, 2, 2)],
        [0, LocalTime.of(1, 2, 3)],
        [-1, LocalTime.of(1, 2, 4)],
        [-2, LocalTime.of(1, 2, 5)],
        [-3, LocalTime.of(1, 2, 6)],
        [-4, LocalTime.of(1, 2, 7)],
        [-5, LocalTime.of(1, 2, 8)],
        [-86400, LocalTime.of(1, 2, 3)],

        [Number.MAX_SAFE_INTEGER, LocalTime.of(17, 25, 32)],
        [Number.MIN_SAFE_INTEGER, LocalTime.of(8, 38, 34)],
    ])('can create a copy with an amount of seconds subtracted', (seconds: number, expected: LocalTime) => {
        const localTime = LocalTime.of(1, 2, 3);

        expect(localTime.minusSeconds(seconds)).toStrictEqual(expected);
    });

    it.each([
        [-86400000, LocalTime.of(1, 2, 3)],
        [-1000, LocalTime.of(1, 2, 2)],
        [-5, LocalTime.of(1, 2, 2, 995000000)],
        [-4, LocalTime.of(1, 2, 2, 996000000)],
        [-3, LocalTime.of(1, 2, 2, 997000000)],
        [-2, LocalTime.of(1, 2, 2, 998000000)],
        [-1, LocalTime.of(1, 2, 2, 999000000)],
        [0, LocalTime.of(1, 2, 3)],
        [1, LocalTime.of(1, 2, 3, 1000000)],
        [2, LocalTime.of(1, 2, 3, 2000000)],
        [3, LocalTime.of(1, 2, 3, 3000000)],
        [4, LocalTime.of(1, 2, 3, 4000000)],
        [5, LocalTime.of(1, 2, 3, 5000000)],
        [1000, LocalTime.of(1, 2, 4)],
        [86400000, LocalTime.of(1, 2, 3)],

        [Number.MAX_SAFE_INTEGER, LocalTime.of(10, 1, 3, 991000000)],
        [Number.MIN_SAFE_INTEGER, LocalTime.of(16, 3, 2, 9000000)],
    ])('can create a copy with an amount of milliseconds added', (millis: number, expected: LocalTime) => {
        const localTime = LocalTime.of(1, 2, 3);

        expect(localTime.plusMillis(millis)).toStrictEqual(expected);
    });

    it.each([
        [86400000, LocalTime.of(1, 2, 3)],
        [1000, LocalTime.of(1, 2, 2)],
        [5, LocalTime.of(1, 2, 2, 995000000)],
        [4, LocalTime.of(1, 2, 2, 996000000)],
        [3, LocalTime.of(1, 2, 2, 997000000)],
        [2, LocalTime.of(1, 2, 2, 998000000)],
        [1, LocalTime.of(1, 2, 2, 999000000)],
        [0, LocalTime.of(1, 2, 3)],
        [-1, LocalTime.of(1, 2, 3, 1000000)],
        [-2, LocalTime.of(1, 2, 3, 2000000)],
        [-3, LocalTime.of(1, 2, 3, 3000000)],
        [-4, LocalTime.of(1, 2, 3, 4000000)],
        [-5, LocalTime.of(1, 2, 3, 5000000)],
        [-1000, LocalTime.of(1, 2, 4)],
        [-86400000, LocalTime.of(1, 2, 3)],

        [Number.MAX_SAFE_INTEGER, LocalTime.of(16, 3, 2, 9000000)],
        [Number.MIN_SAFE_INTEGER, LocalTime.of(10, 1, 3, 991000000)],
    ])('can create a copy with an amount of milliseconds subtracted', (millis: number, expected: LocalTime) => {
        const localTime = LocalTime.of(1, 2, 3);

        expect(localTime.minusMillis(millis)).toStrictEqual(expected);
    });

    it.each([
        [-86400000000, LocalTime.of(1, 2, 3)],
        [-1000000, LocalTime.of(1, 2, 2)],
        [-5, LocalTime.of(1, 2, 2, 999995000)],
        [-4, LocalTime.of(1, 2, 2, 999996000)],
        [-3, LocalTime.of(1, 2, 2, 999997000)],
        [-2, LocalTime.of(1, 2, 2, 999998000)],
        [-1, LocalTime.of(1, 2, 2, 999999000)],
        [0, LocalTime.of(1, 2, 3)],
        [1, LocalTime.of(1, 2, 3, 1000)],
        [2, LocalTime.of(1, 2, 3, 2000)],
        [3, LocalTime.of(1, 2, 3, 3000)],
        [4, LocalTime.of(1, 2, 3, 4000)],
        [5, LocalTime.of(1, 2, 3, 5000)],
        [1000000, LocalTime.of(1, 2, 4)],
        [86400000000, LocalTime.of(1, 2, 3)],

        [Number.MAX_SAFE_INTEGER, LocalTime.of(0, 49, 37, 740991000)],
        [Number.MIN_SAFE_INTEGER, LocalTime.of(1, 14, 28, 259009000)],
    ])('can create a copy with an amount of microseconds added', (micros: number, expected: LocalTime) => {
        const localTime = LocalTime.of(1, 2, 3);

        expect(localTime.plusMicros(micros)).toStrictEqual(expected);
    });

    it.each([
        [86400000000, LocalTime.of(1, 2, 3)],
        [1000000, LocalTime.of(1, 2, 2)],
        [5, LocalTime.of(1, 2, 2, 999995000)],
        [4, LocalTime.of(1, 2, 2, 999996000)],
        [3, LocalTime.of(1, 2, 2, 999997000)],
        [2, LocalTime.of(1, 2, 2, 999998000)],
        [1, LocalTime.of(1, 2, 2, 999999000)],
        [0, LocalTime.of(1, 2, 3)],
        [-1, LocalTime.of(1, 2, 3, 1000)],
        [-2, LocalTime.of(1, 2, 3, 2000)],
        [-3, LocalTime.of(1, 2, 3, 3000)],
        [-4, LocalTime.of(1, 2, 3, 4000)],
        [-5, LocalTime.of(1, 2, 3, 5000)],
        [-1000000, LocalTime.of(1, 2, 4)],
        [-86400000000, LocalTime.of(1, 2, 3)],

        [Number.MAX_SAFE_INTEGER, LocalTime.of(1, 14, 28, 259009000)],
        [Number.MIN_SAFE_INTEGER, LocalTime.of(0, 49, 37, 740991000)],
    ])('can create a copy with an amount of microseconds subtracted', (micros: number, expected: LocalTime) => {
        const localTime = LocalTime.of(1, 2, 3);

        expect(localTime.minusMicros(micros)).toStrictEqual(expected);
    });

    it.each([
        [-86400000000000, LocalTime.of(1, 2, 3)],
        [-1000000000, LocalTime.of(1, 2, 2)],
        [-5, LocalTime.of(1, 2, 2, 999999995)],
        [-4, LocalTime.of(1, 2, 2, 999999996)],
        [-3, LocalTime.of(1, 2, 2, 999999997)],
        [-2, LocalTime.of(1, 2, 2, 999999998)],
        [-1, LocalTime.of(1, 2, 2, 999999999)],
        [0, LocalTime.of(1, 2, 3)],
        [1, LocalTime.of(1, 2, 3, 1)],
        [2, LocalTime.of(1, 2, 3, 2)],
        [3, LocalTime.of(1, 2, 3, 3)],
        [4, LocalTime.of(1, 2, 3, 4)],
        [5, LocalTime.of(1, 2, 3, 5)],
        [1000000000, LocalTime.of(1, 2, 4)],
        [86400000000000, LocalTime.of(1, 2, 3)],

        [Number.MAX_SAFE_INTEGER, LocalTime.of(7, 2, 2, 254740991)],
        [Number.MIN_SAFE_INTEGER, LocalTime.of(19, 2, 3, 745259009)],
    ])('can create a copy with an amount of nanoseconds added', (nanos: number, expected: LocalTime) => {
        const localTime = LocalTime.of(1, 2, 3);

        expect(localTime.plusNanos(nanos)).toStrictEqual(expected);
    });

    it.each([
        [86400000000000, LocalTime.of(1, 2, 3)],
        [1000000000, LocalTime.of(1, 2, 2)],
        [5, LocalTime.of(1, 2, 2, 999999995)],
        [4, LocalTime.of(1, 2, 2, 999999996)],
        [3, LocalTime.of(1, 2, 2, 999999997)],
        [2, LocalTime.of(1, 2, 2, 999999998)],
        [1, LocalTime.of(1, 2, 2, 999999999)],
        [0, LocalTime.of(1, 2, 3)],
        [-1, LocalTime.of(1, 2, 3, 1)],
        [-2, LocalTime.of(1, 2, 3, 2)],
        [-3, LocalTime.of(1, 2, 3, 3)],
        [-4, LocalTime.of(1, 2, 3, 4)],
        [-5, LocalTime.of(1, 2, 3, 5)],
        [-1000000000, LocalTime.of(1, 2, 4)],
        [-86400000000000, LocalTime.of(1, 2, 3)],

        [Number.MAX_SAFE_INTEGER, LocalTime.of(19, 2, 3, 745259009)],
        [Number.MIN_SAFE_INTEGER, LocalTime.of(7, 2, 2, 254740991)],
    ])('can create a copy with an amount of nanoseconds subtracted', (nanos: number, expected: LocalTime) => {
        const localTime = LocalTime.of(1, 2, 3);

        expect(localTime.minusNanos(nanos)).toStrictEqual(expected);
    });

    it('should be comparable', () => {
        const one = LocalTime.of(10, 20, 30);
        const two = LocalTime.of(20, 10, 10);
        const three = LocalTime.of(10, 20, 30);

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

        expect(LocalTime.of(1, 2, 3).compare(LocalTime.of(1, 1, 2))).toBe(1);
        expect(LocalTime.of(1, 2, 3).compare(LocalTime.of(1, 2, 4))).toBe(-1);
        expect(LocalTime.of(0).compare(LocalTime.of(0))).toBe(0);
    });

    it('should serialize to JSON in the ISO-8601 format', () => {
        const localTime = LocalTime.of(20, 6, 59, 123456789);

        expect(localTime.toJSON()).toBe('20:06:59.123456789');
    });
});
