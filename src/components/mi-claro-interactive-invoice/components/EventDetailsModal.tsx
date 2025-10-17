import { h, FunctionalComponent } from '@stencil/core';
import { MessageDetail, CallDetail } from '../types/invoice-types';

interface EventDetailsModalProps {
  isOpen: boolean;
  eventType: 'mensajes' | 'llamadas' | null;
  data: MessageDetail[] | CallDetail[] | null;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
}

/**
 * Modal component to display extensive event details (messages or calls)
 * Shows a scrollable list with detailed information per event
 */
export const EventDetailsModal: FunctionalComponent<EventDetailsModalProps> = ({
  isOpen,
  eventType,
  data,
  onClose,
  formatCurrency
}) => {
  if (!isOpen || !eventType || !data) {
    return null;
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMessageRow = (message: MessageDetail, index: number) => (
    <div key={index} class="event-modal-row">
      <div class="event-modal-col-main">
        <div class="event-modal-destination">{message.numeroDestino}</div>
        <div class="event-modal-datetime">
          {message.fecha} - {message.hora}
        </div>
      </div>
      <div class="event-modal-col-info">
        <div class="event-modal-type">{message.tipo}</div>
        <div class="event-modal-quantity">Cantidad: {message.cantidad}</div>
      </div>
      <div class="event-modal-col-charge">
        {formatCurrency(message.cargo)}
      </div>
    </div>
  );

  const renderCallRow = (call: CallDetail, index: number) => (
    <div key={index} class="event-modal-row">
      <div class="event-modal-col-main">
        <div class="event-modal-destination">{call.numeroDestino}</div>
        <div class="event-modal-datetime">
          {call.fecha} - {call.hora}
        </div>
      </div>
      <div class="event-modal-col-info">
        <div class="event-modal-type">{call.tipo}</div>
        <div class="event-modal-duration">Duración: {formatDuration(call.duracion)}</div>
      </div>
      <div class="event-modal-col-charge">
        {formatCurrency(call.cargo)}
      </div>
    </div>
  );

  const title = eventType === 'mensajes'
    ? 'Detalle de Mensajes de Texto'
    : 'Detalle de Llamadas';

  const headerLabels = eventType === 'mensajes'
    ? { col1: 'Destino / Fecha', col2: 'Tipo / Cantidad', col3: 'Cargo' }
    : { col1: 'Destino / Fecha', col2: 'Tipo / Duración', col3: 'Cargo' };

  return (
    <div class="event-modal-overlay" onClick={onClose}>
      <div class="event-modal-container" onClick={(e) => e.stopPropagation()}>
        <div class="event-modal-header">
          <h3 class="event-modal-title">{title}</h3>
          <button class="event-modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="event-modal-info">
          <span class="event-modal-count">
            Total de {eventType}: {data.length} {eventType === 'mensajes' ? 'mensajes' : 'llamadas'}
          </span>
        </div>

        <div class="event-modal-table-header">
          <div class="event-modal-header-col event-modal-header-main">{headerLabels.col1}</div>
          <div class="event-modal-header-col event-modal-header-info">{headerLabels.col2}</div>
          <div class="event-modal-header-col event-modal-header-charge">{headerLabels.col3}</div>
        </div>

        <div class="event-modal-body">
          {eventType === 'mensajes'
            ? (data as MessageDetail[]).map(renderMessageRow)
            : (data as CallDetail[]).map(renderCallRow)
          }
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
