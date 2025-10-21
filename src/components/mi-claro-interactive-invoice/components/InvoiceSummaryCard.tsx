import { h, FunctionalComponent } from '@stencil/core';
import { BillData, ChartDataItem } from '../types/invoice-types';
import { BillApiResponse } from '../../../services/bill.service';
import { ChargesSection } from './ChargesSection';
import { ChartSection } from './ChartSection';
import { AutoPaySection } from './AutoPaySection';

interface InvoiceSummaryCardProps {
  customerName: string | undefined;
  totalAmount: string;
  showMoreInfo: boolean;
  pendingBill: BillApiResponse | null;
  currentBill: BillData | null;
  chartData: ChartDataItem[];
  autoPayEnabled: boolean;
  expandedSummarySection: { [key: string]: boolean };
  expandedSubscriberId: string | null;
  isLoadingDetail: boolean;
  formatCurrency: (amount: number | undefined | null) => string;
  formatDate: (date: string) => string;
  onToggleShowMore: () => void;
  onToggleAutoPay: () => void;
  onPayPendingBills: () => void;
}

/**
 * Main payment summary card shown in the first column
 * Contains bill summary, charges, chart, and auto-pay sections
 */
export const InvoiceSummaryCard: FunctionalComponent<InvoiceSummaryCardProps> = (props) => {
  return (
    <div class="card payment-summary">
      <h2 class="card-title">¡Hola, {props.customerName}!</h2>
      <p class="summary-text">Este es el resumen de tu factura actual.</p>
      <div class="separator"></div>

      <div class="total-section">
        <p class="total-label">Total a pagar</p>
        <p class="total-amount">{props.totalAmount}</p>
      </div>
      <div class="separator"></div>

      <div class={`expandable-content ${props.showMoreInfo ? 'expanded' : ''}`}>
        <div class="expandable-inner">
          {/* Bill Summary Fields */}
          <div class="bill-summary-section">
            <div class="bill-summary-item">
              <span class="bill-summary-label">Balance anterior</span>
              <span class="bill-summary-amount">{props.formatCurrency(props.pendingBill?.prevBalanceAmt)}</span>
            </div>
            <div class={`bill-summary-item ${props.expandedSummarySection['bill-0-payments'] ? 'highlighted' : ''}`}>
              <span class="bill-summary-label">Pagos recibidos</span>
              <span class="bill-summary-amount credit">{props.formatCurrency(props.pendingBill?.pymReceivedAmt)}</span>
            </div>
            <div class={`bill-summary-item ${props.expandedSummarySection['bill-0-adjustments'] || props.expandedSummarySection['bill-0-subscriber-adjustments'] ? 'highlighted' : ''}`}>
              <span class="bill-summary-label">Ajustes</span>
              <span class="bill-summary-amount credit">{props.formatCurrency(props.pendingBill?.adjAppliedAmt)}</span>
            </div>
          </div>
          <div class="separator"></div>

          {/* Balance Vencido Section */}
          <div class="balance-section">
            <p class="balance-label">Balance vencido</p>
            <p class="balance-amount">{props.formatCurrency(props.pendingBill?.payNowAmt)}</p>
            {props.pendingBill?.payNowAmt > 0 && (
              <p class="due-date">Vencimiento: {props.formatDate(props.pendingBill?.payNowDueDate)}</p>
            )}
          </div>
          <div class="separator"></div>

          {/* Service Charges Section */}
          <ChargesSection
            isLoading={props.isLoadingDetail}
            currentBill={props.currentBill}
            expandedSubscriberId={props.expandedSubscriberId}
            expandedSummarySection={props.expandedSummarySection}
            formatCurrency={props.formatCurrency}
          />

          {/* Chart Section */}
          <ChartSection
            chartData={props.chartData}
            formatCurrency={props.formatCurrency}
          />

          {/* Auto Pay Section */}
          <AutoPaySection
            autoPayEnabled={props.autoPayEnabled}
            onToggleAutoPay={props.onToggleAutoPay}
            onPayPendingBills={props.onPayPendingBills}
          />
        </div>
      </div>

      <div class="toggle-button-container">
        <button class="toggle-button" onClick={props.onToggleShowMore}>
          {props.showMoreInfo ? 'Ver menos' : 'Ver más'}
          <span class={`arrow ${props.showMoreInfo ? 'up' : 'down'}`}>▼</span>
        </button>
      </div>
    </div>
  );
};
