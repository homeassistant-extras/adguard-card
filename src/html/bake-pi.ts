import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import type { AdGuardSetup } from '@type/types';
import { html, type TemplateResult } from 'lit';
import { createSystemMetricsGraph } from './components/create-system-metrics-graph';
import { createCardHeader } from './pi-crust';
import { createDashboardStats } from './pi-fillings';
import { createCardActions } from './pi-flavors';
import { createFooter } from './pi-tin';
import { createAdditionalStats } from './pi-toppings';

/**
 * Renders the AdGuard card content
 * @param element - The HTML element to render the card into
 * @param hass - The Home Assistant instance
 * @param setup - The AdGuard setup
 * @param config - The card configuration
 * @returns TemplateResult
 */
export const renderAdGuardCard = (
  element: HTMLElement,
  hass: HomeAssistant,
  setup: AdGuardSetup,
  config: Config,
): TemplateResult => {
  const primary = setup.holes[0]!;
  return html`
    <ha-card>
      ${createCardHeader(element, setup, hass, config)}
      <div class="card-content">
        ${createDashboardStats(element, hass, primary, config)}
        ${createAdditionalStats(element, hass, primary, config)}
      </div>
      ${createCardActions(element, hass, setup, primary, config)}
      ${createFooter(element, hass, config, primary)}
      ${createSystemMetricsGraph(hass, primary, config)}
    </ha-card>
  `;
};
