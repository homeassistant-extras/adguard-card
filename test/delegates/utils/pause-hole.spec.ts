import { formatSecondsToHHMMSS } from '@common/convert-time';
import { handlePauseClick } from '@delegates/utils/pause-hole';
import type { HomeAssistant } from '@hass/types';
import type { AdGuardSetup } from '@type/types';
import { expect } from 'chai';
import { stub } from 'sinon';

describe('handle-pause-click.ts', () => {
  let mockHass: HomeAssistant;
  let mockSetup: AdGuardSetup;
  let callServiceStub: sinon.SinonStub;
  let formatTimeStub: sinon.SinonStub;

  beforeEach(() => {
    // Create mock HomeAssistant object with a callService stub
    callServiceStub = stub();
    mockHass = {
      callService: callServiceStub,
    } as unknown as HomeAssistant;

    // Create a mock device
    mockSetup = {
      holes: [
        {
          device_id: 'adguard_device_1',
        },
      ],
    } as AdGuardSetup;

    // Create a stub for formatSecondsToHHMMSS
    formatTimeStub = stub();
    (formatSecondsToHHMMSS as unknown) = formatTimeStub;
  });

  afterEach(() => {
    // Restore stubs after each test
    callServiceStub.reset();
    formatTimeStub.reset();
  });

  it('should call service immediately when invoked', () => {
    // Arrange
    const duration = 60;
    const formattedTime = '00:01:00';
    formatTimeStub.withArgs(duration).returns(formattedTime);

    // Act
    handlePauseClick(mockHass, mockSetup, duration);

    // Assert
    expect(formatTimeStub.calledOnceWith(duration)).to.be.true;
    expect(callServiceStub.calledOnce).to.be.true;
    expect(callServiceStub.firstCall.args[0]).to.equal('adguard');
    expect(callServiceStub.firstCall.args[1]).to.equal('disable');
    expect(callServiceStub.firstCall.args[2]).to.deep.equal({
      device_id: 'adguard_device_1',
      duration: formattedTime,
    });
  });

  it('should call callService with correct parameters when invoked', () => {
    // Arrange
    const duration = 300; // 5 minutes
    const formattedTime = '00:05:00';
    formatTimeStub.withArgs(duration).returns(formattedTime);

    // Act
    handlePauseClick(mockHass, mockSetup, duration);

    // Assert
    expect(formatTimeStub.calledOnceWith(duration)).to.be.true;
    expect(callServiceStub.calledOnce).to.be.true;
    expect(callServiceStub.firstCall.args[0]).to.equal('adguard');
    expect(callServiceStub.firstCall.args[1]).to.equal('disable');
    expect(callServiceStub.firstCall.args[2]).to.deep.equal({
      device_id: 'adguard_device_1',
      duration: formattedTime,
    });
  });

  it('should format seconds correctly for different durations', () => {
    // Arrange
    const testCases = [
      { seconds: 60, formatted: '00:01:00' },
      { seconds: 300, formatted: '00:05:00' },
      { seconds: 3600, formatted: '01:00:00' },
    ];

    testCases.forEach(({ seconds, formatted }) => {
      // Reset stubs for each test case
      callServiceStub.reset();
      formatTimeStub.reset();

      // Setup formatTimeStub to return the expected formatted time
      formatTimeStub.withArgs(seconds).returns(formatted);

      // Act
      handlePauseClick(mockHass, mockSetup, seconds);

      // Assert
      expect(formatTimeStub.calledOnceWith(seconds)).to.be.true;
      expect(callServiceStub.calledOnce).to.be.true;
      expect(callServiceStub.firstCall.args[2].duration).to.equal(formatted);
    });
  });

  it('should call service with entity-based parameters when entityId is provided', () => {
    // Arrange
    const duration = 300; // 5 minutes
    const formattedTime = '00:05:00';
    const entityId = 'switch.pi_hole_switch';
    formatTimeStub.withArgs(duration).returns(formattedTime);

    // Act
    handlePauseClick(mockHass, mockSetup, duration, entityId);

    // Assert
    expect(formatTimeStub.calledOnceWith(duration)).to.be.true;
    expect(callServiceStub.calledOnce).to.be.true;
    expect(callServiceStub.firstCall.args[0]).to.equal('adguard');
    expect(callServiceStub.firstCall.args[1]).to.equal('disable');
    expect(callServiceStub.firstCall.args[2]).to.deep.equal({
      duration: formattedTime,
      entity_id: [entityId],
    });
  });
});
