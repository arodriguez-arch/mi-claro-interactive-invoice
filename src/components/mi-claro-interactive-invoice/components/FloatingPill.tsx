import { h, FunctionalComponent } from '@stencil/core';
import { FloatingPillData } from '../types/invoice-types';

interface FloatingPillProps {
  data: FloatingPillData;
  onScroll: (sectionId: string) => void;
}

/**
 * Floating pill component that appears on mobile to show active section
 * Clicking it scrolls to the corresponding section
 */
export const FloatingPill: FunctionalComponent<FloatingPillProps> = ({ data, onScroll }) => {
  return (
    <div
      class="floating-pill"
      onClick={() => onScroll(data.sectionId)}
    >
      <span class="floating-pill-title">{data.title}</span>
      <span class="floating-pill-amount">{data.amount}</span>
    </div>
  );
};
