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

    it.each([
        [16678, LocalDate.of(2015, 8, 31)],
        [16493, LocalDate.of(2015, 2, 27)],
        [16858, LocalDate.of(2016, 2, 27)],
        [-1, LocalDate.of(1969, 12, 31)],
        [1, LocalDate.of(1970, 1, 2)],
    ])('can be created from the number of days since the epoch', (days: number, expected: LocalDate) => {
        expect(LocalDate.ofEpochDay(days)).toStrictEqual(expected);
    });

    it.each([
        LocalDate.MIN_EPOCH_DAY - 1,
        LocalDate.MAX_EPOCH_DAY + 1,
    ])('should fail to create from an epoch day out of range', epochDay => {
        expect(() => LocalDate.ofEpochDay(epochDay)).toThrowError(
            `The day ${epochDay} is out of the range [${LocalDate.MIN_EPOCH_DAY} - ${LocalDate.MAX_EPOCH_DAY}].`,
        );
    });

    it('can be created from a native Date object', () => {
        const date = new Date('August 31, 2015');
        const localDate = LocalDate.fromNative(date);

        expect(localDate.toString()).toBe('2015-08-31');
    });

    it.each(Object.entries({
        'unsafe years number': Number.MAX_VALUE,
        [`years number less than ${LocalDate.MIN_YEAR}`]: LocalDate.MIN_YEAR - 1,
        [`years number greater than ${LocalDate.MAX_YEAR}`]: LocalDate.MAX_YEAR + 1,
        'fractional years number': 1.5,
    }))('should reject %s', (_, year) => {
        expect(() => LocalDate.of(year, 1, 1)).toThrowError(
            `Year must be a safe integer between ${LocalDate.MIN_YEAR} and ${LocalDate.MAX_YEAR}.`,
        );
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

    it.each([
        [LocalDate.of(2015, 8, 31), -365, LocalDate.of(2014, 8, 31)],
        [LocalDate.of(2015, 8, 31), -2, LocalDate.of(2015, 8, 29)],
        [LocalDate.of(2015, 8, 31), -1, LocalDate.of(2015, 8, 30)],
        [LocalDate.of(2015, 8, 31), 0, LocalDate.of(2015, 8, 31)],
        [LocalDate.of(2015, 8, 31), 1, LocalDate.of(2015, 9, 1)],
        [LocalDate.of(2015, 8, 31), 2, LocalDate.of(2015, 9, 2)],
        [LocalDate.of(2015, 8, 31), 366, LocalDate.of(2016, 8, 31)],
        [LocalDate.of(2015, 12, 10), 5, LocalDate.of(2015, 12, 15)],
        [LocalDate.of(2015, 12, 10), 40, LocalDate.of(2016, 1, 19)],
    ])(
        'can create a copy with an amount of days added',
        (localDate: LocalDate, days: number, expected: LocalDate) => {
            expect(localDate.plusDays(days)).toStrictEqual(expected);
        },
    );

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

    it.each([
        [LocalDate.of(2015, 8, 31), 16678],
        [LocalDate.of(2015, 2, 27), 16493],
        [LocalDate.of(2016, 2, 27), 16858],
        [LocalDate.of(1969, 12, 31), -1],
        [LocalDate.of(1970, 1, 2), 1],
    ])('can be converted to an epoch day', (localDate: LocalDate, expected: number) => {
        expect(localDate.toEpochDay()).toStrictEqual(expected);
    });

    it('should serialize to JSON in the ISO-8601 format', () => {
        const localDate = LocalDate.of(2015, 8, 30);

        expect(localDate.toJSON()).toBe('2015-08-30');
    });
});
