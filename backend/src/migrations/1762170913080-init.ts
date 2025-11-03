import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1762170913080 implements MigrationInterface {
    name = 'Init1762170913080'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tier" character varying NOT NULL DEFAULT 'free_trial', "start_date" TIMESTAMP NOT NULL DEFAULT now(), "end_date" TIMESTAMP, "userId" uuid, CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "audio_uploads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "file_path" character varying NOT NULL, "filename" character varying NOT NULL, "duration" double precision, "size_mb" double precision, "genre" character varying, "feedback_focus" character varying, "status" character varying NOT NULL DEFAULT 'uploaded', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_af09cbbccb19035bf334b0a397e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "feedback_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying NOT NULL DEFAULT 'pending', "error_message" character varying, "feedback_focus" character varying, "genre" character varying, "user_note" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "upload_id" uuid, "reference_upload_id" uuid, CONSTRAINT "PK_4fceb8b13258b93add53a14d967" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ai_feedback" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "mix_quality_score" integer, "arrangement_score" integer, "creativity_score" integer, "suggestions_score" integer, "mix_quality_text" text, "arrangement_text" text, "creativity_text" text, "suggestions_text" text, "recommendations" jsonb, "reference_track_summary" text, "raw_response" text, "model" character varying NOT NULL DEFAULT 'gpt-4o', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "upload_id" uuid, "reference_upload_id" uuid, CONSTRAINT "UQ_dcd717e205a3f71e649dab79a92" UNIQUE ("upload_id"), CONSTRAINT "REL_dcd717e205a3f71e649dab79a9" UNIQUE ("upload_id"), CONSTRAINT "PK_aa34b6654c98bf014129c13c1b0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "audio_features" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tempo" double precision, "key" character varying, "peak_rms" double precision, "spectral_centroid" double precision, "spectral_rolloff" double precision, "bandwidth" double precision, "flatness" double precision, "energy_profile" jsonb, "transients_info" jsonb, "vocal_timestamps" jsonb, "drop_timestamps" jsonb, "fx_and_transitions" jsonb, "structure" jsonb, "extracted_at" TIMESTAMP NOT NULL DEFAULT now(), "uploadId" uuid, CONSTRAINT "REL_1179263e7dc2c6aa3b45bfb92c" UNIQUE ("uploadId"), CONSTRAINT "PK_5cea7a1dd2255ca0c8c43c8056c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audio_uploads" ADD CONSTRAINT "FK_32cbe7262f8034fce59c884e901" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feedback_requests" ADD CONSTRAINT "FK_556fec0e98b276d5adfae30ffd0" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feedback_requests" ADD CONSTRAINT "FK_2ea9aedbfca76e8d794d219dd73" FOREIGN KEY ("upload_id") REFERENCES "audio_uploads"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feedback_requests" ADD CONSTRAINT "FK_753b7ee1a357ffaab7aad0185a6" FOREIGN KEY ("reference_upload_id") REFERENCES "audio_uploads"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ai_feedback" ADD CONSTRAINT "FK_dcd717e205a3f71e649dab79a92" FOREIGN KEY ("upload_id") REFERENCES "audio_uploads"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ai_feedback" ADD CONSTRAINT "FK_da02989f18cfc4be921fdc66be2" FOREIGN KEY ("reference_upload_id") REFERENCES "audio_uploads"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audio_features" ADD CONSTRAINT "FK_1179263e7dc2c6aa3b45bfb92c7" FOREIGN KEY ("uploadId") REFERENCES "audio_uploads"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audio_features" DROP CONSTRAINT "FK_1179263e7dc2c6aa3b45bfb92c7"`);
        await queryRunner.query(`ALTER TABLE "ai_feedback" DROP CONSTRAINT "FK_da02989f18cfc4be921fdc66be2"`);
        await queryRunner.query(`ALTER TABLE "ai_feedback" DROP CONSTRAINT "FK_dcd717e205a3f71e649dab79a92"`);
        await queryRunner.query(`ALTER TABLE "feedback_requests" DROP CONSTRAINT "FK_753b7ee1a357ffaab7aad0185a6"`);
        await queryRunner.query(`ALTER TABLE "feedback_requests" DROP CONSTRAINT "FK_2ea9aedbfca76e8d794d219dd73"`);
        await queryRunner.query(`ALTER TABLE "feedback_requests" DROP CONSTRAINT "FK_556fec0e98b276d5adfae30ffd0"`);
        await queryRunner.query(`ALTER TABLE "audio_uploads" DROP CONSTRAINT "FK_32cbe7262f8034fce59c884e901"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84"`);
        await queryRunner.query(`DROP TABLE "audio_features"`);
        await queryRunner.query(`DROP TABLE "ai_feedback"`);
        await queryRunner.query(`DROP TABLE "feedback_requests"`);
        await queryRunner.query(`DROP TABLE "audio_uploads"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "subscriptions"`);
    }

}
