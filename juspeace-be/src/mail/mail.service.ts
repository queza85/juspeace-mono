import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { buildPasswordResetOtpEmail } from './templates/password-reset-otp';
import { buildTwoFactorOtpEmail } from './templates/two-factor-otp';

export interface SendMailInput {
  to: string;
  subject: string;
  text: string;
  html: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    this.from = this.configService.getOrThrow<string>('mail.from');
    const host = this.configService.getOrThrow<string>('mail.smtp.host');
    const port = this.configService.getOrThrow<number>('mail.smtp.port');
    const user = this.configService.get<string>('mail.smtp.user') ?? '';
    const password = this.configService.get<string>('mail.smtp.password') ?? '';
    const secure = this.configService.getOrThrow<boolean>('mail.smtp.secure');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass: password } : undefined,
    });
  }

  async send(input: SendMailInput): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${this.maskEmail(input.to)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async sendPasswordResetOtp(
    to: string,
    code: string,
    ttlMinutes: number,
  ): Promise<void> {
    const content = buildPasswordResetOtpEmail({ code, ttlMinutes });
    await this.send({
      to,
      subject: content.subject,
      text: content.text,
      html: content.html,
    });
  }

  async sendTwoFactorOtp(
    to: string,
    code: string,
    ttlMinutes: number,
  ): Promise<void> {
    const content = buildTwoFactorOtpEmail({ code, ttlMinutes });
    await this.send({
      to,
      subject: content.subject,
      text: content.text,
      html: content.html,
    });
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) {
      return '***';
    }
    const visible = local.slice(0, 1);
    return `${visible}***@${domain}`;
  }
}
