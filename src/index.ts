import { AdGuardCard } from '@cards/card';
import { AdGuardCardEditor } from '@cards/editor';
import { version } from '../package.json';

// Register the custom elements with the browser
customElements.define('adguard-card', AdGuardCard);
customElements.define('adguard-editor', AdGuardCardEditor);

// Ensure the customCards array exists on the window object
window.customCards = window.customCards || [];

// Register the cards with Home Assistant's custom card registry
window.customCards.push({
  // Unique identifier for the card type
  type: 'adguard-card',

  // Display name in the UI
  name: 'AdGuard Card',

  // Card description for the UI
  description: 'A card to summarize and control your AdGuard instance.',

  // Show a preview of the card in the UI
  preview: true,

  // URL for the card's documentation
  documentationURL: 'https://github.com/homeassistant-extras/adguard-card',
});

console.info(`%c🐱 Poat's Tools: adguard-card - ${version}`, 'color: #CFC493;');
