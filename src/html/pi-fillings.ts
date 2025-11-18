import { getDashboardStats } from '@common/get-stats';
import { show } from '@common/show-section';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import type { AdGuardDevice, EntityInformation } from '@type/types';
import { html, nothing, type TemplateResult } from 'lit';
import { createStatBox } from './components/stat-box';

/**
 * Creates the dashboard stats section of the AdGuard card
 * @param element - The HTML element to render the card into
 * @param hass - The Home Assistant object
 * @param device - The AdGuard device
 * @param config - The card configuration
 * @returns TemplateResult
 */
export const createDashboardStats = (
  element: HTMLElement,
  hass: HomeAssistant,
  device: AdGuardDevice,
  config: Config,
): TemplateResult | typeof nothing => {
  if (!show(config, 'statistics')) return nothing;

  // Get the unique clients count for the configuration
  const safeSearchesEnforced = device.safe_searches_enforced?.state ?? '0';

  // Get the stats configuration with the unique clients count
  const statConfigs = getDashboardStats(safeSearchesEnforced);

  return html`
    <div class="dashboard-stats">
      ${statConfigs.map(
        (group) => html`
          <div class="stat-group">
            ${group.map((statConfig) =>
              createStatBox(
                element,
                hass,
                device[statConfig.sensorKey] as EntityInformation | undefined,
                config.stats,
                statConfig,
              ),
            )}
          </div>
        `,
      )}
    </div>
  `;
};
