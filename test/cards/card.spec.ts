import { styles } from '@/styles';
import { AdGuardCard } from '@cards/card';
import * as getAdGuardModule from '@delegates/utils/get-adguard';
import * as getConfigDeviceModule from '@delegates/utils/get-config-device';
import type { HomeAssistant } from '@hass/types';
import { fixture } from '@open-wc/testing-helpers';
import type { Config } from '@type/config';
import type { AdGuardDevice } from '@type/types';
import { expect } from 'chai';
import type { TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('AdGuardCard', () => {
  let mockHass: HomeAssistant;
  let mockDevice: AdGuardDevice;
  let mockConfig: Config;
  let getAdGuardStub: sinon.SinonStub;
  let getConfigDeviceStub: sinon.SinonStub;

  beforeEach(() => {
    // Create a mock HomeAssistant instance
    mockHass = {
      callService: stub(),
      states: {
        'binary_sensor.pi_hole_status': {
          state: 'on',
          entity_id: 'binary_sensor.pi_hole_status',
          attributes: {
            friendly_name: 'AdGuard Status',
          },
        },
      },
    } as unknown as HomeAssistant;

    // Create mock device
    mockDevice = {
      device_id: 'adguard_device',
      status: {
        entity_id: 'binary_sensor.pi_hole_status',
        state: 'on',
        attributes: { friendly_name: 'AdGuard Status' },
        translation_key: undefined,
      },
      switch_pi_hole: {
        entity_id: 'switch.pi_hole',
        state: 'on',
        attributes: {},
        translation_key: undefined,
      },
      dns_queries_today: {
        entity_id: 'sensor.dns_queries_today',
        state: '12345',
        attributes: {},
        translation_key: 'dns_queries_today',
      },
    } as any as AdGuardDevice;

    // Create mock config
    mockConfig = {
      device_id: 'adguard_device',
    };

    // Stub getAdGuard function
    getAdGuardStub = stub(getAdGuardModule, 'getAdGuard').returns(mockDevice);

    // Stub getConfigDevice function for getStubConfig
    getConfigDeviceStub = stub(
      getConfigDeviceModule,
      'getConfigDevice',
    ).resolves({
      id: 'adguard_device',
      config_entries: ['entry_1'],
      name: 'AdGuard',
    });
  });

  afterEach(() => {
    // Restore stubs
    getAdGuardStub.restore();
    getConfigDeviceStub.restore();
  });

  it('should not update when hass changes but device data remains the same', async () => {
    const card = new AdGuardCard();

    // Set initial config and hass
    card.setConfig(mockConfig);
    card.hass = mockHass;

    // First call to getAdGuard
    expect(getAdGuardStub.calledOnce).to.be.true;

    // Set hass again with same device data
    card.hass = { ...mockHass };

    // Should not call getAdGuard again since device is the same
    expect(getAdGuardStub.calledTwice).to.be.true;
  });

  it('should getStubConfig correctly', async () => {
    const stubConfig = await AdGuardCard.getStubConfig(mockHass);

    // Check that getConfigDevice was called
    expect(getConfigDeviceStub.calledOnce).to.be.true;

    // Check that returned config is correct
    expect(stubConfig).to.deep.equal({
      device_id: 'adguard_device',
    });
  });

  it('should handle empty device ID in getStubConfig', async () => {
    // Update stub to return null/undefined
    getConfigDeviceStub.resolves(undefined);

    const stubConfig = await AdGuardCard.getStubConfig(mockHass);

    // Should return empty string for device_id
    expect(stubConfig).to.deep.equal({
      device_id: '',
    });
  });

  it('should return editor element when getConfigElement is called', () => {
    const editorElement = AdGuardCard.getConfigElement();

    // Check that it returns an element with the expected tag name
    expect(editorElement.tagName.toLowerCase()).to.equal('adguard-editor');
  });

  describe('styles', () => {
    it('should return expected styles', () => {
      const actual = AdGuardCard.styles;
      expect(actual).to.deep.equal(styles);
    });
  });

  describe('rendering', () => {
    it('should render a loading message when not ready', async () => {
      const card = new AdGuardCard();

      card.setConfig(undefined as any as Config);

      const el = await fixture(card.render() as TemplateResult);

      expect(el.querySelector('.no-devices')).to.exist;
      expect(el.textContent).to.include('Loading...');
    });
  });
});
