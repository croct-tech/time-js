import type {Clock} from '../clock';
import type {Instant} from '../instant';
import type {TimeZone} from '../timeZone';

type Offset = {
    seconds: number,
    nanos: number,
};

/**
 * A clock that is offset by a fixed amount of time.
 */
export class OffsetClock implements Clock {
    private readonly baseClock: Clock;

    private readonly offset: Offset;

    private constructor(baseClock: Clock, offset: Offset) {
        this.baseClock = baseClock;
        this.offset = offset;
    }

    public static of(baseClock: Clock, offset: Offset): OffsetClock {
        return new this(baseClock, offset);
    }

    public static jump(baseClock: Clock, instant: Instant): OffsetClock {
        const baseInstant = baseClock.getInstant();

        return this.of(baseClock, {
            seconds: instant.getSeconds() - baseInstant.getSeconds(),
            nanos: instant.getNano() - baseInstant.getNano(),
        });
    }

    public getZone(): TimeZone {
        return this.baseClock.getZone();
    }

    public getInstant(): Instant {
        const instant = this.baseClock.getInstant();

        return instant.plusSeconds(this.offset.seconds).plusNanos(this.offset.nanos);
    }

    public equals(other: Clock): other is this {
        return this === other || (
            other instanceof OffsetClock
            && this.baseClock.equals(other.baseClock)
            && this.offset.seconds === other.offset.seconds
            && this.offset.nanos === other.offset.nanos
        );
    }
}
