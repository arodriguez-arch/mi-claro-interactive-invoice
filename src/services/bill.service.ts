export type Environment = 'prod' | 'qa' | 'dev';

export interface BillApiResponse {
  billSeqNo: number;
  ban: number;
  cycleRunYear: number;
  cycleRunMonth: number;
  cycleCode: number;
  productionDate: string;
  billDueDate: string;
  totalDueAmt: number;
  billStatus: number;
}

interface BillServiceResponse {
  data: BillApiResponse[];
}

export interface BillDetailResponse {
  data: {
    cuenta: string;
    cliente: string;
    facturas: Array<{
      fechaFactura: string;
      fechaVencimiento: string;
      balanceAnterior: number;
      pagosRecibidos: number;
      ajustes: number;
      totalActual: number;
      cargosDeCuenta: any;
      detalle: Array<{
        numero: string;
        total: number;
        detalleServicios: Array<{
          seccion: string;
          cargo: number;
          descripcion: string;
          periodo: string;
          detalleEquipos: {
            totalNeto: number;
            items: Array<{
              descripcion: string;
              cargo: number;
              detalleCargos: {
                cargo: number;
                descuento: number;
              };
            }>;
          } | null;
          detalleTaxes: Array<{
            descripcion: string;
            cargo: number;
          }> | null;
          detalleItem: Array<{
            descripcion: string;
            cargo: number;
            detalleCargos: {
              cargo: number;
              descuento: number;
            };
          }> | null;
          detallePlan: {
            descripcion: string;
            cargo: number;
          } | null;
          detalleCargos: {
            cargo: number;
            descuento: number;
          } | null;
        }>;
      }>;
      metodosPago: any[];
    }>;
  };
  isSuccess: boolean;
  message: string;
  errorCode: number;
  errors: any;
}

const ENVIRONMENT_CONFIG: Record<Environment, string> = {
  prod: 'https://wsibill.claropr.com',
  qa: 'https://qa-wsibill.claropr.com',
  dev: 'https://dev-wsibill.claropr.com'
};

export class BillService {
  private baseUrl: string;

  constructor(environment: Environment = 'prod') {
    this.baseUrl = ENVIRONMENT_CONFIG[environment];
  }

  async getBills(accountNumber: string): Promise<BillServiceResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/Bill/${accountNumber}`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch bills: ${response.status} ${response.statusText}`);
      }

      const data: BillServiceResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching bills:', error);
      throw error;
    }
  }

  async getBillDetail(
    accountNumber: string,
    cycleRunYear: number,
    cycleRunMonth: number,
    cycleCode: number
  ): Promise<BillDetailResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/v2/compose/${accountNumber}/${cycleRunYear}/${cycleRunMonth}/${cycleCode}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch bill detail: ${response.status} ${response.statusText}`);
      }

      const data: BillDetailResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching bill detail:', error);
      throw error;
    }
  }
}

export function mapApiResponseToBillData(apiResponse: BillApiResponse[]): {
  pendingBill: BillApiResponse | null;
  historyBills: BillApiResponse[];
} {
  if (!apiResponse || apiResponse.length === 0) {
    return { pendingBill: null, historyBills: [] };
  }

  return {
    pendingBill: apiResponse[0],
    historyBills: apiResponse.slice(1)
  };
}