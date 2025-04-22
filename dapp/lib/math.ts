export function toTokenUnits(amount: number | string, decimals: number = 18): bigint {
    return BigInt(Math.floor(Number(amount) * 10 ** 6)) * 10n ** BigInt(decimals - 6);
  }