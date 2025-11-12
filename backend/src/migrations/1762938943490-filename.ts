import { MigrationInterface, QueryRunner } from "typeorm";

export class Filename1762938943490 implements MigrationInterface {
    name = 'Filename1762938943490'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audio_uploads" DROP CONSTRAINT "FK_32cbe7262f8034fce59c884e901"`);
        await queryRunner.query(`ALTER TABLE "audio_uploads" DROP COLUMN "filename"`);
        await queryRunner.query(`ALTER TABLE "audio_uploads" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "audio_uploads" ADD "original_file_name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "audio_uploads" ADD "user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "feedback_requests" ALTER COLUMN "progress" SET DEFAULT '{}'::jsonb`);
        await queryRunner.query(`ALTER TABLE "audio_uploads" ADD CONSTRAINT "FK_7e9a02e661ed04b00274fcecab1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audio_uploads" DROP CONSTRAINT "FK_7e9a02e661ed04b00274fcecab1"`);
        await queryRunner.query(`ALTER TABLE "feedback_requests" ALTER COLUMN "progress" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "audio_uploads" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "audio_uploads" DROP COLUMN "original_file_name"`);
        await queryRunner.query(`ALTER TABLE "audio_uploads" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "audio_uploads" ADD "filename" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "audio_uploads" ADD CONSTRAINT "FK_32cbe7262f8034fce59c884e901" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
