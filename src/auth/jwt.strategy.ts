import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
  secretOrKey: process.env.JWT_SECRET || 'secret',
    });
  }

 async validate(payload: any) {
  const user = await this.userService.findById(payload.sub);
  if (!user) {
    throw new UnauthorizedException();
  }
  return { _id: user._id.toString(), username: user.username, email: user.email };
}
}