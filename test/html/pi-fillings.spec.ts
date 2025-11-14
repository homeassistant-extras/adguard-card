import * as getStatsModule from '@common/get-stats';
import * as showSectionModule from '@common/show-section';
import type { HomeAssistant } from '@hass/types';
import * as createStatBoxModule from '@html/components/stat-box';
import { createDashboardStats } from '@html/pi-fillings';
import { fixture } from '@open-wc/testing-helpers';
import type { Config } from '@type/config';
import type { AdGuardDevice } from '@type/types';
import { expect } from 'chai';
import { html, nothing, type TemplateResult } from 'lit';
import { restore, stub } from 'sinon';

describe('pi-fillings.ts', () => {
  let mockElement: HTMLElement;
  let mockHass: HomeAssistant;
  let mockDevice: AdGuardDevice;
  let mockConfig: Config;
  let createStatBoxStub: sinon.SinonStub;
  let showSectionStub: sinon.SinonStub;
  let getStatsStub: sinon.SinonStub;
  let mockDashboardStats: any[][];

  beforeEach(() => {
    // Create mock element
    mockElement = document.createElement('div');

    // Create mock HomeAssistant
    mockHass = {
      language: 'en',
    } as HomeAssistant;

    // Create stub for show function
    showSectionStub = stub(showSectionModule, 'show');
    showSectionStub.returns(true); // Default to showing sections

    // Mock dashboard stats
    mockDashboardStats = [
      [
        {
          sensorKey: 'dns_queries',
          title: 'card.stats.total_queries',
          footer: {
            key: 'card.stats.active_clients',
            search: '{number}',
            replace: '42',
          },
          className: 'queries-box',
          icon: 'mdi:earth',
        },
        {
          sensorKey: 'dns_queries_blocked',
          title: 'card.stats.queries_blocked',
          footer: 'card.stats.list_blocked_queries',
          className: 'blocked-box',
          icon: 'mdi:hand-back-right',
        },
      ],
      [
        {
          sensorKey: 'dns_queries_blocked_ratio',
          title: 'card.stats.percentage_blocked',
          footer: 'card.stats.list_all_queries',
          className: 'percentage-box',
          icon: 'mdi:chart-pie',
        },
        {
          sensorKey: 'average_processing_speed',
          title: 'card.stats.average_processing_speed',
          footer: 'card.stats.processing_speed_info',
          className: 'domains-box',
          icon: 'mdi:speedometer',
        },
      ],
    ];

    // Create stub for getDashboardStats
    getStatsStub = stub(getStatsModule, 'getDashboardStats');
    getStatsStub.returns(mockDashboardStats);

    // Create stub for createStatBox
    createStatBoxStub = stub(createStatBoxModule, 'createStatBox');
    // Configure the stub to return a simple template with identifiable class
    createStatBoxStub.callsFake(
      (element, hass, entity, sectionConfig, statConfig) => {
        return html`<div class="mocked-stat-box ${statConfig.className}">
          <div class="sensor-key">${statConfig.sensorKey}</div>
        </div>`;
      },
    );

    // Mock device with required stats
    mockDevice = {
      device_id: 'adguard_device',
      dns_queries: {
        entity_id: 'sensor.dns_queries',
        state: '12345',
        attributes: {},
        translation_key: 'dns_queries',
      },
      dns_queries_blocked: {
        entity_id: 'sensor.dns_queries_blocked',
        state: '5678',
        attributes: {},
        translation_key: 'dns_queries_blocked',
      },
      dns_queries_blocked_ratio: {
        entity_id: 'sensor.dns_queries_blocked_ratio',
        state: '45.6',
        attributes: {},
        translation_key: 'dns_queries_blocked_ratio',
      },
      average_processing_speed: {
        entity_id: 'sensor.average_processing_speed',
        state: '12.5',
        attributes: {},
        translation_key: 'average_processing_speed',
      },
      dns_unique_clients: {
        entity_id: 'sensor.dns_unique_clients',
        state: '42',
        attributes: {},
        translation_key: 'dns_unique_clients',
      },
    } as AdGuardDevice;

    // Mock config
    mockConfig = {
      device_id: 'adguard_device',
      stats: {
        tap_action: { action: 'more-info' },
      },
    };
  });

  afterEach(() => {
    // Restore all stubs
    restore();
  });

  it('should return nothing when show returns false for statistics section', async () => {
    // Configure show to return false for statistics section
    showSectionStub.withArgs(mockConfig, 'statistics').returns(false);

    // Call createDashboardStats
    const result = createDashboardStats(
      mockElement,
      mockHass,
      mockDevice,
      mockConfig,
    );

    // Assert that nothing is returned
    expect(result).to.equal(nothing);

    // Verify that getStatsStub was not called
    expect(getStatsStub.called).to.be.false;

    // Verify that createStatBox was not called
    expect(createStatBoxStub.called).to.be.false;
  });

  it('should call getDashboardStats with correct unique clients count', async () => {
    // Call createDashboardStats
    createDashboardStats(mockElement, mockHass, mockDevice, mockConfig);

    // Verify getDashboardStats was called with the correct unique clients count
    expect(getStatsStub.calledOnce).to.be.true;
    expect(getStatsStub.firstCall.args[0]).to.equal('42');
  });

  it('should call createStatBox for each stat in the dashboard configuration', async () => {
    // Call createDashboardStats
    const result = createDashboardStats(
      mockElement,
      mockHass,
      mockDevice,
      mockConfig,
    );

    await fixture(result as TemplateResult);

    // Total expected calls = sum of all stats in all groups
    const expectedCalls = mockDashboardStats.reduce(
      (total, group) => total + group.length,
      0,
    );

    // Verify createStatBox was called the expected number of times
    expect(createStatBoxStub.callCount).to.equal(expectedCalls);

    // Verify the arguments for the first call
    const firstStatConfig = mockDashboardStats[0]![0];
    expect(createStatBoxStub.firstCall.args[0]).to.equal(mockElement);
    expect(createStatBoxStub.firstCall.args[1]).to.equal(mockHass);
    expect(createStatBoxStub.firstCall.args[2]).to.equal(
      mockDevice.dns_queries,
    );
    expect(createStatBoxStub.firstCall.args[3]).to.equal(mockConfig.stats);
    expect(createStatBoxStub.firstCall.args[4]).to.deep.equal(firstStatConfig);
  });

  it('should handle missing entities in the device object', async () => {
    // Create a device missing some stats
    const incompleteDevice = {
      ...mockDevice,
      dns_queries_blocked: undefined,
    };

    // Call createDashboardStats
    const result = createDashboardStats(
      mockElement,
      mockHass,
      incompleteDevice,
      mockConfig,
    );

    await fixture(result as TemplateResult);

    // Verify that createStatBox for the missing entity was called with undefined
    const adsBlockedConfig = mockDashboardStats[0]![1];
    const callForAdsBlocked = createStatBoxStub
      .getCalls()
      .find((call) => call.args[4] === adsBlockedConfig);

    expect(callForAdsBlocked).to.exist;
    expect(callForAdsBlocked?.args[2]).to.be.undefined;
  });

  it('should render the dashboard-stats container with correct structure', async () => {
    // Reset createStatBox to use the original implementation for this test
    createStatBoxStub.restore();

    // Stub createStatBox to return a simplified but visible element
    createStatBoxStub = stub(createStatBoxModule, 'createStatBox').callsFake(
      (element, hass, entity, sectionConfig, statConfig) => {
        return html`<div class="test-stat-box ${statConfig.className}">
          ${(statConfig as any).sensorKey}
        </div>`;
      },
    );

    // Call createDashboardStats
    const result = createDashboardStats(
      mockElement,
      mockHass,
      mockDevice,
      mockConfig,
    );

    const el = await fixture(result as TemplateResult);

    // Verify the main container
    expect(el.tagName.toLowerCase()).to.equal('div');
    expect(el.classList.contains('dashboard-stats')).to.be.true;

    // Verify the stat groups structure
    const statGroups = el.querySelectorAll('.stat-group');
    expect(statGroups.length).to.equal(mockDashboardStats.length);

    // Verify each group has the correct number of stat boxes
    mockDashboardStats.forEach((group, i) => {
      const statBoxes = statGroups[i]!.querySelectorAll('.test-stat-box');
      expect(statBoxes.length).to.equal(group.length);
    });
  });
});
