import {Weekday} from '../src';

describe('An enumeration representing a day of the week', () => {
    it.each([
        [Weekday.SUNDAY, 'SUNDAY'],
        [Weekday.MONDAY, 'MONDAY'],
        [Weekday.TUESDAY, 'TUESDAY'],
        [Weekday.WEDNESDAY, 'WEDNESDAY'],
        [Weekday.THURSDAY, 'THURSDAY'],
        [Weekday.FRIDAY, 'FRIDAY'],
        [Weekday.SATURDAY, 'SATURDAY'],
    ])('provides the day %s', (weekday: Weekday, expected: string) => {
        expect(weekday).toBe(expected);
    });

    it('provides every day of the week in order', () => {
        expect(Object.values(Weekday)).toStrictEqual([
            'SUNDAY',
            'MONDAY',
            'TUESDAY',
            'WEDNESDAY',
            'THURSDAY',
            'FRIDAY',
            'SATURDAY',
        ]);
    });
});
