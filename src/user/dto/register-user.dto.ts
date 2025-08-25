import { IsEmail, MinLength } from 'class-validator';

export class RegisterUserDto {

    @MinLength(8, { message: 'Username must be at least 8 characters long' })
    username: string;

    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;

    @IsEmail({}, { message: 'Email must be a valid email address' })
    email: string;
}
