import { mapEntitiesByTranslationKey } from '@common/map-entities';
import { shouldSkipEntity } from '@common/skip-entity';
import { sortEntitiesByOrder } from '@common/sort-entities';
import { computeDomain } from '@hass/common/entity/compute_domain';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import type { AdGuardDevice } from '@type/types';
import { getDevice } from '../retrievers/device';
import { getDeviceEntities } from './card-entities';

/**
 * Gets the AdGuard device information from Home Assistant
 * @param hass - The Home Assistant instance
 * @param config - The configuration object
 * @param deviceId - The unique identifier for the device
 * @returns The device object or undefined if the device is not found
 */
export const getAdGuard = (
  hass: HomeAssistant,
  config: Config,
  deviceId: string,
): AdGuardDevice | undefined => {
  const device: AdGuardDevice = {
    device_id: deviceId,
    controls: [],
    sensors: [],
    switches: [],
  };

  const hassDevice = getDevice(hass, device.device_id);
  if (!hassDevice) {
    return undefined;
  }

  // Get all entities for the device
  let entities = getDeviceEntities(hass, hassDevice.id, hassDevice.name);

  // Map entities to the device object
  sortEntitiesByOrder(config, entities).forEach((entity) => {
    if (shouldSkipEntity(entity, config)) {
      return;
    }

    // Skip already handled entities by translation key
    if (mapEntitiesByTranslationKey(entity, device)) {
      return;
    }

    // Handle other entities by domain
    const domain = computeDomain(entity.entity_id);
    switch (domain) {
      case 'button':
        device.controls.push(entity);
        break;
      case 'sensor':
        device.sensors.push(entity);
        break;
      case 'switch':
        device.switches.push(entity);
        break;
    }
  });

  return device;
};
