/**
 * https://github.com/home-assistant/frontend/blob/dev/src/data/selector.ts
 */

import type { UiAction } from '../panels/lovelace/components/hui-action-editor';

export type Selector =
  | DeviceSelector
  | EntitySelector
  | IconSelector
  | ObjectSelector
  | SelectSelector
  | StringSelector
  | UiActionSelector;

interface EntitySelectorFilter {
  integration?: string;
  domain?: string | readonly string[];
}

export interface EntitySelector {
  entity: {
    multiple?: boolean;
    include_entities?: string[];
    filter?: EntitySelectorFilter | readonly EntitySelectorFilter[];
  } | null;
}

interface DeviceSelectorFilter {
  integration?: string;
  manufacturer?: string;
  model?: string;
  model_id?: string;
}

export interface DeviceSelector {
  device: {
    filter?: DeviceSelectorFilter | readonly DeviceSelectorFilter[];
    multiple?: boolean;
  } | null;
}

export interface IconSelector {
  icon: {
    placeholder?: string;
    fallbackPath?: string;
  } | null;
}

export interface ObjectSelector {
  object?: {
    label_field?: string;
    description_field?: string;
    translation_key?: string;
    multiple?: boolean;
  } | null;
}

export interface SelectSelector {
  select: {
    multiple?: boolean;
    custom_value?: boolean;
    mode?: 'list' | 'dropdown';
    options: string[] | SelectOption[];
  };
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface StringSelector {
  text: {
    multiline?: boolean;
    type?:
      | 'number'
      | 'text'
      | 'search'
      | 'tel'
      | 'url'
      | 'email'
      | 'password'
      | 'date'
      | 'month'
      | 'week'
      | 'time'
      | 'datetime-local'
      | 'color';
    suffix?: string;
  };
}

export interface UiActionSelector {
  ui_action: {
    actions?: UiAction[];
    default_action?: UiAction;
  } | null;
}
