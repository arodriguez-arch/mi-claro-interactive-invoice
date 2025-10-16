export interface Invoice {
  id: string;
  title: string;
  date: string;
  dueDate: string;
  amount: string;
  status: string;
}

export interface BillDetail {
  numero: string;
  total: number;
  tipoLinea: string;
  detalleServicios: any[];
}

export interface CargosPorTipo {
  cantidadLineas?: number;
  tipo: string;
  totalNeto: number;
}

export interface BillData {
  fechaFactura: string;
  fechaVencimiento: string;
  balanceAnterior: number;
  pagosRecibidos: number;
  ajustes: number;
  totalActual: number;
  cargosCorrientes?: number;
  cargosDeCuenta?: number | { seccion: string; cargo: number; detalleCargoCuenta: any[] } | null;
  detalle: BillDetail[];
  cargosPorTipo: CargosPorTipo[];
  metodosPago: any[];
  ajustesPorSuscriptor?: Array<{
    subscriberNo: string;
    total: number;
    items: Array<{
      descripcion: string;
      monto: number;
    }>;
  }>;
  ban?: number;
  cycleRunYear?: number;
  cycleRunMonth?: number;
  cycleCode?: number;
}

export interface AccountData {
  cuenta: string;
  cliente: string;
  facturas: BillData[];
}

export interface FloatingPillData {
  title: string;
  amount: string;
  sectionId: string;
}

export interface ChartDataItem {
  month: string;
  amount: number;
  height: number;
  isEstimated?: boolean;
  isCurrent?: boolean;
}
