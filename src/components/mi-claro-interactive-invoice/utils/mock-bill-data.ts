import {
  BillApiResponse,
  BillDetailResponse,
  BillForecastResponse,
  BillService,
} from '../../../services/bill.service';
import { UsageRateDetail, UsageRateGroup } from '../types/invoice-types';

type Unit = 'MIN' | 'KB' | 'OTH';

const CIUDADES = ['San Juan', 'Bayamón', 'Ponce', 'Mayagüez', 'Caguas', 'Arecibo', 'Carolina', 'Guaynabo'];

const pad2 = (n: number) => n.toString().padStart(2, '0');

const buildPhone = (i: number) => {
  const prefix = ['787', '939'][i % 2];
  const mid = (200 + (i * 13) % 800).toString();
  const end = (1000 + (i * 37) % 9000).toString();
  return `${prefix}-${mid}-${end}`;
};

const buildDetalle = (count: number, unit: Unit): UsageRateDetail[] => {
  const rows: UsageRateDetail[] = [];
  for (let i = 0; i < count; i++) {
    const day = (i % 28) + 1;
    const hour = (6 + (i * 3) % 18);
    const minute = (i * 17) % 60;
    const minutos = unit === 'MIN' ? ((i * 7) % 18) + 1 : 0;
    const cantidad =
      unit === 'KB' ? Math.floor(((i + 1) * 34567) % 2_500_000) :
      unit === 'MIN' ? minutos : 1;
    const cargos = unit === 'MIN' ? parseFloat(((minutos * 0.03) + 0.02).toFixed(2)) : 0;

    rows.push({
      fecha: `2025-04-${pad2(day)}`,
      hora: `${pad2(hour)}:${pad2(minute)}`,
      numeroLlamado: buildPhone(i),
      ciudad: CIUDADES[i % CIUDADES.length],
      cantidad,
      unit,
      minutos,
      tl: 'T',
      cargos,
    });
  }
  return rows;
};

const buildGroup = (
  code: string,
  desc: string,
  unit: Unit,
  unitDesc: string,
  count: number,
): UsageRateGroup => {
  const detalle = buildDetalle(count, unit);
  const totalValue = unit === 'MIN'
    ? detalle.reduce((s, d) => s + d.minutos, 0)
    : unit === 'KB'
      ? detalle.reduce((s, d) => s + d.cantidad, 0)
      : detalle.length;
  const cargoNeto = detalle.reduce((s, d) => s + d.cargos, 0);

  return {
    rateGroup: code,
    rateGroupDesc: desc,
    totalCalls: detalle.length,
    totalValue: parseFloat(totalValue.toFixed(2)),
    unit,
    unitDesc,
    cargoNeto: parseFloat(cargoNeto.toFixed(2)),
    cargoBruto: parseFloat(cargoNeto.toFixed(2)),
    descuento: 0,
    featureCodes: [],
    detalle,
  };
};

const buildUsageRateGroups = (): UsageRateGroup[] => [
  buildGroup('CAL-LOC-NAL', 'Llamadas locales y nacionales', 'MIN', 'Minutos', 55),
  buildGroup('SMS-LOC', 'Mensajes de texto (SMS/MMS)', 'OTH', 'Mensajes', 42),
  buildGroup('DAT-MOB', 'Consumo de datos móviles', 'KB', 'Kilobytes', 30),
];

export const getMockBillsResponse = (): { data: BillApiResponse[] } => ({
  data: [
    {
      billSeqNo: 1,
      ban: 805437569,
      cycleRunYear: 2025,
      cycleRunMonth: 4,
      cycleCode: 19,
      productionDate: '2025-04-19',
      billDueDate: '2025-05-14',
      totalDueAmt: 103.98,
      billStatus: 0,
      prevBalanceAmt: 218.23,
      pymReceivedAmt: 272.09,
      currChargeAmt: 103.98,
      invAmtPastDue: 0,
      adjAppliedAmt: 0,
      payNowAmt: 103.98,
      payNowDueDate: '2025-05-14',
    },
    {
      billSeqNo: 2,
      ban: 805437569,
      cycleRunYear: 2025,
      cycleRunMonth: 3,
      cycleCode: 19,
      productionDate: '2025-03-19',
      billDueDate: '2025-04-14',
      totalDueAmt: 272.09,
      billStatus: 1,
      prevBalanceAmt: 250,
      pymReceivedAmt: 250,
      adjAppliedAmt: 0,
    },
    {
      billSeqNo: 3,
      ban: 805437569,
      cycleRunYear: 2025,
      cycleRunMonth: 2,
      cycleCode: 19,
      productionDate: '2025-02-19',
      billDueDate: '2025-03-14',
      totalDueAmt: 195.5,
      billStatus: 1,
    },
  ],
});

