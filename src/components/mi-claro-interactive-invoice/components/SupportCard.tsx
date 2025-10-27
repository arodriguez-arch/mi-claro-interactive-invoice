import { h, FunctionalComponent } from '@stencil/core';

interface SupportCardProps {
  onGoToSupport: () => void;
}

/**
 * Support promotional card displayed in the first column
 */
export const SupportCard: FunctionalComponent<SupportCardProps> = ({ onGoToSupport }) => {
  return (
    <div class="card support-card">
      <img src="/assets/icons/24-hour.png" alt="Support" class="support-image" />
      <button class="support-button" onClick={onGoToSupport}>
        Ir a soporte
      </button>
    </div>
  );
};
