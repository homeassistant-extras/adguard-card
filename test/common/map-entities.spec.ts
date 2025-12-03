import { mapEntitiesByTranslationKey } from '@common/map-entities';
import type { AdGuardDevice, EntityInformation } from '@type/types';
import { expect } from 'chai';

describe('map-entities.ts', () => {
  describe('mapEntitiesByTranslationKey', () => {
    let device: AdGuardDevice;

    beforeEach(() => {
      // Reset the device object before each test
      device = {
        device_id: 'test_device',
      sensors: [],
      switches: [],
    } as AdGuardDevice;
    });

    it('should map entity with known translation key to correct device property', () => {
      // Create test entity with a known translation key
      const entity: EntityInformation = {
        entity_id: 'sensor.dns_queries',
        state: '1234',
        attributes: { friendly_name: 'DNS Queries Today' },
        translation_key: 'dns_queries',
      };

      // Map the entity to the device
      const result = mapEntitiesByTranslationKey(entity, device);

      // Check that the mapping was successful
      expect(result).to.be.true;
      expect(device.dns_queries).to.equal(entity);
    });

    it('should map all supported translation keys correctly', () => {
      // Define all supported translation keys and their corresponding property names
      // Only include keys that are actively mapped in map-entities.ts
      const supportedKeys = [
        { key: 'dns_queries', prop: 'dns_queries' },
        { key: 'average_processing_speed', prop: 'average_processing_speed' },
        {
          key: 'dns_queries_blocked_ratio',
          prop: 'dns_queries_blocked_ratio',
        },
        { key: 'dns_queries_blocked', prop: 'dns_queries_blocked' },
        { key: 'safe_searches_enforced', prop: 'safe_searches_enforced' },
        // Pi-hole compatibility mappings
        { key: 'dns_queries_today', prop: 'dns_queries' },
        { key: 'domains_blocked', prop: 'dns_queries_blocked' },
        {
          key: 'ads_percentage_blocked_today',
          prop: 'dns_queries_blocked_ratio',
        },
        { key: 'ftl_info_message_count', prop: 'average_processing_speed' },
        { key: 'dns_unique_clients', prop: 'safe_searches_enforced' },
      ];

      // Test each key
      supportedKeys.forEach((item) => {
        const testEntity: EntityInformation = {
          entity_id: `sensor.test_${item.key}`,
          state: 'test_state',
          attributes: { friendly_name: `Test ${item.key}` },
          translation_key: item.key,
        };

        const result = mapEntitiesByTranslationKey(testEntity, device);

        expect(result).to.be.true;
        // @ts-ignore - We know this property exists on the type
        expect(device[item.prop]).to.equal(testEntity);
      });
    });

    it('should return false for entity with unknown translation key', () => {
      // Create test entity with an unknown translation key
      const entity: EntityInformation = {
        entity_id: 'sensor.unknown_entity',
        state: 'unknown',
        attributes: { friendly_name: 'Unknown Entity' },
        translation_key: 'unknown_key',
      };

      // Map the entity to the device
      const result = mapEntitiesByTranslationKey(entity, device);

      // Check that the mapping was unsuccessful
      expect(result).to.be.false;
      // @ts-ignore - Property doesn't exist on type
      expect(device.unknown_key).to.be.undefined;
    });

    it('should return false for entity with undefined translation key', () => {
      // Create test entity with an undefined translation key
      const entity: EntityInformation = {
        entity_id: 'sensor.no_translation_key',
        state: 'value',
        attributes: { friendly_name: 'No Translation Key' },
        translation_key: undefined,
      };

      // Map the entity to the device
      const result = mapEntitiesByTranslationKey(entity, device);

      // Check that the mapping was unsuccessful
      expect(result).to.be.false;
    });

    it('should not modify other properties of the device object', () => {
      // Set up a device with some existing properties
      device.dns_queries = {
        entity_id: 'sensor.existing_queries',
        state: '5000',
        attributes: { friendly_name: 'Existing Queries' },
        translation_key: 'dns_queries',
      };

      // Create test entity with a different translation key
      const entity: EntityInformation = {
        entity_id: 'sensor.average_processing_speed',
        state: '12.5',
        attributes: { friendly_name: 'Average Processing Speed' },
        translation_key: 'average_processing_speed',
      };

      // Map the new entity to the device
      mapEntitiesByTranslationKey(entity, device);

      // Check that the existing property wasn't modified
      expect(device.dns_queries.entity_id).to.equal('sensor.existing_queries');
      // Check that the new property was added
      expect(device.average_processing_speed).to.equal(entity);
    });
  });
});
