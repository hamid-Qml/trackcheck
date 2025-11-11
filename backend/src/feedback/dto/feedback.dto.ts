import {
  ApiProperty,
  IntersectionType,
  PickType,
} from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Shared base for request-like DTOs
 */
export class BaseFeedbackDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  genre?: string | null;

  @ApiProperty({ required: false, description: 'e.g. "mix", "arrangement", etc.' })
  @IsOptional()
  @IsString()
  feedback_focus?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  user_note?: string | null;
}

/**
 * Ingest (form) fields that accompany the files
 */
export class IngestFormDto extends PickType(BaseFeedbackDto, [
  'userId',
  'genre',
  'feedback_focus',
  'user_note',
] as const) {}

/**
 * File fields for multipart/form-data
 */
export class UploadFilesDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  audio_file: any;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  reference_audio_file?: any;
}

/**
 * Combined schema so Swagger renders both form fields + files
 */
export class IngestFormUploadDto extends IntersectionType(
  IngestFormDto,
  UploadFilesDto,
) {}

/**
 * Extra fields only used by the programmatic create endpoint
 * (must be a top-level class so decorators are valid)
 */
export class CreateRequestExtraDto {
  @ApiProperty()
  @IsString()
  uploadId: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  referenceUploadId?: string | null;
}

/**
 * Programmatic create request (kept for non-multipart flows)
 */
export class CreateRequestDto extends IntersectionType(
  BaseFeedbackDto,
  CreateRequestExtraDto,
) {}

/**
 * Callback: progress
 */
export class ProgressCallbackDto {
  @ApiProperty()
  @IsNumber()
  percent: number;

  @ApiProperty()
  @IsString()
  stage: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;
}

/**
 * Nested DTOs for the final callback (to get good Swagger schemas)
 */
export class FinalQueryDto {
  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  genre?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  feedback_type?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  user_note?: string | null;
}

export class FinalLlmDto {
  @ApiProperty()
  @IsString()
  model: string;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  usage?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  // number validation is optional here due to possible string inputs
  // add @IsNumber() with transform if you want strict number parsing
  cost?: number;
}

/**
 * Callback: final result
 */
export class FinalCallbackDto {
  @ApiProperty()
  @IsString()
  session_id: string;

  @ApiProperty()
  @IsString()
  request_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  upload_id?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  reference_upload_id?: string | null;

  @ApiProperty({ description: 'JSON (preferred) or text' })
  @IsString()
  feedback_text: string;

  @ApiProperty({ type: Object })
  @IsObject()
  metadata: any;

  @ApiProperty({ required: false, type: Object, nullable: true })
  @IsOptional()
  @IsObject()
  ref_metadata?: any | null;

  @ApiProperty({ required: false, type: Object, nullable: true })
  @IsOptional()
  @IsObject()
  comparison_summary?: any | null;

  @ApiProperty({ type: () => FinalQueryDto })
  @ValidateNested()
  @Type(() => FinalQueryDto)
  query: FinalQueryDto;

  @ApiProperty({ type: () => FinalLlmDto })
  @ValidateNested()
  @Type(() => FinalLlmDto)
  llm: FinalLlmDto;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  error?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  prompt_version?: string | null;
}
