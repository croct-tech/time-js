import {Instant, LocalDateTime, TimeZone, ZoneOffset, ZoneRules} from '../src';

function rulesOf(zone: string): ZoneRules {
    return TimeZone.of(zone).getRules();
}

function expectOffsets(actual: ZoneOffset[], expected: string[]): void {
    expect(actual).toHaveLength(expected.length);

    actual.forEach((offset, index) => {
        expect(offset.equals(ZoneOffset.of(expected[index]))).toBe(true);
    });
}

describe('The rules of a region-based time zone', () => {
    it('is provided by both region-based and offset-based time zones', () => {
        expect(rulesOf('America/Sao_Paulo')).toBeInstanceOf(ZoneRules);
        expect(TimeZone.of('-03:00').getRules()).toBeInstanceOf(ZoneRules);
    });

    it.each([
        ['America/Sao_Paulo', '2024-01-01T00:00:00Z', '-03:00'],
        ['America/Sao_Paulo', '2018-01-01T00:00:00Z', '-02:00'],
        ['America/New_York', '2024-06-01T12:00:00Z', '-04:00'],
        ['America/New_York', '2024-01-01T12:00:00Z', '-05:00'],
        ['Asia/Katmandu', '2024-01-01T00:00:00Z', '+05:45'],
        ['Australia/Lord_Howe', '2024-01-01T00:00:00Z', '+11:00'],
        ['Australia/Lord_Howe', '2024-07-01T00:00:00Z', '+10:30'],
        ['Asia/Tokyo', '2024-01-01T00:00:00Z', '+09:00'],
        // Zones that sit on Greenwich report no offset at all rather than a zero one.
        ['Europe/London', '2024-01-01T00:00:00Z', 'Z'],
        ['Europe/London', '2024-06-01T00:00:00Z', '+01:00'],
        ['Atlantic/Reykjavik', '2024-06-01T00:00:00Z', 'Z'],
    ])('resolves the offset of %s at %s', (zone: string, instant: string, expected: string) => {
        expect(
            rulesOf(zone).getOffset(Instant.parse(instant))
                .equals(ZoneOffset.of(expected)),
        ).toBe(true);
    });

    it.each([
        ['America/Sao_Paulo', '1900-06-01T00:00:00Z', '-03:06:28'],
        ['Europe/Paris', '1900-06-01T00:00:00Z', '+00:09:21'],
        ['America/New_York', '1880-06-01T00:00:00Z', '-04:56:02'],
    ])('resolves the sub-minute historical offset of %s at %s', (
        zone: string,
        instant: string,
        expected: string,
    ) => {
        expect(
            rulesOf(zone).getOffset(Instant.parse(instant))
                .equals(ZoneOffset.of(expected)),
        ).toBe(true);
    });

    it.each([
        ['America/New_York', '2024-06-01T12:00', ['-04:00']],
        ['America/Sao_Paulo', '2024-06-01T12:00', ['-03:00']],
        ['Asia/Tokyo', '2024-06-01T12:00', ['+09:00']],
    ])('reports a single valid offset for %s at %s', (
        zone: string,
        dateTime: string,
        expected: string[],
    ) => {
        const rules = rulesOf(zone);
        const local = LocalDateTime.parse(dateTime);

        expectOffsets(rules.getValidOffsets(local), expected);
        expect(rules.getTransition(local)).toBeNull();
    });

    it.each([
        // Northern-hemisphere spring forward, a one-hour gap.
        ['America/New_York', '2024-03-10T02:30'],
        // Southern-hemisphere spring forward at midnight, a one-hour gap.
        ['America/Sao_Paulo', '2018-11-04T00:30'],
        // A thirty-minute gap.
        ['Australia/Lord_Howe', '2024-10-06T02:15'],
        // A whole day skipped when the zone moved across the international date line.
        ['Pacific/Apia', '2011-12-30T12:00'],
        ['Pacific/Kiritimati', '1994-12-31T12:00'],
    ])('reports no valid offset for %s at %s, which falls in a gap', (
        zone: string,
        dateTime: string,
    ) => {
        const rules = rulesOf(zone);
        const local = LocalDateTime.parse(dateTime);
        const transition = rules.getTransition(local);

        expectOffsets(rules.getValidOffsets(local), []);
        expect(transition).not.toBeNull();
        expect(transition?.isGap()).toBe(true);
        expectOffsets(transition?.getValidOffsets() ?? [], []);
    });

    it.each([
        ['America/New_York', '2024-11-03T01:30', ['-04:00', '-05:00']],
        ['America/Sao_Paulo', '2018-02-17T23:30', ['-02:00', '-03:00']],
        ['Australia/Lord_Howe', '2024-04-07T01:45', ['+11:00', '+10:30']],
    ])('reports two valid offsets for %s at %s, which falls in an overlap', (
        zone: string,
        dateTime: string,
        expected: string[],
    ) => {
        const rules = rulesOf(zone);
        const local = LocalDateTime.parse(dateTime);
        const transition = rules.getTransition(local);

        expectOffsets(rules.getValidOffsets(local), expected);
        expect(transition).not.toBeNull();
        expect(transition?.isOverlap()).toBe(true);
        expect(transition?.getOffsetBefore().equals(ZoneOffset.of(expected[0]))).toBe(true);
        expect(transition?.getOffsetAfter().equals(ZoneOffset.of(expected[1]))).toBe(true);
    });

    it.each([
        ['America/New_York', '2024-03-10T02:30', '2024-03-10T07:00:00Z'],
        ['America/New_York', '2024-11-03T01:30', '2024-11-03T06:00:00Z'],
        ['Australia/Lord_Howe', '2024-10-06T02:15', '2024-10-05T15:30:00Z'],
    ])('locates the exact instant of the transition at %s %s', (
        zone: string,
        dateTime: string,
        expected: string,
    ) => {
        const transition = rulesOf(zone).getTransition(LocalDateTime.parse(dateTime));

        expect(transition?.getInstant().equals(Instant.parse(expected))).toBe(true);
    });

    it.each([
        ['America/New_York', '2024-01-01T00:00:00Z', '2024-03-10T07:00:00Z'],
        ['America/New_York', '2024-06-01T00:00:00Z', '2024-11-03T06:00:00Z'],
    ])('finds the next transition of %s after %s', (
        zone: string,
        instant: string,
        expected: string,
    ) => {
        const transition = rulesOf(zone).getNextTransition(Instant.parse(instant));

        expect(transition?.getInstant().equals(Instant.parse(expected))).toBe(true);
    });

    it.each([
        ['America/New_York', '2024-06-01T00:00:00Z', '2024-03-10T07:00:00Z'],
        ['America/New_York', '2024-01-01T00:00:00Z', '2023-11-05T06:00:00Z'],
    ])('finds the previous transition of %s before %s', (
        zone: string,
        instant: string,
        expected: string,
    ) => {
        const transition = rulesOf(zone).getPreviousTransition(Instant.parse(instant));

        expect(transition?.getInstant().equals(Instant.parse(expected))).toBe(true);
    });

    it('reports only a past transition for a zone that no longer observes daylight savings', () => {
        // Brazil abolished daylight savings after the transition of February 2019,
        // which still falls within the window the rules search backwards.
        const rules = rulesOf('America/Sao_Paulo');
        const instant = Instant.parse('2024-01-01T00:00:00Z');
        const previous = rules.getPreviousTransition(instant);

        expect(rules.getNextTransition(instant)).toBeNull();
        expect(previous?.getInstant().equals(Instant.parse('2019-02-17T02:00:00Z'))).toBe(true);
    });

    it('reports no transition beyond the window it searches', () => {
        // The last transition of America/Sao_Paulo is far outside the bounded window
        // searched from this instant, so it is not reported.
        const rules = rulesOf('America/Sao_Paulo');

        expect(rules.getPreviousTransition(Instant.parse('2030-01-01T00:00:00Z'))).toBeNull();
    });

    it('reports no adjacent transition for a zone that has never observed daylight savings', () => {
        const rules = rulesOf('Asia/Tokyo');
        const instant = Instant.parse('2024-01-01T00:00:00Z');

        expect(rules.getNextTransition(instant)).toBeNull();
        expect(rules.getPreviousTransition(instant)).toBeNull();
    });

    it.each([
        ['America/New_York', '2024-11-03T01:30', '-04:00'],
        ['America/New_York', '2024-03-10T02:30', '-05:00'],
        ['America/Sao_Paulo', '2018-11-04T00:30', '-03:00'],
    ])('resolves %s at %s to the offset before the transition', (
        zone: string,
        dateTime: string,
        expected: string,
    ) => {
        expect(
            rulesOf(zone).resolveOffset(LocalDateTime.parse(dateTime))
                .equals(ZoneOffset.of(expected)),
        ).toBe(true);
    });

    it('can be converted to a string representation', () => {
        expect(rulesOf('America/Sao_Paulo').toString()).toBe('ZoneRules[America/Sao_Paulo]');
        expect(TimeZone.of('-03:00').getRules().toString()).toBe('FixedRules[-03:00]');
    });

    describe('when the runtime reports inconsistent time-zone data', () => {
        const HOUR = 3_600;
        const DAY = 86_400;

        /**
         * The local date-time under test, read as if it were in UTC.
         */
        const LOCAL = Date.UTC(2024, 5, 1, 12) / 1_000;

        /**
         * Replaces the offset the runtime reports with one derived from the instant,
         * so that the paths guarding against inconsistent data can be exercised.
         */
        function mockOffsets(resolve: (epochSecond: number) => string): void {
            jest.spyOn(Intl.DateTimeFormat.prototype, 'formatToParts')
                .mockImplementation((date?: Date | number): Intl.DateTimeFormatPart[] => {
                    const millis = date instanceof Date ? date.getTime() : date ?? 0;

                    return [{type: 'timeZoneName', value: resolve(millis / 1_000)}];
                });
        }

        /**
         * Reports offsets that place the local date-time in a gap, while reporting the
         * same offset at both bounds of the window searched for the transition.
         */
        function resolveInconsistently(epochSecond: number): string {
            const delta = epochSecond - LOCAL;

            if (delta === -2 * DAY || delta === -DAY || delta === 2 * DAY) {
                return 'GMT-05:00';
            }

            // Neither candidate offset is valid, which is what makes the local
            // date-time look like it falls in a gap.
            if (delta > 3.5 * HOUR && delta < 6 * HOUR) {
                return 'GMT-03:00';
            }

            return 'GMT-04:00';
        }

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should reject an offset it cannot parse', () => {
            mockOffsets(() => 'Coordinated Universal Time');

            expect(() => rulesOf('America/New_York').getOffset(Instant.EPOCH))
                .toThrow('Unable to determine the offset of the timezone America/New_York.');
        });

        it('should reject a report with no offset at all', () => {
            jest.spyOn(Intl.DateTimeFormat.prototype, 'formatToParts').mockReturnValue([]);

            expect(() => rulesOf('America/New_York').getOffset(Instant.EPOCH))
                .toThrow('Unable to determine the offset of the timezone America/New_York.');
        });

        it('reports no transition when the offsets bounding the search window agree', () => {
            mockOffsets(resolveInconsistently);

            const rules = rulesOf('America/New_York');
            const local = LocalDateTime.parse('2024-06-01T12:00');

            expect(rules.getValidOffsets(local)).toHaveLength(0);
            expect(rules.getTransition(local)).toBeNull();
        });

        it('should reject a local date-time it can neither resolve nor place in a transition', () => {
            mockOffsets(resolveInconsistently);

            const local = LocalDateTime.parse('2024-06-01T12:00');

            const resolve = (): ZoneOffset => rulesOf('America/New_York').resolveOffset(local);

            expect(resolve).toThrow(
                'Unable to resolve the offset of 2024-06-01T12:00 '
                + 'in ZoneRules[America/New_York].',
            );
        });
    });

    it('should be comparable', () => {
        expect(rulesOf('America/Sao_Paulo').equals(rulesOf('America/Sao_Paulo'))).toBe(true);
        expect(rulesOf('America/Sao_Paulo').equals(rulesOf('Asia/Tokyo'))).toBe(false);
        expect(TimeZone.of('-03:00').getRules().equals(TimeZone.of('-03:00').getRules())).toBe(true);
        expect(TimeZone.of('-03:00').getRules().equals(TimeZone.of('+03:00').getRules())).toBe(false);
    });
});
