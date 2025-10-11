import { Expose, Transform, Type } from 'class-transformer';
import { MediaType, SourceType } from '@prisma/client';

export class NewsSourceDto {
  @Expose()
  name!: string;

  @Expose()
  slug!: string;

  @Expose()
  type!: SourceType;

  @Expose()
  url?: string;

  @Expose()
  author?: string | null;
}

export class MediaAssetDto {
  @Expose()
  url!: string;

  @Expose()
  type!: MediaType;

  @Expose()
  caption?: string | null;

  @Expose()
  width?: number | null;

  @Expose()
  height?: number | null;
}

export class NewsItemDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  summary?: string | null;

  @Expose()
  content?: string | null;

  @Expose()
  link!: string;

  @Expose()
  @Type(() => Date)
  publishedAt!: Date;

  @Expose()
  @Type(() => NewsSourceDto)
  source!: NewsSourceDto;

  @Expose()
  topics: string[] = [];

  @Expose()
  @Type(() => MediaAssetDto)
  mediaAssets: MediaAssetDto[] = [];
}

export class PaginatedNewsResponseDto {
  @Expose()
  @Type(() => NewsItemDto)
  items!: NewsItemDto[];

  @Expose()
  total!: number;

  @Expose()
  page!: number;

  @Expose()
  pageSize!: number;
}
