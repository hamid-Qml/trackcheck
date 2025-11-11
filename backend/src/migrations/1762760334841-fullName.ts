import { MigrationInterface, QueryRunner } from "typeorm";

export class FullName1762760334841 implements MigrationInterface {
    name = 'FullName1762760334841'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "full_name" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "password_reset_token_hash" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "password_reset_token_expires_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password_hash"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "password_hash" text NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "users_email_unique" ON "users" ("email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."users_email_unique"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password_hash"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "password_hash" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password_reset_token_expires_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password_reset_token_hash"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "full_name"`);
    }

}
