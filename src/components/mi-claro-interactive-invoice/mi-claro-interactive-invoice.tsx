import { Component, State, h, Prop, Event, EventEmitter, Element } from '@stencil/core';
import { BillService, Environment, BillApiResponse, BillForecastResponse } from '../../services/bill.service';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

// Import types
import { Invoice, BillData, AccountData, MessageDetail, CallDetail } from './types/invoice-types';

// Import utility functions
import { formatDate, formatCurrency, getMonthFromDate } from './utils/format-utils';
import { calculateChartData } from './utils/chart-utils';

// Import functional components
import { FloatingPill } from './components/FloatingPill';
import { InvoiceSummaryCard } from './components/InvoiceSummaryCard';
import { SupportCard } from './components/SupportCard';
import { EventDetailsModal } from './components/EventDetailsModal';

@Component({
  tag: 'mi-claro-interactive-invoice',
  styleUrl: 'mi-claro-interactive-invoice.css',
  shadow: true,
  assetsDirs: ['assets']
})
export class MiClaroInteractiveInvoice {
  @Element() el: HTMLElement;
  private tooltipInstances: any[] = [];
  @State() showMoreInfo: boolean = false;
  @State() activeTab: 'current' | 'previous' = 'current';
  @State() expandedInvoiceId: string | null = null;
  @State() expandedSubscriberId: string | null = null;
  @State() expandedAccordionItem: string | null = null;
  @State() expandedSummarySection: { [key: string]: boolean } = {};
  @State() activeFloatingPill: { title: string; amount: string; sectionId: string } | null = null;
  @State() isLoading: boolean = true;
  @State() selectedAccount: string = '';
  @State() invoiceData: any = null;
  @State() currentBill: BillData | null = null;
  @State() previousBills: BillData[] = [];
  @State() accountsData: AccountData[] = [];
  @State() allBills: BillData[] = [];
  @State() autoPayEnabled: boolean = false;
  @State() chartData: any[] = [];
  @State() apiBills: BillApiResponse[] = [];
  @State() pendingBill: BillApiResponse | null = null;
  @State() historyBills: BillApiResponse[] = [];
  @State() loadingBillDetail: { [key: string]: boolean } = {};
  @State() loadingHistoryDetail: { [key: string]: boolean } = {};
  @State() billDetails: { [key: string]: any } = {};
  @State() billForecast: BillForecastResponse | null = null;
  @State() eventModalData: { type: 'mensajes' | 'llamadas'; data: any[] } | null = null;
  // @Prop() accountList: string[] = [];
  @Prop() accountList: string[] = ['846045754', '769001587', '805437569', '799704751', '805437569'];
  @Prop() environment!: Environment;
  @Prop() token?: string = '';
  @Prop() defaultSelectedAccount?: string = '';
  @Prop() customerName?: string;
  @Prop() totalAPagar?: number;
  @Prop() vencimientoDate?: string;

  @Event() goToSupport: EventEmitter<void>;
  @Event() payBill: EventEmitter<{ billId: string; amount?: number }>;
  @Event() automatePayments: EventEmitter<boolean>;
  @Event() questionsPressed: EventEmitter<void>;
  @Event() contactPressed: EventEmitter<void>;
  @Event() downloadBills: EventEmitter<void>;
  @Event() accountChanged: EventEmitter<string>;

  private invoices: Invoice[] = [];
  private billService: BillService;

  private cleanupTooltips = () => {
    this.tooltipInstances.forEach(instance => instance.destroy());
    this.tooltipInstances = [];
  };

  private getTooltipContent = (descripcion: string, sectionName: string): string => {
    // Use the descripcion from API if available
    if (descripcion) {
      return `<strong>${sectionName}</strong><br/>${descripcion}`;
    }
    // Fallback for older data or missing descriptions
    return `<strong>${sectionName}</strong><br/>Información sobre este cargo en tu factura.`;
  };

  // private getSummaryTooltipContent = (sectionType: 'payments' | 'adjustments' | 'subscribers', customText?: string): string => {
  //   // Use custom text from API if available
  //   if (customText) {
  //     return customText;
  //   }
  //
  //   // Default tooltips for each section
  //   const defaultTooltips = {
  //     payments: '<strong>Pagos recibidos</strong><br/>Historial de pagos realizados en tu cuenta durante el período de facturación actual.',
  //     adjustments: '<strong>Ajustes</strong><br/>Créditos y ajustes aplicados a tu cuenta que modifican el balance total.',
  //     subscribers: '<strong>Cargos por suscriptores</strong><br/>Detalle de cargos aplicados a cada línea telefónica asociada a tu cuenta.'
  //   };
  //
  //   return defaultTooltips[sectionType] || 'Información no disponible';
  // };

  private initializeTooltips = (detailData?: any) => {
    setTimeout(() => {
      this.cleanupTooltips();
      console.log(detailData)

      const infoIcons = this.el.shadowRoot.querySelectorAll('.info-icon[data-tooltip]');
      // Detect if device is touch-enabled (mobile/tablet)
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      infoIcons.forEach(icon => {
        const tooltipContent = icon.getAttribute('data-tooltip') || 'Información no disponible';
        // Check if it's a summary tooltip (has class summary-info)
        const isSummaryTooltip = icon.classList.contains('summary-info');

        // Prevent click from bubbling up to parent elements (prevents accordion toggle)
        icon.addEventListener('click', (e) => {
          e.stopPropagation();
        });

        const tooltipInstance = tippy(icon as HTMLElement, {
          content: `<div class="custom-tooltip-content">${tooltipContent}</div>`,
          allowHTML: true,
          interactive: true,
          placement: 'top',
          theme: 'custom-white',
          maxWidth: 350,
          arrow: true,
          animation: false,
          animateFill: false,
          // Use click trigger on touch devices, hover on desktop
          trigger: isTouchDevice ? 'click' : 'mouseenter focus',
          // Hide tooltip when clicking outside on touch devices
          hideOnClick: isTouchDevice ? true : 'toggle',
        });
        this.tooltipInstances.push(tooltipInstance);
      });
    }, 100);
  };

  private toggleShowMore = () => {
    this.showMoreInfo = !this.showMoreInfo;
  };

  private selectTab = (tab: 'current' | 'previous') => {
    this.activeTab = tab;
  };

  private toggleInvoiceDetail = async (invoiceId: string) => {
    // If collapsing, just update the state
    if (this.expandedInvoiceId === invoiceId) {
      this.expandedInvoiceId = null;
      return;
    }

    // Expand immediately so user sees the loading state
    this.expandedInvoiceId = invoiceId;

    // Get the bill index from the invoice ID
    const billIndex = parseInt(invoiceId.split('-')[1]);
    const isHistoryBill = invoiceId.startsWith('prev-');

    // Get the bill data based on whether it's current or history
    const bill = isHistoryBill ? this.historyBills[billIndex] : this.pendingBill;

    if (!bill) {
      // If no bill data, already expanded, just return
      return;
    }

    console.log('Bill data for detail fetch:', {
      ban: bill.ban,
      cycleRunYear: bill.cycleRunYear,
      cycleRunMonth: bill.cycleRunMonth,
      cycleCode: bill.cycleCode
    });

    // Check if we already have the details cached
    const cacheKey = `${bill.ban}-${bill.cycleRunYear}-${bill.cycleRunMonth}-${bill.cycleCode}`;
    // if (this.billDetails[cacheKey]) {
    //   // Already have data and already expanded
    //   return;
    // }

    // Set loading state based on bill type
    if (isHistoryBill) {
      this.loadingHistoryDetail = { ...this.loadingHistoryDetail, [invoiceId]: true };
    } else {
      this.loadingBillDetail = { ...this.loadingBillDetail, [invoiceId]: true };
    }

    try {
      // Fetch bill details
      const detailResponse = await this.billService.getBillDetail(
        bill.ban.toString(),
        bill.cycleRunYear,
        bill.cycleRunMonth,
        bill.cycleCode
      );

      if (detailResponse.data && detailResponse.data.facturas.length > 0) {
        // Cache the bill details
        this.billDetails[cacheKey] = detailResponse.data.facturas[0];

        // Update the current or previous bill with detailed data
        if (isHistoryBill) {
          // Create a new array to trigger re-render in Stencil
          const updatedBills = [...this.previousBills];
          const originalBill = updatedBills[billIndex];
          updatedBills[billIndex] = {
            ...updatedBills[billIndex],
            ...detailResponse.data.facturas[0],
            detalle: detailResponse.data.facturas[0].detalle || [],
            // Preserve original key fields to prevent them from being overwritten by detail response
            fechaFactura: originalBill.fechaFactura,
            fechaVencimiento: originalBill.fechaVencimiento,
            balanceAnterior: originalBill.balanceAnterior,
            pagosRecibidos: originalBill.pagosRecibidos,
            ajustes: originalBill.ajustes,
            totalActual: originalBill.totalActual
          };
          this.previousBills = updatedBills;
        } else {
          this.currentBill = {
            ...this.currentBill,
            ...detailResponse.data.facturas[0],
            detalle: detailResponse.data.facturas[0].detalle || []
          };
        }

        // Initialize tooltips after detail data is loaded
        this.initializeTooltips(detailResponse.data.facturas[0]);
      }
    } catch (error) {
      console.error('Error fetching bill details:', error);
      // Already expanded at the beginning, just log the error
    } finally {
      // Clear loading state based on bill type
      if (isHistoryBill) {
        this.loadingHistoryDetail = { ...this.loadingHistoryDetail, [invoiceId]: false };
      } else {
        this.loadingBillDetail = { ...this.loadingBillDetail, [invoiceId]: false };
      }
    }
  };

  private toggleSubscriberDetail = (subscriberId: string) => {
    this.expandedSubscriberId = this.expandedSubscriberId === subscriberId ? null : subscriberId;
  };

  private toggleAccordionItem = (itemId: string) => {
    this.expandedAccordionItem = this.expandedAccordionItem === itemId ? null : itemId;
  };

  private toggleSummarySection = (sectionId: string) => {
    const isExpanding = !this.expandedSummarySection[sectionId];

    this.expandedSummarySection = {
      ...this.expandedSummarySection,
      [sectionId]: isExpanding
    };

    // Update floating pill for mobile
    if (isExpanding) {
      this.updateFloatingPill(sectionId);
    } else {
      this.activeFloatingPill = null;
    }
  };

