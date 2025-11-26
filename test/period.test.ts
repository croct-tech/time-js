import {Period} from '../src';

describe('A ISO date-based amount of time', () => {
    it('can be created from a number of years, months and days', () => {
        const period = Period.of({years: 1, months: 2, days: 3});

        expect(period.getYears()).toBe(1);
        expect(period.getMonths()).toBe(2);
        expect(period.getDays()).toBe(3);
    });

    it('can be created with zero years, months and days', () => {
        const period = Period.of({});

        expect(period.getYears()).toBe(0);
        expect(period.getMonths()).toBe(0);
        expect(period.getDays()).toBe(0);
    });

    it('can be directly created with zero years, months and days', () => {
        const period = Period.zero();

        expect(period.getYears()).toBe(0);
        expect(period.getMonths()).toBe(0);
        expect(period.getDays()).toBe(0);
    });

    it('can be created from a number of years', () => {
        const period = Period.ofYears(1);

        expect(period.getParts()).toEqual(Period.of({years: 1}).getParts());
    });

    it('can be created from a number of months', () => {
        const period = Period.ofMonths(1);

        expect(period.getParts()).toEqual(Period.of({months: 1}).getParts());
    });

    it('can be created from a number of weeks', () => {
        const period = Period.ofWeeks(1);

        expect(period.getParts()).toEqual(Period.of({days: 7}).getParts());
    });

    it('can be created from a number of days', () => {
        const period = Period.ofDays(1);

        expect(period.getParts()).toEqual(Period.of({days: 1}).getParts());
    });

    it.each([
        // Zero
        ['P0D', Period.zero()],
        ['P0W', Period.zero()],
        ['P0M', Period.zero()],
        ['P0Y', Period.zero()],
        ['P0Y0D', Period.zero()],
        ['P0Y0W', Period.zero()],
        ['P0Y0M', Period.zero()],
        ['P0M0D', Period.zero()],
        ['P0M0W', Period.zero()],
        ['P0W0D', Period.zero()],

        // Days
        ['P1D', Period.ofDays(1)],
        ['P2D', Period.ofDays(2)],
        ['P-2D', Period.ofDays(-2)],
        ['-P2D', Period.ofDays(-2)],
        ['-P-2D', Period.ofDays(2)],
        [`P${Number.MAX_SAFE_INTEGER}D`, Period.ofDays(Number.MAX_SAFE_INTEGER)],
        [`P${Number.MIN_SAFE_INTEGER}D`, Period.ofDays(Number.MIN_SAFE_INTEGER)],

        // Weeks
        ['P1W', Period.ofDays(7)],
        ['P2W', Period.ofDays(14)],
        ['P-2W', Period.ofDays(-14)],
        ['-P2W', Period.ofDays(-14)],
        ['-P-2W', Period.ofDays(14)],

        // Months
        ['P1M', Period.ofMonths(1)],
        ['P2M', Period.ofMonths(2)],
        ['P-2M', Period.ofMonths(-2)],
        ['-P2M', Period.ofMonths(-2)],
        ['-P-2M', Period.ofMonths(2)],
        [`P${Number.MAX_SAFE_INTEGER}M`, Period.ofMonths(Number.MAX_SAFE_INTEGER)],
        [`P${Number.MIN_SAFE_INTEGER}M`, Period.ofMonths(Number.MIN_SAFE_INTEGER)],

        // Years
        ['P1Y', Period.ofYears(1)],
        ['P2Y', Period.ofYears(2)],
        ['P-2Y', Period.ofYears(-2)],
        ['-P2Y', Period.ofYears(-2)],
        ['-P-2Y', Period.ofYears(2)],
        [`P${Number.MAX_SAFE_INTEGER}Y`, Period.ofYears(Number.MAX_SAFE_INTEGER)],
        [`P${Number.MIN_SAFE_INTEGER}Y`, Period.ofYears(Number.MIN_SAFE_INTEGER)],

        // Full period
        ['P1Y2M3W4D', Period.of({years: 1, months: 2, days: 3 * 7 + 4})],
        ['-P1Y2M3W4D', Period.of({years: -1, months: -2, days: -(3 * 7) - 4})],
        ['-P-1Y-2M-3W-4D', Period.of({years: 1, months: 2, days: 3 * 7 + 4})],
    ])('can parse %s', (value, expected) => {
        const period = Period.parse(value);
        const lowercasePeriod = Period.parse(value.toLowerCase());

        expect(period.equals(expected)).toBe(true);
        expect(lowercasePeriod.equals(expected)).toBe(true);
    });

    it.each([
        '',
        'P',
        'P-',
        'PD',
        'PM',
        'PY',
        'PW',
        'P1',
        'P12',
        'P-12',
        '1D',
        '1Y2M',
        'P1Q',
        'P1Y2Q',
        'P1X2D',
        'P1D2D',
        'P1Y2Y',
        'P1M2M',
        'P1Y2M3Y',
        'P1Y2M3W4W',
        'PT10H',
        'P1DT2H',
        'P1Y2M3DT4H',
        'P1.5D',
        'P+1.5Y',
        'P1D ',
        ' P1D',
        'P 1D',
        'P1-2D',
        'P--1D',
        'P+1-D',
        'P1+-2D',
        'PP1D',
        'P1YD',
        'P1MD',
    ])('cannot parse %s', value => {
        expect(() => Period.parse(value)).toThrow(`Unrecognized ISO-8601 period string "${value}".`);
    });

    it('cannot parse a period that overflows integer limits', () => {
        expect(() => Period.parse('P123456789123456789123456789D'))
            .toThrow('The result overflows the range of safe integers.');
    });

    it('can determine whether the period is zero', () => {
        expect(Period.zero().isZero()).toBe(true);
        expect(Period.of({days: 1}).isZero()).toBe(false);
        expect(Period.of({months: 1}).isZero()).toBe(false);
        expect(Period.of({years: 1}).isZero()).toBe(false);
    });

    it('can determine whether the years, months and days are negative', () => {
        expect(Period.zero().isNegative()).toBe(false);
        expect(Period.of({years: 1, months: 2, days: 3}).isNegative()).toBe(false);
        expect(Period.of({years: -1, months: 2, days: 3}).isNegative()).toBe(true);
        expect(Period.of({years: 1, months: -2, days: 3}).isNegative()).toBe(true);
        expect(Period.of({years: 1, months: 2, days: -3}).isNegative()).toBe(true);
    });

    it('should return the amount of years', () => {
        expect(Period.of({years: 1, months: 2, days: 3}).getYears()).toBe(1);
    });

    it('should return the amount of months', () => {
        expect(Period.of({years: 1, months: 2, days: 3}).getMonths()).toBe(2);
    });

    it('should return the amount of days', () => {
        expect(Period.of({years: 1, months: 2, days: 3}).getDays()).toBe(3);
    });

    it('can determine whether it is logically equal to another period', () => {
        const period = Period.of({years: 1, months: 2, days: 3});

        // Same period instance
        expect(period.equals(period)).toBe(true);

        // Different year
        expect(period.equals(Period.of({months: 2, days: 3}))).toBe(false);

        // Different month
        expect(period.equals(Period.of({years: 1, days: 3}))).toBe(false);

        // Different day
        expect(period.equals(Period.of({years: 1, months: 2}))).toBe(false);

        // Other period logically equal
        expect(period.equals(Period.of({years: 1, months: 2, days: 3}))).toBe(true);
    });

    it('can create a copy with a new amount of years', () => {
        const period = Period.of({years: 1, months: 2, days: 3});
        const newPeriod = period.withYears(0);

        expect(newPeriod.getParts()).toEqual(Period.of({months: 2, days: 3}).getParts());
    });

    it('should return the period itself building a period with the same amount of years', () => {
        const period = Period.of({years: 1, months: 2, days: 3});
        const newPeriod = period.withYears(1);

        expect(newPeriod.getParts()).toEqual(period.getParts());
    });

    it('can create a copy with a new amount of months', () => {
        const period = Period.of({years: 1, months: 2, days: 3});
        const newPeriod = period.withMonths(0);

        expect(newPeriod.getParts()).toEqual(Period.of({years: 1, days: 3}).getParts());
    });

    it('should return the period itself building a period with the same amount of months', () => {
        const period = Period.of({years: 1, months: 2, days: 3});
        const newPeriod = period.withMonths(2);

        expect(newPeriod.getParts()).toEqual(period.getParts());
    });

    it('can create a copy with a new amount of days', () => {
        const period = Period.of({years: 1, months: 2, days: 3});
        const newPeriod = period.withDays(0);

        expect(newPeriod.getParts()).toEqual(Period.of({years: 1, months: 2}).getParts());
    });

    it('should return the period itself building a period with the same amount of days', () => {
        const period = Period.of({years: 1, months: 2, days: 3});
        const newPeriod = period.withDays(3);

        expect(newPeriod.getParts()).toEqual(period.getParts());
    });

    it('can create a copy with another period added', () => {
        const period = Period.of({years: 1, months: 2, days: 3});
        const secondPeriod = period.plusPeriod(Period.of({years: 4, months: 5, days: 6}));

        expect(secondPeriod.getParts()).toEqual(Period.of({years: 5, months: 7, days: 9}).getParts());
    });

    it('can create a copy with another period subtracted', () => {
        const period = Period.of({years: 1, months: 2, days: 3});
        const secondPeriod = period.minusPeriod(Period.of({years: 4, months: 5, days: 6}));

        expect(secondPeriod.getParts()).toEqual(Period.of({years: -3, months: -3, days: -3}).getParts());
    });

    it('can create a copy with a period in years added', () => {
        const period = Period.of({years: 1, months: 2, days: 3});

        expect(Period.of({years: -2, months: 2, days: 3}).getParts()).toEqual(period.plusYears(-3).getParts());
        expect(Period.of({years: -1, months: 2, days: 3}).getParts()).toEqual(period.plusYears(-2).getParts());
        expect(Period.of({months: 2, days: 3}).getParts()).toEqual(period.plusYears(-1).getParts());
        expect(Period.of({years: 1, months: 2, days: 3}).getParts()).toEqual(period.plusYears(0).getParts());
        expect(Period.of({years: 2, months: 2, days: 3}).getParts()).toEqual(period.plusYears(1).getParts());
        expect(Period.of({years: 3, months: 2, days: 3}).getParts()).toEqual(period.plusYears(2).getParts());
        expect(Period.of({years: 4, months: 2, days: 3}).getParts()).toEqual(period.plusYears(3).getParts());
    });

    it('should fail to add an amount of years that exceeds the safe integer limit', () => {
        expect(() => Period.of({years: 1, months: 2, days: 3}).plusYears(Number.MAX_SAFE_INTEGER))
            .toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with period in years subtracted', () => {
        const period = Period.of({years: 1, months: 2, days: 3});

        expect(Period.of({years: -2, months: 2, days: 3}).getParts()).toEqual(period.minusYears(3).getParts());
        expect(Period.of({years: -1, months: 2, days: 3}).getParts()).toEqual(period.minusYears(2).getParts());
        expect(Period.of({months: 2, days: 3}).getParts()).toEqual(period.minusYears(1).getParts());
        expect(Period.of({years: 1, months: 2, days: 3}).getParts()).toEqual(period.minusYears(0).getParts());
        expect(Period.of({years: 2, months: 2, days: 3}).getParts()).toEqual(period.minusYears(-1).getParts());
        expect(Period.of({years: 3, months: 2, days: 3}).getParts()).toEqual(period.minusYears(-2).getParts());
        expect(Period.of({years: 4, months: 2, days: 3}).getParts()).toEqual(period.minusYears(-3).getParts());
    });

    it('should fail to subtract an amount of years that exceeds the safe integer limit', () => {
        expect(() => Period.of({years: 1, months: 2, days: 3}).minusYears(Number.MAX_SAFE_INTEGER + 3))
            .toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with a period in months added', () => {
        const period = Period.of({years: 1, months: 2, days: 3});

        expect(Period.of({years: 1, months: -10, days: 3}).getParts()).toEqual(period.plusMonths(-12).getParts());
        expect(Period.of({years: 1, months: -1, days: 3}).getParts()).toEqual(period.plusMonths(-3).getParts());
        expect(Period.of({years: 1, days: 3}).getParts()).toEqual(period.plusMonths(-2).getParts());
        expect(Period.of({years: 1, months: 1, days: 3}).getParts()).toEqual(period.plusMonths(-1).getParts());
        expect(Period.of({years: 1, months: 2, days: 3}).getParts()).toEqual(period.plusMonths(0).getParts());
        expect(Period.of({years: 1, months: 3, days: 3}).getParts()).toEqual(period.plusMonths(1).getParts());
        expect(Period.of({years: 1, months: 4, days: 3}).getParts()).toEqual(period.plusMonths(2).getParts());
        expect(Period.of({years: 1, months: 5, days: 3}).getParts()).toEqual(period.plusMonths(3).getParts());
        expect(Period.of({years: 1, months: 14, days: 3}).getParts()).toEqual(period.plusMonths(12).getParts());
    });

    it('should fail to add an amount of months that exceeds the safe integer limit', () => {
        expect(() => Period.of({years: 1, months: 2, days: 3}).plusMonths(Number.MAX_SAFE_INTEGER))
            .toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with period in months subtracted', () => {
        const period = Period.of({years: 1, months: 2, days: 3});

        expect(Period.of({years: 1, months: -10, days: 3}).getParts()).toEqual(period.minusMonths(12).getParts());
        expect(Period.of({years: 1, months: -1, days: 3}).getParts()).toEqual(period.minusMonths(3).getParts());
        expect(Period.of({years: 1, days: 3}).getParts()).toEqual(period.minusMonths(2).getParts());
        expect(Period.of({years: 1, months: 1, days: 3}).getParts()).toEqual(period.minusMonths(1).getParts());
        expect(Period.of({years: 1, months: 2, days: 3}).getParts()).toEqual(period.minusMonths(0).getParts());
        expect(Period.of({years: 1, months: 3, days: 3}).getParts()).toEqual(period.minusMonths(-1).getParts());
        expect(Period.of({years: 1, months: 4, days: 3}).getParts()).toEqual(period.minusMonths(-2).getParts());
        expect(Period.of({years: 1, months: 5, days: 3}).getParts()).toEqual(period.minusMonths(-3).getParts());
        expect(Period.of({years: 1, months: 14, days: 3}).getParts()).toEqual(period.minusMonths(-12).getParts());
    });

    it('should fail to subtract an amount of months that exceeds the safe integer limit', () => {
        expect(() => Period.of({years: 1, months: 2, days: 3}).minusMonths(Number.MAX_SAFE_INTEGER + 3))
            .toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with a period in weeks added', () => {
        const period = Period.of({years: 1, months: 2, days: 3});

        expect(Period.of({years: 1, months: 2, days: -18}).getParts()).toEqual(period.plusWeeks(-3).getParts());
        expect(Period.of({years: 1, months: 2, days: -11}).getParts()).toEqual(period.plusWeeks(-2).getParts());
        expect(Period.of({years: 1, months: 2, days: -4}).getParts()).toEqual(period.plusWeeks(-1).getParts());
        expect(Period.of({years: 1, months: 2, days: 3}).getParts()).toEqual(period.plusWeeks(0).getParts());
        expect(Period.of({years: 1, months: 2, days: 10}).getParts()).toEqual(period.plusWeeks(1).getParts());
        expect(Period.of({years: 1, months: 2, days: 17}).getParts()).toEqual(period.plusWeeks(2).getParts());
        expect(Period.of({years: 1, months: 2, days: 24}).getParts()).toEqual(period.plusWeeks(3).getParts());
    });

    it('should fail to add an amount of weeks that exceeds the safe integer limit', () => {
        expect(() => Period.of({years: 1, months: 2, days: 3}).plusWeeks(Number.MAX_SAFE_INTEGER))
            .toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with a period in weeks subtracted', () => {
        const period = Period.of({years: 1, months: 2, days: 3});

        expect(Period.of({years: 1, months: 2, days: -18}).getParts()).toEqual(period.minusWeeks(3).getParts());
        expect(Period.of({years: 1, months: 2, days: -11}).getParts()).toEqual(period.minusWeeks(2).getParts());
        expect(Period.of({years: 1, months: 2, days: -4}).getParts()).toEqual(period.minusWeeks(1).getParts());
        expect(Period.of({years: 1, months: 2, days: 3}).getParts()).toEqual(period.minusWeeks(0).getParts());
        expect(Period.of({years: 1, months: 2, days: 10}).getParts()).toEqual(period.minusWeeks(-1).getParts());
        expect(Period.of({years: 1, months: 2, days: 17}).getParts()).toEqual(period.minusWeeks(-2).getParts());
        expect(Period.of({years: 1, months: 2, days: 24}).getParts()).toEqual(period.minusWeeks(-3).getParts());
    });

    it('should fail to subtract an amount of weeks that exceeds the safe integer limit', () => {
        expect(() => Period.of({years: 1, months: 2, days: 3}).minusWeeks(Number.MAX_SAFE_INTEGER))
            .toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with a period in days added', () => {
        const period = Period.of({years: 1, months: 2, days: 3});

        expect(Period.of({years: 1, months: 2}).getParts()).toEqual(period.plusDays(-3).getParts());
        expect(Period.of({years: 1, months: 2, days: 1}).getParts()).toEqual(period.plusDays(-2).getParts());
        expect(Period.of({years: 1, months: 2, days: 2}).getParts()).toEqual(period.plusDays(-1).getParts());
        expect(Period.of({years: 1, months: 2, days: 3}).getParts()).toEqual(period.plusDays(0).getParts());
        expect(Period.of({years: 1, months: 2, days: 4}).getParts()).toEqual(period.plusDays(1).getParts());
        expect(Period.of({years: 1, months: 2, days: 5}).getParts()).toEqual(period.plusDays(2).getParts());
        expect(Period.of({years: 1, months: 2, days: 6}).getParts()).toEqual(period.plusDays(3).getParts());
    });

    it('should fail to add an amount of days that exceeds the safe integer limit', () => {
        expect(() => Period.of({years: 1, months: 2, days: 3}).plusDays(Number.MAX_SAFE_INTEGER))
            .toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with a period in days subtracted', () => {
        const period = Period.of({years: 1, months: 2, days: 3});

        expect(Period.of({years: 1, months: 2}).getParts()).toEqual(period.minusDays(3).getParts());
        expect(Period.of({years: 1, months: 2, days: 1}).getParts()).toEqual(period.minusDays(2).getParts());
        expect(Period.of({years: 1, months: 2, days: 2}).getParts()).toEqual(period.minusDays(1).getParts());
        expect(Period.of({years: 1, months: 2, days: 3}).getParts()).toEqual(period.minusDays(0).getParts());
        expect(Period.of({years: 1, months: 2, days: 4}).getParts()).toEqual(period.minusDays(-1).getParts());
        expect(Period.of({years: 1, months: 2, days: 5}).getParts()).toEqual(period.minusDays(-2).getParts());
        expect(Period.of({years: 1, months: 2, days: 6}).getParts()).toEqual(period.minusDays(-3).getParts());
    });

    it('should fail to subtract an amount of days that exceeds the safe integer limit', () => {
        expect(() => Period.of({years: 1, months: 2, days: 3}).minusDays(Number.MAX_SAFE_INTEGER + 4))
            .toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with each unit multiplied by a given scalar', () => {
        // Zero period
        const zeroPeriod = Period.zero();

        expect(zeroPeriod.getParts()).toEqual(zeroPeriod.multipliedBy(-2).getParts());
        expect(zeroPeriod.getParts()).toEqual(zeroPeriod.multipliedBy(-1).getParts());
        expect(zeroPeriod.getParts()).toEqual(zeroPeriod.multipliedBy(0).getParts());
        expect(zeroPeriod.getParts()).toEqual(zeroPeriod.multipliedBy(1).getParts());
        expect(zeroPeriod.getParts()).toEqual(zeroPeriod.multipliedBy(2).getParts());
        expect(zeroPeriod.getParts()).toEqual(zeroPeriod.multipliedBy(3).getParts());

        // Non-zero period multiplied by 0
        expect(Period.zero().getParts()).toEqual(Period.of({years: 1, months: 2, days: 3}).multipliedBy(0).getParts());

        // Non-zero period multiplied by 1
        const period = Period.of({years: 1, months: 2, days: 3});

        expect(period.getParts()).toEqual(period.multipliedBy(1).getParts());

        // Non-zero period multiplied by scalar different than 1
        const newPeriod = period.multipliedBy(3);

        expect(Period.of({years: 3, months: 6, days: 9}).getParts()).toEqual(newPeriod.getParts());
    });

    it('should fail to be multiplied by a scalar which exceeds the range of valid integers', () => {
        expect(() => Period.of({years: 1, months: 2, days: 3}).multipliedBy(Number.MAX_SAFE_INTEGER))
            .toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with the years and months units normalized, leaving days unit unchanged', () => {
        // Zero period
        const zeroPeriod = Period.zero();

        expect(zeroPeriod.getParts()).toEqual(zeroPeriod.normalized().getParts());

        // Already normalized period
        const normalizedPeriod = Period.of({years: 1, months: 2, days: 3});

        expect(normalizedPeriod.getParts()).toEqual(normalizedPeriod.normalized().getParts());

        // Not normalized period
        const period = Period.of({years: 11, months: 22, days: 33});

        expect(Period.of({years: 12, months: 10, days: 33}).getParts()).toEqual(period.normalized().getParts());
    });

    it('can calculate the total number of years', () => {
        const period = Period.of({years: 11, months: 22, days: 33});

        expect(period.toYears()).toEqual(12);
    });

    it('can calculate the total number of months', () => {
        const period = Period.of({years: 11, months: 22, days: 33});

        expect(period.toMonths()).toEqual(11 * 12 + 22);
    });

    it('can calculate the normalized years part', () => {
        const period = Period.of({years: 11, months: 22, days: 33});

        expect(period.toYearsPart()).toEqual(12);
    });

    it('can calculate the normalized months part', () => {
        const period = Period.of({years: 11, months: 22, days: 33});

        expect(period.toMonthsPart()).toEqual(22 % 12);
    });

    it('can calculate the normalized days part', () => {
        const period = Period.of({years: 11, months: 22, days: 33});

        expect(period.toDaysPart()).toEqual(33);
    });

    it('can be serialized to a string in the ISO-8601 format', () => {
        expect('P0D').toEqual(Period.zero().toString());
        expect('P1Y').toEqual(Period.of({years: 1}).toString());
        expect('P1M').toEqual(Period.of({months: 1}).toString());
        expect('P1D').toEqual(Period.of({days: 1}).toString());
        expect('P1Y2M3D').toEqual(Period.of({years: 1, months: 2, days: 3}).toString());
    });
});
