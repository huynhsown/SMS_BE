import { IsEmail, MinLength } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @MinLength(6, { message: 'OTP must be 6 digits' })
  otp: string;
}