export interface PolicyPosition {
  id: string;
  title: string;
  summary: string;
  factSheetUrl: string;
  videoUrl?: string;
  pillars: string[];
  comparison: Array<{
    opponent: string;
    stance: string;
    contrast: string;
  }>;
  shareMessage: string;
}
