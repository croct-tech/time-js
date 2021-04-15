export class Instant {
    private readonly value: number;

    private constructor(value: number) {
        this.value = value;
    }

    /*
     * Create an Instant object for the current timestamp.
     */
    public static now(): Instant {
        return Instant.fromEpochMillis(Date.now());
    }

    /*
     * Create an Instant object from native Date object.
     */
    public static fromDate(date: Date): Instant {
        return new Instant(date.valueOf());
    }

    /*
     * Create an Instant object from a standard UNIX timestamp, seconds since epoch.
     */
    public static fromEpochSeconds(timestamp: number): Instant {
        if (!Number.isSafeInteger(timestamp)) {
            throw new Error('The timestamp must be a safe integer.');
        }

        const millis = timestamp * 1000;

        if (!Number.isSafeInteger(millis)) {
            throw new Error(`The timestamp ${timestamp} cannot be represented accurately.`);
        }

        return new Instant(millis);
    }

    /*
     * Create an Instant object from milliseconds since epoch. (integer)
     */
    public static fromEpochMillis(timestamp: number): Instant {
        if (!Number.isSafeInteger(timestamp)) {
            throw new Error('The timestamp must be an integer.');
        }

        return new Instant(timestamp);
    }

    public static parse(value: string): Instant {
        return Instant.fromEpochMillis(Date.parse(value));
    }

    public static compareAscending(left: Instant, right: Instant): number {
        return left.compare(right);
    }

    public static compareDescending(left: Instant, right: Instant): number {
        return right.compare(left);
    }

    /*
     * Converts an Instant object to milliseconds since UNIX epoch.
     */
    public toMillis(): number {
        return this.value;
    }

    /*
     * Converts an Instant to a native Date object.
     */
    public toDate(): Date {
        return new Date(this.value);
    }

    /*
     * Return the ISO string representation of the instant.
     */
    public toString(): string {
        return this.toDate().toISOString();
    }

    public plusSeconds(seconds: number): Instant {
        return new Instant(this.value + (seconds * 1000));
    }

    public isAfter(other: Instant): boolean {
        return this.compare(other) > 0;
    }

    public isAfterOrEqual(other: Instant): boolean {
        return this.compare(other) >= 0;
    }

    public isBefore(other: Instant): boolean {
        return this.compare(other) < 0;
    }

    public isBeforeOrEqual(other: Instant): boolean {
        return this.compare(other) <= 0;
    }

    public compare(other: Instant): number {
        return this.value - other.value;
    }
}
