import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { FeedbackRequest } from './entities/feedback-request.entity';
import { AiFeedback } from './entities/ai-feedback.entity';
import { AudioUpload } from '../audio/entities/audio-upload.entity';
import { User } from 'src/users/entities/user.entity';
import { AudioFeature } from 'src/audio/entities/audio-feature.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FeedbackRequest, AiFeedback, AudioUpload, User, AudioFeature])],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService, TypeOrmModule],
})
export class FeedbackModule { }
