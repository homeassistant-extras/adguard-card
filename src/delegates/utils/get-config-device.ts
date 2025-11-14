import type { DeviceRegistryEntry } from '@hass/data/device_registry';
import type { HomeAssistant } from '@hass/types';

/**
 * Gets the AdGuard device information from Home Assistant
 * @param hass - The Home Assistant instance
 * @returns The device object or undefined if the device is not found
 */
export const getConfigDevice = async (
  hass: HomeAssistant,
): Promise<DeviceRegistryEntry | undefined> => {
  const registries: { entry_id: string }[] = await hass.callWS({
    type: 'config_entries/get',
    domain: 'adguard',
  });

  const registry = registries[0];

  if (!registry) {
    return undefined;
  }

  const devices = Object.values(hass.devices).filter(
    (device: DeviceRegistryEntry) =>
      device.config_entries.includes(registry.entry_id),
  );

  return devices[0];
};
