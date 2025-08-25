import { HttpException, Inject, Injectable, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class UserService {

  @InjectRepository(User)
  private userRepository: Repository<User>;

  @Inject(JwtService)
  private jwtService: JwtService;

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
