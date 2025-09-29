export type Environment = 'prod' | 'dss' | 'dev' | 'uat' | 'uat40' | 'local';

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
  prevBalanceAmt?: number;
  pymReceivedAmt?: number;
  currChargeAmt?: number;
  invAmtPastDue?: number;
  adjAppliedAmt?: number;
  payNowAmt?: number;
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

export interface BillForecastResponse {
  data: {
    ban: number;
    historyCount: number;
    prevBill: number;
    lastBill: number;
    nextBillEstimate: number;
    lowerBand: number;
    upperBand: number;
    lastBillPoint: number | null;
    prevBillPoint: number | null;
    mean: number;
    stdDev: number;
    trendPerMonth: number;
    seasonalityApplied: boolean;
    monthFactors: {
      [key: string]: number;
    };
    method: string;
    notes: string;
  };
  isSuccess: boolean;
  message: string;
  errorCode: number;
  errors: any;
}

const ENVIRONMENT_CONFIG: Record<Environment, string> = {
  prod: 'https://miclaro.claropr.com/api',
  dss: 'https://dssmiclaro.claropr.com/api',
  dev: 'https://dev-miclaro.claropr.com/api',
  uat: 'https://uat-miclaro.claropr.com/api',
  uat40: 'https://uat-miclaro40.claropr.com/api',
  local: 'http://localhost:55651/api'
};

export class BillService {
  private baseUrl: string;
  private token: string;

  constructor(environment: Environment, token: string = '') {
    this.baseUrl = ENVIRONMENT_CONFIG[environment];
    this.token = token;
  }

  async getBills(accountNumber: string): Promise<BillServiceResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/bill/GetBill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*',
        },
        body: JSON.stringify({
          token: this.token,
          account: accountNumber
        })
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
      const url = `${this.baseUrl}/bill/GetBillCompose`;
      console.log('Fetching bill detail from:', url);
      const response = await fetch(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': '*/*',
          },
          body: JSON.stringify({
            token: this.token,
            account: accountNumber,
            year: cycleRunYear.toString(),
            month: cycleRunMonth.toString(),
            day: cycleCode.toString()
          })
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

  async getBillForecast(
    accountNumber: string,
    nextCycleRunMonth: number
  ): Promise<BillForecastResponse> {
    try {
      const url = `${this.baseUrl}/bill/GetBillForecast`;
      console.log('Fetching bill forecast from:', url);
      const response = await fetch(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': '*/*',
          },
          body: JSON.stringify({
            token: this.token,
            account: accountNumber,
            nextCycleRunMonth: nextCycleRunMonth
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch bill forecast: ${response.status} ${response.statusText}`);
      }

      const data: BillForecastResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching bill forecast:', error);
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
