import type {Clock} from '../clock';
import {Instant} from '../instant';
import {TimeZone} from '../timeZone';

/**
 * A clock that uses the system to obtain the current time.
 */
export class SystemClock implements Clock {
    private static UTC_CLOCK?: SystemClock;

    public static get UTC(): SystemClock {
        SystemClock.UTC_CLOCK ??= new SystemClock(TimeZone.UTC);

        return SystemClock.UTC_CLOCK;
    }

    private readonly zone: TimeZone;

    private constructor(zone: TimeZone) {
        this.zone = zone;
    }

    public static of(zone: TimeZone): SystemClock {
        return new this(zone);
    }

    public getZone(): TimeZone {
        return this.zone;
    }

    public getInstant(): Instant {
        return Instant.ofEpochMilli(Date.now());
    }

    public equals(other: Clock): other is this {
        return other === this || (other instanceof SystemClock && other.zone.equals(this.zone));
    }
}
