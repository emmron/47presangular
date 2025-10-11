import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NewsQueryDto } from './dto/news-query.dto';
import { PaginatedNewsResponseDto } from './dto/news-item.dto';
import { mapNewsItemToDto } from './mappers/news.mapper';
import { NormalizedNewsItem } from './entities/news-item.entity';

@Injectable()
export class NewsService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async getNews(query: NewsQueryDto): Promise<PaginatedNewsResponseDto> {
    const { page, pageSize, sources = [], topics = [], search } = query;
    const where: Prisma.NewsItemWhereInput = {};

    if (sources.length) {
      where.sourceSlug = { in: sources };
    }

    if (topics.length) {
      where.topics = {
        some: {
          topic: {
            slug: { in: topics },
          },
        },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.newsItem.count({ where }),
      this.prisma.newsItem.findMany({
        where,
        include: {
          mediaAssets: true,
          topics: {
            include: {
              topic: true,
            },
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items: items.map(mapNewsItemToDto),
      total,
      page,
      pageSize,
    };
  }

  async storeNormalizedItem(item: NormalizedNewsItem): Promise<void> {
    const media = item.media ?? [];

    await this.prisma.newsItem.upsert({
      where: {
        externalId: item.externalId ?? `${item.sourceSlug}-${item.link}`,
      },
      update: {
        title: item.title,
        summary: item.summary,
        content: item.content,
        link: item.link,
        sourceName: item.sourceName,
        sourceSlug: item.sourceSlug,
        sourceType: item.sourceType,
        sourceUrl: item.sourceUrl,
        author: item.author,
        publishedAt: item.publishedAt,
        mediaAssets: {
          deleteMany: {},
          create: media.map((asset) => ({
            url: asset.url,
            type: asset.type,
            caption: asset.caption,
            width: asset.width,
            height: asset.height,
          })),
        },
        topics: {
          deleteMany: {},
          create: (item.topics ?? []).map((slug) => ({
            topic: {
              connectOrCreate: {
                where: { slug },
                create: {
                  slug,
                  label: slug
                    .split('-')
                    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                    .join(' '),
                },
              },
            },
          })),
        },
      },
      create: {
        externalId: item.externalId ?? `${item.sourceSlug}-${item.link}`,
        title: item.title,
        summary: item.summary,
        content: item.content,
        link: item.link,
        sourceName: item.sourceName,
        sourceSlug: item.sourceSlug,
        sourceType: item.sourceType,
        sourceUrl: item.sourceUrl,
        author: item.author,
        publishedAt: item.publishedAt,
        mediaAssets: {
          create: media.map((asset) => ({
            url: asset.url,
            type: asset.type,
            caption: asset.caption,
            width: asset.width,
            height: asset.height,
          })),
        },
        topics: {
          create: (item.topics ?? []).map((slug) => ({
            topic: {
              connectOrCreate: {
                where: { slug },
                create: {
                  slug,
                  label: slug
                    .split('-')
                    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                    .join(' '),
                },
              },
            },
          })),
        },
      },
    });
  }
}
