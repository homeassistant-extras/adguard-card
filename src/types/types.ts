export interface AdGuardSetup {
  /** Some people like to watch ads burn */
  holes: AdGuardDevice[];
}

export interface AdGuardDevice {
  /** Unique identifier for the device */
  device_id: string;

  /** Total DNS Queries */
  dns_queries?: EntityInformation;

  /** Average Processing Speed */
  average_processing_speed?: EntityInformation;

  /** Percentage of Ads Blocked Today */
  dns_queries_blocked_ratio?: EntityInformation;

  /** Safe Searches Enforced */
  safe_searches_enforced?: EntityInformation;

  // not vetted yet
  /** Total Ads Blocked Today */
  dns_queries_blocked?: EntityInformation;

  /** Total Unique Clients Queried */
  dns_unique_clients?: EntityInformation;

  /** Remaining Time Until Blocking Mode */
  remaining_until_blocking_mode?: EntityInformation;

  /** Button to Refresh data */
  action_refresh_data?: EntityInformation;

  /** Last Data Refresh Time */
  latest_data_refresh?: EntityInformation;

  /** Info message count entity */
  info_message_count?: EntityInformation;

  /** Button to Purge Diagnosis Messages */
  purge_diagnosis_messages?: EntityInformation;

  /** Status of AdGuard */
  status?: EntityInformation;

  /** Sensors for the AdGuard */
  sensors: EntityInformation[];

  /** Switches for AdGuard */
  switches: EntityInformation[];

  /** Control entities for the device */
  controls: EntityInformation[];

  /** Update entities for the device */
  updates: EntityInformation[];
}

export interface EntityInformation extends EntityState {
  /** Translation key */
  translation_key: string | undefined;
}

export interface EntityState {
  /** ID of the entity this state belongs to */
  entity_id: string;

  /** Current state value as a string (e.g., "on", "off", "25.5") */
  state: string;

  /** Additional attributes associated with the state */
  attributes: Record<string, any>;
}
