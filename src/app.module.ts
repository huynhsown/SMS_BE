import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '@nestjs-modules/ioredis';
import { OtpModule } from './otp/otp.module';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { Product } from './product/entities/product.entity';
import { Category } from './category/entities/category.entity';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [
    // 1) Load env first
    ConfigModule.forRoot({ isGlobal: true }),

    // 2) Register JwtModule using process.env.JWT_SECRET
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),

    // 3) Other infra modules
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: 'localhost',
      port: 27017,
      database: 'sms_backend_db',
      username: 'root',
      password: 'password123',
      authSource: 'admin',
      synchronize: true,
      logging: true,
      entities: [User, Product, Category],
      migrations: [],
      subscribers: []
    }),
    RedisModule.forRoot({
      type: 'single',
      url: 'redis://localhost:6379',
    }),

    UserModule,
    CategoryModule,
    ProductModule,
    OtpModule,
    MailModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}