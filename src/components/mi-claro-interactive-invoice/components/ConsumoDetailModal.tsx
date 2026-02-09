import { h, FunctionalComponent } from '@stencil/core';
import { UsageRateDetail } from '../types/invoice-types';

interface ConsumoDetailModalProps {
  isOpen: boolean;
  title: string | null;
  unit: string | null;
  data: UsageRateDetail[] | null;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
}

/**
 * Modal component to display usage rate group detail (Consumo)
 * Shows a scrollable table with per-event detail rows
 */
export const ConsumoDetailModal: FunctionalComponent<ConsumoDetailModalProps> = ({
  isOpen,
  title,
  unit,
  data,
  onClose,
  formatCurrency
}) => {
  if (!isOpen || !data || data.length === 0) {
    return null;
  }

  const isMinutes = unit === 'MIN';
  const isData = unit === 'KB';

  return (
    <div class="event-modal-overlay" onClick={onClose}>
      <div class="event-modal-container" onClick={(e) => e.stopPropagation()}>
        <div class="event-modal-header">
          <h3 class="event-modal-title">{title || 'Detalle de Consumo'}</h3>
          <button class="event-modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="event-modal-info">
          <span class="event-modal-count">
            Total: {data.length} registros
          </span>
        </div>

        <div class="consumo-modal-table-header">
          <span class="consumo-modal-cell">Fecha</span>
          <span class="consumo-modal-cell">Hora</span>
          <span class="consumo-modal-cell">Número</span>
          <span class="consumo-modal-cell">Ciudad</span>
          <span class="consumo-modal-cell">{isMinutes ? 'Minutos' : isData ? 'Cantidad' : 'Cantidad'}</span>
          <span class="consumo-modal-cell">Cargos</span>
        </div>

        <div class="event-modal-body">
          {data.map((row: UsageRateDetail, index: number) => (
            <div key={index} class="consumo-modal-row">
              <span class="consumo-modal-cell">{row.fecha}</span>
              <span class="consumo-modal-cell">{row.hora}</span>
              <span class="consumo-modal-cell">{row.numeroLlamado}</span>
              <span class="consumo-modal-cell">{row.ciudad}</span>
              <span class="consumo-modal-cell">{isMinutes ? row.minutos : row.cantidad}</span>
              <span class="consumo-modal-cell">{formatCurrency(row.cargos)}</span>
            </div>
          ))}
        </div>

        <div class="event-modal-footer">
          <button class="event-modal-button-close" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
