import * as actionHandlerDelegate from '@delegates/action-handler-delegate';
import { icon } from '@html/components/pi-icon';
import { fixture } from '@open-wc/testing-helpers';
import type { Config } from '@type/config';
import type { AdGuardDevice, AdGuardSetup } from '@type/types';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('icon.ts', () => {
  let mockConfig: Config;
  let mockSetup: AdGuardSetup;
  let mockElement: HTMLElement;
  let actionHandlerStub: sinon.SinonStub;
  let handleMultiPiClickActionStub: sinon.SinonStub;

  beforeEach(() => {
    // Create basic mock config
    mockConfig = {
      device_id: 'adguard_device',
    };

    // Create basic mock setup
    mockSetup = {
      holes: [
        {
          device_id: 'adguard_device_1',
          sensors: [],
          switches: [],
          controls: [],
          updates: [],
        } as AdGuardDevice,
      ],
    };

    // Create mock element
    mockElement = document.createElement('div');

    // Stub action handler functions
    actionHandlerStub = stub(actionHandlerDelegate, 'actionHandler').returns(
      () => {},
    );
    handleMultiPiClickActionStub = stub(
      actionHandlerDelegate,
      'handleMultiPiClickAction',
    ).returns({ handleEvent: () => {} });
  });

  afterEach(() => {
    actionHandlerStub.restore();
    handleMultiPiClickActionStub.restore();
  });

  describe('icon rendering', () => {
    it('should render default icon when no custom icon is configured', async () => {
      const result = icon(mockElement, mockConfig, mockSetup);
      const el = await fixture(result as TemplateResult);

      // Check that badge div is rendered with ha-icon inside
      expect(el.classList.contains('badge')).to.be.true;
      const haIcon = el.querySelector('ha-icon');
      expect(haIcon).to.not.be.null;
      expect(haIcon!.getAttribute('icon')).to.equal('mdi:shield-check');
    });

    it('should render custom icon when configured', async () => {
      mockConfig.icon = 'mdi:custom-icon';

      const result = icon(mockElement, mockConfig, mockSetup);
      const el = await fixture(result as TemplateResult);

      // Check that ha-icon element is rendered with custom icon
      const haIcon = el.querySelector('ha-icon');
      expect(haIcon).to.not.be.null;
      expect(haIcon!.getAttribute('icon')).to.equal('mdi:custom-icon');
    });

    it('should handle empty holes array', async () => {
      mockSetup.holes = [];

      const result = icon(mockElement, mockConfig, mockSetup);
      const el = await fixture(result as TemplateResult);

      // Should render icon
      const haIcon = el.querySelector('ha-icon');
      expect(haIcon).to.not.be.null;
      expect(haIcon!.getAttribute('icon')).to.equal('mdi:shield-check');
    });
  });

  describe('action handler integration', () => {
    it('should call action handlers with correct configurations', async () => {
      mockSetup.holes[0]!.status = {
        entity_id: 'sensor.pi_hole_status',
        state: 'enabled',
        attributes: {},
        translation_key: 'status',
      };

      const result = icon(mockElement, mockConfig, mockSetup);
      await fixture(result as TemplateResult);

      // Verify actionHandler was called with first action config
      expect(actionHandlerStub.calledOnce).to.be.true;
      const firstCallArgs = actionHandlerStub.firstCall.args[0];
      expect(firstCallArgs).to.have.property('entity', 'sensor.pi_hole_status');
      expect(firstCallArgs).to.have.property('tap_action');
      expect(firstCallArgs).to.have.property('hold_action');
      expect(firstCallArgs).to.have.property('double_tap_action');

      // Verify handleMultiPiClickAction was called with element and action configs
      expect(handleMultiPiClickActionStub.calledOnce).to.be.true;
      const multiClickArgs = handleMultiPiClickActionStub.firstCall.args;
      expect(multiClickArgs[0]).to.equal(mockElement);
      expect(multiClickArgs[1]).to.be.an('array');
    });

    it('should create default action configurations when no custom badge config', async () => {
      mockSetup.holes[0]!.status = {
        entity_id: 'sensor.pi_hole_status',
        state: 'enabled',
        attributes: {},
        translation_key: 'status',
      };

      const result = icon(mockElement, mockConfig, mockSetup);
      await fixture(result as TemplateResult);

      const actionConfig = actionHandlerStub.firstCall.args[0];
      expect(actionConfig.entity).to.equal('sensor.pi_hole_status');
      expect(actionConfig.tap_action.action).to.equal('more-info');
      expect(actionConfig.hold_action.action).to.equal('more-info');
      expect(actionConfig.double_tap_action.action).to.equal('more-info');
    });

    it('should use custom badge configuration when provided', async () => {
      mockConfig.badge = {
        tap_action: {
          action: 'navigate',
          navigation_path: '/custom-path',
        },
        hold_action: {
          action: 'toggle',
        },
      };
      mockSetup.holes[0]!.status = {
        entity_id: 'sensor.pi_hole_status',
        state: 'enabled',
        attributes: {},
        translation_key: 'status',
      };

      const result = icon(mockElement, mockConfig, mockSetup);
      await fixture(result as TemplateResult);

      const actionConfig = actionHandlerStub.firstCall.args[0];
      expect(actionConfig.entity).to.equal('sensor.pi_hole_status');
      expect(actionConfig.tap_action.action).to.equal('navigate');
      expect(actionConfig.tap_action.navigation_path).to.equal('/custom-path');
      expect(actionConfig.hold_action.action).to.equal('toggle');
    });

    it('should fallback to device_id when no status entity available', async () => {
      // No status entity
      const result = icon(mockElement, mockConfig, mockSetup);
      await fixture(result as TemplateResult);

      const actionConfig = actionHandlerStub.firstCall.args[0];
      expect(actionConfig.entity).to.equal('adguard_device_1');
    });

    it('should handle multiple AdGuard instances with different configurations', async () => {
      // First AdGuard with status
      mockSetup.holes[0]!.status = {
        entity_id: 'sensor.adguard_1_status',
        state: 'enabled',
        attributes: {},
        translation_key: 'status',
      };

      // Second AdGuard with only device_id
      const secondDevice: AdGuardDevice = {
        device_id: 'adguard_device_2',
        sensors: [],
        switches: [],
        controls: [],
        updates: [],
      };
      mockSetup.holes.push(secondDevice);

      const result = icon(mockElement, mockConfig, mockSetup);
      await fixture(result as TemplateResult);

      // Verify multiple action configs were passed to handleMultiPiClickAction
      const multiClickArgs = handleMultiPiClickActionStub.firstCall.args;
      expect(multiClickArgs[1]).to.have.length(2);
      expect(multiClickArgs[1][0].entity).to.equal('sensor.adguard_1_status');
      expect(multiClickArgs[1][1].entity).to.equal('adguard_device_2');
    });
  });
});
