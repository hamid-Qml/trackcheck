import { Controller, Get, Param, ParseUUIDPipe, Delete, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';

class CreateFeedbackRequestDto {
  userId: string;
  uploadId: string;
  referenceUploadId?: string | null;
  feedback_focus?: string;
  genre?: string;
  user_note?: string;
}
class CreateAiFeedbackDto {
  uploadId: string;
  referenceUploadId?: string | null;
  mix_quality_score?: number;
  arrangement_score?: number;
  creativity_score?: number;
  suggestions_score?: number;
  mix_quality_text?: string;
  arrangement_text?: string;
  creativity_text?: string;
  suggestions_text?: string;
  recommendations?: any;
  reference_track_summary?: string | null;
  raw_response?: string | null;
  model?: string;
}

@ApiTags('requests')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedback: FeedbackService) {}

  // Feedback Requests (jobs)
  @Get('requests')
  findAllRequests() {
    return this.feedback.findAllRequests();
  }

  @Post('requests')
  createRequest(@Body() dto: CreateFeedbackRequestDto) {
    return this.feedback.createRequest(dto);
  }

  // AI Feedback (outputs)
  @ApiTags('feedback')
  @Get('ai')
  findAllAi() {
    return this.feedback.findAllAi();
  }

  @Get('ai/:id')
  findOneAi(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.feedback.findOneAi(id);
  }

  @Post('ai')
  createAi(@Body() dto: CreateAiFeedbackDto) {
    return this.feedback.createAi(dto);
  }

  @Delete('ai/:id')
  removeAi(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.feedback.removeAi(id);
  }
}
