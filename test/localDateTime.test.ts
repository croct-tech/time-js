import {LocalDate, LocalDateTime, LocalTime} from '../src';

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

    it('should parse a valid ISO-8601 date time', () => {
        const dateTime = '2015-08-30T14:20:05.123';
        const localDateTime = LocalDateTime.parse(dateTime);

        expect(localDateTime.toString()).toBe(dateTime);
    });

    it.each([
        '2015-08-30',
        '12:34:56',
        '2015-08-30 12:34:56',
        '20150830123456',
        '2015/08/30 12:34:56',
        '2015T08-30T12:34:56',
        'Sun Aug 30 2015 12:34:56',
    ])('should fail to parse %s', value => {
        expect(() => LocalDateTime.parse(value)).toThrowError('Invalid date time format.');
    });

    it('can be converted to a string in the ISO-8601 format', () => {
        const localDate = LocalDate.of(2020, 4, 10);
        const localTime = LocalTime.of(15, 2, 1, 2222);
        const localDateTime = LocalDateTime.of(localDate, localTime);

        expect(localDateTime.toString()).toBe('2020-04-10T15:02:01.000002222');
    });

    it('should be comparable', () => {
        const localDate = LocalDate.of(2020, 4, 10);
        const localTime = LocalTime.of(15, 2, 1, 2222);

        const one = LocalDateTime.of(localDate, localTime);
        const two = LocalDateTime.of(localDate, LocalTime.of(1));
        const three = LocalDateTime.of(localDate, localTime);

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
