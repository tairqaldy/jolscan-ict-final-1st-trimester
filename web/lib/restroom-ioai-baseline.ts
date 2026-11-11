/**
 * The baseline pipeline that came with the IOAI task: code cells of Restroom.ipynb, copied
 * unchanged (IOAI 2025 committee, CC-BY-4.0). Shown on the IOAI task page. The notebook is in
 * data/raw/ioai-restroom/ (gitignored, ml/restroom/get_data.py); restroom-ioai-baseline.test.ts
 * checks every excerpt against it when the file is there.
 */

export const IOAI_NOTEBOOK = "data/raw/ioai-restroom/Restroom.ipynb";
export const IOAI_NOTEBOOK_URL = "https://github.com/IOAI-official/IOAI-2025/blob/main/Individual-Contest/Restroom/Restroom.ipynb";

export type BaselineExcerpt = {
  id: string;
  title: string;
  /** 0-based index of the code cell in Restroom.ipynb. */
  cell: number;
  note: string;
  code: string;
};

export const IOAI_BASELINE_CODE: BaselineExcerpt[] = [
  {
    id: "load",
    title: "Load CLIP",
    cell: 4,
    note: "The model: CLIP ViT-B/16 with OpenAI's weights, switched to evaluation mode. Nothing is trained.",
    code: `# import clip-vit model
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
%pip install --quiet git+https://github.com/openai/CLIP.git
import clip

model, preprocess = clip.load("ViT-B/16", device=DEVICE)
model.eval()  # zero shot evaluation`,
  },
  {
    id: "embed",
    title: "Embed",
    cell: 5,
    note: "Every image goes through CLIP's image encoder; each embedding is scaled to length 1, so a dot product is the cosine similarity.",
    code: `def infer(img_paths):
    """
    Compute L2‑normalized feature embeddings for a list of image file paths using the CLIP visual encoder.
    """
    # print(len(img_paths))  # for debug
    embeddings = []
    for path in tqdm(img_paths):
        img = Image.open(path)
        x = preprocess(img)
        x = x.type(torch.float16).unsqueeze(0).to(DEVICE)

        with torch.no_grad():
            emb = model.visual.forward(x)

        embeddings.append(emb)

    embeddings = torch.cat(embeddings)
    embeddings = F.normalize(embeddings, p=2, dim=1)

    return embeddings`,
  },
  {
    id: "match",
    title: "Match",
    cell: 6,
    note: "Similarity of every query to every gallery original. The answer is column 1 of the top-11 list: the second most similar original, as a 1-based file number.",
    code: `def match_images(BASE_DATA_DIR, result_path):
    """
    For each query image in BASE_DATA_DIR/query, find its best matching image
    in BASE_DATA_DIR/gallery by computing cosine similarity of CLIP embeddings,
    then save 1‑based match indices to result_path as a .npy file.
    """
    QUERY_DIR = BASE_DATA_DIR / "query"
    NON_QUERY_DIR = BASE_DATA_DIR / "gallery"

    query_image_paths = list(QUERY_DIR.glob("*.png"))
    non_query_image_paths = list(NON_QUERY_DIR.glob("*.png"))

    query_image_paths_str = [str(p) for p in query_image_paths]
    non_query_image_paths_str = [str(p) for p in non_query_image_paths]

    sort_paths_by_number(query_image_paths_str)
    sort_paths_by_number(non_query_image_paths_str)

    # print(query_image_paths_str)  # for debug

    query_embeddings = infer(query_image_paths_str)
    non_query_embeddings = infer(non_query_image_paths_str)
    distances = torch.mm(query_embeddings, non_query_embeddings.t())
    distances = (distances + 1.) / 2.

    topk_dists, topk_idxs = torch.topk(distances, 11, dim=1)  # distances has shape (num_queries, num_non_queries)

    topk_dists, topk_idxs = topk_dists.cpu(), topk_idxs.cpu()

    matches_dists, matches_idxs = topk_dists[:, 1], topk_idxs[:, 1]
    matches_dists = matches_dists.cpu().numpy()
    matches_idxs = matches_idxs.cpu().numpy()

    for i in range(len(matches_idxs)):
        matches_idxs[i]+=1

    # print(matches_idxs)  # for debug
    np.save(result_path, matches_idxs)  # save as .npy file`,
  },
  {
    id: "run",
    title: "Run",
    cell: 7,
    note: "Both sets are matched and saved as the two files the IOAI scoring reads.",
    code: `"""the generated submission should be two .npy files"""
DATA_PATH = Path("Solution/")
OUTPUT_PATH = DATA_PATH / "Scoring"

match_images(DATA_PATH / "validation_set", OUTPUT_PATH / "submission_a.npy")
match_images(DATA_PATH / "test_set", OUTPUT_PATH / "submission_b.npy")`,
  },
];
