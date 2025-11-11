// src/feedback/feedback.controller.ts
import {
  Body, Controller, Get, Param, ParseUUIDPipe, Post, Headers,
  UseGuards, UseInterceptors, UploadedFiles
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { FeedbackService } from './feedback.service';
import {
  IngestFormDto, IngestFormUploadDto,
  ProgressCallbackDto, FinalCallbackDto,
} from './dto/feedback.dto';
import { CreateFromUploadDto } from './dto/create-from-upload.dto';
import { CurrentUser } from 'src/common/current-user.decorator';

@ApiTags('feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedback: FeedbackService) {}

  // keep ingest for power users / internal tools
  @Post('ingest')
  @UseGuards(AuthGuard('jwt'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: IngestFormUploadDto })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'audio_file', maxCount: 1 },
    { name: 'reference_audio_file', maxCount: 1 },
  ]))
  ingestAndStart(
    @Body() dto: IngestFormDto,
    @UploadedFiles() files: { audio_file?: Express.Multer.File[]; reference_audio_file?: Express.Multer.File[]; },
    @CurrentUser() user: { userId: string },
  ) {
    // optional: verify dto.userId === user.userId if you keep dto.userId
    const main = files?.audio_file?.[0];
    const ref = files?.reference_audio_file?.[0];
    return this.feedback.ingestAndStart(dto, main, ref);
  }

  // STEP 2: create+trigger from upload ids
  @Post('requests')
  @UseGuards(AuthGuard('jwt'))
  createFromUpload(
    @Body() dto: CreateFromUploadDto,
    @CurrentUser() user: { userId: string }
  ) {
    return this.feedback.createFromUploadIdsAndTrigger(user.userId, dto);
  }

  @Get('requests')
  @UseGuards(AuthGuard('jwt'))
  findAllRequests(@CurrentUser() user: { userId: string }) {
    return this.feedback.findAllRequestsForUser(user.userId);
  }

  @Get('requests/:id/status')
  @UseGuards(AuthGuard('jwt'))
  getStatus(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: { userId: string }) {
    return this.feedback.getStatusOwned(id, user.userId);
  }

  // callbacks (no auth guard; protected by header secret)
  @Post('progress/:requestId')
  progressCallback(
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @Body() dto: ProgressCallbackDto,
    @Headers('x-ml-secret') mlSecret?: string,
  ) {
    return this.feedback.handleProgressCallback(requestId, dto, mlSecret);
  }

  @Post('callback/:requestId')
  finalCallback(
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @Body() dto: FinalCallbackDto,
    @Headers('x-ml-secret') mlSecret?: string,
  ) {
    return this.feedback.handleFinalCallback(requestId, dto, mlSecret);
  }
}
