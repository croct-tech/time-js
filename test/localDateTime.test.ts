import {Instant, LocalDate, LocalDateTime, LocalTime, TimeZone} from '../src';
import {FixedClock} from '../src/clock/fixedClock';

describe('A value object representing a local date time', () => {
    it('can be created from its components', () => {
        const year = 1970;
        const month = 1;
        const day = 1;
        const localDate = LocalDate.of(year, month, day);

        const hour = 14;
        const minute = 20;
        const second = 5;
        const nanos = 1000;
        const localTime = LocalTime.of(hour, minute, second, nanos);

        const localDateTime = LocalDateTime.of(localDate, localTime);

        expect(localDateTime.getYear()).toBe(year);
        expect(localDateTime.getMonth()).toBe(month);
        expect(localDateTime.getDay()).toBe(day);

        expect(localDateTime.getLocalDate()).toBe(localDate);

        expect(localDateTime.getHour()).toBe(hour);
        expect(localDateTime.getMinute()).toBe(minute);
        expect(localDateTime.getSecond()).toBe(second);
        expect(localDateTime.getNano()).toBe(nanos);

        expect(localDateTime.getLocalTime()).toBe(localTime);
    });

    it('can be created from a native Date object', () => {
        expect(LocalDateTime.fromNative(new Date(2015, 7, 31, 23, 15, 30, 123)).toString())
            .toBe('2015-08-31T23:15:30.123');
    });

    it('can be created at the start of the day', () => {
        const year = 1970;
        const month = 1;
        const day = 1;
        const localDate = LocalDate.of(year, month, day);
        const localDateTime = LocalDateTime.of(localDate);

        expect(localDateTime.getYear()).toBe(year);
        expect(localDateTime.getMonth()).toBe(month);
        expect(localDateTime.getDay()).toBe(day);

        expect(localDateTime.getHour()).toBe(0);
        expect(localDateTime.getMinute()).toBe(0);
        expect(localDateTime.getSecond()).toBe(0);
        expect(localDateTime.getNano()).toBe(0);
    });

    it.each([
        ['2015-08-31T12:11:59.123456789Z', TimeZone.of('America/Sao_Paulo'), '2015-08-31T09:11:59.123'],
        ['2015-08-31T00:00:00.123456789Z', TimeZone.of('UTC'), '2015-08-31T00:00:00.123'],
    ])(
        'can provide the current local date time from the given clock',
        (currentTime: string, timeZone: TimeZone, localDateTime: string) => {
            const clock = FixedClock.of(Instant.parse(currentTime), timeZone);

            const now = LocalDateTime.now(clock);

            expect(now.toString()).toBe(localDateTime);
        },
    );

    it.each([
        ['2015-08-31T12:11:59.123456789Z', TimeZone.of('America/Sao_Paulo'), '2015-08-31T09:11:59.123'],
        ['2015-08-31T00:00:00.123456789Z', TimeZone.of('UTC'), '2015-08-31T00:00:00.123'],
    ])(
        'can provide the current local date time from the system clock in a given time zone',
        (currentTime: string, timeZone: TimeZone, localDateTime: string) => {
            jest.useFakeTimers()
                .setSystemTime(new Date(currentTime).getTime());

            const now = LocalDateTime.nowIn(timeZone);

            expect(now.toString()).toBe(localDateTime);
        },
    );

    it('should parse a valid ISO-8601 date time', () => {
        const dateTime = '2015-08-30T14:20:05.123';
        const localDateTime = LocalDateTime.parse(dateTime);

        expect(localDateTime.toString()).toBe(dateTime);
    });

    it('should fail to parse a invalid ISO-8601 date time', () => {
        expect(() => LocalDateTime.parse('2015-08-30'))
            .toThrow('Malformed local date-time "2015-08-30".');
    });

    type ConversionScenario = {
        input: LocalDateTime,
        timeZone: TimeZone,
        expected: string,
    };

    it.each<ConversionScenario>([
        {
            input: LocalDateTime.of(LocalDate.of(2018, 11, 4), LocalTime.of(0, 0, 0)),
            timeZone: TimeZone.of('America/Sao_Paulo'),
            // In November 4th 2018 at 00:00:00 in Sao Paulo there was a daylight saving time change
            // from -03:00 to -02:00. The local time 00:00:00 does not exist in -02:00.
            expected: '2018-11-04T03:00:00Z',
        },
        {
            input: LocalDateTime.of(LocalDate.of(2019, 2, 16), LocalTime.of(0, 0, 0)),
            timeZone: TimeZone.of('America/Sao_Paulo'),
            // In February 16th 2019 at 00:00:00 in Sao Paulo there was a daylight saving time change
            // from -02:00 to -03:00. The local time 00:00:00 occurs twice in -03:00.
            expected: '2019-02-16T02:00:00Z',
        },
        {
            input: LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 999999999)),
            // In August 31st 2015 at 01:02:03.999999999, the time zone offset was -03:00.
            timeZone: TimeZone.of('America/Sao_Paulo'),
            expected: '2015-08-31T04:02:03.999999999Z',
        },
        {
            input: LocalDateTime.of(LocalDate.of(2022, 9, 25), LocalTime.of(2, 45, 0)),
            // In September 25th 2022 at 02:45:00, the time zone offset changed from +12:45 to +13:45.
            // 2022-09-25T03:45:00 - 13:45 = 2022-09-24T14:00:00
            timeZone: TimeZone.of('Pacific/Chatham'),
            expected: '2022-09-24T14:00:00Z',
        },
        {
            input: LocalDateTime.of(LocalDate.of(2022, 10, 2), LocalTime.of(2, 0, 0)),
            // In October 2nd 2022 at 02:00:00, the time zone offset changed from +11:00 to +10:30
            timeZone: TimeZone.of('Australia/Lord_Howe'),
            expected: '2022-10-01T15:30:00Z',
        },
        {
            input: LocalDateTime.of(LocalDate.of(1, 10, 2)),
            timeZone: TimeZone.of('UTC'),
            expected: '0001-10-02T00:00:00Z',
        },
    ])('should convert $input to $expected', ({input, timeZone, expected}) => {
        expect(input.toInstant(timeZone).toString()).toBe(expected);
    });

    it('can be created from the number of seconds since the UNIX epoch', () => {
        const localDateTime = LocalDateTime.ofEpochSecond(1440979200, 0);

        expect(localDateTime.toString()).toBe('2015-08-31T00:00');
    });

    it('can be converted to a string in the ISO-8601 format', () => {
        const localDate = LocalDate.of(2020, 4, 10);
        const localTime = LocalTime.of(15, 2, 1, 2222);
        const localDateTime = LocalDateTime.of(localDate, localTime);

        expect(localDateTime.toString()).toBe('2020-04-10T15:02:01.000002222');
    });

    it.each([
        [-5, LocalDateTime.of(LocalDate.of(2011, 2, 28), LocalTime.of(1, 2, 3))],
        [-4, LocalDateTime.of(LocalDate.of(2012, 2, 29), LocalTime.of(1, 2, 3))],
        [-3, LocalDateTime.of(LocalDate.of(2013, 2, 28), LocalTime.of(1, 2, 3))],
        [-2, LocalDateTime.of(LocalDate.of(2014, 2, 28), LocalTime.of(1, 2, 3))],
        [-1, LocalDateTime.of(LocalDate.of(2015, 2, 28), LocalTime.of(1, 2, 3))],
        [0, LocalDateTime.of(LocalDate.of(2016, 2, 29), LocalTime.of(1, 2, 3))],
        [1, LocalDateTime.of(LocalDate.of(2017, 2, 28), LocalTime.of(1, 2, 3))],
        [2, LocalDateTime.of(LocalDate.of(2018, 2, 28), LocalTime.of(1, 2, 3))],
        [3, LocalDateTime.of(LocalDate.of(2019, 2, 28), LocalTime.of(1, 2, 3))],
        [4, LocalDateTime.of(LocalDate.of(2020, 2, 29), LocalTime.of(1, 2, 3))],
        [5, LocalDateTime.of(LocalDate.of(2021, 2, 28), LocalTime.of(1, 2, 3))],
    ])('can create a copy with an amount of years added', (years: number, expected: LocalDateTime) => {
        const localDateTime = LocalDateTime.of(LocalDate.of(2016, 2, 29), LocalTime.of(1, 2, 3));

        expect(localDateTime.plusYears(years)).toStrictEqual(expected);
    });

    it.each([
        [Number.MAX_SAFE_INTEGER, 'The result overflows the range of safe integers.'],
        [Number.MIN_SAFE_INTEGER, 'Year must be a safe integer between -999999 and 999999.'],
    ])(
        'cannot calculate the years addition because the result exceeds the supported date-time range',
        (years: number, errorMessage: string) => {
            const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

            expect(() => localDateTime.plusYears(years)).toThrow(errorMessage);
        },
    );

    it.each([
        [5, LocalDateTime.of(LocalDate.of(2011, 2, 28), LocalTime.of(1, 2, 3))],
        [4, LocalDateTime.of(LocalDate.of(2012, 2, 29), LocalTime.of(1, 2, 3))],
        [3, LocalDateTime.of(LocalDate.of(2013, 2, 28), LocalTime.of(1, 2, 3))],
        [2, LocalDateTime.of(LocalDate.of(2014, 2, 28), LocalTime.of(1, 2, 3))],
        [1, LocalDateTime.of(LocalDate.of(2015, 2, 28), LocalTime.of(1, 2, 3))],
        [0, LocalDateTime.of(LocalDate.of(2016, 2, 29), LocalTime.of(1, 2, 3))],
        [-1, LocalDateTime.of(LocalDate.of(2017, 2, 28), LocalTime.of(1, 2, 3))],
        [-2, LocalDateTime.of(LocalDate.of(2018, 2, 28), LocalTime.of(1, 2, 3))],
        [-3, LocalDateTime.of(LocalDate.of(2019, 2, 28), LocalTime.of(1, 2, 3))],
        [-4, LocalDateTime.of(LocalDate.of(2020, 2, 29), LocalTime.of(1, 2, 3))],
        [-5, LocalDateTime.of(LocalDate.of(2021, 2, 28), LocalTime.of(1, 2, 3))],
    ])('can create a copy with an amount of years subtracted', (years: number, expected: LocalDateTime) => {
        const localDateTime = LocalDateTime.of(LocalDate.of(2016, 2, 29), LocalTime.of(1, 2, 3));

        expect(localDateTime.minusYears(years)).toStrictEqual(expected);
    });

    it.each([
        [Number.MAX_SAFE_INTEGER, 'Year must be a safe integer between -999999 and 999999.'],
        [Number.MIN_SAFE_INTEGER, 'The result overflows the range of safe integers.'],
    ])(
        'cannot calculate the years subtraction because the result exceeds the supported date-time range',
        (years: number, errorMessage: string) => {
            const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

            expect(() => localDateTime.minusYears(years)).toThrow(errorMessage);
        },
    );

    it.each([
        // February 29th cases.
        [
            -48,
            LocalDateTime.of(LocalDate.of(2016, 2, 29), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2012, 2, 29), LocalTime.of(1, 2, 3)),
        ],
        [
            -12,
            LocalDateTime.of(LocalDate.of(2016, 2, 29), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2015, 2, 28), LocalTime.of(1, 2, 3)),
        ],
        [
            -1,
            LocalDateTime.of(LocalDate.of(2016, 2, 29), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2016, 1, 29), LocalTime.of(1, 2, 3)),
        ],
        [
            0,
            LocalDateTime.of(LocalDate.of(2016, 2, 29), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2016, 2, 29), LocalTime.of(1, 2, 3)),
        ],
        [
            1,
            LocalDateTime.of(LocalDate.of(2016, 2, 29), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2016, 3, 29), LocalTime.of(1, 2, 3)),
        ],
        [
            12,
            LocalDateTime.of(LocalDate.of(2016, 2, 29), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2017, 2, 28), LocalTime.of(1, 2, 3)),
        ],
        [
            48,
            LocalDateTime.of(LocalDate.of(2016, 2, 29), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2020, 2, 29), LocalTime.of(1, 2, 3)),
        ],
        // Regular cases.
        [
            -2,
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2015, 6, 30), LocalTime.of(1, 2, 3)),
        ],
        [
            -1,
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2015, 7, 31), LocalTime.of(1, 2, 3)),
        ],
        [
            0,
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
        ],
        [
            1,
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2015, 9, 30), LocalTime.of(1, 2, 3)),
        ],
        [
            2,
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2015, 10, 31), LocalTime.of(1, 2, 3)),
        ],
    ])(
        'can create a copy with an amount of months added',
        (months: number, localDateTime: LocalDateTime, expected: LocalDateTime) => {
            expect(localDateTime.plusMonths(months)).toStrictEqual(expected);
        },
    );

    it.each([
        [Number.MAX_SAFE_INTEGER, 'Year must be a safe integer between -999999 and 999999.'],
        [Number.MIN_SAFE_INTEGER, 'Year must be a safe integer between -999999 and 999999.'],
    ])(
        'cannot calculate the months addition because the result exceeds the supported date-time range',
        (months: number, errorMessage: string) => {
            const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

            expect(() => localDateTime.plusMonths(months)).toThrow(errorMessage);
        },
    );

    it.each([
        // February 29th cases.
        [
            48,
            LocalDateTime.of(LocalDate.of(2016, 2, 29), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2012, 2, 29), LocalTime.of(1, 2, 3)),
        ],
        [
            12,
            LocalDateTime.of(LocalDate.of(2016, 2, 29), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2015, 2, 28), LocalTime.of(1, 2, 3)),
        ],
        [
            1,
            LocalDateTime.of(LocalDate.of(2016, 2, 29), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2016, 1, 29), LocalTime.of(1, 2, 3)),
        ],
        [
            0,
            LocalDateTime.of(LocalDate.of(2016, 2, 29), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2016, 2, 29), LocalTime.of(1, 2, 3)),
        ],
        [
            -1,
            LocalDateTime.of(LocalDate.of(2016, 2, 29), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2016, 3, 29), LocalTime.of(1, 2, 3)),
        ],
        [
            -12,
            LocalDateTime.of(LocalDate.of(2016, 2, 29), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2017, 2, 28), LocalTime.of(1, 2, 3)),
        ],
        [
            -48,
            LocalDateTime.of(LocalDate.of(2016, 2, 29), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2020, 2, 29), LocalTime.of(1, 2, 3)),
        ],

        // Regular cases.
        [
            2,
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2015, 6, 30), LocalTime.of(1, 2, 3)),
        ],
        [
            1,
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2015, 7, 31), LocalTime.of(1, 2, 3)),
        ],
        [
            0,
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
        ],
        [
            -1,
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2015, 9, 30), LocalTime.of(1, 2, 3)),
        ],
        [
            -2,
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2015, 10, 31), LocalTime.of(1, 2, 3)),
        ],
    ])(
        'can create a copy with an amount of months subtracted',
        (months: number, localDateTime: LocalDateTime, expected: LocalDateTime) => {
            expect(localDateTime.minusMonths(months)).toStrictEqual(expected);
        },
    );

    it.each([
        [Number.MAX_SAFE_INTEGER, 'Year must be a safe integer between -999999 and 999999.'],
        [Number.MIN_SAFE_INTEGER, 'Year must be a safe integer between -999999 and 999999.'],
    ])(
        'cannot calculate the months subtraction because the result exceeds the supported date-time range',
        (months: number, errorMessage: string) => {
            const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

            expect(() => localDateTime.minusMonths(months)).toThrow(errorMessage);
        },
    );

    it.each([
        [-2, LocalDateTime.of(LocalDate.of(2015, 8, 17), LocalTime.of(1, 2, 3))],
        [-1, LocalDateTime.of(LocalDate.of(2015, 8, 24), LocalTime.of(1, 2, 3))],
        [0, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3))],
        [1, LocalDateTime.of(LocalDate.of(2015, 9, 7), LocalTime.of(1, 2, 3))],
        [2, LocalDateTime.of(LocalDate.of(2015, 9, 14), LocalTime.of(1, 2, 3))],
    ])('can create a copy with an amount of weeks added', (weeks: number, expected: LocalDateTime) => {
        const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

        expect(localDateTime.plusWeeks(weeks)).toStrictEqual(expected);
    });

    it.each([
        [Number.MAX_SAFE_INTEGER, 'The result overflows the range of safe integers.'],
        [Number.MIN_SAFE_INTEGER, 'The result overflows the range of safe integers.'],
    ])(
        'cannot calculate the weeks addition because the result exceeds the supported date-time range',
        (weeks: number, errorMessage: string) => {
            const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

            expect(() => localDateTime.plusWeeks(weeks)).toThrow(errorMessage);
        },
    );

    it.each([
        [2, LocalDateTime.of(LocalDate.of(2015, 8, 17), LocalTime.of(1, 2, 3))],
        [1, LocalDateTime.of(LocalDate.of(2015, 8, 24), LocalTime.of(1, 2, 3))],
        [0, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3))],
        [-1, LocalDateTime.of(LocalDate.of(2015, 9, 7), LocalTime.of(1, 2, 3))],
        [-2, LocalDateTime.of(LocalDate.of(2015, 9, 14), LocalTime.of(1, 2, 3))],
    ])('can create a copy with an amount of weeks subtracted', (weeks: number, expected: LocalDateTime) => {
        const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

        expect(localDateTime.minusWeeks(weeks)).toStrictEqual(expected);
    });

    it.each([
        [Number.MAX_SAFE_INTEGER, 'The result overflows the range of safe integers.'],
        [Number.MIN_SAFE_INTEGER, 'The result overflows the range of safe integers.'],
    ])(
        'cannot calculate the weeks subtraction because the result exceeds the supported date-time range',
        (weeks: number, errorMessage: string) => {
            const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

            expect(() => localDateTime.minusWeeks(weeks)).toThrow(errorMessage);
        },
    );

    it.each([
        [
            -365,
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2014, 8, 31), LocalTime.of(1, 2, 3)),
        ],
        [
            -2,
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2015, 8, 29), LocalTime.of(1, 2, 3)),
        ],
        [
            -1,
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2015, 8, 30), LocalTime.of(1, 2, 3)),
        ],
        [
            0,
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
        ],
        [
            1,
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2015, 9, 1), LocalTime.of(1, 2, 3)),
        ],
        [
            2,
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2015, 9, 2), LocalTime.of(1, 2, 3)),
        ],
        [
            366,
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2016, 8, 31), LocalTime.of(1, 2, 3)),
        ],
        [
            40,
            LocalDateTime.of(LocalDate.of(2015, 12, 10), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2016, 1, 19), LocalTime.of(1, 2, 3)),
        ],
    ])(
        'can create a copy with an amount of days added',
        (days: number, localDateTime: LocalDateTime, expected: LocalDateTime) => {
            expect(localDateTime.plusDays(days)).toStrictEqual(expected);
        },
    );

    it.each([
        [Number.MAX_SAFE_INTEGER, 'The result overflows the range of safe integers.'],
        [Number.MIN_SAFE_INTEGER, 'The day -9007199254724313 is out of the range [-365961662 - 364522971].'],
    ])(
        'cannot calculate the days addition because the result exceeds the supported date-time range',
        (days: number, errorMessage: string) => {
            const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

            expect(() => localDateTime.plusDays(days)).toThrow(errorMessage);
        },
    );

    it.each([
        [
            365,
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2014, 8, 31), LocalTime.of(1, 2, 3)),
        ],
        [
            2,
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2015, 8, 29), LocalTime.of(1, 2, 3)),
        ],
        [
            1,
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2015, 8, 30), LocalTime.of(1, 2, 3)),
        ],
        [
            0,
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
        ],
        [
            -1,
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2015, 9, 1), LocalTime.of(1, 2, 3)),
        ],
        [
            -2,
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2015, 9, 2), LocalTime.of(1, 2, 3)),
        ],
        [
            -366,
            LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2016, 8, 31), LocalTime.of(1, 2, 3)),
        ],
        [
            -40,
            LocalDateTime.of(LocalDate.of(2015, 12, 10), LocalTime.of(1, 2, 3)),
            LocalDateTime.of(LocalDate.of(2016, 1, 19), LocalTime.of(1, 2, 3)),
        ],
    ])(
        'can create a copy with an amount of days subtracted',
        (days: number, localDateTime: LocalDateTime, expected: LocalDateTime) => {
            expect(localDateTime.minusDays(days)).toStrictEqual(expected);
        },
    );

    it.each([
        [Number.MAX_SAFE_INTEGER, 'The day -9007199254724313 is out of the range [-365961662 - 364522971].'],
        [Number.MIN_SAFE_INTEGER, 'The result overflows the range of safe integers.'],
    ])(
        'cannot calculate the days subtraction because the result exceeds the supported date-time range',
        (days: number, errorMessage: string) => {
            const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

            expect(() => localDateTime.minusDays(days)).toThrow(errorMessage);
        },
    );

    it.each([
        [-24, LocalDateTime.of(LocalDate.of(2015, 8, 30), LocalTime.of(1, 2, 3))],
        [-5, LocalDateTime.of(LocalDate.of(2015, 8, 30), LocalTime.of(20, 2, 3))],
        [-4, LocalDateTime.of(LocalDate.of(2015, 8, 30), LocalTime.of(21, 2, 3))],
        [-3, LocalDateTime.of(LocalDate.of(2015, 8, 30), LocalTime.of(22, 2, 3))],
        [-2, LocalDateTime.of(LocalDate.of(2015, 8, 30), LocalTime.of(23, 2, 3))],
        [-1, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(0, 2, 3))],
        [0, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3))],
        [1, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(2, 2, 3))],
        [2, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(3, 2, 3))],
        [3, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(4, 2, 3))],
        [4, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(5, 2, 3))],
        [5, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(6, 2, 3))],
        [24, LocalDateTime.of(LocalDate.of(2015, 9, 1), LocalTime.of(1, 2, 3))],
    ])('can create a copy with an amount of hours added', (hours: number, expected: LocalDateTime) => {
        const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

        expect(localDateTime.plusHours(hours)).toStrictEqual(expected);
    });

    it.each([
        [Number.MAX_SAFE_INTEGER, 'The day 375299968964219 is out of the range [-365961662 - 364522971].'],
        [Number.MIN_SAFE_INTEGER, 'The day -375299968930864 is out of the range [-365961662 - 364522971].'],
    ])(
        'cannot calculate the hours addition because the result exceeds the supported date-time range',
        (hours: number, errorMessage: string) => {
            const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

            expect(() => localDateTime.plusHours(hours)).toThrow(errorMessage);
        },
    );

    it.each([
        [24, LocalDateTime.of(LocalDate.of(2015, 8, 30), LocalTime.of(1, 2, 3))],
        [5, LocalDateTime.of(LocalDate.of(2015, 8, 30), LocalTime.of(20, 2, 3))],
        [4, LocalDateTime.of(LocalDate.of(2015, 8, 30), LocalTime.of(21, 2, 3))],
        [3, LocalDateTime.of(LocalDate.of(2015, 8, 30), LocalTime.of(22, 2, 3))],
        [2, LocalDateTime.of(LocalDate.of(2015, 8, 30), LocalTime.of(23, 2, 3))],
        [1, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(0, 2, 3))],
        [-0, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3))],
        [-1, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(2, 2, 3))],
        [-2, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(3, 2, 3))],
        [-3, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(4, 2, 3))],
        [-4, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(5, 2, 3))],
        [-5, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(6, 2, 3))],
        [-24, LocalDateTime.of(LocalDate.of(2015, 9, 1), LocalTime.of(1, 2, 3))],
    ])('can create a copy with an amount of hours subtracted', (hours: number, expected: LocalDateTime) => {
        const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

        expect(localDateTime.minusHours(hours)).toStrictEqual(expected);
    });

    it.each([
        [Number.MAX_SAFE_INTEGER, 'The day -375299968930864 is out of the range [-365961662 - 364522971].'],
        [Number.MIN_SAFE_INTEGER, 'The day 375299968964219 is out of the range [-365961662 - 364522971].'],
    ])(
        'cannot calculate the hours subtraction because the result exceeds the supported date-time range',
        (hours: number, errorMessage: string) => {
            const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

            expect(() => localDateTime.minusHours(hours)).toThrow(errorMessage);
        },
    );

    it.each([
        [-1440, LocalDateTime.of(LocalDate.of(2015, 8, 30), LocalTime.of(1, 2, 3))],
        [-5, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(0, 57, 3))],
        [-4, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(0, 58, 3))],
        [-3, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(0, 59, 3))],
        [-2, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 0, 3))],
        [-1, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 1, 3))],
        [0, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3))],
        [1, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 3, 3))],
        [2, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 4, 3))],
        [3, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 5, 3))],
        [4, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 6, 3))],
        [5, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 7, 3))],
        [1440, LocalDateTime.of(LocalDate.of(2015, 9, 1), LocalTime.of(1, 2, 3))],
    ])('can create a copy with an amount of minutes added', (minutes: number, expected: LocalDateTime) => {
        const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

        expect(localDateTime.plusMinutes(minutes)).toStrictEqual(expected);
    });

    it.each([
        [Number.MAX_SAFE_INTEGER, 'The day 6254999499137 is out of the range [-365961662 - 364522971].'],
        [Number.MIN_SAFE_INTEGER, 'The day -6254999465781 is out of the range [-365961662 - 364522971].'],
    ])(
        'cannot calculate the minutes addition because the result exceeds the supported date-time range',
        (minutes: number, errorMessage: string) => {
            const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

            expect(() => localDateTime.plusMinutes(minutes)).toThrow(errorMessage);
        },
    );

    it.each([
        [1440, LocalDateTime.of(LocalDate.of(2015, 8, 30), LocalTime.of(1, 2, 3))],
        [5, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(0, 57, 3))],
        [4, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(0, 58, 3))],
        [3, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(0, 59, 3))],
        [2, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 0, 3))],
        [1, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 1, 3))],
        [0, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3))],
        [-1, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 3, 3))],
        [-2, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 4, 3))],
        [-3, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 5, 3))],
        [-4, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 6, 3))],
        [-5, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 7, 3))],
        [-1440, LocalDateTime.of(LocalDate.of(2015, 9, 1), LocalTime.of(1, 2, 3))],
    ])('can create a copy with an amount of minutes subtracted', (minutes: number, expected: LocalDateTime) => {
        const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

        expect(localDateTime.minusMinutes(minutes)).toStrictEqual(expected);
    });

    it.each([
        [Number.MAX_SAFE_INTEGER, 'The day -6254999465781 is out of the range [-365961662 - 364522971].'],
        [Number.MIN_SAFE_INTEGER, 'The day 6254999499137 is out of the range [-365961662 - 364522971].'],
    ])(
        'cannot calculate the minutes subtraction because the result exceeds the supported date-time range',
        (minutes: number, errorMessage: string) => {
            const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

            expect(() => localDateTime.minusMinutes(minutes)).toThrow(errorMessage);
        },
    );

    it.each([
        [-86400, LocalDateTime.of(LocalDate.of(2015, 8, 30), LocalTime.of(1, 2, 3))],
        [-5, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 1, 58))],
        [-4, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 1, 59))],
        [-3, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 0))],
        [-2, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 1))],
        [-1, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2))],
        [0, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3))],
        [1, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 4))],
        [2, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 5))],
        [3, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 6))],
        [4, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 7))],
        [5, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 8))],
        [86400, LocalDateTime.of(LocalDate.of(2015, 9, 1), LocalTime.of(1, 2, 3))],
    ])('can create a copy with an amount of seconds added', (seconds: number, expected: LocalDateTime) => {
        const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

        expect(localDateTime.plusSeconds(seconds)).toStrictEqual(expected);
    });

    it.each([
        [Number.MAX_SAFE_INTEGER, 'The day 104250008052 is out of the range [-365961662 - 364522971].'],
        [Number.MIN_SAFE_INTEGER, 'The day -104249974697 is out of the range [-365961662 - 364522971].'],
    ])(
        'cannot calculate the seconds addition because the result exceeds the supported date-time range',
        (seconds: number, errorMessage: string) => {
            const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

            expect(() => localDateTime.plusSeconds(seconds)).toThrow(errorMessage);
        },
    );

    it.each([
        [86400, LocalDateTime.of(LocalDate.of(2015, 8, 30), LocalTime.of(1, 2, 3))],
        [5, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 1, 58))],
        [4, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 1, 59))],
        [3, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 0))],
        [2, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 1))],
        [1, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2))],
        [0, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3))],
        [-1, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 4))],
        [-2, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 5))],
        [-3, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 6))],
        [-4, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 7))],
        [-5, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 8))],
        [-86400, LocalDateTime.of(LocalDate.of(2015, 9, 1), LocalTime.of(1, 2, 3))],
    ])('can create a copy with an amount of seconds subtracted', (seconds: number, expected: LocalDateTime) => {
        const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

        expect(localDateTime.minusSeconds(seconds)).toStrictEqual(expected);
    });

    it.each([
        [Number.MAX_SAFE_INTEGER, 'The day -104249974697 is out of the range [-365961662 - 364522971].'],
        [Number.MIN_SAFE_INTEGER, 'The day 104250008052 is out of the range [-365961662 - 364522971].'],
    ])(
        'cannot calculate the seconds subtraction because the result exceeds the supported date-time range',
        (seconds: number, errorMessage: string) => {
            const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

            expect(() => localDateTime.minusSeconds(seconds)).toThrow(errorMessage);
        },
    );

    it.each([
        [-86400000, LocalDateTime.of(LocalDate.of(2015, 8, 30), LocalTime.of(1, 2, 3))],
        [-1000, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2))],
        [-5, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 995000000))],
        [-4, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 996000000))],
        [-3, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 997000000))],
        [-2, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 998000000))],
        [-1, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 999000000))],
        [0, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3))],
        [1, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 1000000))],
        [2, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 2000000))],
        [3, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 3000000))],
        [4, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 4000000))],
        [5, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 5000000))],
        [1000, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 4))],
        [86400000, LocalDateTime.of(LocalDate.of(2015, 9, 1), LocalTime.of(1, 2, 3))],

        [Number.MAX_SAFE_INTEGER, LocalDateTime.of(LocalDate.of(287442, 6, 12), LocalTime.of(10, 1, 3, 991000000))],
        [Number.MIN_SAFE_INTEGER, LocalDateTime.of(LocalDate.of(-283412, 11, 17), LocalTime.of(16, 3, 2, 9000000))],
    ])('can create a copy with an amount of milliseconds added', (millis: number, expected: LocalDateTime) => {
        const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

        expect(localDateTime.plusMillis(millis)).toStrictEqual(expected);
    });

    it.each([
        [86400000, LocalDateTime.of(LocalDate.of(2015, 8, 30), LocalTime.of(1, 2, 3))],
        [1000, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2))],
        [5, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 995000000))],
        [4, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 996000000))],
        [3, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 997000000))],
        [2, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 998000000))],
        [1, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 999000000))],
        [0, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3))],
        [-1, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 1000000))],
        [-2, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 2000000))],
        [-3, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 3000000))],
        [-4, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 4000000))],
        [-5, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 5000000))],
        [-1000, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 4))],
        [-86400000, LocalDateTime.of(LocalDate.of(2015, 9, 1), LocalTime.of(1, 2, 3))],

        [Number.MAX_SAFE_INTEGER, LocalDateTime.of(LocalDate.of(-283412, 11, 17), LocalTime.of(16, 3, 2, 9000000))],
        [Number.MIN_SAFE_INTEGER, LocalDateTime.of(LocalDate.of(287442, 6, 12), LocalTime.of(10, 1, 3, 991000000))],
    ])('can create a copy with an amount of milliseconds subtracted', (millis: number, expected: LocalDateTime) => {
        const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

        expect(localDateTime.minusMillis(millis)).toStrictEqual(expected);
    });

    it.each([
        [-86400000000, LocalDateTime.of(LocalDate.of(2015, 8, 30), LocalTime.of(1, 2, 3))],
        [-1000000, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2))],
        [-5, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 999995000))],
        [-4, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 999996000))],
        [-3, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 999997000))],
        [-2, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 999998000))],
        [-1, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 999999000))],
        [0, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3))],
        [1, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 1000))],
        [2, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 2000))],
        [3, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 3000))],
        [4, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 4000))],
        [5, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 5000))],
        [1000000, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 4))],
        [86400000000, LocalDateTime.of(LocalDate.of(2015, 9, 1), LocalTime.of(1, 2, 3))],

        [Number.MAX_SAFE_INTEGER, LocalDateTime.of(LocalDate.of(2301, 2, 3), LocalTime.of(0, 49, 37, 740991000))],
        [Number.MIN_SAFE_INTEGER, LocalDateTime.of(LocalDate.of(1730, 3, 28), LocalTime.of(1, 14, 28, 259009000))],
    ])('can create a copy with an amount of microseconds added', (micros: number, expected: LocalDateTime) => {
        const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

        expect(localDateTime.plusMicros(micros)).toStrictEqual(expected);
    });

    it.each([
        [86400000000, LocalDateTime.of(LocalDate.of(2015, 8, 30), LocalTime.of(1, 2, 3))],
        [1000000, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2))],
        [5, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 999995000))],
        [4, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 999996000))],
        [3, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 999997000))],
        [2, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 999998000))],
        [1, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 999999000))],
        [0, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3))],
        [-1, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 1000))],
        [-2, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 2000))],
        [-3, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 3000))],
        [-4, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 4000))],
        [-5, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 5000))],
        [-1000000, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 4))],
        [-86400000000, LocalDateTime.of(LocalDate.of(2015, 9, 1), LocalTime.of(1, 2, 3))],

        [Number.MAX_SAFE_INTEGER, LocalDateTime.of(LocalDate.of(1730, 3, 28), LocalTime.of(1, 14, 28, 259009000))],
        [Number.MIN_SAFE_INTEGER, LocalDateTime.of(LocalDate.of(2301, 2, 3), LocalTime.of(0, 49, 37, 740991000))],
    ])('can create a copy with an amount of microseconds subtracted', (micros: number, expected: LocalDateTime) => {
        const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

        expect(localDateTime.minusMicros(micros)).toStrictEqual(expected);
    });

    it.each([
        [-86400000000000, LocalDateTime.of(LocalDate.of(2015, 8, 30), LocalTime.of(1, 2, 3))],
        [-1000000000, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2))],
        [-5, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 999999995))],
        [-4, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 999999996))],
        [-3, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 999999997))],
        [-2, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 999999998))],
        [-1, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 999999999))],
        [0, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3))],
        [1, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 1))],
        [2, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 2))],
        [3, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 3))],
        [4, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 4))],
        [5, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 5))],
        [1000000000, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 4))],
        [86400000000000, LocalDateTime.of(LocalDate.of(2015, 9, 1), LocalTime.of(1, 2, 3))],

        [Number.MAX_SAFE_INTEGER, LocalDateTime.of(LocalDate.of(2015, 12, 13), LocalTime.of(7, 2, 2, 254740991))],
        [Number.MIN_SAFE_INTEGER, LocalDateTime.of(LocalDate.of(2015, 5, 18), LocalTime.of(19, 2, 3, 745259009))],
    ])('can create a copy with an amount of nanoseconds added', (nanos: number, expected: LocalDateTime) => {
        const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

        expect(localDateTime.plusNanos(nanos)).toStrictEqual(expected);
    });

    it.each([
        [86400000000000, LocalDateTime.of(LocalDate.of(2015, 8, 30), LocalTime.of(1, 2, 3))],
        [1000000000, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2))],
        [5, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 999999995))],
        [4, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 999999996))],
        [3, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 999999997))],
        [2, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 999999998))],
        [1, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 2, 999999999))],
        [0, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3))],
        [-1, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 1))],
        [-2, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 2))],
        [-3, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 3))],
        [-4, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 4))],
        [-5, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3, 5))],
        [-1000000000, LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 4))],
        [-86400000000000, LocalDateTime.of(LocalDate.of(2015, 9, 1), LocalTime.of(1, 2, 3))],

        [Number.MAX_SAFE_INTEGER, LocalDateTime.of(LocalDate.of(2015, 5, 18), LocalTime.of(19, 2, 3, 745259009))],
        [Number.MIN_SAFE_INTEGER, LocalDateTime.of(LocalDate.of(2015, 12, 13), LocalTime.of(7, 2, 2, 254740991))],
    ])('can create a copy with an amount of nanoseconds subtracted', (nanos: number, expected: LocalDateTime) => {
        const localDateTime = LocalDateTime.of(LocalDate.of(2015, 8, 31), LocalTime.of(1, 2, 3));

        expect(localDateTime.minusNanos(nanos)).toStrictEqual(expected);
    });

    it('should be comparable', () => {
        const one = LocalDateTime.of(LocalDate.of(2020, 4, 10), LocalTime.of(1));
        const two = LocalDateTime.of(LocalDate.of(2021, 4, 10), LocalTime.of(15, 2, 1, 1));
        const three = LocalDateTime.of(LocalDate.of(2020, 4, 10), LocalTime.of(1));

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

    it.each([
        ['invalid local date time', false],
        ['invalid dateT14:20:05.123', false],
        ['2015-08-30Tinvalid time', false],
        ['2015-08-30T14:20:05.123', true],
    ])('can determine if a value is a valid local date time', (value: string, expected: boolean) => {
        expect(LocalDateTime.isValid(value)).toBe(expected);
    });

    it('should serialize to JSON in the ISO-8601 format', () => {
        const localDate = LocalDate.of(2020, 4, 10);
        const localTime = LocalTime.of(15, 2, 1, 2222);
        const localDateTime = LocalDateTime.of(localDate, localTime);

        expect(localDateTime.toJSON()).toBe('2020-04-10T15:02:01.000002222');
    });
});
