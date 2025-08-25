import { Global, Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';

@Global()
@Module({
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
