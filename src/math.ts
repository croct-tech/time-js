/**
 * Returns the largest integer value that is less than or equal to the algebraic quotient.
 *
 * @param dividend The dividend.
 * @param divisor  The divisor, non-zero.
 *
 * @return int The largest (closest to positive infinity) integer value that is less than
 * or equal to the algebraic quotient.
 *
 * @internal
 */
export function floorDiv(dividend: number, divisor: number): number {
    let result = Math.trunc(dividend / divisor);

    // If the signs are different and modulo not zero, round down.
    if ((dividend ^ divisor) < 0 && (result * divisor !== dividend)) {
        result--;
    }

    return result;
}

/**
 * Returns the floor modulus of the integer arguments.
 *
 * The relationship between floorDiv and floorMod is such that:
 * `floorDiv(x, y) * y + floorMod(x, y) == x`.
 *
 * @param dividend The dividend.
 * @param divisor  The divisor, non-zero.
 *
 * @return int The floor of the remainder after division of dividend by the divisor.
 *
 * @throws {Error} If the result overflows the range of safe integers.
 *
 * @internal
 */
export function floorMod(dividend: number, divisor: number): number {
    return dividend - floorDiv(dividend, divisor) * divisor;
}

/**
 * Returns the sum of the arguments.
 *
 * @param augend The augend.
 * @param addend The addend.
 *
 * @return int The sum of the arguments.
 *
 * @throws {Error} If the result overflows the range of safe integers.
 *
 * @internal
 */
export function addExact(augend: number, addend: number): number {
    const result = augend + addend;

    if (!Number.isSafeInteger(result)) {
        throw new Error('The result overflows the range of safe integers.');
    }

    return result;
}

/**
 * Returns the difference of the arguments.
 *
 * @param minuend The minuend.
 * @param subtrahend The subtrahend.
 *
 * @return int The difference of the arguments.
 *
 * @throws {Error} If the result overflows the range of safe integers.
 *
 * @internal
 */
export function subtractExact(minuend: number, subtrahend: number): number {
    const result = minuend - subtrahend;

    if (!Number.isSafeInteger(result)) {
        throw new Error('The result overflows the range of safe integers.');
    }

    return result;
}

/**
 * Returns the product of the arguments, throwing an exception if the result is not a safe integer.
 *
 * @param multiplicand The multiplicand.
 * @param multiplier The multiplier.
 *
 * @return The product of the arguments.
 *
 * @throws {Error} If the result overflows the range of safe integers.
 *
 * @internal
 */
export function multiplyExact(multiplicand: number, multiplier: number): number {
    /** @var int|float $result */
    const result = multiplicand * multiplier;

    if (!Number.isSafeInteger(result)) {
        throw new Error('The result overflows the range of safe integers.');
    }

    return result;
}

/**
 * Returns the quotient of the arguments rounded down.
 *
 * @param dividend The dividend.
 * @param divisor The divisor.
 *
 * @return int The quotient of the arguments rounded down.
 *
 * @throws {Error} If the result overflows the range of safe integers.
 *
 * @internal
 */
export function intDiv(dividend: number, divisor: number): number {
    const result = Math.trunc(dividend / divisor);

    if (!Number.isSafeInteger(result)) {
        throw new Error('The result overflows the range of safe integers.');
    }

    return result;
}
