export interface Developer {
  id: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  experience: string;
  location: string;
  imageUrl?: string;
  skills?: string[];
  websites?: {
    label: string;
    url: string;
  }[];
  socialLinks?: {
    platform: string;
    url: string;
  }[];
}
