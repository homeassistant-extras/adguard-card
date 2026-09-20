import { getEntitySuggestion } from '@delegates/utils/entity-suggestion';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import { expect } from 'chai';

describe('entity-suggestion.ts', () => {
  const deviceId = 'adguard-device-1';

  const mockHass = {
    devices: {
      [deviceId]: {
        id: deviceId,
        name: 'AdGuard Home',
        identifiers: [['adguard', 'http://192.168.1.2:3000']],
      },
      'other-device': {
        id: 'other-device',
        name: 'Some Light',
        identifiers: [['hue', 'abc']],
      },
    },
    entities: {
      'sensor.adguard_dns_queries': {
        entity_id: 'sensor.adguard_dns_queries',
        device_id: deviceId,
      },
      'switch.adguard_protection': {
        entity_id: 'switch.adguard_protection',
        device_id: deviceId,
      },
      'light.kitchen': {
        entity_id: 'light.kitchen',
        device_id: 'other-device',
      },
      'sensor.orphan': {
        entity_id: 'sensor.orphan',
        device_id: 'missing-device',
      },
      'sensor.no_device': {
        entity_id: 'sensor.no_device',
      },
    },
  } as unknown as HomeAssistant;

  it('should suggest the card for an AdGuard sensor entity', () => {
    expect(
      getEntitySuggestion(mockHass, 'sensor.adguard_dns_queries'),
    ).to.deep.equal({
      config: {
        type: 'custom:adguard-card',
        device_id: deviceId,
      },
    });
  });

  it('should suggest the card for an AdGuard switch entity', () => {
    expect(
      getEntitySuggestion(mockHass, 'switch.adguard_protection'),
    ).to.deep.equal({
      config: {
        type: 'custom:adguard-card',
        device_id: deviceId,
      },
    });
  });

  it('should return null for an entity on a non-adguard device', () => {
    expect(getEntitySuggestion(mockHass, 'light.kitchen')).to.be.null;
  });

  it('should return null for an unknown entity', () => {
    expect(getEntitySuggestion(mockHass, 'sensor.does_not_exist')).to.be.null;
  });

  it('should return null when the entity has no device', () => {
    expect(getEntitySuggestion(mockHass, 'sensor.no_device')).to.be.null;
  });

  it('should return null when the device is missing from the registry', () => {
    expect(getEntitySuggestion(mockHass, 'sensor.orphan')).to.be.null;
  });
});
