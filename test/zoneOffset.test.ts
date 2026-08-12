import {Instant, LocalDateTime, TimeZone, ZoneOffset} from '../src';

describe('A value object representing a time-zone offset', () => {
    it('provides a constant for the UTC offset', () => {
        expect(ZoneOffset.UTC.getTotalSeconds()).toBe(0);
        expect(ZoneOffset.UTC.getId()).toBe('Z');
    });

    it.each([
        ['Z', 'Z', 0],
        ['z', 'Z', 0],
        ['+0', 'Z', 0],
        ['-0', 'Z', 0],
        ['+00:00', 'Z', 0],
        ['-1', '-01:00', -3600],
        ['-01', '-01:00', -3600],
        ['+01:02', '+01:02', 3720],
        ['+0102', '+01:02', 3720],
        ['+01:02:03', '+01:02:03', 3723],
        ['+010203', '+01:02:03', 3723],
        ['-05:45', '-05:45', -20700],
        ['+18:00', '+18:00', 64800],
        ['-18:00', '-18:00', -64800],
    ])('can be created from the ID "%s"', (id: string, expectedId: string, totalSeconds: number) => {
        const offset = ZoneOffset.of(id);

        expect(offset.equals(ZoneOffset.ofTotalSeconds(totalSeconds))).toBe(true);
        // The canonical form of the ID is the subject of this assertion.
        expect(offset.getId()).toBe(expectedId);
    });

    it.each([
        ['foo'],
        [''],
        ['+'],
        ['01:00'],
        ['+1:00'],
        ['+01:2'],
        ['+01:02:3'],
        ['++01:00'],
        ['+19:00:00:00'],
    ])('should reject the malformed offset ID "%s"', (id: string) => {
        expect(() => ZoneOffset.of(id)).toThrow(`Invalid offset ID "${id}".`);
    });

    it('can be created from a number of hours, minutes and seconds', () => {
        expect(ZoneOffset.ofTotal(1, 2, 3).getTotalSeconds()).toBe(3723);
        expect(ZoneOffset.ofTotal(-1, -2, -3).getTotalSeconds()).toBe(-3723);
        expect(ZoneOffset.ofTotal(5).getTotalSeconds()).toBe(18000);
        expect(ZoneOffset.ofTotal(5, 30).getTotalSeconds()).toBe(19800);
    });

    it.each([
        [1, -2, 3],
        [-1, 2, -3],
        [0, 1, -1],
    ])('should reject the offset %s:%s:%s with mixed signs', (
        hours: number,
        minutes: number,
        seconds: number,
    ) => {
        expect(() => ZoneOffset.ofTotal(hours, minutes, seconds))
            .toThrow('Time-zone offset hours, minutes and seconds must have the same sign.');
    });

    it.each([
        [-19, 'Offset hours must be between -18 and 18, but got -19.'],
        [19, 'Offset hours must be between -18 and 18, but got 19.'],
    ])('should reject the out-of-range hour %s', (hours: number, message: string) => {
        expect(() => ZoneOffset.ofTotal(hours)).toThrow(message);
    });

    it.each([
        [-60, 'Offset minutes must be between -59 and 59, but got -60.'],
        [60, 'Offset minutes must be between -59 and 59, but got 60.'],
    ])('should reject the out-of-range minute %s', (minutes: number, message: string) => {
        expect(() => ZoneOffset.ofTotal(Math.sign(minutes), minutes)).toThrow(message);
    });

    it.each([
        [-60, 'Offset seconds must be between -59 and 59, but got -60.'],
        [60, 'Offset seconds must be between -59 and 59, but got 60.'],
    ])('should reject the out-of-range second %s', (seconds: number, message: string) => {
        expect(() => ZoneOffset.ofTotal(Math.sign(seconds), 0, seconds)).toThrow(message);
    });

    it('can be created from a total offset in seconds', () => {
        expect(ZoneOffset.ofTotalSeconds(123).getTotalSeconds()).toBe(123);
        expect(ZoneOffset.ofTotalSeconds(123).equals(ZoneOffset.ofTotal(0, 2, 3))).toBe(true);
        expect(ZoneOffset.ofTotalSeconds(0).equals(ZoneOffset.UTC)).toBe(true);
    });

    it.each([
        [64_801, 'Offset must be between -18:00 and +18:00, but got +18:00:01.'],
        [-64_801, 'Offset must be between -18:00 and +18:00, but got -18:00:01.'],
    ])('should reject the out-of-range total of %s seconds', (totalSeconds: number, message: string) => {
        expect(() => ZoneOffset.ofTotalSeconds(totalSeconds)).toThrow(message);
    });

    it('should reject a fractional total of seconds', () => {
        expect(() => ZoneOffset.ofTotalSeconds(1.5)).toThrow('Offset must be between -18:00 and +18:00');
    });

    it('is created by the time-zone factory for offset-based IDs', () => {
        expect(TimeZone.of('Z')).toBeInstanceOf(ZoneOffset);
        expect(TimeZone.of('+03:00')).toBeInstanceOf(ZoneOffset);
        expect(TimeZone.of('-03:00')).toBeInstanceOf(ZoneOffset);
        expect(TimeZone.of('America/Sao_Paulo')).not.toBeInstanceOf(ZoneOffset);
        expect(TimeZone.of('UTC')).not.toBeInstanceOf(ZoneOffset);
    });

    it('provides rules with a fixed offset', () => {
        const offset = ZoneOffset.of('-03:00');
        const rules = offset.getRules();

        expect(rules.isFixedOffset()).toBe(true);
        expect(rules.getOffset(Instant.EPOCH).equals(offset)).toBe(true);
        expect(rules.getValidOffsets(LocalDateTime.parse('2024-01-01T00:00'))).toHaveLength(1);
        expect(rules.getValidOffsets(LocalDateTime.parse('2024-01-01T00:00'))[0].equals(offset))
            .toBe(true);
        expect(rules.getTransition(LocalDateTime.parse('2024-01-01T00:00'))).toBeNull();
        expect(rules.getNextTransition(Instant.EPOCH)).toBeNull();
        expect(rules.getPreviousTransition(Instant.EPOCH)).toBeNull();
    });

    it.each([
        ['-18:00', '+18:00', 1],
        ['+18:00', '-18:00', -1],
        ['-03:00', '-03:00', 0],
    ])('compares %s to %s from the earliest local time-line', (
        left: string,
        right: string,
        expected: number,
    ) => {
        expect(Math.sign(ZoneOffset.of(left).compare(ZoneOffset.of(right)))).toBe(expected);
    });

    it('should be comparable for equality', () => {
        const one = ZoneOffset.of('-03:00');
        const two = ZoneOffset.of('+03:00');
        const three = ZoneOffset.ofTotalSeconds(-10_800);

        expect(one.equals(one)).toBe(true);
        expect(one.equals(two)).toBe(false);
        expect(one.equals(three)).toBe(true);
    });

    it('is not equal to a region with the same ID', () => {
        expect(ZoneOffset.UTC.equals(TimeZone.UTC)).toBe(false);
        expect(TimeZone.UTC.equals(ZoneOffset.UTC)).toBe(false);
    });

    it('can be converted to a string representation', () => {
        expect(ZoneOffset.of('-03:00').toString()).toBe('-03:00');
        expect(ZoneOffset.UTC.toString()).toBe('Z');
    });

    it('should serialize to JSON', () => {
        expect(ZoneOffset.of('+05:45').toJSON()).toBe('+05:45');
    });
});
