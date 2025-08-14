import { Component, State, h, Prop, Event, EventEmitter } from '@stencil/core';

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

const BILLS_DATA: AccountData[] = [
  {
    "cuenta": "805437569",
    "cliente": "ROSA RIVERA",
    "facturas": [
      {
        "fechaFactura": "2025-05-19",
        "fechaVencimiento": "2025-06-14",
        "balanceAnterior": 218.23,
        "pagosRecibidos": 272.09,
        "ajustes": 0.0,
        "totalActual": 103.98,
        "detalle": [
          {
            "numero": "787-438-2564",
            "total": 72.5,
            "detalleServicios": [
              {
                "seccion": "Cargos Mensuales",
                "descripcion": "ICP1 VZ+MSG+DATPRUSMXCN",
                "periodo": "05/19-06/18",
                "cargo": 50.0,
                "detalleConsumo": {
                  "llamadas": {
                    "locales": {
                      "unidades": 319,
                      "minutos": 2251,
                      "cargo": 0.0
                    },
                    "largaDistancia": {
                      "unidades": 1,
                      "minutos": 1,
                      "cargo": 0.0
                    },
                    "internacional": {
                      "unidades": 0,
                      "minutos": 1,
                      "cargo": 0.0
                    }
                  },
                  "mensajes": {
                    "texto": {
                      "unidades": 10,
                      "minutos": 0,
                      "cargo": 0.0
                    },
                    "multimedio": {
                      "unidades": 0,
                      "minutos": 0,
                      "cargo": 0.0
                    }
                  },
                  "dataVolume": {
                    "data": {
                      "unidades": 25829168,
                      "minutos": 0,
                      "cargo": 0.0
                    },
                    "hotspot": {
                      "unidades": 1024000,
                      "minutos": 0,
                      "cargo": 0.0
                    }
                  }
                }
              },
              {
                "seccion": "Equipo",
                "cargo": 18.73,
                "detalleEquipos": {
                  "descripcion": "IPADPRO11M2",
                  "cargo": 18.73,
                  "detalleCargos": {
                    "cargo": 18.73,
                    "descuento": 0.0
                  }
                }
              },
              {
                "seccion": "Impuestos",
                "descripcion": "Impuestos",
                "cargo": 3.77,
                "detalle": {
                  "SalesTax": 1.41,
                  "FederalUSF": 1.83,
                  "PRUSF": 0.03,
                  "911Service": 0.5
                }
              },
              {
                "seccion": "Servicios Digitales",
                "descripcion": "Paquete HotSpot 5G",
                "cargo": 4.99,
                "detalleCargos": {
                  "cargo": 4.99,
                  "descuento": 0.0
                }
              },
              {
                "seccion": "Otros",
                "descripcion": "IPADPRO11M2",
                "cargo": 18.73,
                "detalleCargos": {
                  "cargo": 18.73,
                  "descuento": 0.0
                }
              }
            ]
          },
          {
            "numero": "787-451-6350",
            "total": 22.7,
            "detalleServicios": [
              {
                "seccion": "Cargos Mensuales",
                "descripcion": "ICP1 VZ+MSG+DATPRUSMXCN",
                "periodo": "05/19-06/18",
                "cargo": 20.0,
                "detalleConsumo": {
                  "llamadas": {
                    "locales": {
                      "unidades": 212,
                      "minutos": 489,
                      "cargo": 0.0
                    },
                    "largaDistancia": {
                      "unidades": 4,
                      "minutos": 4,
                      "cargo": 0.0
                    },
                    "internacional": {
                      "unidades": 0,
                      "minutos": 1,
                      "cargo": 0.0
                    }
                  },
                  "mensajes": {
                    "texto": {
                      "unidades": 0,
                      "minutos": 0,
                      "cargo": 0.0
                    },
                    "multimedio": {
                      "unidades": 0,
                      "minutos": 0,
                      "cargo": 0.0
                    }
                  },
                  "dataVolume": {
                    "data": {
                      "unidades": 25829168,
                      "minutos": 0,
                      "cargo": 0.0
                    },
                    "hotspot": {
                      "unidades": 0,
                      "minutos": 0,
                      "cargo": 0.0
                    }
                  }
                }
              },
              {
                "descripcion": "Impuestos",
                "cargo": 1.7,
                "detalle": {
                  "SalesTax": 1.08,
                  "FederalUSF": 1.11,
                  "PRUSF": 0.01,
                  "911Service": 0.5
                }
              }
            ]
          },
          {
            "numero": "787-596-8222",
            "total": 51.15,
            "detalleServicios": [
              {
                "seccion": "Cargos Mensuales",
                "descripcion": "ICP1 VZ+MSG+DATPRUSMXCN",
                "periodo": "05/19-06/18",
                "cargo": 35.0,
                "detalleConsumo": {
                  "llamadas": {
                    "locales": {
                      "unidades": 329,
                      "minutos": 1256,
                      "cargo": 0.0
                    },
                    "largaDistancia": {
                      "unidades": 5,
                      "minutos": 10,
                      "cargo": 0.0
                    },
                    "internacional": {
                      "unidades": 0,
                      "minutos": 1,
                      "cargo": 0.0
                    }
                  },
                  "mensajes": {
                    "texto": {
                      "unidades": 4,
                      "minutos": 0,
                      "cargo": 0.0
                    },
                    "multimedio": {
                      "unidades": 0,
                      "minutos": 0,
                      "cargo": 0.0
                    }
                  },
                  "dataVolume": {
                    "data": {
                      "unidades": 1024970,
                      "minutos": 0,
                      "cargo": 0.0
                    },
                    "hotspot": {
                      "unidades": 0,
                      "minutos": 0,
                      "cargo": 0.0
                    }
                  }
                }
              },
              {
                "seccion": "Equipo",
                "cargo": 13.32,
                "detalleEquipos": {
                  "descripcion": "GXY S22ULTRA",
                  "cargo": 13.32,
                  "detalleCargos": {
                    "cargo": 39.99,
                    "descuento": 26.67
                  }
                }
              },
              {
                "descripcion": "Impuestos",
                "cargo": 2.83,
                "detalle": {
                  "SalesTax": 1.19,
                  "FederalUSF": 1.11,
                  "PRUSF": 0.03,
                  "911Service": 0.5
                }
              },
              {
                "seccion": "Servicios Digitales",
                "descripcion": "",
                "cargo": 0,
                "detalleCargos": {
                  "cargo": 0.0,
                  "descuento": 0.0
                }
              }
            ]
          },
          {
            "numero": "787-964-8040",
            "total": 11.49,
            "detalleServicios": [
              {
                "descripcion": "ICP1 VZ+MSG+DATPRUSMXCN",
                "periodo": "05/19-06/18",
                "cargo": 20.0,
                "detalleConsumo": {
                  "llamadas": {
                    "locales": {
                      "unidades": 206,
                      "minutos": 963,
                      "cargo": 0.0
                    },
                    "largaDistancia": {
                      "unidades": 25,
                      "minutos": 35,
                      "cargo": 0.0
                    },
                    "internacional": {
                      "unidades": 0,
                      "minutos": 1,
                      "cargo": 0.0
                    }
                  },
                  "mensajes": {
                    "texto": {
                      "unidades": 3,
                      "minutos": 0,
                      "cargo": 0.0
                    },
                    "multimedio": {
                      "unidades": 0,
                      "minutos": 0,
                      "cargo": 0.0
                    }
                  },
                  "dataVolume": {
                    "data": {
                      "unidades": 4889060,
                      "minutos": 0,
                      "cargo": 0.0
                    },
                    "hotspot": {
                      "unidades": 0,
                      "minutos": 0,
                      "cargo": 0.0
                    }
                  }
                }
              },
              {
                "seccion": "Equipo",
                "detalleEquipos": {
                  "descripcion": "GXYA25128GB",
                  "cargo": 0.0,
                  "detalleCargos": {
                    "cargo": 10.0,
                    "descuento": -10.0
                  }
                }
              },
              {
                "descripcion": "Impuestos",
                "cargo" : 1.49,
                "detalle": {
                  "SalesTax": 0.45,
                  "FederalUSF": 0.54,
                  "911Service": 0.5
                }
              },
              {
                "seccion": "Otros",
                "cargo": -10,
                "detalle": {
                  "descripcion": "Recurring Charge Discount",
                  "cargo": -10.0
                }
              }
            ]
          }
        ],
        "metodosPago": [
          {
            "metodo": "Visa",
            "monto": 5.1,
            "fecha": "2025-04-22"
          },
          {
            "metodo": "Debit Card",
            "monto": 5.03,
            "fecha": "2025-04-22"
          },
          {
            "metodo": "American Express",
            "monto": 5.54,
            "fecha": "2025-04-22"
          },
          {
            "metodo": "Visa",
            "monto": 5.01,
            "fecha": "2025-04-22"
          },
          {
            "metodo": "Visa",
            "monto": 5.12,
            "fecha": "2025-04-25"
          },
          {
            "metodo": "Check",
            "monto": 5.13,
            "fecha": "2025-04-25"
          },
          {
            "metodo": "Visa",
            "monto": 16.0,
            "fecha": "2025-04-26"
          },
          {
            "metodo": "American Express",
            "monto": 187.3,
            "fecha": "2025-04-26"
          },
          {
            "metodo": "American Express",
            "monto": 7.0,
            "fecha": "2025-04-29"
          },
          {
            "metodo": "Funds Transfer",
            "monto": 12.65,
            "fecha": "2025-04-30"
          },
          {
            "metodo": "Funds Transfer",
            "monto": 12.65,
            "fecha": "2025-04-30"
          },
          {
            "metodo": "American Express",
            "monto": 5.56,
            "fecha": "2025-05-08"
          }
        ]
      },
      {
        "fechaFactura": "2025-06-19",
        "fechaVencimiento": "2025-07-15",
        "balanceAnterior": 103.98,
        "pagosRecibidos": 103.98,
        "ajustes": 0.0,
        "totalActual": 144.52,
        "detalle": [
          {
            "numero": "787-438-2564",
            "total": 72.5,
            "detalleServicios": [
              {
                "seccion": "Cargos Mensuales",
                "descripcion": "ICP1 VZ+MSG+DATPRUSMXCN",
                "periodo": "06/19-07/18",
                "cargo": 50.0,
                "detalleConsumo": {
                  "llamadas": {
                    "locales": {
                      "unidades": 450,
                      "minutos": 2612,
                      "cargo": 0
                    },
                    "largaDistancia": {
                      "unidades": 7,
                      "minutos": 18,
                      "cargo": 0
                    },
                    "internacional": {
                      "unidades": 0,
                      "minutos": 0,
                      "cargo": 0
                    }
                  },
                  "mensajes": {
                    "texto": {
                      "unidades": 18,
                      "minutos": 0,
                      "cargo": 0
                    },
                    "multimedio": {
                      "unidades": 1,
                      "minutos": 0,
                      "cargo": 0
                    }
                  },
                  "dataVolume": {
                    "data": {
                      "unidades": 12332252,
                      "minutos": 0,
                      "cargo": 0
                    },
                    "hotspot": {
                      "unidades": 0,
                      "minutos": 0,
                      "cargo": 0
                    }
                  }
                }
              },
              {
                "seccion": "Equipo",
                "cargo": 18.73,
                "detalleEquipos": {
                  "descripcion": "IPADPRO11M2",
                  "cargo": 18.73,
                  "detalleCargos": {
                    "cargo": 18.73,
                    "descuento": 0
                  }
                }
              },
              {
                "descripcion": "Impuestos",
                "cargo": 3.77,
                "detalle": {
                  "SalesTax": 1.41,
                  "FederalUSF": 1.83,
                  "PRUSF": 0.03,
                  "911Service": 0.5
                }
              },
              {
                "seccion": "Servicios Digitales",
                "descripcion": "",
                "cargo": 0.0,
                "detalleCargos": {}
              },
              {
                "seccion": "Otros",
                "descripcion": "",
                "cargo": 0,
                "detalleCargos": {
                  "cargo": 0,
                  "descuento": 0
                }
              }
            ]
          },
          {
            "numero": "787-451-6350",
            "total": 22.7,
            "detalleServicios": [
              {
                "seccion": "Cargos Mensuales",
                "descripcion": "ICP1 VZ+MSG+DATPRUSMXCN",
                "periodo": "06/19-07/18",
                "cargo": 20.0,
                "detalleConsumo": {
                  "llamadas": {
                    "locales": {
                      "unidades": 193,
                      "minutos": 595,
                      "cargo": 0
                    },
                    "largaDistancia": {
                      "unidades": 2,
                      "minutos": 12,
                      "cargo": 0
                    },
                    "internacional": {
                      "unidades": 0,
                      "minutos": 0,
                      "cargo": 0
                    }
                  },
                  "mensajes": {
                    "texto": {
                      "unidades": 4,
                      "minutos": 0,
                      "cargo": 0
                    },
                    "multimedio": {
                      "unidades": 0,
                      "minutos": 0,
                      "cargo": 0
                    }
                  },
                  "dataVolume": {
                    "data": {
                      "unidades": 50985198,
                      "minutos": 0,
                      "cargo": 0
                    },
                    "hotspot": {
                      "unidades": 0,
                      "minutos": 0,
                      "cargo": 0
                    }
                  }
                }
              },
              {
                "descripcion": "Impuestos",
                "cargo": 2.7,
                "detalle": {
                  "SalesTax": 1.08,
                  "FederalUSF": 1.11,
                  "PRUSF": 0.01,
                  "911Service": 0.5
                }
              },
              {
                "seccion": "Servicios Digitales",
                "descripcion": "",
                "cargo": 0.0,
                "detalleCargos": {}
              },
              {
                "seccion": "Otros",
                "descripcion": "",
                "cargo": 0,
                "detalleCargos": {
                  "cargo": 0,
                  "descuento": 0
                }
              }
            ]
          },
          {
            "numero": "787-596-8222",
            "total": 37.83,
            "detalleServicios": [
              {
                "seccion": "Cargos Mensuales",
                "descripcion": "ICP1 VZ+MSG+DATPRUSMXCN",
                "periodo": "06/19-07/18",
                "cargo": 35.0,
                "detalleConsumo": {
                  "llamadas": {
                    "locales": {
                      "unidades": 381,
                      "minutos": 1668,
                      "cargo": 0
                    },
                    "largaDistancia": {
                      "unidades": 10,
                      "minutos": 29,
                      "cargo": 0
                    },
                    "internacional": {
                      "unidades": 0,
                      "minutos": 1,
                      "cargo": 0
                    }
                  },
                  "mensajes": {
                    "texto": {
                      "unidades": 2,
                      "minutos": 0,
                      "cargo": 0
                    },
                    "multimedio": {
                      "unidades": 0,
                      "minutos": 0,
                      "cargo": 0
                    }
                  },
                  "dataVolume": {
                    "data": {
                      "unidades": 2601843,
                      "minutos": 0,
                      "cargo": 0
                    },
                    "hotspot": {
                      "unidades": 0,
                      "minutos": 0,
                      "cargo": 0
                    }
                  }
                }
              },
              {
                "seccion": "Equipo",
                "cargo": 13.32,
                "detalleEquipos": {
                  "descripcion": "GXY S22ULTRA",
                  "cargo": 13.32,
                  "detalleCargos": {
                    "cargo": 39.99,
                    "descuento": 26.67
                  }
                }
              },
              {
                "descripcion": "Impuestos",
                "cargo": 1.83,
                "detalle": {
                  "SalesTax": 1.19,
                  "FederalUSF": 1.11,
                  "PRUSF": 0.03,
                  "911Service": 0.5
                }
              },
              {
                "seccion": "Servicios Digitales",
                "descripcion": "",
                "cargo": 0,
                "detalleCargos": {
                  "cargo": 0,
                  "descuento": 0
                }
              },
              {
                "seccion": "Otros",
                "descripcion": "",
                "cargo": 0,
                "detalleCargos": {
                  "cargo": 0,
                  "descuento": 0
                }
              }
            ]
          },
          {
            "numero": "787-964-8040",
            "total": 11.49,
            "detalleServicios": [
              {
                "seccion": "Cargos Mensuales",
                "descripcion": "ICP1 VZ+MSG+DATPRUSMXCN",
                "periodo": "06/19-07/18",
                "cargo": 20.0,
                "detalleConsumo": {
                  "llamadas": {
                    "locales": {
                      "unidades": 206,
                      "minutos": 963,
                      "cargo": 0
                    },
                    "largaDistancia": {
                      "unidades": 25,
                      "minutos": 35,
                      "cargo": 0
                    },
                    "internacional": {
                      "unidades": 0,
                      "minutos": 1,
                      "cargo": 0
                    }
                  },
                  "mensajes": {
                    "texto": {
                      "unidades": 3,
                      "minutos": 0,
                      "cargo": 0
                    },
                    "multimedio": {
                      "unidades": 0,
                      "minutos": 0,
                      "cargo": 0
                    }
                  },
                  "dataVolume": {
                    "data": {
                      "unidades": 4889060,
                      "minutos": 0,
                      "cargo": 0
                    },
                    "hotspot": {
                      "unidades": 0,
                      "minutos": 0,
                      "cargo": 0
                    }
                  }
                }
              },
              {
                "seccion": "Equipo",
                "detalleEquipos": {
                  "descripcion": "GXYA25128GB",
                  "cargo": 0.0,
                  "detalleCargos": {
                    "cargo": 10.0,
                    "descuento": -10.0
                  }
                }
              },
              {
                "descripcion": "Impuestos",
                "cargos" : 1.49,
                "detalle": {
                  "SalesTax": 0.45,
                  "FederalUSF": 0.54,
                  "911Service": 0.5
                }
              },
              {
                "seccion": "Servicios Digitales",
                "descripcion": "",
                "cargo": 0,
                "detalleCargos": {
                  "cargo": 0,
                  "descuento": 0
                }
              },
              {
                "seccion": "Otros",
                "cargo": -10,
                "detalle": {
                  "descripcion": "Recurring Charge Discount",
                  "cargo": -10.0
                }
              }
            ]
          }
        ],
        "metodosPago": [
          {
            "metodo": "Visa",
            "monto": 5.0,
            "fecha": "2025-05-20"
          },
          {
            "metodo": "Visa",
            "monto": 7.0,
            "fecha": "2025-05-20"
          },
          {
            "metodo": "Visa",
            "monto": 42.0,
            "fecha": "2025-06-13"
          },
          {
            "metodo": "Visa",
            "monto": 30.0,
            "fecha": "2025-06-13"
          },
          {
            "metodo": "Visa",
            "monto": 6.22,
            "fecha": "2025-06-17"
          },
          {
            "metodo": "Visa",
            "monto": 13.76,
            "fecha": "2025-06-18"
          }
        ]
      },
      {
        "fechaFactura": "2025-07-19",
        "fechaVencimiento": "2025-08-14",
        "balanceAnterior": 144.52,
        "pagosRecibidos": 150.27,
        "ajustes": 0.0,
        "totalActual": 158.68,
        "detalle": [
          {
            "numero": "787-438-2564",
            "total": 72.47,
            "detalleServicios": [
              {
                "seccion": "Cargos Mensuales",
                "descripcion": "ICP1 VZ+MSG+DATPRUSMXCN",
                "periodo": "07/19-08/18",
                "cargo": 50.0,
                "detalleConsumo": {
                  "llamadas": {
                    "locales": {
                      "unidades": 312,
                      "minutos": 2726,
                      "cargo": 0
                    },
                    "largaDistancia": {
                      "unidades": 1,
                      "minutos": 1,
                      "cargo": 0
                    },
                    "internacional": {
                      "unidades": 0,
                      "minutos": 1,
                      "cargo": 0
                    }
                  },
                  "mensajes": {
                    "texto": {
                      "unidades": 21,
                      "minutos": 0,
                      "cargo": 0
                    },
                    "multimedio": {
                      "unidades": 1,
                      "minutos": 0,
                      "cargo": 0
                    }
                  },
                  "dataVolume": {
                    "data": {
                      "unidades": 14130732,
                      "minutos": 0,
                      "cargo": 0
                    },
                    "hotspot": {
                      "unidades": 0,
                      "minutos": 0,
                      "cargo": 0
                    }
                  }
                }
              },
              {
                "seccion": "Equipo",
                "detalleEquipos": {
                  "descripcion": "IPADPRO11M2",
                  "cargo": 18.73,
                  "detalleCargos": {
                    "cargo": 18.73,
                    "descuento": 0
                  }
                }
              },
              {
                "descripcion": "Impuestos",
                "detalle": {
                  "SalesTax": 1.41,
                  "FederalUSF": 1.8,
                  "PRUSF": 0.03,
                  "911Service": 0.5
                }
              },
              {
                "seccion": "Servicios Digitales",
                "descripcion": "",
                "cargo": 0,
                "detalleCargos": {
                  "cargo": 0.0,
                  "descuento": 0
                }
              },
              {
                "seccion": "Otros",
                "descripcion": "",
                "cargo": 0,
                "detalleCargos": {
                  "cargo": 0,
                  "descuento": 0
                }
              }
            ]
          },
          {
            "numero": "787-451-6350",
            "total": 22.67,
            "detalleServicios": [
              {
                "seccion": "Cargos Mensuales",
                "descripcion": "ICP1 VZ+MSG+DATPRUSMXCN",
                "periodo": "07/19-08/18",
                "cargo": 20.0,
                "detalleConsumo": {
                  "llamadas": {
                    "locales": {
                      "unidades": 140,
                      "minutos": 409,
                      "cargo": 0
                    },
                    "largaDistancia": {
                      "unidades": 3,
                      "minutos": 17,
                      "cargo": 0
                    },
                    "internacional": {
                      "unidades": 0,
                      "minutos": 0,
                      "cargo": 0
                    }
                  },
                  "mensajes": {
                    "texto": {
                      "unidades": 0,
                      "minutos": 0,
                      "cargo": 0
                    },
                    "multimedio": {
                      "unidades": 0,
                      "minutos": 0,
                      "cargo": 0
                    }
                  },
                  "dataVolume": {
                    "data": {
                      "unidades": 52994573,
                      "minutos": 0,
                      "cargo": 0
                    },
                    "hotspot": {
                      "unidades": 0,
                      "minutos": 0,
                      "cargo": 0
                    }
                  }
                }
              },
              {
                "seccion": "Equipo",
                "detalleEquipos": {}
              },
              {
                "descripcion": "Impuestos",
                "detalle": {
                  "SalesTax": 1.08,
                  "FederalUSF": 1.08,
                  "PRUSF": 0.01,
                  "911Service": 0.5
                }
              },
              {
                "seccion": "Servicios Digitales",
                "descripcion": "",
                "cargo": 0,
                "detalleCargos": {
                  "cargo": 0,
                  "descuento": 0
                }
              },
              {
                "seccion": "Otros",
                "descripcion": "",
                "cargo": 0,
                "detalleCargos": {
                  "cargo": 0,
                  "descuento": 0
                }
              }
            ]
          },
          {
            "numero": "787-596-8222",
            "total": 37.8,
            "detalleServicios": [
              {
                "descripcion": "ICP1 VZ+MSG+DATPRUSMXCN",
                "periodo": "07/19-08/18",
                "cargo": 35.0,
                "detalleConsumo": {
                  "llamadas": {
                    "locales": {
                      "unidades": 408,
                      "minutos": 1764,
                      "cargo": 0
                    },
                    "largaDistancia": {
                      "unidades": 11,
                      "minutos": 46,
                      "cargo": 0
                    },
                    "internacional": {
                      "unidades": 0,
                      "minutos": 1,
                      "cargo": 0
                    }
                  },
                  "mensajes": {
                    "texto": {
                      "unidades": 3,
                      "minutos": 0,
                      "cargo": 0
                    },
                    "multimedio": {
                      "unidades": 0,
                      "minutos": 0,
                      "cargo": 0
                    }
                  },
                  "dataVolume": {
                    "data": {
                      "unidades": 3420265,
                      "minutos": 0,
                      "cargo": 0
                    },
                    "hotspot": {
                      "unidades": 0,
                      "minutos": 0,
                      "cargo": 0
                    }
                  }
                }
              },
              {
                "seccion": "Equipo",
                "detalleEquipos": {
                  "descripcion": "GXY S22ULTRA",
                  "cargo": 13.32,
                  "detalleCargos": {
                    "cargo": 39.99,
                    "descuento": 26.67
                  }
                }
              },
              {
                "descripcion": "Impuestos",
                "detalle": {
                  "SalesTax": 1.19,
                  "FederalUSF": 1.08,
                  "PRUSF": 0.03,
                  "911Service": 0.5
                }
              },
              {
                "seccion": "Servicios Digitales",
                "descripcion": "",
                "cargo": 0,
                "detalleCargos": {
                  "cargo": 0,
                  "descuento": 0
                }
              },
              {
                "seccion": "Otros",
                "descripcion": "",
                "cargo": 0,
                "detalleCargos": {
                  "cargo": 0,
                  "descuento": 0
                }
              }
            ]
          },
          {
            "numero": "787-964-8040",
            "total": 31.49,
            "detalleServicios": [
              {
                "seccion": "Cargos Mensuales",
                "descripcion": "ICP1 VZ+MSG+DATPRUSMXCN",
                "periodo": "07/19-08/18",
                "cargo": 20.0,
                "detalleConsumo": {
                  "llamadas": {
                    "locales": {
                      "unidades": 206,
                      "minutos": 963,
                      "cargo": 0
                    },
                    "largaDistancia": {
                      "unidades": 25,
                      "minutos": 35,
                      "cargo": 0
                    },
                    "internacional": {
                      "unidades": 0,
                      "minutos": 1,
                      "cargo": 0
                    }
                  },
                  "mensajes": {
                    "texto": {
                      "unidades": 3,
                      "minutos": 0,
                      "cargo": 0
                    },
                    "multimedio": {
                      "unidades": 0,
                      "minutos": 0,
                      "cargo": 0
                    }
                  },
                  "dataVolume": {
                    "data": {
                      "unidades": 4889060,
                      "minutos": 0,
                      "cargo": 0
                    },
                    "hotspot": {
                      "unidades": 0,
                      "minutos": 0,
                      "cargo": 0
                    }
                  }
                }
              },
              {
                "seccion": "Equipo",
                "detalleEquipos": {
                  "descripcion": "GXYA25128GB",
                  "cargo": 0.0,
                  "detalleCargos": {
                    "cargo": 10.0,
                    "descuento": -10.0
                  }
                }
              },
              {
                "descripcion": "Impuestos",
                "cargos" : 1.49,
                "detalle": {
                  "SalesTax": 0.45,
                  "FederalUSF": 0.54,
                  "911Service": 0.5
                }
              },
              {
                "seccion": "Servicios Digitales",
                "descripcion": "",
                "cargo": 0,
                "detalleCargos": {
                  "cargo": 0,
                  "descuento": 0
                }
              },
              {
                "seccion": "Otros",
                "descripcion": "",
                "cargo": 10,
                "detalleCargos": {
                  "descripcion": "Recarga 10",
                  "cargo": 10.0
                }
              }
            ]
          }
        ],
        "metodosPago": [
          {
            "metodo": "Visa",
            "monto": 5.0,
            "fecha": "2025-06-25"
          },
          {
            "metodo": "Visa",
            "monto": 6.0,
            "fecha": "2025-06-26"
          },
          {
            "metodo": "American Express",
            "monto": 5.75,
            "fecha": "2025-07-17"
          },
          {
            "metodo": "Visa",
            "monto": 133.52,
            "fecha": "2025-07-17"
          }
        ]
      }
    ]
  },
  {
    "cuenta": "712331792",
    "cliente": "LUISA AGOSTO",
    "facturas": [
      {
        "fechaFactura": "2025-05-07",
        "fechaVencimiento": "2025-05-30",
        "balanceAnterior": 59.64,
        "pagosRecibidos": 70.64,
        "ajustes": 0.0,
        "totalActual": 48.64,
        "detalle": [
          {
            "numero": "787-799-5683",
            "total": 59.64,
            "detalleServicios": [
              {
                "seccion": "Otros",
                "cargo": 1.1,
                "detalle": {
                  "descripcion": "Access Recovery Charge",
                  "cargo": 1.1
                }
              },
              {
                "seccion": "Cargos Mensuales",
                "descripcion": "50M ILIM PRUS CONTR G",
                "periodo": "05/07-06/06",
                "cargo": 51.99,
                "detalleConsumo": {
                  "descripcion": "50 MINS RD, CAN, MEX Y COLOM",
                  "periodo": "05/07-06/06",
                  "cargo": 51.99
                }
              },
              {
                "descripcion": "Impuestos",
                "cargo": 6.55,
                "detalle": {
                  "SalesTax": 2.55,
                  "FederalUSF": 3.33,
                  "PRUSF": 0.17,
                  "911Service": 0.5
                }
              }
            ]
          }
        ],
        "metodosPago": [
          {
            "metodo": "Check",
            "monto": 59.64,
            "fecha": "2025-04-14"
          },
          {
            "metodo": "Debit Card",
            "monto": 5.0,
            "fecha": "2025-04-22"
          },
          {
            "metodo": "Check",
            "monto": 6.0,
            "fecha": "2025-04-22"
          }
        ]
      },
      {
        "fechaFactura": "2025-06-07",
        "fechaVencimiento": "2025-06-30",
        "balanceAnterior": 48.64,
        "pagosRecibidos": 48.64,
        "ajustes": 0.0,
        "totalActual": 59.64,
        "detalle": [
          {
            "numero": "787-799-5683",
            "total": 59.64,
            "detalleServicios": [
              {
                "seccion": "Otros",
                "cargo": 1.1,
                "detalle": {
                  "descripcion": "Access Recovery Charge",
                  "cargo": 1.1
                }
              },
              {
                "seccion": "Cargos Mensuales",
                "descripcion": "50M ILIM PRUS CONTR G",
                "periodo": "06/07-07/06",
                "cargo": 51.99,
                "detalleConsumo": {
                  "descripcion": "50 MINS RD, CAN, MEX Y COLOM",
                  "periodo": "06/07-07/06",
                  "cargo": 51.99
                }
              },
              {
                "descripcion": "Impuestos",
                "cargo": 6.55,
                "detalle": {
                  "SalesTax": 2.55,
                  "FederalUSF": 3.33,
                  "PRUSF": 0.17,
                  "911Service": 0.5
                }
              }
            ]
          }
        ],
        "metodosPago": [
          {
            "metodo": "Check",
            "monto": 48.64,
            "fecha": "2025-05-14"
          }
        ]
      },
      {
        "fechaFactura": "2025-07-07",
        "fechaVencimiento": "2025-07-30",
        "balanceAnterior": 59.64,
        "pagosRecibidos": 69.65,
        "ajustes": 0.0,
        "totalActual": 49.43,
        "detalle": [
          {
            "numero": "787-799-5683",
            "total": 59.44,
            "detalleServicios": [
              {
                "seccion": "Otros",
                "cargo": 1.1,
                "detalle": {
                  "descripcion": "Access Recovery Charge",
                  "cargo": 1.1
                }
              },
              {
                "seccion": "Cargos Mensuales",
                "descripcion": "50M ILIM PRUS CONTR G",
                "periodo": "07/07-08/06",
                "cargo": 51.99,
                "detalleConsumo": {
                  "descripcion": "50 MINS RD, CAN, MEX Y COLOM",
                  "periodo": "07/07-08/06",
                  "cargo": 51.99
                }
              },
              {
                "descripcion": "Impuestos",
                "cargo": 6.55,
                "detalle": {
                  "SalesTax": 2.55,
                  "FederalUSF": 3.24,
                  "PRUSF": 0.17,
                  "911Service": 0.5
                }
              }
            ]
          }
        ],
        "metodosPago": [
          {
            "metodo": "Check",
            "monto": 59.64,
            "fecha": "2025-06-12"
          },
          {
            "metodo": "American Express",
            "monto": 5.01,
            "fecha": "2025-06-18"
          },
          {
            "metodo": "American Express",
            "monto": 5.0,
            "fecha": "2025-06-18"
          }
        ]
      }
    ]
  }
];

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
  @Prop() accountList: string[] = ['805437569', '712331792'];

  @Event() goToSupport: EventEmitter<void>;

  private invoices: Invoice[] = [];

  private toggleShowMore = () => {
    this.showMoreInfo = !this.showMoreInfo;
  };

  private selectTab = (tab: 'current' | 'previous') => {
    this.activeTab = tab;
  };

  private toggleInvoiceDetail = (invoiceId: string) => {
    this.expandedInvoiceId = this.expandedInvoiceId === invoiceId ? null : invoiceId;
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
    this.fetchInvoiceData(selectedAccount);
  };

  private fetchBillsData = async (): Promise<AccountData[]> => {
    try {
      console.log('Using embedded bills data:', BILLS_DATA);
      return BILLS_DATA;
    } catch (error) {
      console.error('Error accessing bills data:', error);
      return [];
    }
  };

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

  private mapBillToInvoice = (bill: BillData, accountName: string, billIndex: number): Invoice => {
    return {
      id: `bill-${billIndex}`,
      title: accountName,
      date: this.formatDate(bill.fechaFactura),
      amount: this.formatCurrency(bill.totalActual),
      status: bill.pagosRecibidos >= bill.totalActual ? 'Pagado' : 'Pendiente'
    };
  };

  private fetchInvoiceData = async (accountNumber: string) => {
    this.isLoading = true;
    try {
      if (this.accountsData.length === 0) {
        this.accountsData = await this.fetchBillsData();
      }

      const accountData = this.accountsData.find(acc => acc.cuenta === accountNumber);

      if (accountData && accountData.facturas.length > 0) {
        // Store all bills
        this.allBills = accountData.facturas;
        this.currentBill = accountData.facturas[accountData.facturas.length - 1];
        this.previousBills = accountData.facturas.slice(0, -1);

        // Map ALL bills to invoices for the table (one row per bill)
        this.invoices = accountData.facturas.map((bill, index) =>
          this.mapBillToInvoice(bill, accountData.cliente, index)
        );

        // Calculate chart data
        this.chartData = this.calculateChartData(accountData.facturas);

        // Update invoice data for summary display
        this.invoiceData = {
          accountNumber: accountData.cuenta,
          customerName: accountData.cliente,
          dueDate: this.formatDate(this.currentBill.fechaVencimiento),
          totalAmount: this.formatCurrency(this.currentBill.totalActual),
          invoices: this.invoices,
          planDetails: {
            name: 'Plan Móvil',
            period: `${this.formatDate(this.currentBill.fechaFactura)} - ${this.formatDate(this.currentBill.fechaVencimiento)}`,
            paymentMethod: this.currentBill.metodosPago.length > 0 ? this.currentBill.metodosPago[0].metodo : 'No especificado'
          },
          balanceAnterior: this.currentBill.balanceAnterior,
          pagosRecibidos: this.currentBill.pagosRecibidos,
          ajustes: this.currentBill.ajustes
        };
      } else {
        // No data found for this account
        this.invoiceData = null;
        this.invoices = [];
        this.currentBill = null;
        this.previousBills = [];
        this.allBills = [];
      }
    } catch (error) {
      console.error('Error fetching invoice data:', error);
      this.invoiceData = null;
      this.invoices = [];
      this.allBills = [];
    } finally {
      this.isLoading = false;
    }
  };

  componentWillLoad() {
    // Set initial selected account and fetch data on component initialization
    if (this.accountList && this.accountList.length > 0) {
      console.log('Initial account list:', this.accountList);
      this.selectedAccount = this.accountList[0];
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
              <h2 class="card-title">¡Hola, {this.invoiceData?.customerName || 'María'}!</h2>
              <p class="summary-text">Tu factura vence el {this.invoiceData?.dueDate || '20 de marzo de 2024'}</p>
              <div class="separator"></div>
              <div class="total-section">
                <p class="total-label">Total a pagar</p>
                <p class="total-amount">{this.invoiceData?.totalAmount || '$45.990'}</p>
              </div>
              <div class="separator"></div>

              <div class={`expandable-content ${this.showMoreInfo ? 'expanded' : ''}`}>
                <div class="expandable-inner">
                  <div class="due-section">
                    <p class="due-label">Balance vencido</p>
                    <p class="due-amount">$57.25</p>
                    <p class="due-description">Vencimiento: 05/04/2025</p>
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

                    <button class="pay-pending-button">
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
                          <div class="table-cell cell-bold">{invoice.title}</div>
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
                            >
                              Ver detalle
                              <span class={`arrow ${this.expandedInvoiceId === invoice.id ? 'up' : 'down'}`}>▼</span>
                            </button>
                          </div>
                        </div>
                        <div class={`invoice-detail ${this.expandedInvoiceId === invoice.id ? 'expanded' : ''}`}>
                          <div class="detail-inner">
                            {/* Map through all phone numbers in this specific bill */}
                            {this.allBills[parseInt(invoice.id.split('-')[1])] && this.allBills[parseInt(invoice.id.split('-')[1])].detalle.map((detail, detailIndex) => {
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
                                          {/* Display service details based on section type */}
                                          {servicio.descripcion && (
                                            <div class="charge-row">
                                              <span class="charge-label">{servicio.descripcion}</span>
                                              <span class="charge-amount">{typeof servicio.cargo === 'number' ? this.formatCurrency(servicio.cargo) : ''}</span>
                                            </div>
                                          )}

                                          {/* Display consumption details if available */}
                                          {servicio.detalleConsumo && (
                                            <>
                                              {/* Calls section */}
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
                              <a href="#" class="action-link">¿Tienes dudas?</a>
                              <span class="action-separator">|</span>
                              <a href="#" class="action-link">Contáctanos aquí</a>
                            </div>
                            <div class="actions-right">
                              <a href="#" class="action-link">Descarga mi factura</a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
              {this.activeTab === 'previous' && (
                <div class="invoice-table">
                  <div class="table-header">
                    <div class="header-cell">Fecha factura</div>
                    <div class="header-cell">Fecha vencimiento</div>
                    <div class="header-cell">Balance anterior</div>
                    <div class="header-cell">Pagos recibidos</div>
                    <div class="header-cell">Total</div>
                    <div class="header-cell"></div>
                  </div>
                  {this.previousBills.map((bill, index) => {
                    const billId = `prev-${index}`;
                    return (
                      <div key={billId} class="table-row">
                        <div class="table-cell">{this.formatDate(bill.fechaFactura)}</div>
                        <div class="table-cell">{this.formatDate(bill.fechaVencimiento)}</div>
                        <div class="table-cell cell-amount">{this.formatCurrency(bill.balanceAnterior)}</div>
                        <div class="table-cell cell-amount">{this.formatCurrency(bill.pagosRecibidos)}</div>
                        <div class="table-cell cell-amount cell-bold">{this.formatCurrency(bill.totalActual)}</div>
                        <div class="table-cell">
                          <button class="detail-button" onClick={() => alert('Ver detalle de factura anterior')}>
                            Ver detalle
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {this.previousBills.length === 0 && (
                    <div class="table-row">
                      <div class="table-cell" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                        No hay facturas anteriores disponibles
                      </div>
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
