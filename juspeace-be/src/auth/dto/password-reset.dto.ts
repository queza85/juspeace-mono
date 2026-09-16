import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches, MinLength } from 'class-validator';

export class ForgotPasswordRequestDto {
  @ApiProperty({ example: 'admin@juspeace.local' })
  @IsEmail()
  email!: string;
}

export class ForgotPasswordVerifyDto {
  @ApiProperty({ example: 'admin@juspeace.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456', minLength: 6, maxLength: 6 })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  code!: string;
}

export class ForgotPasswordResetDto {
  @ApiProperty()
  @IsString()
  @MinLength(32)
  resetToken!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}

export class ForgotPasswordVerifyResponseDto {
  @ApiProperty()
  resetToken!: string;
}
