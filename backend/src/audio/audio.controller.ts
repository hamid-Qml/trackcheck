// src/audio/audio.controller.ts
import {
  Controller, Get, Param, ParseUUIDPipe, Delete, Post, Patch, Body,
  UseGuards, UseInterceptors, UploadedFile
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { AudioService } from './audio.service';
import { CurrentUser } from 'src/common/current-user.decorator';

@ApiTags('uploads')
@Controller('audio')
@UseGuards(AuthGuard('jwt'))
export class AudioController {
  constructor(private readonly audio: AudioService) {}

  @Get('uploads')
  findAllUploads(@CurrentUser() user: { userId: string }) {
    return this.audio.findAllUploads(user.userId);
  }

  @Get('uploads/:id')
  findUpload(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: { userId: string }) {
    return this.audio.findUploadOwned(id, user.userId);
  }

  // STEP 1: upload the audio file only -> returns upload_id
  @Post('uploads')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('audio_file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        audio_file: { type: 'string', format: 'binary' },
      },
      required: ['audio_file'],
    },
  })
  async createUpload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { userId: string }
  ) {
    return this.audio.createUploadFromFile(user.userId, file);
  }

  // Optional: patch metadata (duration/genre/focus) later if needed
  @Patch('uploads/:id')
  updateUpload(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { userId: string }
  ) {
    return this.audio.updateUploadOwned(id, user.userId);
  }

  @Delete('uploads/:id')
  removeUpload(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: { userId: string }) {
    return this.audio.removeUploadOwned(id, user.userId);
  }

  @Get('features')
  findAllFeatures(@CurrentUser() user: { userId: string }) {
    return this.audio.findAllFeatures(user.userId);
  }
}
