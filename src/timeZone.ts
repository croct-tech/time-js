/**
 * A time-zone ID, such as Europe/Paris.
 */
export class TimeZone {
    private static SUPPORTED_TIMEZONE_IDS: ReadonlySet<string>;

    /**
     * The UTC time zone.
     */
    public static readonly UTC = new TimeZone('UTC');

    /**
     * The time zone ID.
     */
    private readonly id: string;

    /**
     * Initializes a time zone.
     */
    private constructor(id: string) {
        this.id = id;
    }

    /**
     * Returns the list of supported time zones.
     */
    public static getTimesZoneIds(): ReadonlySet<string> {
        if (TimeZone.SUPPORTED_TIMEZONE_IDS === undefined) {
            TimeZone.SUPPORTED_TIMEZONE_IDS = new Set([
                'UTC',
                ...Intl.supportedValuesOf('timeZone'),
            ]);
        }

        return TimeZone.SUPPORTED_TIMEZONE_IDS;
    }

    /**
     * Creates a time zone from its ID.
     *
     * @param id The time zone ID.
     *
     * @throws {Error} If the time zone ID is not supported.
     */
    public static of(id: string): TimeZone {
        if (!TimeZone.getTimesZoneIds().has(id)) {
            throw new Error(`The timezone ${id} is not supported.`);
        }

        return new TimeZone(id);
    }

    /**
     * Returns the time zone ID.
     */
    public getId(): string {
        return this.id;
    }

    /**
     * Returns the string representation of the time zone.
     */
    public toString(): string {
        return this.id;
    }

    /**
     * Checks if the time zone is equal to another time zone.
     */
    public equals(other: TimeZone): boolean {
        return this.id === other.id;
    }

    /**
     * Returns the JSON representation of the time zone.
     */
    public toJSON(): string {
        return this.toString();
    }
}
