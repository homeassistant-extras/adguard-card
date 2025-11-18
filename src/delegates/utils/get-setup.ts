import { sortEntitiesByOrder } from '@common/sort-entities';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import type { AdGuardSetup, EntityInformation } from '@type/types';
import { getAdGuard } from './get-adguard';

/**
 * Gets the AdGuard setup information from Home Assistant
 * @param hass - The Home Assistant instance
 * @param config - The configuration object
 * @returns The AdGuard setup object or undefined if no devices are found
 */
export const getAdGuardSetup = (
  hass: HomeAssistant,
  config: Config,
): AdGuardSetup | undefined => {
  // Handle both string and array device IDs
  const deviceIds = Array.isArray(config.device_id)
    ? config.device_id
    : [config.device_id];

  if (deviceIds.length === 0) {
    return undefined;
  }

  // keep track of switches that are not in the first device
  const spareSwitches: EntityInformation[] = [];

  const holes = deviceIds
    .map((deviceId, i) => getAdGuard(hass, config, deviceId))
    .filter((hole) => hole !== undefined)
    .map((hole, i) => {
      if (i > 0) {
        spareSwitches.push(...hole.switches);
        // don't track entites that are not in the first device
        return {
          device_id: hole.device_id,
          // required for the setup state to work
          status: hole.status,
          controls: [],
          sensors: [],
          switches: [],
          updates: [],
        };
      }
      return hole;
    });

  if (holes.length > 1) {
    const primary = holes[0]!;
    // resort the combined switches
    primary.switches = sortEntitiesByOrder(config, [
      ...primary.switches,
      ...spareSwitches,
    ]);
  }

  return {
    holes,
  };
};
