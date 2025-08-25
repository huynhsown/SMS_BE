import { MinLength } from 'class-validator';

export class ResetPasswordDto {
  @MinLength(1, { message: 'Reset token is required' })
  resetToken: string;

  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  newPassword: string;
}
