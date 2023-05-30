import {Clock} from '../clock';
import {Instant} from '../instant';
import {TimeZone} from '../timeZone';

/**
 * A clock that always returns the same instant.
 */
export class FixedClock implements Clock {
    private readonly instant: Instant;

    private readonly zone: TimeZone;

    private constructor(instant: Instant, zone: TimeZone) {
        this.instant = instant;
        this.zone = zone;
    }

    public static of(instant: Instant, zone: TimeZone): FixedClock {
        return new this(instant, zone);
    }

    public getZone(): TimeZone {
        return this.zone;
    }

    public getInstant(): Instant {
        return this.instant;
    }

    public equals(other: Clock): other is this {
        return other === this || (
            other instanceof FixedClock
            && this.instant.equals(other.instant)
            && this.zone.equals(other.zone)
        );
    }
}
