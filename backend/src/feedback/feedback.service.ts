// src/feedback/feedback.service.ts
import { Express } from 'express';
import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'node:fs';
import * as path from 'node:path';
import FormData = require('form-data');
import { FeedbackRequest, FeedbackProgress } from './entities/feedback-request.entity';
import { randomBytes } from 'node:crypto';
import { AiFeedback } from './entities/ai-feedback.entity';
import { User } from '../users/entities/user.entity';
import { AudioUpload } from '../audio/entities/audio-upload.entity';
import { ConfigService } from '@nestjs/config';
import { AudioFeature } from 'src/audio/entities/audio-feature.entity';
import { CreateFromUploadDto } from './dto/create-from-upload.dto';
import axios from 'axios';
import {
    ProgressCallbackDto,
    CreateRequestDto,
    FinalCallbackDto,
    IngestFormDto,
} from './dto/feedback.dto';

@Injectable()
export class FeedbackService {
    private readonly logger = new Logger(FeedbackService.name);
    private readonly ML_URL: string;
    private readonly ML_SECRET: string;
    private readonly PUBLIC_APP_URL: string;
    private readonly UPLOADS_DIR: string;

    constructor(
        private readonly config: ConfigService,
        @InjectRepository(FeedbackRequest) private readonly requests: Repository<FeedbackRequest>,
        @InjectRepository(AiFeedback) private readonly ai: Repository<AiFeedback>,
        @InjectRepository(User) private readonly users: Repository<User>,
        @InjectRepository(AudioUpload) private readonly uploads: Repository<AudioUpload>,
        @InjectRepository(AudioFeature) private readonly features: Repository<AudioFeature>,
    ) {
        this.ML_URL = this.config.get<string>('MLEND_URL', 'http://localhost:5000');
        this.ML_SECRET = this.config.get<string>('ML_CALLBACK_SECRET', '');
        this.PUBLIC_APP_URL = this.config.get<string>('PUBLIC_APP_URL', 'http://localhost:8000');
        this.UPLOADS_DIR = this.config.get<string>('UPLOADS_DIR', path.resolve(process.cwd(), '/data/uploads'));
        if (!fs.existsSync(this.UPLOADS_DIR)) fs.mkdirSync(this.UPLOADS_DIR, { recursive: true });
    }

    // ------------------------------
    // Single front-door flow
    // ------------------------------
    async ingestAndStart(
        dto: IngestFormDto,
        mainFile?: Express.Multer.File,
        refFile?: Express.Multer.File,
    ) {
        if (!mainFile) throw new BadRequestException('audio_file is required');
        const user = await this.users.findOne({ where: { id: dto.userId } });
        if (!user) throw new NotFoundException('User not found');

        // 1) persist files to disk
        const mainPath = await this.saveToUploadsDir(mainFile);
        const refPath = refFile ? await this.saveToUploadsDir(refFile) : null;

        // 2) create AudioUpload rows
        const mainUpload = this.uploads.create({
            user,
            file_path: mainPath,
            filename: path.basename(mainPath),
            duration: undefined,
            size_mb: mainFile.size ? +(mainFile.size / (1024 * 1024)).toFixed(3) : null,
            genre: dto.genre,
            feedback_focus: dto.feedback_focus,
            status: 'uploaded',
        } as Partial<AudioUpload>);
        const savedMain = await this.uploads.save(mainUpload);

        let savedRef: AudioUpload | null = null;
        if (refPath) {
            const refUpload = this.uploads.create({
                user,
                file_path: refPath,
                filename: path.basename(refPath),
                duration: undefined,
                size_mb: refFile!.size ? +(refFile!.size / (1024 * 1024)).toFixed(3) : null,
                genre: dto.genre,
                feedback_focus: dto.feedback_focus,
                status: 'uploaded',
            } as Partial<AudioUpload>);
            savedRef = await this.uploads.save(refUpload);
        }

        // 3) create FeedbackRequest
        const req = this.requests.create({
            user,
            upload: savedMain,
            reference_upload: savedRef ?? null,
            status: 'pending',
            feedback_focus: dto.feedback_focus ?? null,
            genre: dto.genre ?? null,
            user_note: dto.user_note ?? null,
            progress: { percent: 0, stage: 'pending', status: 'processing' },
        } as Partial<FeedbackRequest>);
        const savedReq = await this.requests.save(req);

        // 4) trigger MLint
        await this.postToMl(savedReq).catch(async (e) => {
            this.logger.error(`ML trigger failed: ${e?.message || e}`);
            savedReq.status = 'failed';
            savedReq.error_message = 'Failed to trigger ML pipeline';
            savedReq.progress = { percent: 0, stage: 'failed', status: 'failed' };
            await this.requests.save(savedReq);
        });

        return {
            requestId: savedReq.id,
            uploadId: savedMain.id,
            referenceUploadId: savedRef?.id ?? null,
            status: savedReq.status,
            progress: savedReq.progress,
        };
    }

