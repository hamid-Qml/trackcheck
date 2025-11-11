import { MigrationInterface, QueryRunner } from "typeorm";

export class AiFeedback1762763056615 implements MigrationInterface {
    name = 'AiFeedback1762763056615'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ai_feedback" ADD "reference_comparison_json" jsonb`);
        await queryRunner.query(`ALTER TABLE "ai_feedback" ADD "llm_usage" jsonb`);
        await queryRunner.query(`ALTER TABLE "ai_feedback" ADD "status" character varying(20) NOT NULL DEFAULT 'completed'`);
        await queryRunner.query(`ALTER TABLE "ai_feedback" ADD "error_message" text`);
        await queryRunner.query(`ALTER TABLE "ai_feedback" ADD "prompt_version" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "ai_feedback" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "audio_features" ADD "duration" double precision`);
        await queryRunner.query(`ALTER TABLE "audio_features" ADD "silence_segments" jsonb`);
        await queryRunner.query(`ALTER TABLE "audio_features" ADD "vocal_intensity" double precision`);
        await queryRunner.query(`ALTER TABLE "audio_features" ADD "structure_segments" jsonb`);
        await queryRunner.query(`ALTER TABLE "audio_features" ADD "summary_snapshot" jsonb`);
        await queryRunner.query(`ALTER TABLE "audio_features" ADD "is_reference" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "full_name"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "full_name" text`);
        await queryRunner.query(`ALTER TABLE "ai_feedback" DROP COLUMN "model"`);
        await queryRunner.query(`ALTER TABLE "ai_feedback" ADD "model" text NOT NULL DEFAULT 'gpt-4o'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ai_feedback" DROP COLUMN "model"`);
        await queryRunner.query(`ALTER TABLE "ai_feedback" ADD "model" character varying NOT NULL DEFAULT 'gpt-4o'`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "full_name"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "full_name" character varying`);
        await queryRunner.query(`ALTER TABLE "audio_features" DROP COLUMN "is_reference"`);
        await queryRunner.query(`ALTER TABLE "audio_features" DROP COLUMN "summary_snapshot"`);
        await queryRunner.query(`ALTER TABLE "audio_features" DROP COLUMN "structure_segments"`);
        await queryRunner.query(`ALTER TABLE "audio_features" DROP COLUMN "vocal_intensity"`);
        await queryRunner.query(`ALTER TABLE "audio_features" DROP COLUMN "silence_segments"`);
        await queryRunner.query(`ALTER TABLE "audio_features" DROP COLUMN "duration"`);
        await queryRunner.query(`ALTER TABLE "ai_feedback" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "ai_feedback" DROP COLUMN "prompt_version"`);
        await queryRunner.query(`ALTER TABLE "ai_feedback" DROP COLUMN "error_message"`);
        await queryRunner.query(`ALTER TABLE "ai_feedback" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "ai_feedback" DROP COLUMN "llm_usage"`);
        await queryRunner.query(`ALTER TABLE "ai_feedback" DROP COLUMN "reference_comparison_json"`);
    }

}