export const getMockBillDetailResponse = (): BillDetailResponse => {
  const usageRateGroups = buildUsageRateGroups();

  const factura: any = {
    fechaFactura: '2025-04-19',
    fechaVencimiento: '2025-05-14',
    balanceAnterior: 218.23,
    pagosRecibidos: 272.09,
    ajustes: 0,
    totalActual: 103.98,
    cargosDeCuenta: null,
    detalleDescripcion: 'Detalle de cargos por suscriptor',
    metodosPagoDescripcion: '',
    detalle: [
      {
        numero: '787-438-2564',
        total: 72.5,
        tipoLinea: 'Móvil',
        detalleServicios: [
          {
            seccion: 'Cargos Mensuales',
            cargo: 50,
            descripcion: 'ICP1 VZ+MSG+DATPRUSMXCN',
            periodo: '04/19-05/18',
            detalleEquipos: null,
            detalleTaxes: null,
            detalleItem: null,
            detallePlan: { descripcion: 'Plan básico', cargo: 50 },
            detalleCargos: { cargo: 50, descuento: 0 },
            detalleCargosItems: null,
            usageRateGroups,
          },
          {
            seccion: 'Impuestos',
            cargo: 3.77,
            descripcion: 'Impuestos aplicados',
            periodo: '04/19-05/18',
            detalleEquipos: null,
            detalleTaxes: [
              { descripcion: 'Sales Tax', cargo: 1.41 },
              { descripcion: 'Federal USF', cargo: 1.83 },
              { descripcion: 'PR USF', cargo: 0.03 },
              { descripcion: '911 Service', cargo: 0.5 },
            ],
            detalleItem: null,
            detallePlan: null,
            detalleCargos: null,
            detalleCargosItems: null,
            usageRateGroups: null,
          },
        ],
      },
    ],
    metodosPago: [],
  };

  return {
    data: {
      cuenta: '805437569',
      cliente: 'ROSA RIVERA (MOCK)',
      facturas: [factura],
    },
    isSuccess: true,
    message: 'OK',
    errorCode: 0,
    errors: null,
  };
};

export const getMockBillForecastResponse = (): BillForecastResponse => ({
  data: {
    ban: 805437569,
    historyCount: 6,
    prevBill: 272.09,
    lastBill: 103.98,
    nextBillEstimate: 112.4,
    lowerBand: 95,
    upperBand: 130,
    lastBillPoint: null,
    prevBillPoint: null,
    mean: 190,
    stdDev: 45,
    trendPerMonth: -2.5,
    seasonalityApplied: false,
    monthFactors: {},
    method: 'mock',
    notes: 'Fixture data for local visualization',
  },
  isSuccess: true,
  message: 'OK',
  errorCode: 0,
  errors: null,
});

export class MockBillService extends BillService {
  constructor() {
    super('dss', 'mock-token');
  }

  async getBills(_accountNumber: string) {
    return getMockBillsResponse();
  }

  async getBillDetail(
    _accountNumber: string,
    _cycleRunYear: number,
    _cycleRunMonth: number,
    _cycleCode: number,
  ): Promise<BillDetailResponse> {
    return getMockBillDetailResponse();
  }

  async getBillForecast(
    _accountNumber: string,
    _nextCycleRunMonth: number,
  ): Promise<BillForecastResponse> {
    return getMockBillForecastResponse();
  }
}
