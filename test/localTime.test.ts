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
