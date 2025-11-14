import { formatSecondsToHHMMSS } from '@common/convert-time';
import type { HomeAssistant } from '@hass/types';
import type { AdGuardSetup } from '@type/types';

/**
 * Pauses the specified AdGuard device for a given duration.
 *
 * @param hass - The Home Assistant instance used to call services.
 * @param setup - The AdGuard setup to be paused.
 * @param seconds - The duration to pause the device, in seconds.
 * @param entityId - Optional entity ID to target a specific switch instead of the device.
 */
export const handlePauseClick = (
  hass: HomeAssistant,
  setup: AdGuardSetup,
  seconds: number,
  entityId?: string,
) => {
  const domain = 'adguard';
  const service = 'disable';

  if (entityId) {
    // Use the new entity-based service call
    hass.callService(domain, service, {
      duration: formatSecondsToHHMMSS(seconds),
      entity_id: [entityId],
    });
  } else {
    // Fall back to device-based service call for backward compatibility
    setup.holes.forEach((hole) => {
      hass.callService(domain, service, {
        device_id: hole.device_id,
        duration: formatSecondsToHHMMSS(seconds),
      });
    });
  }
};
