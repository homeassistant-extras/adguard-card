import type { CustomCardSuggestion } from '@homeassistant-extras/hass/data/lovelace_custom_cards';
import { getDevice } from '@homeassistant-extras/hass/delegates/retrievers/device';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';

/** Integration that owns AdGuard Home devices. */
const ADGUARD_INTEGRATION = 'adguard';

/**
 * Resolves an entity to its AdGuard device id, or `null` when the entity is
 * missing or not owned by that integration.
 */
const adguardDeviceId = (
  hass: HomeAssistant,
  entityId: string,
): string | null => {
  const entity = hass.entities[entityId];
  if (!entity?.device_id) return null;

  const device = getDevice(hass, entity.device_id);
  if (!device) return null;

  const isAdGuard = device.identifiers.some(
    ([integration]) => integration === ADGUARD_INTEGRATION,
  );
  if (!isAdGuard) return null;

  return device.id;
};

/**
 * Suggest an AdGuard card when the picker is given an AdGuard entity.
 *
 * @returns a suggestion for AdGuard entities, otherwise `null`.
 */
export const getEntitySuggestion = (
  hass: HomeAssistant,
  entityId: string,
): CustomCardSuggestion | null => {
  const deviceId = adguardDeviceId(hass, entityId);
  if (!deviceId) return null;

  return {
    config: {
      type: 'custom:adguard-card',
      device_id: deviceId,
    },
  };
};
