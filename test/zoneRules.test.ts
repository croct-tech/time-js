import {Instant, LocalDateTime, TimeZone, ZoneOffset, ZoneRules} from '../src';

describe('The rules of a region-based time zone', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('is provided by both region-based and offset-based time zones', () => {
        expect(TimeZone.of('America/Sao_Paulo').getRules()).toBeInstanceOf(ZoneRules);
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
            TimeZone.of(zone).getRules().getOffset(Instant.parse(instant))
                .equals(ZoneOffset.of(expected)),
        ).toBe(true);
    });

    it.each([
        // Runtimes disagree on how they report a zero offset.
        ['GMT'],
        ['GMT+00:00'],
    ])('reads a zone on Greenwich reported as "%s"', (name: string) => {
        jest.spyOn(Intl.DateTimeFormat.prototype, 'formatToParts')
            .mockReturnValue([{type: 'timeZoneName', value: name}]);

        expect(
            TimeZone.of('Europe/London')
                .getRules()
                .getOffset(Instant.EPOCH)
                .equals(ZoneOffset.UTC),
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
            TimeZone.of(zone).getRules().getOffset(Instant.parse(instant))
                .equals(ZoneOffset.of(expected)),
        ).toBe(true);
    });

    it.each([
        ['America/New_York', '2024-06-01T12:00', '-04:00'],
        ['America/Sao_Paulo', '2024-06-01T12:00', '-03:00'],
        ['Asia/Tokyo', '2024-06-01T12:00', '+09:00'],
    ])('reports a single valid offset for %s at %s', (
        zone: string,
        dateTime: string,
        expected: string,
    ) => {
        const rules = TimeZone.of(zone).getRules();
        const local = LocalDateTime.parse(dateTime);
        const offsets = rules.getValidOffsets(local);

        expect(offsets).toHaveLength(1);
        expect(offsets[0].equals(ZoneOffset.of(expected))).toBe(true);
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
        const rules = TimeZone.of(zone).getRules();
        const local = LocalDateTime.parse(dateTime);
        const transition = rules.getTransition(local);

        expect(rules.getValidOffsets(local)).toHaveLength(0);
        expect(transition).not.toBeNull();
        expect(transition?.isGap()).toBe(true);
        expect(transition?.getValidOffsets()).toHaveLength(0);
    });

    it.each([
        ['America/New_York', '2024-11-03T01:30', '-04:00', '-05:00'],
        ['America/Sao_Paulo', '2018-02-17T23:30', '-02:00', '-03:00'],
        ['Australia/Lord_Howe', '2024-04-07T01:45', '+11:00', '+10:30'],
    ])('reports two valid offsets for %s at %s, which falls in an overlap', (
        zone: string,
        dateTime: string,
        before: string,
        after: string,
    ) => {
        const rules = TimeZone.of(zone).getRules();
        const local = LocalDateTime.parse(dateTime);
        const transition = rules.getTransition(local);
        const offsets = rules.getValidOffsets(local);

        expect(offsets).toHaveLength(2);
        expect(offsets[0].equals(ZoneOffset.of(before))).toBe(true);
        expect(offsets[1].equals(ZoneOffset.of(after))).toBe(true);
        expect(transition).not.toBeNull();
        expect(transition?.isOverlap()).toBe(true);
        expect(transition?.getOffsetBefore().equals(ZoneOffset.of(before))).toBe(true);
        expect(transition?.getOffsetAfter().equals(ZoneOffset.of(after))).toBe(true);
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
        const transition = TimeZone.of(zone)
            .getRules()
            .getTransition(LocalDateTime.parse(dateTime));

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
        const transition = TimeZone.of(zone)
            .getRules()
            .getNextTransition(Instant.parse(instant));

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
        const transition = TimeZone.of(zone)
            .getRules()
            .getPreviousTransition(Instant.parse(instant));

        expect(transition?.getInstant().equals(Instant.parse(expected))).toBe(true);
    });

    it.each([
        // The instant of the transition itself is not before it, so the search
        // has to skip to the one preceding it.
        ['2024-11-03T06:00:00Z', '2024-03-10T07:00:00Z'],
        ['2024-11-03T06:00:00.000000001Z', '2024-11-03T06:00:00Z'],
    ])('excludes the instant %s when finding the previous transition', (
        instant: string,
        expected: string,
    ) => {
        const transition = TimeZone.of('America/New_York')
            .getRules()
            .getPreviousTransition(Instant.parse(instant));

        expect(transition?.getInstant().equals(Instant.parse(expected))).toBe(true);
    });

    it.each([
        ['2024-03-10T07:00:00Z', '2024-11-03T06:00:00Z'],
        ['2024-03-10T06:59:59.999999999Z', '2024-03-10T07:00:00Z'],
    ])('excludes the instant %s when finding the next transition', (
        instant: string,
        expected: string,
    ) => {
        const transition = TimeZone.of('America/New_York')
            .getRules()
            .getNextTransition(Instant.parse(instant));

        expect(transition?.getInstant().equals(Instant.parse(expected))).toBe(true);
    });

    it('reports only a past transition for a zone that no longer observes daylight savings', () => {
        // Brazil abolished daylight savings after the transition of February 2019,
        // which still falls within the window the rules search backwards.
        const rules = TimeZone.of('America/Sao_Paulo').getRules();
        const instant = Instant.parse('2024-01-01T00:00:00Z');
        const previous = rules.getPreviousTransition(instant);

        expect(rules.getNextTransition(instant)).toBeNull();
        expect(previous?.getInstant().equals(Instant.parse('2019-02-17T02:00:00Z'))).toBe(true);
    });

    it('reports no transition beyond the window it searches', () => {
        // The last transition of America/Sao_Paulo is far outside the bounded window
        // searched from this instant, so it is not reported.
        const rules = TimeZone.of('America/Sao_Paulo').getRules();

        expect(rules.getPreviousTransition(Instant.parse('2030-01-01T00:00:00Z'))).toBeNull();
    });

    it('reports no adjacent transition for a zone that has never observed daylight savings', () => {
        const rules = TimeZone.of('Asia/Tokyo').getRules();
        const instant = Instant.parse('2024-01-01T00:00:00Z');

        expect(rules.getNextTransition(instant)).toBeNull();
        expect(rules.getPreviousTransition(instant)).toBeNull();
    });

    it.each(Object.entries({
        'the offset at an instant': (rules: ZoneRules, instant: Instant): unknown => rules.getOffset(instant),
        'the next transition': (rules: ZoneRules, instant: Instant): unknown => rules.getNextTransition(instant),
        'the previous transition': (
            rules: ZoneRules,
            instant: Instant,
        ): unknown => rules.getPreviousTransition(instant),
    }))('should reject an instant beyond the supported range when resolving %s', (_, resolve) => {
        const rules = TimeZone.of('America/New_York').getRules();

        expect(() => resolve(rules, Instant.parse('+500000-01-15T12:00:00Z'))).toThrow(
            'Unable to determine the offset of the timezone America/New_York at '
            + '+500000-01-15T12:00:00Z, as it is outside the range the runtime supports.',
        );
    });

    it.each(Object.entries({
        'the valid offsets': (
            rules: ZoneRules,
            dateTime: LocalDateTime,
        ): unknown => rules.getValidOffsets(dateTime),
        'the transition': (
            rules: ZoneRules,
            dateTime: LocalDateTime,
        ): unknown => rules.getTransition(dateTime),
    }))('should reject a local date-time beyond the supported range when resolving %s', (_, resolve) => {
        const rules = TimeZone.of('America/New_York').getRules();

        expect(() => resolve(rules, LocalDateTime.parse('+500000-01-15T12:00'))).toThrow(
            'Unable to determine the offset of the timezone America/New_York at '
            + '500000-01-15T12:00, as it is outside the range the runtime supports.',
        );
    });

    it('accepts the last instant the runtime can represent', () => {
        const rules = TimeZone.of('America/New_York').getRules();
        const instant = Instant.ofEpochSecond(8_640_000_000_000);

        expect(rules.getOffset(instant).equals(ZoneOffset.of('-04:00'))).toBe(true);
    });

    it('should reject a local date-time too close to the bound to read the offsets around it', () => {
        // The last local date-time a native date object can represent. Reading the
        // offsets around it runs past the bound, and applying any of them to it
        // lands on an instant the runtime cannot represent either.
        const rules = TimeZone.of('America/New_York').getRules();
        const dateTime = LocalDateTime.parse('+275760-09-13T00:00');

        expect(() => rules.getValidOffsets(dateTime)).toThrow(
            'Unable to determine the offset of the timezone America/New_York at '
            + '275760-09-13T00:00, as it is outside the range the runtime supports.',
        );
    });

    it('accepts the last local date-time the offsets around it can be read for', () => {
        const rules = TimeZone.of('America/New_York').getRules();
        // Two days and eighteen hours from the bound, which is the probing window
        // plus the largest offset a zone can observe.
        const dateTime = LocalDateTime.ofEpochSecond(8_640_000_000_000 - 237_600);

        expect(rules.getValidOffsets(dateTime)).toHaveLength(1);
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
            TimeZone.of(zone).getRules().resolveOffset(LocalDateTime.parse(dateTime))
                .equals(ZoneOffset.of(expected)),
        ).toBe(true);
    });

    it('can be converted to a string representation', () => {
        expect(TimeZone.of('America/Sao_Paulo').getRules().toString()).toBe('ZoneRules[America/Sao_Paulo]');
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

        it('should reject an offset it cannot parse', () => {
            mockOffsets(() => 'Coordinated Universal Time');

            expect(
                () => TimeZone.of('America/New_York')
                    .getRules()
                    .getOffset(Instant.EPOCH),
            )
                .toThrow('Unable to determine the offset of the timezone America/New_York.');
        });

        it('should reject a report with no offset at all', () => {
            jest.spyOn(Intl.DateTimeFormat.prototype, 'formatToParts').mockReturnValue([]);

            expect(
                () => TimeZone.of('America/New_York')
                    .getRules()
                    .getOffset(Instant.EPOCH),
            )
                .toThrow('Unable to determine the offset of the timezone America/New_York.');
        });

        it('reports no transition when the offsets bounding the search window agree', () => {
            mockOffsets(resolveInconsistently);

            const rules = TimeZone.of('America/New_York').getRules();
            const local = LocalDateTime.parse('2024-06-01T12:00');

            expect(rules.getValidOffsets(local)).toHaveLength(0);
            expect(rules.getTransition(local)).toBeNull();
        });

        it('should reject a local date-time it can neither resolve nor place in a transition', () => {
            mockOffsets(resolveInconsistently);

            const local = LocalDateTime.parse('2024-06-01T12:00');

            const resolve = (): ZoneOffset => TimeZone.of('America/New_York')
                .getRules()
                .resolveOffset(local);

            expect(resolve).toThrow(
                'Unable to resolve the offset of 2024-06-01T12:00 '
                + 'in ZoneRules[America/New_York].',
            );
        });
    });

    it('should be comparable', () => {
        const saoPaulo = TimeZone.of('America/Sao_Paulo').getRules();
        const tokyo = TimeZone.of('Asia/Tokyo').getRules();
        const behind = TimeZone.of('-03:00').getRules();
        const ahead = TimeZone.of('+03:00').getRules();

        expect(saoPaulo.equals(TimeZone.of('America/Sao_Paulo').getRules())).toBe(true);
        expect(saoPaulo.equals(tokyo)).toBe(false);
        expect(behind.equals(TimeZone.of('-03:00').getRules())).toBe(true);
        expect(behind.equals(ahead)).toBe(false);
    });
});
