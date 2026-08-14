import {Instant} from './instant';
import {LocalTime} from './localTime';
import {intDiv} from './math';
import {ZoneRules} from './zoneRules';

/**
 * A time-zone ID, such as Europe/Paris.
 *
 * There are two distinct kinds of time zone, both modelled by this class:
 *
 * - Region-based IDs, such as `Europe/Paris`, whose offset from UTC/Greenwich
 *   varies over time according to the rules of the region.
 * - Offset-based IDs, such as `-03:00`, which are fixed for all points in time.
 */
export abstract class TimeZone {
    private static SUPPORTED_TIMEZONE_IDS: ReadonlySet<string>;

    /**
     * The UTC time zone.
     */
    private static UTC_ZONE: TimeZone;

    /**
     * Returns the UTC time zone.
     */
    public static get UTC(): TimeZone {
        TimeZone.UTC_ZONE ??= new ZoneRegion('UTC', ZoneRules.ofFixed(ZoneOffset.UTC));

        return TimeZone.UTC_ZONE;
    }

    /**
     * Returns the list of supported time zones.
     */
    public static getTimesZoneIds(): ReadonlySet<string> {
        if (TimeZone.SUPPORTED_TIMEZONE_IDS === undefined) {
            TimeZone.SUPPORTED_TIMEZONE_IDS = new Set([
                // Non-continental time zones
                // See https://github.com/tc39/ecma402/issues/778
                'UTC',
                'CET',
                'CST6CDT',
                'EET',
                'EST',
                'EST5EDT',
                'Etc/GMT+1',
                'Etc/GMT+10',
                'Etc/GMT+11',
                'Etc/GMT+12',
                'Etc/GMT+2',
                'Etc/GMT+3',
                'Etc/GMT+4',
                'Etc/GMT+5',
                'Etc/GMT+6',
                'Etc/GMT+7',
                'Etc/GMT+8',
                'Etc/GMT+9',
                'Etc/GMT-1',
                'Etc/GMT-10',
                'Etc/GMT-11',
                'Etc/GMT-12',
                'Etc/GMT-13',
                'Etc/GMT-14',
                'Etc/GMT-2',
                'Etc/GMT-3',
                'Etc/GMT-4',
                'Etc/GMT-5',
                'Etc/GMT-6',
                'Etc/GMT-7',
                'Etc/GMT-8',
                'Etc/GMT-9',
                'HST',
                'MET',
                'MST',
                'MST7MDT',
                'PST8PDT',
                'WET',
                ...Intl.supportedValuesOf('timeZone'),
            ]);
        }

        return TimeZone.SUPPORTED_TIMEZONE_IDS;
    }

    /**
     * Creates a time zone from its ID.
     *
     * IDs of a single character, or starting with `+` or `-`, are parsed as fixed
     * offsets. Any other ID is parsed as a region.
     *
     * @param id The time zone ID.
     *
     * @throws {Error} If the time zone ID is not supported.
     */
    public static of(id: string): TimeZone {
        if (id.length <= 1 || id.startsWith('+') || id.startsWith('-')) {
            return ZoneOffset.of(id);
        }

        return ZoneRegion.of(id);
    }

    /**
     * Creates a time zone from a prefix and a fixed offset.
     *
     * @param prefix The prefix, which must be `GMT`, `UTC`, `UT` or empty.
     * @param offset The fixed offset from UTC/Greenwich.
     *
     * @throws {Error} If the prefix is not supported.
     */
    public static ofOffset(prefix: string, offset: ZoneOffset): TimeZone {
        if (prefix === '') {
            return offset;
        }

        return ZoneRegion.ofOffset(prefix, offset);
    }

    /**
     * Returns the time zone ID.
     */
    public abstract getId(): string;

    /**
     * Returns the rules describing how the offset of this time zone varies over time.
     */
    public abstract getRules(): ZoneRules;

    /**
     * Returns the equivalent fixed offset if this time zone never varies, or this
     * time zone otherwise.
     */
    public normalized(): TimeZone {
        const rules = this.getRules();

        if (rules.isFixedOffset()) {
            return rules.getOffset(Instant.EPOCH);
        }

        return this;
    }

    /**
     * Returns the string representation of the time zone.
     */
    public toString(): string {
        return this.getId();
    }

    /**
     * Checks if the time zone is equal to another time zone.
     */
    public equals(other: TimeZone): boolean {
        return this.constructor === other.constructor && this.getId() === other.getId();
    }

    /**
     * Returns the JSON representation of the time zone.
     */
    public toJSON(): string {
        return this.toString();
    }
}

