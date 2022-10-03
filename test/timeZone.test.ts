import {timeZonesNames} from '@vvo/tzdb';
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
        expect(() => TimeZone.of('America')).toThrowError('The timezone America is not supported.');
    });

    it('should return the list of supported time zones.', () => {
        expect(TimeZone.getTimesZoneIds()).toEqual(timeZonesNames.concat('UTC'));
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
});
