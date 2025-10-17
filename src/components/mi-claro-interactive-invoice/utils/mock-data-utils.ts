import { EventCharges, MessageDetail, CallDetail } from '../types/invoice-types';

/**
 * Generates realistic mock data for event charges (messages and calls)
 * This data will be used for testing until real API integration is available
 */

// Helper to generate random date within last month
const generateRandomDate = (): string => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Helper to generate random time
const generateRandomTime = (): string => {
  const hour = Math.floor(Math.random() * 24).toString().padStart(2, '0');
  const minute = Math.floor(Math.random() * 60).toString().padStart(2, '0');
  return `${hour}:${minute}`;
};

// Helper to generate random phone number
const generatePhoneNumber = (): string => {
  const prefixes = ['787', '939'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return `${prefix}-${number.toString().slice(0, 3)}-${number.toString().slice(3)}`;
};

// Generate message details
const generateMessageDetails = (count: number): MessageDetail[] => {
  const messages: MessageDetail[] = [];
  const tipos = ['SMS', 'SMS', 'SMS', 'MMS']; // Más SMS que MMS

  for (let i = 0; i < count; i++) {
    const tipo = tipos[Math.floor(Math.random() * tipos.length)];
    const cargo = tipo === 'SMS' ? 0 : (Math.random() * 0.5 + 0.1); // SMS gratis, MMS con cargo

    messages.push({
      fecha: generateRandomDate(),
      hora: generateRandomTime(),
      numeroDestino: generatePhoneNumber(),
      tipo,
      cantidad: 1,
      cargo: parseFloat(cargo.toFixed(2))
    });
  }

  // Sort by date descending
  messages.sort((a, b) => {
    const dateA = new Date(`${a.fecha}T${a.hora}`);
    const dateB = new Date(`${b.fecha}T${b.hora}`);
    return dateB.getTime() - dateA.getTime();
  });

  return messages;
};

// Generate call details
const generateCallDetails = (count: number): CallDetail[] => {
  const calls: CallDetail[] = [];
  const tipos = [
    { tipo: 'Local', weight: 70 },
    { tipo: 'Larga distancia', weight: 25 },
    { tipo: 'Internacional', weight: 5 }
  ];

  for (let i = 0; i < count; i++) {
    // Weighted random selection
    const rand = Math.random() * 100;
    let selectedType = 'Local';
    let cumulative = 0;

    for (const t of tipos) {
      cumulative += t.weight;
      if (rand <= cumulative) {
        selectedType = t.tipo;
        break;
      }
    }

    // Duration in seconds (30 seconds to 30 minutes)
    const duracion = Math.floor(Math.random() * 1770) + 30;

    // Charge based on type and duration
    let cargoRate = 0;
    if (selectedType === 'Local') {
      cargoRate = 0; // Usually included in plan
    } else if (selectedType === 'Larga distancia') {
      cargoRate = 0.10 / 60; // $0.10 per minute
    } else { // Internacional
      cargoRate = 0.50 / 60; // $0.50 per minute
    }

    const cargo = (duracion / 60) * cargoRate;

    calls.push({
      fecha: generateRandomDate(),
      hora: generateRandomTime(),
      numeroDestino: generatePhoneNumber(),
      tipo: selectedType,
      duracion,
      cargo: parseFloat(cargo.toFixed(2))
    });
  }

  // Sort by date descending
  calls.sort((a, b) => {
    const dateA = new Date(`${a.fecha}T${a.hora}`);
    const dateB = new Date(`${b.fecha}T${b.hora}`);
    return dateB.getTime() - dateA.getTime();
  });

  return calls;
};

/**
 * Generates complete mock event charges data for a subscriber
 * @param messageCount - Number of messages to generate (default: 21)
 * @param callCount - Number of calls to generate (default: 397)
 * @returns EventCharges object with messages and calls data
 */
export const generateMockEventCharges = (
  messageCount: number = 21,
  callCount: number = 397
): EventCharges => {
  const mensajesDetalle = generateMessageDetails(messageCount);
  const llamadasDetalle = generateCallDetails(callCount);

  // Calculate summaries
  const smsCount = mensajesDetalle.filter(m => m.tipo === 'SMS').length;
  const mmsCount = mensajesDetalle.filter(m => m.tipo === 'MMS').length;
  const mensajesCargo = mensajesDetalle.reduce((sum, m) => sum + m.cargo, 0);

  const localesCount = llamadasDetalle.filter(c => c.tipo === 'Local').length;
  const ldCount = llamadasDetalle.filter(c => c.tipo === 'Larga distancia').length;
  const intlCount = llamadasDetalle.filter(c => c.tipo === 'Internacional').length;
  const totalMinutos = Math.floor(llamadasDetalle.reduce((sum, c) => sum + c.duracion, 0) / 60);
  const llamadasCargo = llamadasDetalle.reduce((sum, c) => sum + c.cargo, 0);

  return {
    mensajes: {
      resumen: {
        cantidad: messageCount,
        cargo: parseFloat(mensajesCargo.toFixed(2)),
        desglose: {
          sms: smsCount,
          mms: mmsCount
        }
      },
      detalle: mensajesDetalle
    },
    llamadas: {
      resumen: {
        cantidad: callCount,
        minutos: totalMinutos,
        cargo: parseFloat(llamadasCargo.toFixed(2)),
        desglose: {
          locales: localesCount,
          largaDistancia: ldCount,
          internacionales: intlCount
        }
      },
      detalle: llamadasDetalle
    },
    totalCargosEventos: parseFloat((mensajesCargo + llamadasCargo).toFixed(2))
  };
};

/**
 * Injects mock event charges into bill detail data
 * Useful for testing the feature before API integration
 */
export const injectMockEventCharges = (billDetails: any): any => {
  if (!billDetails || !billDetails.detalle || billDetails.detalle.length === 0) {
    return billDetails;
  }

  // Add event charges to each subscriber in the bill
  billDetails.detalle = billDetails.detalle.map((detail: any) => ({
    ...detail,
    cargosPorEventos: generateMockEventCharges()
  }));

  return billDetails;
};
