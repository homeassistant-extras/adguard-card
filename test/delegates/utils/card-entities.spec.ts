import { getState } from '@delegates/retrievers/state';
import { getDeviceEntities } from '@delegates/utils/card-entities';
import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';
import { stub } from 'sinon';

describe('card-entities.ts', () => {
  let mockHass: HomeAssistant;
  let getStateStub: sinon.SinonStub;
  const DEVICE_ID = 'adguard_device_1';
  const DEVICE_NAME = 'Pi-hole';

  beforeEach(() => {
    // Create mock Home Assistant instance
    mockHass = {
      entities: {
        'sensor.pi_hole_dns_queries': {
          entity_id: 'sensor.pi_hole_dns_queries',
          device_id: DEVICE_ID,
          translation_key: 'dns_queries',
        },
        'sensor.adguard_average_processing_speed': {
          entity_id: 'sensor.adguard_average_processing_speed',
          device_id: DEVICE_ID,
          translation_key: 'average_processing_speed',
        },
        'binary_sensor.pi_hole_status': {
          entity_id: 'binary_sensor.pi_hole_status',
          device_id: DEVICE_ID,
          translation_key: 'status',
        },
        'update.pi_hole_v6_integration_update': {
          entity_id: 'update.pi_hole_v6_integration_update',
          device_id: 'some_other_device',
          translation_key: undefined,
        },
        'sensor.other_entity': {
          entity_id: 'sensor.other_entity',
          device_id: 'other_device',
          translation_key: undefined,
        },
      },
    } as unknown as HomeAssistant;

    // Stub the getState function with helper
    getStateStub = stub();
    (getState as any) = getStateStub;

    // Configure mock responses
    const mockStates = {
      'sensor.pi_hole_dns_queries': {
        entity_id: 'sensor.pi_hole_dns_queries',
        state: '10000',
        attributes: { friendly_name: 'Pi-hole DNS Queries Today' },
      },
      'sensor.adguard_average_processing_speed': {
        entity_id: 'sensor.adguard_average_processing_speed',
        state: '12.5',
        attributes: { friendly_name: 'Pi-hole Average Processing Speed' },
      },
      'binary_sensor.pi_hole_status': {
        entity_id: 'binary_sensor.pi_hole_status',
        state: 'on',
        attributes: { friendly_name: 'Pi-hole Status' },
      },
      'update.pi_hole_v6_integration_update': {
        entity_id: 'update.pi_hole_v6_integration_update',
        state: 'on',
        attributes: {
          friendly_name: 'Integration Update',
          installed_version: '1.0.0',
        },
      },
    };

    // Configure stub responses
    Object.entries(mockStates).forEach(([entityId, state]) => {
      getStateStub.withArgs(mockHass, entityId).returns(state);
    });

    getStateStub.withArgs(mockHass, 'sensor.other_entity').returns({
      entity_id: 'sensor.other_entity',
      state: 'value',
      attributes: { friendly_name: 'Other Entity' },
    });
  });

  describe('entity filtering', () => {
    it('should return correct entities for a device', () => {
      const entities = getDeviceEntities(mockHass, DEVICE_ID, DEVICE_NAME);

      expect(entities).to.be.an('array').with.lengthOf(4);

      const entityIds = entities.map((e) => e.entity_id);
      expect(entityIds).to.deep.equal([
        'sensor.pi_hole_dns_queries',
        'sensor.adguard_average_processing_speed',
        'binary_sensor.pi_hole_status',
        'update.pi_hole_v6_integration_update',
      ]);
    });

    it('should include hardcoded integration update entity', () => {
      const entities = getDeviceEntities(mockHass, DEVICE_ID, DEVICE_NAME);
      const updateEntity = entities.find(
        (e) => e.entity_id === 'update.pi_hole_v6_integration_update',
      );

      expect(updateEntity).to.exist;
      expect(updateEntity?.state).to.equal('on');
      expect(updateEntity?.attributes.installed_version).to.equal('1.0.0');
    });

    it('should handle edge cases', () => {
      // Test with undefined state
      getStateStub
        .withArgs(mockHass, 'binary_sensor.pi_hole_status')
        .returns(undefined);
      let entities = getDeviceEntities(mockHass, DEVICE_ID, DEVICE_NAME);
      expect(entities.map((e) => e.entity_id)).to.not.include(
        'binary_sensor.pi_hole_status',
      );

      // Test with empty entities
      const emptyHass = { entities: {} } as unknown as HomeAssistant;
      entities = getDeviceEntities(emptyHass, DEVICE_ID, DEVICE_NAME);
      expect(entities).to.be.an('array').with.lengthOf(0);
    });
  });

  describe('device name replacement logic', () => {
    it('should strip device name from friendly names', () => {
      const entities = getDeviceEntities(mockHass, DEVICE_ID, DEVICE_NAME);

      const expectedNameMappings: Record<string, string> = {
        'sensor.pi_hole_dns_queries': 'DNS Queries Today',
        'sensor.adguard_average_processing_speed': 'Average Processing Speed',
        'binary_sensor.pi_hole_status': 'Status',
        'update.pi_hole_v6_integration_update': 'Integration Update',
      };

      entities.forEach((entity) => {
        expect(entity.attributes.friendly_name).to.equal(
          expectedNameMappings[entity.entity_id],
        );
      });
    });

    it('should keep full name when it matches device name exactly', () => {
      // Mock an entity with name exactly matching device name
      getStateStub.withArgs(mockHass, 'sensor.pi_hole_exact_match').returns({
        entity_id: 'sensor.pi_hole_exact_match',
        state: 'value',
        attributes: { friendly_name: DEVICE_NAME },
      });

      mockHass.entities['sensor.pi_hole_exact_match'] = {
        entity_id: 'sensor.pi_hole_exact_match',
        device_id: DEVICE_ID,
        translation_key: 'exact_match',
      } as any;

      const entities = getDeviceEntities(mockHass, DEVICE_ID, DEVICE_NAME);
      const exactMatchEntity = entities.find(
        (e) => e.entity_id === 'sensor.pi_hole_exact_match',
      );

      expect(exactMatchEntity?.attributes.friendly_name).to.equal(DEVICE_NAME);
    });

    it('should handle null device name', () => {
      const entities = getDeviceEntities(mockHass, DEVICE_ID, null);

      entities.forEach((entity) => {
        // When deviceName is null, names should not be modified
        const originalState = getStateStub.withArgs(mockHass, entity.entity_id)
          .returnValues[0];
        expect(entity.attributes.friendly_name).to.equal(
          originalState?.attributes.friendly_name,
        );
      });
    });
  });

  describe('entity structure mapping', () => {
    it('should map entity properties correctly', () => {
      const entities = getDeviceEntities(mockHass, DEVICE_ID, DEVICE_NAME);
      const dnsQueriesEntity = entities.find(
        (e) => e.entity_id === 'sensor.pi_hole_dns_queries',
      );

      expect(dnsQueriesEntity).to.deep.include({
        entity_id: 'sensor.pi_hole_dns_queries',
        translation_key: 'dns_queries',
        state: '10000',
      });

      expect(dnsQueriesEntity?.attributes).to.deep.equal({
        friendly_name: 'DNS Queries Today',
      });
    });
  });
});
