import { h, FunctionalComponent } from '@stencil/core';
import { ChartDataItem } from '../types/invoice-types';

interface ChartSectionProps {
  chartData: ChartDataItem[];
  formatCurrency: (amount: number | undefined | null) => string;
}

/**
 * Renders the billing history chart with legend
 */
export const ChartSection: FunctionalComponent<ChartSectionProps> = ({ chartData, formatCurrency }) => {
  return (
    <>
      <div class="chart-section">
        <h3 class="chart-title">Gastos estimados</h3>
        <div class="chart-container">
          {chartData.map((item, index) => (
            <div key={index} class="chart-bar-container">
              <div class="chart-bar-wrapper">
                <div
                  class={`chart-bar ${item.isEstimated ? 'estimated' : item.isCurrent ? 'current' : 'pending'}`}
                  style={{ height: `${item.height}%` }}
                ></div>
              </div>
              <div class="chart-amount">{formatCurrency(item.amount)}</div>
              <div class="chart-label">{item.month}</div>
            </div>
          ))}
        </div>

        {/* Chart Legend */}
        <div class="chart-legend">
          <div class="legend-item">
            <div class="legend-color pending"></div>
            <span class="legend-text">Factura anterior</span>
          </div>
          <div class="legend-item">
            <div class="legend-color current"></div>
            <span class="legend-text">Factura actual</span>
          </div>
          <div class="legend-item">
            <div class="legend-color estimated"></div>
            <span class="legend-text">Estimado próxima factura</span>
          </div>
        </div>
      </div>
      <div class="separator"></div>
    </>
  );
};
