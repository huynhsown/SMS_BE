import { Controller, Post, Body, UseGuards, Get, Request} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProfileResponseDto } from './dto/profile-response.dto';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  
  @Post('register')
  async register(@Body() user: RegisterUserDto) {
    return this.userService.register(user);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotDto: ForgotPasswordDto) {
    return this.userService.forgotPassword(forgotDto);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyDto: VerifyOtpDto) {
    return this.userService.verifyOtp(verifyDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetDto: ResetPasswordDto) {
    return this.userService.resetPassword(resetDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any): Promise<ProfileResponseDto> {
    return this.userService.findById(req.user._id);
  }
}
