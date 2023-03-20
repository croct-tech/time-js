import {LocalDate, LocalDateTime, LocalTime, TimeZone} from '../src';

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
        'can provide the current local date time from the system clock in a given time zone',
        (currentTime: string, timeZone: TimeZone, localDateTime: string) => {
            jest.useFakeTimers()
                .setSystemTime(new Date(currentTime).getTime());

            const now = LocalDateTime.now(timeZone);

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
            .toThrowError('Malformed local date-time "2015-08-30".');
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

    it('should serialize to JSON in the ISO-8601 format', () => {
        const localDate = LocalDate.of(2020, 4, 10);
        const localTime = LocalTime.of(15, 2, 1, 2222);
        const localDateTime = LocalDateTime.of(localDate, localTime);

        expect(localDateTime.toJSON()).toBe('2020-04-10T15:02:01.000002222');
    });
});