  private updateFloatingPill = (sectionId: string) => {
    let title = '';
    let amount = '';

    if (sectionId.includes('payments')) {
      title = 'Pagos recibidos';
      amount = formatCurrency(this.pendingBill?.pymReceivedAmt || 0);
    } else if (sectionId.includes('subscriber-adjustments')) {
      const cacheKey = `${this.pendingBill?.ban}-${this.pendingBill?.cycleRunYear}-${this.pendingBill?.cycleRunMonth}-${this.pendingBill?.cycleCode}`;
      const billDetail = this.billDetails[cacheKey];
      const ajustesPorSuscriptor = billDetail?.ajustesPorSuscriptor;
      const totalAjustes = ajustesPorSuscriptor?.reduce((sum, ajuste) => sum + ajuste.total, 0) || 0;
      title = 'Ajustes por suscriptor';
      amount = formatCurrency(totalAjustes);
    } else if (sectionId.includes('adjustments')) {
      const cacheKey = `${this.pendingBill?.ban}-${this.pendingBill?.cycleRunYear}-${this.pendingBill?.cycleRunMonth}-${this.pendingBill?.cycleCode}`;
      const billDetail = this.billDetails[cacheKey];
      title = 'Ajustes';
      amount = formatCurrency(billDetail?.resumenAjustes?.totalNeto || 0);
    } else if (sectionId.includes('account-charges')) {
      title = 'Cargos de cuenta';
      amount = formatCurrency(this.currentBill?.cargosDeCuenta?.cargo || 0);
    } else if (sectionId.includes('subscribers')) {
      title = 'Cargos por suscriptores';
      amount = formatCurrency(this.currentBill?.totalActual || 0);
    }

    this.activeFloatingPill = { title, amount, sectionId };
  };

