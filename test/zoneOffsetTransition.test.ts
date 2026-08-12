import {Duration, Instant, LocalDateTime, ZoneOffset, ZoneOffsetTransition} from '../src';

describe('A value object representing a zone offset transition', () => {
    /**
     * The spring-forward transition of America/New_York in 2024, where the local
     * time-line jumps from 02:00 to 03:00.
     */
    const GAP = ZoneOffsetTransition.of(
        LocalDateTime.parse('2024-03-10T02:00'),
        ZoneOffset.of('-05:00'),
        ZoneOffset.of('-04:00'),
    );

    /**
     * The fall-back transition of America/New_York in 2024, where the local
     * time-line repeats the hour from 01:00 to 02:00.
     */
    const OVERLAP = ZoneOffsetTransition.of(
        LocalDateTime.parse('2024-11-03T02:00'),
        ZoneOffset.of('-04:00'),
        ZoneOffset.of('-05:00'),
    );

    it('should reject equal offsets', () => {
        expect(
            () => ZoneOffsetTransition.of(
                LocalDateTime.parse('2024-03-10T02:00'),
                ZoneOffset.of('-05:00'),
                ZoneOffset.of('-05:00'),
            ),
        ).toThrow('The offset before and after the transition cannot be the same.');
    });

    it('should reject a local date-time that is not truncated to seconds', () => {
        expect(
            () => ZoneOffsetTransition.of(
                LocalDateTime.parse('2024-03-10T02:00:00.000000001'),
                ZoneOffset.of('-05:00'),
                ZoneOffset.of('-04:00'),
            ),
        ).toThrow('The time must be truncated to second precision.');
    });

    it('should reject a transition whose local date-time after it is out of range', () => {
        expect(
            () => ZoneOffsetTransition.of(
                LocalDateTime.parse('999999-12-31T23:59:59'),
                ZoneOffset.of('-05:00'),
                ZoneOffset.of('-04:00'),
            ),
        ).toThrow('exceeds the supported date-time range');
    });

    it('should reject a transition whose local date-time after an overlap is out of range', () => {
        expect(
            () => ZoneOffsetTransition.of(
                LocalDateTime.parse('-999999-01-01T00:00:00'),
                ZoneOffset.of('-04:00'),
                ZoneOffset.of('-05:00'),
            ),
        ).toThrow(
            'The local date-time after the overlap at -999999-01-01T00:00 '
            + 'from -04:00 to -05:00 exceeds the supported date-time range.',
        );
    });

    it('can be created from the number of seconds from the epoch', () => {
        const transition = ZoneOffsetTransition.ofEpochSecond(
            Instant.parse('2024-03-10T07:00:00Z').getSeconds(),
            ZoneOffset.of('-05:00'),
            ZoneOffset.of('-04:00'),
        );

        expect(transition.equals(GAP)).toBe(true);
    });

    it.each([
        {kind: 'gap', transition: GAP, expected: '2024-03-10T07:00:00Z'},
        {kind: 'overlap', transition: OVERLAP, expected: '2024-11-03T06:00:00Z'},
    ])('returns the instant at which the $kind occurs', scenario => {
        const instant = Instant.parse(scenario.expected);

        expect(scenario.transition.getInstant().equals(instant)).toBe(true);
        expect(scenario.transition.toEpochSecond()).toBe(instant.getSeconds());
    });

    it.each([
        {kind: 'gap', transition: GAP, before: '2024-03-10T02:00', after: '2024-03-10T03:00'},
        {kind: 'overlap', transition: OVERLAP, before: '2024-11-03T02:00', after: '2024-11-03T01:00'},
    ])('returns the local date-time before and after the $kind', scenario => {
        const {transition} = scenario;

        expect(transition.getDateTimeBefore().equals(LocalDateTime.parse(scenario.before)))
            .toBe(true);
        expect(transition.getDateTimeAfter().equals(LocalDateTime.parse(scenario.after)))
            .toBe(true);
    });

    it.each([
        {kind: 'gap', transition: GAP, before: '-05:00', after: '-04:00'},
        {kind: 'overlap', transition: OVERLAP, before: '-04:00', after: '-05:00'},
    ])('returns the offset before and after the $kind', scenario => {
        const {transition} = scenario;

        expect(transition.getOffsetBefore().equals(ZoneOffset.of(scenario.before))).toBe(true);
        expect(transition.getOffsetAfter().equals(ZoneOffset.of(scenario.after))).toBe(true);
    });

    it.each([
        {kind: 'gap', transition: GAP, seconds: 3_600},
        {kind: 'overlap', transition: OVERLAP, seconds: -3_600},
    ])('returns the size of the $kind', scenario => {
        expect(scenario.transition.getDuration().equals(Duration.ofSeconds(scenario.seconds)))
            .toBe(true);
    });

    it('distinguishes a gap from an overlap', () => {
        expect(GAP.isGap()).toBe(true);
        expect(GAP.isOverlap()).toBe(false);

        expect(OVERLAP.isGap()).toBe(false);
        expect(OVERLAP.isOverlap()).toBe(true);
    });

    it('reports no valid offset during a gap', () => {
        expect(GAP.getValidOffsets()).toHaveLength(0);
        expect(GAP.isValidOffset(ZoneOffset.of('-05:00'))).toBe(false);
        expect(GAP.isValidOffset(ZoneOffset.of('-04:00'))).toBe(false);
    });

    it('reports both offsets as valid during an overlap', () => {
        const offsets = OVERLAP.getValidOffsets();

        expect(offsets).toHaveLength(2);
        expect(offsets[0].equals(ZoneOffset.of('-04:00'))).toBe(true);
        expect(offsets[1].equals(ZoneOffset.of('-05:00'))).toBe(true);

        expect(OVERLAP.isValidOffset(ZoneOffset.of('-04:00'))).toBe(true);
        expect(OVERLAP.isValidOffset(ZoneOffset.of('-05:00'))).toBe(true);
        expect(OVERLAP.isValidOffset(ZoneOffset.of('-03:00'))).toBe(false);
    });

    it.each([
        {kind: 'gap', transition: GAP, earliest: '2024-03-10T02:00', latest: '2024-03-10T03:00'},
        {kind: 'overlap', transition: OVERLAP, earliest: '2024-11-03T01:00', latest: '2024-11-03T02:00'},
    ])('returns the earliest and latest local date-time affected by the $kind', scenario => {
        const {transition} = scenario;

        expect(transition.getEarliestDateTime().equals(LocalDateTime.parse(scenario.earliest)))
            .toBe(true);
        expect(transition.getLatestDateTime().equals(LocalDateTime.parse(scenario.latest)))
            .toBe(true);
    });

    it('checks whether it intersects another transition', () => {
        const overlapping = ZoneOffsetTransition.of(
            LocalDateTime.parse('2024-03-10T02:30'),
            ZoneOffset.of('-05:00'),
            ZoneOffset.of('-04:00'),
        );

        expect(GAP.intersects(overlapping)).toBe(true);
        expect(overlapping.intersects(GAP)).toBe(true);
        expect(GAP.intersects(OVERLAP)).toBe(false);
        expect(OVERLAP.intersects(GAP)).toBe(false);
    });

    it('compares transitions by the instant at which they occur', () => {
        expect(GAP.compare(OVERLAP)).toBeLessThan(0);
        expect(OVERLAP.compare(GAP)).toBeGreaterThan(0);
        expect(GAP.compare(GAP)).toBe(0);
    });

    it('should be comparable for equality', () => {
        const same = ZoneOffsetTransition.of(
            LocalDateTime.parse('2024-03-10T02:00'),
            ZoneOffset.of('-05:00'),
            ZoneOffset.of('-04:00'),
        );

        expect(GAP.equals(same)).toBe(true);
        expect(GAP.equals(OVERLAP)).toBe(false);
    });

    it.each([
        {kind: 'gap', transition: GAP, expected: 'Transition[Gap at 2024-03-10T02:00-05:00 to -04:00]'},
        {
            kind: 'overlap',
            transition: OVERLAP,
            expected: 'Transition[Overlap at 2024-11-03T02:00-04:00 to -05:00]',
        },
    ])('can convert the $kind to a string representation', scenario => {
        expect(scenario.transition.toString()).toBe(scenario.expected);
    });
});
