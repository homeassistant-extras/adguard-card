import type { DashboardStatConfig } from '@type/config';

/**
 * Creates the dashboard stats configuration
 * @param uniqueClientsCount - The number of unique clients
 * @returns The dashboard stats configuration
 */
export const getDashboardStats = (
  uniqueClientsCount: string,
): DashboardStatConfig[][] => [
  [
    {
      sensorKey: 'dns_queries',
      title: 'card.stats.total_queries',
      footer: {
        key: 'card.stats.active_clients',
        search: '{number}',
        replace: uniqueClientsCount,
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
