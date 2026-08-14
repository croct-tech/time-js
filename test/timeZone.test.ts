import {Instant, LocalDateTime, TimeZone, ZoneOffset} from '../src';

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
    ])('supports non-continental "%s" timezone', timeZone => {
        expect(TimeZone.of(timeZone).toString()).toBe(timeZone);
    });

    it.each([
        ['Z'],
        ['+03:00'],
        ['-03:00'],
        ['+1'],
    ])('creates an offset-based zone from the ID "%s"', (id: string) => {
        expect(TimeZone.of(id)).toBeInstanceOf(ZoneOffset);
    });

    it.each([
        ['UTC', 'UTC'],
        ['GMT', 'GMT'],
        ['UT', 'UT'],
        ['GMT0', 'GMT0'],
        ['GMT+03:00', 'GMT+03:00'],
        ['UTC-05:30', 'UTC-05:30'],
        ['UT+00:00', 'UT'],
    ])('creates a region-based zone from the prefixed ID "%s"', (id: string, expected: string) => {
        const zone = TimeZone.of(id);

        expect(zone).not.toBeInstanceOf(ZoneOffset);
        expect(zone.getId()).toBe(expected);
        expect(zone.getRules().isFixedOffset()).toBe(true);
    });

    it.each([
        ['GMT+03:00', 10_800],
        ['UTC-05:30', -19_800],
        ['UTC', 0],
    ])('resolves the fixed offset of "%s"', (id: string, totalSeconds: number) => {
        expect(
            TimeZone.of(id)
                .getRules()
                .getOffset(Instant.EPOCH)
                .equals(ZoneOffset.ofTotalSeconds(totalSeconds)),
        ).toBe(true);
    });

    it('should reject an offset-based ID with an unsupported prefix', () => {
        expect(() => TimeZone.ofOffset('CET', ZoneOffset.of('+01:00')))
            .toThrow('The prefix must be GMT, UTC or UT, but got "CET".');
    });

    it('creates a zone from a prefix and an offset', () => {
        expect(TimeZone.ofOffset('GMT', ZoneOffset.of('+03:00')).getId()).toBe('GMT+03:00');
        expect(TimeZone.ofOffset('GMT', ZoneOffset.UTC).getId()).toBe('GMT');
        expect(TimeZone.ofOffset('', ZoneOffset.of('+03:00')).equals(ZoneOffset.of('+03:00'))).toBe(true);
    });

    it('should reject a malformed offset in a prefixed ID', () => {
        expect(() => TimeZone.of('GMT+foo')).toThrow('Invalid offset ID "+foo".');
    });

    it('provides rules that vary over time for a region', () => {
        const rules = TimeZone.of('America/Sao_Paulo').getRules();

        expect(rules.isFixedOffset()).toBe(false);
        expect(rules.getOffset(Instant.parse('2024-01-01T00:00:00Z')).equals(ZoneOffset.of('-03:00')))
            .toBe(true);
        expect(rules.getOffset(Instant.parse('2018-01-01T00:00:00Z')).equals(ZoneOffset.of('-02:00')))
            .toBe(true);
    });

    it('caches the rules of a region', () => {
        expect(TimeZone.of('America/Sao_Paulo').getRules())
            .toBe(TimeZone.of('America/Sao_Paulo').getRules());
    });

    it('caches the rules of an offset', () => {
        const offset = ZoneOffset.of('-03:00');

        expect(offset.getRules()).toBe(offset.getRules());
    });

    it.each([
        ['UTC', 'Z'],
        ['GMT+03:00', '+03:00'],
    ])('normalizes the fixed-offset zone "%s" to an offset', (id: string, expected: string) => {
        const normalized = TimeZone.of(id).normalized();

        expect(normalized).toBeInstanceOf(ZoneOffset);
        expect(normalized.equals(ZoneOffset.of(expected))).toBe(true);
    });

    it('does not normalize a zone whose offset varies', () => {
        const zone = TimeZone.of('America/Sao_Paulo');

        expect(zone.normalized()).toBe(zone);
    });

    it('normalizes an offset to itself', () => {
        const offset = ZoneOffset.of('-03:00');

        expect(offset.normalized().equals(offset)).toBe(true);
    });

    it('resolves the offset of a local date-time through its rules', () => {
        const rules = TimeZone.of('America/Sao_Paulo').getRules();
        const dateTime = LocalDateTime.parse('2024-06-01T12:00');

        expect(rules.resolveOffset(dateTime).equals(ZoneOffset.of('-03:00'))).toBe(true);
        expect(rules.isValidOffset(dateTime, ZoneOffset.of('-03:00'))).toBe(true);
        expect(rules.isValidOffset(dateTime, ZoneOffset.of('-02:00'))).toBe(false);
    });
});
