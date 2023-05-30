import {Clock} from './clock';
import {SystemClock} from './clock/systemClock';

export namespace DefaultClockProvider {
    let clock: Clock | null = null;

    export function getClock(): Clock {
        if (clock === null) {
            clock = SystemClock.UTC;
        }

        return clock;
    }

    export function setClock(newClock: Clock): void {
        clock = newClock;
    }
}
