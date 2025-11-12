import { MigrationInterface, QueryRunner } from "typeorm";

export class Audio1762938352426 implements MigrationInterface {
    name = 'Audio1762938352426'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audio_uploads" DROP COLUMN "duration"`);
        await queryRunner.query(`ALTER TABLE "audio_uploads" DROP COLUMN "genre"`);
        await queryRunner.query(`ALTER TABLE "audio_uploads" DROP COLUMN "feedback_focus"`);
        await queryRunner.query(`ALTER TABLE "feedback_requests" ALTER COLUMN "progress" SET DEFAULT '{}'::jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feedback_requests" ALTER COLUMN "progress" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "audio_uploads" ADD "feedback_focus" character varying`);
        await queryRunner.query(`ALTER TABLE "audio_uploads" ADD "genre" character varying`);
        await queryRunner.query(`ALTER TABLE "audio_uploads" ADD "duration" double precision`);
    }

}
