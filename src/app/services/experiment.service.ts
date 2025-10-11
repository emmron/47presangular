import { Injectable } from '@angular/core';

export interface ExperimentVariant {
  id: string;
  weight: number;
  copy: string;
}

@Injectable({ providedIn: 'root' })
export class ExperimentService {
  private readonly storageKeyPrefix = 'acp_experiment_';

  assignVariant(experimentId: string, variants: ExperimentVariant[]): ExperimentVariant {
    if (typeof window === 'undefined') {
      return variants[0];
    }

    const stored = localStorage.getItem(this.storageKeyPrefix + experimentId);
    if (stored) {
      return JSON.parse(stored) as ExperimentVariant;
    }

    const totalWeight = variants.reduce((sum, variant) => sum + variant.weight, 0);
    let threshold = Math.random() * totalWeight;

    for (const variant of variants) {
      threshold -= variant.weight;
      if (threshold <= 0) {
        localStorage.setItem(this.storageKeyPrefix + experimentId, JSON.stringify(variant));
        return variant;
      }
    }

    const fallback = variants[0];
    localStorage.setItem(this.storageKeyPrefix + experimentId, JSON.stringify(fallback));
    return fallback;
  }
}
