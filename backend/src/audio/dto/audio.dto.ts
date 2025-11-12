// src/audio/dto/audio.dto.ts
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateUploadResponseDto {
  id: string;
  original_file_name: string;
  file_path: string;
  size_mb?: number | null;
  status: string; // uploaded | processed | failed
  created_at: Date;
}