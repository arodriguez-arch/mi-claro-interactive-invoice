/**
 * Formats a date string to MM/DD/YYYY format
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string or 'Fecha invalida.' if invalid
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'Fecha invalida.';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed in Date constructor
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formats a number as currency with $ prefix
 * Negative numbers are shown as positive with 'CR' suffix
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '$0.00';
  }

  // check if amount is negative
  if (amount < 0) {
    return `$${Math.abs(amount).toFixed(2)} CR`;
  }

  return `$${amount.toFixed(2)}`;
};

/**
 * Gets the Spanish month name from month number
 * @param monthNumber - Month number (1-12)
 * @returns Spanish month name
 */
export const getMonthName = (monthNumber: number): string => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[monthNumber - 1] || 'Mes desconocido';
};

/**
 * Extracts month number from date string
 * @param dateString - Date string
 * @returns Month number (1-12)
 */
export const getMonthFromDate = (dateString: string): number => {
  const date = new Date(dateString);
  return date.getMonth() + 1; // getMonth() returns 0-11, we want 1-12
};
