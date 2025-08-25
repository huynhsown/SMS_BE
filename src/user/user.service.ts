import { HttpException, Inject, Injectable, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { OtpService } from 'src/otp/otp.service';


@Injectable()
export class UserService {

  @InjectRepository(User)
  private userRepository: Repository<User>;

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(MailService)
  private mailService: MailService;

  @Inject(OtpService)
  private otpService: OtpService;

  async register(user: RegisterUserDto) {
    const existingUser = await this.userRepository.findOne({ where: { username: user.username } });
    if (existingUser) {
      throw new HttpException('Username already exists', 200);
    }
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = this.userRepository.create({
      username: user.username,
      password: hashedPassword,
      email: user.email,
    });

    const otp = this.otpService.generateOtp();
    await this.otpService.saveOtp(`otp:${newUser.username}`, otp);
    await this.mailService.sendOtpEmail(newUser.email, otp);

    try {
      await this.userRepository.save(newUser);
      return {
        message: 'User registered successfully'
      };
    } catch (error) {
      throw new HttpException('Failed to register user', 500);
    }
  }

}
