// src/feedback/dto/create-from-upload.dto.ts
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateFromUploadDto {
  @IsUUID()
  upload_id: string;

  @IsOptional() @IsUUID()
  reference_upload_id?: string;

  @IsOptional() @IsString()
  genre?: string;

  @IsOptional() @IsString()
  feedback_focus?: string;

  @IsOptional() @IsString()
  user_note?: string;
}
