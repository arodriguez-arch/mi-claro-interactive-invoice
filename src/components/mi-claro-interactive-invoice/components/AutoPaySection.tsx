import { h, FunctionalComponent } from '@stencil/core';

interface AutoPaySectionProps {
  autoPayEnabled: boolean;
  onToggleAutoPay: () => void;
}

/**
 * Renders the auto-pay toggle section with payment button
 */
export const AutoPaySection: FunctionalComponent<AutoPaySectionProps> = ({
  autoPayEnabled,
  onToggleAutoPay
}) => {
  return (
    <div class="autopay-section">
      <p class="autopay-question">¿Quieres reducir gastos mensuales?</p>
      <p class="autopay-description">
        <span class="autopay-action">Activa el pago automático</span> y recibe $3 de descuento mensual en tus facturas mensuales.
      </p>

      <div class="autopay-toggle-container">
        <span class="toggle-label">Automatizar pago</span>
        <div
          class={`toggle-switch ${autoPayEnabled ? 'enabled' : ''}`}
          onClick={onToggleAutoPay}
        >
          <div class="toggle-slider"></div>
        </div>
      </div>
    </div>
  );
};
