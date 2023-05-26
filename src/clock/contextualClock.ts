import {AsyncLocalStorage} from 'async_hooks';
import {Clock} from '../clock';
import {DefaultClockProvider} from '../defaultClockProvider';
import {Instant} from '../instant';
import {TimeZone} from '../timeZone';

/**
 * A clock that delegate to different clocks at runtime depending on the caller's context.
 */
export class ContextualClock implements Clock {
    private readonly clockStore = new AsyncLocalStorage<Clock>();

    public get clock(): Clock {
        return this.clockStore.getStore() ?? DefaultClockProvider.getClock();
    }

    public runWithClock<A extends any[], R>(clock: Clock, targetFunction: (...args: A) => R, ...args: A): R {
        return this.clockStore.run(clock, targetFunction, ...args);
    }

    public getZone(): TimeZone {
        return this.clock.getZone();
    }

    public getInstant(): Instant {
        return this.clock.getInstant();
    }

    public equals(other: Clock): other is this {
        return other === this;
    }
}
