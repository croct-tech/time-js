import {Duration, Instant, LocalTime} from '../src';
import {intDiv} from '../src/math';

describe('A value object representing a time duration', () => {
    it('should create a zero length duration', () => {
        const duration = Duration.zero();

        expect(duration.getSeconds()).toStrictEqual(0);
        expect(duration.getNanos()).toStrictEqual(0);
    });

    it('can be created from a number of weeks', () => {
        const duration = Duration.ofWeeks(9);

        expect(duration.getSeconds()).toStrictEqual(9 * 7 * 3600 * 24);
        expect(duration.getNanos()).toStrictEqual(0);
    });

    it('can be created from a number of standard 24 hours days', () => {
        const duration = Duration.ofDays(9);

        expect(duration.getSeconds()).toStrictEqual(9 * 3600 * 24);
        expect(duration.getNanos()).toStrictEqual(0);
    });

    it('can be created from a number of standard hours', () => {
        const duration = Duration.ofHours(9);

        expect(duration.getSeconds()).toStrictEqual(9 * 3600);
        expect(duration.getNanos()).toStrictEqual(0);
    });

    it('can be created from a number of standard minutes', () => {
        const duration = Duration.ofMinutes(9);

        expect(duration.getSeconds()).toStrictEqual(9 * 60);
        expect(duration.getNanos()).toStrictEqual(0);
    });

    it('can be created from a number of seconds and nanos', () => {
        const zeroDuration = Duration.ofSeconds(0);

        expect(zeroDuration.getSeconds()).toStrictEqual(0);
        expect(zeroDuration.getNanos()).toStrictEqual(0);

        const nanoDuration = Duration.ofSeconds(0, 9);

        expect(nanoDuration.getSeconds()).toStrictEqual(0);
        expect(nanoDuration.getNanos()).toStrictEqual(9);

        const secondsDuration = Duration.ofSeconds(9);

        expect(secondsDuration.getSeconds()).toStrictEqual(9);
        expect(secondsDuration.getNanos()).toStrictEqual(0);

        const fullDuration = Duration.ofSeconds(9, 8);

        expect(fullDuration.getSeconds()).toStrictEqual(9);
        expect(fullDuration.getNanos()).toStrictEqual(8);

        const complementedDuration = Duration.ofSeconds(9, -8);

        expect(complementedDuration.getSeconds()).toStrictEqual(8);
        expect(complementedDuration.getNanos()).toStrictEqual(999999992);

        const negativeDuration = Duration.ofSeconds(-9, 8);

        expect(negativeDuration.getSeconds()).toStrictEqual(-9);
        expect(negativeDuration.getNanos()).toStrictEqual(8);
    });

    it('can be created from a number of milliseconds', () => {
        const millisDuration = Duration.ofMillis(9);

        expect(millisDuration.getSeconds()).toStrictEqual(0);
        expect(millisDuration.getNanos()).toStrictEqual(9000000);

        const secondsDuration = Duration.ofMillis(9000);

        expect(secondsDuration.getSeconds()).toStrictEqual(9);
        expect(secondsDuration.getNanos()).toStrictEqual(0);
    });

    it('can be created from a number of microseconds', () => {
        const microsDuration = Duration.ofMicros(9);

        expect(microsDuration.getSeconds()).toStrictEqual(0);
        expect(microsDuration.getNanos()).toStrictEqual(9000);

        const secondsDuration = Duration.ofMicros(9000000);

        expect(secondsDuration.getSeconds()).toStrictEqual(9);
        expect(secondsDuration.getNanos()).toStrictEqual(0);
    });

    it('can be created from a number of nanoseconds', () => {
        const nanosDuration = Duration.ofNanos(9);

        expect(nanosDuration.getSeconds()).toStrictEqual(0);
        expect(nanosDuration.getNanos()).toStrictEqual(9);

        const secondsDuration = Duration.ofNanos(9000000000);

        expect(secondsDuration.getSeconds()).toStrictEqual(9);
        expect(secondsDuration.getNanos()).toStrictEqual(0);
    });

    it.each([
        // Zero
        ['PT0S', 0, 0],
        ['-PT0S', 0, 0],

        // Unsigned seconds
        ['PT1S', 1, 0],
        ['PT12S', 12, 0],
        ['PT123456789S', 123456789, 0],
        [`PT${Number.MAX_SAFE_INTEGER}S`, Number.MAX_SAFE_INTEGER, 0],
        ['-PT1S', -1, 0],
        ['-PT12S', -12, 0],
        ['-PT123456789S', -123456789, 0],
        [`-PT${Number.MAX_SAFE_INTEGER}S`, Number.MIN_SAFE_INTEGER, 0],

        // Signed seconds
        ['PT+1S', 1, 0],
        ['PT+12S', 12, 0],
        ['PT-1S', -1, 0],
        ['PT-12S', -12, 0],
        ['PT-123456789S', -123456789, 0],
        [`PT${Number.MIN_SAFE_INTEGER}S`, Number.MIN_SAFE_INTEGER, 0],
        ['-PT+1S', -1, 0],
        ['-PT+12S', -12, 0],
        ['-PT-1S', 1, 0],
        ['-PT-12S', 12, 0],
        ['-PT-123456789S', 123456789, 0],
        [`-PT${Number.MIN_SAFE_INTEGER}S`, Number.MAX_SAFE_INTEGER, 0],

        // Unsigned fractions
        ['PT0.1S', 0, 100000000],
        ['PT1.1S', 1, 100000000],
        ['PT1.12S', 1, 120000000],
        ['PT1.123S', 1, 123000000],
        ['PT1.1234S', 1, 123400000],
        ['PT1.12345S', 1, 123450000],
        ['PT1.123456S', 1, 123456000],
        ['PT1.1234567S', 1, 123456700],
        ['PT1.12345678S', 1, 123456780],
        ['PT1.123456789S', 1, 123456789],
        [`PT${Number.MAX_SAFE_INTEGER}.123456789S`, Number.MAX_SAFE_INTEGER, 123456789],
        ['-PT0.1S', -1, LocalTime.NANOS_PER_SECOND - 100000000],
        ['-PT1.1S', -2, LocalTime.NANOS_PER_SECOND - 100000000],
        ['-PT1.12S', -2, LocalTime.NANOS_PER_SECOND - 120000000],
        ['-PT1.123S', -2, LocalTime.NANOS_PER_SECOND - 123000000],
        ['-PT1.1234S', -2, LocalTime.NANOS_PER_SECOND - 123400000],
        ['-PT1.12345S', -2, LocalTime.NANOS_PER_SECOND - 123450000],
        ['-PT1.123456S', -2, LocalTime.NANOS_PER_SECOND - 123456000],
        ['-PT1.1234567S', -2, LocalTime.NANOS_PER_SECOND - 123456700],
        ['-PT1.12345678S', -2, LocalTime.NANOS_PER_SECOND - 123456780],
        ['-PT1.123456789S', -2, LocalTime.NANOS_PER_SECOND - 123456789],
        [
            `-PT${Number.MAX_SAFE_INTEGER - 1}.123456789S`,
            Number.MIN_SAFE_INTEGER,
            LocalTime.NANOS_PER_SECOND - 123456789,
        ],

        // Signed fractions
        ['PT+0.1S', 0, 100000000],
        ['PT+1.1S', 1, 100000000],
        ['PT+1.12S', 1, 120000000],
        ['PT+1.123S', 1, 123000000],
        ['PT+1.1234S', 1, 123400000],
        ['PT+1.12345S', 1, 123450000],
        ['PT+1.123456S', 1, 123456000],
        ['PT+1.1234567S', 1, 123456700],
        ['PT+1.12345678S', 1, 123456780],
        ['PT+1.123456789S', 1, 123456789],
        [`PT+${Number.MAX_SAFE_INTEGER}.123456789S`, Number.MAX_SAFE_INTEGER, 123456789],
        ['PT-0.1S', -1, LocalTime.NANOS_PER_SECOND - 100000000],
        ['PT-1.1S', -2, LocalTime.NANOS_PER_SECOND - 100000000],
        ['PT-1.12S', -2, LocalTime.NANOS_PER_SECOND - 120000000],
        ['PT-1.123S', -2, LocalTime.NANOS_PER_SECOND - 123000000],
        ['PT-1.1234S', -2, LocalTime.NANOS_PER_SECOND - 123400000],
        ['PT-1.12345S', -2, LocalTime.NANOS_PER_SECOND - 123450000],
        ['PT-1.123456S', -2, LocalTime.NANOS_PER_SECOND - 123456000],
        ['PT-1.1234567S', -2, LocalTime.NANOS_PER_SECOND - 123456700],
        ['PT-1.12345678S', -2, LocalTime.NANOS_PER_SECOND - 123456780],
        ['PT-1.123456789S', -2, LocalTime.NANOS_PER_SECOND - 123456789],
        [`PT${Number.MAX_SAFE_INTEGER}.000000000S`, Number.MAX_SAFE_INTEGER, 0],
        ['-PT+0.1S', -1, LocalTime.NANOS_PER_SECOND - 100000000],
        ['-PT+1.1S', -2, LocalTime.NANOS_PER_SECOND - 100000000],
        ['-PT+1.12S', -2, LocalTime.NANOS_PER_SECOND - 120000000],
        ['-PT+1.123S', -2, LocalTime.NANOS_PER_SECOND - 123000000],
        ['-PT+1.1234S', -2, LocalTime.NANOS_PER_SECOND - 123400000],
        ['-PT+1.12345S', -2, LocalTime.NANOS_PER_SECOND - 123450000],
        ['-PT+1.123456S', -2, LocalTime.NANOS_PER_SECOND - 123456000],
        ['-PT+1.1234567S', -2, LocalTime.NANOS_PER_SECOND - 123456700],
        ['-PT+1.12345678S', -2, LocalTime.NANOS_PER_SECOND - 123456780],
        ['-PT+1.123456789S', -2, LocalTime.NANOS_PER_SECOND - 123456789],
        [
            `-PT+${Number.MAX_SAFE_INTEGER - 1}.123456789S`,
            Number.MIN_SAFE_INTEGER,
            LocalTime.NANOS_PER_SECOND - 123456789,
        ],
        ['-PT-0.1S', 0, 100000000],
        ['-PT-1.1S', 1, 100000000],
        ['-PT-1.12S', 1, 120000000],
        ['-PT-1.123S', 1, 123000000],
        ['-PT-1.1234S', 1, 123400000],
        ['-PT-1.12345S', 1, 123450000],
        ['-PT-1.123456S', 1, 123456000],
        ['-PT-1.1234567S', 1, 123456700],
        ['-PT-1.12345678S', 1, 123456780],
        ['-PT-1.123456789S', 1, 123456789],
        [`-PT${Number.MAX_SAFE_INTEGER}.000000000S`, Number.MIN_SAFE_INTEGER, 0],

        // Minutes
        ['PT12M', 12 * 60, 0],
        ['PT12M0.35S', 12 * 60, 350000000],
        ['PT12M1.35S', 12 * 60 + 1, 350000000],
        ['PT12M-0.35S', 12 * 60 - 1, LocalTime.NANOS_PER_SECOND - 350000000],
        ['PT12M-1.35S', 12 * 60 - 2, LocalTime.NANOS_PER_SECOND - 350000000],
        ['-PT12M', -12 * 60, 0],
        ['-PT12M0.35S', -12 * 60 - 1, LocalTime.NANOS_PER_SECOND - 350000000],
        ['-PT12M1.35S', -12 * 60 - 2, LocalTime.NANOS_PER_SECOND - 350000000],
        ['-PT12M-0.35S', -12 * 60, 350000000],
        ['-PT12M-1.35S', -12 * 60 + 1, 350000000],

        // Hours
        ['PT12H', 12 * 3600, 0],
        ['PT12H0.35S', 12 * 3600, 350000000],
        ['PT12H1.35S', 12 * 3600 + 1, 350000000],
        ['PT12H-0.35S', 12 * 3600 - 1, LocalTime.NANOS_PER_SECOND - 350000000],
        ['PT12H-1.35S', 12 * 3600 - 2, LocalTime.NANOS_PER_SECOND - 350000000],
        ['-PT12H', -12 * 3600, 0],
        ['-PT12H0.35S', -12 * 3600 - 1, LocalTime.NANOS_PER_SECOND - 350000000],
        ['-PT12H1.35S', -12 * 3600 - 2, LocalTime.NANOS_PER_SECOND - 350000000],
        ['-PT12H-0.35S', -12 * 3600, 350000000],
        ['-PT12H-1.35S', -12 * 3600 + 1, 350000000],

        // Days
        ['P12D', 12 * 24 * 3600, 0],
        ['P12DT0.35S', 12 * 24 * 3600, 350000000],
        ['P12DT1.35S', 12 * 24 * 3600 + 1, 350000000],
        ['P12DT-0.35S', 12 * 24 * 3600 - 1, 1000000000 - 350000000],
        ['P12DT-1.35S', 12 * 24 * 3600 - 2, 1000000000 - 350000000],
        ['-P12D', -12 * 24 * 3600, 0],
        ['-P12DT0.35S', -12 * 24 * 3600 - 1, LocalTime.NANOS_PER_SECOND - 350000000],
        ['-P12DT1.35S', -12 * 24 * 3600 - 2, LocalTime.NANOS_PER_SECOND - 350000000],
        ['-P12DT-0.35S', -12 * 24 * 3600, 350000000],
        ['-P12DT-1.35S', -12 * 24 * 3600 + 1, 350000000],
    ])('can parse a ISO-8601 duration string', (value, seconds, nanos) => {
        const duration = Duration.parse(value);
        const lowercaseDuration = Duration.parse(value.toLowerCase());
        const commaDuration = Duration.parse(value.replace('.', ','));

        expect(duration.getSeconds()).toBe(seconds);
        expect(duration.getNanos()).toBe(nanos);

        expect(lowercaseDuration.getSeconds()).toBe(seconds);
        expect(lowercaseDuration.getNanos()).toBe(nanos);

        expect(commaDuration.getSeconds()).toBe(seconds);
        expect(commaDuration.getNanos()).toBe(nanos);
    });

    it.each([
        '',
        'PT',
        'PT0SS',
        'PPT0S',
        'P1DT',
        'PTS',
        'AT0S',
        'PA0S',
        'PT0A',
        'PT+S',
        'PT-S',
        'PT.S',
        'PTAS',
        'PT-.S',
        'PT+.S',
        'PT1ABC2S',
        'PT1.1ABC2S',
        'PT0.1234567891S',
        'PT.1S',
        'PT2.-3',
        'PT-2.-3',
        'PT2.+3',
        'PT-2.+3',
    ])('cannot parse a malformed duration string', value => {
        expect(() => Duration.parse(value)).toThrow(`Unrecognized ISO-8601 duration string "${value}".`);
    });

    it('cannot parse a duration that overflows integer limits', () => {
        expect(() => Duration.parse('PT123456789123456789123456789S'))
            .toThrow('The result overflows the range of safe integers.');
    });

    type BetweenScenario = {
        start: Instant,
        end: Instant,
        duration: Duration,
    };

    it.each<BetweenScenario>([
        {
            start: Instant.parse('2015-08-31T00:00:00Z'),
            end: Instant.parse('2015-08-31T00:00:00Z'),
            duration: Duration.zero(),
        },
        {
            start: Instant.parse('2015-08-31T00:00:00Z'),
            end: Instant.parse('2015-08-31T01:02:03.000000004Z'),
            duration: Duration.ofSeconds(3600 + 2 * 60 + 3, 4),
        },
        {
            start: Instant.parse('2015-08-31T01:02:03.000000004Z'),
            end: Instant.parse('2015-08-31T00:00:00Z'),
            duration: Duration.ofSeconds(-3600 - 2 * 60 - 3, -4),
        },
        {
            start: Instant.parse('2015-08-31T00:00:02.000000005Z'),
            end: Instant.parse('2015-08-31T00:00:01.000000009Z'),
            duration: Duration.ofSeconds(-1, 4),
        },
        {
            start: Instant.parse('2015-08-31T00:00:02.000000005Z'),
            end: Instant.parse('2015-08-31T00:00:03.000000001Z'),
            duration: Duration.ofSeconds(1, -4),
        },
        {
            start: Instant.parse('2015-08-30T00:00:00Z'),
            end: Instant.parse('2015-08-31T00:00:00Z'),
            duration: Duration.ofSeconds(24 * 3600),
        },
        {
            start: Instant.parse('2015-08-31T00:00:00Z'),
            end: Instant.parse('2015-08-30T00:00:00Z'),
            duration: Duration.ofSeconds(-24 * 3600),
        },
        {
            start: Instant.parse('2015-08-30T01:02:03.000000004Z'),
            end: Instant.parse('2015-08-31T00:00:00Z'),
            duration: Duration.ofSeconds(24 * 3600 - 3600 - 2 * 60 - 3, -4),
        },
        {
            start: Instant.parse('2015-08-31T00:00:00Z'),
            end: Instant.parse('2015-08-30T01:02:03.000000004Z'),
            duration: Duration.ofSeconds(-24 * 3600 + 3600 + 2 * 60 + 3, 4),
        },
        {
            start: Instant.parse('-0001-01-01T01:02:03.000000004Z'),
            end: Instant.parse('0001-12-31T00:00:00Z'),
            duration: Duration.ofSeconds(26278 * 3600 + 57 * 60 + 56, 999999996),
        },
        {
            start: Instant.parse('0001-12-31T00:00:00Z'),
            end: Instant.parse('-0001-01-01T01:02:03.000000004Z'),
            duration: Duration.ofSeconds(-26278 * 3600 - 57 * 60 - 56, -999999996),
        },
        {

            start: Instant.parse('-999999-01-01T01:02:03.000000004Z'),
            end: Instant.parse('999999-12-31T00:00:00Z'),
            duration: Duration.ofSeconds(17531631190 * 3600 + 57 * 60 + 56, 999999996),
        },
        {
            start: Instant.parse('999999-12-31T00:00:00Z'),
            end: Instant.parse('-999999-01-01T01:02:03.000000004Z'),
            duration: Duration.ofSeconds(-17531631190 * 3600 - 57 * 60 - 56, -999999996),
        },
    ])('should calculate the duration between two instants', scenario => {
        expect(Duration.between(scenario.start, scenario.end)).toStrictEqual(scenario.duration);
    });

    it(('can determine whether the duration is zero'), () => {
        expect(Duration.zero().isZero()).toStrictEqual(true);
        expect(Duration.ofSeconds(0, 1).isZero()).toStrictEqual(false);
    });

    it(('can determine whether the duration is negative excluding zero'), () => {
        expect(Duration.zero().isNegative()).toStrictEqual(false);
        expect(Duration.ofSeconds(0, 234567890).isNegative()).toStrictEqual(false);
        expect(Duration.ofSeconds(0, -234567890).isNegative()).toStrictEqual(true);
        expect(Duration.ofSeconds(1, 234567890).isNegative()).toStrictEqual(false);
        expect(Duration.ofSeconds(-1, 234567890).isNegative()).toStrictEqual(true);
        expect(Duration.ofSeconds(1, -234567890).isNegative()).toStrictEqual(false);
        expect(Duration.ofSeconds(-1, -234567890).isNegative()).toStrictEqual(true);
    });

    it(('can determine whether the duration is negative or zero'), () => {
        expect(Duration.zero().isNegativeOrZero()).toStrictEqual(true);
        expect(Duration.ofSeconds(0, 234567890).isNegativeOrZero()).toStrictEqual(false);
        expect(Duration.ofSeconds(0, -234567890).isNegativeOrZero()).toStrictEqual(true);
        expect(Duration.ofSeconds(1, 234567890).isNegativeOrZero()).toStrictEqual(false);
        expect(Duration.ofSeconds(-1, 234567890).isNegativeOrZero()).toStrictEqual(true);
        expect(Duration.ofSeconds(1, -234567890).isNegativeOrZero()).toStrictEqual(false);
        expect(Duration.ofSeconds(-1, -234567890).isNegativeOrZero()).toStrictEqual(true);
    });

    it(('can determine whether the duration is positive excluding zero'), () => {
        expect(Duration.zero().isPositive()).toStrictEqual(false);
        expect(Duration.ofSeconds(0, 234567890).isPositive()).toStrictEqual(true);
        expect(Duration.ofSeconds(0, -234567890).isPositive()).toStrictEqual(false);
        expect(Duration.ofSeconds(1, 234567890).isPositive()).toStrictEqual(true);
        expect(Duration.ofSeconds(-1, 234567890).isPositive()).toStrictEqual(false);
        expect(Duration.ofSeconds(1, -234567890).isPositive()).toStrictEqual(true);
        expect(Duration.ofSeconds(-1, -234567890).isPositive()).toStrictEqual(false);
    });

    it(('can determine whether the duration is positive or zero'), () => {
        expect(Duration.zero().isPositiveOrZero()).toStrictEqual(true);
        expect(Duration.ofSeconds(0, 234567890).isPositiveOrZero()).toStrictEqual(true);
        expect(Duration.ofSeconds(0, -234567890).isPositiveOrZero()).toStrictEqual(false);
        expect(Duration.ofSeconds(1, 234567890).isPositiveOrZero()).toStrictEqual(true);
        expect(Duration.ofSeconds(-1, 234567890).isPositiveOrZero()).toStrictEqual(false);
        expect(Duration.ofSeconds(1, -234567890).isPositiveOrZero()).toStrictEqual(true);
        expect(Duration.ofSeconds(-1, -234567890).isPositiveOrZero()).toStrictEqual(false);
    });

    it('should return the seconds', () => {
        expect(Duration.ofSeconds(1, 234567890).getSeconds()).toStrictEqual(1);
        expect(Duration.ofSeconds(-1, 234567890).getSeconds()).toStrictEqual(-1);
        expect(Duration.ofSeconds(0, 234567890).getSeconds()).toStrictEqual(0);
        expect(Duration.ofSeconds(-2, 234567890).getSeconds()).toStrictEqual(-2);
    });

    it('should return the nanoseconds', () => {
        expect(Duration.ofSeconds(1, 234567890).getNanos()).toStrictEqual(234567890);
        expect(Duration.ofSeconds(-1, 234567890).getNanos()).toStrictEqual(234567890);
        expect(Duration.ofSeconds(1, -234567890).getNanos()).toStrictEqual(765432110);
        expect(Duration.ofSeconds(-1, -234567890).getNanos()).toStrictEqual(765432110);
    });

    it('can create a copy with a new number of seconds', () => {
        const duration = Duration.ofSeconds(1, 234567890);

        expect(duration.withSeconds(1)).toEqual(duration);

        const newDuration = duration.withSeconds(2);

        expect(newDuration).toStrictEqual(Duration.ofSeconds(2, 234567890));
        expect(newDuration).not.toStrictEqual(duration);
    });

    it('can create a copy with a new number of nanoseconds', () => {
        const duration = Duration.ofSeconds(1, 234567890);

        expect(duration.withNanos(234567890)).toEqual(duration);

        const newDuration = duration.withNanos(765432110);

        expect(newDuration).toStrictEqual(Duration.ofSeconds(1, 765432110));
        expect(newDuration).not.toStrictEqual(duration);
    });

    it('can create a copy with a duration in standard 24 hours days added', () => {
        const duration = Duration.ofSeconds(1, 234567890);

        expect(Duration.ofSeconds(2 * 24 * 3600 + 1, 234567890)).toStrictEqual(duration.plusDays(2));
        expect(Duration.ofSeconds(24 * 3600 + 1, 234567890)).toStrictEqual(duration.plusDays(1));
        expect(Duration.ofSeconds(1, 234567890)).toStrictEqual(duration.plusDays(0));
        expect(Duration.ofSeconds(-24 * 3600 + 1, 234567890)).toStrictEqual(duration.plusDays(-1));
        expect(Duration.ofSeconds(-2 * 24 * 3600 + 1, 234567890)).toStrictEqual(duration.plusDays(-2));
    });

    it('should fail to add a number of days that exceeds the range of safe integers', () => {
        expect(() => {
            Duration.ofSeconds(1, 234567890).plusDays(Number.MAX_SAFE_INTEGER);
        }).toThrow(
            'The result overflows the range of safe integers',
        );
    });

    it('can create a copy with a duration in standard 24 hours days subtracted', () => {
        const duration = Duration.ofSeconds(1, 234567890);

        expect(Duration.ofSeconds(-2 * 24 * 3600 + 1, 234567890)).toStrictEqual(duration.minusDays(2));
        expect(Duration.ofSeconds(-24 * 3600 + 1, 234567890)).toStrictEqual(duration.minusDays(1));
        expect(Duration.ofSeconds(1, 234567890)).toStrictEqual(duration.minusDays(0));
        expect(Duration.ofSeconds(24 * 3600 + 1, 234567890)).toStrictEqual(duration.minusDays(-1));
        expect(Duration.ofSeconds(2 * 24 * 3600 + 1, 234567890)).toStrictEqual(duration.minusDays(-2));
    });

    it('should fail to subtract a number of days that exceeds the range of safe integers', () => {
        expect(() => {
            Duration.ofSeconds(1, 234567890).minusDays(Number.MIN_SAFE_INTEGER);
        }).toThrow(
            'The result overflows the range of safe integers',
        );
    });

    it('can create a copy with a duration in standard hours added', () => {
        const duration = Duration.ofSeconds(1, 234567890);

        expect(Duration.ofSeconds(2 * 3600 + 1, 234567890)).toStrictEqual(duration.plusHours(2));
        expect(Duration.ofSeconds(3600 + 1, 234567890)).toStrictEqual(duration.plusHours(1));
        expect(Duration.ofSeconds(1, 234567890)).toStrictEqual(duration.plusHours(0));
        expect(Duration.ofSeconds(-3600 + 1, 234567890)).toStrictEqual(duration.plusHours(-1));
        expect(Duration.ofSeconds(-2 * 3600 + 1, 234567890)).toStrictEqual(duration.plusHours(-2));
    });

    it('should fail to add a number of hours that exceeds the range of safe integers', () => {
        expect(() => {
            Duration.ofSeconds(1, 234567890).plusHours(Number.MAX_SAFE_INTEGER);
        }).toThrow(
            'The result overflows the range of safe integers',
        );
    });

    it('can create a copy with a duration in standard hours subtracted', () => {
        const duration = Duration.ofSeconds(1, 234567890);

        expect(Duration.ofSeconds(-2 * 3600 + 1, 234567890)).toStrictEqual(duration.minusHours(2));
        expect(Duration.ofSeconds(-3600 + 1, 234567890)).toStrictEqual(duration.minusHours(1));
        expect(Duration.ofSeconds(1, 234567890)).toStrictEqual(duration.minusHours(0));
        expect(Duration.ofSeconds(3600 + 1, 234567890)).toStrictEqual(duration.minusHours(-1));
        expect(Duration.ofSeconds(2 * 3600 + 1, 234567890)).toStrictEqual(duration.minusHours(-2));
    });

    it('should fail to subtract a number of hours that exceeds the range of safe integers', () => {
        expect(() => {
            Duration.ofSeconds(1, 234567890).minusHours(Number.MIN_SAFE_INTEGER);
        }).toThrow(
            'The result overflows the range of safe integers',
        );
    });

    it('can create a copy with a duration in standard minutes added', () => {
        const duration = Duration.ofSeconds(1, 234567890);

        expect(Duration.ofSeconds(2 * 60 + 1, 234567890)).toStrictEqual(duration.plusMinutes(2));
        expect(Duration.ofSeconds(60 + 1, 234567890)).toStrictEqual(duration.plusMinutes(1));
        expect(Duration.ofSeconds(1, 234567890)).toStrictEqual(duration.plusMinutes(0));
        expect(Duration.ofSeconds(-60 + 1, 234567890)).toStrictEqual(duration.plusMinutes(-1));
        expect(Duration.ofSeconds(-2 * 60 + 1, 234567890)).toStrictEqual(duration.plusMinutes(-2));
    });

    it('should fail to add a number of minutes that exceeds the range of safe integers', () => {
        expect(() => {
            Duration.ofSeconds(1, 234567890).plusMinutes(Number.MAX_SAFE_INTEGER);
        }).toThrow(
            'The result overflows the range of safe integers',
        );
    });

    it('can create a copy with a duration in standard minutes subtracted', () => {
        const duration = Duration.ofSeconds(1, 234567890);

        expect(Duration.ofSeconds(-2 * 60 + 1, 234567890)).toStrictEqual(duration.minusMinutes(2));
        expect(Duration.ofSeconds(-60 + 1, 234567890)).toStrictEqual(duration.minusMinutes(1));
        expect(Duration.ofSeconds(1, 234567890)).toStrictEqual(duration.minusMinutes(0));
        expect(Duration.ofSeconds(60 + 1, 234567890)).toStrictEqual(duration.minusMinutes(-1));
        expect(Duration.ofSeconds(2 * 60 + 1, 234567890)).toStrictEqual(duration.minusMinutes(-2));
    });

    it('should fail to subtract a number of minutes that exceeds the range of safe integers', () => {
        expect(() => {
            Duration.ofSeconds(1, 234567890).minusMinutes(Number.MIN_SAFE_INTEGER);
        }).toThrow(
            'The result overflows the range of safe integers',
        );
    });

    it('can create a copy with a duration in seconds added', () => {
        const duration = Duration.ofSeconds(1, 234567890);

        expect(Duration.ofSeconds(2 + 1, 234567890)).toStrictEqual(duration.plusSeconds(2));
        expect(Duration.ofSeconds(1 + 1, 234567890)).toStrictEqual(duration.plusSeconds(1));
        expect(Duration.ofSeconds(1, 234567890)).toStrictEqual(duration.plusSeconds(0));
        expect(Duration.ofSeconds(-1 + 1, 234567890)).toStrictEqual(duration.plusSeconds(-1));
        expect(Duration.ofSeconds(-2 + 1, 234567890)).toStrictEqual(duration.plusSeconds(-2));
    });

    it('should fail to add a number of seconds that exceeds the range of safe integers', () => {
        expect(() => {
            Duration.ofSeconds(1, 234567890).plusSeconds(Number.MAX_SAFE_INTEGER);
        }).toThrow(
            'The result overflows the range of safe integers',
        );
    });

    it('can create a copy with a duration in seconds subtracted', () => {
        const duration = Duration.ofSeconds(1, 234567890);

        expect(Duration.ofSeconds(-2 + 1, 234567890)).toStrictEqual(duration.minusSeconds(2));
        expect(Duration.ofSeconds(-1 + 1, 234567890)).toStrictEqual(duration.minusSeconds(1));
        expect(Duration.ofSeconds(1, 234567890)).toStrictEqual(duration.minusSeconds(0));
        expect(Duration.ofSeconds(1 + 1, 234567890)).toStrictEqual(duration.minusSeconds(-1));
        expect(Duration.ofSeconds(2 + 1, 234567890)).toStrictEqual(duration.minusSeconds(-2));
    });

    it('should fail to subtract a number of seconds that exceeds the range of safe integers', () => {
        expect(() => {
            Duration.ofSeconds(1, 234567890).minusSeconds(Number.MIN_SAFE_INTEGER);
        }).toThrow(
            'The result overflows the range of safe integers',
        );
    });

    it('can create a copy with a duration in milliseconds added', () => {
        const duration = Duration.ofSeconds(1, 234567890);

        expect(Duration.ofSeconds(1 + 2, 234567890)).toStrictEqual(duration.plusMillis(2000));
        expect(Duration.ofSeconds(1, 234567890 + 2000000)).toStrictEqual(duration.plusMillis(2));
        expect(Duration.ofSeconds(1, 234567890 + 1000000)).toStrictEqual(duration.plusMillis(1));
        expect(Duration.ofSeconds(1, 234567890)).toStrictEqual(duration.plusMillis(0));
        expect(Duration.ofSeconds(1, 234567890 - 1000000)).toStrictEqual(duration.plusMillis(-1));
        expect(Duration.ofSeconds(1, 234567890 - 2000000)).toStrictEqual(duration.plusMillis(-2));
        expect(Duration.ofSeconds(1 - 2, 234567890)).toStrictEqual(duration.plusMillis(-2000));

        const maxValue = Number.MAX_SAFE_INTEGER;
        const maxSeconds = intDiv(maxValue, LocalTime.MILLIS_PER_SECOND);
        const maxNanos = (maxValue % LocalTime.MILLIS_PER_SECOND) * LocalTime.NANOS_PER_MILLI;

        expect(Duration.ofSeconds(1 + maxSeconds, 234567890 + maxNanos)).toStrictEqual(duration.plusMillis(maxValue));

        const minValue = Number.MIN_SAFE_INTEGER;
        const minSeconds = intDiv(minValue, LocalTime.MILLIS_PER_SECOND);
        const minNanos = (minValue % LocalTime.MILLIS_PER_SECOND) * LocalTime.NANOS_PER_MILLI;

        expect(Duration.ofSeconds(1 + minSeconds, 234567890 + minNanos)).toStrictEqual(duration.plusMillis(minValue));
    });

    it('can create a copy with a duration in milliseconds subtracted', () => {
        const duration = Duration.ofSeconds(1, 234567890);

        expect(Duration.ofSeconds(1 - 2, 234567890)).toStrictEqual(duration.minusMillis(2000));
        expect(Duration.ofSeconds(1, 234567890 - 2000000)).toStrictEqual(duration.minusMillis(2));
        expect(Duration.ofSeconds(1, 234567890 - 1000000)).toStrictEqual(duration.minusMillis(1));
        expect(Duration.ofSeconds(1, 234567890)).toStrictEqual(duration.minusMillis(0));
        expect(Duration.ofSeconds(1, 234567890 + 1000000)).toStrictEqual(duration.minusMillis(-1));
        expect(Duration.ofSeconds(1, 234567890 + 2000000)).toStrictEqual(duration.minusMillis(-2));
        expect(Duration.ofSeconds(1 + 2, 234567890)).toStrictEqual(duration.minusMillis(-2000));

        const maxValue = Number.MAX_SAFE_INTEGER;
        const maxSeconds = intDiv(maxValue, LocalTime.MILLIS_PER_SECOND);
        const maxNanos = (maxValue % LocalTime.MILLIS_PER_SECOND) * LocalTime.NANOS_PER_MILLI;

        expect(Duration.ofSeconds(1 - maxSeconds, 234567890 - maxNanos)).toStrictEqual(duration.minusMillis(maxValue));

        const minValue = Number.MIN_SAFE_INTEGER;
        const minSeconds = intDiv(minValue, LocalTime.MILLIS_PER_SECOND);
        const minNanos = (minValue % LocalTime.MILLIS_PER_SECOND) * LocalTime.NANOS_PER_MILLI;

        expect(Duration.ofSeconds(1 - minSeconds, 234567890 - minNanos)).toStrictEqual(duration.minusMillis(minValue));
    });

    it('can create a copy with a duration in microseconds added', () => {
        const duration = Duration.ofSeconds(1, 234567890);

        expect(Duration.ofSeconds(1 + 2, 234567890)).toStrictEqual(duration.plusMicros(2000000));
        expect(Duration.ofSeconds(1, 234567890 + 2000)).toStrictEqual(duration.plusMicros(2));
        expect(Duration.ofSeconds(1, 234567890 + 1000)).toStrictEqual(duration.plusMicros(1));
        expect(Duration.ofSeconds(1, 234567890)).toStrictEqual(duration.plusMicros(0));
        expect(Duration.ofSeconds(1, 234567890 - 1000)).toStrictEqual(duration.plusMicros(-1));
        expect(Duration.ofSeconds(1, 234567890 - 2000)).toStrictEqual(duration.plusMicros(-2));
        expect(Duration.ofSeconds(1 - 2, 234567890)).toStrictEqual(duration.plusMicros(-2000000));

        const maxValue = Number.MAX_SAFE_INTEGER;
        const maxSeconds = intDiv(maxValue, LocalTime.MICROS_PER_SECOND);
        const maxNanos = (maxValue % LocalTime.MICROS_PER_SECOND) * LocalTime.NANOS_PER_MICRO;

        expect(Duration.ofSeconds(1 + maxSeconds, 234567890 + maxNanos)).toStrictEqual(duration.plusMicros(maxValue));

        const minValue = Number.MIN_SAFE_INTEGER;
        const minSeconds = intDiv(minValue, LocalTime.MICROS_PER_SECOND);
        const minNanos = (minValue % LocalTime.MICROS_PER_SECOND) * LocalTime.NANOS_PER_MICRO;

        expect(Duration.ofSeconds(1 + minSeconds, 234567890 + minNanos)).toStrictEqual(duration.plusMicros(minValue));
    });

    it('can create a copy with a duration in microseconds subtracted', () => {
        const duration = Duration.ofSeconds(1, 234567890);

        expect(Duration.ofSeconds(1 - 2, 234567890)).toStrictEqual(duration.minusMicros(2000000));
        expect(Duration.ofSeconds(1, 234567890 - 2000)).toStrictEqual(duration.minusMicros(2));
        expect(Duration.ofSeconds(1, 234567890 - 1000)).toStrictEqual(duration.minusMicros(1));
        expect(Duration.ofSeconds(1, 234567890)).toStrictEqual(duration.minusMicros(0));
        expect(Duration.ofSeconds(1, 234567890 + 1000)).toStrictEqual(duration.minusMicros(-1));
        expect(Duration.ofSeconds(1, 234567890 + 2000)).toStrictEqual(duration.minusMicros(-2));
        expect(Duration.ofSeconds(1 + 2, 234567890)).toStrictEqual(duration.minusMicros(-2000000));

        const maxValue = Number.MAX_SAFE_INTEGER;
        const maxSeconds = intDiv(maxValue, LocalTime.MICROS_PER_SECOND);
        const maxNanos = (maxValue % LocalTime.MICROS_PER_SECOND) * LocalTime.NANOS_PER_MICRO;

        expect(Duration.ofSeconds(1 - maxSeconds, 234567890 - maxNanos)).toStrictEqual(duration.minusMicros(maxValue));

        const minValue = Number.MIN_SAFE_INTEGER;
        const minSeconds = intDiv(minValue, LocalTime.MICROS_PER_SECOND);
        const minNanos = (minValue % LocalTime.MICROS_PER_SECOND) * LocalTime.NANOS_PER_MICRO;

        expect(Duration.ofSeconds(1 - minSeconds, 234567890 - minNanos)).toStrictEqual(duration.minusMicros(minValue));
    });

    it('can create a copy with a duration in nanoseconds added', () => {
        const duration = Duration.ofSeconds(1, 234567890);

        expect(Duration.ofSeconds(1 + 2, 234567890)).toStrictEqual(duration.plusNanos(2000000000));
        expect(Duration.ofSeconds(1, 234567890 + 2)).toStrictEqual(duration.plusNanos(2));
        expect(Duration.ofSeconds(1, 234567890 + 1)).toStrictEqual(duration.plusNanos(1));
        expect(Duration.ofSeconds(1, 234567890)).toStrictEqual(duration.plusNanos(0));
        expect(Duration.ofSeconds(1, 234567890 - 1)).toStrictEqual(duration.plusNanos(-1));
        expect(Duration.ofSeconds(1, 234567890 - 2)).toStrictEqual(duration.plusNanos(-2));
        expect(Duration.ofSeconds(1 - 2, 234567890)).toStrictEqual(duration.plusNanos(-2000000000));

        const maxValue = Number.MAX_SAFE_INTEGER;
        const maxSeconds = intDiv(maxValue, LocalTime.NANOS_PER_SECOND);
        const maxNanos = maxValue % LocalTime.NANOS_PER_SECOND;

        expect(Duration.ofSeconds(1 + maxSeconds, 234567890 + maxNanos)).toStrictEqual(duration.plusNanos(maxValue));

        const minValue = Number.MIN_SAFE_INTEGER;
        const minSeconds = intDiv(minValue, LocalTime.NANOS_PER_SECOND);
        const minNanos = minValue % LocalTime.NANOS_PER_SECOND;

        expect(Duration.ofSeconds(1 + minSeconds, 234567890 + minNanos)).toStrictEqual(duration.plusNanos(minValue));
    });

    it('can create a copy with a duration in nanoseconds subtracted', () => {
        const duration = Duration.ofSeconds(1, 234567890);

        expect(Duration.ofSeconds(1 - 2, 234567890)).toStrictEqual(duration.minusNanos(2000000000));
        expect(Duration.ofSeconds(1, 234567890 - 2)).toStrictEqual(duration.minusNanos(2));
        expect(Duration.ofSeconds(1, 234567890 - 1)).toStrictEqual(duration.minusNanos(1));
        expect(Duration.ofSeconds(1, 234567890)).toStrictEqual(duration.minusNanos(0));
        expect(Duration.ofSeconds(1, 234567890 + 1)).toStrictEqual(duration.minusNanos(-1));
        expect(Duration.ofSeconds(1, 234567890 + 2)).toStrictEqual(duration.minusNanos(-2));
        expect(Duration.ofSeconds(1 + 2, 234567890)).toStrictEqual(duration.minusNanos(-2000000000));

        const maxValue = Number.MAX_SAFE_INTEGER;
        const maxSeconds = intDiv(maxValue, LocalTime.NANOS_PER_SECOND);
        const maxNanos = maxValue % LocalTime.NANOS_PER_SECOND;

        expect(Duration.ofSeconds(1 - maxSeconds, 234567890 - maxNanos)).toStrictEqual(duration.minusNanos(maxValue));

        const minValue = Number.MIN_SAFE_INTEGER;
        const minSeconds = intDiv(minValue, LocalTime.NANOS_PER_SECOND);
        const minNanos = minValue % LocalTime.NANOS_PER_SECOND;

        expect(Duration.ofSeconds(1 - minSeconds, 234567890 - minNanos)).toStrictEqual(duration.minusNanos(minValue));
    });

    it('should determine whether it is logically equal to another duration', () => {
        const duration = Duration.ofSeconds(1, 234567890);

        expect(duration.equals(duration)).toStrictEqual(true);
        expect(duration.equals(Duration.ofSeconds(1, 234567890))).toStrictEqual(true);
        expect(duration.equals(Duration.ofSeconds(1, 9))).toStrictEqual(false);
        expect(duration.equals(Duration.ofSeconds(9, 234567890))).toStrictEqual(false);
    });

    it('can be added to an instant', () => {
        const instant = Instant.parse('2015-08-31T01:02:03.000000004Z');

        expect(Instant.parse('2015-08-31T01:02:04.000000004Z')).toStrictEqual(Duration.ofSeconds(1).addTo(instant));
        expect(Instant.parse('2015-08-31T01:02:03.000000005Z')).toStrictEqual(Duration.ofSeconds(0, 1).addTo(instant));

        const duration = Duration.ofSeconds(1, 234567890);

        expect(Instant.parse('2015-08-31T01:02:04.234567894Z')).toStrictEqual(duration.addTo(instant));
    });

    it('can be subtracted from an instant', () => {
        const instant = Instant.parse('2015-08-31T01:02:03.000000004Z');

        expect(Instant.parse('2015-08-31T01:02:02.000000004Z'))
            .toStrictEqual(Duration.ofSeconds(1).subtractFrom(instant));

        expect(Instant.parse('2015-08-31T01:02:03.000000003Z'))
            .toStrictEqual(Duration.ofSeconds(0, 1).subtractFrom(instant));

        const duration = Duration.ofSeconds(1, 234567890);

        expect(Instant.parse('2015-08-31T01:02:01.765432114Z')).toStrictEqual(duration.subtractFrom(instant));
    });

    it('should calculate the total number of days', () => {
        expect(Duration.ofSeconds(2 * 24 * 3600, 234567890).toDays()).toStrictEqual(2);
    });

    it('should calculate the total number of hours', () => {
        expect(Duration.ofSeconds(2 * 3600, 234567890).toHours()).toStrictEqual(2);
    });

    it('should calculate the total number of minutes', () => {
        expect(Duration.ofSeconds(2 * 60, 234567890).toMinutes()).toStrictEqual(2);
    });

    it('should calculate the total number of seconds', () => {
        expect(Duration.ofSeconds(2, 234567890).toSeconds()).toStrictEqual(2);
        expect(Duration.ofSeconds(-2, 234567890).toSeconds()).toStrictEqual(-1);
        expect(Duration.ofSeconds(2, -234567890).toSeconds()).toStrictEqual(1);
        expect(Duration.ofSeconds(-2, -234567890).toSeconds()).toStrictEqual(-2);
    });

    it('should calculate the total number of milliseconds', () => {
        expect(Duration.ofSeconds(1, 234567890).toMillis()).toStrictEqual(1234);
    });

    it('should calculate the total number of microseconds', () => {
        expect(Duration.ofSeconds(1, 234567890).toMicros()).toStrictEqual(1234567);
    });

    it('should calculate the total number of nanoseconds', () => {
        expect(Duration.ofSeconds(1, 234567890).toNanos()).toStrictEqual(1234567890);
        expect(Duration.ofSeconds(1, -234567890).toNanos()).toStrictEqual(765432110);
        expect(Duration.ofSeconds(-1, 234567890).toNanos()).toStrictEqual(-765432110);
        expect(Duration.ofSeconds(-1, -234567890).toNanos()).toStrictEqual(-1234567890);
    });

    it('should calculate the normalized days part', () => {
        expect(Duration.ofSeconds(2 * 24 * 3600, 234567890).toDaysPart()).toStrictEqual(2);
    });

    it('should calculate the normalized hours part', () => {
        expect(Duration.ofSeconds(26 * 3600, 234567890).toHoursPart()).toStrictEqual(2);
    });

    it('should calculate the normalized minutes part', () => {
        expect(Duration.ofSeconds(62 * 60, 234567890).toMinutesPart()).toStrictEqual(2);
    });

    it('should calculate the normalized seconds part', () => {
        expect(Duration.ofSeconds(62, 234567890).toSecondsPart()).toStrictEqual(2);
    });

    it('should calculate the normalized milliseconds part', () => {
        expect(Duration.ofSeconds(1, 234567890).toMillisPart()).toStrictEqual(234);
    });

    it('should calculate the normalized microseconds part', () => {
        expect(Duration.ofSeconds(1, 234567890).toMicrosPart()).toStrictEqual(234567);
    });

    it('should calculate the normalized nanoseconds part', () => {
        expect(Duration.ofSeconds(1, 234567890).toNanosPart()).toStrictEqual(234567890);
        expect(Duration.ofSeconds(1, -234567890).toNanosPart()).toStrictEqual(765432110);
        expect(Duration.ofSeconds(-1, 234567890).toNanosPart()).toStrictEqual(-765432110);
        expect(Duration.ofSeconds(-1, -234567890).toNanosPart()).toStrictEqual(-234567890);
    });

    it('should determine whether the duration is longer than another duration', () => {
        const duration = Duration.ofSeconds(1, 234567890);

        expect(duration.isLongerThan(Duration.ofSeconds(2, 234567890))).toStrictEqual(false);
        expect(duration.isLongerThan(Duration.ofSeconds(1, 234567891))).toStrictEqual(false);
        expect(duration.isLongerThan(Duration.ofSeconds(1, 234567890))).toStrictEqual(false);
        expect(duration.isLongerThan(Duration.ofSeconds(1, 234567889))).toStrictEqual(true);
        expect(duration.isLongerThan(Duration.ofSeconds(0, 234567890))).toStrictEqual(true);
    });

    it('should determine whether the duration is longer than or equal another duration', () => {
        const duration = Duration.ofSeconds(1, 234567890);

        expect(duration.isLongerThanOrEqualTo(Duration.ofSeconds(2, 234567890))).toStrictEqual(false);
        expect(duration.isLongerThanOrEqualTo(Duration.ofSeconds(1, 234567891))).toStrictEqual(false);
        expect(duration.isLongerThanOrEqualTo(Duration.ofSeconds(1, 234567890))).toStrictEqual(true);
        expect(duration.isLongerThanOrEqualTo(Duration.ofSeconds(1, 234567889))).toStrictEqual(true);
        expect(duration.isLongerThanOrEqualTo(Duration.ofSeconds(0, 234567890))).toStrictEqual(true);
    });

    it('should determine whether the duration is shorter than another duration', () => {
        const duration = Duration.ofSeconds(1, 234567890);

        expect(duration.isShorterThan(Duration.ofSeconds(2, 234567890))).toStrictEqual(true);
        expect(duration.isShorterThan(Duration.ofSeconds(1, 234567891))).toStrictEqual(true);
        expect(duration.isShorterThan(Duration.ofSeconds(1, 234567890))).toStrictEqual(false);
        expect(duration.isShorterThan(Duration.ofSeconds(1, 234567889))).toStrictEqual(false);
        expect(duration.isShorterThan(Duration.ofSeconds(0, 234567890))).toStrictEqual(false);
    });

    it('should determine whether the duration is shorter than or equal another duration', () => {
        const duration = Duration.ofSeconds(1, 234567890);

        expect(duration.isShorterThanOrEqualTo(Duration.ofSeconds(2, 234567890))).toStrictEqual(true);
        expect(duration.isShorterThanOrEqualTo(Duration.ofSeconds(1, 234567891))).toStrictEqual(true);
        expect(duration.isShorterThanOrEqualTo(Duration.ofSeconds(1, 234567890))).toStrictEqual(true);
        expect(duration.isShorterThanOrEqualTo(Duration.ofSeconds(1, 234567889))).toStrictEqual(false);
        expect(duration.isShorterThanOrEqualTo(Duration.ofSeconds(0, 234567890))).toStrictEqual(false);
    });

    type ToStringScenario = {
        duration: Duration,
        expected: string,
    };

    it.each<ToStringScenario>([
        {duration: Duration.zero(), expected: 'PT0S'},
        {duration: Duration.ofHours(1), expected: 'PT1H'},
        {duration: Duration.ofMinutes(1), expected: 'PT1M'},
        {duration: Duration.ofSeconds(1), expected: 'PT1S'},
        {duration: Duration.ofMillis(1), expected: 'PT0.001S'},
        {duration: Duration.ofMicros(1), expected: 'PT0.000001S'},
        {duration: Duration.ofNanos(1), expected: 'PT0.000000001S'},
        {duration: Duration.ofNanos(12), expected: 'PT0.000000012S'},
        {duration: Duration.ofNanos(123), expected: 'PT0.000000123S'},
        {duration: Duration.ofNanos(1234), expected: 'PT0.000001234S'},
        {duration: Duration.ofNanos(12345), expected: 'PT0.000012345S'},
        {duration: Duration.ofNanos(123456), expected: 'PT0.000123456S'},
        {duration: Duration.ofNanos(1234567), expected: 'PT0.001234567S'},
        {duration: Duration.ofNanos(12345678), expected: 'PT0.012345678S'},
        {duration: Duration.ofNanos(123456789), expected: 'PT0.123456789S'},
        {duration: Duration.ofNanos(10), expected: 'PT0.000000010S'},
        {duration: Duration.ofNanos(100), expected: 'PT0.000000100S'},
        {duration: Duration.ofNanos(10000), expected: 'PT0.000010S'},
        {duration: Duration.ofNanos(100000), expected: 'PT0.000100S'},
        {duration: Duration.ofNanos(10000000), expected: 'PT0.010S'},
        {duration: Duration.ofNanos(100000000), expected: 'PT0.100S'},
        {duration: Duration.ofSeconds(3600 + 2 * 60 + 3, 456789123), expected: 'PT1H2M3.456789123S'},
        {duration: Duration.ofSeconds(-3600 - 2 * 60 - 3, -456789123), expected: 'PT-1H-2M-3.456789123S'},
    ])('should convert to a ISO 8601 string', scenario => {
        expect(scenario.duration.toString()).toStrictEqual(scenario.expected);
    });
});
