import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1762954240048 implements MigrationInterface {
    name = 'Update1762954240048'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feedback_requests" ALTER COLUMN "progress" SET DEFAULT '{}'::jsonb`);
        await queryRunner.query(`ALTER TABLE "audio_features" DROP COLUMN "peak_rms"`);
        await queryRunner.query(`ALTER TABLE "audio_features" ADD "peak_rms" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audio_features" DROP COLUMN "peak_rms"`);
        await queryRunner.query(`ALTER TABLE "audio_features" ADD "peak_rms" double precision`);
        await queryRunner.query(`ALTER TABLE "feedback_requests" ALTER COLUMN "progress" SET DEFAULT '{}'`);
    }

}