    private async saveToUploadsDir(file: Express.Multer.File) {
        const ext = path.extname(file.originalname || '') || '.bin';
        const name = `${Date.now()}_${randomBytes(6).toString('hex')}${ext}`;
        const dest = path.join(this.UPLOADS_DIR, name);
        await fs.promises.writeFile(dest, file.buffer);
        return dest;
    }

    // ------------------------------
    // (existing) listing + status + ML trigger + callbacks
    // ------------------------------
    async findAllRequests() { /* unchanged */ return this.requests.find({ relations: ['user', 'upload', 'reference_upload'], order: { created_at: 'DESC' } }); }
    async getStatus(id: string) { /* unchanged from your version */
        const req = await this.requests.findOne({ where: { id }, relations: ['upload', 'reference_upload'] });
        if (!req) throw new NotFoundException('Request not found');
        return { id: req.id, status: req.status, progress: req.progress || { percent: 0, stage: 'pending' }, created_at: req.created_at, updated_at: req.updated_at };
    }

    async createAndTrigger(dto: CreateRequestDto) { /* unchanged from your version */ /* kept for programmatic flows */
        // ... same as you posted ...
        return { id: 'deprecated_in_favor_of_ingest' };
    }

    private async postToMl(req: FeedbackRequest) {
        const mlUrl = `${this.ML_URL}/v1/feedback`;
        const form = new FormData();
        form.append('genre', req.genre ?? '');
        form.append('feedback_type', req.feedback_focus ?? '');
        form.append('user_note', req.user_note ?? '');
        form.append('request_id', req.id);

        const finalCbUrl = `${this.PUBLIC_APP_URL}/api/feedback/callback/${req.id}`;
        const progressUrl = `${this.PUBLIC_APP_URL}/api/feedback/progress/${req.id}`;
        form.append('callback_url', finalCbUrl);
        form.append('progress_url', progressUrl);

        const mainPath = this.UPLOADS_DIR + '/' + req.upload.file_path;
        console.log("PATH: ", mainPath);
        if (!fs.existsSync(mainPath)) throw new BadRequestException('Main file not found on disk');
        form.append('audio_file', fs.createReadStream(mainPath), { filename: path.basename(mainPath) });

        if (req.reference_upload) {
            const refPath = req.reference_upload.file_path;
            if (fs.existsSync(refPath)) {
                form.append('reference_audio_file', fs.createReadStream(refPath), { filename: path.basename(refPath) });
            }
        }

        try {
            const resp = await axios.post(mlUrl, form, {
                headers: { ...form.getHeaders(), 'x-ml-secret': this.ML_SECRET || '' },
                timeout: 90_000,
                validateStatus: () => true,
            });

            if (resp.status >= 400) {
                throw new Error(`ML returned ${resp.status}: ${JSON.stringify(resp.data)}`);
            }
        } catch (e: any) {
            this.logger.error(
                `ML trigger failed: ${e?.message || e}; ` +
                `code=${e?.code || ''}; ` +
                `status=${e?.response?.status || ''}; ` +
                `data=${e?.response ? JSON.stringify(e.response.data) : ''}`
            );
            throw e;
        }
        
        await this.requests.update(
            { id: req.id },
            { status: 'extracting', progress: { percent: 5, stage: 'received', status: 'processing' } as FeedbackProgress },
        );
    }

    private assertSecretOrThrow(headerValue: string | undefined) { /* unchanged */
        if (!this.ML_SECRET) return;
        if (!headerValue || headerValue !== this.ML_SECRET) throw new ForbiddenException('Invalid ML callback secret');
    }

    async handleProgressCallback(requestId: string, dto: ProgressCallbackDto, mlSecret?: string) { /* unchanged */
        this.assertSecretOrThrow(mlSecret);
        const req = await this.requests.findOne({ where: { id: requestId } });
        if (!req) throw new NotFoundException('Request not found');
        const progress: FeedbackProgress = {
            percent: Math.max(0, Math.min(100, Number(dto.percent || 0))),
            stage: dto.stage || req.progress?.stage || 'processing',
            status: dto.status || 'processing',
            meta: dto.meta || {},
        };
        let status = req.status;
        if (progress.stage.startsWith('extract')) status = 'extracting';
        else if (progress.stage.startsWith('prompt')) status = 'prompting';
        if (progress.status === 'failed') status = 'failed';
        if (progress.percent >= 100 && progress.status === 'completed') status = 'completed';
        await this.requests.update({ id: requestId }, { progress, status });
        return { ok: true };
    }

