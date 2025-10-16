import { h, FunctionalComponent } from '@stencil/core';

interface SummarySectionProps {
  sectionId: string;
  title: string;
  amount: string;
  tooltipText: string;
  isExpanded: boolean;
  onToggle: (sectionId: string) => void;
  children?: any;
}

/**
 * Collapsible summary section with header and expandable content
 * Used for payment details, adjustments, and subscriber charges
 */
export const SummarySection: FunctionalComponent<SummarySectionProps> = (props) => {
  return (
    <div class="summary-section" data-section-id={props.sectionId}>
      <div
        class="summary-header"
        onClick={() => props.onToggle(props.sectionId)}
      >
        <div class="summary-title-container">
          <span class="summary-title">{props.title}</span>
          <img
            src="/assets/icons/info.png"
            alt="Info"
            class="info-icon summary-info"
            data-tooltip={props.tooltipText}
          />
        </div>
        <div class="summary-amount-container">
          <span class="summary-amount">{props.amount}</span>
          <span class={`summary-arrow ${props.isExpanded ? 'expanded' : ''}`}>
            <img src="/assets/icons/chevron-down.png" alt="Arrow" class="arrow-icon" />
          </span>
        </div>
      </div>
      <div class={`summary-content ${props.isExpanded ? 'expanded' : ''}`}>
        {props.children}
      </div>
    </div>
  );
};
