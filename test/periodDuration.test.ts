import {Duration, LocalTime, Period, PeriodDuration} from '../src';
import {intDiv} from '../src/math';

describe('An ISO amount of date-time', () => {
    it('can be created from a period and a duration', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(periodDuration.getParts()).toEqual({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        const periodDurationOfParts = PeriodDuration.of(Period.of(1, 2, 3), Duration.ofSeconds(4, 5));

        expect(periodDurationOfParts.getParts()).toEqual({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        const zeroDuration = PeriodDuration.of(Period.of(1, 2, 3), Duration.zero());

        expect(zeroDuration.getParts()).toEqual({years: 1, months: 2, days: 3, seconds: 0, nanos: 0});

        const zeroPeriod = PeriodDuration.of(Period.zero(), Duration.ofSeconds(4, 5));

        expect(zeroPeriod.getParts()).toEqual({years: 0, months: 0, days: 0, seconds: 4, nanos: 5});

        const zeroPeriodDuration = PeriodDuration.of(Period.zero(), Duration.zero());

        expect(zeroPeriodDuration.getParts()).toEqual({years: 0, months: 0, days: 0, seconds: 0, nanos: 0});
    });

    it('can be created with zero period and duration', () => {
        const periodDuration = PeriodDuration.zero();

        expect(periodDuration.getParts()).toEqual({years: 0, months: 0, days: 0, seconds: 0, nanos: 0});
    });

    it('can be created from a period', () => {
        const periodDuration = PeriodDuration.ofPeriod(Period.of(1, 2, 3));

        expect(periodDuration.getParts()).toEqual({years: 1, months: 2, days: 3, seconds: 0, nanos: 0});
    });

    it('can be created from a duration', () => {
        const periodDuration = PeriodDuration.ofDuration(Duration.ofSeconds(4, 5));

        expect(periodDuration.getParts()).toEqual({years: 0, months: 0, days: 0, seconds: 4, nanos: 5});
    });

    it('can be created from the value of the period and duration parts', () => {
        const dayPeriodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3});

        expect(dayPeriodDuration.getParts()).toEqual({years: 1, months: 2, days: 3, seconds: 0, nanos: 0});

        const secondPeriodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4});

        expect(secondPeriodDuration.getParts()).toEqual({years: 1, months: 2, days: 3, seconds: 4, nanos: 0});

        const nanoPeriodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(nanoPeriodDuration.getParts()).toEqual({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});
    });

    it.each([
        {
            value: 'PT0S',
            expected: PeriodDuration.zero(),
        },
        {
            value: 'P1Y',
            expected: PeriodDuration.ofParts({years: 1}),
        },
        {
            value: 'P1M',
            expected: PeriodDuration.ofParts({months: 1}),
        },
        {
            value: 'P1D',
            expected: PeriodDuration.ofParts({days: 1}),
        },
        {
            value: 'PT1H',
            expected: PeriodDuration.ofParts({seconds: 3600}),
        },
        {
            value: 'PT1M',
            expected: PeriodDuration.ofParts({seconds: 60}),
        },
        {
            value: 'PT1S',
            expected: PeriodDuration.ofParts({seconds: 1}),
        },
        {
            value: 'PT0.001S',
            expected: PeriodDuration.ofParts({nanos: 1000000}),
        },
        {
            value: 'PT0.000001S',
            expected: PeriodDuration.ofParts({nanos: 1000}),
        },
        {
            value: 'PT0.000000001S',
            expected: PeriodDuration.ofParts({nanos: 1}),
        },
        {
            value: 'PT0.000000012S',
            expected: PeriodDuration.ofParts({nanos: 12}),
        },
        {
            value: 'PT0.000000123S',
            expected: PeriodDuration.ofParts({nanos: 123}),
        },
        {
            value: 'PT0.000001234S',
            expected: PeriodDuration.ofParts({nanos: 1234}),
        },
        {
            value: 'PT0.000012345S',
            expected: PeriodDuration.ofParts({nanos: 12345}),
        },
        {
            value: 'PT0.000123456S',
            expected: PeriodDuration.ofParts({nanos: 123456}),
        },
        {
            value: 'PT0.001234567S',
            expected: PeriodDuration.ofParts({nanos: 1234567}),
        },
        {
            value: 'PT0.012345678S',
            expected: PeriodDuration.ofParts({nanos: 12345678}),
        },
        {
            value: 'PT0.123456789S',
            expected: PeriodDuration.ofParts({nanos: 123456789}),
        },
        {
            value: 'PT0.000000010S',
            expected: PeriodDuration.ofParts({nanos: 10}),
        },
        {
            value: 'PT0.000000100S',
            expected: PeriodDuration.ofParts({nanos: 100}),
        },
        {
            value: 'PT0.000010S',
            expected: PeriodDuration.ofParts({nanos: 10000}),
        },
        {
            value: 'PT0.000100S',
            expected: PeriodDuration.ofParts({nanos: 100000}),
        },
        {
            value: 'PT0.010S',
            expected: PeriodDuration.ofParts({nanos: 10000000}),
        },
        {
            value: 'PT0.100S',
            expected: PeriodDuration.ofParts({nanos: 100000000}),
        },
        {
            value: 'P1Y2M3D',
            expected: PeriodDuration.ofParts({years: 1, months: 2, days: 3}),
        },
        {
            value: 'P-1Y-2M-3D',
            expected: PeriodDuration.ofParts({years: -1, months: -2, days: -3}),
        },
        {
            value: 'PT1H2M3.456789123S',
            expected: PeriodDuration.ofParts({seconds: 3600 + 2 * 60 + 3, nanos: 456789123}),
        },
        {
            value: 'PT-1H-2M-3.456789123S',
            expected: PeriodDuration.ofParts({seconds: -1 * 3600 - 2 * 60 - 3, nanos: -456789123}),
        },
        {
            value: 'P1Y2M3DT1H2M3.456789123S',
            expected: PeriodDuration.ofParts({
                years: 1,
                months: 2,
                days: 3,
                seconds: 3600 + 2 * 60 + 3,
                nanos: 456789123,
            }),
        },
        {
            value: 'P-1Y-2M-3DT-1H-2M-3.456789123S',
            expected: PeriodDuration.ofParts({
                years: -1,
                months: -2,
                days: -3,
                seconds: -1 * 3600 - 2 * 60 - 3,
                nanos: -456789123,
            }),
        },
    ])('can parse $value', scenario => {
        const periodDuration = PeriodDuration.parse(scenario.value);

        expect(periodDuration.getParts()).toEqual(scenario.expected.getParts());
    });

    it('cannot parse an invalid period duration', () => {
        expect(() => PeriodDuration.parse('')).toThrow('Unrecognized ISO-8601 period string "".');
    });

    it('can determine whether the period and the duration are zero', () => {
        const zero = Period.zero();

        expect(zero.isZero()).toBe(true);

        const nonZero = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(nonZero.isZero()).toBe(false);
    });

    it('should return the date-based part', () => {
        const period = Period.of(1, 2, 3);
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});
        const periodDurationDate = periodDuration.getPeriod();

        expect(period.toString()).toEqual(periodDurationDate.toString());
    });

    it('should return the time-based part', () => {
        const duration = Duration.ofSeconds(4, 5);
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});
        const periodDurationTime = periodDuration.getDuration();

        expect(duration.getSeconds()).toEqual(periodDurationTime.getSeconds());
        expect(duration.getNanos()).toEqual(periodDurationTime.getNanos());
    });

    it('should return the amount of years', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(periodDuration.getYears()).toEqual(1);
    });

    it('should return the amount of months', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(periodDuration.getMonths()).toEqual(2);
    });

    it('should return the amount of days', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(periodDuration.getDays()).toEqual(3);
    });

    it('should return the amount of seconds', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(periodDuration.getSeconds()).toEqual(4);
    });

    it('should return the amount of nanoseconds', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(periodDuration.getNanos()).toEqual(5);
    });

    it('can determine whether it is logically equal to another period', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        // Equal
        expect(periodDuration.equals(periodDuration)).toBe(true);

        // Different years
        expect(periodDuration.equals(PeriodDuration.ofParts({years: 9, months: 2, days: 3, seconds: 4, nanos: 5})))
            .toBe(false);

        // Different months
        expect(periodDuration.equals(PeriodDuration.ofParts({years: 1, months: 9, days: 3, seconds: 4, nanos: 5})))
            .toBe(false);

        // Different days
        expect(periodDuration.equals(PeriodDuration.ofParts({years: 1, months: 2, days: 9, seconds: 4, nanos: 5})))
            .toBe(false);

        // Different seconds
        expect(periodDuration.equals(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 9, nanos: 5})))
            .toBe(false);

        // Different nanoseconds
        expect(periodDuration.equals(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 9})))
            .toBe(false);

        // Partial
        expect(periodDuration.equals(Period.of(1, 2, 3))).toBe(false);
        expect(periodDuration.equals(Duration.ofSeconds(4, 5))).toBe(false);

        // Logically equal
        expect(periodDuration.equals(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5})))
            .toBe(true);
    });

    it('can create a copy with a new period and same duration', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});
        const period = Period.of(1, 2, 3);

        // Same period
        expect(periodDuration.getParts()).toEqual(periodDuration.withPeriod(period).getParts());

        // Different period
        const other = PeriodDuration.ofParts({years: 9, months: 8, days: 7, seconds: 4, nanos: 5});
        const otherPeriod = Period.of(9, 8, 7);

        expect(other.getParts()).toEqual(periodDuration.withPeriod(otherPeriod).getParts());
    });

    it('can create a copy with a new duration and same period', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});
        const duration = Duration.ofSeconds(4, 5);

        // Same duration
        expect(periodDuration.getParts()).toEqual(periodDuration.withDuration(duration).getParts());

        // Different duration
        const other = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 9, nanos: 8});
        const otherDuration = Duration.ofSeconds(9, 8);

        expect(other.getParts()).toEqual(periodDuration.withDuration(otherDuration).getParts());
    });

    it('can create a copy with a new amount of years', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        // Same years
        expect(periodDuration.getParts()).toEqual(periodDuration.withYears(1).getParts());

        // Different years
        const newPeriodDuration = PeriodDuration.ofParts({years: 9, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(newPeriodDuration.getParts()).toEqual(periodDuration.withYears(9).getParts());
    });

    it('can create a copy with a new amount of months', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        // Same months
        expect(periodDuration.getParts()).toEqual(periodDuration.withMonths(2).getParts());

        // Different months
        const newPeriodDuration = PeriodDuration.ofParts({years: 1, months: 9, days: 3, seconds: 4, nanos: 5});

        expect(newPeriodDuration.getParts()).toEqual(periodDuration.withMonths(9).getParts());
    });

    it('can create a copy with a new amount of days', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        // Same days
        expect(periodDuration.getParts()).toEqual(periodDuration.withDays(3).getParts());

        // Different days
        const newPeriodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 9, seconds: 4, nanos: 5});

        expect(newPeriodDuration.getParts()).toEqual(periodDuration.withDays(9).getParts());
    });

    it('can create a copy with a new amount of seconds', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        // Same seconds
        expect(periodDuration.getParts()).toEqual(periodDuration.withSeconds(4).getParts());

        // Different seconds
        const newPeriodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 9, nanos: 5});

        expect(newPeriodDuration.getParts()).toEqual(periodDuration.withSeconds(9).getParts());
    });

    it('can create a copy with a new amount of nanoseconds', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        // Same nanoseconds
        expect(periodDuration.getParts()).toEqual(periodDuration.withNanos(5).getParts());

        // Different nanoseconds
        const newPeriodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 9});

        expect(newPeriodDuration.getParts()).toEqual(periodDuration.withNanos(9).getParts());
    });

    it('can create a copy with a duration added', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});
        const duration = Duration.ofSeconds(9, 10);

        const newPeriodDuration = periodDuration.plus(duration);

        expect(newPeriodDuration.getParts())
            .toEqual(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 13, nanos: 15}).getParts());
    });

    it('can create a copy with a duration subtracted', () => {
        const periodDuration = PeriodDuration.ofParts({years: 7, months: 9, days: 11, seconds: 13, nanos: 15});
        const duration = Duration.ofSeconds(9, 10);

        const newPeriodDuration = periodDuration.minus(duration);

        expect(newPeriodDuration.getParts())
            .toEqual(PeriodDuration.ofParts({years: 7, months: 9, days: 11, seconds: 4, nanos: 5}).getParts());
    });

    it('can create a copy with a period added', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});
        const period = Period.of(6, 7, 8);

        const newPeriodDuration = periodDuration.plus(period);

        expect(newPeriodDuration.getParts())
            .toEqual(PeriodDuration.ofParts({years: 7, months: 9, days: 11, seconds: 4, nanos: 5}).getParts());
    });

    it('can create a copy with a period subtracted', () => {
        const periodDuration = PeriodDuration.ofParts({years: 7, months: 9, days: 11, seconds: 13, nanos: 15});
        const period = Period.of(6, 7, 8);

        const newPeriodDuration = periodDuration.minus(period);

        expect(newPeriodDuration.getParts())
            .toEqual(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 13, nanos: 15}).getParts());
    });

    it('can create a copy with another period duration added', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});
        const secondPeriodDuration = PeriodDuration.ofParts({years: 6, months: 7, days: 8, seconds: 9, nanos: 10});

        const newPeriodDuration = periodDuration.plus(secondPeriodDuration);

        expect(newPeriodDuration.getParts())
            .toEqual(PeriodDuration.ofParts({years: 7, months: 9, days: 11, seconds: 13, nanos: 15}).getParts());
    });

    it('can create a copy with another period duration subtracted', () => {
        const periodDuration = PeriodDuration.ofParts({years: 7, months: 9, days: 11, seconds: 13, nanos: 15});
        const secondPeriodDuration = PeriodDuration.ofParts({years: 6, months: 7, days: 8, seconds: 9, nanos: 10});

        const newPeriodDuration = periodDuration.minus(secondPeriodDuration);

        expect(newPeriodDuration.getParts())
            .toEqual(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5}).getParts());
    });

    it('can create a copy with a period in years added', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(PeriodDuration.ofParts({years: -1, months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusYears(-2).getParts());

        expect(PeriodDuration.ofParts({months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusYears(-1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusYears(0).getParts());

        expect(PeriodDuration.ofParts({years: 2, months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusYears(1).getParts());

        expect(PeriodDuration.ofParts({years: 3, months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusYears(2).getParts());
    });

    it('should fail to add an amount of years which exceeds the range of valid integers', () => {
        expect(
            () => PeriodDuration.ofParts({
                years: 1,
                months: 2,
                days: 3,
                seconds: 4,
                nanos: 5,
            }).plusYears(Number.MAX_SAFE_INTEGER),
        ).toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with a period in years subtracted', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(PeriodDuration.ofParts({years: -1, months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.minusYears(2).getParts());

        expect(PeriodDuration.ofParts({months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.minusYears(1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.minusYears(0).getParts());

        expect(PeriodDuration.ofParts({years: 2, months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.minusYears(-1).getParts());

        expect(PeriodDuration.ofParts({years: 3, months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.minusYears(-2).getParts());
    });

    it('should fail to subtract an amount of years which exceeds the range of valid integers', () => {
        expect(
            () => PeriodDuration.ofParts({
                years: 1,
                months: 2,
                days: 3,
                seconds: 4,
                nanos: 5,
            }).minusYears(Number.MIN_SAFE_INTEGER),
        ).toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with a period in months added', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(PeriodDuration.ofParts({years: 1, months: -10, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusMonths(-12).getParts());

        expect(PeriodDuration.ofParts({years: 1, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusMonths(-2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 1, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusMonths(-1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusMonths(0).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 3, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusMonths(1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 4, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusMonths(2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 14, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusMonths(12).getParts());
    });

    it('should fail to add an amount of months which exceeds the range of valid integers', () => {
        expect(
            () => PeriodDuration.ofParts({
                years: 1,
                months: 2,
                days: 3,
                seconds: 4,
                nanos: 5,
            }).plusMonths(Number.MAX_SAFE_INTEGER),
        ).toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with a period in months subtracted', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(PeriodDuration.ofParts({years: 1, months: -10, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.minusMonths(12).getParts());

        expect(PeriodDuration.ofParts({years: 1, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.minusMonths(2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 1, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.minusMonths(1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.minusMonths(0).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 3, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.minusMonths(-1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 4, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.minusMonths(-2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 14, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.minusMonths(-12).getParts());
    });

    it('should fail to subtract an amount of months which exceeds the range of valid integers', () => {
        expect(
            () => PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5})
                .minusMonths(Number.MIN_SAFE_INTEGER),
        ).toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with a period in weeks added', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: -11, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusWeeks(-2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: -4, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusWeeks(-1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusWeeks(0).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 10, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusWeeks(1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 17, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusWeeks(2).getParts());
    });

    it('should fail to add an amount of weeks which exceeds the range of valid integers', () => {
        expect(
            () => PeriodDuration.ofParts({
                years: 1,
                months: 2,
                days: 3,
                seconds: 4,
                nanos: 5,
            }).plusWeeks(Number.MAX_SAFE_INTEGER),
        ).toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with a period in weeks subtracted', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: -11, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusWeeks(-2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: -4, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusWeeks(-1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusWeeks(0).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 10, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusWeeks(1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 17, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusWeeks(2).getParts());
    });

    it('should fail to subtract an amount of weeks which exceeds the range of valid integers', () => {
        expect(
            () => PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5})
                .minusWeeks(Number.MAX_SAFE_INTEGER),
        ).toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with a period in days added', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 1, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusDays(-2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 2, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusDays(-1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusDays(0).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 4, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusDays(1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 5, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusDays(2).getParts());
    });

    it('should fail to add an amount of days which exceeds the range of valid integers', () => {
        expect(
            () => PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5})
                .plusDays(Number.MAX_SAFE_INTEGER),
        ).toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with a period in days subtracted', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 1, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.minusDays(2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 2, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.minusDays(1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.minusDays(0).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 4, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.minusDays(-1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 5, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.minusDays(-2).getParts());
    });

    it('should fail to subtract an amount of days which exceeds the range of valid integers', () => {
        expect(
            () => PeriodDuration.ofParts({
                years: 1,
                months: 2,
                days: 3,
                seconds: 4,
                nanos: 5,
            }).minusDays(Number.MIN_SAFE_INTEGER),
        ).toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with a duration in standard hours added', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 - 24 * 3600, nanos: 5}).getParts())
            .toEqual(periodDuration.plusHours(-24).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 - 2 * 3600, nanos: 5}).getParts())
            .toEqual(periodDuration.plusHours(-2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 - 3600, nanos: 5}).getParts())
            .toEqual(periodDuration.plusHours(-1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusHours(0).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 + 3600, nanos: 5}).getParts())
            .toEqual(periodDuration.plusHours(1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 + 2 * 3600, nanos: 5}).getParts())
            .toEqual(periodDuration.plusHours(2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 + 24 * 3600, nanos: 5}).getParts())
            .toEqual(periodDuration.plusHours(24).getParts());
    });

    it('should fail to add an amount of hours which exceeds the range of valid integers', () => {
        expect(
            () => PeriodDuration.ofParts({
                years: 1,
                months: 2,
                days: 3,
                seconds: 4,
                nanos: 5,
            }).plusHours(Number.MAX_SAFE_INTEGER),
        ).toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with a duration in standard hours subtracted', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 - 24 * 3600, nanos: 5}).getParts())
            .toEqual(periodDuration.minusHours(24).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 - 2 * 3600, nanos: 5}).getParts())
            .toEqual(periodDuration.minusHours(2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 - 3600, nanos: 5}).getParts())
            .toEqual(periodDuration.minusHours(1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.minusHours(0).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 + 3600, nanos: 5}).getParts())
            .toEqual(periodDuration.minusHours(-1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 + 2 * 3600, nanos: 5}).getParts())
            .toEqual(periodDuration.minusHours(-2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 + 24 * 3600, nanos: 5}).getParts())
            .toEqual(periodDuration.minusHours(-24).getParts());
    });

    it('should fail to subtract an amount of hours which exceeds the range of valid integers', () => {
        expect(
            () => PeriodDuration.ofParts({
                years: 1,
                months: 2,
                days: 3,
                seconds: 4,
                nanos: 5,
            }).minusHours(Number.MAX_SAFE_INTEGER),
        ).toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with a duration in standard minutes added', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 - 2 * 60, nanos: 5}).getParts())
            .toEqual(periodDuration.plusMinutes(-2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 - 60, nanos: 5}).getParts())
            .toEqual(periodDuration.plusMinutes(-1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusMinutes(0).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 + 60, nanos: 5}).getParts())
            .toEqual(periodDuration.plusMinutes(1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 + 2 * 60, nanos: 5}).getParts())
            .toEqual(periodDuration.plusMinutes(2).getParts());
    });

    it('should fail to add an amount of minutes which exceeds the range of valid integers', () => {
        expect(
            () => PeriodDuration.ofParts({
                years: 1,
                months: 2,
                days: 3,
                seconds: 4,
                nanos: 5,
            }).plusMinutes(Number.MAX_SAFE_INTEGER),
        ).toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with a duration in standard minutes subtracted', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 - 2 * 60, nanos: 5}).getParts())
            .toEqual(periodDuration.minusMinutes(2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 - 60, nanos: 5}).getParts())
            .toEqual(periodDuration.minusMinutes(1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.minusMinutes(0).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 + 60, nanos: 5}).getParts())
            .toEqual(periodDuration.minusMinutes(-1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 + 2 * 60, nanos: 5}).getParts())
            .toEqual(periodDuration.minusMinutes(-2).getParts());
    });

    it('should fail to subtract an amount of minutes which exceeds the range of valid integers', () => {
        expect(
            () => PeriodDuration.ofParts({
                years: 1,
                months: 2,
                days: 3,
                seconds: 4,
                nanos: 5,
            }).minusMinutes(Number.MAX_SAFE_INTEGER),
        ).toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with a duration in seconds added', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 2, nanos: 5}).getParts())
            .toEqual(periodDuration.plusSeconds(-2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 3, nanos: 5}).getParts())
            .toEqual(periodDuration.plusSeconds(-1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusSeconds(0).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 5, nanos: 5}).getParts())
            .toEqual(periodDuration.plusSeconds(1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 6, nanos: 5}).getParts())
            .toEqual(periodDuration.plusSeconds(2).getParts());
    });

    it('should fail to add an amount of seconds which exceeds the range of valid integers', () => {
        expect(
            () => PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5})
                .plusSeconds(Number.MAX_SAFE_INTEGER),
        ).toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with a duration in seconds subtracted', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 2, nanos: 5}).getParts())
            .toEqual(periodDuration.minusSeconds(2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 3, nanos: 5}).getParts())
            .toEqual(periodDuration.minusSeconds(1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.minusSeconds(0).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 5, nanos: 5}).getParts())
            .toEqual(periodDuration.minusSeconds(-1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 6, nanos: 5}).getParts())
            .toEqual(periodDuration.minusSeconds(-2).getParts());
    });

    it('should fail to subtract an amount of seconds which exceeds the range of valid integers', () => {
        expect(
            () => PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5})
                .minusSeconds(Number.MIN_SAFE_INTEGER),
        ).toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with a duration in milliseconds added', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 + 2, nanos: 5}).getParts())
            .toEqual(periodDuration.plusMillis(2000).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5 + 2000000}).getParts())
            .toEqual(periodDuration.plusMillis(2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5 + 1000000}).getParts())
            .toEqual(periodDuration.plusMillis(1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusMillis(0).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5 - 1000000}).getParts())
            .toEqual(periodDuration.plusMillis(-1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5 - 2000000}).getParts())
            .toEqual(periodDuration.plusMillis(-2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 - 2, nanos: 5}).getParts())
            .toEqual(periodDuration.plusMillis(-2000).getParts());

        const maxValue = Number.MAX_SAFE_INTEGER;
        const maxSeconds = intDiv(maxValue, LocalTime.MILLIS_PER_SECOND);
        const maxNanos = (maxValue % LocalTime.MILLIS_PER_SECOND) * LocalTime.NANOS_PER_MILLI;

        expect(
            PeriodDuration.ofParts({
                years: 1,
                months: 2,
                days: 3,
                seconds: 4 + maxSeconds,
                nanos: 5 + maxNanos,
            }).getParts(),
        ).toEqual(periodDuration.plusMillis(maxValue).getParts());

        const minValue = Number.MIN_SAFE_INTEGER;
        const minSeconds = intDiv(minValue, LocalTime.MILLIS_PER_SECOND);
        const minNanos = (minValue % LocalTime.MILLIS_PER_SECOND) * LocalTime.NANOS_PER_MILLI;

        expect(
            PeriodDuration.ofParts({
                years: 1,
                months: 2,
                days: 3,
                seconds: 4 + minSeconds,
                nanos: 5 + minNanos,
            }).getParts(),
        ).toEqual(periodDuration.plusMillis(minValue).getParts());
    });

    it('can create a copy with a duration in milliseconds subtracted', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 + 2, nanos: 5}).getParts())
            .toEqual(periodDuration.minusMillis(-2000).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5 + 2000000}).getParts())
            .toEqual(periodDuration.minusMillis(-2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5 + 1000000}).getParts())
            .toEqual(periodDuration.minusMillis(-1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.minusMillis(0).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5 - 1000000}).getParts())
            .toEqual(periodDuration.minusMillis(1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5 - 2000000}).getParts())
            .toEqual(periodDuration.minusMillis(2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 - 2, nanos: 5}).getParts())
            .toEqual(periodDuration.minusMillis(2000).getParts());

        const maxValue = Number.MIN_SAFE_INTEGER;
        const maxSeconds = intDiv(maxValue, LocalTime.MILLIS_PER_SECOND);
        const maxNanos = (maxValue % LocalTime.MILLIS_PER_SECOND) * LocalTime.NANOS_PER_MILLI;

        expect(
            PeriodDuration.ofParts({
                years: 1,
                months: 2,
                days: 3,
                seconds: 4 - maxSeconds,
                nanos: 5 - maxNanos,
            }).getParts(),
        ).toEqual(periodDuration.minusMillis(maxValue).getParts());

        const minValue = Number.MIN_SAFE_INTEGER;
        const minSeconds = intDiv(minValue, LocalTime.MILLIS_PER_SECOND);
        const minNanos = (minValue % LocalTime.MILLIS_PER_SECOND) * LocalTime.NANOS_PER_MILLI;

        expect(
            PeriodDuration.ofParts({
                years: 1,
                months: 2,
                days: 3,
                seconds: 4 - minSeconds,
                nanos: 5 - minNanos,
            }).getParts(),
        ).toEqual(periodDuration.minusMillis(minValue).getParts());
    });

    it('can create a copy with a duration in microseconds added', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 + 2, nanos: 5}).getParts())
            .toEqual(periodDuration.plusMicros(2000000).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5 + 2000}).getParts())
            .toEqual(periodDuration.plusMicros(2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5 + 1000}).getParts())
            .toEqual(periodDuration.plusMicros(1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusMicros(0).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5 - 1000}).getParts())
            .toEqual(periodDuration.plusMicros(-1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5 - 2000}).getParts())
            .toEqual(periodDuration.plusMicros(-2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 - 2, nanos: 5}).getParts())
            .toEqual(periodDuration.plusMicros(-2000000).getParts());

        const maxValue = Number.MIN_SAFE_INTEGER;
        const maxSeconds = intDiv(maxValue, LocalTime.MICROS_PER_SECOND);
        const maxNanos = (maxValue % LocalTime.MICROS_PER_SECOND) * LocalTime.NANOS_PER_MICRO;

        expect(
            PeriodDuration.ofParts({
                years: 1,
                months: 2,
                days: 3,
                seconds: 4 + maxSeconds,
                nanos: 5 + maxNanos,
            }).getParts(),
        ).toEqual(periodDuration.plusMicros(maxValue).getParts());

        const minValue = Number.MIN_SAFE_INTEGER;
        const minSeconds = intDiv(minValue, LocalTime.MICROS_PER_SECOND);
        const minNanos = (minValue % LocalTime.MICROS_PER_SECOND) * LocalTime.NANOS_PER_MICRO;

        expect(
            PeriodDuration.ofParts({
                years: 1,
                months: 2,
                days: 3,
                seconds: 4 + minSeconds,
                nanos: 5 + minNanos,
            }).getParts(),
        ).toEqual(periodDuration.plusMicros(minValue).getParts());
    });

    it('can create a copy with a duration in microseconds subtracted', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 + 2, nanos: 5}).getParts())
            .toEqual(periodDuration.minusMicros(-2000000).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5 + 2000}).getParts())
            .toEqual(periodDuration.minusMicros(-2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5 + 1000}).getParts())
            .toEqual(periodDuration.minusMicros(-1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.minusMicros(0).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5 - 1000}).getParts())
            .toEqual(periodDuration.minusMicros(1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5 - 2000}).getParts())
            .toEqual(periodDuration.minusMicros(2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 - 2, nanos: 5}).getParts())
            .toEqual(periodDuration.minusMicros(2000000).getParts());

        const maxValue = Number.MIN_SAFE_INTEGER;
        const maxSeconds = intDiv(maxValue, LocalTime.MICROS_PER_SECOND);
        const maxNanos = (maxValue % LocalTime.MICROS_PER_SECOND) * LocalTime.NANOS_PER_MICRO;

        expect(
            PeriodDuration.ofParts({
                years: 1,
                months: 2,
                days: 3,
                seconds: 4 - maxSeconds,
                nanos: 5 - maxNanos,
            }).getParts(),
        ).toEqual(periodDuration.minusMicros(maxValue).getParts());

        const minValue = Number.MIN_SAFE_INTEGER;
        const minSeconds = intDiv(minValue, LocalTime.MICROS_PER_SECOND);
        const minNanos = (minValue % LocalTime.MICROS_PER_SECOND) * LocalTime.NANOS_PER_MICRO;

        expect(
            PeriodDuration.ofParts({
                years: 1,
                months: 2,
                days: 3,
                seconds: 4 - minSeconds,
                nanos: 5 - minNanos,
            }).getParts(),
        ).toEqual(periodDuration.minusMicros(minValue).getParts());
    });

    it('can create a copy with a duration in nanoseconds added', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 + 2, nanos: 5}).getParts())
            .toEqual(periodDuration.plusNanos(2000000000).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5 + 2}).getParts())
            .toEqual(periodDuration.plusNanos(2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5 + 1}).getParts())
            .toEqual(periodDuration.plusNanos(1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.plusNanos(0).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5 - 1}).getParts())
            .toEqual(periodDuration.plusNanos(-1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5 - 2}).getParts())
            .toEqual(periodDuration.plusNanos(-2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 - 2, nanos: 5}).getParts())
            .toEqual(periodDuration.plusNanos(-2000000000).getParts());

        const maxValue = Number.MIN_SAFE_INTEGER;
        const maxSeconds = intDiv(maxValue, LocalTime.NANOS_PER_SECOND);
        const maxNanos = maxValue % LocalTime.NANOS_PER_SECOND;

        expect(
            PeriodDuration.ofParts({
                years: 1,
                months: 2,
                days: 3,
                seconds: 4 + maxSeconds,
                nanos: 5 + maxNanos,
            }).getParts(),
        ).toEqual(periodDuration.plusNanos(maxValue).getParts());

        const minValue = Number.MIN_SAFE_INTEGER;
        const minSeconds = intDiv(minValue, LocalTime.NANOS_PER_SECOND);
        const minNanos = minValue % LocalTime.NANOS_PER_SECOND;

        expect(
            PeriodDuration.ofParts({
                years: 1,
                months: 2,
                days: 3,
                seconds: 4 + minSeconds,
                nanos: 5 + minNanos,
            }).getParts(),
        ).toEqual(periodDuration.plusNanos(minValue).getParts());
    });

    it('can create a copy with a duration in nanoseconds subtracted', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 + 2, nanos: 5}).getParts())
            .toEqual(periodDuration.minusNanos(-2000000000).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5 + 2}).getParts())
            .toEqual(periodDuration.minusNanos(-2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5 + 1}).getParts())
            .toEqual(periodDuration.minusNanos(-1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5}).getParts())
            .toEqual(periodDuration.minusNanos(0).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5 - 1}).getParts())
            .toEqual(periodDuration.minusNanos(1).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5 - 2}).getParts())
            .toEqual(periodDuration.minusNanos(2).getParts());

        expect(PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4 - 2, nanos: 5}).getParts())
            .toEqual(periodDuration.minusNanos(2000000000).getParts());

        const maxValue = Number.MIN_SAFE_INTEGER;
        const maxSeconds = intDiv(maxValue, LocalTime.NANOS_PER_SECOND);
        const maxNanos = maxValue % LocalTime.NANOS_PER_SECOND;

        expect(
            PeriodDuration.ofParts({
                years: 1,
                months: 2,
                days: 3,
                seconds: 4 - maxSeconds,
                nanos: 5 - maxNanos,
            }).getParts(),
        ).toEqual(periodDuration.minusNanos(maxValue).getParts());

        const minValue = Number.MIN_SAFE_INTEGER;
        const minSeconds = intDiv(minValue, LocalTime.NANOS_PER_SECOND);
        const minNanos = minValue % LocalTime.NANOS_PER_SECOND;

        expect(
            PeriodDuration.ofParts({
                years: 1,
                months: 2,
                days: 3,
                seconds: 4 - minSeconds,
                nanos: 5 - minNanos,
            }).getParts(),
        ).toEqual(periodDuration.minusNanos(minValue).getParts());
    });

    it('can create a copy with each unit value multiplied by a given scalar', () => {
        const periodDuration = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(periodDuration.getParts()).toEqual(periodDuration.multipliedBy(1).getParts());

        // Non-zero period multiplied by 0
        const zero = periodDuration.multipliedBy(0);

        expect(zero.getParts()).toEqual(PeriodDuration.zero().getParts());

        // Non-zero period multiplied by scalar different than 1
        const nonZero = periodDuration.multipliedBy(3);

        expect(PeriodDuration.ofParts({years: 3, months: 6, days: 9, seconds: 12, nanos: 15}).getParts())
            .toEqual(nonZero.getParts());
    });

    it('should fail to be multiplied by a scalar which exceeds the range of valid integers', () => {
        expect(
            () => {
                PeriodDuration.ofParts({
                    years: 1,
                    months: 2,
                    days: 3,
                    seconds: 4,
                    nanos: 5,
                }).multipliedBy(Number.MAX_SAFE_INTEGER);
            },
        ).toThrow('overflow');
    });

    it('can create a copy with the years and months units normalized, leaving the days unit unchanged', () => {
        // Zero period
        const zero = PeriodDuration.zero();

        expect(zero.getParts()).toEqual(zero.normalized().getParts());

        // Already normalized period
        const alreadyNormalized = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(alreadyNormalized.getParts()).toEqual(alreadyNormalized.normalized().getParts());

        // Not normalized period
        const nonNormalized = PeriodDuration.ofParts({years: 11, months: 22, days: 33, seconds: 44, nanos: 55});
        const normalized = nonNormalized.normalized();

        expect(
            PeriodDuration.ofParts({
                years: 12,
                months: 10,
                days: 33,
                seconds: 44,
                nanos: 55,
            }).getParts(),
        ).toEqual(normalized.getParts());
    });

    it('can create a copy with the time parts normalized, leaving the month and year units unchanged', () => {
        // Zero period
        const zero = PeriodDuration.zero();

        expect(zero.getParts()).toEqual(zero.normalizedStandardDays().getParts());

        // Already normalized period
        const alreadyNormalized = PeriodDuration.ofParts({years: 1, months: 2, days: 3, seconds: 4, nanos: 5});

        expect(alreadyNormalized.getParts()).toEqual(alreadyNormalized.normalizedStandardDays().getParts());

        // Not normalized period
        const nonNormalized = PeriodDuration.ofParts({
            years: 11,
            months: 22,
            days: 33,
            seconds: 24 * 3600,
            nanos: 1234567890,
        });
        const normalized = nonNormalized.normalizedStandardDays();

        expect(PeriodDuration.ofParts({years: 11, months: 22, days: 34, seconds: 1, nanos: 234567890}).getParts())
            .toEqual(normalized.getParts());
    });

    it.each([
        {
            periodDuration: PeriodDuration.zero(),
            expected: 'PT0S',
        },
        {
            periodDuration: PeriodDuration.ofParts({years: 1}),
            expected: 'P1Y',
        },
        {
            periodDuration: PeriodDuration.ofParts({months: 1}),
            expected: 'P1M',
        },
        {
            periodDuration: PeriodDuration.ofParts({days: 1}),
            expected: 'P1D',
        },
        {
            periodDuration: PeriodDuration.ofParts({seconds: 3600}),
            expected: 'PT1H',
        },
        {
            periodDuration: PeriodDuration.ofParts({seconds: 60}),
            expected: 'PT1M',
        },
        {
            periodDuration: PeriodDuration.ofParts({seconds: 1}),
            expected: 'PT1S',
        },
        {
            periodDuration: PeriodDuration.ofParts({nanos: 1000000}),
            expected: 'PT0.001S',
        },
        {
            periodDuration: PeriodDuration.ofParts({nanos: 1000}),
            expected: 'PT0.000001S',
        },
        {
            periodDuration: PeriodDuration.ofParts({nanos: 1}),
            expected: 'PT0.000000001S',
        },
        {
            periodDuration: PeriodDuration.ofParts({nanos: 12}),
            expected: 'PT0.000000012S',
        },
        {
            periodDuration: PeriodDuration.ofParts({nanos: 123}),
            expected: 'PT0.000000123S',
        },
        {
            periodDuration: PeriodDuration.ofParts({nanos: 1234}),
            expected: 'PT0.000001234S',
        },
        {
            periodDuration: PeriodDuration.ofParts({nanos: 12345}),
            expected: 'PT0.000012345S',
        },
        {
            periodDuration: PeriodDuration.ofParts({nanos: 123456}),
            expected: 'PT0.000123456S',
        },
        {
            periodDuration: PeriodDuration.ofParts({nanos: 1234567}),
            expected: 'PT0.001234567S',
        },
        {
            periodDuration: PeriodDuration.ofParts({nanos: 12345678}),
            expected: 'PT0.012345678S',
        },
        {
            periodDuration: PeriodDuration.ofParts({nanos: 123456789}),
            expected: 'PT0.123456789S',
        },
        {
            periodDuration: PeriodDuration.ofParts({nanos: 10}),
            expected: 'PT0.000000010S',
        },
        {
            periodDuration: PeriodDuration.ofParts({nanos: 100}),
            expected: 'PT0.000000100S',
        },
        {
            periodDuration: PeriodDuration.ofParts({nanos: 10000}),
            expected: 'PT0.000010S',
        },
        {
            periodDuration: PeriodDuration.ofParts({nanos: 100000}),
            expected: 'PT0.000100S',
        },
        {
            periodDuration: PeriodDuration.ofParts({nanos: 10000000}),
            expected: 'PT0.010S',
        },
        {
            periodDuration: PeriodDuration.ofParts({nanos: 100000000}),
            expected: 'PT0.100S',
        },
        {
            periodDuration: PeriodDuration.ofParts({years: 1, months: 2, days: 3}),
            expected: 'P1Y2M3D',
        },
        {
            periodDuration: PeriodDuration.ofParts({years: -1, months: -2, days: -3}),
            expected: 'P-1Y-2M-3D',
        },
        {
            periodDuration: PeriodDuration.ofParts({seconds: 3600 + 2 * 60 + 3, nanos: 456789123}),
            expected: 'PT1H2M3.456789123S',
        },
        {
            periodDuration: PeriodDuration.ofParts({seconds: -1 * 3600 - 2 * 60 - 3, nanos: -456789123}),
            expected: 'PT-1H-2M-3.456789123S',
        },
        {
            periodDuration: PeriodDuration.ofParts({
                years: 1,
                months: 2,
                days: 3,
                seconds: 3600 + 2 * 60 + 3,
                nanos: 456789123,
            }),
            expected: 'P1Y2M3DT1H2M3.456789123S',
        },
        {
            periodDuration: PeriodDuration.ofParts({
                years: -1,
                months: -2,
                days: -3,
                seconds: -1 * 3600 - 2 * 60 - 3,
                nanos: -456789123,
            }),
            expected: 'P-1Y-2M-3DT-1H-2M-3.456789123S',
        },
    ])('can be converted to a string in the ISO-8601 format, such as "$expected"', scenario => {
        expect(scenario.periodDuration.toString()).toEqual(scenario.expected);
    });
});
