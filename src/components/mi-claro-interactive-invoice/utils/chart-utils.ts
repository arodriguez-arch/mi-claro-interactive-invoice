import { BillData, ChartDataItem } from '../types/invoice-types';
import { BillApiResponse, BillForecastResponse } from '../../../services/bill.service';
import { getMonthName, getMonthFromDate } from './format-utils';

/**
 * Calculates chart data for the billing history chart
 * @param bills - Array of bill data (legacy, used as fallback)
 * @param billForecast - Bill forecast data from API
 * @param pendingBill - Current pending bill
 * @returns Array of chart data items
 */
export const calculateChartData = (
  bills: BillData[],
  billForecast: BillForecastResponse | null,
  pendingBill: BillApiResponse | null
): ChartDataItem[] => {
  if (!billForecast || !pendingBill) {
    // Fallback to original behavior if no forecast data
    if (!bills || bills.length === 0) return [];
    const months = ['Abril', 'Mayo', 'Siguiente Factura'];
    const amounts = bills.slice(-3).map(bill => bill.totalActual);
    const maxAmount = Math.max(...amounts);

    return months.map((month, index) => ({
      month,
      amount: amounts[index] || 0,
      height: amounts[index] ? Math.max((amounts[index] / maxAmount) * 100, 20) : 0,
      isCurrent: index === 1,
      isEstimated: index === 2
    }));
  }

  // Use forecast data for chart
  const forecastData = billForecast.data;
  const currentMonth = getMonthFromDate(pendingBill.productionDate);

  // Calculate previous month
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;

  const amounts = [forecastData.prevBill, forecastData.lastBill, forecastData.nextBillEstimate];
  const months = [
    getMonthName(prevMonth),
    getMonthName(currentMonth),
    getMonthName(nextMonth)
  ];

  const maxAmount = Math.max(...amounts);

  return months.map((month, index) => ({
    month,
    amount: amounts[index] || 0,
    height: amounts[index] ? Math.max((amounts[index] / maxAmount) * 100, 20) : 0,
    isCurrent: index === 1,  // Current bill
    isEstimated: index === 2 // Next bill estimate
  }));
};
