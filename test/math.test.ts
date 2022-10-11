import {addExact, floorDiv, floorMod, intDiv, multiplyExact, subtractExact} from '../src/math';

describe('A floorDiv function', () => {
    it('should return the largest integer value that is less than or equal to the algebraic quotient', () => {
        expect(floorDiv(12300, 1000)).toBe(12);

        expect(floorDiv(-12300, 1000)).toBe(-13);

        expect(floorDiv(3_000_000_000, 2_000_000_000)).toBe(1);
    });
});

describe('A floorMod function', () => {
    it('should return the floor modulus after division of dividend by the divisor', () => {
        expect(floorMod(12300, 1000)).toBe(300);

        expect(floorMod(-12300, 1000)).toBe(700);
    });
});

describe('A addExact function', () => {
    it('should return the sum', () => {
        expect(addExact(12300, 1000)).toBe(13300);
    });

    it('should reject if the sum overflows', () => {
        expect(() => addExact(Number.MAX_SAFE_INTEGER, 1)).toThrowError(
            'The result overflows the range of safe integers.',
        );
    });
});

describe('A subtractExact function', () => {
    it('should return the difference', () => {
        expect(subtractExact(12300, 1000)).toBe(11300);
    });

    it('should reject if the difference overflows', () => {
        expect(() => subtractExact(Number.MAX_VALUE, 1)).toThrowError(
            'The result overflows the range of safe integers.',
        );
    });
});

describe('A multiplyExact function', () => {
    it('should return the product', () => {
        expect(multiplyExact(12300, 1000)).toBe(12300000);
    });

    it('should reject if the product overflows', () => {
        expect(() => multiplyExact(Number.MAX_VALUE, 2)).toThrowError(
            'The result overflows the range of safe integers.',
        );
    });
});

describe('A intDiv function', () => {
    it('should return the quotient towards zero', () => {
        expect(intDiv(12999, 1000)).toBe(12);
    });

    it('should reject if the quotient overflows', () => {
        expect(() => intDiv(Number.MAX_VALUE, 2)).toThrowError('The result overflows the range of safe integers.');
    });
});
