import {Instant, TimeZone} from '../../src';
import {FixedClock} from '../../src/clock/fixedClock';
import {TickClock} from '../../src/clock/tickClock';

describe('A clock with adjustable tick duration', () => {
    it('can be created with a tick duration in milliseconds', () => {
        const baseClock = FixedClock.of(Instant.ofEpochSecond(123, 123456789), TimeZone.UTC);

        const clock = TickClock.ofMillis(baseClock);

        // Base clock is at 1970-01-01T00:02:03.123456789Z and tick clock is at 1970-01-01T00:02:03.123Z
        expect(clock.getInstant()).toStrictEqual(Instant.ofEpochSecond(123, 123000000));
        expect(clock.getZone()).toStrictEqual(TimeZone.UTC);
    });

    it('can be created with tick duration in seconds', () => {
        const baseClock = FixedClock.of(Instant.ofEpochSecond(123, 123456789), TimeZone.UTC);
        const clock = TickClock.ofSeconds(baseClock);

        // Base clock is at 1970-01-01T00:02:03.123456789Z and tick clock is at 1970-01-01T00:02:03Z
        expect(clock.getInstant()).toStrictEqual(Instant.ofEpochSecond(123));
        expect(clock.getZone()).toStrictEqual(TimeZone.UTC);
    });

    it('can be created with tick duration in minutes', () => {
        const baseClock = FixedClock.of(Instant.ofEpochSecond(123, 123456789), TimeZone.UTC);
        const clock = TickClock.ofMinutes(baseClock);

        // Base clock is at 1970-01-01T00:02:03.123456789Z and tick clock is at 1970-01-01T00:02:00Z
        expect(clock.getInstant()).toStrictEqual(Instant.ofEpochSecond(120));
        expect(clock.getZone()).toStrictEqual(TimeZone.UTC);
    });

    it('can be created with sensible tick durations', () => {
        const baseClock = FixedClock.of(Instant.ofEpochSecond(123, 123456789), TimeZone.UTC);
        const clock = TickClock.of(baseClock, 100000000);

        // Base clock is at 1970-01-01T00:02:03.123456789Z and tick clock is at 1970-01-01T00:02:03.100Z
        expect(Instant.ofEpochSecond(123, 100000000)).toStrictEqual(clock.getInstant());
        expect(clock.getZone()).toStrictEqual(TimeZone.UTC);
    });

    it('provides the time-zone to convert the instant to a date-time', () => {
        const baseClock = FixedClock.of(Instant.ofEpochSecond(123, 123456789), TimeZone.UTC);
        const clock = TickClock.of(baseClock, 1);

        expect(clock.getZone()).toStrictEqual(TimeZone.UTC);
    });

    it.each(Object.entries({
        '3 nanoseconds': 3,
        '6 nanoseconds': 6,
        '7 nanoseconds': 7,
        '9 nanoseconds': 9,
        '11 nanoseconds': 11,
        '19 nanoseconds': 19,
        '21 nanoseconds': 21,
        '24 nanoseconds': 24,
        '26 nanoseconds': 26,
        '3 microseconds in nanoseconds': 3000,
        '6 microseconds in nanoseconds': 6000,
        '7 microseconds in nanoseconds': 7000,
        '9 microseconds in nanoseconds': 9000,
        '11 microseconds in nanoseconds': 11000,
        '19 microseconds in nanoseconds': 19000,
        '21 microseconds in nanoseconds': 21000,
        '24 microseconds in nanoseconds': 24000,
        '26 microseconds in nanoseconds': 26000,
    }))('cannot have a tick duration that divides into one second leaving a remainder', (_, tickDuration) => {
        const baseClock = FixedClock.of(Instant.ofEpochSecond(123, 123456789), TimeZone.UTC);

        expect(() => TickClock.of(baseClock, tickDuration)).toThrow(`Invalid tick duration ${tickDuration}`);
    });

    it('cannot have a tick duration of zero', () => {
        const baseClock = FixedClock.of(Instant.ofEpochSecond(123, 123456789), TimeZone.UTC);

        expect(() => TickClock.of(baseClock, 0))
            .toThrow('Tick duration must be a positive safe integer and larger than 1 nanosecond.');
    });

    it.each(Object.entries({
        '1 nanosecond': {
            tickDuration: 1,
            instant: Instant.ofEpochSecond(123, 123456789),
        },
        '2 nanoseconds': {
            tickDuration: 2,
            instant: Instant.ofEpochSecond(123, 123456788),
        },
        '4 nanoseconds': {
            tickDuration: 4,
            instant: Instant.ofEpochSecond(123, 123456788),
        },
        '5 nanoseconds': {
            tickDuration: 5,
            instant: Instant.ofEpochSecond(123, 123456785),
        },
        '8 nanoseconds': {
            tickDuration: 8,
            instant: Instant.ofEpochSecond(123, 123456784),
        },
        '10 nanoseconds': {
            tickDuration: 10,
            instant: Instant.ofEpochSecond(123, 123456780),
        },
        '20 nanoseconds': {
            tickDuration: 20,
            instant: Instant.ofEpochSecond(123, 123456780),
        },
        '25 nanoseconds': {
            tickDuration: 25,
            instant: Instant.ofEpochSecond(123, 123456775),
        },
        '1 microsecond in nanoseconds': {
            tickDuration: 1000,
            instant: Instant.ofEpochSecond(123, 123456000),
        },
        '2 microseconds in nanoseconds': {
            tickDuration: 2000,
            instant: Instant.ofEpochSecond(123, 123456000),
        },
        '4 microseconds in nanoseconds': {
            tickDuration: 4000,
            instant: Instant.ofEpochSecond(123, 123456000),
        },
        '5 microseconds in nanoseconds': {
            tickDuration: 5000,
            instant: Instant.ofEpochSecond(123, 123455000),
        },
        '8 microseconds in nanoseconds': {
            tickDuration: 8000,
            instant: Instant.ofEpochSecond(123, 123456000),
        },
        '10 microseconds in nanoseconds': {
            tickDuration: 10000,
            instant: Instant.ofEpochSecond(123, 123450000),
        },
        '20 microseconds in nanoseconds': {
            tickDuration: 20000,
            instant: Instant.ofEpochSecond(123, 123440000),
        },
        '25 microseconds in nanoseconds': {
            tickDuration: 25000,
            instant: Instant.ofEpochSecond(123, 123450000),
        },
        '1 millisecond in nanoseconds': {
            tickDuration: 1000000,
            instant: Instant.ofEpochSecond(123, 123000000),
        },
        '2 milliseconds in nanoseconds': {
            tickDuration: 2000000,
            instant: Instant.ofEpochSecond(123, 122000000),
        },
        '3 milliseconds in nanoseconds': {
            tickDuration: 3000000,
            instant: Instant.ofEpochSecond(123, 123000000),
        },
        '4 milliseconds in nanoseconds': {
            tickDuration: 4000000,
            instant: Instant.ofEpochSecond(123, 120000000),
        },
        '5 milliseconds in nanoseconds': {
            tickDuration: 5000000,
            instant: Instant.ofEpochSecond(123, 120000000),
        },
        '1 second in nanoseconds': {
            tickDuration: 1000000000,
            instant: Instant.ofEpochSecond(123),
        },
        '2 seconds in nanoseconds': {
            tickDuration: 2000000000,
            instant: Instant.ofEpochSecond(122),
        },
        '3 seconds in nanoseconds': {
            tickDuration: 3000000000,
            instant: Instant.ofEpochSecond(123),
        },
        '4 seconds in nanoseconds': {
            tickDuration: 4000000000,
            instant: Instant.ofEpochSecond(120),
        },
        '5 seconds in nanoseconds': {
            tickDuration: 5000000000,
            instant: Instant.ofEpochSecond(120),
        },
        '1 minute in nanoseconds': {
            tickDuration: 60000000000,
            instant: Instant.ofEpochSecond(120),
        },
        '2 minutes in nanoseconds': {
            tickDuration: 120000000000,
            instant: Instant.ofEpochSecond(120),
        },
        '3 minutes in nanoseconds': {
            tickDuration: 180000000000,
            instant: Instant.ofEpochSecond(0),
        },
        '4 minutes in nanoseconds': {
            tickDuration: 240000000000,
            instant: Instant.ofEpochSecond(0),
        },
        '5 minutes in nanoseconds': {
            tickDuration: 300000000000,
            instant: Instant.ofEpochSecond(0),
        },
    }))('provides the current instant from another clock truncated to a tick duration', (_, scenario) => {
        const baseClock = FixedClock.of(Instant.ofEpochSecond(123, 123456789), TimeZone.UTC);
        const clock = TickClock.of(baseClock, scenario.tickDuration);

        expect(clock.getInstant()).toEqual(scenario.instant);
    });

    it('can determine whether it is logically equal to another clock', () => {
        const baseClock = FixedClock.of(Instant.ofEpochSecond(123, 123456789), TimeZone.UTC);
        const clock = TickClock.of(baseClock, 1000000000);

        // TickClock is always equal to itself
        expect(clock.equals(clock)).toBe(true);

        // TickClock with different base clock
        const anotherBaseClock = FixedClock.of(Instant.ofEpochSecond(1), TimeZone.UTC);

        expect(clock.equals(TickClock.of(anotherBaseClock, 1000000000))).toBe(false);

        // TickClock with different tick duration
        expect(clock.equals(TickClock.of(baseClock, 2000000000))).toBe(false);

        // TickClock logically equal
        expect(clock.equals(TickClock.of(baseClock, 1000000000))).toBe(true);
    });
});
