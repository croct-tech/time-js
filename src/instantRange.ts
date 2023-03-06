import {Instant} from './instant';

type Configuration = {
    start: Instant,
    end: Instant,
};

export class InstantRange {
    public readonly start: Instant;

    public readonly end: Instant;

    public constructor(configuration: Configuration) {
        if (configuration.start.isAfter(configuration.end)) {
            throw new Error('The start instant must be before the end instant');
        }

        this.start = configuration.start;
        this.end = configuration.end;
    }

    /**
     * Converts this instant range to a string interval in ISO-8601 format.
     */
    public toString(): string {
        return `${this.start.toString()}/${this.end.toString()}`;
    }

    /**
     * Serializes this instant range to a JSON value.
     */
    public toJSON(): string {
        return this.toString();
    }

    /**
     * Type guard for InstantRange.
     *
     * @param data The data to checks.
     */
    public static isInstantRange(data: unknown): data is InstantRange {
        return data instanceof InstantRange;
    }
}
