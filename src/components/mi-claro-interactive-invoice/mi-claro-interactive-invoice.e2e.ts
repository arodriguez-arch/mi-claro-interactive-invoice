import { newE2EPage } from '@stencil/core/testing';

describe('mi-claro-interactive-invoice', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<mi-claro-interactive-invoice></mi-claro-interactive-invoice>');
    const element = await page.find('mi-claro-interactive-invoice');
    expect(element).toHaveClass('hydrated');
  });

  it('toggles expandable content when clicking Ver más', async () => {
    const page = await newE2EPage();
    await page.setContent('<mi-claro-interactive-invoice></mi-claro-interactive-invoice>');

    const toggleButton = await page.find('mi-claro-interactive-invoice >>> .toggle-button');
    const expandableContent = await page.find('mi-claro-interactive-invoice >>> .expandable-content');

    expect(await expandableContent.isVisible()).toBe(false);

    await toggleButton.click();
    await page.waitForChanges();

    const hasExpandedClass = await page.evaluate(() => {
      const element = document.querySelector('mi-claro-interactive-invoice').shadowRoot.querySelector('.expandable-content');
      return element.classList.contains('expanded');
    });
    expect(hasExpandedClass).toBe(true);
  });

  it('switches between tabs', async () => {
    const page = await newE2EPage();
    await page.setContent('<mi-claro-interactive-invoice></mi-claro-interactive-invoice>');

    const currentTab = await page.find('mi-claro-interactive-invoice >>> .tab:first-child');
    const previousTab = await page.find('mi-claro-interactive-invoice >>> .tab:last-child');

    expect(await currentTab.getAttribute('class')).toContain('active');
    expect(await previousTab.getAttribute('class')).not.toContain('active');

    await previousTab.click();
    await page.waitForChanges();

    expect(await currentTab.getAttribute('class')).not.toContain('active');
    expect(await previousTab.getAttribute('class')).toContain('active');
  });
});
