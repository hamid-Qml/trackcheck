import { Controller, Get, Param, ParseUUIDPipe, Delete, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AudioService } from './audio.service';

class CreateAudioDto {
  userId: string;
  file_path: string;
  filename: string;
  duration?: number;
  size_mb?: number;
  genre?: string;
  feedback_focus?: string;
}

@ApiTags('uploads')
@Controller('audio')
export class AudioController {
  constructor(private readonly audio: AudioService) {}

  @Get('uploads')
  findAllUploads() {
    return this.audio.findAllUploads();
  }

  @Get('uploads/:id')
  findUpload(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.audio.findUpload(id);
  }

  @Post('uploads')
  createUpload(@Body() dto: CreateAudioDto) {
    return this.audio.createUpload(dto);
  }

  @Delete('uploads/:id')
  removeUpload(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.audio.removeUpload(id);
  }

  @Get('features')
  findAllFeatures() {
    return this.audio.findAllFeatures();
  }
}
