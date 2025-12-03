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
    protection: 'protection',

    // testing w/ pi-hole
    dns_queries_today: 'dns_queries',
    domains_blocked: 'dns_queries_blocked',
    ads_percentage_blocked_today: 'dns_queries_blocked_ratio',
    ftl_info_message_count: 'average_processing_speed',
    dns_unique_clients: 'safe_searches_enforced',
    status: 'protection',
  };

  const key = entity.translation_key;
  if (key && key in keyToPropertyMap) {
    // @ts-ignore
    device[keyToPropertyMap[key]] = entity;
    return true;
  }
  return false;
};
