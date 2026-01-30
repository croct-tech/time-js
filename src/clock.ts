import type {Instant} from './instant';
import type {TimeZone} from './timeZone';

export interface Clock {
    getZone(): TimeZone;

    getInstant(): Instant;

    equals(other: Clock): other is this;
}
