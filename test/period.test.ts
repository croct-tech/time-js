import {Period} from '../src';

describe('A ISO date-based amount of time', () => {
    it('can be created from a number of years, months and days', () => {
        const period = Period.of(1, 2, 3);

        expect(period.getYears()).toBe(1);
        expect(period.getMonths()).toBe(2);
        expect(period.getDays()).toBe(3);
    });

    it('can be created with zero years, months and days', () => {
        const period = Period.of(0, 0, 0);

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

        expect(period.toString()).toStrictEqual(Period.of(1, 0, 0).toString());
    });

    it('can be created from a number of months', () => {
        const period = Period.ofMonths(1);

        expect(period.toString()).toStrictEqual(Period.of(0, 1, 0).toString());
    });

    it('can be created from a number of weeks', () => {
        const period = Period.ofWeeks(1);

        expect(period.toString()).toStrictEqual(Period.of(0, 0, 7).toString());
    });

    it('can be created from a number of days', () => {
        const period = Period.ofDays(1);

        expect(period.toString()).toStrictEqual(Period.of(0, 0, 1).toString());
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
        ['P1Y2M3W4D', Period.of(1, 2, 3 * 7 + 4)],
        ['-P1Y2M3W4D', Period.of(-1, -2, -(3 * 7) - 4)],
        ['-P-1Y-2M-3W-4D', Period.of(1, 2, 3 * 7 + 4)],
    ])('can parse a ISO-8601 period string %s', (value, expected) => {
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
    ])('cannot parse a malformed period string %s', value => {
        expect(() => Period.parse(value)).toThrow(`Unrecognized ISO-8601 period string "${value}".`);
    });

    it('cannot parse a period that overflows integer limits', () => {
        expect(() => Period.parse('P123456789123456789123456789D'))
            .toThrow('The result overflows the range of safe integers.');
    });

    it('can determine whether the period is zero', () => {
        expect(Period.zero().isZero()).toBe(true);
        expect(Period.of(0, 0, 1).isZero()).toBe(false);
        expect(Period.of(0, 1, 0).isZero()).toBe(false);
        expect(Period.of(1, 0, 0).isZero()).toBe(false);
    });

    it('can determine whether the years, months and days are negative', () => {
        expect(Period.zero().isNegative()).toBe(false);
        expect(Period.of(1, 2, 3).isNegative()).toBe(false);
        expect(Period.of(-1, 2, 3).isNegative()).toBe(true);
        expect(Period.of(1, -2, 3).isNegative()).toBe(true);
        expect(Period.of(1, 2, -3).isNegative()).toBe(true);
    });

    it('should return the amount of years', () => {
        expect(Period.of(1, 2, 3).getYears()).toBe(1);
    });

    it('should return the amount of months', () => {
        expect(Period.of(1, 2, 3).getMonths()).toBe(2);
    });

    it('should return the amount of days', () => {
        expect(Period.of(1, 2, 3).getDays()).toBe(3);
    });

    it('can determine whether it is logically equal to another period', () => {
        const period = Period.of(1, 2, 3);

        // Same period instance
        expect(period.equals(period)).toBe(true);

        // Different year
        expect(period.equals(Period.of(0, 2, 3))).toBe(false);

        // Different month
        expect(period.equals(Period.of(1, 0, 3))).toBe(false);

        // Different day
        expect(period.equals(Period.of(1, 2, 0))).toBe(false);

        // Other period logically equal
        expect(period.equals(Period.of(1, 2, 3))).toBe(true);
    });

    it('can create a copy with a new amount of years', () => {
        const period = Period.of(1, 2, 3);
        const newPeriod = period.withYears(0);

        expect(newPeriod.toString()).toStrictEqual(Period.of(0, 2, 3).toString());
    });

    it('should return the period itself building a period with the same amount of years', () => {
        const period = Period.of(1, 2, 3);
        const newPeriod = period.withYears(1);

        expect(newPeriod.toString()).toStrictEqual(period.toString());
    });

    it('can create a copy with a new amount of months', () => {
        const period = Period.of(1, 2, 3);
        const newPeriod = period.withMonths(0);

        expect(newPeriod.toString()).toStrictEqual(Period.of(1, 0, 3).toString());
    });

    it('should return the period itself building a period with the same amount of months', () => {
        const period = Period.of(1, 2, 3);
        const newPeriod = period.withMonths(2);

        expect(newPeriod.toString()).toStrictEqual(period.toString());
    });

    it('can create a copy with a new amount of days', () => {
        const period = Period.of(1, 2, 3);
        const newPeriod = period.withDays(0);

        expect(newPeriod.toString()).toStrictEqual(Period.of(1, 2, 0).toString());
    });

    it('should return the period itself building a period with the same amount of days', () => {
        const period = Period.of(1, 2, 3);
        const newPeriod = period.withDays(3);

        expect(newPeriod.toString()).toStrictEqual(period.toString());
    });

    it('can create a copy with another period added', () => {
        const period = Period.of(1, 2, 3);
        const secondPeriod = period.plusPeriod(Period.of(4, 5, 6));

        expect(secondPeriod.toString()).toStrictEqual(Period.of(5, 7, 9).toString());
    });

    it('can create a copy with another period subtracted', () => {
        const period = Period.of(1, 2, 3);
        const secondPeriod = period.minusPeriod(Period.of(4, 5, 6));

        expect(secondPeriod.toString()).toStrictEqual(Period.of(-3, -3, -3).toString());
    });

    it('can create a copy with a period in years added', () => {
        const period = Period.of(1, 2, 3);

        expect(Period.of(-2, 2, 3).toString()).toStrictEqual(period.plusYears(-3).toString());
        expect(Period.of(-1, 2, 3).toString()).toStrictEqual(period.plusYears(-2).toString());
        expect(Period.of(0, 2, 3).toString()).toStrictEqual(period.plusYears(-1).toString());
        expect(Period.of(1, 2, 3).toString()).toStrictEqual(period.plusYears(0).toString());
        expect(Period.of(2, 2, 3).toString()).toStrictEqual(period.plusYears(1).toString());
        expect(Period.of(3, 2, 3).toString()).toStrictEqual(period.plusYears(2).toString());
        expect(Period.of(4, 2, 3).toString()).toStrictEqual(period.plusYears(3).toString());
    });

    it('should fail to add an amount of years that exceeds the safe integer limit', () => {
        expect(() => Period.of(1, 2, 3).plusYears(Number.MAX_SAFE_INTEGER))
            .toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with period in years subtracted', () => {
        const period = Period.of(1, 2, 3);

        expect(Period.of(-2, 2, 3).toString()).toStrictEqual(period.minusYears(3).toString());
        expect(Period.of(-1, 2, 3).toString()).toStrictEqual(period.minusYears(2).toString());
        expect(Period.of(0, 2, 3).toString()).toStrictEqual(period.minusYears(1).toString());
        expect(Period.of(1, 2, 3).toString()).toStrictEqual(period.minusYears(0).toString());
        expect(Period.of(2, 2, 3).toString()).toStrictEqual(period.minusYears(-1).toString());
        expect(Period.of(3, 2, 3).toString()).toStrictEqual(period.minusYears(-2).toString());
        expect(Period.of(4, 2, 3).toString()).toStrictEqual(period.minusYears(-3).toString());
    });

    it('should fail to subtract an amount of years that exceeds the safe integer limit', () => {
        expect(() => Period.of(1, 2, 3).minusYears(Number.MAX_SAFE_INTEGER + 3))
            .toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with a period in months added', () => {
        const period = Period.of(1, 2, 3);

        expect(Period.of(1, -10, 3).toString()).toStrictEqual(period.plusMonths(-12).toString());
        expect(Period.of(1, -1, 3).toString()).toStrictEqual(period.plusMonths(-3).toString());
        expect(Period.of(1, 0, 3).toString()).toStrictEqual(period.plusMonths(-2).toString());
        expect(Period.of(1, 1, 3).toString()).toStrictEqual(period.plusMonths(-1).toString());
        expect(Period.of(1, 2, 3).toString()).toStrictEqual(period.plusMonths(0).toString());
        expect(Period.of(1, 3, 3).toString()).toStrictEqual(period.plusMonths(1).toString());
        expect(Period.of(1, 4, 3).toString()).toStrictEqual(period.plusMonths(2).toString());
        expect(Period.of(1, 5, 3).toString()).toStrictEqual(period.plusMonths(3).toString());
        expect(Period.of(1, 14, 3).toString()).toStrictEqual(period.plusMonths(12).toString());
    });

    it('should fail to add an amount of months that exceeds the safe integer limit', () => {
        expect(() => Period.of(1, 2, 3).plusMonths(Number.MAX_SAFE_INTEGER))
            .toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with period in months subtracted', () => {
        const period = Period.of(1, 2, 3);

        expect(Period.of(1, -10, 3).toString()).toStrictEqual(period.minusMonths(12).toString());
        expect(Period.of(1, -1, 3).toString()).toStrictEqual(period.minusMonths(3).toString());
        expect(Period.of(1, 0, 3).toString()).toStrictEqual(period.minusMonths(2).toString());
        expect(Period.of(1, 1, 3).toString()).toStrictEqual(period.minusMonths(1).toString());
        expect(Period.of(1, 2, 3).toString()).toStrictEqual(period.minusMonths(0).toString());
        expect(Period.of(1, 3, 3).toString()).toStrictEqual(period.minusMonths(-1).toString());
        expect(Period.of(1, 4, 3).toString()).toStrictEqual(period.minusMonths(-2).toString());
        expect(Period.of(1, 5, 3).toString()).toStrictEqual(period.minusMonths(-3).toString());
        expect(Period.of(1, 14, 3).toString()).toStrictEqual(period.minusMonths(-12).toString());
    });

    it('should fail to subtract an amount of months that exceeds the safe integer limit', () => {
        expect(() => Period.of(1, 2, 3).minusMonths(Number.MAX_SAFE_INTEGER + 3))
            .toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with a period in weeks added', () => {
        const period = Period.of(1, 2, 3);

        expect(Period.of(1, 2, -18).toString()).toStrictEqual(period.plusWeeks(-3).toString());
        expect(Period.of(1, 2, -11).toString()).toStrictEqual(period.plusWeeks(-2).toString());
        expect(Period.of(1, 2, -4).toString()).toStrictEqual(period.plusWeeks(-1).toString());
        expect(Period.of(1, 2, 3).toString()).toStrictEqual(period.plusWeeks(0).toString());
        expect(Period.of(1, 2, 10).toString()).toStrictEqual(period.plusWeeks(1).toString());
        expect(Period.of(1, 2, 17).toString()).toStrictEqual(period.plusWeeks(2).toString());
        expect(Period.of(1, 2, 24).toString()).toStrictEqual(period.plusWeeks(3).toString());
    });

    it('should fail to add an amount of weeks that exceeds the safe integer limit', () => {
        expect(() => Period.of(1, 2, 3).plusWeeks(Number.MAX_SAFE_INTEGER))
            .toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with a period in weeks subtracted', () => {
        const period = Period.of(1, 2, 3);

        expect(Period.of(1, 2, -18).toString()).toStrictEqual(period.minusWeeks(3).toString());
        expect(Period.of(1, 2, -11).toString()).toStrictEqual(period.minusWeeks(2).toString());
        expect(Period.of(1, 2, -4).toString()).toStrictEqual(period.minusWeeks(1).toString());
        expect(Period.of(1, 2, 3).toString()).toStrictEqual(period.minusWeeks(0).toString());
        expect(Period.of(1, 2, 10).toString()).toStrictEqual(period.minusWeeks(-1).toString());
        expect(Period.of(1, 2, 17).toString()).toStrictEqual(period.minusWeeks(-2).toString());
        expect(Period.of(1, 2, 24).toString()).toStrictEqual(period.minusWeeks(-3).toString());
    });

    it('should fail to subtract an amount of weeks that exceeds the safe integer limit', () => {
        expect(() => Period.of(1, 2, 3).minusWeeks(Number.MAX_SAFE_INTEGER))
            .toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with a period in days added', () => {
        const period = Period.of(1, 2, 3);

        expect(Period.of(1, 2, 0).toString()).toStrictEqual(period.plusDays(-3).toString());
        expect(Period.of(1, 2, 1).toString()).toStrictEqual(period.plusDays(-2).toString());
        expect(Period.of(1, 2, 2).toString()).toStrictEqual(period.plusDays(-1).toString());
        expect(Period.of(1, 2, 3).toString()).toStrictEqual(period.plusDays(0).toString());
        expect(Period.of(1, 2, 4).toString()).toStrictEqual(period.plusDays(1).toString());
        expect(Period.of(1, 2, 5).toString()).toStrictEqual(period.plusDays(2).toString());
        expect(Period.of(1, 2, 6).toString()).toStrictEqual(period.plusDays(3).toString());
    });

    it('should fail to add an amount of days that exceeds the safe integer limit', () => {
        expect(() => Period.of(1, 2, 3).plusDays(Number.MAX_SAFE_INTEGER))
            .toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with a period in days subtracted', () => {
        const period = Period.of(1, 2, 3);

        expect(Period.of(1, 2, 0).toString()).toStrictEqual(period.minusDays(3).toString());
        expect(Period.of(1, 2, 1).toString()).toStrictEqual(period.minusDays(2).toString());
        expect(Period.of(1, 2, 2).toString()).toStrictEqual(period.minusDays(1).toString());
        expect(Period.of(1, 2, 3).toString()).toStrictEqual(period.minusDays(0).toString());
        expect(Period.of(1, 2, 4).toString()).toStrictEqual(period.minusDays(-1).toString());
        expect(Period.of(1, 2, 5).toString()).toStrictEqual(period.minusDays(-2).toString());
        expect(Period.of(1, 2, 6).toString()).toStrictEqual(period.minusDays(-3).toString());
    });

    it('should fail to subtract an amount of days that exceeds the safe integer limit', () => {
        expect(() => Period.of(1, 2, 3).minusDays(Number.MAX_SAFE_INTEGER + 4))
            .toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with each unit multiplied by a given scalar', () => {
        // Zero period
        const zeroPeriod = Period.zero();

        expect(zeroPeriod.toString()).toStrictEqual(zeroPeriod.multipliedBy(-2).toString());
        expect(zeroPeriod.toString()).toStrictEqual(zeroPeriod.multipliedBy(-1).toString());
        expect(zeroPeriod.toString()).toStrictEqual(zeroPeriod.multipliedBy(0).toString());
        expect(zeroPeriod.toString()).toStrictEqual(zeroPeriod.multipliedBy(1).toString());
        expect(zeroPeriod.toString()).toStrictEqual(zeroPeriod.multipliedBy(2).toString());
        expect(zeroPeriod.toString()).toStrictEqual(zeroPeriod.multipliedBy(3).toString());

        // Non-zero period multiplied by 0
        expect(Period.zero().toString()).toStrictEqual(Period.of(1, 2, 3).multipliedBy(0).toString());

        // Non-zero period multiplied by 1
        const period = Period.of(1, 2, 3);

        expect(period.toString()).toStrictEqual(period.multipliedBy(1).toString());

        // Non-zero period multiplied by scalar different than 1
        const newPeriod = period.multipliedBy(3);

        expect(Period.of(3, 6, 9).toString()).toStrictEqual(newPeriod.toString());
    });

    it('should fail to be multiplied by a scalar which exceeds the range of valid integers', () => {
        expect(() => Period.of(1, 2, 3).multipliedBy(Number.MAX_SAFE_INTEGER))
            .toThrow('The result overflows the range of safe integers.');
    });

    it('can create a copy with the years and months units normalized, leaving days unit unchanged', () => {
        // Zero period
        const zeroPeriod = Period.zero();

        expect(zeroPeriod.toString()).toStrictEqual(zeroPeriod.normalized().toString());

        // Already normalized period
        const normalizedPeriod = Period.of(1, 2, 3);

        expect(normalizedPeriod.toString()).toStrictEqual(normalizedPeriod.normalized().toString());

        // Not normalized period
        const period = Period.of(11, 22, 33);

        expect(Period.of(12, 10, 33).toString()).toStrictEqual(period.normalized().toString());
    });

    it('can calculate the total number of years', () => {
        const period = Period.of(11, 22, 33);

        expect(period.toYears()).toStrictEqual(12);
    });

    it('can calculate the total number of months', () => {
        const period = Period.of(11, 22, 33);

        expect(period.toMonths()).toStrictEqual(11 * 12 + 22);
    });

    it('can calculate the normalized years part', () => {
        const period = Period.of(11, 22, 33);

        expect(period.toYearsPart()).toStrictEqual(12);
    });

    it('can calculate the normalized months part', () => {
        const period = Period.of(11, 22, 33);

        expect(period.toMonthsPart()).toStrictEqual(22 % 12);
    });

    it('can calculate the normalized days part', () => {
        const period = Period.of(11, 22, 33);

        expect(period.toDaysPart()).toStrictEqual(33);
    });

    it('can be serialized to a string in the ISO-8601 format', () => {
        expect('P0D').toStrictEqual(Period.zero().toString());
        expect('P1Y').toStrictEqual(Period.of(1, 0, 0).toString());
        expect('P1M').toStrictEqual(Period.of(0, 1, 0).toString());
        expect('P1D').toStrictEqual(Period.of(0, 0, 1).toString());
        expect('P1Y2M3D').toStrictEqual(Period.of(1, 2, 3).toString());
    });
});
