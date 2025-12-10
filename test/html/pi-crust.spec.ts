import * as showSectionModule from '@common/show-section';
import * as actionHandlerDelegate from '@delegates/action-handler-delegate';
import type { HomeAssistant } from '@hass/types';
import * as stateDisplayModule from '@html/components/state-display';
import { createCardHeader } from '@html/pi-crust';
import { fixture } from '@open-wc/testing-helpers';
import type { Config } from '@type/config';
import type { AdGuardDevice, AdGuardSetup } from '@type/types';
import { expect } from 'chai';
import { html, nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('pi-crust.ts', () => {
  let mockHass: HomeAssistant;
  let mockSetup: AdGuardSetup;
  let mockDevice: AdGuardDevice;
  let mockConfig: Config;
  let mockElement: HTMLElement;
  let stateDisplayStub: sinon.SinonStub;
  let showSectionStub: sinon.SinonStub;
  let actionHandlerStub: sinon.SinonStub;
  let handleMultiInstanceClickActionStub: sinon.SinonStub;

  beforeEach(() => {
    // Create mock element
    mockElement = document.createElement('div');

    // Create stub for stateDisplay
    stateDisplayStub = stub(stateDisplayModule, 'stateDisplay');
    stateDisplayStub.returns(html`<div class="mocked-state-display">On</div>`);

    // Create stub for show function
    showSectionStub = stub(showSectionModule, 'show');
    showSectionStub.returns(true); // Default to showing sections

    // Stub action handler functions
    actionHandlerStub = stub(actionHandlerDelegate, 'actionHandler').returns(
      () => {},
    );
    handleMultiInstanceClickActionStub = stub(
      actionHandlerDelegate,
      'handleMultiInstanceClickAction',
    ).returns({ handleEvent: () => {} });

    // Mock HomeAssistant instance
    mockHass = {
      states: {
        'binary_sensor.pi_hole_status': {
          state: 'on',
          entity_id: 'binary_sensor.pi_hole_status',
          attributes: {
            friendly_name: 'Pi-hole Status',
          },
        },
      },
    } as unknown as HomeAssistant;

    // Mock device
    mockDevice = {
      device_id: 'adguard_device',
      protection: {
        entity_id: 'binary_sensor.pi_hole_status',
        state: 'on',
        attributes: { friendly_name: 'Pi-hole Status' },
        translation_key: undefined,
      },
      sensors: [],
      switches: [],
    } as AdGuardDevice;

    // Setup with a single device
    mockSetup = {
      holes: [mockDevice],
    };

    // Default mock config
    mockConfig = {
      device_id: 'adguard_device',
    };
  });

  afterEach(() => {
    // Restore all stubs
    stateDisplayStub.restore();
    showSectionStub.restore();
    actionHandlerStub.restore();
    handleMultiInstanceClickActionStub.restore();
  });

  it('should return nothing when show returns false for header section', async () => {
    // Configure show to return false for header section
    showSectionStub.withArgs(mockConfig, 'header').returns(false);

    // Render the card header
    const result = createCardHeader(
      mockElement,
      mockSetup,
      mockHass,
      mockConfig,
    );

    // Assert that nothing is returned
    expect(result).to.equal(nothing);

    // Verify that stateDisplay was not called
    expect(stateDisplayStub.called).to.be.false;
  });

  it('should render card header with default title and icon', async () => {
    // Ensure show returns true for header section
    showSectionStub.withArgs(mockConfig, 'header').returns(true);

    // Render the card header
    const result = createCardHeader(
      mockElement,
      mockSetup,
      mockHass,
      mockConfig,
    );
    const el = await fixture(result as TemplateResult);

    // Test header exists
    expect(el.tagName.toLowerCase()).to.equal('div');
    expect(el.classList.contains('card-header')).to.be.true;

    // Check default title
    const nameEl = el.querySelector('.name');
    expect(nameEl?.textContent?.trim()).to.equal('AdGuard');

    // Check default icon
    const iconEl = nameEl?.querySelector('ha-icon');
    expect(iconEl).to.exist;
    expect(iconEl?.getAttribute('icon')).to.equal('mdi:shield-check');
  });

  it('should render card header with custom title and icon', async () => {
    // Set custom title and icon in config
    mockConfig.title = 'My Custom Pi-hole';
    mockConfig.icon = 'mdi:custom-icon';

    // Render the card header
    const result = createCardHeader(
      mockElement,
      mockSetup,
      mockHass,
      mockConfig,
    );
    const el = await fixture(result as TemplateResult);

    // Check custom title
    const nameEl = el.querySelector('.name');
    expect(nameEl?.textContent?.trim()).to.equal('My Custom Pi-hole');

    // Check custom icon
    const iconEl = nameEl?.querySelector('ha-icon');
    expect(iconEl).to.exist;
    expect(iconEl?.getAttribute('icon')).to.equal('mdi:custom-icon');
  });

  it('should display green status when Pi-hole is active', async () => {
    // Ensure status is 'on'
    mockSetup.holes[0]!.protection!.state = 'on';

    // Render the card header
    const result = createCardHeader(
      mockElement,
      mockSetup,
      mockHass,
      mockConfig,
    );
    const el = await fixture(result as TemplateResult);

    // Check status color is green
    const statusEl = el.querySelector('div[style*="color"]');
    expect(statusEl?.getAttribute('style')).to.contain(
      'var(--success-color, green)',
    );

    // Check for correct icon
    const iconEl = statusEl?.querySelector('ha-icon');
    expect(iconEl).to.exist;
    expect(iconEl?.getAttribute('icon')).to.equal('mdi:check-circle');
  });

  it('should display red status when Pi-hole is inactive', async () => {
    // Set status to 'off'
    mockSetup.holes[0]!.protection!.state = 'off';

    // Render the card header
    const result = createCardHeader(
      mockElement,
      mockSetup,
      mockHass,
      mockConfig,
    );
    const el = await fixture(result as TemplateResult);

    // Check status color is red
    const statusEl = el.querySelector('div[style*="color"]');
    expect(statusEl?.getAttribute('style')).to.contain(
      'var(--error-color, red)',
    );

    // Check for correct icon
    const iconEl = statusEl?.querySelector('ha-icon');
    expect(iconEl).to.exist;
    expect(iconEl?.getAttribute('icon')).to.equal('mdi:close-circle');
  });

  it('should call stateDisplay with the status entity', async () => {
    // Render the card header
    createCardHeader(mockElement, mockSetup, mockHass, mockConfig);

    // Verify stateDisplay was called with the correct parameters
    expect(
      stateDisplayStub.calledWith(mockHass, mockSetup.holes[0]!.protection),
    ).to.be.true;
  });

  // New tests for multiple Pi-hole setup

  it('should not display hole count when only one Pi-hole is configured', async () => {
    // Setup has only one hole (default setup)
    const result = createCardHeader(
      mockElement,
      mockSetup,
      mockHass,
      mockConfig,
    );
    const el = await fixture(result as TemplateResult);

    // Check that multi-status span doesn't exist
    const multiStatusEl = el.querySelector('.multi-status');
    expect(multiStatusEl).to.be.null;
  });

  it('should display hole count when multiple Pi-holes are configured', async () => {
    // Create a setup with multiple holes
    const secondDevice = {
      ...mockDevice,
      device_id: 'adguard_device_2',
      protection: {
        ...mockDevice.protection,
        entity_id: 'binary_sensor.pi_hole_2_status',
        state: 'on',
      },
    } as AdGuardDevice;

    mockSetup.holes.push(secondDevice);

    const result = createCardHeader(
      mockElement,
      mockSetup,
      mockHass,
      mockConfig,
    );
    const el = await fixture(result as TemplateResult);

    // Check that multi-status span exists and shows correct count
    const multiStatusEl = el.querySelector('.multi-status');
    expect(multiStatusEl).to.exist;
    expect(multiStatusEl?.textContent?.trim()).to.equal('(2/2)');
  });

  it('should show orange warning color when some Pi-holes are active and some are inactive', async () => {
    // Create a setup with one active and one inactive Pi-hole
    const secondDevice = {
      ...mockDevice,
      device_id: 'adguard_device_2',
      protection: {
        ...mockDevice.protection,
        entity_id: 'binary_sensor.pi_hole_2_status',
        state: 'off',
      },
    } as AdGuardDevice;

    mockSetup.holes.push(secondDevice);

    const result = createCardHeader(
      mockElement,
      mockSetup,
      mockHass,
      mockConfig,
    );
    const el = await fixture(result as TemplateResult);

    // Check that status color is orange (warning)
    const statusEl = el.querySelector('div[style*="color"]');
    expect(statusEl?.getAttribute('style')).to.contain(
      'var(--warning-color, orange)',
    );

    // Check that it shows "Partial" text instead of status
    expect(statusEl?.textContent?.trim()).to.include('Partial');
  });

  it('should correctly count active Pi-holes among multiple devices', async () => {
    // Create a setup with multiple Pi-holes in different states
    const secondDevice = {
      ...mockDevice,
      device_id: 'adguard_device_2',
      protection: {
        ...mockDevice.protection,
        entity_id: 'binary_sensor.pi_hole_2_status',
        state: 'off',
      },
    } as AdGuardDevice;

    const thirdDevice = {
      ...mockDevice,
      device_id: 'adguard_device_3',
      protection: {
        ...mockDevice.protection,
        entity_id: 'binary_sensor.pi_hole_3_status',
        state: 'on',
      },
    } as AdGuardDevice;

    mockSetup.holes.push(secondDevice, thirdDevice);

    const result = createCardHeader(
      mockElement,
      mockSetup,
      mockHass,
      mockConfig,
    );
    const el = await fixture(result as TemplateResult);

    // Check that multi-status span shows correct active count
    const multiStatusEl = el.querySelector('.multi-status');
    expect(multiStatusEl).to.exist;
    expect(multiStatusEl?.textContent?.trim()).to.equal('(2/3)');
  });

  it('should handle cases where status is undefined for some Pi-holes', async () => {
    // Create a device with undefined status
    const deviceWithoutStatus = {
      ...mockDevice,
      device_id: 'adguard_device_2',
      protection: undefined,
    };

    mockSetup.holes.push(deviceWithoutStatus);

    const result = createCardHeader(
      mockElement,
      mockSetup,
      mockHass,
      mockConfig,
    );
    const el = await fixture(result as TemplateResult);

    // Should only count devices with defined status
    const multiStatusEl = el.querySelector('.multi-status');
    expect(multiStatusEl).to.exist;
    expect(multiStatusEl?.textContent?.trim()).to.equal('(1/2)');
  });

  describe('status click action functionality', () => {
    beforeEach(() => {
      // Reset stubs before each test
      actionHandlerStub.resetHistory();
      handleMultiInstanceClickActionStub.resetHistory();
      // Reset mockConfig to default state
      mockConfig = {
        device_id: 'adguard_device',
      };
    });

    it('should attach action handlers to status div', async () => {
      // Verify action handlers are called during template creation
      const result = createCardHeader(
        mockElement,
        mockSetup,
        mockHass,
        mockConfig,
      );

      // actionHandler is called when the template is created (during createCardHeader)
      expect(actionHandlerStub.called).to.be.true;
      expect(handleMultiInstanceClickActionStub.called).to.be.true;

      const el = await fixture(result as TemplateResult);

      // Find the status div (has color style and action handler)
      const statusEl = el.querySelector('div[style*="color"]');
      expect(statusEl).to.exist;
    });

    it('should use default toggle action for tap_action when no custom status config', async () => {
      const result = createCardHeader(
        mockElement,
        mockSetup,
        mockHass,
        mockConfig,
      );
      await fixture(result as TemplateResult);

      // Get the last call (should be the only call after reset)
      expect(actionHandlerStub.called).to.be.true;
      const actionConfig = actionHandlerStub.lastCall.args[0];
      expect(actionConfig.tap_action.action).to.equal('toggle');
      expect(actionConfig.hold_action.action).to.equal('more-info');
      expect(actionConfig.double_tap_action.action).to.equal('more-info');
    });

    it('should use custom status configuration when provided', async () => {
      mockConfig.status = {
        tap_action: {
          action: 'navigate',
          navigation_path: '/custom-status-path',
        },
        hold_action: {
          action: 'toggle',
        },
      };

      const result = createCardHeader(
        mockElement,
        mockSetup,
        mockHass,
        mockConfig,
      );
      await fixture(result as TemplateResult);

      // Get the last call (should be the only call after reset)
      expect(actionHandlerStub.called).to.be.true;
      const actionConfig = actionHandlerStub.lastCall.args[0];
      expect(actionConfig.entity).to.equal('binary_sensor.pi_hole_status');
      expect(actionConfig.tap_action.action).to.equal('navigate');
      expect(actionConfig.tap_action.navigation_path).to.equal(
        '/custom-status-path',
      );
      expect(actionConfig.hold_action.action).to.equal('toggle');
    });

    it('should include cursor pointer style on status div', async () => {
      const result = createCardHeader(
        mockElement,
        mockSetup,
        mockHass,
        mockConfig,
      );
      const el = await fixture(result as TemplateResult);

      const statusEl = el.querySelector('div[style*="color"]');
      expect(statusEl?.getAttribute('style')).to.contain('cursor: pointer');
    });

    it('should create action configs for all AdGuard instances', async () => {
      const secondDevice = {
        ...mockDevice,
        device_id: 'adguard_device_2',
        protection: {
          ...mockDevice.protection!,
          entity_id: 'binary_sensor.pi_hole_2_status',
        },
      } as AdGuardDevice;

      mockSetup.holes.push(secondDevice);

      const result = createCardHeader(
        mockElement,
        mockSetup,
        mockHass,
        mockConfig,
      );
      await fixture(result as TemplateResult);

      // Verify handleMultiInstanceClickAction was called with array of configs
      const multiClickArgs = handleMultiInstanceClickActionStub.firstCall.args;
      expect(multiClickArgs[1]).to.be.an('array');
      expect(multiClickArgs[1]).to.have.length(2);
      expect(multiClickArgs[1][0].entity).to.equal(
        'binary_sensor.pi_hole_status',
      );
      expect(multiClickArgs[1][1].entity).to.equal(
        'binary_sensor.pi_hole_2_status',
      );
    });

    it('should fallback to device_id when protection entity is not available', async () => {
      const deviceWithoutProtection = {
        ...mockDevice,
        protection: undefined,
      } as AdGuardDevice;

      mockSetup.holes = [deviceWithoutProtection];

      const result = createCardHeader(
        mockElement,
        mockSetup,
        mockHass,
        mockConfig,
      );
      await fixture(result as TemplateResult);

      const actionConfig = actionHandlerStub.firstCall.args[0];
      expect(actionConfig.entity).to.equal('adguard_device');
    });
  });
});
