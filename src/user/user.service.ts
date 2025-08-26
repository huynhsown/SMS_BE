import { HttpException, Inject, Injectable, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
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

  async forgotPassword(forgotDto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({ where: { email: forgotDto.email } });
    if (!user) throw new HttpException('User with this email does not exist', 404);

    const otp = this.otpService.generateOtp();
    await this.otpService.saveOtp(`otp:${user.email}`, otp);
    await this.mailService.sendOtpEmail(user.email, otp);

    return { message: 'OTP has been sent to your email' };
  }

  async verifyOtp(verifyDto: VerifyOtpDto) {
      const isValid = await this.otpService.verifyOtp(verifyDto.email, verifyDto.otp);
      if (!isValid) throw new HttpException('Invalid or expired OTP', 400);
      
      const resetToken = this.jwtService.sign(
      { sub: verifyDto.email },       
      { secret: 'resetsecretkey_112244', expiresIn: '5m' } 
      );

      await this.otpService.deleteOtp(verifyDto.email);

      return {
        message: 'OTP verified successfully', resetToken
      };
  }

  async resetPassword(resetDto: ResetPasswordDto) {
    const { resetToken, newPassword } = resetDto;

    let payload: any;
    try {
      payload = this.jwtService.verify(resetToken, { secret: 'resetsecretkey_112244' });
    } catch (err) {
      throw new HttpException('Invalid or expired reset token', 400);
    }

    const user = await this.userRepository.findOne({ where: { email: payload.sub } });
    if (!user) throw new HttpException('User not found', 404);

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    return { message: 'Password has been reset successfully' };
  }

}
