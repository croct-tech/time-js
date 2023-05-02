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
        [LocalDate.MIN_EPOCH_DAY, LocalDate.MIN],
        [LocalDate.MAX_EPOCH_DAY, LocalDate.MAX],
    ])('can be created from the number of days since the epoch', (days: number, expected: LocalDate) => {
        expect(LocalDate.ofEpochDay(days)).toStrictEqual(expected);
    });

    it.each([
        LocalDate.MIN_EPOCH_DAY - 1,
        LocalDate.MAX_EPOCH_DAY + 1,
    ])('should fail to create from an epoch day out of range', epochDay => {
        expect(() => LocalDate.ofEpochDay(epochDay)).toThrow(
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
        expect(() => LocalDate.of(year, 1, 1)).toThrow(
            `Year must be a safe integer between ${LocalDate.MIN_YEAR} and ${LocalDate.MAX_YEAR}.`,
        );
    });

    it.each(Object.entries({
        'fractional months number': 1.5,
        'months number less than 1': 0,
        'months number greater than 12': 13,
    }))('should reject %s', (_, month) => {
        expect(() => LocalDate.of(1970, month, 1)).toThrow('Month must be an integer between 1 and 12.');
    });

    it('should reject invalid days number', () => {
        expect(() => LocalDate.of(1970, 1, 1.5)).toThrow('Day must be an integer between 1 and 31.');

        expect(() => LocalDate.of(1970, 1, 0)).toThrow('Day must be an integer between 1 and 31.');

        expect(() => LocalDate.of(1970, 1, 32)).toThrow('Day must be an integer between 1 and 31.');

        expect(() => LocalDate.of(1970, 4, 31)).toThrow('Day must be an integer between 1 and 30.');

        expect(() => LocalDate.of(1976, 2, 30)).toThrow('Day must be an integer between 1 and 29.');

        expect(() => LocalDate.of(2000, 2, 30)).toThrow('Day must be an integer between 1 and 29.');

        expect(() => LocalDate.of(1970, 2, 29)).toThrow('Day must be an integer between 1 and 28.');
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
        expect(() => LocalDate.parse(value)).toThrow(`Invalid ISO-8601 date string: ${value}`);
    });

    it('can be converted to a string in the ISO-8601 format', () => {
        const localDate = LocalDate.of(2015, 8, 30);

        expect(localDate.toString()).toBe('2015-08-30');
    });

    it.each([
        [-5, LocalDate.of(2011, 2, 28)],
        [-4, LocalDate.of(2012, 2, 29)],
        [-3, LocalDate.of(2013, 2, 28)],
        [-2, LocalDate.of(2014, 2, 28)],
        [-1, LocalDate.of(2015, 2, 28)],
        [0, LocalDate.of(2016, 2, 29)],
        [1, LocalDate.of(2017, 2, 28)],
        [2, LocalDate.of(2018, 2, 28)],
        [3, LocalDate.of(2019, 2, 28)],
        [4, LocalDate.of(2020, 2, 29)],
        [5, LocalDate.of(2021, 2, 28)],
    ])('can create a copy with an amount of years added', (years: number, expected: LocalDate) => {
        const localDate = LocalDate.of(2016, 2, 29);

        expect(localDate.plusYears(years)).toStrictEqual(expected);
    });

    it.each([
        [Number.MAX_SAFE_INTEGER, 'The result overflows the range of safe integers.'],
        [Number.MIN_SAFE_INTEGER, 'Year must be a safe integer between -999999 and 999999.'],
    ])(
        'cannot calculate the years addition because the result exceeds the supported date-time range',
        (years: number, errorMessage: string) => {
            const localDate = LocalDate.of(2015, 8, 31);

            expect(() => localDate.plusYears(years)).toThrow(errorMessage);
        },
    );

    it.each([
        [5, LocalDate.of(2011, 2, 28)],
        [4, LocalDate.of(2012, 2, 29)],
        [3, LocalDate.of(2013, 2, 28)],
        [2, LocalDate.of(2014, 2, 28)],
        [1, LocalDate.of(2015, 2, 28)],
        [0, LocalDate.of(2016, 2, 29)],
        [-1, LocalDate.of(2017, 2, 28)],
        [-2, LocalDate.of(2018, 2, 28)],
        [-3, LocalDate.of(2019, 2, 28)],
        [-4, LocalDate.of(2020, 2, 29)],
        [-5, LocalDate.of(2021, 2, 28)],
    ])('can create a copy with an amount of years subtracted', (years: number, expected: LocalDate) => {
        const localDate = LocalDate.of(2016, 2, 29);

        expect(localDate.minusYears(years)).toStrictEqual(expected);
    });

    it.each([
        [Number.MAX_SAFE_INTEGER, 'Year must be a safe integer between -999999 and 999999.'],
        [Number.MIN_SAFE_INTEGER, 'The result overflows the range of safe integers.'],
    ])(
        'cannot calculate the years subtraction because the result exceeds the supported date-time range',
        (years: number, errorMessage: string) => {
            const localDate = LocalDate.of(2015, 8, 31);

            expect(() => localDate.minusYears(years)).toThrow(errorMessage);
        },
    );

    it.each([
        // February 29th cases.
        [
            -48,
            LocalDate.of(2016, 2, 29),
            LocalDate.of(2012, 2, 29),
        ],
        [
            -12,
            LocalDate.of(2016, 2, 29),
            LocalDate.of(2015, 2, 28),
        ],
        [
            -1,
            LocalDate.of(2016, 2, 29),
            LocalDate.of(2016, 1, 29),
        ],
        [
            0,
            LocalDate.of(2016, 2, 29),
            LocalDate.of(2016, 2, 29),
        ],
        [
            1,
            LocalDate.of(2016, 2, 29),
            LocalDate.of(2016, 3, 29),
        ],
        [
            12,
            LocalDate.of(2016, 2, 29),
            LocalDate.of(2017, 2, 28),
        ],
        [
            48,
            LocalDate.of(2016, 2, 29),
            LocalDate.of(2020, 2, 29),
        ],

        // Regular cases.
        [
            -2,
            LocalDate.of(2015, 8, 31),
            LocalDate.of(2015, 6, 30),
        ],
        [
            -1,
            LocalDate.of(2015, 8, 31),
            LocalDate.of(2015, 7, 31),
        ],
        [
            0,
            LocalDate.of(2015, 8, 31),
            LocalDate.of(2015, 8, 31),
        ],
        [
            1,
            LocalDate.of(2015, 8, 31),
            LocalDate.of(2015, 9, 30),
        ],
        [
            2,
            LocalDate.of(2015, 8, 31),
            LocalDate.of(2015, 10, 31),
        ],
    ])(
        'can create a copy with an amount of months added',
        (months: number, localDate: LocalDate, expected: LocalDate) => {
            expect(localDate.plusMonths(months)).toStrictEqual(expected);
        },
    );

    it.each([
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
    ])(
        'cannot calculate the months addition because the result exceeds the supported date-time range',
        (months: number) => {
            const localDate = LocalDate.of(2015, 8, 31);

            expect(() => localDate.plusMonths(months)).toThrow(
                'Year must be a safe integer between -999999 and 999999.',
            );
        },
    );

    it.each([
        // February 29th cases.
        [
            48,
            LocalDate.of(2016, 2, 29),
            LocalDate.of(2012, 2, 29),
        ],
        [
            12,
            LocalDate.of(2016, 2, 29),
            LocalDate.of(2015, 2, 28),
        ],
        [
            1,
            LocalDate.of(2016, 2, 29),
            LocalDate.of(2016, 1, 29),
        ],
        [
            0,
            LocalDate.of(2016, 2, 29),
            LocalDate.of(2016, 2, 29),
        ],
        [
            -1,
            LocalDate.of(2016, 2, 29),
            LocalDate.of(2016, 3, 29),
        ],
        [
            -12,
            LocalDate.of(2016, 2, 29),
            LocalDate.of(2017, 2, 28),
        ],
        [
            -48,
            LocalDate.of(2016, 2, 29),
            LocalDate.of(2020, 2, 29),
        ],

        // Regular cases.
        [
            2,
            LocalDate.of(2015, 8, 31),
            LocalDate.of(2015, 6, 30),
        ],
        [
            1,
            LocalDate.of(2015, 8, 31),
            LocalDate.of(2015, 7, 31),
        ],
        [
            0,
            LocalDate.of(2015, 8, 31),
            LocalDate.of(2015, 8, 31),
        ],
        [
            -1,
            LocalDate.of(2015, 8, 31),
            LocalDate.of(2015, 9, 30),
        ],
        [
            -2,
            LocalDate.of(2015, 8, 31),
            LocalDate.of(2015, 10, 31),
        ],
    ])(
        'can create a copy with an amount of months subtracted',
        (months: number, localDate: LocalDate, expected: LocalDate) => {
            expect(localDate.minusMonths(months)).toStrictEqual(expected);
        },
    );

    it.each([
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
    ])(
        'cannot calculate the months subtraction because the result exceeds the supported date-time range',
        (months: number) => {
            const localDate = LocalDate.of(2015, 8, 31);

            expect(() => localDate.minusMonths(months)).toThrow(
                'Year must be a safe integer between -999999 and 999999.',
            );
        },
    );

    it.each([
        [-2, LocalDate.of(2015, 8, 17)],
        [-1, LocalDate.of(2015, 8, 24)],
        [0, LocalDate.of(2015, 8, 31)],
        [1, LocalDate.of(2015, 9, 7)],
        [2, LocalDate.of(2015, 9, 14)],
    ])('can create a copy with an amount of weeks added', (weeks: number, expected: LocalDate) => {
        const localDate = LocalDate.of(2015, 8, 31);

        expect(localDate.plusWeeks(weeks)).toStrictEqual(expected);
    });

    it.each([
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
    ])(
        'cannot calculate the weeks addition because the result exceeds the supported date-time range',
        (weeks: number) => {
            const localDate = LocalDate.of(2015, 8, 31);

            expect(() => localDate.plusWeeks(weeks)).toThrow('The result overflows the range of safe integers.');
        },
    );

    it.each([
        [2, LocalDate.of(2015, 8, 17)],
        [1, LocalDate.of(2015, 8, 24)],
        [0, LocalDate.of(2015, 8, 31)],
        [-1, LocalDate.of(2015, 9, 7)],
        [-2, LocalDate.of(2015, 9, 14)],
    ])('can create a copy with an amount of weeks subtracted', (weeks: number, expected: LocalDate) => {
        const localDate = LocalDate.of(2015, 8, 31);

        expect(localDate.minusWeeks(weeks)).toStrictEqual(expected);
    });

    it.each([
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
    ])(
        'cannot calculate the weeks subtraction because the result exceeds the supported date-time range',
        (weeks: number) => {
            const localDate = LocalDate.of(2015, 8, 31);

            expect(() => localDate.minusWeeks(weeks)).toThrow('The result overflows the range of safe integers.');
        },
    );

    it.each([
        [
            -365,
            LocalDate.of(2015, 8, 31),
            LocalDate.of(2014, 8, 31),
        ],
        [
            -2,
            LocalDate.of(2015, 8, 31),
            LocalDate.of(2015, 8, 29),
        ],
        [
            -1,
            LocalDate.of(2015, 8, 31),
            LocalDate.of(2015, 8, 30),
        ],
        [
            0,
            LocalDate.of(2015, 8, 31),
            LocalDate.of(2015, 8, 31),
        ],
        [
            1,
            LocalDate.of(2015, 8, 31),
            LocalDate.of(2015, 9, 1),
        ],
        [
            2,
            LocalDate.of(2015, 8, 31),
            LocalDate.of(2015, 9, 2),
        ],
        [
            366,
            LocalDate.of(2015, 8, 31),
            LocalDate.of(2016, 8, 31),
        ],
        [
            5,
            LocalDate.of(2015, 12, 10),
            LocalDate.of(2015, 12, 15),
        ],
        [
            40,
            LocalDate.of(2015, 12, 10),
            LocalDate.of(2016, 1, 19),
        ],
    ])(
        'can create a copy with an amount of days added',
        (days: number, localDate: LocalDate, expected: LocalDate) => {
            expect(localDate.plusDays(days)).toStrictEqual(expected);
        },
    );

    it.each([
        [Number.MAX_SAFE_INTEGER, 'The result overflows the range of safe integers.'],
        [Number.MIN_SAFE_INTEGER, 'The day -9007199254724313 is out of the range [-365961662 - 364522971].'],
    ])(
        'cannot calculate the days addition because the result exceeds the supported date-time range',
        (days: number, errorMessage: string) => {
            const localDate = LocalDate.of(2015, 8, 31);

            expect(() => localDate.plusDays(days)).toThrow(errorMessage);
        },
    );

    it.each([
        [
            365,
            LocalDate.of(2015, 8, 31),
            LocalDate.of(2014, 8, 31),
        ],
        [
            2,
            LocalDate.of(2015, 8, 31),
            LocalDate.of(2015, 8, 29),
        ],
        [
            1,
            LocalDate.of(2015, 8, 31),
            LocalDate.of(2015, 8, 30),
        ],
        [
            0,
            LocalDate.of(2015, 8, 31),
            LocalDate.of(2015, 8, 31),
        ],
        [
            -1,
            LocalDate.of(2015, 8, 31),
            LocalDate.of(2015, 9, 1),
        ],
        [
            -2,
            LocalDate.of(2015, 8, 31),
            LocalDate.of(2015, 9, 2),
        ],
        [
            -366,
            LocalDate.of(2015, 8, 31),
            LocalDate.of(2016, 8, 31),
        ],
        [
            -5,
            LocalDate.of(2015, 12, 10),
            LocalDate.of(2015, 12, 15),
        ],
        [
            -40,
            LocalDate.of(2015, 12, 10),
            LocalDate.of(2016, 1, 19),
        ],
    ])(
        'can create a copy with an amount of days subtracted',
        (days: number, localDate: LocalDate, expected: LocalDate) => {
            expect(localDate.minusDays(days)).toStrictEqual(expected);
        },
    );

    it.each([
        [Number.MAX_SAFE_INTEGER, 'The day -9007199254724313 is out of the range [-365961662 - 364522971].'],
        [Number.MIN_SAFE_INTEGER, 'The result overflows the range of safe integers.'],
    ])(
        'cannot calculate the days subtraction because the result exceeds the supported date-time range',
        (days: number, errorMessage: string) => {
            const localDate = LocalDate.of(2015, 8, 31);

            expect(() => localDate.minusDays(days)).toThrow(errorMessage);
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
        [LocalDate.MIN, LocalDate.MIN_EPOCH_DAY],
        [LocalDate.MAX, LocalDate.MAX_EPOCH_DAY],
    ])('can be converted to an epoch day', (localDate: LocalDate, expected: number) => {
        expect(localDate.toEpochDay()).toStrictEqual(expected);
    });

    it('should serialize to JSON in the ISO-8601 format', () => {
        const localDate = LocalDate.of(2015, 8, 30);

        expect(localDate.toJSON()).toBe('2015-08-30');
    });
});
