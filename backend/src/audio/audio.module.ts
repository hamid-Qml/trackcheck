import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AudioService } from './audio.service';
import { AudioController } from './audio.controller';
import { AudioUpload } from './entities/audio-upload.entity';
import { AudioFeature } from './entities/audio-feature.entity';
import { User } from 'src/users/entities/user.entity';
@Module({
  imports: [TypeOrmModule.forFeature([AudioUpload, AudioFeature,User])],
  controllers: [AudioController],
  providers: [AudioService],
  exports: [AudioService, TypeOrmModule],
})
export class AudioModule {}
