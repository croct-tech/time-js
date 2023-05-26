import {Instant, TimeZone} from '../../src';
import {ContextualClock} from '../../src/clock/contextualClock';
import {FixedClock} from '../../src/clock/fixedClock';
import {DefaultClockProvider} from '../../src/defaultClockProvider';

describe('A clock that delegates to the clock set on the context', () => {
    const defaultClockInstant = Instant.ofEpochMilli(123456);

    DefaultClockProvider.setClock(FixedClock.of(defaultClockInstant, TimeZone.UTC));

    it('should default to the global clock provider', () => {
        const clock = new ContextualClock();

        expect(clock.getInstant()).toStrictEqual(defaultClockInstant);
        expect(clock.getZone()).toStrictEqual(TimeZone.UTC);
    });

    it('should proxy to the clock of the context', () => {
        const clock = new ContextualClock();

        const contextInstant = Instant.ofEpochMilli(987654);
        const contextZone = TimeZone.of('Europe/Berlin');
        const contextClock = FixedClock.of(contextInstant, contextZone);

        clock.runWithClock(contextClock, () => {
            expect(clock.getInstant()).toStrictEqual(contextInstant);
            expect(clock.getZone()).toStrictEqual(contextZone);
        });

        expect(clock.getInstant()).toStrictEqual(defaultClockInstant);
        expect(clock.getZone()).toStrictEqual(TimeZone.UTC);
    });

    it('should only be equal to itself', () => {
        const clockOne = new ContextualClock();
        const clockTwo = new ContextualClock();

        expect(clockOne.equals(clockOne)).toBe(true);
        expect(clockOne.equals(clockTwo)).toBe(false);
    });
});
