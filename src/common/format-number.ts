/**
 * Formats a number for display using the user's language.
 */
export const formatNumber = (
  num: string | number,
  language?: string,
  options?: Intl.NumberFormatOptions,
): string => {
  const value = Number(num);
  if (Number.isNaN(value) || num === '') {
    return typeof num === 'string' ? num : String(num);
  }
  return new Intl.NumberFormat(language, options).format(value);
};
