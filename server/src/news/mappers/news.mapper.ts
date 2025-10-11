import { NewsItemDto } from '../dto/news-item.dto';
import { NewsItemWithRelations } from '../entities/news-item.entity';

export const mapNewsItemToDto = (item: NewsItemWithRelations): NewsItemDto => ({
  id: item.id,
  title: item.title,
  summary: item.summary,
  content: item.content,
  link: item.link,
  publishedAt: item.publishedAt,
  source: {
    name: item.sourceName,
    slug: item.sourceSlug,
    type: item.sourceType,
    url: item.sourceUrl ?? undefined,
    author: item.author,
  },
  topics: item.topics.map((topic) => topic.topic.slug),
  mediaAssets: item.mediaAssets.map((asset) => ({
    url: asset.url,
    type: asset.type,
    caption: asset.caption,
    width: asset.width,
    height: asset.height,
  })),
});
