import {TimeZone} from '../../src';
import {SystemClock} from '../../src/clock/systemClock';

describe('A system clock', () => {
    it('can be created in a given time-zone', () => {
        const clock = SystemClock.of(TimeZone.UTC);

        expect(clock.getZone()).toStrictEqual(TimeZone.UTC);
    });

    it('provides the current instant based on the current system time', () => {
        const instant = SystemClock.of(TimeZone.UTC).getInstant();

        expect(instant.toEpochMillis()).toBeCloseTo(Date.now(), -2);
    });

    it('provides the time-zone to convert the instant to a date-time', () => {
        const clock = SystemClock.UTC;

        expect(clock.getZone()).toStrictEqual(TimeZone.UTC);
    });

    it('can determine whether it is logically equal to another clock.', () => {
        const clock = SystemClock.of(TimeZone.UTC);

        // SystemClock is always equal to itself
        expect(clock.equals(clock)).toBe(true);

        // SystemClock with different time-zone ID
        expect(clock.equals(SystemClock.of(TimeZone.of('Europe/Paris')))).toBe(false);

        // SystemClock logically equal
        expect(clock.equals(SystemClock.of(TimeZone.UTC))).toBe(true);
    });
});
