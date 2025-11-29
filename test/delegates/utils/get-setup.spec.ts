import * as getAdGuardModule from '@delegates/utils/get-adguard';
import { getAdGuardSetup } from '@delegates/utils/get-setup';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { restore, stub } from 'sinon';

describe('get-setup.ts', () => {
  let mockHass: HomeAssistant;
  let mockConfig: Config;
  let getAdGuardStub: sinon.SinonStub;

  beforeEach(() => {
    // Create mock HomeAssistant instance
    mockHass = {} as HomeAssistant;

    // Create mock config with a single device_id
    mockConfig = {
      device_id: 'adguard_device_1',
    };

    // Stub the getAdGuard function
    getAdGuardStub = stub(getAdGuardModule, 'getAdGuard');

    // Default behavior returns mock device for the first device ID
    getAdGuardStub.withArgs(mockHass, mockConfig, 'adguard_device_1').returns({
      device_id: 'adguard_device_1',
      sensors: [],
      switches: [],
      controls: [],
      updates: [],
    });

    // Default behavior returns undefined for this second device ID
    getAdGuardStub
      .withArgs(mockHass, mockConfig, 'non_existent_device')
      .returns(undefined);

    // Mock a second valid device
    getAdGuardStub.withArgs(mockHass, mockConfig, 'adguard_device_2').returns({
      device_id: 'adguard_device_2',
      sensors: [],
      switches: [],
      controls: [],
      updates: [],
    });
  });

  afterEach(() => {
    // Restore all stubs
    restore();
  });

  it('should handle a single device_id string', () => {
    // Arrange - using default mockConfig with single device_id

    // Act
    const result = getAdGuardSetup(mockHass, mockConfig);

    // Assert
    expect(result).to.exist;
    expect(result?.holes).to.be.an('array').with.lengthOf(1);
    expect(result?.holes[0]?.device_id).to.equal('adguard_device_1');

    // Verify getAdGuard was called exactly once with the correct parameters
    expect(getAdGuardStub.calledOnce).to.be.true;
    expect(getAdGuardStub.firstCall.args[0]).to.equal(mockHass);
    expect(getAdGuardStub.firstCall.args[1]).to.equal(mockConfig);
    expect(getAdGuardStub.firstCall.args[2]).to.equal('adguard_device_1');
  });

  it('should handle an array of device_ids', () => {
    // Arrange - update config to have multiple device IDs
    mockConfig.device_id = ['adguard_device_1', 'adguard_device_2'];

    // Act
    const result = getAdGuardSetup(mockHass, mockConfig);

    // Assert
    expect(result).to.exist;
    expect(result?.holes).to.be.an('array').with.lengthOf(2);
    expect(result?.holes[0]?.device_id).to.equal('adguard_device_1');
    expect(result?.holes[1]?.device_id).to.equal('adguard_device_2');

    // Verify getAdGuard was called twice with the correct parameters
    expect(getAdGuardStub.calledTwice).to.be.true;
    expect(getAdGuardStub.firstCall.args[2]).to.equal('adguard_device_1');
    expect(getAdGuardStub.secondCall.args[2]).to.equal('adguard_device_2');
  });

  it('should filter out non-existent devices', () => {
    // Arrange - config with mix of valid and invalid device IDs
    mockConfig.device_id = [
      'adguard_device_1',
      'non_existent_device',
      'adguard_device_2',
    ];

    // Act
    const result = getAdGuardSetup(mockHass, mockConfig);

    // Assert
    expect(result).to.exist;
    expect(result?.holes).to.be.an('array').with.lengthOf(2);
    expect(result?.holes[0]?.device_id).to.equal('adguard_device_1');
    expect(result?.holes[1]?.device_id).to.equal('adguard_device_2');

    // Verify getAdGuard was called three times but only two valid devices were returned
    expect(getAdGuardStub.calledThrice).to.be.true;
  });

  it('should return undefined if device_id array is empty', () => {
    // Arrange - config with empty device_id array
    const configWithEmptyDevices: Config = {
      ...mockConfig,
      device_id: [],
    };

    // Act
    const result = getAdGuardSetup(mockHass, configWithEmptyDevices);

    // Assert
    expect(result).to.be.undefined;

    // Verify getAdGuard was not called at all
    expect(getAdGuardStub.called).to.be.false;
  });

  it('should return empty holes array if all devices are invalid', () => {
    // Arrange - config with only invalid device IDs
    const configWithInvalidDevices: Config = {
      ...mockConfig,
      device_id: ['non_existent_device_1', 'non_existent_device_2'],
    };

    // Set up stub to return undefined for both device IDs
    getAdGuardStub
      .withArgs(mockHass, configWithInvalidDevices, 'non_existent_device_1')
      .returns(undefined);
    getAdGuardStub
      .withArgs(mockHass, configWithInvalidDevices, 'non_existent_device_2')
      .returns(undefined);

    // Act
    const result = getAdGuardSetup(mockHass, configWithInvalidDevices);

    // Assert
    expect(result).to.exist;
    expect(result?.holes).to.be.an('array').with.lengthOf(0);

    // Verify getAdGuard was called twice but no valid devices were found
    expect(getAdGuardStub.calledTwice).to.be.true;
  });

  it('should add switches from additional devices to the first device and limit other device fields', () => {
    // Arrange - Create first device with one switch
    const device1Switch = {
      entity_id: 'switch.pi_hole_1',
      state: 'on',
      attributes: { friendly_name: 'AdGuard 1' },
      translation_key: undefined,
    };

    const device1Status = {
      entity_id: 'binary_sensor.pi_hole_status_1',
      state: 'on',
      attributes: { friendly_name: 'AdGuard Status 1' },
      translation_key: undefined,
    };

    const device1 = {
      device_id: 'adguard_device_1',
      status: device1Status,
      switches: [device1Switch],
      sensors: [
        {
          entity_id: 'sensor.pi_hole_1_dns_queries',
          state: '1000',
          attributes: {},
          translation_key: 'dns_queries',
        },
      ],
      controls: [
        {
          entity_id: 'button.pi_hole_1_refresh',
          state: 'off',
          attributes: {},
          translation_key: 'refresh',
        },
      ],
      updates: [
        {
          entity_id: 'update.pi_hole_1_core',
          state: 'off',
          attributes: {},
          translation_key: undefined,
        },
      ],
    };

    // Create second device with two switches
    const device2Switch1 = {
      entity_id: 'switch.pi_hole_2_primary',
      state: 'on',
      attributes: { friendly_name: 'AdGuard 2 Primary' },
      translation_key: undefined,
    };

    const device2Switch2 = {
      entity_id: 'switch.pi_hole_2_secondary',
      state: 'off',
      attributes: { friendly_name: 'AdGuard 2 Secondary' },
      translation_key: undefined,
    };

    const device2Status = {
      entity_id: 'binary_sensor.pi_hole_status_2',
      state: 'on',
      attributes: { friendly_name: 'AdGuard Status 2' },
      translation_key: 'protection',
    };

    const device2 = {
      device_id: 'adguard_device_2',
      protection: device2Status,
      switches: [device2Switch1, device2Switch2],
      sensors: [
        {
          entity_id: 'sensor.pi_hole_2_dns_queries',
          state: '2000',
          attributes: {},
          translation_key: 'dns_queries',
        },
      ],
      controls: [
        {
          entity_id: 'button.pi_hole_2_refresh',
          state: 'off',
          attributes: {},
          translation_key: 'refresh',
        },
      ],
      updates: [
        {
          entity_id: 'update.pi_hole_2_core',
          state: 'off',
          attributes: {},
          translation_key: undefined,
        },
      ],
    };

    // Set up the stub responses
    getAdGuardStub
      .withArgs(mockHass, mockConfig, 'adguard_device_1')
      .returns(device1);
    getAdGuardStub
      .withArgs(mockHass, mockConfig, 'adguard_device_2')
      .returns(device2);

    // Set config with multiple device IDs
    mockConfig.device_id = ['adguard_device_1', 'adguard_device_2'];

    // Act
    const result = getAdGuardSetup(mockHass, mockConfig);

    // Assert
    expect(result).to.exist;
    expect(result?.holes).to.be.an('array').with.lengthOf(2);

    // Check first device has its original switches plus switches from second device
    expect(result?.holes[0]?.switches).to.have.lengthOf(3);
    expect(result?.holes[0]?.switches).to.deep.include(device1Switch);
    expect(result?.holes[0]?.switches).to.deep.include(device2Switch1);
    expect(result?.holes[0]?.switches).to.deep.include(device2Switch2);

    // Check first device still has all its original properties
    expect(result?.holes[0]?.sensors).to.have.lengthOf(1);
    expect(result?.holes[0]?.controls).to.have.lengthOf(1);
    expect(result?.holes[0]?.updates).to.have.lengthOf(1);

    // Check second device only has device_id and status, with empty arrays for other properties
    expect(result?.holes[1]?.device_id).to.equal('adguard_device_2');
    console.log(result?.holes[1]?.protection);
    console.log(device2Status);
    expect(result?.holes[1]?.protection).to.deep.equal(device2Status);
    expect(result?.holes[1]?.switches).to.be.an('array').with.lengthOf(0);
    expect(result?.holes[1]?.sensors).to.be.an('array').with.lengthOf(0);
    expect(result?.holes[1]?.controls).to.be.an('array').with.lengthOf(0);
    expect(result?.holes[1]?.updates).to.be.an('array').with.lengthOf(0);
  });
});
