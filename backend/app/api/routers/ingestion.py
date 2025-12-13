from fastapi import APIRouter, UploadFile, File
import csv
from io import StringIO, TextIOWrapper
from ...services.ingestion_service import process_csv
from ...schemas.responses import BatchUploadResponse

router = APIRouter()

@router.post("/upload", response_model=BatchUploadResponse)
async def upload(file: UploadFile = File(...)):
    content = await file.read()
    text = content.decode("utf-8", errors="ignore")
    reader = csv.DictReader(StringIO(text))
    items = process_csv(reader)
    return {"items": items}

