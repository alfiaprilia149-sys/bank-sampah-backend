import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

type JwtExpiresIn = NonNullable<JwtModuleOptions['signOptions']>['expiresIn'];

export const jwtConfigFactory = (config: ConfigService): JwtModuleOptions => ({
  secret: config.getOrThrow<string>('JWT_SECRET'),
  signOptions: {
    expiresIn: config.get<string>('JWT_EXPIRES_IN', '7d') as JwtExpiresIn,
  },
});