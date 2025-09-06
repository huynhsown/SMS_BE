import { IsEmail, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class ProfileUpdateDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
