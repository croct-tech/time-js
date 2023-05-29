import {Instant, TimeZone} from '../../src';
import {FixedClock} from '../../src/clock/fixedClock';

describe('A fixed clock', () => {
    it('can be created from a given instant and time-zone ID', () => {
        const instant = Instant.EPOCH;
        const zone = TimeZone.UTC;

        const clock = FixedClock.of(instant, zone);

        expect(clock.getInstant()).toStrictEqual(instant);
        expect(clock.getZone()).toStrictEqual(zone);
    });

    it('provides the current instant, which is always the same', () => {
        const instant = Instant.EPOCH;
        const zone = TimeZone.UTC;

        const clock = FixedClock.of(instant, zone);

        expect(clock.getInstant()).toStrictEqual(instant);
    });

    it('provides the time-zone to convert the instant to a date-time', () => {
        const zone = TimeZone.UTC;
        const clock = FixedClock.of(Instant.EPOCH, zone);

        expect(clock.getZone()).toStrictEqual(zone);
    });

    it('can determine whether it is logically equal to another clock.', () => {
        const clock = FixedClock.of(Instant.EPOCH, TimeZone.UTC);

        // FixedClock is always equal to itself
        expect(clock.equals(clock)).toBe(true);

        // FixedClock logically equal
        expect(clock.equals(FixedClock.of(Instant.EPOCH, TimeZone.UTC))).toBe(true);

        // FixedClock with different instant
        expect(clock.equals(FixedClock.of(Instant.EPOCH.plusSeconds(1), TimeZone.UTC))).toBe(false);

        // FixedClock with different time-zone ID
        expect(clock.equals(FixedClock.of(Instant.EPOCH, TimeZone.of('Europe/Paris')))).toBe(false);
    });
});
