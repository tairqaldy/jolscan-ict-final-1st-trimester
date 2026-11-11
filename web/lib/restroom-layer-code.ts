/**
 * Code excerpts for "How we changed the layers" on the Restroom overview: the
 * lines that freeze and unfreeze layers in the restroom experiment. Copied
 * verbatim from the Python files; lib/restroom-layer-code.test.ts fails if a
 * file changes and an excerpt no longer matches its lines.
 *
 * There is no Colab notebook for the restroom model: the layer sweep is plain
 * Python (ml/restroom/layers.py), run on a Kaggle T4 GPU by kaggle_run_layers.py.
 */

export const REPO_URL = "https://github.com/tairqaldy/qarau-ict-final-1st-trimester";

export type CodeExcerpt = {
  id: string;
  title: string;
  /** Repository path. */
  file: string;
  /** First and last line, 1-based, inclusive. */
  from: number;
  to: number;
  /** The file is on main, so a GitHub link to these lines works. */
  onMain: boolean;
  note: string;
  code: string;
};

export const LAYER_CODE: CodeExcerpt[] = [
  {
    "id": "clip",
    "title": "CLIP: unfreeze the last N blocks",
    "file": "ml/restroom/common.py",
    "from": 393,
    "to": 407,
    "onMain": true,
    "note": "Every weight is frozen first, then the last N of CLIP's 12 transformer blocks and the final layer norm are trained again. N = 0 is zero-shot CLIP.",
    "code": "def set_trainable(model, unfreeze: int) -> list[str]:\n    \"\"\"Freeze everything, then unfreeze the last N image-encoder blocks and ln_post, as in the\n    reference solution's CLIPReID. The projection matrix stays frozen.\"\"\"\n    for p in model.parameters():\n        p.requires_grad = False\n    blocks = model.visual.transformer.resblocks\n    names = []\n    for i in range(len(blocks) - unfreeze, len(blocks)):\n        for n, p in blocks[i].named_parameters():\n            p.requires_grad = True\n            names.append(f\"visual.transformer.resblocks.{i}.{n}\")\n    for n, p in model.visual.ln_post.named_parameters():\n        p.requires_grad = True\n        names.append(f\"visual.ln_post.{n}\")\n    return names"
  },
  {
    "id": "resnet",
    "title": "ResNet50: the same by stages",
    "file": "ml/restroom/layers.py",
    "from": 107,
    "to": 123,
    "onMain": true,
    "note": "The CNN for comparison: 5 stages (stem, layer1 to layer4), the last N of them trained.",
    "code": "class ResnetBackbone:\n    depth = 5\n\n    def __init__(self, n: int):\n        from torchvision.models import ResNet50_Weights, resnet50\n\n        self.n = n\n        weights = ResNet50_Weights.IMAGENET1K_V2\n        self.model = resnet50(weights=weights).to(C.device()).eval()\n        self.preprocess = weights.transforms()\n        m = self.model\n        self.stages = [torch.nn.Sequential(m.conv1, m.bn1, m.relu, m.maxpool), m.layer1, m.layer2, m.layer3, m.layer4]\n        for p in m.parameters():\n            p.requires_grad = False\n        for st in self.stages[self.depth - n:]:\n            for p in st.parameters():\n                p.requires_grad = True"
  },
  {
    "id": "sweep",
    "title": "The sweep: every N, 3 seeds",
    "file": "ml/restroom/kaggle_run_layers.py",
    "from": 25,
    "to": 28,
    "onMain": true,
    "note": "What ran on the Kaggle T4 GPU (about 1.5 hours). Each setting is trained and tested with 5-fold cross-validation grouped by restroom.",
    "code": "SWEEPS = [\n    [\"--backbone\", \"clip\", \"--n\", \"0\", \"1\", \"2\", \"3\", \"4\", \"6\", \"8\", \"12\", \"--seeds\", \"42\", \"0\", \"1\"],\n    [\"--backbone\", \"resnet\", \"--n\", \"0\", \"1\", \"2\", \"3\", \"4\", \"5\", \"--seeds\", \"42\", \"0\", \"1\"],\n]"
  },
  {
    "id": "loop",
    "title": "One change per run",
    "file": "ml/restroom/layers.py",
    "from": 381,
    "to": 388,
    "onMain": true,
    "note": "layers.py trains one model per seed and N; everything else (loss, learning rate, 50 epochs) stays fixed.",
    "code": "    for seed in args.seeds:\n        for n in args.n:\n            path = out_dir / f\"{args.backbone}-n{n:02d}-s{seed}.json\"\n            if args.skip_existing and path.exists():\n                log(f\"skip {path} (exists)\")\n                continue\n            C.seed_everything(seed)\n            res = run_setting(d, args.backbone, n, seed, cfg, n_folds=2 if args.smoke else 5)"
  },
  {
    "id": "match",
    "title": "The models on Match",
    "file": "ml/restroom/train_layer_models.py",
    "from": 40,
    "to": 49,
    "onMain": false,
    "note": "The per-layer models on the Match page: the same recipe, trained once on all 82 training restrooms, on the laptop CPU.",
    "code": "    for n in NS:\n        dst = OUT / f\"clip_n{n:02d}.npy\"\n        if dst.exists():\n            print(f\"N = {n}: {dst} exists, skipped\", flush=True)\n            continue\n        t0 = time.perf_counter()\n        cfg = C.FinetuneConfig(unfreeze=n, eta_min=1e-6)\n        (model, preprocess, _), _ = C.finetune_pairs(\"ViT-B-32\", pairs, cfg, lambda m: None)\n        emb = C.embed_images(model, preprocess, [C.load_rgb(p) for p in paths])\n        np.save(dst, emb.astype(np.float32))"
  }
];

export const githubLines = (e: CodeExcerpt) => `${REPO_URL}/blob/main/${e.file}#L${e.from}-L${e.to}`;
