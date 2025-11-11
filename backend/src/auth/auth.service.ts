// src/auth/auth.service.ts
import { Injectable, ConflictException, UnauthorizedException, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import authConfig from 'src/config/auth.config';
import { type ConfigType } from '@nestjs/config';
import { randomBytes, createHash } from 'crypto';
import { MailerService } from 'src/mailer/mailer.service';
import mailConfig from 'src/config/mail.config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwt: JwtService,
    private mailer: MailerService,
    @Inject(authConfig.KEY) private readonly authCfg: ConfigType<typeof authConfig>,
    @Inject(mailConfig.KEY) private readonly mailCfg: ConfigType<typeof mailConfig>,
  ) {}

  private hashPassword(raw: string) {
    return bcrypt.hash(raw, this.authCfg.bcryptSaltRounds);
  }

  private async validatePassword(raw: string, hash: string) {
    return bcrypt.compare(raw, hash);
  }

  async signup(dto: SignUpDto) {
    const email = dto.email.toLowerCase().trim();
    const exists = await this.usersRepo.findOne({ where: { email } });
    if (exists) throw new ConflictException('Email already registered');

    const password_hash = await this.hashPassword(dto.password);
    const user = this.usersRepo.create({
      email,
      full_name: dto.full_name ?? null,
      password_hash,
    });
    await this.usersRepo.save(user);

    const token = await this.signToken(user);
    return { access_token: token };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await this.validatePassword(dto.password, user.password_hash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = await this.signToken(user);
    return { access_token: token };
  }

  private async signToken(user: User) {
    return this.jwt.signAsync({
      sub: user.id,
      email: user.email,
    });
  }

  async me(user: { userId: string; email: string }) {
    // Optionally fetch full profile
    const u = await this.usersRepo.findOne({ where: { id: user.userId } });
    if (!u) throw new UnauthorizedException();
    const { password_hash, password_reset_token_hash, ...safe } = u as any;
    return safe;
  }

  // Forgot / Reset password
  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) {
      // Do not leak existence
      return { ok: true };
    }
    // Create random token; store only hash
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

    user.password_reset_token_hash = tokenHash;
    user.password_reset_token_expires_at = expires;
    await this.usersRepo.save(user);

    const resetLink = `${this.mailCfg.appBaseUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(
      user.email,
    )}`;

    await this.mailer.sendPasswordResetEmail(user.email, resetLink);
    return { ok: true };
  }

  async resetPassword(dto: ResetPasswordDto, email?: string) {
    // If you pass email via query also, verify it here; or decode from token payload if you encode it.
    if (!email) throw new BadRequestException('Email is required');
    const user = await this.usersRepo.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user || !user.password_reset_token_hash || !user.password_reset_token_expires_at) {
      throw new BadRequestException('Invalid or expired token');
    }
    if (user.password_reset_token_expires_at.getTime() < Date.now()) {
      throw new BadRequestException('Invalid or expired token');
    }
    const providedHash = createHash('sha256').update(dto.token).digest('hex');
    if (providedHash !== user.password_reset_token_hash) {
      throw new BadRequestException('Invalid or expired token');
    }

    user.password_hash = await this.hashPassword(dto.new_password);
    user.password_reset_token_hash = null;
    user.password_reset_token_expires_at = null;
    await this.usersRepo.save(user);

    return { ok: true };
  }
}
