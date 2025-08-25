import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
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
      entities: [User],
      migrations: [],
      subscribers: []
    }),
    JwtModule.register({
      global: true,
      secret: 'yb97MhYMBXdi5tq37hF5PT9Xa1DsjHgm',
      signOptions: { expiresIn: '1h' },
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
