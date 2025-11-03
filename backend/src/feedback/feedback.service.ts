import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeedbackRequest } from './entities/feedback-request.entity';
import { AiFeedback } from './entities/ai-feedback.entity';
import { User } from '../users/entities/user.entity';
import { AudioUpload } from '../audio/entities/audio-upload.entity';

@Injectable()
export class FeedbackService {
    constructor(
        @InjectRepository(FeedbackRequest) private readonly requests: Repository<FeedbackRequest>,
        @InjectRepository(AiFeedback) private readonly ai: Repository<AiFeedback>,
        @InjectRepository(User) private readonly users: Repository<User>,
        @InjectRepository(AudioUpload) private readonly uploads: Repository<AudioUpload>,
    ) { }

    // Requests
    findAllRequests() {
        return this.requests.find({ relations: ['user', 'upload', 'reference_upload'] });
    }

    // src/feedback/feedback.service.ts
    async createRequest(dto: {
        userId: string;
        uploadId: string;
        referenceUploadId?: string | null;
        feedback_focus?: string;
        genre?: string;
        user_note?: string;
    }) {
        const user = await this.users.findOne({ where: { id: dto.userId } });
        if (!user) throw new NotFoundException('User not found');

        const upload = await this.uploads.findOne({ where: { id: dto.uploadId } });
        if (!upload) throw new NotFoundException('Upload not found');

        const ref = dto.referenceUploadId
            ? await this.uploads.findOne({ where: { id: dto.referenceUploadId } })
            : null;

        // Create with scalar fields only
        const req = this.requests.create({
            status: 'pending',
            feedback_focus: dto.feedback_focus ?? null,
            genre: dto.genre ?? null,
            user_note: dto.user_note ?? null,
        } as Partial<FeedbackRequest>);

        // Assign relations explicitly
        req.user = user;
        req.upload = upload;
        req.reference_upload = ref ?? null;

        return this.requests.save(req);
    }

    // AI outputs
    findAllAi() {
        return this.ai.find({ relations: ['upload', 'reference_upload'] });
    }

    async findOneAi(id: string) {
        const item = await this.ai.findOne({ where: { id }, relations: ['upload', 'reference_upload'] });
        if (!item) throw new NotFoundException('AI feedback not found');
        return item;
    }

    async createAi(dto: {
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
    }) {
        const upload = await this.uploads.findOne({ where: { id: dto.uploadId } });
        if (!upload) throw new NotFoundException('Upload not found');

        const ref = dto.referenceUploadId
            ? await this.uploads.findOne({ where: { id: dto.referenceUploadId } })
            : null;

        const feedback = this.ai.create({
            upload,
            reference_upload: ref ?? null,
            mix_quality_score: dto.mix_quality_score ?? null,
            arrangement_score: dto.arrangement_score ?? null,
            creativity_score: dto.creativity_score ?? null,
            suggestions_score: dto.suggestions_score ?? null,
            mix_quality_text: dto.mix_quality_text ?? null,
            arrangement_text: dto.arrangement_text ?? null,
            creativity_text: dto.creativity_text ?? null,
            suggestions_text: dto.suggestions_text ?? null,
            recommendations: dto.recommendations ?? null,
            reference_track_summary: dto.reference_track_summary ?? null,
            raw_response: dto.raw_response ?? null,
            model: dto.model ?? 'gpt-4o',
        });
        return this.ai.save(feedback);
    }

    async removeAi(id: string) {
        await this.ai.delete(id);
        return { ok: true };
    }
}
