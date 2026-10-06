import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class UploadImageFieldsDto {
  @ApiProperty({ enum: ['image'] })
  @IsIn(['image'])
  type!: 'image';
}

export class GetStoredFileQueryDto {
  @ApiProperty({ example: 'images/00000000-0000-4000-8000-000000000000.png' })
  @IsString()
  fileName!: string;
}
