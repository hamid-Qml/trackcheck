import { MigrationInterface, QueryRunner } from "typeorm";

export class Filename1762941450381 implements MigrationInterface {
    name = 'Filename1762941450381'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feedback_requests" ALTER COLUMN "progress" SET DEFAULT '{}'::jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feedback_requests" ALTER COLUMN "progress" SET DEFAULT '{}'`);
    }

}
