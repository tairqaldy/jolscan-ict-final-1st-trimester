/**
 * Data credits shown in the footer, on About and on the Model page.
 * Edit here once the pothole dataset is confirmed (task D-1/D-2).
 */
export const DATA_CREDITS = {
  pothole: {
    name: "Pothole detection dataset (name, version and link to be confirmed)",
    licence: "Licence to be confirmed from the dataset page before the defense",
    url: null as string | null,
  },
  restroom: {
    name: "IOAI 2025 Individual Contest, “Restroom Icon Matching”",
    licence: "CC-BY-4.0",
    url: "https://github.com/IOAI-official/IOAI-2025/tree/main/Individual-Contest/Restroom",
  },
  map: { name: "Map data © OpenStreetMap contributors", licence: "ODbL" },
} as const;
