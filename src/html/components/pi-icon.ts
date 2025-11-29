import {
  actionHandler,
  handleMultiPiClickAction,
} from '@delegates/action-handler-delegate';
import type { Config } from '@type/config';
import type { AdGuardSetup } from '@type/types';
import { html, type TemplateResult } from 'lit';

/**
 * Renders an icon for the AdGuard setup.
 *
 * @param element - The HTML element to render the icon into
 * @param config - The configuration object containing icon information.
 * @param setup - The AdGuardSetup object containing the list of holes.
 * @returns A TemplateResult displaying the configured icon (or a default).
 */
export const icon = (
  element: HTMLElement,
  config: Config,
  setup: AdGuardSetup,
): TemplateResult => {
  // Create ActionConfigParams for each AdGuard instance
  const actionConfigs = setup.holes.map((h) => {
    // If user has custom badge config, apply it to all AdGuard instances
    if (config.badge) {
      return {
        entity: h.protection?.entity_id ?? h.device_id,
        ...config.badge,
      };
    }

    // Use config.badge if provided, otherwise create custom actions
    const baseConfig = {
      tap_action: {
        action: 'more-info' as const,
      },
      hold_action: {
        action: 'more-info' as const,
      },
      double_tap_action: {
        action: 'more-info' as const,
      },
    };

    // For AdGuard instances, use the base config
    return {
      entity: h.protection?.entity_id ?? h.device_id,
      ...baseConfig,
    };
  });

  return html`<div
    class="badge"
    @action=${handleMultiPiClickAction(element, actionConfigs)}
    .actionHandler=${actionHandler(actionConfigs[0])}
  >
    <ha-icon icon="${config.icon ?? 'mdi:shield-check'}"></ha-icon>
  </div>`;
};