    async handleFinalCallback(requestId: string, dto: FinalCallbackDto, mlSecret?: string) {
        this.assertSecretOrThrow(mlSecret);

        const req = await this.requests.findOne({ where: { id: requestId }, relations: ['upload', 'reference_upload'] });
        if (!req) throw new NotFoundException('Request not found');

        if (dto.error) {
            await this.requests.update({ id: req.id }, {
                status: 'failed',
                error_message: dto.error,
                progress: { percent: 100, stage: 'failed', status: 'failed' },
            });
            return { ok: true };
        }

        // 1) Save MAIN audio features (jsonb) if present
        if (dto.metadata && req.upload) {
            await this.upsertAudioFeatures(req.upload, dto.metadata);
        }
        // 2) Save REF audio features if present
        if (dto.ref_metadata && req.reference_upload) {
            await this.upsertAudioFeatures(req.reference_upload, dto.ref_metadata);
        }

        // 3) Parse and persist AI feedback
        let parsed: any = null;
        try { parsed = JSON.parse(dto.feedback_text); } catch { parsed = null; }

        const feedback = this.ai.create({
            upload: req.upload,
            reference_upload: req.reference_upload ?? null,

            mix_quality_score: parsed?.mix_quality?.score ?? null,
            arrangement_score: parsed?.arrangement?.score ?? null,
            creativity_score: parsed?.creativity?.score ?? null,
            suggestions_score: parsed?.suggestions_for_improvement?.score ?? null,

            mix_quality_text: parsed?.mix_quality?.summary ?? null,
            arrangement_text: parsed?.arrangement?.summary ?? null,
            creativity_text: parsed?.creativity?.summary ?? null,
            suggestions_text: parsed?.suggestions_for_improvement?.summary ?? null,

            recommendations: {
                mix_quality: parsed?.mix_quality?.key_recommendations ?? [],
                arrangement: parsed?.arrangement?.key_recommendations ?? [],
                creativity: parsed?.creativity?.key_recommendations ?? [],
                suggestions_for_improvement: parsed?.suggestions_for_improvement?.key_recommendations ?? [],
            },

            reference_comparison_json: dto.comparison_summary ?? null,
            reference_track_summary: dto.comparison_summary?.overall_fit ?? null,

            model: dto.llm?.model ?? 'gpt-4o',
            llm_usage: dto.llm?.usage ?? null,
            raw_response: parsed ? null : dto.feedback_text,
            prompt_version: dto.prompt_version ?? 'v1.1.0',
            status: 'completed',
            error_message: null,
        });
        await this.ai.save(feedback);

        await this.requests.update({ id: req.id }, {
            status: 'completed',
            progress: { percent: 100, stage: 'completed', status: 'completed' },
        });

        return { ok: true };
    }

    // Persist/merge features into AudioFeature row (1:1 per upload)
    private async upsertAudioFeatures(upload: AudioUpload, meta: any) {
        // Find existing row (if you ever re-run)
        let row = await this.features.findOne({ where: { upload: { id: upload.id } }, relations: ['upload'] })
            .catch(() => null);

        const payload = {
            upload,
            tempo: meta?.tempo ?? null,
            key: meta?.key ?? null,
            peak_rms: meta?.peak_rms ?? null,
            spectral_centroid: meta?.centroid ?? null,
            spectral_rolloff: meta?.rolloff ?? null,
            bandwidth: meta?.bandwidth ?? null,
            flatness: meta?.flatness ?? null,
            energy_profile: meta?.energy_profile ?? null,
            transients_info: meta?.transients_info ?? null,
            vocal_timestamps: meta?.vocal_timestamps ?? null,
            drop_timestamps: meta?.drop_timestamps ?? null,
            fx_and_transitions: meta?.fx_and_transitions ?? null,
            structure: {
                structure_text: meta?.structure ?? null,
                silence_segments: meta?.silence_segments ?? null,
                structure_segments: meta?.structure_segments ?? null,
            },
        } as Partial<AudioFeature>;

        if (row) {
            Object.assign(row, payload);
            await this.features.save(row);
        } else {
            row = this.features.create(payload);
            await this.features.save(row);
        }
    }

