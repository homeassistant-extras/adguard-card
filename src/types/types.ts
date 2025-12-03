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

  /** Total Ads Blocked Today */
  dns_queries_blocked?: EntityInformation;

  /** Status of AdGuard */
  protection?: EntityInformation;

  /** Sensors for the AdGuard */
  sensors: EntityInformation[];

  /** Switches for AdGuard */
  switches: EntityInformation[];
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
