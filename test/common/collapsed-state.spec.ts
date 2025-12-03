import { isCollapsed } from '@common/collapsed-state';
import type { Config } from '@type/config';
import { expect } from 'chai';

describe('is-collapsed.ts', () => {
  describe('isCollapsed', () => {
    it('should return true when section is in collapsed_sections array', () => {
      // Arrange
      const config: Config = {
        device_id: 'test_device',
        collapsed_sections: ['switches'],
      };

      // Act & Assert
      expect(isCollapsed(config, 'switches')).to.be.true;
    });

    it('should return false when section is not in collapsed_sections array', () => {
      // Arrange
      const config: Config = {
        device_id: 'test_device',
        collapsed_sections: ['switches'],
      };

      // Act & Assert
      expect(isCollapsed(config, 'switches')).to.be.true;
    });

    it('should return false when collapsed_sections is undefined', () => {
      // Arrange
      const config: Config = {
        device_id: 'test_device',
        // collapsed_sections is undefined
      };

      // Act & Assert
      expect(isCollapsed(config, 'switches')).to.be.false;
    });

    it('should return false when collapsed_sections is an empty array', () => {
      // Arrange
      const config: Config = {
        device_id: 'test_device',
        collapsed_sections: [],
      };

      // Act & Assert
      expect(isCollapsed(config, 'switches')).to.be.false;
    });
  });
});