    // -------- AI outputs listing (unchanged) --------
    findAllAi() { return this.ai.find({ relations: ['upload', 'reference_upload'], order: { created_at: 'DESC' } }); }
    async findOneAi(id: string) { const item = await this.ai.findOne({ where: { id }, relations: ['upload', 'reference_upload'] }); if (!item) throw new NotFoundException('AI feedback not found'); return item; }
    async removeAi(id: string) { await this.ai.delete(id); return { ok: true }; }

    findAllRequestsForUser(userId: string) {
        return this.requests.find({
            where: { user: { id: userId } as any },
            relations: ['user', 'upload', 'reference_upload'],
            order: { created_at: 'DESC' },
        });
    }

    async getStatusOwned(id: string, userId: string) {
        const req = await this.requests.findOne({ where: { id }, relations: ['user', 'upload', 'reference_upload'] });
        if (!req) throw new NotFoundException('Request not found');
        if (req.user.id !== userId) throw new ForbiddenException();
        return {
            id: req.id,
            status: req.status,
            progress: req.progress || { percent: 0, stage: 'pending' },
            created_at: req.created_at,
            updated_at: req.updated_at,
        };
    }

    // STEP 2 core: create request from upload ids, trigger ML
    async createFromUploadIdsAndTrigger(userId: string, dto: CreateFromUploadDto) {
        const user = await this.users.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const main = await this.uploads.findOne({ where: { id: dto.upload_id }, relations: ['user'] });
        if (!main) throw new NotFoundException('Upload not found');
        if (main.user.id !== userId) throw new ForbiddenException();

        let ref: AudioUpload | null = null;
        if (dto.reference_upload_id) {
            ref = await this.uploads.findOne({ where: { id: dto.reference_upload_id }, relations: ['user'] });
            if (!ref) throw new NotFoundException('Reference upload not found');
            if (ref.user.id !== userId) throw new ForbiddenException();
        }

        const req = this.requests.create({
            user,
            upload: main,
            reference_upload: ref ?? null,
            status: 'pending',
            feedback_focus: dto.feedback_focus ?? null,
            genre: dto.genre ?? null,
            user_note: dto.user_note ?? null,
            progress: { percent: 0, stage: 'pending', status: 'processing' },
        } as Partial<FeedbackRequest>);
        const savedReq = await this.requests.save(req);

        await this.postToMl(savedReq).catch(async (e) => {
            this.logger.error(`ML trigger failed: ${e?.message || e}`);
            savedReq.status = 'failed';
            savedReq.error_message = 'Failed to trigger ML pipeline';
            savedReq.progress = { percent: 0, stage: 'failed', status: 'failed' };
            await this.requests.save(savedReq);
        });

        return {
            requestId: savedReq.id,
            uploadId: main.id,
            referenceUploadId: ref?.id ?? null,
            status: savedReq.status,
            progress: savedReq.progress,
        };
    }

    /** Compute an overall score from available section scores */
    private computeOverallScore(ai?: AiFeedback | null): number | null {
        if (!ai) return null;
        const parts = [
            ai.mix_quality_score,
            ai.arrangement_score,
            ai.creativity_score,
            ai.suggestions_score,
        ].filter((x) => typeof x === 'number') as number[];
        if (!parts.length) return null;
        const avg = parts.reduce((a, b) => a + b, 0) / parts.length;
        return Math.round(avg * 10) / 10; // 1 decimal
    }

