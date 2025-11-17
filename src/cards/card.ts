import { renderAdGuardCard } from '@/html/bake-pi';
import { getConfigDevice } from '@delegates/utils/get-config-device';
import { getAdGuardSetup } from '@delegates/utils/get-setup';
import { fireEvent } from '@hass/common/dom/fire_event';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import { CSSResult, html, LitElement } from 'lit';
import { state } from 'lit/decorators.js';
import { styles } from '../styles';
import type { AdGuardSetup } from '../types/types';
const equal = require('fast-deep-equal');

/**
 * AdGuard card class
 * @extends {LitElement}
 */
export class AdGuardCard extends LitElement {
  /**
   * Card configuration object
   */
  @state()
  private _config!: Config;

  /**
   * AdGuard setup information
   */
  @state()
  protected _setup!: AdGuardSetup;

  /**
   * Home Assistant instance
   * Not marked as @state as it's handled differently
   */
  private _hass!: HomeAssistant;

  /**
   * Returns the component's styles
   */
  static override get styles(): CSSResult {
    return styles;
  }

  /**
   * Sets up the card configuration
   * @param {Config} config - The card configuration
   */
  setConfig(config: Config) {
    if (!equal(config, this._config)) {
      this._config = config;
    }
  }

  /**
   * Updates the card's state when Home Assistant state changes
   * @param {HomeAssistant} hass - The Home Assistant instance
   */
  set hass(hass: HomeAssistant) {
    this._hass = hass;

    const setup = getAdGuardSetup(hass, this._config);

    if (setup && !equal(setup, this._setup)) {
      this._setup = setup;
    } else {
      // update children who are subscribed
      fireEvent(this, 'hass-update', {
        hass,
      });
    }
  }

  // card configuration
  static getConfigElement() {
    return document.createElement('adguard-editor');
  }

  public static async getStubConfig(hass: HomeAssistant): Promise<Config> {
    const device = await getConfigDevice(hass);

    return {
      device_id: device?.id ?? '',
    };
  }

  override render() {
    if (!this._hass || !this._config) {
      return html`<ha-card>
        <div class="card-content">
          <div class="no-devices">Loading...</div>
        </div>
      </ha-card>`;
    }

    if (!this._setup || !this._setup.holes || this._setup.holes.length === 0) {
      return html`<ha-card>
        <div class="card-content">
          <div class="no-setup">No instances found</div>
        </div>
      </ha-card>`;
    }

    return renderAdGuardCard(this, this._hass, this._setup, this._config);
  }
}
