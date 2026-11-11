/**
 * Data credits shown in the footer, on About and on the Model page.
 * The pothole entry follows the dataset card in data/README.md (task D-1).
 */
export const DATA_CREDITS = {
  pothole: {
    name: "Annotated Potholes Image Dataset",
    author: "Atikur Rahman Chitholian",
    licence: "Licence as shown on Kaggle: ODbL for the database, DbCL for its contents",
    url: "https://www.kaggle.com/datasets/chitholian/annotated-potholes-dataset",
  },
  restroom: {
    name: "IOAI 2025 Individual Contest, “Restroom Icon Matching”",
    licence: "CC-BY-4.0",
    url: "https://github.com/IOAI-official/IOAI-2025/tree/main/Individual-Contest/Restroom",
  },
  /** The twelve real sample signs (public/samples/restrooms/ioai-v<n>.webp), from the IOAI validation set. */
  restroomSamples: {
    name: "IOAI 2025 Individual Contest, “Restroom Icon Matching”, validation set",
    author: "IOAI 2025 committee",
    licence: "CC-BY-4.0",
    url: "https://github.com/IOAI-official/IOAI-2025/tree/main/Individual-Contest/Restroom",
    changes: "Resized to at most 256 px and saved as WebP, otherwise unchanged",
  },
  map: { name: "Map data © OpenStreetMap contributors", licence: "ODbL" },
} as const;
