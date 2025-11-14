import { css } from 'lit';
import { collapsibleStyles } from '../../../styles';

/**
 * Static CSS styles for the AdGuard Pause Component
 */
export const pauseStyles = css`
  ${collapsibleStyles}

  /* Pause section styles */
  .pause {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .pause-controls {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .pause-controls ha-select {
    width: 95%;
  }

  .pause-buttons {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  /* Button styles */
  mwc-button {
    margin: 4px;
    cursor: pointer;
    padding: 5px;
    border-radius: 5px;
    border: 1px solid transparent;
    transition:
      transform 0.2s ease,
      filter 0.2s ease,
      box-shadow 0.2s ease;
    will-change: transform, filter;
  }

  mwc-button.primary {
    --mdc-theme-primary: var(--success-color);
  }

  mwc-button.warning {
    --mdc-theme-primary: var(--warning-color);
  }

  mwc-button ha-icon {
    margin-right: 3px;
  }

  /* Pause button hover effects */
  .pause mwc-button:hover,
  .pause mwc-button:focus-visible,
  mwc-button:hover,
  mwc-button:focus-visible {
    transform: translateY(-1px) scale(1.03);
    filter: brightness(1.05);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    border-color: var(--success-color);
  }
`;
