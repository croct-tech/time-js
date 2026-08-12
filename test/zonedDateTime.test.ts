import {
    Instant,
    LocalDate,
    LocalDateTime,
    LocalTime,
    PeriodDuration,
    TimeZone,
    ZoneOffset,
    ZonedDateTime,
} from '../src';
import {FixedClock} from '../src/clock/fixedClock';
import {DefaultClockProvider} from '../src/defaultClockProvider';

describe('A value object representing a zoned date time', () => {
    const NEW_YORK = TimeZone.of('America/New_York');
    const SAO_PAULO = TimeZone.of('America/Sao_Paulo');
    const TOKYO = TimeZone.of('Asia/Tokyo');

    /**
     * Builds a zoned date-time from its parts without resolving it against the
     * rules of the time-zone, so that expected values are independent of the
     * behaviour under test.
     */
    function zoned(dateTime: string, offset: string, zone?: TimeZone): ZonedDateTime {
        const zoneOffset = ZoneOffset.of(offset);

        return ZonedDateTime.ofLenient(LocalDateTime.parse(dateTime), zoneOffset, zone ?? zoneOffset);
    }

    /**
     * The local date-time that occurs twice in America/New_York when the clocks
     * move back on the third of November 2024.
     */
    const OVERLAP = LocalDateTime.parse('2024-11-03T01:30');

    /**
     * The local date-time that never occurs in America/New_York when the clocks
     * move forward on the tenth of March 2024.
     */
    const GAP = LocalDateTime.parse('2024-03-10T02:30');

    /**
     * The day before São Paulo moved the clocks forward at midnight on the
     * fifteenth of October 2017.
     */
    const DATE_BASE = zoned('2017-10-14T10:00', '-03:00', SAO_PAULO);

    /**
     * The day before São Paulo moved the clocks forward at midnight on the
     * fourth of November 2018.
     */
    const TIME_BASE = zoned('2018-11-03T10:00', '-03:00', SAO_PAULO);

    it('can provide the current date-time from the given clock', () => {
        const clock = FixedClock.of(Instant.parse('2015-08-31T12:11:59.123456789Z'), SAO_PAULO);

        expect(
            ZonedDateTime.now(clock)
                .equals(zoned('2015-08-31T09:11:59.123456789', '-03:00', SAO_PAULO)),
        ).toBe(true);
    });

    it('can provide the current date-time from the given clock in a given time-zone', () => {
        const clock = FixedClock.of(Instant.parse('2015-08-31T12:11:59.123456789Z'), SAO_PAULO);

        expect(
            ZonedDateTime.nowIn(TOKYO, clock)
                .equals(zoned('2015-08-31T21:11:59.123456789', '+09:00', TOKYO)),
        ).toBe(true);
    });

    it('can provide the current date-time from the default clock', () => {
        const previous = DefaultClockProvider.getClock();

        DefaultClockProvider.setClock(
            FixedClock.of(Instant.parse('2015-08-31T12:11:59Z'), SAO_PAULO),
        );

        try {
            expect(
                ZonedDateTime.now()
                    .equals(zoned('2015-08-31T09:11:59', '-03:00', SAO_PAULO)),
            ).toBe(true);

            expect(
                ZonedDateTime.nowIn(TOKYO)
                    .equals(zoned('2015-08-31T21:11:59', '+09:00', TOKYO)),
            ).toBe(true);
        } finally {
            DefaultClockProvider.setClock(previous);
        }
    });

    it('can be created from a local date-time and a region', () => {
        const dateTime = ZonedDateTime.of(LocalDateTime.parse('2007-12-03T10:15:30'), SAO_PAULO);

        expect(dateTime.equals(zoned('2007-12-03T10:15:30', '-02:00', SAO_PAULO))).toBe(true);
        expect(dateTime.getZone().equals(SAO_PAULO)).toBe(true);
        expect(dateTime.getOffset().equals(ZoneOffset.of('-02:00'))).toBe(true);
    });

    it('can be created from a local date-time and a fixed offset', () => {
        const offset = ZoneOffset.of('-03:00');
        const dateTime = ZonedDateTime.of(LocalDateTime.parse('2007-12-03T10:15:30'), offset);

        expect(dateTime.equals(zoned('2007-12-03T10:15:30', '-03:00'))).toBe(true);
        expect(dateTime.getZone().equals(offset)).toBe(true);
        expect(dateTime.getOffset().equals(offset)).toBe(true);
    });

    it('uses the earlier offset for an ambiguous local date-time', () => {
        expect(
            ZonedDateTime.of(OVERLAP, NEW_YORK)
                .getOffset()
                .equals(ZoneOffset.of('-04:00')),
        ).toBe(true);
    });

    it.each([
        ['-04:00', '-04:00'],
        ['-05:00', '-05:00'],
        // An offset that is not valid at the overlap falls back to the earlier one.
        ['-03:00', '-04:00'],
    ])('prefers the offset %s for an ambiguous local date-time', (
        preferred: string,
        expected: string,
    ) => {
        const dateTime = ZonedDateTime.of(OVERLAP, NEW_YORK, ZoneOffset.of(preferred));

        expect(dateTime.getOffset().equals(ZoneOffset.of(expected))).toBe(true);
    });

    it('shifts a local date-time that falls in a gap forward by the length of the gap', () => {
        const dateTime = ZonedDateTime.of(GAP, NEW_YORK, ZoneOffset.of('-05:00'));

        expect(dateTime.equals(zoned('2024-03-10T03:30', '-04:00', NEW_YORK))).toBe(true);
    });

    it('can be created from an instant', () => {
        const dateTime = ZonedDateTime.ofInstant(Instant.parse('2024-06-01T16:00:00Z'), NEW_YORK);

        expect(dateTime.equals(zoned('2024-06-01T12:00', '-04:00', NEW_YORK))).toBe(true);
    });

    it('can be created from a number of seconds from the epoch', () => {
        const dateTime = ZonedDateTime.ofEpochSecond(1_717_257_600, 123, NEW_YORK);

        expect(dateTime.equals(zoned('2024-06-01T12:00:00.000000123', '-04:00', NEW_YORK))).toBe(true);
        expect(dateTime.toEpochSecond()).toBe(1_717_257_600);
    });

    it('can be created from a resolved local date-time and offset', () => {
        // The given offset is stale, so the instant it denotes is re-expressed
        // with the offset the zone actually observes.
        const dateTime = ZonedDateTime.ofResolved(
            LocalDateTime.parse('2007-12-03T10:15:30'),
            ZoneOffset.of('-03:00'),
            SAO_PAULO,
        );

        expect(dateTime.equals(zoned('2007-12-03T11:15:30', '-02:00', SAO_PAULO))).toBe(true);
    });

    it('can be created from a native date object', () => {
        const dateTime = ZonedDateTime.fromNative(new Date('2024-06-01T16:00:00Z'), NEW_YORK);

        expect(dateTime.equals(zoned('2024-06-01T12:00', '-04:00', NEW_YORK))).toBe(true);
    });

    it.each([
        ['-04:00'],
        ['-05:00'],
    ])('accepts the valid offset %s at an overlap when created strictly', (offset: string) => {
        const dateTime = ZonedDateTime.ofStrict(OVERLAP, ZoneOffset.of(offset), NEW_YORK);

        expect(dateTime.getOffset().equals(ZoneOffset.of(offset))).toBe(true);
        expect(dateTime.toLocalDateTime().equals(OVERLAP)).toBe(true);
    });

    it('should reject an offset that the zone does not observe when created strictly', () => {
        const create = (): ZonedDateTime => ZonedDateTime.ofStrict(
            OVERLAP,
            ZoneOffset.of('-03:00'),
            NEW_YORK,
        );

        expect(create).toThrow(
            'Zone offset "-03:00" is not valid for local date-time '
            + '2024-11-03T01:30 in zone "America/New_York".',
        );
    });

    it('should reject a local date-time that falls in a gap when created strictly', () => {
        const create = (): ZonedDateTime => ZonedDateTime.ofStrict(
            GAP,
            ZoneOffset.of('-05:00'),
            NEW_YORK,
        );

        expect(create).toThrow(
            'Local date-time 2024-03-10T02:30 does not exist in zone "America/New_York" '
            + 'due to a gap in the local time-line, typically caused by daylight savings.',
        );
    });

    it('accepts any combination when created leniently', () => {
        const dateTime = ZonedDateTime.ofLenient(GAP, ZoneOffset.of('-03:00'), NEW_YORK);

        expect(dateTime.toLocalDateTime().equals(GAP)).toBe(true);
        expect(dateTime.getOffset().equals(ZoneOffset.of('-03:00'))).toBe(true);
        expect(dateTime.getZone().equals(NEW_YORK)).toBe(true);
    });

    it('should reject a mismatched offset and fixed-offset zone when created leniently', () => {
        expect(() => ZonedDateTime.ofLenient(GAP, ZoneOffset.of('-03:00'), ZoneOffset.of('-04:00')))
            .toThrow('The time zone must match the zone offset.');
    });

    it.each([
        ['2024-11-03T01:30-04:00[America/New_York]', zoned('2024-11-03T01:30', '-04:00', NEW_YORK)],
        ['2024-11-03T01:30-05:00[America/New_York]', zoned('2024-11-03T01:30', '-05:00', NEW_YORK)],
        ['2007-12-03T10:15:30Z', zoned('2007-12-03T10:15:30', 'Z')],
        ['2007-12-03T10:15:30+05:45', zoned('2007-12-03T10:15:30', '+05:45')],
        [
            '2007-12-03T10:15:30.123456789-03:00',
            zoned('2007-12-03T10:15:30.123456789', '-03:00'),
        ],
        ['2007-12-03T10:15:30Z[UTC]', zoned('2007-12-03T10:15:30', 'Z', TimeZone.UTC)],
        [
            // The offset is stale, so the instant is re-expressed in the zone's offset.
            '2007-12-03T10:15:30-03:00[America/Sao_Paulo]',
            zoned('2007-12-03T11:15:30', '-02:00', SAO_PAULO),
        ],
    ])('should parse "%s"', (value: string, expected: ZonedDateTime) => {
        expect(ZonedDateTime.parse(value).equals(expected)).toBe(true);
    });

    it.each([
        ['2007-12-03T10:15:30'],
        ['2007-12-03T10:15:30[America/Sao_Paulo]'],
        ['not a date-time'],
        ['2007-12-03T10:15:30-03:00[Nowhere/Nowhere]'],
        ['2007-13-03T10:15:30Z'],
        [''],
    ])('should fail to parse "%s"', (value: string) => {
        expect(() => ZonedDateTime.parse(value)).toThrow();
        expect(ZonedDateTime.isValid(value)).toBe(false);
    });

    it.each([
        ['2007-12-03T10:15:30Z'],
        ['2024-11-03T01:30-04:00[America/New_York]'],
    ])('should determine that "%s" is a valid zoned date-time', (value: string) => {
        expect(ZonedDateTime.isValid(value)).toBe(true);
    });

    it('provides the parts of the local date-time', () => {
        const dateTime = zoned('2007-12-03T10:15:30.123456789', 'Z');

        expect(dateTime.getYear()).toBe(2007);
        expect(dateTime.getMonth()).toBe(12);
        expect(dateTime.getDay()).toBe(3);
        expect(dateTime.getHour()).toBe(10);
        expect(dateTime.getMinute()).toBe(15);
        expect(dateTime.getSecond()).toBe(30);
        expect(dateTime.getNano()).toBe(123_456_789);
    });

    it('can be converted to its local parts', () => {
        const dateTime = zoned('2007-12-03T10:15:30', '-03:00');

        expect(dateTime.toLocalDate().equals(LocalDate.of(2007, 12, 3))).toBe(true);
        expect(dateTime.toLocalTime().equals(LocalTime.of(10, 15, 30))).toBe(true);
        expect(dateTime.toLocalDateTime().equals(LocalDateTime.parse('2007-12-03T10:15:30'))).toBe(true);
    });

    it('can be converted to an instant', () => {
        const dateTime = zoned('2024-06-01T12:00', '-04:00', NEW_YORK);

        expect(dateTime.toInstant().equals(Instant.parse('2024-06-01T16:00:00Z'))).toBe(true);
        expect(dateTime.toEpochSecond()).toBe(1_717_257_600);
    });

    it('selects the earlier offset at an overlap', () => {
        const later = ZonedDateTime.of(OVERLAP, NEW_YORK, ZoneOffset.of('-05:00'));
        const earlier = later.withEarlierOffsetAtOverlap();

        expect(earlier.equals(zoned('2024-11-03T01:30', '-04:00', NEW_YORK))).toBe(true);
        expect(earlier.toInstant().equals(Instant.parse('2024-11-03T05:30:00Z'))).toBe(true);
        expect(earlier.withEarlierOffsetAtOverlap()).toBe(earlier);
    });

    it('selects the later offset at an overlap', () => {
        const earlier = ZonedDateTime.of(OVERLAP, NEW_YORK, ZoneOffset.of('-04:00'));
        const later = earlier.withLaterOffsetAtOverlap();

        expect(later.equals(zoned('2024-11-03T01:30', '-05:00', NEW_YORK))).toBe(true);
        expect(later.toInstant().equals(Instant.parse('2024-11-03T06:30:00Z'))).toBe(true);
        expect(later.withLaterOffsetAtOverlap()).toBe(later);
    });

    it('has no offset to select outside an overlap', () => {
        const dateTime = zoned('2024-06-01T12:00', '-04:00', NEW_YORK);

        expect(dateTime.withEarlierOffsetAtOverlap()).toBe(dateTime);
        expect(dateTime.withLaterOffsetAtOverlap()).toBe(dateTime);
    });

    it('can change the time-zone keeping the local date-time', () => {
        const dateTime = zoned('2024-06-01T12:00', '-04:00', NEW_YORK);
        const moved = dateTime.withZoneSameLocal(SAO_PAULO);

        expect(moved.equals(zoned('2024-06-01T12:00', '-03:00', SAO_PAULO))).toBe(true);
        expect(dateTime.withZoneSameLocal(NEW_YORK)).toBe(dateTime);
    });

    it('can change the time-zone keeping the instant', () => {
        const dateTime = zoned('2024-06-01T12:00', '-04:00', NEW_YORK);
        const moved = dateTime.withZoneSameInstant(SAO_PAULO);

        expect(moved.equals(zoned('2024-06-01T13:00', '-03:00', SAO_PAULO))).toBe(true);
        expect(moved.toInstant().equals(dateTime.toInstant())).toBe(true);
        expect(dateTime.withZoneSameInstant(NEW_YORK)).toBe(dateTime);
    });

    it('can replace the time-zone with its current offset', () => {
        const dateTime = zoned('2024-06-01T12:00', '-04:00', NEW_YORK);
        const fixed = dateTime.withFixedOffsetZone();

        expect(fixed.equals(zoned('2024-06-01T12:00', '-04:00'))).toBe(true);
        expect(fixed.getZone().equals(fixed.getOffset())).toBe(true);
        expect(fixed.withFixedOffsetZone()).toBe(fixed);
    });

    it('can create a copy with a different year, month or day', () => {
        const dateTime = zoned('2024-06-01T12:00', '-04:00', NEW_YORK);

        expect(dateTime.withYear(2019).equals(zoned('2019-06-01T12:00', '-04:00', NEW_YORK)))
            .toBe(true);
        expect(dateTime.withMonth(1).equals(zoned('2024-01-01T12:00', '-05:00', NEW_YORK)))
            .toBe(true);
        expect(dateTime.withDay(2).equals(zoned('2024-06-02T12:00', '-04:00', NEW_YORK)))
            .toBe(true);
    });

    it('can create a copy with a different hour, minute or second', () => {
        const dateTime = zoned('2024-06-01T12:00', '-04:00', NEW_YORK);

        expect(dateTime.withHour(0).equals(zoned('2024-06-01T00:00', '-04:00', NEW_YORK)))
            .toBe(true);
        expect(dateTime.withMinute(30).equals(zoned('2024-06-01T12:30', '-04:00', NEW_YORK)))
            .toBe(true);
        expect(dateTime.withSecond(30).equals(zoned('2024-06-01T12:00:30', '-04:00', NEW_YORK)))
            .toBe(true);
    });

    it('can create a copy with a different fraction of second', () => {
        const dateTime = zoned('2024-06-01T12:00', '-04:00', NEW_YORK);

        expect(
            dateTime.withMilli(500)
                .equals(zoned('2024-06-01T12:00:00.5', '-04:00', NEW_YORK)),
        ).toBe(true);

        expect(
            dateTime.withMicro(500)
                .equals(zoned('2024-06-01T12:00:00.0005', '-04:00', NEW_YORK)),
        ).toBe(true);

        expect(
            dateTime.withNano(1)
                .equals(zoned('2024-06-01T12:00:00.000000001', '-04:00', NEW_YORK)),
        ).toBe(true);
    });

    it('resolves the offset again when a field changes across a transition', () => {
        // Moving from June to January leaves daylight savings, so the offset changes.
        const summer = zoned('2024-06-01T12:00', '-04:00', NEW_YORK);

        expect(summer.withMonth(1).equals(zoned('2024-01-01T12:00', '-05:00', NEW_YORK))).toBe(true);
    });

    it('shifts a field change that lands in a gap forward by the length of the gap', () => {
        const dateTime = zoned('2024-03-10T02:30', '-05:00', NEW_YORK);

        // The tenth of March has no 02:30 in New York, so the result is shifted.
        expect(
            dateTime.withDay(10)
                .equals(zoned('2024-03-10T03:30', '-04:00', NEW_YORK)),
        ).toBe(true);
    });

    it('keeps the current offset when a field change lands in an overlap', () => {
        const dateTime = zoned('2024-11-03T00:30', '-04:00', NEW_YORK);

        expect(
            dateTime.withMinute(30)
                .withHour(1)
                .equals(zoned('2024-11-03T01:30', '-04:00', NEW_YORK)),
        ).toBe(true);
    });

    it('should reject an out-of-range date field', () => {
        const dateTime = zoned('2024-06-01T12:00', '-04:00', NEW_YORK);

        expect(() => dateTime.withMonth(13))
            .toThrow('Month must be an integer between 1 and 12.');
        // June has thirty days.
        expect(() => dateTime.withDay(31))
            .toThrow('Day must be an integer between 1 and 30.');
    });

    it('should reject an out-of-range time field', () => {
        const dateTime = zoned('2024-06-01T12:00', '-04:00', NEW_YORK);

        expect(() => dateTime.withHour(24))
            .toThrow('Hour must be an integer between 0 and 23.');
        expect(() => dateTime.withMinute(60))
            .toThrow('Minute must be an integer between 0 and 59.');
        expect(() => dateTime.withSecond(60))
            .toThrow('Second must be an integer between 0 and 59.');
        expect(() => dateTime.withNano(1_000_000_000))
            .toThrow('Nanosecond of second must be an integer between 0 and 999999999.');
        expect(() => dateTime.withMilli(1_000))
            .toThrow('Nanosecond of second must be an integer between 0 and 999999999.');
        expect(() => dateTime.withMicro(1_000_000))
            .toThrow('Nanosecond of second must be an integer between 0 and 999999999.');
    });

    it.each([
        // São Paulo moved the clocks forward at midnight on the fifteenth of October 2017,
        // so these amounts land on the far side of the transition.
        {
            method: 'plusDays',
            result: DATE_BASE.plusDays(1),
            expected: zoned('2017-10-15T10:00', '-02:00', SAO_PAULO),
        },
        {
            method: 'plusWeeks',
            result: DATE_BASE.plusWeeks(1),
            expected: zoned('2017-10-21T10:00', '-02:00', SAO_PAULO),
        },
        {
            method: 'plusMonths',
            result: DATE_BASE.plusMonths(1),
            expected: zoned('2017-11-14T10:00', '-02:00', SAO_PAULO),
        },
        // These stay on the near side, as daylight savings started later in 2016 and 2018.
        {
            method: 'minusDays',
            result: DATE_BASE.minusDays(1),
            expected: zoned('2017-10-13T10:00', '-03:00', SAO_PAULO),
        },
        {
            method: 'minusWeeks',
            result: DATE_BASE.minusWeeks(1),
            expected: zoned('2017-10-07T10:00', '-03:00', SAO_PAULO),
        },
        {
            method: 'minusMonths',
            result: DATE_BASE.minusMonths(1),
            expected: zoned('2017-09-14T10:00', '-03:00', SAO_PAULO),
        },
        {
            method: 'plusYears',
            result: DATE_BASE.plusYears(1),
            expected: zoned('2018-10-14T10:00', '-03:00', SAO_PAULO),
        },
        {
            method: 'minusYears',
            result: DATE_BASE.minusYears(1),
            expected: zoned('2016-10-14T10:00', '-03:00', SAO_PAULO),
        },
    ])('keeps the local time when $method crosses a transition', scenario => {
        expect(scenario.result.equals(scenario.expected)).toBe(true);
        expect(scenario.result.toLocalTime().equals(LocalTime.of(10, 0))).toBe(true);
    });

    it.each([
        {
            method: 'plusHours',
            result: TIME_BASE.plusHours(24),
            expected: zoned('2018-11-04T11:00', '-02:00', SAO_PAULO),
        },
        {
            method: 'minusHours',
            result: TIME_BASE.minusHours(24),
            expected: zoned('2018-11-02T10:00', '-03:00', SAO_PAULO),
        },
        {
            method: 'plusMinutes',
            result: TIME_BASE.plusMinutes(60),
            expected: zoned('2018-11-03T11:00', '-03:00', SAO_PAULO),
        },
        {
            method: 'minusMinutes',
            result: TIME_BASE.minusMinutes(60),
            expected: zoned('2018-11-03T09:00', '-03:00', SAO_PAULO),
        },
        {
            method: 'plusSeconds',
            result: TIME_BASE.plusSeconds(3_600),
            expected: zoned('2018-11-03T11:00', '-03:00', SAO_PAULO),
        },
        {
            method: 'minusSeconds',
            result: TIME_BASE.minusSeconds(3_600),
            expected: zoned('2018-11-03T09:00', '-03:00', SAO_PAULO),
        },
        {
            method: 'plusMillis',
            result: TIME_BASE.plusMillis(1_000),
            expected: zoned('2018-11-03T10:00:01', '-03:00', SAO_PAULO),
        },
        {
            method: 'minusMillis',
            result: TIME_BASE.minusMillis(1_000),
            expected: zoned('2018-11-03T09:59:59', '-03:00', SAO_PAULO),
        },
        {
            method: 'plusMicros',
            result: TIME_BASE.plusMicros(1_000_000),
            expected: zoned('2018-11-03T10:00:01', '-03:00', SAO_PAULO),
        },
        {
            method: 'minusMicros',
            result: TIME_BASE.minusMicros(1_000_000),
            expected: zoned('2018-11-03T09:59:59', '-03:00', SAO_PAULO),
        },
        {
            method: 'plusNanos',
            result: TIME_BASE.plusNanos(1_000_000_000),
            expected: zoned('2018-11-03T10:00:01', '-03:00', SAO_PAULO),
        },
        {
            method: 'minusNanos',
            result: TIME_BASE.minusNanos(1_000_000_000),
            expected: zoned('2018-11-03T09:59:59', '-03:00', SAO_PAULO),
        },
    ])('keeps the elapsed time when $method crosses a transition', scenario => {
        expect(scenario.result.equals(scenario.expected)).toBe(true);
    });

    it('adds a day as a local amount and twenty-four hours as an elapsed amount', () => {
        const dateTime = zoned('2018-11-03T10:00', '-03:00', SAO_PAULO);

        expect(dateTime.plusDays(1).equals(zoned('2018-11-04T10:00', '-02:00', SAO_PAULO))).toBe(true);
        expect(dateTime.plusHours(24).equals(zoned('2018-11-04T11:00', '-02:00', SAO_PAULO))).toBe(true);
    });

    it('adds an amount with both a date and a time part', () => {
        // The day is added to the local date-time, which crosses into daylight savings,
        // and the hour is then added to the instant.
        const dateTime = zoned('2018-11-03T10:00', '-03:00', SAO_PAULO);

        expect(
            dateTime.plus(PeriodDuration.parse('P1DT1H'))
                .equals(zoned('2018-11-04T11:00', '-02:00', SAO_PAULO)),
        ).toBe(true);
    });

    it('subtracts an amount with both a date and a time part', () => {
        const dateTime = zoned('2018-11-04T11:00', '-02:00', SAO_PAULO);

        expect(
            dateTime.minus(PeriodDuration.parse('P1DT1H'))
                .equals(zoned('2018-11-03T10:00', '-03:00', SAO_PAULO)),
        ).toBe(true);
    });

    it('returns the amount of time until another date-time', () => {
        const start = zoned('2024-06-01T12:00', '-04:00', NEW_YORK);
        const end = zoned('2024-06-02T18:30', '-03:00', SAO_PAULO);

        // The end is 2024-06-02T17:30 once expressed in the zone of the start.
        expect(start.until(end).equals(PeriodDuration.parse('P1DT5H30M'))).toBe(true);
    });

    it('converts the end date-time to its own zone before measuring', () => {
        const start = zoned('2024-06-01T12:00', '-04:00', NEW_YORK);
        const end = start.plusHours(1).withZoneSameInstant(TOKYO);

        expect(start.until(end).equals(PeriodDuration.parse('PT1H'))).toBe(true);
    });

    it('should be comparable for equality', () => {
        const one = zoned('2024-06-01T12:00', '-04:00', NEW_YORK);
        const two = zoned('2024-06-01T13:00', '-03:00', SAO_PAULO);
        const three = zoned('2024-06-01T12:00', '-04:00', NEW_YORK);

        expect(one.equals(one)).toBe(true);
        expect(one.equals(three)).toBe(true);
        // Both denote the same instant, but in different time-zones.
        expect(one.equals(two)).toBe(false);
        expect(one.toInstant().equals(two.toInstant())).toBe(true);
    });

    it('distinguishes the two date-times of an overlap', () => {
        const earlier = ZonedDateTime.of(OVERLAP, NEW_YORK, ZoneOffset.of('-04:00'));
        const later = ZonedDateTime.of(OVERLAP, NEW_YORK, ZoneOffset.of('-05:00'));

        expect(earlier.equals(later)).toBe(false);
        expect(earlier.isBefore(later)).toBe(true);
        expect(earlier.toLocalDateTime().equals(later.toLocalDateTime())).toBe(true);
    });

    it('compares date-times primarily by the instant they denote', () => {
        const earlier = zoned('2024-06-01T12:00', '-04:00', NEW_YORK);
        const later = zoned('2024-06-01T12:00', '-03:00', SAO_PAULO);

        expect(earlier.isBefore(later)).toBe(false);
        expect(earlier.isAfter(later)).toBe(true);
        expect(earlier.isBeforeOrEqual(earlier)).toBe(true);
        expect(earlier.isAfterOrEqual(earlier)).toBe(true);
        expect(earlier.compare(earlier)).toBe(0);
    });

    it('orders date-times denoting the same instant by their local date-time and zone', () => {
        const newYork = zoned('2024-06-01T12:00', '-04:00', NEW_YORK);
        const saoPaulo = zoned('2024-06-01T13:00', '-03:00', SAO_PAULO);

        expect(newYork.compare(saoPaulo)).toBeLessThan(0);
        expect(saoPaulo.compare(newYork)).toBeGreaterThan(0);
    });

    it('can be converted to a string in the ISO-8601 format', () => {
        expect(zoned('2024-06-01T12:00', '-04:00', NEW_YORK).toString())
            .toBe('2024-06-01T12:00-04:00[America/New_York]');

        // The time-zone is omitted when it is the offset itself.
        expect(zoned('2024-06-01T12:00', '-04:00').toString()).toBe('2024-06-01T12:00-04:00');
        expect(zoned('2024-06-01T12:00', 'Z').toString()).toBe('2024-06-01T12:00Z');
    });

    it('should serialize to JSON in the ISO-8601 format', () => {
        expect(zoned('2024-06-01T12:00', '-04:00', NEW_YORK).toJSON())
            .toBe('2024-06-01T12:00-04:00[America/New_York]');
    });

    it('can be created from an instant through the instant itself', () => {
        expect(
            Instant.parse('2024-06-01T16:00:00Z')
                .atZone(NEW_YORK)
                .equals(zoned('2024-06-01T12:00', '-04:00', NEW_YORK)),
        ).toBe(true);
    });

    it('can be created from a local date-time through the local date-time itself', () => {
        expect(
            LocalDateTime.parse('2024-06-01T12:00')
                .atZone(NEW_YORK)
                .equals(zoned('2024-06-01T12:00', '-04:00', NEW_YORK)),
        ).toBe(true);
    });
});
