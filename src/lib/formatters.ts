// Utility functions for formatting betting data

/**
 * Convert decimal to fraction format for totals (e.g., 41.5 -> "41 1/2")
 */
export const formatTotalLine = (total: number): string => {
  const wholePart = Math.floor(total);
  const decimalPart = total - wholePart;
  
  // Convert decimal to fraction
  if (decimalPart === 0) {
    return wholePart.toString();
  } else if (decimalPart === 0.25) {
    return `${wholePart} 1/4`;
  } else if (decimalPart === 0.5) {
    return `${wholePart} 1/2`;
  } else if (decimalPart === 0.75) {
    return `${wholePart} 3/4`;
  } else {
    // For other decimals, round to nearest half
    const roundedDecimal = Math.round(decimalPart * 2) / 2;
    if (roundedDecimal === 0.5) {
      return `${wholePart} 1/2`;
    } else if (roundedDecimal === 1) {
      return (wholePart + 1).toString();
    } else {
      return wholePart.toString();
    }
  }
};

/**
 * Format odds with proper + sign for positive odds
 */
export const formatOdds = (odds: number): string => {
  return odds > 0 ? `+${odds}` : `${odds}`;
};

/**
 * Format spread lines with proper + sign for positive lines
 */
export const formatSpreadLine = (line: number): string => {
  return line > 0 ? `+${line}` : `${line}`;
};