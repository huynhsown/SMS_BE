import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: this.configService.get<string>('MAIL_USERNAME'),
            pass: this.configService.get<string>('MAIL_PASSWORD'),
        },
        });
    }

    async sendOtpEmail(to: string, otp: string) {
        await this.transporter.sendMail({
        from: '"MyApp" <your_email@gmail.com>',
        to,
        subject: 'Your OTP Code',
        text: `Your OTP is: ${otp}`,
    });
  }
}
