import { show } from '@common/show-section';
import type { Config } from '@type/config';
import { expect } from 'chai';

describe('section-display.ts', () => {
  describe('show', () => {
    it('should return true when exclude_sections is undefined', () => {
      // Arrange
      const config: Config = {
        device_id: 'test_device',
        // exclude_sections is undefined
      };

      // Act & Assert - test all available section types
      expect(show(config, 'header')).to.be.true;
      expect(show(config, 'statistics')).to.be.true;
      expect(show(config, 'sensors')).to.be.true;
      expect(show(config, 'switches')).to.be.true;
    });

    it('should return true when section is not in exclude_sections', () => {
      // Arrange
      const config: Config = {
        device_id: 'test_device',
        exclude_sections: ['statistics', 'sensors'],
      };

      // Act & Assert
      expect(show(config, 'header')).to.be.true;
      expect(show(config, 'switches')).to.be.true;
    });

    it('should return false when section is in exclude_sections', () => {
      // Arrange
      const config: Config = {
        device_id: 'test_device',
        exclude_sections: ['header', 'statistics'],
      };

      // Act & Assert
      // BUG: This test will fail because the function always checks for 'header'
      // instead of using the provided section parameter
      expect(show(config, 'header')).to.be.false;
      expect(show(config, 'statistics')).to.be.false; // This will fail due to the bug
    });

    it('should handle empty exclude_sections array', () => {
      // Arrange
      const config: Config = {
        device_id: 'test_device',
        exclude_sections: [],
      };

      // Act & Assert
      expect(show(config, 'header')).to.be.true;
      expect(show(config, 'statistics')).to.be.true;
      expect(show(config, 'sensors')).to.be.true;
      expect(show(config, 'switches')).to.be.true;
    });
  });
});
