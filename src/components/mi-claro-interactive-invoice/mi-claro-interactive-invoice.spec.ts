import { newSpecPage } from '@stencil/core/testing';
import { MiClaroInteractiveInvoice } from './mi-claro-interactive-invoice';

describe('mi-claro-interactive-invoice', () => {
  it('renders', async () => {
    const { root } = await newSpecPage({
      components: [MiClaroInteractiveInvoice],
      html: '<mi-claro-interactive-invoice></mi-claro-interactive-invoice>',
    });
    expect(root.shadowRoot.querySelector('.invoice-container')).toBeTruthy();
    expect(root.shadowRoot.querySelector('.payment-summary')).toBeTruthy();
    expect(root.shadowRoot.querySelector('.invoice-details')).toBeTruthy();
  });

  it('toggles expandable content', async () => {
    const page = await newSpecPage({
      components: [MiClaroInteractiveInvoice],
      html: '<mi-claro-interactive-invoice></mi-claro-interactive-invoice>',
    });
    
    const toggleButton = page.root.shadowRoot.querySelector('.toggle-button') as HTMLButtonElement;
    const expandableContent = page.root.shadowRoot.querySelector('.expandable-content');
    
    expect(expandableContent).not.toHaveClass('expanded');
    
    toggleButton.click();
    await page.waitForChanges();
    
    expect(expandableContent).toHaveClass('expanded');
  });

  it('switches between tabs', async () => {
    const page = await newSpecPage({
      components: [MiClaroInteractiveInvoice],
      html: '<mi-claro-interactive-invoice></mi-claro-interactive-invoice>',
    });
    
    const tabs = page.root.shadowRoot.querySelectorAll('.tab');
    expect(tabs[0]).toHaveClass('active');
    expect(tabs[1]).not.toHaveClass('active');
    
    (tabs[1] as HTMLButtonElement).click();
    await page.waitForChanges();
    
    expect(tabs[0]).not.toHaveClass('active');
    expect(tabs[1]).toHaveClass('active');
  });
});