  private scrollToSection = (sectionId: string) => {
    // Find the section element and scroll to it
    const sectionElement = this.el.shadowRoot?.querySelector(`[data-section-id="${sectionId}"]`);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  private handleGoToSupport = () => {
    this.goToSupport.emit();
  };

  private toggleAutoPay = () => {
    this.autoPayEnabled = !this.autoPayEnabled;
    this.automatePayments.emit(this.autoPayEnabled);
  };

  private handlePayBill = (billId: string, amount?: number) => {
    // If amount is not explicitly provided, calculate it based on bill data
    if (!amount && billId === 'bill-0' && this.pendingBill) {
      // If Balance vencido (payNowAmt) > 0, use it; otherwise use totalDueAmt
      amount = this.pendingBill.payNowAmt > 0
        ? this.pendingBill.payNowAmt
        : this.pendingBill.totalDueAmt;
    }
    this.payBill.emit({ billId, amount });
  };

  private handleQuestionsPressed = () => {
    this.questionsPressed.emit();
  };

  private handleContactPressed = () => {
    this.contactPressed.emit();
  };

  private handleDownloadBills = () => {
    this.downloadBills.emit();
  };

  private openEventModal = (type: 'mensajes' | 'llamadas', data: MessageDetail[] | CallDetail[]) => {
    this.eventModalData = { type, data };
  };

  private closeEventModal = () => {
    this.eventModalData = null;
  };

  private handleAccountChange = (event: Event) => {
    const selectedAccount = (event.target as HTMLSelectElement).value;
    console.log('Selected account changed to:', selectedAccount);
    this.selectedAccount = selectedAccount;

    // Emit the account change event so parent can update props
    this.accountChanged.emit(selectedAccount);

    // Reset states before fetching new data
    this.invoiceData = null;
    this.invoices = [];
    this.currentBill = null;
    this.previousBills = [];
    this.allBills = [];
    this.apiBills = [];
    this.pendingBill = null;
    this.historyBills = [];

    // Reset bill details and loading states
    this.billDetails = {};
    this.loadingBillDetail = {};
    this.loadingHistoryDetail = {};
    this.billForecast = null;

    // Reset all expanded states to initial state
    this.expandedInvoiceId = null;
    this.expandedSubscriberId = null;
    this.expandedAccordionItem = null;
    this.expandedSummarySection = {};
    this.activeFloatingPill = null;

    // Reset tab to current
    this.activeTab = 'current';

    // Reset chart data
    this.chartData = [];

    // Activate loader and fetch new data
    this.fetchInvoiceData(selectedAccount);
  };

  private fetchBillForecast = async (accountNumber: string, nextCycleRunMonth: number): Promise<void> => {
    try {
      const forecastResponse = await this.billService.getBillForecast(accountNumber, nextCycleRunMonth);
      if (forecastResponse && forecastResponse.isSuccess) {
        this.billForecast = forecastResponse;
      }
    } catch (error) {
      console.error('Error fetching bill forecast:', error);
      this.billForecast = null;
    }
  };

  // Removed fetchBillsData - now using API directly


  // Removed mapBillToInvoice - no longer needed with API data

  private fetchInvoiceData = async (accountNumber: string) => {
    this.isLoading = true;
    try {
      // First try to fetch from API
      const billsResponse = await this.billService.getBills(accountNumber);

      if (billsResponse && billsResponse.data && billsResponse.data.length > 0) {
        // Store API bills
        this.apiBills = billsResponse.data;

        // First bill is for "Mi factura" tab, rest are for "Facturas anteriores"
        this.pendingBill = billsResponse.data[0];
        this.historyBills = billsResponse.data.slice(1);

        // For now, create simple invoice data from API response
        // This will be the current pending bill
        if (this.pendingBill) {
          this.currentBill = {
            fechaFactura: this.pendingBill.productionDate,
            fechaVencimiento: this.pendingBill.billDueDate,
            balanceAnterior: 0, // Not provided by API
            pagosRecibidos: 0, // Not provided by API
            ajustes: 0,
            totalActual: this.totalAPagar || this.pendingBill.totalDueAmt,
            detalle: [], // Will need detail endpoint
            metodosPago: [],
            cargosPorTipo: [],
            cargosDeCuenta: null
          };

          // Map history bills
          this.previousBills = this.historyBills.map(bill => ({
            fechaFactura: bill.productionDate,
            fechaVencimiento: bill.billDueDate,
            balanceAnterior: bill.prevBalanceAmt || 0,
            pagosRecibidos: bill.pymReceivedAmt || 0,
            ajustes: bill.adjAppliedAmt || 0,
            totalActual: bill.totalDueAmt,
            detalle: [],
            metodosPago: [],
            cargosDeCuenta: null,
            cargosPorTipo: [],
            ban: bill.ban,
            cycleRunYear: bill.cycleRunYear,
            cycleRunMonth: bill.cycleRunMonth,
            cycleCode: bill.cycleCode
          }));

          // Create invoices for display - only show the first bill in "Mi factura" tab
          this.invoices = [{
            id: `bill-0`,
            title: this.customerName || `Cuenta ${this.pendingBill.ban}`,
            date: formatDate(this.pendingBill.productionDate),
            dueDate: formatDate(this.pendingBill.billDueDate),
            amount: this.totalAPagar ? formatCurrency(this.totalAPagar) : formatCurrency(this.pendingBill.totalDueAmt),
            status: this.pendingBill.billStatus === 0 ? 'Pendiente' : 'Pagado'
          }];

          // Update invoice data
          this.invoiceData = {
            accountNumber: accountNumber,
            customerName: this.customerName || `Cliente ${accountNumber}`, // Use prop if available
            dueDate: formatDate(this.pendingBill.billDueDate),
            totalAmount: this.totalAPagar ? formatCurrency(this.totalAPagar) : formatCurrency(this.pendingBill.totalDueAmt),
            invoices: this.invoices,
            planDetails: {
              name: 'Plan Móvil',
              period: `${formatDate(this.pendingBill.productionDate)} - ${formatDate(this.pendingBill.billDueDate)}`,
              paymentMethod: 'No especificado'
            },
            balanceAnterior: 0,
            pagosRecibidos: 0,
            ajustes: 0
          };

          // Fetch bill forecast for next month
          const currentMonth = getMonthFromDate(this.pendingBill.productionDate);
          const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
          await this.fetchBillForecast(accountNumber, nextMonth);

          // Calculate chart data with API bills and forecast data
          const chartBills = billsResponse.data.slice(0, 3).map(bill => ({
            totalActual: bill.totalDueAmt
          }));
          this.chartData = calculateChartData(chartBills as any, this.billForecast, this.pendingBill);
        }
      } else {
        // No data from API
        this.invoiceData = null;
        this.invoices = [];
        this.currentBill = null;
        this.previousBills = [];
        this.allBills = [];
      }
    } catch (error) {
      console.error('Error fetching invoice data:', error);
      // On error, just clear the data
      this.invoiceData = null;
      this.invoices = [];
      this.currentBill = null;
      this.previousBills = [];
      this.allBills = [];
    } finally {
      this.isLoading = false;
    }
  };

  componentWillLoad() {
    // Initialize bill service with environment and token props
    this.billService = new BillService(this.environment, this.token || '');

    // Set initial selected account and fetch data on component initialization
    if (this.accountList && this.accountList.length > 0) {
      console.log('Initial account list:', this.accountList);
      console.log('Initial  selected account:', this.defaultSelectedAccount);
      this.selectedAccount = this.defaultSelectedAccount || this.accountList[0];
      this.fetchInvoiceData(this.selectedAccount);
    }
  }

  componentDidUpdate() {
    // Re-initialize tooltips when component updates
    if (this.expandedInvoiceId) {
      this.initializeTooltips();
    }
  }

  disconnectedCallback() {
    // Clean up tooltips when component is removed
    this.cleanupTooltips();
  }

  private renderSkeleton() {
    return (
      <div class="invoice-container">
        <div class="invoice-grid">
          {/* First Column Skeleton */}
          <div class="first-column">
            {/* Payment Summary Card Skeleton */}
            <div class="skeleton-card">
              <div class="skeleton skeleton-text title"></div>
              <div class="skeleton skeleton-text subtitle"></div>
              <div class="separator"></div>
              <div class="skeleton skeleton-text" style={{ width: '100px', marginBottom: '8px' }}></div>
              <div class="skeleton skeleton-text amount"></div>
              <div class="skeleton skeleton-button" style={{ width: '100px' }}></div>
            </div>

            {/* Support Card Skeleton */}
            <div class="skeleton-support-card">
              <div class="promo-border-accent"></div>
              <div class="skeleton skeleton-image"></div>
              <div class="skeleton skeleton-button" style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* Second Column Skeleton */}
          <div class="second-column">
            {/* Header Row Skeleton */}
            <div class="invoice-header">
              <div class="skeleton skeleton-text title" style={{ width: '150px' }}></div>
              <div class="account-selector">
                <div class="skeleton skeleton-text" style={{ width: '150px', height: '25px' }}></div>
                <div class="skeleton skeleton-select"></div>
              </div>
            </div>

            {/* Invoice Details Card Skeleton */}
            <div class="card invoice-details">
              <div class="tabs">
                <div class="tab active">
                  <div class="skeleton skeleton-text" style={{ width: '100px', margin: '0 auto' }}></div>
                </div>
                <div class="tab">
                  <div class="skeleton skeleton-text" style={{ width: '150px', margin: '0 auto' }}></div>
                </div>
              </div>

              <div class="tab-content">
                <div class="invoice-table">
                  <div class="table-header">
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                  </div>
                  {/* Skeleton rows */}
                  {[1, 2].map((index) => (
                    <div key={index} class="skeleton-table-row">
                      <div class="skeleton skeleton-cell"></div>
                      <div class="skeleton skeleton-cell"></div>
                      <div class="skeleton skeleton-cell"></div>
                      <div class="skeleton skeleton-status"></div>
                      <div class="skeleton skeleton-button"></div>
                      <div class="skeleton skeleton-button"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    if (this.isLoading) {
      return this.renderSkeleton();
    }

    return (
      <div class="invoice-container">
        {/* Event Details Modal */}
        <EventDetailsModal
          isOpen={this.eventModalData !== null}
          eventType={this.eventModalData?.type || null}
          data={this.eventModalData?.data || null}
          onClose={this.closeEventModal}
          formatCurrency={formatCurrency}
        />

        {/* Floating Pill Indicator - Mobile Only */}
        {this.activeFloatingPill && (
          <FloatingPill
            data={this.activeFloatingPill}
            onScroll={this.scrollToSection}
          />
        )}

        <div class="invoice-grid">
          {/* First Column Container */}
          <div class="first-column">
            {/* Payment Summary Card */}
            <InvoiceSummaryCard
              customerName={this.customerName || this.invoiceData?.customerName}
              totalAmount={this.totalAPagar ? formatCurrency(this.totalAPagar) : this.invoiceData?.totalAmount || '$0'}
              showMoreInfo={this.showMoreInfo}
              pendingBill={this.pendingBill}
              currentBill={this.currentBill}
              chartData={this.chartData}
              autoPayEnabled={this.autoPayEnabled}
              expandedSummarySection={this.expandedSummarySection}
              expandedSubscriberId={this.expandedSubscriberId}
              isLoadingDetail={this.loadingBillDetail['bill-0']}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              onToggleShowMore={this.toggleShowMore}
              onToggleAutoPay={this.toggleAutoPay}
            />

            {/* Support Card */}
            <SupportCard onGoToSupport={this.handleGoToSupport} />
          </div>

          {/* Second Column Container */}
          <div class="second-column">
            {/* Header Row */}
            <div class="invoice-header">
              <h2 class="invoice-title">Mi Factura</h2>
              <div class="account-selector">
                <label class="account-label">Número de cuenta</label>
                <select class="account-select" onChange={this.handleAccountChange}>
                  {
                    this.accountList.map((item: any, index: number) => {
                      return (
                        <option key={index} value={item} selected={item === this.selectedAccount}>
                          {item}
                        </option>
                      );
                    })
                  }
                </select>
              </div>
            </div>

            {/* Invoice Details Card */}
            <div class="card invoice-details">
            <div class="tabs">
              <button
                class={`tab ${this.activeTab === 'current' ? 'active' : ''}`}
                onClick={() => this.selectTab('current')}
              >
                Mi factura
              </button>
              <button
                class={`tab ${this.activeTab === 'previous' ? 'active' : ''}`}
                onClick={() => this.selectTab('previous')}
              >
                Facturas anteriores
              </button>
            </div>

            <div class="tab-content">
              {this.activeTab === 'current' && (
                <div class="invoice-table">
                  {this.invoices.length > 0 ? (
                    <>
                      <div class="table-header">
                        <div class="header-cell">Fecha</div>
                        <div class="header-cell">Monto</div>
                        <div class="header-cell">Estado</div>
                        <div class="header-cell">Vencimiento</div>
                        <div class="header-cell"></div>
                        <div class="header-cell"></div>
                      </div>
                      {this.invoices.map(invoice => {
                    const isPaid = invoice.status === 'Pagado';
                    return (
                      <div key={invoice.id} class={`table-row-container ${this.expandedInvoiceId === invoice.id ? 'expanded' : ''}`}>
                        <div class="table-row">
                          {/*<div class="table-cell cell-bold" data-name={invoice.title} data-date={invoice.date}>{invoice.title}</div>*/}
                          <div class="table-cell">{invoice.date}</div>
                          <div class="table-cell cell-amount">{invoice.amount}</div>
                          <div class="table-cell">
                            <span class={`status ${isPaid ? 'pagado' : 'pendiente'}`}>
                              {invoice.status}
                            </span>
                          </div>
                          <div class="table-cell">{invoice.dueDate}</div>

                          <div class="table-cell">
                            <button class="pay-button" onClick={() => this.handlePayBill(invoice.id)}>Pagar factura</button>
                          </div>
                          <div class="table-cell">
                            <button
                              class="detail-button"
                              onClick={() => this.toggleInvoiceDetail(invoice.id)}
                              disabled={this.loadingBillDetail[invoice.id]}
                            >
                              {this.loadingBillDetail[invoice.id] ? 'Cargando...' : 'Ver detalle'}
                              <span class={`arrow ${this.expandedInvoiceId === invoice.id ? 'up' : 'down'}`}>▼</span>
                            </button>
                          </div>
                        </div>
                        <div class={`invoice-detail ${this.expandedInvoiceId === invoice.id ? 'expanded' : ''}`}>
                          <div class="detail-inner">
                            {/* Show loading spinner if fetching details */}
                            {this.loadingBillDetail[invoice.id] && (
                              <div class="detail-loading">
                                <div class="spinner"></div>
                                <p class="loading-text">Cargando detalles de factura...</p>
                              </div>
                            )}
                            {/* Summary sections */}
                            {!this.loadingBillDetail[invoice.id] && this.currentBill && (
                              <div class="bill-summary-sections">
                                {/* Payment Details Section */}
                                {this.currentBill && this.currentBill.pagosRecibidos > 0 && (
                                  <div class="summary-section" data-section-id={`${invoice.id}-payments`}>
                                    <div
                                      class="summary-header"
                                      onClick={() => this.toggleSummarySection(`${invoice.id}-payments`)}
                                    >
                                      <div class="summary-title-container">
                                        <span class="summary-title">Detalle de pagos recibidos</span>
                                        <img
                                          src="/assets/icons/info.png"
                                          alt="Info"
                                          class="info-icon summary-info"
                                          data-tooltip="&lt;strong&gt;Pagos recibidos&lt;/strong&gt;&lt;br/&gt;Historial de pagos realizados en tu cuenta durante el período de facturación actual."
                                        />
                                      </div>
                                      <div class="summary-amount-container">
                                        <span class="summary-amount">{formatCurrency(this.currentBill.pagosRecibidos)}</span>
                                        <span class={`summary-arrow ${this.expandedSummarySection[`${invoice.id}-payments`] ? 'expanded' : ''}`}>
                                          <img src="/assets/icons/chevron-down.png" alt="Arrow" class="arrow-icon" />
                                        </span>
                                      </div>
                                    </div>
                                    <div class={`summary-content ${this.expandedSummarySection[`${invoice.id}-payments`] ? 'expanded' : ''}`}>
                                      {/* Get the bill details from cache */}
                                      {(() => {
                                        const cacheKey = `${this.pendingBill.ban}-${this.pendingBill.cycleRunYear}-${this.pendingBill.cycleRunMonth}-${this.pendingBill.cycleCode}`;
                                        const billDetail = this.billDetails[cacheKey];
                                        return billDetail?.metodosPago?.map((pago, index) => (
                                          <div key={index} class="summary-item payment-item">
                                            <span class="summary-item-label">{pago.metodo}</span>
                                            <span class="summary-item-date">{formatDate(pago.fecha)}</span>
                                            <span class="summary-item-amount">{formatCurrency(pago.monto)}</span>
                                          </div>
                                        ));
                                      })()}
                                    </div>
                                  </div>
                                )}

                                {/* Adjustments Section */}
                                {(() => {
                                  const cacheKey = `${this.pendingBill.ban}-${this.pendingBill.cycleRunYear}-${this.pendingBill.cycleRunMonth}-${this.pendingBill.cycleCode}`;
                                  const billDetail = this.billDetails[cacheKey];
                                  return billDetail?.resumenAjustes?.totalNeto && billDetail.resumenAjustes.totalNeto !== 0 ? (
                                    <div class="summary-section" data-section-id={`${invoice.id}-adjustments`}>
                                      <div
                                        class="summary-header"
                                        onClick={() => this.toggleSummarySection(`${invoice.id}-adjustments`)}
                                      >
                                        <div class="summary-title-container">
                                          <span class="summary-title">Detalle de ajustes</span>
                                          <img
                                            src="/assets/icons/info.png"
                                            alt="Info"
                                            class="info-icon summary-info"
                                            data-tooltip="&lt;strong&gt;Ajustes&lt;/strong&gt;&lt;br/&gt;Créditos y ajustes aplicados a tu cuenta que modifican el balance total."
                                          />
                                        </div>
                                        <div class="summary-amount-container">
                                          <span class="summary-amount">{formatCurrency(billDetail.resumenAjustes.totalNeto)}</span>
                                          <span class={`summary-arrow ${this.expandedSummarySection[`${invoice.id}-adjustments`] ? 'expanded' : ''}`}>
                                            <img src="/assets/icons/chevron-down.png" alt="Arrow" class="arrow-icon" />
                                          </span>
                                        </div>
                                      </div>
                                      <div class={`summary-content ${this.expandedSummarySection[`${invoice.id}-adjustments`] ? 'expanded' : ''}`}>
                                        {billDetail.resumenAjustes.items?.map((ajuste, index) => (
                                          <div key={index} class="summary-item adjustment-item">
                                            <span class="summary-item-label">{ajuste.descripcion || 'PRICE PLAN CHANGE'}</span>
                                            <span class="summary-item-amount-right">
                                              {/*<span style={{ marginRight: '1rem', color: '#666' }}>{formatDate(billDetail.fechaFactura || this.pendingBill.productionDate)}</span>*/}
                                              <span style={{ fontWeight: '600' }}>{formatCurrency(ajuste.total)}</span>
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : null;
                                })()}

                                {/* Adjustments by Subscriber Section */}
                                {(() => {
                                  const cacheKey = `${this.pendingBill.ban}-${this.pendingBill.cycleRunYear}-${this.pendingBill.cycleRunMonth}-${this.pendingBill.cycleCode}`;
                                  const billDetail = this.billDetails[cacheKey];
                                  const ajustesPorSuscriptor = billDetail?.ajustesPorSuscriptor;

                                  if (!ajustesPorSuscriptor || ajustesPorSuscriptor.length === 0) return null;

                                  const totalAjustes = ajustesPorSuscriptor.reduce((sum, ajuste) => sum + ajuste.total, 0);

                                  return (
                                    <div class="summary-section" data-section-id={`${invoice.id}-subscriber-adjustments`}>
                                      <div
                                        class="summary-header"
                                        onClick={() => this.toggleSummarySection(`${invoice.id}-subscriber-adjustments`)}
                                      >
                                        <div class="summary-title-container">
                                          <span class="summary-title">Ajustes por suscriptor</span>
                                          <img
                                            src="/assets/icons/info.png"
                                            alt="Info"
                                            class="info-icon summary-info"
                                            data-tooltip="&lt;strong&gt;Ajustes por suscriptor&lt;/strong&gt;&lt;br/&gt;Ajustes aplicados a cada línea telefónica individual."
                                          />
                                        </div>
                                        <div class="summary-amount-container">
                                          <span class="summary-amount">{formatCurrency(totalAjustes)}</span>
                                          <span class={`summary-arrow ${this.expandedSummarySection[`${invoice.id}-subscriber-adjustments`] ? 'expanded' : ''}`}>
                                            <img src="/assets/icons/chevron-down.png" alt="Arrow" class="arrow-icon" />
                                          </span>
                                        </div>
                                      </div>
                                      <div class={`summary-content subscriber-content ${this.expandedSummarySection[`${invoice.id}-subscriber-adjustments`] ? 'expanded' : ''}`}>
                                        {ajustesPorSuscriptor.map((subscriber, subscriberIndex) => {
                                          const subscriberId = `${invoice.id}-adjustment-sub-${subscriberIndex}`;
                                          return (
                                            <div key={subscriberIndex} class="subscribers-detail-wrapper">
                                              <div class={`subscriber-row ${this.expandedSubscriberId === subscriberId ? 'expanded' : ''}`}>
                                                <div class="subscriber-info">
                                                  <span class="subscriber-number">{subscriber.subscriberNo}</span>
                                                </div>
                                                <div class="subscriber-amount">
                                                  <span class="amount-value">{formatCurrency(subscriber.total)}</span>
                                                  <button
                                                    class="expand-subscriber"
                                                    onClick={() => this.toggleSubscriberDetail(subscriberId)}
                                                  >
                                                    <span class={`expand-icon ${this.expandedSubscriberId === subscriberId ? 'expanded' : ''}`}>
                                                      <img src="/assets/icons/expand-plus.png" alt="Expandir suscriptor" />
                                                    </span>
                                                  </button>
                                                </div>
                                              </div>
                                              <div class={`subscriber-detail ${this.expandedSubscriberId === subscriberId ? 'expanded' : ''}`}>
                                                <div class="adjustment-items-list">
                                                  {subscriber.items.map((item, itemIndex) => (
                                                    <div key={itemIndex} class="adjustment-item-row">
                                                      <span class="adjustment-item-label">{item.descripcion}</span>
                                                      <span class="adjustment-item-amount">{formatCurrency(item.monto)}</span>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* Account Charges Section */}
                                {(() => {
                                  const cargosDeCuenta = this.currentBill?.cargosDeCuenta;

                                  if (!cargosDeCuenta || typeof cargosDeCuenta !== 'object' || !cargosDeCuenta.detalleCargoCuenta || cargosDeCuenta.detalleCargoCuenta.length === 0) {
                                    return null;
                                  }

                                  return (
                                    <div class="summary-section" data-section-id={`${invoice.id}-account-charges`}>
                                      <div
                                        class="summary-header"
                                        onClick={() => this.toggleSummarySection(`${invoice.id}-account-charges`)}
                                      >
                                        <div class="summary-title-container">
                                          <span class="summary-title">{cargosDeCuenta.seccion || 'Detalles de cargos por cuenta'}</span>
                                          <img
                                            src="/assets/icons/info.png"
                                            alt="Info"
                                            class="info-icon summary-info"
                                            data-tooltip="&lt;strong&gt;Cargos de cuenta&lt;/strong&gt;&lt;br/&gt;Detalle de cargos aplicados a nivel de cuenta (no asociados a líneas individuales)."
                                          />
                                        </div>
                                        <div class="summary-amount-container">
                                          <span class="summary-amount">{formatCurrency(cargosDeCuenta.cargo)}</span>
                                          <span class={`summary-arrow ${this.expandedSummarySection[`${invoice.id}-account-charges`] ? 'expanded' : ''}`}>
                                            <img src="/assets/icons/chevron-down.png" alt="Arrow" class="arrow-icon" />
                                          </span>
                                        </div>
                                      </div>
                                      <div class={`summary-content ${this.expandedSummarySection[`${invoice.id}-account-charges`] ? 'expanded' : ''}`}>
                                        {cargosDeCuenta.detalleCargoCuenta.map((item, index) => (
                                          <div key={index} class="account-charge-item">
                                            <div class="account-charge-header">
                                              <span class="account-charge-label">{item.descripcion}</span>
                                              <span class="account-charge-amount">{formatCurrency(item.cargo)}</span>
                                            </div>
                                            {item.detalleCargos && (
                                              <div class="account-charge-breakdown">
                                                <div class="breakdown-item">
                                                  <span class="breakdown-label">Cargo</span>
                                                  <span class="breakdown-value">{formatCurrency(item.detalleCargos.cargo)}</span>
                                                </div>
                                                {item.detalleCargos.descuento !== 0 && (
                                                  <div class="breakdown-item">
                                                    <span class="breakdown-label">Descuento</span>
                                                    <span class="breakdown-value">{formatCurrency(item.detalleCargos.descuento)}</span>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* Subscriber Charges Section */}
                                <div class="summary-section" data-section-id={`${invoice.id}-subscribers`}>
                                  <div
                                    class="summary-header"
                                    onClick={() => this.toggleSummarySection(`${invoice.id}-subscribers`)}
                                  >
                                    <div class="summary-title-container">
                                      <span class="summary-title">Detalle de cargos por suscriptores</span>
                                      <img
                                        src="/assets/icons/info.png"
                                        alt="Info"
                                        class="info-icon summary-info"
                                        data-tooltip="&lt;strong&gt;Cargos por suscriptores&lt;/strong&gt;&lt;br/&gt;Detalle de cargos aplicados a cada línea telefónica asociada a tu cuenta."
                                      />
                                    </div>
                                    <div class="summary-amount-container">
                                      <span class="summary-amount">{formatCurrency(this.currentBill.cargosCorrientes || 0)}</span>
                                      <span class={`summary-arrow ${this.expandedSummarySection[`${invoice.id}-subscribers`] ? 'expanded' : ''}`}>
                                        <img src="/assets/icons/chevron-down.png" alt="Arrow" class="arrow-icon" />
                                      </span>
                                    </div>
                                  </div>
                                  <div class={`summary-content subscriber-content ${this.expandedSummarySection[`${invoice.id}-subscribers`] ? 'expanded' : ''}`}>
                                    {/* Map through all phone numbers in this specific bill */}
                                    {this.currentBill && this.currentBill.detalle && this.currentBill.detalle.map((detail, detailIndex) => {
                              const subscriberId = `${invoice.id}-sub-${detailIndex}`;
                              return (
                                <div class="subscribers-detail-wrapper">
                                  {/* Subscriber details row */}
                                  <div class={`subscriber-row ${this.expandedSubscriberId === subscriberId ? 'expanded' : ''}`}>
                                    <div class="subscriber-info">
                                      <span class="subscriber-number">{detail.numero}</span>
                                    </div>
                                    <div class="subscriber-amount">
                                      <span class="amount-value">{formatCurrency(detail.total)}</span>
                                      <button
                                        class="expand-subscriber"
                                        onClick={() => this.toggleSubscriberDetail(subscriberId)}
                                      >
                                        <span class={`expand-icon ${this.expandedSubscriberId === subscriberId ? 'expanded' : ''}`}>
                                          <img src="/assets/icons/expand-plus.png" alt="Expandir suscriptor" />
                                        </span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Expanded subscriber content - Accordion */}
                                  <div class={`subscriber-detail ${this.expandedSubscriberId === subscriberId ? 'expanded' : ''}`}>
                                    <div class="accordion">
                                      {/* Map through detalleServicios to create accordion items */}
                                      {detail.detalleServicios && detail.detalleServicios.map((servicio, serviceIndex) => {
                                        const accordionId = `${subscriberId}-${serviceIndex}`;
                                    const seccion = servicio.seccion || 'Otros';
                                  const cargo = servicio.cargo || 0;
                                  const periodo = servicio.periodo || '';

                                  return (
                                    <div class="accordion-item" key={accordionId}>
                                      <div
                                        class="accordion-header"
                                        onClick={() => this.toggleAccordionItem(accordionId)}
                                      >
                                        <div class="accordion-header-left">
                                          <span class="accordion-title">{seccion}</span>
                                          <div class="accordion-info">
                                            <img
                                              src="/assets/icons/info.png"
                                              alt="Info"
                                              class="info-icon"
                                              data-tooltip={this.getTooltipContent(servicio.descripcion, seccion)}
                                            />
                                          </div>
                                          {periodo && <span class="accordion-description">{periodo}</span>}
                                        </div>
                                        <div class="accordion-header-right">
                                          <span class="accordion-price">{typeof cargo === 'number' ? formatCurrency(cargo) : ''}</span>
                                          <span class={`accordion-arrow ${this.expandedAccordionItem === accordionId ? 'expanded' : ''}`}>
                                            <img src="/assets/icons/chevron-down.png" alt="Arrow down" class="arrow-icon" />
                                          </span>
                                        </div>
                                      </div>
                                      <div class={`accordion-content ${this.expandedAccordionItem === accordionId ? 'expanded' : ''}`}>
                                        <div class="charges-detail-list">
                                          {
                                            seccion === 'Cargos Mensuales' &&
                                            <h5 class="tipo-linea">{detail.tipoLinea}</h5>
                                          }

                                          {/* Display plan details */}
                                          {servicio.detallePlan && (
                                            <div>
                                              <div class="charge-row">
                                                <span class="charge-label">{servicio.detallePlan.descripcion}</span>
                                                <span class="charge-amount">{formatCurrency(servicio.detallePlan.cargo)}</span>
                                              </div>
                                              {servicio.detallePlan.detalleCargos && servicio.detallePlan.detalleCargos.descuento !== 0 && (
                                                <div class="charge-sublist">
                                                  <div class="charge-subrow">
                                                    <span class="charge-sublabel">Precio regular</span>
                                                    <span class="charge-subamount">{formatCurrency(servicio.detallePlan.detalleCargos.cargo)}</span>
                                                  </div>
                                                  <div class="charge-subrow">
                                                    <span class="charge-sublabel">Descuento</span>
                                                    <span class="charge-subamount">-{formatCurrency(servicio.detallePlan.detalleCargos.descuento)}</span>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          )}

                                          {/* Display equipment details */}
                                          {servicio.detalleEquipos && servicio.detalleEquipos.items && servicio.detalleEquipos.items.map((equipo, equipoIndex) => {
                                            // Determine the icon based on equipment type
                                            let equipmentIcon = '/assets/icons/mobile.png';
                                            if (equipo.tipoEquipo) {
                                              const tipo = equipo.tipoEquipo.toLowerCase();
                                              if (tipo === 'accessory') {
                                                equipmentIcon = '/assets/icons/accesorios.svg';
                                              } else if (tipo === 'tablets' || tipo === 'tablet') {
                                                equipmentIcon = '/assets/icons/tablets.png';
                                              } else if (tipo === 'mobile') {
                                                equipmentIcon = '/assets/icons/mobile.png';
                                              }
                                            }

                                            return (
                                              <div key={equipoIndex}>
                                                <div class="charge-row equipment-row">
                                                  <div class="equipment-info">
                                                    <img src={equipmentIcon} alt={equipo.tipoEquipo} class="equipment-type-icon" />
                                                    <div class="equipment-details">
                                                      <span class="charge-label">{equipo.descripcion}</span>
                                                      {equipo.equipmentInstallmentMessage && (
                                                        <span class="equipment-installment-message">{equipo.equipmentInstallmentMessage}</span>
                                                      )}
                                                    </div>
                                                  </div>
                                                  <span class="charge-amount">{formatCurrency(equipo.cargo)}</span>
                                                </div>
                                                {equipo.detalleCargos && equipo.detalleCargos.descuento !== 0 && (
                                                  <div class="charge-sublist">
                                                    <div class="charge-subrow">
                                                      <span class="charge-sublabel">Precio regular</span>
                                                      <span class="charge-subamount">{formatCurrency(equipo.detalleCargos.cargo)}</span>
                                                    </div>
                                                    <div class="charge-subrow">
                                                      <span class="charge-sublabel">Descuento</span>
                                                      <span class="charge-subamount">-{formatCurrency(equipo.detalleCargos.descuento)}</span>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}

                                          {/* Display tax details */}
                                          {servicio.detalleTaxes && servicio.detalleTaxes.map((tax, taxIndex) => (
                                            <div key={taxIndex} class="charge-row">
                                              <span class="charge-label">{tax.descripcion}</span>
                                              <span class="charge-amount">{formatCurrency(tax.cargo)}</span>
                                            </div>
                                          ))}

                                          {/* Display item details */}
                                          {servicio.detalleItem && servicio.detalleItem.map((item, itemIndex) => (
                                            <div key={itemIndex}>
                                              <div class="charge-row">
                                                <span class="charge-label">{item.descripcion}</span>
                                                <span class="charge-amount">{formatCurrency(item.cargo)}</span>
                                              </div>
                                              {item.detalleCargos && item.detalleCargos.descuento !== 0 && (
                                                <div class="charge-sublist">
                                                  <div class="charge-subrow">
                                                    <span class="charge-sublabel">Precio regular</span>
                                                    <span class="charge-subamount">{formatCurrency(item.detalleCargos.cargo)}</span>
                                                  </div>
                                                  <div class="charge-subrow">
                                                    <span class="charge-sublabel">Descuento</span>
                                                    <span class="charge-subamount">-{formatCurrency(item.detalleCargos.descuento)}</span>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          ))}

                                          {/* Keep old consumption details for fallback */}
                                          {servicio.detalleConsumo && (
                                            <>
                                              {servicio.detalleConsumo.llamadas && (
                                                <>
                                                  <div class="charge-row">
                                                    <span class="charge-label">Llamadas</span>
                                                    <span class="charge-amount">$0.00</span>
                                                  </div>
                                                  <div class="charge-sublist">
                                                    {servicio.detalleConsumo.llamadas.locales && (
                                                      <div class="charge-subrow">
                                                        <span class="charge-sublabel">Locales: {servicio.detalleConsumo.llamadas.locales.unidades} llamadas - {servicio.detalleConsumo.llamadas.locales.minutos} minutos</span>
                                                        <span class="charge-subamount">{formatCurrency(servicio.detalleConsumo.llamadas.locales.cargo)}</span>
                                                      </div>
                                                    )}
                                                    {servicio.detalleConsumo.llamadas.largaDistancia && servicio.detalleConsumo.llamadas.largaDistancia.unidades > 0 && (
                                                      <div class="charge-subrow">
                                                        <span class="charge-sublabel">Larga distancia: {servicio.detalleConsumo.llamadas.largaDistancia.unidades} llamadas - {servicio.detalleConsumo.llamadas.largaDistancia.minutos} minutos</span>
                                                        <span class="charge-subamount">{formatCurrency(servicio.detalleConsumo.llamadas.largaDistancia.cargo)}</span>
                                                      </div>
                                                    )}
                                                  </div>
                                                </>
                                              )}

                                              {/* Messages section */}
                                              {servicio.detalleConsumo.mensajes && (
                                                <>
                                                  <div class="charge-divider"></div>
                                                  <div class="charge-row">
                                                    <span class="charge-label">Mensajes</span>
                                                    <span class="charge-amount">$0.00</span>
                                                  </div>
                                                  <div class="charge-sublist">
                                                    {servicio.detalleConsumo.mensajes.texto && servicio.detalleConsumo.mensajes.texto.unidades > 0 && (
                                                      <div class="charge-subrow">
                                                        <span class="charge-sublabel">Mensajes de texto: {servicio.detalleConsumo.mensajes.texto.unidades}</span>
                                                        <span class="charge-subamount">{formatCurrency(servicio.detalleConsumo.mensajes.texto.cargo)}</span>
                                                      </div>
                                                    )}
                                                  </div>
                                                </>
                                              )}

                                              {/* Data section */}
                                              {servicio.detalleConsumo.dataVolume && servicio.detalleConsumo.dataVolume.data && (
                                                <>
                                                  <div class="charge-divider"></div>
                                                  <div class="charge-row">
                                                    <span class="charge-label">Datos</span>
                                                    <span class="charge-amount">$0.00</span>
                                                  </div>
                                                  <div class="charge-sublist">
                                                    <div class="charge-subrow">
                                                      <span class="charge-sublabel">Volumen de datos: {(servicio.detalleConsumo.dataVolume.data.unidades / 1024 / 1024).toFixed(2)} MB</span>
                                                      <span class="charge-subamount">{formatCurrency(servicio.detalleConsumo.dataVolume.data.cargo)}</span>
                                                    </div>
                                                  </div>
                                                </>
                                              )}
                                            </>
                                          )}

                                          {/* Equipment details */}
                                          {servicio.detalleEquipos && servicio.detalleEquipos.descripcion && (
                                            <>
                                              <div class="charge-row">
                                                <span class="charge-label">{servicio.detalleEquipos.descripcion}</span>
                                                <span class="charge-amount">{formatCurrency(servicio.detalleEquipos.cargo)}</span>
                                              </div>
                                              {servicio.detalleEquipos.detalleCargos && servicio.detalleEquipos.detalleCargos.descuento && servicio.detalleEquipos.detalleCargos.descuento !== 0 && (
                                                <div class="charge-sublist">
                                                  <div class="charge-subrow">
                                                    <span class="charge-sublabel">Precio regular</span>
                                                    <span class="charge-subamount">{formatCurrency(servicio.detalleEquipos.detalleCargos.cargo)}</span>
                                                  </div>
                                                  <div class="charge-subrow">
                                                    <span class="charge-sublabel">Descuento</span>
                                                    <span class="charge-subamount">-{formatCurrency(servicio.detalleEquipos.detalleCargos.descuento)}</span>
                                                  </div>
                                                </div>
                                              )}
                                            </>
                                          )}

                                          {/* Tax details */}
                                          {servicio.detalle && (
                                            <div class="charge-sublist">
                                              {Object.entries(servicio.detalle).map(([key, value]) => (
                                                <div class="charge-subrow" key={key}>
                                                  <span class="charge-sublabel">{key}</span>
                                                  <span class="charge-subamount">{formatCurrency(value as number)}</span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                      })}

                                      {/* Cargos por Eventos - Event Charges Section */}
                                      {detail.cargosPorEventos && (
                                        <div class="accordion-item event-charges-accordion">
                                          <div
                                            class="accordion-header"
                                            onClick={() => this.toggleAccordionItem(`${subscriberId}-event-charges`)}
                                          >
                                            <div class="accordion-header-left">
                                              <span class="accordion-title">Cargos por Eventos</span>
                                              <div class="accordion-info">
                                                <img
                                                  src="/assets/icons/info.png"
                                                  alt="Info"
                                                  class="info-icon"
                                                  data-tooltip="&lt;strong&gt;Cargos por Eventos&lt;/strong&gt;&lt;br/&gt;Cargos por uso de mensajes de texto y llamadas realizadas durante el período de facturación."
                                                />
                                              </div>
                                            </div>
                                            <div class="accordion-header-right">
                                              <span class="accordion-price">{formatCurrency(detail.cargosPorEventos.totalCargosEventos)}</span>
                                              <span class={`accordion-arrow ${this.expandedAccordionItem === `${subscriberId}-event-charges` ? 'expanded' : ''}`}>
                                                <img src="/assets/icons/chevron-down.png" alt="Arrow down" class="arrow-icon" />
                                              </span>
                                            </div>
                                          </div>
                                          <div class={`accordion-content ${this.expandedAccordionItem === `${subscriberId}-event-charges` ? 'expanded' : ''}`}>
                                            <div class="event-charges-content">
                                              {/* Mensajes de Texto Section */}
                                              <div class="event-charge-section">
                                                <div class="event-charge-header">
                                                  <h5 class="event-charge-title">Mensajes de Texto</h5>
                                                  <button
                                                    class="event-detail-button"
                                                    onClick={() => this.openEventModal('mensajes', detail.cargosPorEventos.mensajes.detalle)}
                                                  >
                                                    Ver detalle
                                                  </button>
                                                </div>
                                                <div class="event-charge-summary">
                                                  <div class="event-summary-row">
                                                    <span class="event-summary-label">Total de mensajes:</span>
                                                    <span class="event-summary-value">{detail.cargosPorEventos.mensajes.resumen.cantidad}</span>
                                                  </div>
                                                  <div class="event-summary-row">
                                                    <span class="event-summary-label">SMS:</span>
                                                    <span class="event-summary-value">{detail.cargosPorEventos.mensajes.resumen.desglose.sms}</span>
                                                  </div>
                                                  <div class="event-summary-row">
                                                    <span class="event-summary-label">MMS:</span>
                                                    <span class="event-summary-value">{detail.cargosPorEventos.mensajes.resumen.desglose.mms}</span>
                                                  </div>
                                                  <div class="event-summary-row total">
                                                    <span class="event-summary-label">Cargo total:</span>
                                                    <span class="event-summary-value">{formatCurrency(detail.cargosPorEventos.mensajes.resumen.cargo)}</span>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Llamadas Section */}
                                              <div class="event-charge-section">
                                                <div class="event-charge-header">
                                                  <h5 class="event-charge-title">Llamadas</h5>
                                                  <button
                                                    class="event-detail-button"
                                                    onClick={() => this.openEventModal('llamadas', detail.cargosPorEventos.llamadas.detalle)}
                                                  >
                                                    Ver detalle
                                                  </button>
                                                </div>
                                                <div class="event-charge-summary">
                                                  <div class="event-summary-row">
                                                    <span class="event-summary-label">Total de llamadas:</span>
                                                    <span class="event-summary-value">{detail.cargosPorEventos.llamadas.resumen.cantidad}</span>
                                                  </div>
                                                  <div class="event-summary-row">
                                                    <span class="event-summary-label">Total de minutos:</span>
                                                    <span class="event-summary-value">{detail.cargosPorEventos.llamadas.resumen.minutos}</span>
                                                  </div>
                                                  <div class="event-summary-row">
                                                    <span class="event-summary-label">Locales:</span>
                                                    <span class="event-summary-value">{detail.cargosPorEventos.llamadas.resumen.desglose.locales}</span>
                                                  </div>
                                                  <div class="event-summary-row">
                                                    <span class="event-summary-label">Larga distancia:</span>
                                                    <span class="event-summary-value">{detail.cargosPorEventos.llamadas.resumen.desglose.largaDistancia}</span>
                                                  </div>
                                                  <div class="event-summary-row">
                                                    <span class="event-summary-label">Internacionales:</span>
                                                    <span class="event-summary-value">{detail.cargosPorEventos.llamadas.resumen.desglose.internacionales}</span>
                                                  </div>
                                                  <div class="event-summary-row total">
                                                    <span class="event-summary-label">Cargo total:</span>
                                                    <span class="event-summary-value">{formatCurrency(detail.cargosPorEventos.llamadas.resumen.cargo)}</span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Pay button for mobile - only show for current bill */}
                            {!this.loadingBillDetail[invoice.id] && (
                              <div class="mobile-pay-button-container">
                                <button class="pay-button" onClick={() => this.handlePayBill(invoice.id)}>
                                  Pagar factura
                                </button>
                              </div>
                            )}

                            {/* Actions row */}
                            <div class="invoice-actions">
                            <div class="actions-left">
                              <a href="#" class="action-link" onClick={(e) => { e.preventDefault(); this.handleQuestionsPressed(); }}>¿Tienes dudas?</a>
                              <span class="action-separator">|</span>
                              <a href="#" class="action-link" onClick={(e) => { e.preventDefault(); this.handleContactPressed(); }}>Contáctanos aquí</a>
                              <span class="action-separator">|</span>
                              <a href="https://www.claropr.com/personas/app/reclamacion-de-cargos/" class="action-link" target="_blank" rel="noopener noreferrer">Inicia tu reclamo aqui</a>
                            </div>
                            <div class="actions-right">
                              <a href="#" class="action-link" onClick={(e) => { e.preventDefault(); this.handleDownloadBills(); }}>Descarga mi factura</a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                    </>
                  ) : (
                    <div class="no-invoices-message">
                      <p>
                        No encontramos facturas para este número de suscriptor, si esta información es incorrecta, por favor comunícate a servicio al cliente al{' '}
                        <a href="tel:787-775-0000" class="phone-link">787-775-0000</a>
                      </p>
                    </div>
                  )}
                </div>
              )}
              {this.activeTab === 'previous' && (
                <div class="invoice-table">
                  {this.previousBills.length > 0 ? (
                    <>
                      <div class="table-header history-table-header">
                        <div class="header-cell">Fecha</div>
                        <div class="header-cell">Monto</div>
                        <div class="header-cell">Estado</div>
                        <div class="header-cell">Vencimiento</div>
                        <div class="header-cell"></div>
                      </div>
                      {this.previousBills.map((bill, index) => {
                        const billId = `prev-${index}`;
                        const isPaid = bill.pagosRecibidos >= bill.totalActual;
                        return (
                          <div key={billId} class={`table-row-container ${this.expandedInvoiceId === billId ? 'expanded' : ''}`}>
                            <div class="table-row history-table-row">
                              <div class="table-cell">{formatDate(bill.fechaFactura)}</div>
                              <div class="table-cell cell-amount">{formatCurrency(bill.totalActual)}</div>
                              <div class="table-cell">
                                <span class={`status ${isPaid ? 'pagada' : 'vencida'}`}>
                                  {isPaid ? 'Pagada' : 'Vencida'}
                                </span>
                              </div>
                              <div class="table-cell">{formatDate(bill.fechaVencimiento)}</div>
                              <div class="table-cell">
                                <button
                                  class="detail-button"
                                  onClick={() => this.toggleInvoiceDetail(billId)}
                                  disabled={this.loadingHistoryDetail[billId]}
                                >
                                  {this.loadingHistoryDetail[billId] ? 'Cargando...' : 'Ver detalle'}
                                  <span class={`arrow ${this.expandedInvoiceId === billId ? 'up' : 'down'}`}>▼</span>
                                </button>
                              </div>
                            </div>
                            <div class={`invoice-detail ${this.expandedInvoiceId === billId ? 'expanded' : ''}`}>
                              <div class="detail-inner">
                                {/* Show loading spinner if fetching details */}
                                {this.loadingHistoryDetail[billId] && (
                                  <div class="detail-loading">
                                    <div class="spinner"></div>
                                    <p class="loading-text">Cargando detalles de factura...</p>
                                  </div>
                                )}
                                {/* Summary sections */}
                                {!this.loadingHistoryDetail[billId] && this.previousBills[index] && (
                                  <div class="bill-summary-sections">
                                    {/* Payment Details Section */}
                                    {this.previousBills[index] && this.previousBills[index].pagosRecibidos > 0 && (
                                      <div class="summary-section" data-section-id={`${billId}-payments`}>
                                        <div
                                          class="summary-header"
                                          onClick={() => this.toggleSummarySection(`${billId}-payments`)}
                                        >
                                          <div class="summary-title-container">
                                            <span class="summary-title">Detalle de pagos recibidos</span>
                                            <img
                                              src="/assets/icons/info.png"
                                              alt="Info"
                                              class="info-icon summary-info"
                                              data-tooltip="&lt;strong&gt;Pagos recibidos&lt;/strong&gt;&lt;br/&gt;Historial de pagos realizados en tu cuenta durante el período de facturación actual."
                                            />
                                          </div>
                                          <div class="summary-amount-container">
                                            <span class="summary-amount">{formatCurrency(this.previousBills[index].pagosRecibidos)}</span>
                                            <span class={`summary-arrow ${this.expandedSummarySection[`${billId}-payments`] ? 'expanded' : ''}`}>
                                              <img src="/assets/icons/chevron-down.png" alt="Arrow" class="arrow-icon" />
                                            </span>
                                          </div>
                                        </div>
                                        <div class={`summary-content ${this.expandedSummarySection[`${billId}-payments`] ? 'expanded' : ''}`}>
                                          {/* Get the bill details from cache */}
                                          {(() => {
                                            const previousBill = this.previousBills[index];
                                            const cacheKey = `${previousBill.ban}-${previousBill.cycleRunYear}-${previousBill.cycleRunMonth}-${previousBill.cycleCode}`;
                                            const billDetail = this.billDetails[cacheKey];
                                            return billDetail?.metodosPago?.map((pago, pagoIndex) => (
                                              <div key={pagoIndex} class="summary-item payment-item">
                                                <span class="summary-item-label">{pago.metodo}</span>
                                                <span class="summary-item-date">{formatDate(pago.fecha)}</span>
                                                <span class="summary-item-amount">{formatCurrency(pago.monto)}</span>
                                              </div>
                                            ));
                                          })()}
                                        </div>
                                      </div>
                                    )}

                                    {/* Adjustments Section */}
                                    {(() => {
                                      const previousBill = this.previousBills[index];
                                      const cacheKey = `${previousBill.ban}-${previousBill.cycleRunYear}-${previousBill.cycleRunMonth}-${previousBill.cycleCode}`;
                                      const billDetail = this.billDetails[cacheKey];
                                      return billDetail?.resumenAjustes?.totalNeto && billDetail.resumenAjustes.totalNeto !== 0 ? (
                                        <div class="summary-section" data-section-id={`${billId}-adjustments`}>
                                          <div
                                            class="summary-header"
                                            onClick={() => this.toggleSummarySection(`${billId}-adjustments`)}
                                          >
                                            <div class="summary-title-container">
                                              <span class="summary-title">Detalle de ajustes</span>
                                              <img
                                                src="/assets/icons/info.png"
                                                alt="Info"
                                                class="info-icon summary-info"
                                                data-tooltip="&lt;strong&gt;Ajustes&lt;/strong&gt;&lt;br/&gt;Créditos y ajustes aplicados a tu cuenta que modifican el balance total."
                                              />
                                            </div>
                                            <div class="summary-amount-container">
                                              <span class="summary-amount">{formatCurrency(billDetail.resumenAjustes.totalNeto)}</span>
                                              <span class={`summary-arrow ${this.expandedSummarySection[`${billId}-adjustments`] ? 'expanded' : ''}`}>
                                                <img src="/assets/icons/chevron-down.png" alt="Arrow" class="arrow-icon" />
                                              </span>
                                            </div>
                                          </div>
                                          <div class={`summary-content ${this.expandedSummarySection[`${billId}-adjustments`] ? 'expanded' : ''}`}>
                                            {billDetail.resumenAjustes.items?.map((ajuste, ajusteIndex) => (
                                              <div key={ajusteIndex} class="summary-item adjustment-item">
                                                <span class="summary-item-label">{ajuste.descripcion || 'PRICE PLAN CHANGE'}</span>
                                                <span class="summary-item-amount-right">
                                                  <span style={{ fontWeight: '600' }}>{formatCurrency(ajuste.total)}</span>
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ) : null;
                                    })()}

                                    {/* Adjustments by Subscriber Section */}
                                    {(() => {
                                      const previousBill = this.previousBills[index];
                                      const cacheKey = `${previousBill.ban}-${previousBill.cycleRunYear}-${previousBill.cycleRunMonth}-${previousBill.cycleCode}`;
                                      const billDetail = this.billDetails[cacheKey];
                                      const ajustesPorSuscriptor = billDetail?.ajustesPorSuscriptor;

                                      if (!ajustesPorSuscriptor || ajustesPorSuscriptor.length === 0) return null;

                                      const totalAjustes = ajustesPorSuscriptor.reduce((sum, ajuste) => sum + ajuste.total, 0);

                                      return (
                                        <div class="summary-section" data-section-id={`${billId}-subscriber-adjustments`}>
                                          <div
                                            class="summary-header"
                                            onClick={() => this.toggleSummarySection(`${billId}-subscriber-adjustments`)}
                                          >
                                            <div class="summary-title-container">
                                              <span class="summary-title">Ajustes por suscriptor</span>
                                              <img
                                                src="/assets/icons/info.png"
                                                alt="Info"
                                                class="info-icon summary-info"
                                                data-tooltip="&lt;strong&gt;Ajustes por suscriptor&lt;/strong&gt;&lt;br/&gt;Ajustes aplicados a cada línea telefónica individual."
                                              />
                                            </div>
                                            <div class="summary-amount-container">
                                              <span class="summary-amount">{formatCurrency(totalAjustes)}</span>
                                              <span class={`summary-arrow ${this.expandedSummarySection[`${billId}-subscriber-adjustments`] ? 'expanded' : ''}`}>
                                                <img src="/assets/icons/chevron-down.png" alt="Arrow" class="arrow-icon" />
                                              </span>
                                            </div>
                                          </div>
                                          <div class={`summary-content subscriber-content ${this.expandedSummarySection[`${billId}-subscriber-adjustments`] ? 'expanded' : ''}`}>
                                            {ajustesPorSuscriptor.map((subscriber, subscriberIndex) => {
                                              const subscriberId = `${billId}-adjustment-sub-${subscriberIndex}`;
                                              return (
                                                <div key={subscriberIndex} class="subscribers-detail-wrapper">
                                                  <div class={`subscriber-row ${this.expandedSubscriberId === subscriberId ? 'expanded' : ''}`}>
                                                    <div class="subscriber-info">
                                                      <span class="subscriber-number">{subscriber.subscriberNo}</span>
                                                    </div>
                                                    <div class="subscriber-amount">
                                                      <span class="amount-value">{formatCurrency(subscriber.total)}</span>
                                                      <button
                                                        class="expand-subscriber"
                                                        onClick={() => this.toggleSubscriberDetail(subscriberId)}
                                                      >
                                                        <span class={`expand-icon ${this.expandedSubscriberId === subscriberId ? 'expanded' : ''}`}>
                                                          <img src="/assets/icons/expand-plus.png" alt="Expandir suscriptor" />
                                                        </span>
                                                      </button>
                                                    </div>
                                                  </div>
                                                  <div class={`subscriber-detail ${this.expandedSubscriberId === subscriberId ? 'expanded' : ''}`}>
                                                    <div class="adjustment-items-list">
                                                      {subscriber.items.map((item, itemIndex) => (
                                                        <div key={itemIndex} class="adjustment-item-row">
                                                          <span class="adjustment-item-label">{item.descripcion}</span>
                                                          <span class="adjustment-item-amount">{formatCurrency(item.monto)}</span>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    })()}

                                    {/* Subscriber Charges Section */}
                                    <div class="summary-section" data-section-id={`${billId}-subscribers`}>
                                      <div
                                        class="summary-header"
                                        onClick={() => this.toggleSummarySection(`${billId}-subscribers`)}
                                      >
                                        <div class="summary-title-container">
                                          <span class="summary-title">Detalle de cargos por suscriptores</span>
                                          <img
                                            src="/assets/icons/info.png"
                                            alt="Info"
                                            class="info-icon summary-info"
                                            data-tooltip="&lt;strong&gt;Cargos por suscriptores&lt;/strong&gt;&lt;br/&gt;Detalle de cargos aplicados a cada línea telefónica asociada a tu cuenta."
                                          />
                                        </div>
                                        <div class="summary-amount-container">
                                          <span class="summary-amount">{formatCurrency(this.previousBills[index].cargosCorrientes || 0)}</span>
                                          <span class={`summary-arrow ${this.expandedSummarySection[`${billId}-subscribers`] ? 'expanded' : ''}`}>
                                            <img src="/assets/icons/chevron-down.png" alt="Arrow" class="arrow-icon" />
                                          </span>
                                        </div>
                                      </div>
                                      <div class={`summary-content subscriber-content ${this.expandedSummarySection[`${billId}-subscribers`] ? 'expanded' : ''}`}>
                                        {/* Map through all phone numbers in this specific bill */}
                                        {this.previousBills[index] && this.previousBills[index].detalle && this.previousBills[index].detalle.map((detail, detailIndex) => {
                                          const subscriberId = `${billId}-sub-${detailIndex}`;
                                          return (
                                            <div class="subscribers-detail-wrapper">
                                              {/* Subscriber details row */}
                                              <div class={`subscriber-row ${this.expandedSubscriberId === subscriberId ? 'expanded' : ''}`}>
                                        <div class="subscriber-info">
                                          <span class="subscriber-number">{detail.numero}</span>
                                        </div>
                                        <div class="subscriber-amount">
                                          <span class="amount-value">{formatCurrency(detail.total)}</span>
                                          <button
                                            class="expand-subscriber"
                                            onClick={() => this.toggleSubscriberDetail(subscriberId)}
                                          >
                                            <span class={`expand-icon ${this.expandedSubscriberId === subscriberId ? 'expanded' : ''}`}>
                                              <img src="/assets/icons/expand-plus.png" alt="Expandir suscriptor" />
                                            </span>
                                          </button>
                                        </div>
                                      </div>

                                      {/* Expanded subscriber content - Accordion */}
                                      <div class={`subscriber-detail ${this.expandedSubscriberId === subscriberId ? 'expanded' : ''}`}>
                                        <div class="accordion">
                                          {/* Map through detalleServicios to create accordion items */}
                                          {detail.detalleServicios.map((servicio, serviceIndex) => {
                                            const accordionId = `${subscriberId}-${serviceIndex}`;
                                            const seccion = servicio.seccion || servicio.descripcion || 'Otros';
                                            const cargo = servicio.cargo || 0;
                                            const periodo = servicio.periodo || '';

                                            return (
                                              <div class="accordion-item" key={accordionId}>
                                                <div
                                                  class="accordion-header"
                                                  onClick={() => this.toggleAccordionItem(accordionId)}
                                                >
                                                  <div class="accordion-header-left">
                                                    <span class="accordion-title">{seccion}</span>
                                                    <div class="accordion-info">
                                                      <img
                                                        src="/assets/icons/info.png"
                                                        alt="Info"
                                                        class="info-icon"
                                                        data-tooltip={this.getTooltipContent(servicio.descripcion, seccion)}
                                                      />
                                                    </div>
                                                    {periodo && <span class="accordion-description">{periodo}</span>}
                                                  </div>
                                                  <div class="accordion-header-right">
                                                    <span class="accordion-price">{typeof cargo === 'number' ? formatCurrency(cargo) : ''}</span>
                                                    <span class={`accordion-arrow ${this.expandedAccordionItem === accordionId ? 'expanded' : ''}`}>
                                                      <img src="/assets/icons/chevron-down.png" alt="Arrow down" class="arrow-icon" />
                                                    </span>
                                                  </div>
                                                </div>
                                                <div class={`accordion-content ${this.expandedAccordionItem === accordionId ? 'expanded' : ''}`}>
                                                  <div class="charges-detail-list">
                                                    {
                                                      seccion === 'Cargos Mensuales' &&
                                                      <h5 class="tipo-linea">{detail.tipoLinea}</h5>
                                                    }

                                                    {/* Display plan details */}
                                                    {servicio.detallePlan && (
                                                      <div>
                                                        <div class="charge-row">
                                                          <span class="charge-label">{servicio.detallePlan.descripcion}</span>
                                                          <span class="charge-amount">{formatCurrency(servicio.detallePlan.cargo)}</span>
                                                        </div>
                                                        {servicio.detallePlan.detalleCargos && servicio.detallePlan.detalleCargos.descuento !== 0 && (
                                                          <div class="charge-sublist">
                                                            <div class="charge-subrow">
                                                              <span class="charge-sublabel">Precio regular</span>
                                                              <span class="charge-subamount">{formatCurrency(servicio.detallePlan.detalleCargos.cargo)}</span>
                                                            </div>
                                                            <div class="charge-subrow">
                                                              <span class="charge-sublabel">Descuento</span>
                                                              <span class="charge-subamount">-{formatCurrency(servicio.detallePlan.detalleCargos.descuento)}</span>
                                                            </div>
                                                          </div>
                                                        )}
                                                      </div>
                                                    )}

                                                    {/* Display equipment details */}
                                                    {servicio.detalleEquipos && servicio.detalleEquipos.items && servicio.detalleEquipos.items.map((equipo, equipoIndex) => {
                                                      // Determine the icon based on equipment type
                                                      let equipmentIcon = '/assets/icons/mobile.png';
                                                      if (equipo.tipoEquipo) {
                                                        const tipo = equipo.tipoEquipo.toLowerCase();
                                                        if (tipo === 'accessory') {
                                                          equipmentIcon = '/assets/icons/accesorios.svg';
                                                        } else if (tipo === 'tablets' || tipo === 'tablet') {
                                                          equipmentIcon = '/assets/icons/tablets.png';
                                                        } else if (tipo === 'mobile') {
                                                          equipmentIcon = '/assets/icons/mobile.png';
                                                        }
                                                      }

                                                      return (
                                                        <div key={equipoIndex}>
                                                          <div class="charge-row equipment-row">
                                                            <div class="equipment-info">
                                                              <img src={equipmentIcon} alt={equipo.tipoEquipo} class="equipment-type-icon" />
                                                              <div class="equipment-details">
                                                                <span class="charge-label">{equipo.descripcion}</span>
                                                                {equipo.equipmentInstallmentMessage && (
                                                                  <span class="equipment-installment-message">{equipo.equipmentInstallmentMessage}</span>
                                                                )}
                                                              </div>
                                                            </div>
                                                            <span class="charge-amount">{formatCurrency(equipo.cargo)}</span>
                                                          </div>
                                                          {equipo.detalleCargos && equipo.detalleCargos.descuento !== 0 && (
                                                            <div class="charge-sublist">
                                                              <div class="charge-subrow">
                                                                <span class="charge-sublabel">Precio regular</span>
                                                                <span class="charge-subamount">{formatCurrency(equipo.detalleCargos.cargo)}</span>
                                                              </div>
                                                              <div class="charge-subrow">
                                                                <span class="charge-sublabel">Descuento</span>
                                                                <span class="charge-subamount">-{formatCurrency(equipo.detalleCargos.descuento)}</span>
                                                              </div>
                                                            </div>
                                                          )}
                                                        </div>
                                                      );
                                                    })}

                                                    {/* Display tax details */}
                                                    {servicio.detalleTaxes && servicio.detalleTaxes.map((tax, taxIndex) => (
                                                      <div key={taxIndex} class="charge-row">
                                                        <span class="charge-label">{tax.descripcion}</span>
                                                        <span class="charge-amount">{formatCurrency(tax.cargo)}</span>
                                                      </div>
                                                    ))}

                                                    {/* Display item details */}
                                                    {servicio.detalleItem && servicio.detalleItem.map((item, itemIndex) => (
                                                      <div key={itemIndex}>
                                                        <div class="charge-row">
                                                          <span class="charge-label">{item.descripcion}</span>
                                                          <span class="charge-amount">{formatCurrency(item.cargo)}</span>
                                                        </div>
                                                        {item.detalleCargos && item.detalleCargos.descuento !== 0 && (
                                                          <div class="charge-sublist">
                                                            <div class="charge-subrow">
                                                              <span class="charge-sublabel">Precio regular</span>
                                                              <span class="charge-subamount">{formatCurrency(item.detalleCargos.cargo)}</span>
                                                            </div>
                                                            <div class="charge-subrow">
                                                              <span class="charge-sublabel">Descuento</span>
                                                              <span class="charge-subamount">-{formatCurrency(item.detalleCargos.descuento)}</span>
                                                            </div>
                                                          </div>
                                                        )}
                                                      </div>
                                                    ))}

                                                    {/* Keep old consumption details for fallback */}
                                                    {servicio.detalleConsumo && (
                                                      <>
                                                        {servicio.detalleConsumo.llamadas && (
                                                          <>
                                                            <div class="charge-row">
                                                              <span class="charge-label">Llamadas</span>
                                                              <span class="charge-amount">$0.00</span>
                                                            </div>
                                                            <div class="charge-sublist">
                                                              {servicio.detalleConsumo.llamadas.locales && (
                                                                <div class="charge-subrow">
                                                                  <span class="charge-sublabel">Locales: {servicio.detalleConsumo.llamadas.locales.unidades} llamadas - {servicio.detalleConsumo.llamadas.locales.minutos} minutos</span>
                                                                  <span class="charge-subamount">{formatCurrency(servicio.detalleConsumo.llamadas.locales.cargo)}</span>
                                                                </div>
                                                              )}
                                                              {servicio.detalleConsumo.llamadas.largaDistancia && servicio.detalleConsumo.llamadas.largaDistancia.unidades > 0 && (
                                                                <div class="charge-subrow">
                                                                  <span class="charge-sublabel">Larga distancia: {servicio.detalleConsumo.llamadas.largaDistancia.unidades} llamadas - {servicio.detalleConsumo.llamadas.largaDistancia.minutos} minutos</span>
                                                                  <span class="charge-subamount">{formatCurrency(servicio.detalleConsumo.llamadas.largaDistancia.cargo)}</span>
                                                                </div>
                                                              )}
                                                            </div>
                                                          </>
                                                        )}

                                                        {/* Messages section */}
                                                        {servicio.detalleConsumo.mensajes && (
                                                          <>
                                                            <div class="charge-divider"></div>
                                                            <div class="charge-row">
                                                              <span class="charge-label">Mensajes</span>
                                                              <span class="charge-amount">$0.00</span>
                                                            </div>
                                                            <div class="charge-sublist">
                                                              {servicio.detalleConsumo.mensajes.texto && servicio.detalleConsumo.mensajes.texto.unidades > 0 && (
                                                                <div class="charge-subrow">
                                                                  <span class="charge-sublabel">Mensajes de texto: {servicio.detalleConsumo.mensajes.texto.unidades}</span>
                                                                  <span class="charge-subamount">{formatCurrency(servicio.detalleConsumo.mensajes.texto.cargo)}</span>
                                                                </div>
                                                              )}
                                                            </div>
                                                          </>
                                                        )}

                                                        {/* Data section */}
                                                        {servicio.detalleConsumo.dataVolume && servicio.detalleConsumo.dataVolume.data && (
                                                          <>
                                                            <div class="charge-divider"></div>
                                                            <div class="charge-row">
                                                              <span class="charge-label">Datos</span>
                                                              <span class="charge-amount">$0.00</span>
                                                            </div>
                                                            <div class="charge-sublist">
                                                              <div class="charge-subrow">
                                                                <span class="charge-sublabel">Volumen de datos: {(servicio.detalleConsumo.dataVolume.data.unidades / 1024 / 1024).toFixed(2)} MB</span>
                                                                <span class="charge-subamount">{formatCurrency(servicio.detalleConsumo.dataVolume.data.cargo)}</span>
                                                              </div>
                                                            </div>
                                                          </>
                                                        )}
                                                      </>
                                                    )}

                                                    {/* Equipment details */}
                                                    {servicio.detalleEquipos && servicio.detalleEquipos.descripcion && (
                                                      <>
                                                        <div class="charge-row">
                                                          <span class="charge-label">{servicio.detalleEquipos.descripcion}</span>
                                                          <span class="charge-amount">{formatCurrency(servicio.detalleEquipos.cargo)}</span>
                                                        </div>
                                                        {servicio.detalleEquipos.detalleCargos && servicio.detalleEquipos.detalleCargos.descuento && servicio.detalleEquipos.detalleCargos.descuento !== 0 && (
                                                          <div class="charge-sublist">
                                                            <div class="charge-subrow">
                                                              <span class="charge-sublabel">Precio regular</span>
                                                              <span class="charge-subamount">{formatCurrency(servicio.detalleEquipos.detalleCargos.cargo)}</span>
                                                            </div>
                                                            <div class="charge-subrow">
                                                              <span class="charge-sublabel">Descuento</span>
                                                              <span class="charge-subamount">-{formatCurrency(servicio.detalleEquipos.detalleCargos.descuento)}</span>
                                                            </div>
                                                          </div>
                                                        )}
                                                      </>
                                                    )}

                                                    {/* Tax details */}
                                                    {servicio.detalle && (
                                                      <div class="charge-sublist">
                                                        {Object.entries(servicio.detalle).map(([key, value]) => (
                                                          <div class="charge-subrow" key={key}>
                                                            <span class="charge-sublabel">{key}</span>
                                                            <span class="charge-subamount">{formatCurrency(value as number)}</span>
                                                          </div>
                                                        ))}
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}

                                          {/* Cargos por Eventos - Event Charges Section */}
                                          {detail.cargosPorEventos && (
                                            <div class="accordion-item event-charges-accordion">
                                              <div
                                                class="accordion-header"
                                                onClick={() => this.toggleAccordionItem(`${subscriberId}-event-charges`)}
                                              >
                                                <div class="accordion-header-left">
                                                  <span class="accordion-title">Cargos por Eventos</span>
                                                  <div class="accordion-info">
                                                    <img
                                                      src="/assets/icons/info.png"
                                                      alt="Info"
                                                      class="info-icon"
                                                      data-tooltip="&lt;strong&gt;Cargos por Eventos&lt;/strong&gt;&lt;br/&gt;Cargos por uso de mensajes de texto y llamadas realizadas durante el período de facturación."
                                                    />
                                                  </div>
                                                </div>
                                                <div class="accordion-header-right">
                                                  <span class="accordion-price">{formatCurrency(detail.cargosPorEventos.totalCargosEventos)}</span>
                                                  <span class={`accordion-arrow ${this.expandedAccordionItem === `${subscriberId}-event-charges` ? 'expanded' : ''}`}>
                                                    <img src="/assets/icons/chevron-down.png" alt="Arrow down" class="arrow-icon" />
                                                  </span>
                                                </div>
                                              </div>
                                              <div class={`accordion-content ${this.expandedAccordionItem === `${subscriberId}-event-charges` ? 'expanded' : ''}`}>
                                                <div class="event-charges-content">
                                                  {/* Mensajes de Texto Section */}
                                                  <div class="event-charge-section">
                                                    <div class="event-charge-header">
                                                      <h5 class="event-charge-title">Mensajes de Texto</h5>
                                                      <button
                                                        class="event-detail-button"
                                                        onClick={() => this.openEventModal('mensajes', detail.cargosPorEventos.mensajes.detalle)}
                                                      >
                                                        Ver detalle
                                                      </button>
                                                    </div>
                                                    <div class="event-charge-summary">
                                                      <div class="event-summary-row">
                                                        <span class="event-summary-label">Total de mensajes:</span>
                                                        <span class="event-summary-value">{detail.cargosPorEventos.mensajes.resumen.cantidad}</span>
                                                      </div>
                                                      <div class="event-summary-row">
                                                        <span class="event-summary-label">SMS:</span>
                                                        <span class="event-summary-value">{detail.cargosPorEventos.mensajes.resumen.desglose.sms}</span>
                                                      </div>
                                                      <div class="event-summary-row">
                                                        <span class="event-summary-label">MMS:</span>
                                                        <span class="event-summary-value">{detail.cargosPorEventos.mensajes.resumen.desglose.mms}</span>
                                                      </div>
                                                      <div class="event-summary-row total">
                                                        <span class="event-summary-label">Cargo total:</span>
                                                        <span class="event-summary-value">{formatCurrency(detail.cargosPorEventos.mensajes.resumen.cargo)}</span>
                                                      </div>
                                                    </div>
                                                  </div>

                                                  {/* Llamadas Section */}
                                                  <div class="event-charge-section">
                                                    <div class="event-charge-header">
                                                      <h5 class="event-charge-title">Llamadas</h5>
                                                      <button
                                                        class="event-detail-button"
                                                        onClick={() => this.openEventModal('llamadas', detail.cargosPorEventos.llamadas.detalle)}
                                                      >
                                                        Ver detalle
                                                      </button>
                                                    </div>
                                                    <div class="event-charge-summary">
                                                      <div class="event-summary-row">
                                                        <span class="event-summary-label">Total de llamadas:</span>
                                                        <span class="event-summary-value">{detail.cargosPorEventos.llamadas.resumen.cantidad}</span>
                                                      </div>
                                                      <div class="event-summary-row">
                                                        <span class="event-summary-label">Total de minutos:</span>
                                                        <span class="event-summary-value">{detail.cargosPorEventos.llamadas.resumen.minutos}</span>
                                                      </div>
                                                      <div class="event-summary-row">
                                                        <span class="event-summary-label">Locales:</span>
                                                        <span class="event-summary-value">{detail.cargosPorEventos.llamadas.resumen.desglose.locales}</span>
                                                      </div>
                                                      <div class="event-summary-row">
                                                        <span class="event-summary-label">Larga distancia:</span>
                                                        <span class="event-summary-value">{detail.cargosPorEventos.llamadas.resumen.desglose.largaDistancia}</span>
                                                      </div>
                                                      <div class="event-summary-row">
                                                        <span class="event-summary-label">Internacionales:</span>
                                                        <span class="event-summary-value">{detail.cargosPorEventos.llamadas.resumen.desglose.internacionales}</span>
                                                      </div>
                                                      <div class="event-summary-row total">
                                                        <span class="event-summary-label">Cargo total:</span>
                                                        <span class="event-summary-value">{formatCurrency(detail.cargosPorEventos.llamadas.resumen.cargo)}</span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Actions row */}
                                <div class="invoice-actions">
                                  <div class="actions-left">
                                    <a href="#" class="action-link" onClick={(e) => { e.preventDefault(); this.handleQuestionsPressed(); }}>¿Tienes dudas?</a>
                                    <span class="action-separator">|</span>
                                    <a href="#" class="action-link" onClick={(e) => { e.preventDefault(); this.handleContactPressed(); }}>Contáctanos aquí</a>
                                    <span class="action-separator">|</span>
                                    <a href="https://www.claropr.com/personas/app/reclamacion-de-cargos/" class="action-link" target="_blank" rel="noopener noreferrer">Reclamo de cargos</a>
                                  </div>
                                  <div class="actions-right">
                                    <a href="#" class="action-link" onClick={(e) => { e.preventDefault(); this.handleDownloadBills(); }}>Descarga mi factura</a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <div class="no-invoices-message">
                      <p>No hay facturas anteriores disponibles</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    );
  }
}
