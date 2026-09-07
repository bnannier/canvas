// Decimal precision comes from both operands. A direct-entry offset such as
// 0.05 must survive a 0.1 increment, and scientific notation such as 1e-7 must
// contribute its fractional places even though its string has no decimal point.
function lastDigitPlace(value: number): number {
  const [coefficient, exponent] = value.toExponential().split("e");
  return Number(exponent) - (coefficient.split(".")[1]?.length ?? 0);
}

/** Add a decimal increment without exposing binary arithmetic drift. */
export function addDecimal(value: number, delta: number): number {
  const sum = value + delta;
  if (!Number.isFinite(sum) || sum === 0) return sum;

  const place = Math.min(lastDigitPlace(value), lastDigitPlace(delta));
  const exponent = Number(sum.toExponential().split("e")[1]);
  // Express the desired decimal place as significant digits, so very small
  // increments do not hit toFixed's 100-place limit or round all the way to zero.
  // toPrecision accepts 1..100 digits; more than 100 only restates the same
  // Number, so the upper bound preserves values with widely separated operands.
  const digits = Math.max(1, Math.min(100, exponent - place + 1));
  return Number(sum.toPrecision(digits));
}
