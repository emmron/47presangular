import { Transform } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class NewsQueryDto {
  @Transform(({ value }) => (value ? parseInt(value, 10) : 1))
  @IsInt()
  @Min(1)
  page = 1;

  @Transform(({ value }) => (value ? parseInt(value, 10) : 20))
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 20;

  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.split(',').map((item) => item.trim()).filter(Boolean)
      : Array.isArray(value)
        ? value
        : []
  )
  @IsArray()
  @IsOptional()
  sources?: string[];

  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.split(',').map((item) => item.trim()).filter(Boolean)
      : Array.isArray(value)
        ? value
        : []
  )
  @IsArray()
  @IsOptional()
  topics?: string[];

  @IsString()
  @IsOptional()
  search?: string;
}
