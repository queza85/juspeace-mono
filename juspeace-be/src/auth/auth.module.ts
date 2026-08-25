import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AdminController, AuthController } from './auth.controller';
import { AUTH_REPOSITORY } from './auth.repository.interface';
import { PrismaAuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('auth.jwtAccessSecret'),
        signOptions: {
          expiresIn: configService.getOrThrow<string>(
            'auth.jwtAccessTtl',
          ) as `${number}${'s' | 'm' | 'h' | 'd'}`,
          algorithm: 'HS256',
        },
      }),
    }),
  ],
  controllers: [AuthController, AdminController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: AUTH_REPOSITORY,
      useClass: PrismaAuthRepository,
    },
  ],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
