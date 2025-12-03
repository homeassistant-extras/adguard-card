import * as mapEntitiesModule from '@common/map-entities';
import * as skipEntityModule from '@common/skip-entity';
import { getDevice } from '@delegates/retrievers/device';
import * as cardEntitiesModule from '@delegates/utils/card-entities';
import { getAdGuard } from '@delegates/utils/get-adguard';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import type { EntityInformation } from '@type/types';
import { expect } from 'chai';
import { restore, stub } from 'sinon';

describe('get-adguard.ts', () => {
  let mockHass: HomeAssistant;
  let mockConfig: Config;
  let getDeviceStub: sinon.SinonStub;
  let getDeviceEntitiesStub: sinon.SinonStub;
  let mapEntitiesByTranslationKeyStub: sinon.SinonStub;
  let shouldSkipEntityStub: sinon.SinonStub;

  const DEVICE_ID = 'adguard_device_1';
  const DEVICE_NAME = 'AdGuard';

  beforeEach(() => {
    // Create mock config
    mockConfig = {
      device_id: DEVICE_ID,
    };

    // Mock Home Assistant instance
    mockHass = {} as unknown as HomeAssistant;

    // Set up stubs for dependencies
    getDeviceStub = stub();
    (getDevice as any) = getDeviceStub;
    getDeviceStub.withArgs(mockHass, DEVICE_ID).returns({
      id: DEVICE_ID,
      name: DEVICE_NAME,
    });
    getDeviceStub.withArgs(mockHass, 'non_existent_device').returns(undefined);

    // Stub for getDeviceEntities
    getDeviceEntitiesStub = stub(cardEntitiesModule, 'getDeviceEntities');

    // Stub for mapEntitiesByTranslationKey
    mapEntitiesByTranslationKeyStub = stub(
      mapEntitiesModule,
      'mapEntitiesByTranslationKey',
    );

    // Stub for shouldSkipEntity
    shouldSkipEntityStub = stub(skipEntityModule, 'shouldSkipEntity');
    shouldSkipEntityStub.returns(false); // Default to not skipping entities
  });

  afterEach(() => {
    restore(); // Restore all stubs
  });

  it('should return undefined when device is not found', () => {
    const result = getAdGuard(mockHass, mockConfig, 'non_existent_device');
    expect(result).to.be.undefined;
  });

  it('should initialize device with device_id', () => {
    // Mock an empty array of entities
    getDeviceEntitiesStub.returns([]);

    const result = getAdGuard(
      mockHass,
      mockConfig,
      mockConfig.device_id as string,
    );

    expect(result).to.exist;
    expect(result?.device_id).to.equal(DEVICE_ID);
    expect(result?.controls).to.be.an('array').with.lengthOf(0);
    expect(result?.sensors).to.be.an('array').with.lengthOf(0);
    expect(result?.switches).to.be.an('array').with.lengthOf(0);
  });

  it('should map entities using mapEntitiesByTranslationKey', () => {
    // Create some test entities
    const mockEntities = [
      createEntity('sensor.test_1', 'dns_queries', '10000'),
      createEntity('button.test_2', undefined),
    ];

    getDeviceEntitiesStub.returns(mockEntities);

    // Configure mapEntitiesByTranslationKey to return true for translation keys that exist
    mapEntitiesByTranslationKeyStub.callsFake((entity, device) => {
      return !!entity.translation_key;
    });

    const result = getAdGuard(
      mockHass,
      mockConfig,
      mockConfig.device_id as string,
    );

    // Verify mapEntitiesByTranslationKey was called for each entity
    expect(mapEntitiesByTranslationKeyStub.callCount).to.equal(
      mockEntities.length,
    );
  });

  it('should filter out entities that should be skipped', () => {
    // Create some test entities
    const mockEntities = [
      createEntity('sensor.test_1', 'dns_queries', '10000'),
      createEntity('button.test_2', undefined),
    ];

    getDeviceEntitiesStub.returns(mockEntities);

    // Configure shouldSkipEntity to skip the first entity
    shouldSkipEntityStub.withArgs(mockEntities[0], mockConfig).returns(true);
    shouldSkipEntityStub.withArgs(mockEntities[1], mockConfig).returns(false);

    // Configure mapEntitiesByTranslationKey to return false (so the entity goes to other arrays)
    mapEntitiesByTranslationKeyStub.returns(false);

    const result = getAdGuard(
      mockHass,
      mockConfig,
      mockConfig.device_id as string,
    );

    // Verify shouldSkipEntity was called for each entity
    expect(shouldSkipEntityStub.callCount).to.equal(mockEntities.length);

    // Verify only one entity was processed (the second one)
    expect(mapEntitiesByTranslationKeyStub.callCount).to.equal(1);
    expect(mapEntitiesByTranslationKeyStub.calledWith(mockEntities[1])).to.be
      .true;
  });

  it('should respect entity_order in config for entity ordering', () => {
    // Create test entities in a specific order
    const mockEntities = [
      createEntity('button.test_1', undefined, 'on'),
      createEntity('sensor.test_2', 'dns_queries', '1000'),
      createEntity('switch.test_3', undefined, 'on'),
      createEntity('button.test_4', undefined, 'off'),
    ];

    // Define a different order in the config
    mockConfig.entity_order = [
      'button.test_4', // This should come first
      'sensor.test_2', // This should come second
      'button.test_1', // This should come third
      // 'switch.test_3' is not included, so it should come last
    ];

    getDeviceEntitiesStub.returns(mockEntities);

    // Configure any needed stubs to pass through the entities
    mapEntitiesByTranslationKeyStub.returns(false);
    shouldSkipEntityStub.returns(false);

    // Get the result
    const result = getAdGuard(mockHass, mockConfig, DEVICE_ID);

    // Verify that entities were processed in the order specified by entity_order
    // Check calls to mapEntitiesByTranslationKey which should reflect processing order
    expect(mapEntitiesByTranslationKeyStub.callCount).to.equal(
      mockEntities.length,
    );

    // The first call should be for button.test_4
    expect(
      mapEntitiesByTranslationKeyStub.getCall(0).args[0].entity_id,
    ).to.equal('button.test_4');

    // The second call should be for sensor.test_2
    expect(
      mapEntitiesByTranslationKeyStub.getCall(1).args[0].entity_id,
    ).to.equal('sensor.test_2');

    // The third call should be for button.test_1
    expect(
      mapEntitiesByTranslationKeyStub.getCall(2).args[0].entity_id,
    ).to.equal('button.test_1');

    // The fourth call should be for switch.test_3 (not in entity_order)
    expect(
      mapEntitiesByTranslationKeyStub.getCall(3).args[0].entity_id,
    ).to.equal('switch.test_3');
  });
});

// Helper to create entity objects with minimal required properties
function createEntity(
  entity_id: string,
  translation_key: string | undefined,
  state: string = 'on',
  attributes: Record<string, any> = { friendly_name: 'friendly name' },
): EntityInformation {
  return {
    entity_id,
    translation_key,
    state,
    attributes,
  };
}
