import {FixedClock} from '../../src/clock/fixedClock';
import {Instant, TimeZone} from '../../src';
import {OffsetClock} from '../../src/clock/offsetClock';

describe('An offset clock', () => {
    it('can be create with an offset relative to a given instant', () => {
        const baseClock = FixedClock.of(Instant.EPOCH, TimeZone.UTC);
        const clock = OffsetClock.jump(baseClock, Instant.ofEpochSecond(9));

        expect(clock.getInstant()).toStrictEqual(Instant.ofEpochSecond(9));
        expect(clock.getZone()).toStrictEqual(TimeZone.UTC);
    });

    it('can be created with a given offset', () => {
        const baseClock = FixedClock.of(Instant.EPOCH, TimeZone.UTC);
        const clock = OffsetClock.of(baseClock, {seconds: 9, nanos: 0});

        expect(clock.getInstant()).toStrictEqual(Instant.ofEpochSecond(9));
        expect(clock.getZone()).toStrictEqual(TimeZone.UTC);
    });

    it('provides the current instant offset b a fixed amount of time', () => {
        const baseClock = FixedClock.of(Instant.EPOCH, TimeZone.UTC);
        const clock = OffsetClock.of(baseClock, {seconds: 9, nanos: 0});

        expect(clock.getInstant()).toStrictEqual(Instant.ofEpochSecond(9));
    });

    it('provides the time-zone to convert the instant to a date-time', () => {
        const baseClock = FixedClock.of(Instant.EPOCH, TimeZone.UTC);
        const clock = OffsetClock.of(baseClock, {seconds: 9, nanos: 0});

        expect(clock.getZone()).toStrictEqual(TimeZone.UTC);
    });

    it('can determine whether it is logically equal to another clock', () => {
        const baseClock = FixedClock.of(Instant.EPOCH, TimeZone.UTC);
        const clock = OffsetClock.of(baseClock, {seconds: 9, nanos: 0});

        // OffsetClock is always equal to itself
        expect(clock.equals(clock)).toBe(true);

        // OffsetClock with different instant
        expect(clock.equals(OffsetClock.of(baseClock, {seconds: 1, nanos: 0}))).toBe(false);

        // OffsetClock with different time-zone ID
        const otherBaseClock = FixedClock.of(Instant.EPOCH, TimeZone.of('Europe/Paris'));

        expect(clock.equals(OffsetClock.of(otherBaseClock, {seconds: 9, nanos: 0}))).toBe(false);

        // OffsetClock logically equal
        expect(clock.equals(OffsetClock.of(baseClock, {seconds: 9, nanos: 0}))).toBe(true);
    });
});