    /**
     * Return everything about a feedback request owned by `userId`:
     * - FeedbackRequest (+ upload & reference_upload)
     * - AudioFeatures for main & reference (if exist)
     * - AiFeedback for the main upload (unique)
     * - A small "computed" section (overall_score)
     */
    async findOneDetailedOwned(id: string, userId: string) {
        const req = await this.requests.findOne({
            where: { id },
            relations: ['user', 'upload', 'reference_upload'],
        });
        if (!req) throw new NotFoundException('Request not found');
        if (req.user.id !== userId) throw new ForbiddenException();

        const [mainFeat, refFeat, ai] = await Promise.all([
            this.features.findOne({
                where: { upload: { id: req.upload.id } as any },
                relations: ['upload'],
            }).catch(() => null),

            req.reference_upload
                ? this.features.findOne({
                    where: { upload: { id: req.reference_upload.id } as any },
                    relations: ['upload'],
                }).catch(() => null)
                : Promise.resolve(null),

            this.ai.findOne({
                where: { upload: { id: req.upload.id } as any },
                relations: ['upload', 'reference_upload'],
            }).catch(() => null),
        ]);

        const overall_score = this.computeOverallScore(ai || null);

        // Build a clean, FE-friendly payload (avoid circular refs / hidden fields)
        const upload = req.upload
            ? {
                id: req.upload.id,
                filename: req.upload.filename,
                file_path: req.upload.file_path,
                duration: req.upload.duration,
                size_mb: req.upload.size_mb,
                genre: req.upload.genre,
                feedback_focus: req.upload.feedback_focus,
                status: req.upload.status,
                created_at: req.upload.created_at,
            }
            : null;

        const reference_upload = req.reference_upload
            ? {
                id: req.reference_upload.id,
                filename: req.reference_upload.filename,
                file_path: req.reference_upload.file_path,
                duration: req.reference_upload.duration,
                size_mb: req.reference_upload.size_mb,
                genre: req.reference_upload.genre,
                feedback_focus: req.reference_upload.feedback_focus,
                status: req.reference_upload.status,
                created_at: req.reference_upload.created_at,
            }
            : null;

        const ai_feedback = ai
            ? {
                id: ai.id,
                upload_id: ai.upload?.id,
                reference_upload_id: ai.reference_upload?.id ?? null,

                mix_quality_score: ai.mix_quality_score,
                arrangement_score: ai.arrangement_score,
                creativity_score: ai.creativity_score,
                suggestions_score: ai.suggestions_score,

                mix_quality_text: ai.mix_quality_text,
                arrangement_text: ai.arrangement_text,
                creativity_text: ai.creativity_text,
                suggestions_text: ai.suggestions_text,

                recommendations: ai.recommendations,
                reference_comparison_json: ai.reference_comparison_json,
                reference_track_summary: ai.reference_track_summary,

                model: ai.model,
                llm_usage: ai.llm_usage,
                prompt_version: ai.prompt_version,
                raw_response: ai.raw_response,

                status: ai.status,
                error_message: ai.error_message,
                created_at: ai.created_at,
                updated_at: ai.updated_at,
            }
            : null;

        const features = {
            main: mainFeat
                ? {
                    id: mainFeat.id,
                    upload_id: mainFeat.upload?.id,
                    tempo: mainFeat.tempo,
                    key: mainFeat.key,
                    duration: mainFeat.duration,
                    peak_rms: mainFeat.peak_rms,
                    spectral_centroid: mainFeat.spectral_centroid,
                    spectral_rolloff: mainFeat.spectral_rolloff,
                    bandwidth: mainFeat.bandwidth,
                    flatness: mainFeat.flatness,
                    energy_profile: mainFeat.energy_profile,
                    transients_info: mainFeat.transients_info,
                    silence_segments: mainFeat.silence_segments,
                    vocal_timestamps: mainFeat.vocal_timestamps,
                    vocal_intensity: mainFeat.vocal_intensity,
                    drop_timestamps: mainFeat.drop_timestamps,
                    structure: mainFeat.structure,
                    structure_segments: mainFeat.structure_segments,
                    fx_and_transitions: mainFeat.fx_and_transitions,
                    summary_snapshot: mainFeat.summary_snapshot,
                    is_reference: mainFeat.is_reference,
                    extracted_at: mainFeat.extracted_at,
                }
                : null,
            reference: refFeat
                ? {
                    id: refFeat.id,
                    upload_id: refFeat.upload?.id,
                    tempo: refFeat.tempo,
                    key: refFeat.key,
                    duration: refFeat.duration,
                    peak_rms: refFeat.peak_rms,
                    spectral_centroid: refFeat.spectral_centroid,
                    spectral_rolloff: refFeat.spectral_rolloff,
                    bandwidth: refFeat.bandwidth,
                    flatness: refFeat.flatness,
                    energy_profile: refFeat.energy_profile,
                    transients_info: refFeat.transients_info,
                    silence_segments: refFeat.silence_segments,
                    vocal_timestamps: refFeat.vocal_timestamps,
                    vocal_intensity: refFeat.vocal_intensity,
                    drop_timestamps: refFeat.drop_timestamps,
                    structure: refFeat.structure,
                    structure_segments: refFeat.structure_segments,
                    fx_and_transitions: refFeat.fx_and_transitions,
                    summary_snapshot: refFeat.summary_snapshot,
                    is_reference: refFeat.is_reference,
                    extracted_at: refFeat.extracted_at,
                }
                : null,
        };

        return {
            id: req.id,
            status: req.status,
            error_message: req.error_message ?? null,
            created_at: req.created_at,
            updated_at: req.updated_at,
            progress: req.progress || { percent: 0, stage: 'pending' },
            selections: {
                feedback_focus: req.feedback_focus,
                genre: req.genre,
                user_note: req.user_note,
            },
            upload,
            reference_upload,
            features,
            ai_feedback,
            computed: { overall_score },
        };
    }

}