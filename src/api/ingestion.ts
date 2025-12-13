import type { BatchUploadResponse } from "../types/api";
import { apiUpload } from "./client";

export function uploadCSV(file: File): Promise<BatchUploadResponse> {
  const fd = new FormData();
  fd.append("file", file, file.name);
  return apiUpload<BatchUploadResponse>("/ingestion/upload", fd);
}

