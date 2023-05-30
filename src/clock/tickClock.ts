import {Clock} from '../clock';
import {Instant} from '../instant';
import {LocalTime} from '../localTime';
import {floorMod, intDiv} from '../math';
import {TimeZone} from '../timeZone';

/**
 * A clock with adjustable tick duration.
 */
export class TickClock implements Clock {
    private readonly referenceClock: Clock;

    private readonly tickNanos: number;

    private constructor(referenceClock: Clock, tickNanos: number) {
        this.referenceClock = referenceClock;
        this.tickNanos = tickNanos;
    }

    public static of(referenceClock: Clock, tickNanos: number): TickClock {
        if (!Number.isSafeInteger(tickNanos) || tickNanos <= 0) {
            throw new Error('Tick duration must be a positive safe integer and larger than 1 nanosecond.');
        }

        if (tickNanos % LocalTime.NANOS_PER_MILLI !== 0 && LocalTime.NANOS_PER_SECOND % tickNanos !== 0) {
            throw new Error(`Invalid tick duration ${tickNanos}ns.`);
        }

        return new this(referenceClock, tickNanos);
    }

    public static ofMillis(baseClock: Clock): TickClock {
        return this.of(baseClock, LocalTime.NANOS_PER_MILLI);
    }

    public static ofSeconds(baseClock: Clock): TickClock {
        return this.of(baseClock, LocalTime.NANOS_PER_SECOND);
    }

    public static ofMinutes(baseClock: Clock): TickClock {
        return this.of(baseClock, LocalTime.NANOS_PER_MINUTE);
    }

    public getZone(): TimeZone {
        return this.referenceClock.getZone();
    }

    public getInstant(): Instant {
        const instant = this.referenceClock.getInstant();

        if ((this.tickNanos % LocalTime.NANOS_PER_MILLI) === 0) {
            const tickMillis = intDiv(this.tickNanos, LocalTime.NANOS_PER_MILLI);
            const epochMilli = instant.toEpochMillis();

            return Instant.ofEpochMilli(
                epochMilli - floorMod(epochMilli, tickMillis),
            );
        }

        const nano = instant.getNano();
        const adjustment = floorMod(nano, this.tickNanos);

        return instant.minusNanos(adjustment);
    }

    public equals(other: Clock): other is this {
        return other === this || (
            other instanceof TickClock
            && this.referenceClock.equals(other.referenceClock)
            && this.tickNanos === other.tickNanos
        );
    }
}
