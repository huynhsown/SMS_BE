import { InjectRedis } from '@nestjs-modules/ioredis';
import { HttpException, Inject, Injectable, Post } from '@nestjs/common';
import Redis from 'ioredis';


@Injectable()
export class OtpService {
    constructor(@InjectRedis() private readonly redisService: Redis) {}

    generateOtp(length = 6): string {
        let otp = '';
        for (let i = 0; i < length; i++) {
            otp += Math.floor(Math.random() * 10).toString();
        }
        return otp;
    }

    async saveOtp(key: string, otp: string, ttl = 300) {
        await this.redisService.set(key, otp, 'EX', ttl);
    }

    async getOtp(key: string): Promise<string | null> {
        return this.redisService.get(key);
    }

    async deleteOtp(key: string) {
        await this.redisService.del(key);
    }

}
