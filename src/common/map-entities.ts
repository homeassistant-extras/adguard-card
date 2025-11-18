import type { AdGuardDevice, EntityInformation } from '@type/types';

/**
 * Maps entities to the AdGuard device object based on their translation keys.
 * @param entity - The entity information object
 * @param device - The AdGuard device object
 * @returns True if the entity was mapped, false otherwise
 */
export const mapEntitiesByTranslationKey = (
  entity: EntityInformation,
  device: AdGuardDevice,
) => {
  const keyToPropertyMap = {
    // stat boxes
    dns_queries: 'dns_queries',
    dns_queries_blocked: 'dns_queries_blocked',
    dns_queries_blocked_ratio: 'dns_queries_blocked_ratio',
    average_processing_speed: 'average_processing_speed',
    safe_searches_enforced: 'safe_searches_enforced',

    // not vetted yet
    //dns_unique_clients: 'dns_unique_clients',
    remaining_until_blocking_mode: 'remaining_until_blocking_mode',
    action_refresh_data: 'action_refresh_data',
    latest_data_refresh: 'latest_data_refresh',
    //ftl_info_message_count: 'info_message_count',
    status: 'status',
    action_ftl_purge_diagnosis_messages: 'purge_diagnosis_messages',

    // testing w/ pi-hole
    dns_queries_today: 'dns_queries',
    domains_blocked: 'dns_queries_blocked',
    ads_percentage_blocked_today: 'dns_queries_blocked_ratio',
    ftl_info_message_count: 'average_processing_speed',
    dns_unique_clients: 'safe_searches_enforced',

    // backwards compatibility for HA integration
    // dns_queries: 'dns_queries',
    // ads_blocked: 'dns_queries_blocked',
    // percent_ads_blocked: 'dns_queries_blocked_ratio',
    // ads_percentage_today: 'dns_queries_blocked_ratio',
    // domains_being_blocked: 'domains_blocked',
  };

  const key = entity.translation_key;
  if (key && key in keyToPropertyMap) {
    // @ts-ignore
    device[keyToPropertyMap[key]] = entity;
    return true;
  }
  return false;
};
