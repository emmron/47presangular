export interface PollOption {
  id: string;
  label: string;
  votes: number;
  percentage: number;
}

export interface PollQuestion {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  lastUpdated: string;
}

export interface EngagementEventPayload {
  [key: string]: unknown;
}
