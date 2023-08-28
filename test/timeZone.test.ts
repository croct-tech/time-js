import {TimeZone} from '../src';

describe('A value object representing a timezone', () => {
    it('provides a constant for the UTC timezone', () => {
        expect(TimeZone.UTC.equals(TimeZone.of('UTC'))).toBe(true);
    });

    it('can be created from its ID', () => {
        const timezone = TimeZone.of('America/Sao_Paulo');

        expect(timezone.getId()).toBe('America/Sao_Paulo');
    });

    it('should reject invalid timezone IDs', () => {
        expect(() => TimeZone.of('America')).toThrow('The timezone America is not supported.');
    });

    it('can be converted to a string representation of the timezone', () => {
        expect(TimeZone.of('America/Sao_Paulo').toString()).toBe('America/Sao_Paulo');

        expect(TimeZone.of('UTC').toString()).toBe('UTC');
    });

    it('should be comparable', () => {
        const one = TimeZone.of('Asia/Tokyo');
        const two = TimeZone.of('America/Sao_Paulo');
        const three = TimeZone.of('Asia/Tokyo');

        expect(one.equals(two)).toBe(false);
        expect(one.equals(three)).toBe(true);
    });

    it('should serialize to JSON', () => {
        const localDate = TimeZone.of('Europe/London');

        expect(localDate.toJSON()).toBe('Europe/London');
    });

    it.each([
        'CET',
        'CST6CDT',
        'EET',
        'EST',
        'EST5EDT',
        'Etc/GMT+1',
        'Etc/GMT+10',
        'Etc/GMT+11',
        'Etc/GMT+12',
        'Etc/GMT+2',
        'Etc/GMT+3',
        'Etc/GMT+4',
        'Etc/GMT+5',
        'Etc/GMT+6',
        'Etc/GMT+7',
        'Etc/GMT+8',
        'Etc/GMT+9',
        'Etc/GMT-1',
        'Etc/GMT-10',
        'Etc/GMT-11',
        'Etc/GMT-12',
        'Etc/GMT-13',
        'Etc/GMT-14',
        'Etc/GMT-2',
        'Etc/GMT-3',
        'Etc/GMT-4',
        'Etc/GMT-5',
        'Etc/GMT-6',
        'Etc/GMT-7',
        'Etc/GMT-8',
        'Etc/GMT-9',
        'HST',
        'MET',
        'MST',
        'MST7MDT',
        'PST8PDT',
        'WET',
    ])('supports non-standard "%s" timezone', timeZone => {
        expect(TimeZone.of(timeZone).toString()).toBe(timeZone);
    });
});
