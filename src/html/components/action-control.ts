import {
  actionHandler,
  handleClickAction,
} from '@delegates/action-handler-delegate';
import type { SectionConfig } from '@type/config';
import type { EntityInformation } from '@type/types';
import { type TemplateResult, html } from 'lit';

/**
 * Provide some default icons for the AdGuard actions
 * @param entity
 * @returns
 */
const actionIcon = (entity: EntityInformation) => {
  const icon = entity?.attributes.icon;
  if (icon) {
    return icon;
  }

  switch (entity.translation_key) {
    case 'action_flush_arp':
      return 'mdi:broom';
    case 'action_flush_logs':
      return 'mdi:file-refresh-outline';
    case 'action_gravity':
      return 'mdi:earth';
    case 'action_restartdns':
      return 'mdi:restart';
    case 'action_refresh_data':
      return 'mdi:refresh';
    default:
      return 'mdi:button-pointer';
  }
};

/**
 * Creates an action button for the AdGuard card
 * @param element - The element to attach the action to
 * @param config - The section configuration
 * @param entity - The entity information
 * @param buttonClass - Optional CSS class for the button
 * @returns TemplateResult
 */
export const createActionButton = (
  element: HTMLElement,
  config: SectionConfig,
  entity: EntityInformation,
  buttonClass?: string,
): TemplateResult => {
  const icon = actionIcon(entity);
  const label = entity?.attributes.friendly_name
    .replace('Pihole- ', '')
    .replace('pihole-', '')
    .replace(' the ', ' ');

  return html`
    <mwc-button
      class="${buttonClass}"
      @action=${handleClickAction(element, config, entity)}
      .actionHandler=${actionHandler(config)}
    >
      <ha-icon icon="${icon}"></ha-icon>
      ${label}
    </mwc-button>
  `;
};
