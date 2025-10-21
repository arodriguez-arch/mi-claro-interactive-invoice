import { h, FunctionalComponent } from '@stencil/core';
import { BillData, CargosPorTipo } from '../types/invoice-types';

interface ChargesSectionProps {
  isLoading: boolean;
  currentBill: BillData | null;
  expandedSubscriberId: string | null;
  expandedSummarySection: { [key: string]: boolean };
  formatCurrency: (amount: number | undefined | null) => string;
}

/**
 * Renders the charges/services section showing cargosPorTipo and cargosDeCuenta
 */
export const ChargesSection: FunctionalComponent<ChargesSectionProps> = ({
  isLoading,
  currentBill,
  expandedSubscriberId,
  expandedSummarySection,
  formatCurrency
}) => {
  const hasCargosPorTipo = currentBill?.cargosPorTipo && currentBill.cargosPorTipo.length > 0;
  const hasCargosDeCuenta = currentBill?.cargosDeCuenta !== null && currentBill?.cargosDeCuenta !== undefined;

  // Show section if loading detail OR if there's any data
  if (!isLoading && !hasCargosPorTipo && !hasCargosDeCuenta) {
    return null;
  }

  const renderCargosPorTipo = () => {
    if (isLoading) {
      return (
        <>
          <div class="skeleton skeleton-text" style={{ width: '100%', height: '24px', marginBottom: '8px' }}></div>
          <div class="skeleton skeleton-text" style={{ width: '100%', height: '24px', marginBottom: '8px' }}></div>
        </>
      );
    }

    if (!hasCargosPorTipo) return null;

    return currentBill!.cargosPorTipo.map((cargo: CargosPorTipo, index: number) => {
      // Only highlight if the expanded subscriber's tipoLinea matches this cargo tipo
      const isHighlighted = expandedSubscriberId &&
        expandedSummarySection['bill-0-subscribers'] &&
        (() => {
          // Extract the detail index from expandedSubscriberId (format: "bill-0-sub-X")
          const match = expandedSubscriberId.match(/bill-0-sub-(\d+)/);
          if (match) {
            const detailIndex = parseInt(match[1]);
            const detail = currentBill?.detalle?.[detailIndex];
            return detail?.tipoLinea === cargo.tipo;
          }
          return false;
        })();

      return (
        <div key={index} class={`charges-item ${isHighlighted ? 'highlighted' : ''}`}>
          <span class="charges-label">{cargo.tipo}</span>
          <span class="charges-amount">{formatCurrency(cargo.totalNeto)}</span>
        </div>
      );
    });
  };

  const renderCargosDeCuenta = () => {
    if (isLoading) {
      return <div class="skeleton skeleton-text" style={{ width: '100%', height: '24px', marginBottom: '8px' }}></div>;
    }

    if (!hasCargosDeCuenta || !currentBill) return null;

    const cargosDeCuenta = currentBill.cargosDeCuenta;
    if (!cargosDeCuenta) return null;

    const isObject = typeof cargosDeCuenta === 'object' && cargosDeCuenta !== null;
    const label = isObject && 'seccion' in cargosDeCuenta
      ? (cargosDeCuenta as any).seccion
      : 'Cargos de cuenta / créditos';
    const amount = isObject && 'cargo' in cargosDeCuenta
      ? (cargosDeCuenta as any).cargo
      : (typeof cargosDeCuenta === 'number' ? cargosDeCuenta : 0);

    // Highlight if the account charges section is expanded
    const isHighlighted = Object.keys(expandedSummarySection).some(
      key => key.includes('account-charges') && expandedSummarySection[key]
    );

    return (
      <div class={`charges-item ${isHighlighted ? 'highlighted' : ''}`}>
        <span class="charges-label">{label}</span>
        <span class="charges-amount">{formatCurrency(amount)}</span>
      </div>
    );
  };

  return (
    <>
      <div class="charges-section">
        <h3 class="charges-title">Cargos por servicios</h3>
        {renderCargosPorTipo()}
        {renderCargosDeCuenta()}
      </div>
      <div class="separator"></div>
    </>
  );
};
