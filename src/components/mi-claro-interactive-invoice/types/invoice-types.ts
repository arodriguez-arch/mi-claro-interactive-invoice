export interface Invoice {
  id: string;
  title: string;
  date: string;
  dueDate: string;
  amount: string;
  status: string;
}

export interface MessageDetail {
  fecha: string;
  hora: string;
  numeroDestino: string;
  tipo: string; // 'SMS' | 'MMS'
  cantidad: number;
  cargo: number;
}

export interface CallDetail {
  fecha: string;
  hora: string;
  numeroDestino: string;
  tipo: string; // 'Local' | 'Larga distancia' | 'Internacional'
  duracion: number; // en segundos
  cargo: number;
}

export interface EventCharges {
  mensajes: {
    resumen: {
      cantidad: number;
      cargo: number;
      desglose: {
        sms: number;
        mms: number;
      };
    };
    detalle: MessageDetail[];
  };
  llamadas: {
    resumen: {
      cantidad: number;
      minutos: number;
      cargo: number;
      desglose: {
        locales: number;
        largaDistancia: number;
        internacionales: number;
      };
    };
    detalle: CallDetail[];
  };
  totalCargosEventos: number;
}

export interface BillDetail {
  numero: string;
  total: number;
  tipoLinea: string;
  detalleServicios: any[];
  cargosPorEventos?: EventCharges;
}

export interface CargosPorTipo {
  cantidadLineas?: number;
  tipo: string;
  totalNeto: number;
}

export interface DetalleCargoCuentaItem {
  descripcion: string;
  cargo: number;
  detalleCargos: {
    cargo: number;
    descuento: number;
  };
}

export interface CargosDeCuenta {
  seccion: string;
  cargo: number;
  detalleCargoCuenta: DetalleCargoCuentaItem[];
}

export interface BillData {
  fechaFactura: string;
  fechaVencimiento: string;
  balanceAnterior: number;
  pagosRecibidos: number;
  ajustes: number;
  totalActual: number;
  cargosCorrientes?: number;
  cargosDeCuenta?: CargosDeCuenta | null;
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
