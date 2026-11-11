/**
 * G-6: interactive states of the UI primitives, shared by the components and
 * the states grid on /design.
 *
 * A real hover, focus or press comes from the pseudo-class variants in each
 * component (hover:, focus-visible:, active:). /design cannot hold a mouse over
 * twelve controls at once, so each component also exports the same look as
 * plain classes and takes a `forceState` prop. lib/ui-states.test.ts checks that
 * the plain classes and the variant classes stay the same.
 */
export const INTERACTION_STATES = ["default", "hover", "focus", "pressed"] as const;
export type InteractionState = (typeof INTERACTION_STATES)[number];

/**
 * The global :focus-visible ring (globals.css: 2 px solid --focus, 2 px offset),
 * drawn without focus. Only for the states grid.
 */
export const FORCED_FOCUS = "outline-2 outline-offset-2 outline-focus";