/**
 * A geographical region with a set of rules for finding the offset from UTC/Greenwich.
 *
 * @internal
 */
class ZoneRegion extends TimeZone {
    /**
     * The prefixes that can be combined with a fixed offset to form a region ID.
     */
    private static PREFIXES = ['GMT', 'UTC', 'UT'];

    /**
     * The time zone ID.
     */
    private readonly id: string;

    /**
     * The rules of the time zone, lazily resolved for region-based IDs.
     */
    private rules?: ZoneRules;

    /**
     * Initializes a region-based time zone.
     */
    public constructor(id: string, rules?: ZoneRules) {
        super();

        this.id = id;
        this.rules = rules;
    }

    /**
     * Creates a region-based time zone from its ID.
     *
     * @param id The time zone ID.
     *
     * @throws {Error} If the time zone ID is not supported.
     */
    public static of(id: string): ZoneRegion {
        const prefix = ZoneRegion.getPrefix(id);

        if (prefix !== null) {
            const suffix = id.slice(prefix.length);
            const offset = suffix === '' ? ZoneOffset.UTC : ZoneOffset.of(suffix);

            return ZoneRegion.ofPrefix(prefix, offset);
        }

        if (!TimeZone.getTimesZoneIds().has(id)) {
            throw new Error(`The timezone ${id} is not supported.`);
        }

        return new ZoneRegion(id);
    }

    /**
     * Creates a region-based time zone from a prefix and a fixed offset.
     *
     * @param prefix The prefix, which must be `GMT`, `UTC` or `UT`.
     * @param offset The fixed offset from UTC/Greenwich.
     *
     * @throws {Error} If the prefix is not supported.
     */
    public static ofOffset(prefix: string, offset: ZoneOffset): ZoneRegion {
        if (!ZoneRegion.PREFIXES.includes(prefix)) {
            throw new Error(`The prefix must be GMT, UTC or UT, but got "${prefix}".`);
        }

        return ZoneRegion.ofPrefix(prefix, offset);
    }

    private static ofPrefix(prefix: string, offset: ZoneOffset): ZoneRegion {
        const id = offset.getTotalSeconds() === 0 ? prefix : prefix + offset.toString();

        return new ZoneRegion(id, ZoneRules.ofFixed(offset));
    }

    /**
     * Returns the offset prefix of the given ID, or `null` if it has none.
     *
     * The ID `GMT0` is treated as a prefix on its own for compatibility with
     * the time-zone database.
     */
    private static getPrefix(id: string): string | null {
        if (id === 'GMT0') {
            return id;
        }

        return ZoneRegion.PREFIXES.find(
            prefix => id === prefix || id.startsWith(`${prefix}+`) || id.startsWith(`${prefix}-`),
        ) ?? null;
    }

    public getId(): string {
        return this.id;
    }

    public getRules(): ZoneRules {
        this.rules ??= ZoneRules.ofRegion(this.id);

        return this.rules;
    }
}

/**
 * A time-zone offset from UTC/Greenwich, such as `-03:00`.
 */
export class ZoneOffset extends TimeZone {
    /**
     * The maximum offset in seconds, corresponding to `+18:00`.
     */
    public static MAX_SECONDS = 18 * LocalTime.SECONDS_PER_HOUR;

    /**
     * The minimum offset in seconds, corresponding to `-18:00`.
     */
    public static MIN_SECONDS = -ZoneOffset.MAX_SECONDS;

    /**
     * A regular expression that matches offset IDs.
     *
     * Both `+01:30` and `+0130` forms are accepted, as well as the
     * single-digit hour form `+1`.
     */
    // eslint-disable-next-line @stylistic/max-len -- Regex literal cannot be split.
    private static PATTERN = /^(?<sign>[+-])(?:(?<longHours>\d{2})(?::?(?<minutes>\d{2})(?::?(?<seconds>\d{2}))?)?|(?<shortHours>\d))$/;

    /**
     * The UTC offset.
     */
    private static UTC_OFFSET: ZoneOffset;

    /**
     * The total offset in seconds.
     */
    private readonly totalSeconds: number;

    /**
     * The string form of the offset, lazily formatted.
     */
    private id?: string;

    /**
     * The rules of the offset, lazily created.
     *
     * The offset never varies, so the rules describing it never do either.
     */
    private rules?: ZoneRules;

    /**
     * Initializes an offset from its total number of seconds.
     */
    private constructor(totalSeconds: number) {
        super();

        this.totalSeconds = totalSeconds;
    }

    /**
     * Returns the UTC offset.
     */
    public static get UTC(): ZoneOffset {
        ZoneOffset.UTC_OFFSET ??= new ZoneOffset(0);

        return ZoneOffset.UTC_OFFSET;
    }

