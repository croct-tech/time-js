import {LocalDate} from '../src';

describe('A value object representing a local date', () => {
    it('can be created from its components', () => {
        const year = 1970;
        const month = 1;
        const day = 1;
        const localDate = LocalDate.of(year, month, day);

        expect(localDate.getYear()).toBe(year);
        expect(localDate.getMonth()).toBe(month);
        expect(localDate.getDay()).toBe(day);
    });

    it('can be created from a native Date object', () => {
        const date = new Date('August 19, 1975');
        const localDate = LocalDate.fromNative(date);

        expect(localDate.toString()).toBe('1975-08-19');
    });

    it.each(Object.entries({
        'unsafe years number': 2 ** 53,
        'fractional years number': 1.5,
    }))('should reject %s', (_, year) => {
        expect(() => LocalDate.of(year, 1, 1)).toThrowError('Year must be a safe integer.');
    });

    it.each(Object.entries({
        'fractional months number': 1.5,
        'months number less than 1': 0,
        'months number greater than 12': 13,
    }))('should reject %s', (_, month) => {
        expect(() => LocalDate.of(1970, month, 1)).toThrowError('Month must be an integer between 1 and 12.');
    });

    it('should reject invalid days number', () => {
        expect(() => LocalDate.of(1970, 1, 1.5)).toThrowError('Day must be an integer between 1 and 31.');

        expect(() => LocalDate.of(1970, 1, 0)).toThrowError('Day must be an integer between 1 and 31.');

        expect(() => LocalDate.of(1970, 1, 32)).toThrowError('Day must be an integer between 1 and 31.');

        expect(() => LocalDate.of(1970, 4, 31)).toThrowError('Day must be an integer between 1 and 30.');

        expect(() => LocalDate.of(1976, 2, 30)).toThrowError('Day must be an integer between 1 and 29.');

        expect(() => LocalDate.of(2000, 2, 30)).toThrowError('Day must be an integer between 1 and 29.');

        expect(() => LocalDate.of(1970, 2, 29)).toThrowError('Day must be an integer between 1 and 28.');
    });

    it('should parse a valid ISO-8601 date', () => {
        const date = '2015-08-30';
        const localDate = LocalDate.parse(date);

        expect(localDate.toString()).toBe(date);
    });

    it.each([
        '2015-08-30T12:34:56',
        '20150830',
        '2015/08/30',
        '30/08/2015',
        'Aug 30, 2015',
        '2015, Aug 30',
    ])('should fail to parse invalid ISO-8601 dates', value => {
        expect(() => LocalDate.parse(value)).toThrowError(`Invalid ISO-8601 date string: ${value}`);
    });

    it('can be converted to a string in the ISO-8601 format', () => {
        const localDate = LocalDate.of(2015, 8, 30);

        expect(localDate.toString()).toBe('2015-08-30');
    });

    it('should be comparable', () => {
        const one = LocalDate.of(2015, 8, 30);
        const two = LocalDate.of(2015, 9, 30);
        const three = LocalDate.of(2015, 8, 30);

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

        expect(LocalDate.of(1, 2, 3).compare(LocalDate.of(1, 1, 2))).toBe(1);
        expect(LocalDate.of(1, 2, 3).compare(LocalDate.of(1, 2, 4))).toBe(-1);
        expect(LocalDate.of(1, 1, 1).compare(LocalDate.of(1, 1, 1))).toBe(0);
    });

    it('should serialize to JSON in the ISO-8601 format', () => {
        const localDate = LocalDate.of(2015, 8, 30);

        expect(localDate.toJSON()).toBe('2015-08-30');
    });
});
