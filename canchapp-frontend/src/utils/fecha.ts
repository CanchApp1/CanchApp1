/**
 * Returns the current local date as "YYYY-MM-DD".
 * Using toISOString() would return UTC date, which in Colombia (UTC-5)
 * shifts to the next day after 7 PM local time.
 */
export const fechaLocal = (date: Date = new Date()): string =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
