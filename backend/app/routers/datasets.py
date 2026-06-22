import shutil
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter(tags=["datasets"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "data"
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/datasets/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    dest = UPLOAD_DIR / file.filename
    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    return {"filename": file.filename, "path": str(dest), "size": dest.stat().st_size}


@router.get("/datasets")
async def list_datasets():
    files = sorted(UPLOAD_DIR.glob("*.csv"))
    return [
        {"filename": f.name, "size": f.stat().st_size}
        for f in files
    ]
