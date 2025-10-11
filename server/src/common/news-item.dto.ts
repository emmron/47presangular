export interface NewsItemDto {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  content: string;
  source: string;
  category?: string;
  imageUrl?: string;
}
