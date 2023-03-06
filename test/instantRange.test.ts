import {InstantRange} from '../src/instantRange';
import {Instant} from '../src';

describe('A value object representing a range of instants in time', () => {
    it('cannot be created if the start instant is after the end instant', () => {
        expect(
            () => new InstantRange({
                start: Instant.parse('2015-08-02T00Z'),
                end: Instant.parse('2015-08-01T00Z'),
            }),
        ).toThrowError('The start instant must be before the end instant');
    });

    it('can be created from start and end instants', () => {
        const start = Instant.parse('2015-08-01T00Z');
        const end = Instant.parse('2015-08-02T00Z');

        const instantRange = new InstantRange({
            start: start,
            end: end,
        });

        expect(instantRange.start).toEqual(start);
        expect(instantRange.end).toEqual(end);
    });

    it('can be converted to a string interval in the ISO-8601 format', () => {
        const instantRange = new InstantRange({
            start: Instant.parse('2015-08-01T00Z'),
            end: Instant.parse('2015-08-02T00Z'),
        });

        expect(instantRange.toString()).toEqual('2015-08-01T00:00:00Z/2015-08-02T00:00:00Z');
    });

    it('can be serialized to a string interval in the ISO-8601 format', () => {
        const instantRange = new InstantRange({
            start: Instant.parse('2015-08-01T00Z'),
            end: Instant.parse('2015-08-02T00Z'),
        });

        expect(instantRange.toJSON()).toEqual('2015-08-01T00:00:00Z/2015-08-02T00:00:00Z');
    });

    it.each(Object.entries({
        'instant range': [new InstantRange({
            start: Instant.parse('2015-08-01T00Z'),
            end: Instant.parse('2015-08-02T00Z'),
        }), true],
        date: [new Date(), false],
        string: ['', false],
        object: [{}, false],
        null: [null, false],
        undefined: [undefined, false],
    }))('should check if a(n) %s value is an instant range instance', (_, [data, result]) => {
        expect(InstantRange.isInstantRange(data)).toEqual(result);
    });
});
