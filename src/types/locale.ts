/**
 * Translation keys for the application.
 */
export type TranslationKey =
  | 'card.stats.total_queries'
  | 'card.stats.safe_searches'
  | 'card.stats.queries_blocked'
  | 'card.stats.list_blocked_queries'
  | 'card.stats.percentage_blocked'
  | 'card.stats.list_all_queries'
  | 'card.stats.average_processing_speed'
  | 'card.stats.processing_speed_info'
  | 'card.sections.switches'
  | 'card.sections.actions'
  | 'card.units.seconds'
  | 'card.units.second'
  | 'card.units.minutes'
  | 'card.units.minute'
  | 'card.units.hours'
  | 'card.units.hour'
  | 'card.ui.partial'
  | 'editor.space_around'
  | 'editor.space_between'
  | 'editor.actions'
  | 'editor.header'
  | 'editor.statistics'
  | 'editor.sensors'
  | 'editor.switches'
  | 'editor.tap_action'
  | 'editor.hold_action'
  | 'editor.double_tap_action'
  | 'editor.content'
  | 'editor.card_title'
  | 'editor.card_icon'
  | 'editor.layout'
  | 'editor.sections_to_exclude'
  | 'editor.sections_collapsed_by_default'
  | 'editor.style_for_switches'
  | 'editor.entities_to_exclude'
  | 'editor.styles'
  | 'editor.switch_spacing'
  | 'editor.interactions'
  | 'editor.badge'
  | 'editor.information'
  | 'editor.controls'
  | 'editor.adguard_device'
  | 'editor.entity_display_order'
  | 'editor.flex_default';

export interface Translation {
  /** The translation key */
  key: TranslationKey;

  /** The translation string */
  search: string;

  /** The string to replace the search string with */
  replace: string;
}
