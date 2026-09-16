import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { ApiMessage } from '../common/decorators/api-message.decorator';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { clearRefreshCookie, setRefreshCookie } from './auth.cookie';
import { AuthService } from './auth.service';
import type { AuthUser } from './auth.repository.interface';
import { UserRole } from './auth.repository.interface';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import {
  AccessTokenResponseDto,
  AuthTokensResponseDto,
  LoginDto,
  RegisterDto,
  UserResponseDto,
} from './dto/auth.dto';
import {
  ForgotPasswordRequestDto,
  ForgotPasswordResetDto,
  ForgotPasswordVerifyDto,
  ForgotPasswordVerifyResponseDto,
} from './dto/password-reset.dto';
import {
  TwoFactorChallengeResponseDto,
  TwoFactorDevChallengeDto,
  TwoFactorResendDto,
  TwoFactorVerifyDto,
} from './dto/two-factor.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PasswordResetService } from './password-reset.service';
import { TwoFactorService } from './two-factor.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly cookieName: string;
  private readonly cookieSecure: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
    private readonly twoFactorService: TwoFactorService,
    private readonly configService: ConfigService,
  ) {
    this.cookieName = this.configService.getOrThrow<string>('auth.cookieName');
    this.cookieSecure =
      this.configService.getOrThrow<boolean>('auth.cookieSecure');
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiMessage('REGISTER_SUCCESSFULLY')
  @ApiOperation({ summary: 'Register a new administrator account' })
  @ApiOkResponse({ type: ApiResponseDto })
  async register(@Body() dto: RegisterDto): Promise<UserResponseDto> {
    return this.authService.register(dto.name, dto.email, dto.password);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 3_600_000 } })
  @ApiMessage('PASSWORD_RESET_REQUESTED')
  @ApiOperation({ summary: 'Request a password reset code by email' })
  @ApiOkResponse({ type: ApiResponseDto })
  async forgotPassword(@Body() dto: ForgotPasswordRequestDto): Promise<null> {
    await this.passwordResetService.requestReset(dto.email);
    return null;
  }

  @Post('forgot-password/resend')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 3_600_000 } })
  @ApiMessage('PASSWORD_RESET_CODE_SENT')
  @ApiOperation({ summary: 'Resend a password reset code' })
  @ApiOkResponse({ type: ApiResponseDto })
  async resendForgotPassword(
    @Body() dto: ForgotPasswordRequestDto,
  ): Promise<null> {
    await this.passwordResetService.resendCode(dto.email);
    return null;
  }

  @Post('forgot-password/verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiMessage('PASSWORD_RESET_CODE_VERIFIED')
  @ApiOperation({ summary: 'Verify a password reset OTP code' })
  @ApiOkResponse({ type: ApiResponseDto })
  async verifyForgotPassword(
    @Body() dto: ForgotPasswordVerifyDto,
  ): Promise<ForgotPasswordVerifyResponseDto> {
    return this.passwordResetService.verifyCode(dto.email, dto.code);
  }

  @Post('forgot-password/reset')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiMessage('PASSWORD_RESET_SUCCESSFULLY')
  @ApiOperation({ summary: 'Set a new password using a verified reset token' })
  @ApiOkResponse({ type: ApiResponseDto })
  async resetForgotPassword(
    @Body() dto: ForgotPasswordResetDto,
  ): Promise<null> {
    await this.passwordResetService.resetPassword(dto.resetToken, dto.password);
    return null;
  }

  @Post('two-factor/challenge/dev')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiMessage('TWO_FACTOR_CODE_SENT')
  @ApiOperation({
    summary:
      'Dev-only: create a 2FA challenge and email OTP (disabled unless TWO_FACTOR_DEV_CHALLENGE=true)',
  })
  @ApiOkResponse({ type: ApiResponseDto })
  async createTwoFactorDevChallenge(
    @Body() dto: TwoFactorDevChallengeDto,
  ): Promise<TwoFactorChallengeResponseDto> {
    return this.twoFactorService.createDevChallenge(dto.email);
  }

  @Post('two-factor/resend')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 3_600_000 } })
  @ApiMessage('TWO_FACTOR_CODE_SENT')
  @ApiOperation({ summary: 'Resend a two-factor authentication OTP' })
  @ApiOkResponse({ type: ApiResponseDto })
  async resendTwoFactor(@Body() dto: TwoFactorResendDto): Promise<null> {
    await this.twoFactorService.resendCode(dto.challengeToken);
    return null;
  }

  @Post('two-factor/verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiMessage('TWO_FACTOR_VERIFIED')
  @ApiOperation({ summary: 'Verify a two-factor OTP and issue a session' })
  @ApiOkResponse({ type: ApiResponseDto })
  async verifyTwoFactor(
    @Body() dto: TwoFactorVerifyDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokensResponseDto> {
    const session = await this.twoFactorService.verifyCode(
      dto.challengeToken,
      dto.code,
      {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      },
    );

    setRefreshCookie(res, session.refreshToken, session.refreshMaxAgeMs, {
      cookieName: this.cookieName,
      cookieSecure: this.cookieSecure,
    });
    return this.authService.toAuthTokensResponse(session);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiMessage('LOGIN_SUCCESSFULLY')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiOkResponse({ type: ApiResponseDto })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokensResponseDto> {
    const session = await this.authService.login(
      dto.email,
      dto.password,
      {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      },
      { rememberMe: dto.rememberMe ?? false },
    );

    setRefreshCookie(res, session.refreshToken, session.refreshMaxAgeMs, {
      cookieName: this.cookieName,
      cookieSecure: this.cookieSecure,
    });
    return this.authService.toAuthTokensResponse(session);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiMessage('REFRESH_SUCCESSFULLY')
  @ApiOperation({
    summary: 'Rotate refresh token and issue a new access token',
  })
  @ApiOkResponse({ type: ApiResponseDto })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccessTokenResponseDto> {
    const rawRefreshToken = this.readRefreshToken(req);
    const session = await this.authService.refresh(rawRefreshToken, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    setRefreshCookie(res, session.refreshToken, session.refreshMaxAgeMs, {
      cookieName: this.cookieName,
      cookieSecure: this.cookieSecure,
    });
    return this.authService.toAccessTokenResponse(session);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiMessage('LOGOUT_SUCCESSFULLY')
  @ApiOperation({ summary: 'Logout current device session' })
  @ApiOkResponse({ type: ApiResponseDto })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<null> {
    await this.authService.logout(this.readRefreshToken(req));
    clearRefreshCookie(res, {
      cookieName: this.cookieName,
      cookieSecure: this.cookieSecure,
    });
    return null;
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiMessage('LOGOUT_ALL_SUCCESSFULLY')
  @ApiOperation({ summary: 'Logout all sessions for the current user' })
  @ApiOkResponse({ type: ApiResponseDto })
  async logoutAll(
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<null> {
    if (!user) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    await this.authService.logoutAll(user.id);
    clearRefreshCookie(res, {
      cookieName: this.cookieName,
      cookieSecure: this.cookieSecure,
    });
    return null;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiMessage('USER_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Get the current authenticated user' })
  @ApiOkResponse({ type: ApiResponseDto })
  me(@CurrentUser() user: AuthUser): Promise<UserResponseDto> {
    if (!user) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    return this.authService.getMe(user.id);
  }

  private readRefreshToken(req: Request): string | undefined {
    const cookies = req.cookies as Record<string, string> | undefined;
    const fromCookie = cookies?.[this.cookieName];
    if (typeof fromCookie === 'string' && fromCookie.length > 0) {
      return fromCookie;
    }

    const body = req.body as { refreshToken?: string } | undefined;
    if (
      typeof body?.refreshToken === 'string' &&
      body.refreshToken.length > 0
    ) {
      return body.refreshToken;
    }

    return undefined;
  }
}

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
  @Get('health')
  @Roles(UserRole.ADMIN)
  @ApiMessage('ADMIN_HEALTH_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Admin-only health stub (RBAC demo)' })
  @ApiOkResponse({ type: ApiResponseDto })
  health(): { status: string } {
    return { status: 'ok' };
  }
}
