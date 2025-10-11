export interface PollingTrend {
  date: string;
  candidate: string;
  support: number;
}

export interface FundraisingTotal {
  source: string;
  amount: number;
  change: number;
}

export interface SentimentBreakdown {
  category: string;
  value: number;
}

export interface ShareOfVoiceSlice {
  outlet: string;
  mentions: number;
}

export interface DashboardSnapshot {
  polling: PollingTrend[];
  fundraising: FundraisingTotal[];
  sentiment: SentimentBreakdown[];
  shareOfVoice: ShareOfVoiceSlice[];
  summary: {
    votersContacted: number;
    doorsKnocked: number;
    volunteerShifts: number;
    adSpend: number;
  };
}
