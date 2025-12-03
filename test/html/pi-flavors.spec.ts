import * as collapsedStateModule from '@common/collapsed-state';
import * as showSectionModule from '@common/show-section';
import type { HomeAssistant } from '@hass/types';
import * as stateContentModule from '@html/components/state-content';
import { createCardActions } from '@html/pi-flavors';
import { fixture } from '@open-wc/testing-helpers';
import type { Config } from '@type/config';
import type {
  AdGuardDevice,
  AdGuardSetup,
  EntityInformation,
} from '@type/types';
import { expect } from 'chai';
import { html, type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('pi-flavors.ts', () => {
  let mockHass: HomeAssistant;
  let mockSetup: AdGuardSetup;
  let mockDevice: AdGuardDevice;
  let mockElement: HTMLElement;
  let mockConfig: Config;
  let stateContentStub: sinon.SinonStub;
  let showSectionStub: sinon.SinonStub;
  let isCollapsedStub: sinon.SinonStub;

  beforeEach(() => {
    // Create mock element and hass
    mockElement = document.createElement('div');
    mockHass = {} as HomeAssistant;
    mockSetup = {} as AdGuardSetup;

    // Create stub for show function
    showSectionStub = stub(showSectionModule, 'show');
    showSectionStub.returns(true); // Default to showing sections

    // Create stub for isCollapsed function
    isCollapsedStub = stub(collapsedStateModule, 'isCollapsed');
    isCollapsedStub.returns(false); // Default to not collapsed

    // Create stubs for helper functions
    stateContentStub = stub(stateContentModule, 'stateContent');
    stateContentStub.returns(
      html`<div class="mocked-state">Mocked State</div>`,
    );

    // Mock device with switches and controls
    const mockSwitch1: EntityInformation = {
      entity_id: 'switch.pi_hole',
      state: 'on',
      attributes: {},
      translation_key: undefined,
    };

    const mockSwitch2: EntityInformation = {
      entity_id: 'switch.pi_hole_group',
      state: 'off',
      attributes: {},
      translation_key: undefined,
    };

    mockDevice = {
      device_id: 'adguard_device',
      switches: [mockSwitch1, mockSwitch2],
    } as AdGuardDevice;

    // Mock config
    mockConfig = {
      device_id: 'adguard_device',
    };
  });

  afterEach(() => {
    stateContentStub.restore();
    showSectionStub.restore();
    isCollapsedStub.restore();
  });

  it('should render switches div', async () => {
    // Ensure show returns true for switches section
    showSectionStub.withArgs(mockConfig, 'switches').returns(true);

    const result = createCardActions(
      mockElement,
      mockHass,
      mockSetup,
      mockDevice,
      mockConfig,
    );
    const el = await fixture(result as TemplateResult);

    // Check container structure
    const switchesDiv = el.querySelector('.switches');

    expect(switchesDiv).to.exist;
  });

  it('should add the hidden class to switches section when it is collapsed', async () => {
    // Configure isCollapsed to return true for switches
    isCollapsedStub.withArgs(mockConfig, 'switches').returns(true);

    const result = createCardActions(
      mockElement,
      mockHass,
      mockSetup,
      mockDevice,
      mockConfig,
    );
    const el = await fixture(result as TemplateResult);

    // Check that switches div has the hidden class
    const switchesDiv = el.querySelector('.switches');
    expect(switchesDiv).to.exist;
    expect(switchesDiv!.classList.contains('hidden')).to.be.true;
  });

  it('should call stateContent for each switch entity', async () => {
    createCardActions(mockElement, mockHass, mockSetup, mockDevice, mockConfig);

    // Verify that stateContent was called for each switch
    expect(stateContentStub.callCount).to.equal(2);
    expect(stateContentStub.firstCall.args[0]).to.equal(mockHass);
    expect(stateContentStub.firstCall.args[1]).to.equal(mockDevice.switches[0]);
    expect(stateContentStub.secondCall.args[0]).to.equal(mockHass);
    expect(stateContentStub.secondCall.args[1]).to.equal(
      mockDevice.switches[1],
    );
  });


  it('should handle empty arrays gracefully', async () => {
    // Create a device with empty switches array
    const emptyDevice = {
      device_id: 'adguard_device',
      switches: [],
    } as any as AdGuardDevice;

    const result = createCardActions(
      mockElement,
      mockHass,
      mockSetup,
      emptyDevice,
      mockConfig,
    );
    const el = await fixture(result as TemplateResult);

    // Should still render containers but with no content
    const switchesDiv = el.querySelector('.switches');

    expect(switchesDiv).to.exist;

    // Should not call the helper functions
    expect(stateContentStub.callCount).to.equal(0);
  });

});
