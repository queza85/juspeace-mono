import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches, MinLength } from 'class-validator';

export class TwoFactorVerifyDto {
  @ApiProperty()
  @IsString()
  @MinLength(32)
  challengeToken!: string;

  @ApiProperty({ example: '123456', minLength: 6, maxLength: 6 })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  code!: string;
}

export class TwoFactorResendDto {
  @ApiProperty()
  @IsString()
  @MinLength(32)
  challengeToken!: string;
}

export class TwoFactorDevChallengeDto {
  @ApiProperty({ example: 'admin@juspeace.local' })
  @IsEmail()
  email!: string;
}

export class TwoFactorChallengeResponseDto {
  @ApiProperty()
  challengeToken!: string;
}
