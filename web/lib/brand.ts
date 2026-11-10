/**
 * Brand and module names. THE ONE FILE TO EDIT TO RENAME THE PRODUCT.
 *
 * "Qarau" is a working name (Kazakh қарау, "to inspect"). Every page title,
 * the logo wordmark, the landing copy and the navigation read from here, so a
 * rename is a change to this file only.
 */
export const BRAND = {
  name: "Qarau",
  /** Shown next to the name where the meaning helps (landing eyebrow, About). */
  nativeName: "қарау",
  meaning: "Kazakh for “to inspect”",
  tagline: "Computer vision inspection of public infrastructure from photos, with rules you can read.",
  /** One-line description for metadata and social previews. */
  description:
    "Qarau runs a computer vision model on a photo of public infrastructure, then applies rules you can read: potholes on roads become a repair priority, restroom door signs become a clear, review or confusing verdict. ICT1103 course project at QAIRU.",
  /**
   * Prefix for localStorage keys. Changing it starts every browser with empty
   * history and default rules, so leave it alone when only the name changes.
   */
  storagePrefix: "qarau",
} as const;

export type ModuleId = "roads" | "restrooms";

export type ModuleInfo = {
  id: ModuleId;
  /** Short name used in the module switcher. */
  name: string;
  /** What the module does, e.g. "Pothole detection". */
  task: string;
  /** Plural noun for what it inspects, e.g. "Potholes". */
  subject: string;
  href: string;
  /** One sentence for cards and overview pages. */
  summary: string;
};

export const MODULES: Record<ModuleId, ModuleInfo> = {
  roads: {
    id: "roads",
    name: "Roads",
    task: "Pothole detection",
    subject: "Potholes",
    href: "/app/roads",
    summary: "A YOLO detector finds potholes in a road photo; six rules turn the boxes into a repair priority with a target time.",
  },
  restrooms: {
    id: "restrooms",
    name: "Restrooms",
    task: "Sign matching",
    subject: "Door signs",
    href: "/app/restrooms",
    summary:
      "A CLIP image encoder reads restroom door signs; three rules decide whether a pair of signs is clear, needs review or is confusing.",
  },
};

export const MODULE_IDS: ModuleId[] = ["roads", "restrooms"];

/** localStorage key for a store, e.g. storageKey("settings") -> "qarau:settings". */
export const storageKey = (name: string) => `${BRAND.storagePrefix}:${name}`;
