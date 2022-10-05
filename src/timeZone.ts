import {timeZonesNames} from '@vvo/tzdb';

const timeZoneIds = timeZonesNames.concat('UTC');

/**
 * A time-zone ID, such as Europe/Paris.
 */
export class TimeZone {
    /**
     * The UTC timezone.
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
    public static getTimesZoneIds(): string[] {
        return timeZoneIds;
    }

    /**
     * Creates a timezone from its ID.
     *
     * @param id The timezone ID.
     *
     * @throws {Error} If the timezone ID is not supported.
     */
    public static of(id: string): TimeZone {
        if (TimeZone.getTimesZoneIds().indexOf(id) === -1) {
            throw new Error(`The timezone ${id} is not supported.`);
        }

        return new TimeZone(id);
    }

    /**
     * Returns the timezone ID.
     */
    public getId(): string {
        return this.id;
    }

    /**
     * Returns the string representation of the timezone.
     */
    public toString(): string {
        return this.id;
    }

    /**
     * Checks if the timezone is equal to another timezone.
     */
    public equals(other: TimeZone): boolean {
        return this.id === other.id;
    }

    /**
     * Returns the JSON representation of the timezone.
     */
    public toJSON(): string {
        return this.toString();
    }
}
