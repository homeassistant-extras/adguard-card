import { getDashboardStats } from '@common/get-stats';
import type { Translation } from '@type/locale';
import { expect } from 'chai';

describe('dashboard-stats.ts', () => {
  describe('getDashboardStats', () => {
    it('should return a 2D array with the correct structure and values', () => {
      // Arrange
      const uniqueClientsCount = '42';

      // Act
      const result = getDashboardStats(uniqueClientsCount);

      // Assert
      // Check overall structure
      expect(result).to.be.an('array').with.lengthOf(2);
      expect(result[0]).to.be.an('array').with.lengthOf(2);
      expect(result[1]).to.be.an('array').with.lengthOf(2);

      // Check first row, first stat
      expect(result[0]![0]).to.deep.include({
        sensorKey: 'dns_queries',
        title: 'card.stats.total_queries',
        className: 'queries-box',
        icon: 'mdi:earth',
      });
      expect(result[0]![0]!.footer).to.deep.equal({
        key: 'card.stats.active_clients',
        search: '{number}',
        replace: '42',
      });

      // Check second row, second stat
      expect(result[1]![1]).to.deep.include({
        sensorKey: 'average_processing_speed',
        title: 'card.stats.average_processing_speed',
        footer: 'card.stats.processing_speed_info',
        className: 'domains-box',
        icon: 'mdi:speedometer',
      });
    });

    it('should correctly include the uniqueClientsCount in the footer config', () => {
      // Arrange - Test with different unique client counts
      const testCases = ['0', '5', '123'];

      for (const clientCount of testCases) {
        // Act
        const result = getDashboardStats(clientCount);

        // Assert - Check that the clientCount is correctly included in the footer
        const dnsQueriesConfig = result[0]![0]!;
        expect(dnsQueriesConfig.footer).to.be.an('object');
        expect((dnsQueriesConfig.footer as Translation).key).to.equal(
          'card.stats.active_clients',
        );
        expect(dnsQueriesConfig.footer.search).to.equal('{number}');
        expect(dnsQueriesConfig.footer.replace).to.equal(clientCount);
      }
    });
  });
});
