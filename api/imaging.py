"""Upload validation shared by every endpoint (docs/ARCHITECTURE.md section 2 and 2b).

JPEG, PNG or WebP, checked from the bytes rather than the header the client sent, at most 10 MB.
Errors are HTTP 400 with a readable "detail", which the web app shows to the user.
"""

from __future__ import annotations

import io

from fastapi import HTTPException, UploadFile
from PIL import Image, ImageOps, UnidentifiedImageError

MAX_BYTES = 10 * 1024 * 1024
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}


async def read_image(file: UploadFile, label: str = "The image") -> Image.Image:
    """Read one upload and return it as an RGB image, or raise HTTP 400.

    `label` names the file in the error message, e.g. "Gallery file 3".
    """
    data = await file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=400, detail=f"{label} is larger than 10 MB.")
    if not data:
        raise HTTPException(status_code=400, detail=f"{label} is empty.")
    try:
        opened = Image.open(io.BytesIO(data))
        if opened.format not in ALLOWED_FORMATS:
            raise HTTPException(status_code=400, detail=f"{label} is not a JPEG, PNG or WebP image.")
        # Phone photos store rotation in EXIF. Apply it so the image is what the user sees.
        return ImageOps.exif_transpose(opened).convert("RGB")
    except (UnidentifiedImageError, OSError):
        raise HTTPException(status_code=400, detail=f"{label} is not a readable image.") from None
