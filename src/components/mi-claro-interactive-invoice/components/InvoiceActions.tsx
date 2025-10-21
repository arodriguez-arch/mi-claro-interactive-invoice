import { h, FunctionalComponent } from '@stencil/core';

interface InvoiceActionsProps {
  onQuestionsPressed: () => void;
  onContactPressed: () => void;
  onDownloadBills: () => void;
  onChargeClaimPressed: () => void;
}

/**
 * Action links row at the bottom of invoice details
 */
export const InvoiceActions: FunctionalComponent<InvoiceActionsProps> = ({
  onQuestionsPressed,
  onContactPressed,
  onDownloadBills,
  onChargeClaimPressed
}) => {
  return (
    <div class="invoice-actions">
      <div class="actions-left">
        <a href="#" class="action-link" onClick={(e) => { e.preventDefault(); onQuestionsPressed(); }}>
          ¿Tienes dudas?
        </a>
        <span class="action-separator">|</span>
        <a href="#" class="action-link" onClick={(e) => { e.preventDefault(); onContactPressed(); }}>
          Contáctanos aquí
        </a>
        <span class="action-separator">|</span>
        <a href="#" class="action-link" onClick={(e) => { e.preventDefault(); onChargeClaimPressed(); }}>
          Reclamo de cargos
        </a>
      </div>
      <div class="actions-right">
        <a href="#" class="action-link" onClick={(e) => { e.preventDefault(); onDownloadBills(); }}>
          Descarga mi factura
        </a>
      </div>
    </div>
  );
};
