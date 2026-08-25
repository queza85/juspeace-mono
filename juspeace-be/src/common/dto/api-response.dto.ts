import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = unknown> {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({
    example: 'RETRIEVE_SUCCESSFULLY',
    description: 'SCREAMING_SNAKE_CASE status code',
  })
  message!: string;

  @ApiProperty({ nullable: true })
  data!: T;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export function successResponse<T>(message: string, data: T): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}

export function errorResponse<T = null>(
  message: string,
  data: T = null as T,
): ApiResponse<T> {
  return {
    success: false,
    message,
    data,
  };
}
