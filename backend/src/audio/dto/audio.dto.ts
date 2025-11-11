// src/audio/dto/audio.dto.ts
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateUploadResponseDto {
  id: string;
  filename: string;
  file_path: string;
  size_mb?: number | null;
  status: string; // uploaded | processed | failed
  created_at: Date;
}

export class UpdateUploadDto {
  @IsOptional() @IsNumber() @Min(0)
  duration?: number;

  @IsOptional() @IsString()
  genre?: string;

  @IsOptional() @IsString()
  feedback_focus?: string;
}
