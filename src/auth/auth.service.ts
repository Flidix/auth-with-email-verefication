import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthDto } from './dto/auth.dto';
import { sign } from 'jsonwebtoken';
import { Environment } from 'src/shared/variables/environment';
import { genSalt, hash, compare } from 'bcryptjs';
import { EmailService } from 'src/email/email.service';
import { UserEntity } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly emailService: EmailService,
  ) {}

  async register(dto: AuthDto) {
    const salt = await genSalt(10);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const user = await this.userRepository.save({
      ...dto,
      password: await hash(dto.password, salt),
      verificationCode,
      isVerified: false,
    });

    await this.emailService.sendVerificationEmail(user.email, verificationCode);

    return { message: 'Verification email sent. Please check your inbox.' };
  }

  async login(dto: AuthDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const loginCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = loginCode;
    await this.userRepository.save(user);

    await this.emailService.sendVerificationEmail(dto.email, loginCode);

    return { message: 'Login code sent. Please check your inbox.' };
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.userRepository.findOne({
      where: { email, verificationCode: code },
    });

    if (!user || user.verificationCode !== code) {
      throw new BadRequestException('Invalid verification code.');
    }

    user.isVerified = true;
    user.verificationCode = null;
    await this.userRepository.save(user);

    const token = await this.issueAccessToken(user.id);

    return { user, ...token };
  }
  async issueAccessToken(userId: string) {
    const token = sign({ userId: userId }, Environment.JWT_SECRET, {
      expiresIn: '7d',
    });

    return { token };
  }
}