    /**
     * Creates an offset from its ID.
     *
     * @param id The offset ID, such as `Z`, `+03:00` or `-0330`.
     *
     * @throws {Error} If the offset ID is malformed or out of range.
     */
    public static of(id: string): ZoneOffset {
        if (id.toLowerCase() === 'z') {
            return ZoneOffset.UTC;
        }

        const groups = id.match(ZoneOffset.PATTERN)?.groups;

        if (groups === undefined) {
            throw new Error(`Invalid offset ID "${id}".`);
        }

        const sign = groups.sign === '-' ? -1 : 1;

        return ZoneOffset.ofTotal(
            Number.parseInt(groups.longHours ?? groups.shortHours, 10) * sign,
            Number.parseInt(groups.minutes ?? '0', 10) * sign,
            Number.parseInt(groups.seconds ?? '0', 10) * sign,
        );
    }

    /**
     * Creates an offset from its hour, minute and second components.
     *
     * All components must have the same sign.
     *
     * @param hours   The number of hours, from -18 to 18.
     * @param minutes The number of minutes, from -59 to 59.
     * @param seconds The number of seconds, from -59 to 59.
     *
     * @throws {Error} If any component is out of range, or the signs differ.
     */
    public static ofTotal(hours: number, minutes = 0, seconds = 0): ZoneOffset {
        const signs = [Math.sign(hours), Math.sign(minutes), Math.sign(seconds)];
        const max = Math.max(...signs);
        const min = Math.min(...signs);

        if ((max > 0 && min < 0) || (max < 0 && min > 0)) {
            throw new Error('Time-zone offset hours, minutes and seconds must have the same sign.');
        }

        if (hours < -18 || hours > 18) {
            throw new Error(`Offset hours must be between -18 and 18, but got ${hours}.`);
        }

        if (minutes < -59 || minutes > 59) {
            throw new Error(`Offset minutes must be between -59 and 59, but got ${minutes}.`);
        }

        if (seconds < -59 || seconds > 59) {
            throw new Error(`Offset seconds must be between -59 and 59, but got ${seconds}.`);
        }

        return ZoneOffset.ofTotalSeconds(
            seconds
            + (hours * LocalTime.SECONDS_PER_HOUR)
            + (minutes * LocalTime.SECONDS_PER_MINUTE),
        );
    }

    /**
     * Creates an offset from its total number of seconds.
     *
     * @param totalSeconds The total offset in seconds, from -64,800 to 64,800.
     *
     * @throws {Error} If the offset is out of range.
     */
    public static ofTotalSeconds(totalSeconds: number): ZoneOffset {
        if (!Number.isSafeInteger(totalSeconds) || Math.abs(totalSeconds) > ZoneOffset.MAX_SECONDS) {
            throw new Error(
                'Offset must be between -18:00 and +18:00, '
                + `but got ${ZoneOffset.formatAmount(totalSeconds)}.`,
            );
        }

        if (totalSeconds === 0) {
            return ZoneOffset.UTC;
        }

        return new ZoneOffset(totalSeconds);
    }

    /**
     * Returns the total offset in seconds.
     */
    public getTotalSeconds(): number {
        return this.totalSeconds;
    }

    public getId(): string {
        this.id ??= this.totalSeconds === 0 ? 'Z' : ZoneOffset.formatAmount(this.totalSeconds);

        return this.id;
    }

    public getRules(): ZoneRules {
        this.rules ??= ZoneRules.ofFixed(this);

        return this.rules;
    }

    /**
     * Compares this offset to another for order.
     *
     * Offsets are ordered from the one ahead of UTC to the one behind it, so that
     * the offset with the earlier local time-line sorts first.
     *
     * @param offset The offset to compare.
     */
    public compare(offset: ZoneOffset): number {
        return offset.totalSeconds - this.totalSeconds;
    }

    /**
     * Formats a total number of seconds as an offset ID.
     */
    private static formatAmount(totalSeconds: number): string {
        const total = Math.abs(totalSeconds);
        const hour = intDiv(total, LocalTime.SECONDS_PER_HOUR);
        const minute = intDiv(total % LocalTime.SECONDS_PER_HOUR, LocalTime.SECONDS_PER_MINUTE);
        const second = total % LocalTime.SECONDS_PER_MINUTE;

        const sign = totalSeconds < 0 ? '-' : '+';
        const id = `${sign + hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        if (second === 0) {
            return id;
        }

        return `${id}:${second.toString().padStart(2, '0')}`;
    }
}
