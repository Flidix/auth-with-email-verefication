import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Environment } from 'src/shared/variables/environment';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: Environment.NODE_EMAILER_SERVICE,
      auth: {
        user: Environment.NODE_EMAILER_USER,
        pass: Environment.NODE_EMAILER_PASS,
      },
    });
  }

  async sendVerificationEmail(email: string, code: string) {
    const mailOptions = {
      from: Environment.NODE_EMAILER_FROM,
      to: email,
      subject: 'Email Verification',
      text: `Your verification code is: ${code}`,
    };

    return this.transporter.sendMail(mailOptions);
  }
}
