import { Component, State, h, Prop, Event, EventEmitter } from '@stencil/core';
import { BillService, Environment, BillApiResponse } from '../../services/bill.service';

interface Invoice {
  id: string;
  title: string;
  date: string;
  amount: string;
  status: string;
}

interface BillDetail {
  numero: string;
  total: number;
  detalleServicios: any[];
}

interface BillData {
  fechaFactura: string;
  fechaVencimiento: string;
  balanceAnterior: number;
  pagosRecibidos: number;
  ajustes: number;
  totalActual: number;
  detalle: BillDetail[];
  metodosPago: any[];
}

interface AccountData {
  cuenta: string;
  cliente: string;
  facturas: BillData[];
}

@Component({
  tag: 'mi-claro-interactive-invoice',
  styleUrl: 'mi-claro-interactive-invoice.css',
  shadow: true,
  assetsDirs: ['assets']
})
export class MiClaroInteractiveInvoice {
  @State() showMoreInfo: boolean = false;
  @State() activeTab: 'current' | 'previous' = 'current';
  @State() expandedInvoiceId: string | null = null;
  @State() expandedSubscriberId: string | null = null;
  @State() expandedAccordionItem: string | null = null;
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
  @Prop() accountList: string[] = [];
  @Prop() environment!: Environment;
  @Prop() token?: string = '';
  @Prop() defaultSelectedAccount?: string = '';
  @Prop() customerName?: string;
  @Prop() billDueDate?: string;
  @Prop() totalAPagar?: number;
  @Prop() balanceVencido?: number;
  @Prop() vencimientoDate?: string;

  @Event() goToSupport: EventEmitter<void>;
  @Event() payPendingBills: EventEmitter<void>;
  @Event() automatePayments: EventEmitter<boolean>;
  @Event() questionsPressed: EventEmitter<void>;
  @Event() contactPressed: EventEmitter<void>;
  @Event() downloadBills: EventEmitter<void>;
  @Event() accountChanged: EventEmitter<string>;

  private invoices: Invoice[] = [];
  private billService: BillService;

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
    if (this.billDetails[cacheKey]) {
      // Already have data and already expanded
      return;
    }

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

