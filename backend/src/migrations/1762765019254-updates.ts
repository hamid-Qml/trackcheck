import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates1762765019254 implements MigrationInterface {
    name = 'Updates1762765019254'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feedback_requests" ADD "progress" jsonb DEFAULT '{}'::jsonb`);
        await queryRunner.query(`ALTER TABLE "feedback_requests" DROP COLUMN "error_message"`);
        await queryRunner.query(`ALTER TABLE "feedback_requests" ADD "error_message" text`);
        await queryRunner.query(`ALTER TABLE "feedback_requests" DROP COLUMN "feedback_focus"`);
        await queryRunner.query(`ALTER TABLE "feedback_requests" ADD "feedback_focus" text`);
        await queryRunner.query(`ALTER TABLE "feedback_requests" DROP COLUMN "genre"`);
        await queryRunner.query(`ALTER TABLE "feedback_requests" ADD "genre" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feedback_requests" DROP COLUMN "genre"`);
        await queryRunner.query(`ALTER TABLE "feedback_requests" ADD "genre" character varying`);
        await queryRunner.query(`ALTER TABLE "feedback_requests" DROP COLUMN "feedback_focus"`);
        await queryRunner.query(`ALTER TABLE "feedback_requests" ADD "feedback_focus" character varying`);
        await queryRunner.query(`ALTER TABLE "feedback_requests" DROP COLUMN "error_message"`);
        await queryRunner.query(`ALTER TABLE "feedback_requests" ADD "error_message" character varying`);
        await queryRunner.query(`ALTER TABLE "feedback_requests" DROP COLUMN "progress"`);
    }

}
