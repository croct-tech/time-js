import {timeZonesNames} from '@vvo/tzdb';
import {Timezone} from '../src';

describe('A value object representing a timezone', () => {
    it('can be created from its ID', () => {
        const timezone = Timezone.of('America/Sao_Paulo');

        expect(timezone.getId()).toBe('America/Sao_Paulo');
    });

    it('should reject invalid timezone IDs', () => {
        expect(() => Timezone.of('America')).toThrowError('The timezone America is not supported.');
    });

    it('should return the list of supported time zones.', () => {
        expect(Timezone.getTimesZoneIds()).toEqual(timeZonesNames.concat('UTC'));
    });

    it('can be converted to a string representation of the timezone', () => {
        expect(Timezone.of('America/Sao_Paulo').toString()).toBe('America/Sao_Paulo');

        expect(Timezone.of('UTC').toString()).toBe('UTC');
    });

    it('should be comparable', () => {
        const one = Timezone.of('Asia/Tokyo');
        const two = Timezone.of('America/Sao_Paulo');
        const three = Timezone.of('Asia/Tokyo');

        expect(one.equals(two)).toBe(false);
        expect(one.equals(three)).toBe(true);
    });

    it('should serialize to JSON', () => {
        const localDate = Timezone.of('Europe/London');

        expect(localDate.toJSON()).toBe('Europe/London');
    });
});