      if (detailResponse.isSuccess && detailResponse.data && detailResponse.data.facturas.length > 0) {
        // Cache the bill details
        this.billDetails[cacheKey] = detailResponse.data.facturas[0];

        // Update the current or previous bill with detailed data
        if (isHistoryBill) {
          // Create a new array to trigger re-render in Stencil
          const updatedBills = [...this.previousBills];
          updatedBills[billIndex] = {
            ...updatedBills[billIndex],
            detalle: detailResponse.data.facturas[0].detalle || []
          };
          this.previousBills = updatedBills;
        } else {
          this.currentBill = {
            ...this.currentBill,
            detalle: detailResponse.data.facturas[0].detalle || []
          };
        }
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

  private handleGoToSupport = () => {
    this.goToSupport.emit();
  };

  private toggleAutoPay = () => {
    this.autoPayEnabled = !this.autoPayEnabled;
    this.automatePayments.emit(this.autoPayEnabled);
  };

  private handlePayPendingBills = () => {
    this.payPendingBills.emit();
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

  private calculateChartData = (bills: BillData[]): any[] => {
    if (!bills || bills.length === 0) return [];

    const months = ['Abril', 'Mayo', 'Siguiente Factura'];
    const amounts = bills.slice(-3).map(bill => bill.totalActual);
    const maxAmount = Math.max(...amounts);

    return months.map((month, index) => ({
      month,
      amount: amounts[index] || 0,
      height: amounts[index] ? Math.max((amounts[index] / maxAmount) * 100, 20) : 0,
      isPending: index < bills.length - 1,
      isCurrent: index === bills.length - 1
    }));
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
    this.loadingBillDetail = {};
    this.loadingHistoryDetail = {};
    // Activate loader and fetch new data
    this.fetchInvoiceData(selectedAccount);
  };

  // Removed fetchBillsData - now using API directly

  private formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  private formatCurrency = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '$0.00';
    }
    return `$${amount.toFixed(2)}`;
  };

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
            fechaVencimiento: this.billDueDate || this.pendingBill.billDueDate,
            balanceAnterior: 0, // Not provided by API
            pagosRecibidos: 0, // Not provided by API
            ajustes: 0,
            totalActual: this.totalAPagar || this.pendingBill.totalDueAmt,
            detalle: [], // Will need detail endpoint
            metodosPago: []
          };

          // Map history bills
          this.previousBills = this.historyBills.map(bill => ({
            fechaFactura: bill.productionDate,
            fechaVencimiento: bill.billDueDate,
            balanceAnterior: 0,
            pagosRecibidos: bill.billStatus === 0 ? 0 : bill.totalDueAmt, // Status 0 = pending
            ajustes: 0,
            totalActual: bill.totalDueAmt,
            detalle: [],
            metodosPago: []
          }));

          // Create invoices for display - only show the first bill in "Mi factura" tab
          this.invoices = [{
            id: `bill-0`,
            title: this.customerName || `Cuenta ${this.pendingBill.ban}`,
            date: this.billDueDate ? this.formatDate(this.billDueDate) : this.formatDate(this.pendingBill.productionDate),
            amount: this.totalAPagar ? this.formatCurrency(this.totalAPagar) : this.formatCurrency(this.pendingBill.totalDueAmt),
            status: this.pendingBill.billStatus === 0 ? 'Pendiente' : 'Pagado'
          }];

          // Update invoice data
          this.invoiceData = {
            accountNumber: accountNumber,
            customerName: this.customerName || `Cliente ${accountNumber}`, // Use prop if available
            dueDate: this.billDueDate ? this.formatDate(this.billDueDate) : this.formatDate(this.pendingBill.billDueDate),
            totalAmount: this.totalAPagar ? this.formatCurrency(this.totalAPagar) : this.formatCurrency(this.pendingBill.totalDueAmt),
            invoices: this.invoices,
            planDetails: {
              name: 'Plan Móvil',
              period: `${this.formatDate(this.pendingBill.productionDate)} - ${this.formatDate(this.pendingBill.billDueDate)}`,
              paymentMethod: 'No especificado'
            },
            balanceAnterior: 0,
            pagosRecibidos: 0,
            ajustes: 0
          };

          // Calculate chart data with API bills
          const chartBills = billsResponse.data.slice(0, 3).map(bill => ({
            totalActual: bill.totalDueAmt
          }));
          this.chartData = this.calculateChartData(chartBills as any);
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
        <div class="invoice-grid">
          {/* First Column Container */}
          <div class="first-column">
            {/* Payment Summary Card */}
            <div class="card payment-summary">
              <h2 class="card-title">¡Hola, {this.customerName || this.invoiceData?.customerName || 'María'}!</h2>
              <p class="summary-text">Tu factura vence el {this.billDueDate ? this.formatDate(this.billDueDate) : this.invoiceData?.dueDate || '20 de marzo de 2024'}</p>
              <div class="separator"></div>
              <div class="total-section">
                <p class="total-label">Total a pagar</p>
                <p class="total-amount">{this.totalAPagar ? this.formatCurrency(this.totalAPagar) : this.invoiceData?.totalAmount || '$45.990'}</p>
              </div>
              <div class="separator"></div>

              <div class={`expandable-content ${this.showMoreInfo ? 'expanded' : ''}`}>
                <div class="expandable-inner">
                  <div class="due-section">
                    <p class="due-label">Balance vencido</p>
                    <p class="due-amount">{this.balanceVencido ? this.formatCurrency(this.balanceVencido) : '$57.25'}</p>
                    <p class="due-description">Vencimiento: {this.vencimientoDate ? this.formatDate(this.vencimientoDate) : '05/04/2025'}</p>
                  </div>
                  <div class="separator"></div>

                  {/* Chart Section */}
                  <div class="chart-section">
                    <h3 class="chart-title">Gastos estimados</h3>
                    <div class="chart-container">
                      {this.chartData.map((item, index) => (
                        <div key={index} class="chart-bar-container">
                          <div class="chart-bar-wrapper">
                            <div
                              class={`chart-bar ${item.isPending ? 'pending' : item.isCurrent ? 'current' : 'estimated'}`}
                              style={{ height: `${item.height}%` }}
                            ></div>
                          </div>
                          <div class="chart-amount">{this.formatCurrency(item.amount)}</div>
                          <div class="chart-label">{item.month}</div>
                        </div>
                      ))}
                    </div>

                    {/* Chart Legend */}
                    <div class="chart-legend">
                      <div class="legend-item">
                        <div class="legend-color pending"></div>
                        <span class="legend-text">Pagos pendientes actuales</span>
                      </div>
                      <div class="legend-item">
                        <div class="legend-color current"></div>
                        <span class="legend-text">Gastos mensuales estimados</span>
                      </div>
                    </div>
                  </div>
                  <div class="separator"></div>

                  {/* Auto Pay Section */}
                  <div class="autopay-section">
                    <p class="autopay-question">¿Quieres reducir gastos mensuales?</p>
                    <p class="autopay-description">
                      <span class="autopay-action">Activa el pago automático</span> y recibe $3 de descuento mensual en tus facturas mensuales.
                    </p>

                    <div class="autopay-toggle-container">
                      <span class="toggle-label">Automatizar pago</span>
                      <div
                        class={`toggle-switch ${this.autoPayEnabled ? 'enabled' : ''}`}
                        onClick={this.toggleAutoPay}
                      >
                        <div class="toggle-slider"></div>
                      </div>
                    </div>

                    <button class="pay-pending-button" onClick={this.handlePayPendingBills}>
                      Pagar facturas pendientes
                    </button>
                  </div>
                </div>
              </div>


           <div class="toggle-button-container">
             <button class="toggle-button" onClick={this.toggleShowMore}>
               {this.showMoreInfo ? 'Ver menos' : 'Ver más'}
               <span class={`arrow ${this.showMoreInfo ? 'up' : 'down'}`}>▼</span>
             </button>
           </div>
            </div>

            {/* Promotional Card */}
            <div class="support-card">
              <div class="promo-border-accent"></div>
              <img src="/assets/icons/24-hour.png" alt="Soporte" class="support-image" />
              <button class="support-button" onClick={this.handleGoToSupport}>Ir a soporte</button>
            </div>
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
                        <div class="header-cell">Título de factura</div>
                        <div class="header-cell">Fecha</div>
                        <div class="header-cell">Monto</div>
                        <div class="header-cell">Estado</div>
                        <div class="header-cell"></div>
                        <div class="header-cell"></div>
                      </div>
                      {this.invoices.map(invoice => {
                    const isPaid = invoice.status === 'Pagado';
                    return (
                      <div key={invoice.id} class={`table-row-container ${this.expandedInvoiceId === invoice.id ? 'expanded' : ''}`}>
                        <div class="table-row">
                          <div class="table-cell cell-bold" data-name={invoice.title} data-date={invoice.date}>{invoice.title}</div>
                          <div class="table-cell">{invoice.date}</div>
                          <div class="table-cell cell-amount">{invoice.amount}</div>
                          <div class="table-cell">
                            <span class={`status ${isPaid ? 'pagado' : 'pendiente'}`}>
                              {invoice.status}
                            </span>
                          </div>
                          <div class="table-cell">
                            <button class="pay-button" onClick={() => alert('Pagar factura!')}>Pagar factura</button>
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
                            {/* Map through all phone numbers in this specific bill */}
                            {!this.loadingBillDetail[invoice.id] && this.currentBill && this.currentBill.detalle && this.currentBill.detalle.map((detail, detailIndex) => {
                              const subscriberId = `${invoice.id}-sub-${detailIndex}`;
                              return (
                                <>
                                  {/* Subscriber details row */}
                                  <div class="subscriber-row">
                                    <div class="subscriber-info">
                                      <span class="subscriber-number">{detail.numero}</span>
                                    </div>
                                    <div class="subscriber-amount">
                                      <span class="amount-value">{this.formatCurrency(detail.total)}</span>
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
                                          {seccion === 'Cargos Mensuales' && (
                                            <div class="accordion-info">
                                              <img src="/assets/icons/info.png" alt="Info" class="info-icon" title="¿Qué incluye este cargo? Este monto corresponde al plan móvil activo durante el ciclo de facturación." />
                                            </div>
                                          )}
                                          {periodo && <span class="accordion-description">{periodo}</span>}
                                        </div>
                                        <div class="accordion-header-right">
                                          <span class="accordion-price">{typeof cargo === 'number' ? this.formatCurrency(cargo) : ''}</span>
                                          <span class={`accordion-arrow ${this.expandedAccordionItem === accordionId ? 'expanded' : ''}`}>
                                            <img src="/assets/icons/chevron-down.png" alt="Arrow down" class="info-icon" />
                                          </span>
                                        </div>
                                      </div>
                                      <div class={`accordion-content ${this.expandedAccordionItem === accordionId ? 'expanded' : ''}`}>
                                        <div class="charges-detail-list">
                                          {/* Display plan details */}
                                          {servicio.detallePlan && (
                                            <div class="charge-row">
                                              <span class="charge-label">{servicio.detallePlan.descripcion}</span>
                                              <span class="charge-amount">{this.formatCurrency(servicio.detallePlan.cargo)}</span>
                                            </div>
                                          )}

                                          {/* Display equipment details */}
                                          {servicio.detalleEquipos && servicio.detalleEquipos.items && servicio.detalleEquipos.items.map((equipo, equipoIndex) => (
                                            <div key={equipoIndex}>
                                              <div class="charge-row">
                                                <span class="charge-label">{equipo.descripcion}</span>
                                                <span class="charge-amount">{this.formatCurrency(equipo.cargo)}</span>
                                              </div>
                                              {equipo.detalleCargos && equipo.detalleCargos.descuento !== 0 && (
                                                <div class="charge-sublist">
                                                  <div class="charge-subrow">
                                                    <span class="charge-sublabel">Precio regular</span>
                                                    <span class="charge-subamount">{this.formatCurrency(equipo.detalleCargos.cargo)}</span>
                                                  </div>
                                                  <div class="charge-subrow">
                                                    <span class="charge-sublabel">Descuento</span>
                                                    <span class="charge-subamount">-{this.formatCurrency(Math.abs(equipo.detalleCargos.descuento))}</span>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          ))}

                                          {/* Display tax details */}
                                          {servicio.detalleTaxes && servicio.detalleTaxes.map((tax, taxIndex) => (
                                            <div key={taxIndex} class="charge-row">
                                              <span class="charge-label">{tax.descripcion}</span>
                                              <span class="charge-amount">{this.formatCurrency(tax.cargo)}</span>
                                            </div>
                                          ))}

                                          {/* Display item details */}
                                          {servicio.detalleItem && servicio.detalleItem.map((item, itemIndex) => (
                                            <div key={itemIndex} class="charge-row">
                                              <span class="charge-label">{item.descripcion}</span>
                                              <span class="charge-amount">{this.formatCurrency(item.cargo)}</span>
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
                                                        <span class="charge-subamount">{this.formatCurrency(servicio.detalleConsumo.llamadas.locales.cargo)}</span>
                                                      </div>
                                                    )}
                                                    {servicio.detalleConsumo.llamadas.largaDistancia && servicio.detalleConsumo.llamadas.largaDistancia.unidades > 0 && (
                                                      <div class="charge-subrow">
                                                        <span class="charge-sublabel">Larga distancia: {servicio.detalleConsumo.llamadas.largaDistancia.unidades} llamadas - {servicio.detalleConsumo.llamadas.largaDistancia.minutos} minutos</span>
                                                        <span class="charge-subamount">{this.formatCurrency(servicio.detalleConsumo.llamadas.largaDistancia.cargo)}</span>
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
                                                        <span class="charge-subamount">{this.formatCurrency(servicio.detalleConsumo.mensajes.texto.cargo)}</span>
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
                                                      <span class="charge-subamount">{this.formatCurrency(servicio.detalleConsumo.dataVolume.data.cargo)}</span>
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
                                                <span class="charge-amount">{this.formatCurrency(servicio.detalleEquipos.cargo)}</span>
                                              </div>
                                              {servicio.detalleEquipos.detalleCargos && servicio.detalleEquipos.detalleCargos.descuento && servicio.detalleEquipos.detalleCargos.descuento !== 0 && (
                                                <div class="charge-sublist">
                                                  <div class="charge-subrow">
                                                    <span class="charge-sublabel">Precio regular</span>
                                                    <span class="charge-subamount">{this.formatCurrency(servicio.detalleEquipos.detalleCargos.cargo)}</span>
                                                  </div>
                                                  <div class="charge-subrow">
                                                    <span class="charge-sublabel">Descuento</span>
                                                    <span class="charge-subamount">-{this.formatCurrency(Math.abs(servicio.detalleEquipos.detalleCargos.descuento))}</span>
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
                                                  <span class="charge-subamount">{this.formatCurrency(value as number)}</span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                      })}
                                    </div>
                                  </div>
                                </>
                              );
                            })}

                            {/* Actions row */}
                            <div class="invoice-actions">
                            <div class="actions-left">
                              <a href="#" class="action-link" onClick={(e) => { e.preventDefault(); this.handleQuestionsPressed(); }}>¿Tienes dudas?</a>
                              <span class="action-separator">|</span>
                              <a href="#" class="action-link" onClick={(e) => { e.preventDefault(); this.handleContactPressed(); }}>Contáctanos aquí</a>
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
                      <div class="table-header">
                        <div class="header-cell">Título de Factura</div>
                        <div class="header-cell">Fecha</div>
                        <div class="header-cell">Monto</div>
                        <div class="header-cell">Estado</div>
                        <div class="header-cell"></div>
                        <div class="header-cell"></div>
                      </div>
                      {this.previousBills.map((bill, index) => {
                        const billId = `prev-${index}`;
                        // Use the customer name from invoiceData which comes from the API
                        const customerName = this.invoiceData?.customerName || `Cliente ${this.selectedAccount}`;
                        const isPaid = bill.pagosRecibidos >= bill.totalActual;
                        return (
                          <div key={billId} class={`table-row-container ${this.expandedInvoiceId === billId ? 'expanded' : ''}`}>
                            <div class="table-row">
                              <div class="table-cell cell-bold" data-name={customerName} data-date={this.formatDate(bill.fechaFactura)}>{customerName}</div>
                              <div class="table-cell">{this.formatDate(bill.fechaFactura)}</div>
                              <div class="table-cell cell-amount">{this.formatCurrency(bill.totalActual)}</div>
                              <div class="table-cell">
                                <span class={`status ${isPaid ? 'pagada' : 'vencida'}`}>
                                  {isPaid ? 'Pagada' : 'Vencida'}
                                </span>
                              </div>
                              <div class="table-cell">
                                <button class={`pay-button ${isPaid ? 'disabled' : ''}`} disabled={isPaid} onClick={() => !isPaid && alert('Pagar factura!')}>
                                  Pagar factura
                                </button>
                              </div>
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
                                {/* Map through all phone numbers in this specific bill */}
                                {!this.loadingHistoryDetail[billId] && this.previousBills[index] && this.previousBills[index].detalle && this.previousBills[index].detalle.map((detail, detailIndex) => {
                                  const subscriberId = `${billId}-sub-${detailIndex}`;
                                  return (
                                    <>
                                      {/* Subscriber details row */}
                                      <div class="subscriber-row">
                                        <div class="subscriber-info">
                                          <span class="subscriber-number">{detail.numero}</span>
                                        </div>
                                        <div class="subscriber-amount">
                                          <span class="amount-value">{this.formatCurrency(detail.total)}</span>
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
                                                    {seccion === 'Cargos Mensuales' && (
                                                      <div class="accordion-info">
                                                        <img src="/assets/icons/info.png" alt="Info" class="info-icon" title="¿Qué incluye este cargo? Este monto corresponde al plan móvil activo durante el ciclo de facturación." />
                                                      </div>
                                                    )}
                                                    {periodo && <span class="accordion-description">{periodo}</span>}
                                                  </div>
                                                  <div class="accordion-header-right">
                                                    <span class="accordion-price">{typeof cargo === 'number' ? this.formatCurrency(cargo) : ''}</span>
                                                    <span class={`accordion-arrow ${this.expandedAccordionItem === accordionId ? 'expanded' : ''}`}>
                                                      <img src="/assets/icons/chevron-down.png" alt="Arrow down" class="info-icon" />
                                                    </span>
                                                  </div>
                                                </div>
                                                <div class={`accordion-content ${this.expandedAccordionItem === accordionId ? 'expanded' : ''}`}>
                                                  <div class="charges-detail-list">
                                                    {/* Same detail content as current invoice */}
                                                    {servicio.descripcion && (
                                                      <div class="charge-row">
                                                        <span class="charge-label">{servicio.descripcion}</span>
                                                        <span class="charge-amount">{typeof servicio.cargo === 'number' ? this.formatCurrency(servicio.cargo) : ''}</span>
                                                      </div>
                                                    )}
                                                    {/* ... rest of the detail content similar to current invoice ... */}
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </>
                                  );
                                })}

                                {/* Actions row */}
                                <div class="invoice-actions">
                                  <div class="actions-left">
                                    <a href="#" class="action-link" onClick={(e) => { e.preventDefault(); this.handleQuestionsPressed(); }}>¿Tienes dudas?</a>
                                    <span class="action-separator">|</span>
                                    <a href="#" class="action-link" onClick={(e) => { e.preventDefault(); this.handleContactPressed(); }}>Contáctanos aquí</a>
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
