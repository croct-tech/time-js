import {addExact, floorDiv, floorMod, intDiv, multiplyExact, subtractExact} from '../src/math';

describe('A floorDiv function', () => {
    it('should return the largest integer value that is less than or equal to the algebraic quotient', () => {
        expect(floorDiv(12300, 1000)).toBe(12);

        expect(floorDiv(-12300, 1000)).toBe(-13);
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

    it('should reject if the sum result overflows', () => {
        expect(() => addExact(2 ** 53 - 1, 1)).toThrowError('The result overflows the range of safe integers.');
    });
});

describe('A subtractExact function', () => {
    it('should return the difference', () => {
        expect(subtractExact(12300, 1000)).toBe(11300);
    });

    it('should reject if the difference result overflows', () => {
        expect(() => subtractExact(2 ** 53 + 2, 1)).toThrowError('The result overflows the range of safe integers.');
    });
});

describe('A multiplyExact function', () => {
    it('should return the product', () => {
        expect(multiplyExact(12300, 1000)).toBe(12300000);
    });

    it('should reject if the product result overflows', () => {
        expect(() => multiplyExact(2 ** 52, 2)).toThrowError('The result overflows the range of safe integers.');
    });
});

describe('A intDiv function', () => {
    it('should return the quotient rounded down', () => {
        expect(intDiv(12999, 1000)).toBe(12);
    });

    it('should reject if the quotient result overflows', () => {
        expect(() => intDiv(2 ** 54, 2)).toThrowError('The result overflows the range of safe integers.');
    });
});
