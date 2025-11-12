export interface Game {
  id: string;
  title: string;
  description: string;
  platform: string[];
  steamUrl?: string;
  releaseDate: string;
  genre: string[];
  imageUrl?: string;
  developer: string;
  publisher?: string;
  features?: string[];
}
