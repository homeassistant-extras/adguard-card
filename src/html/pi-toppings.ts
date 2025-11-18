import { show } from '@common/show-section';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import type { AdGuardDevice } from '@type/types';
import { html, nothing, type TemplateResult } from 'lit';
import { createAdditionalStat } from './components/additional-stat';

/**
 * Creates the additional stats section for the AdGuard card
 * @param element - The element to attach the actions to
 * @param hass - The Home Assistant instance
 * @param device - The AdGuard device
 * @param config - The configuration for the card
 * @returns TemplateResult
 */
export const createAdditionalStats = (
  element: HTMLElement,
  hass: HomeAssistant,
  device: AdGuardDevice,
  config: Config,
): TemplateResult | typeof nothing => {
  if (!show(config, 'sensors')) return nothing;

  const regularSensors = device.sensors;

  return html`
    <div class="additional-stats">
      ${regularSensors.map((sensor) => {
        return createAdditionalStat(hass, element, config.info, sensor);
      })}
    </div>
  `;
};
