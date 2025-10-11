import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PolicyPosition } from '../models/issue.model';

@Injectable({ providedIn: 'root' })
export class IssuesService {
  private readonly positions: PolicyPosition[] = [
    {
      id: 'economy',
      title: 'America First Economy',
      summary:
        'Cutting taxes for working families, reshoring manufacturing, and unleashing American energy independence.',
      factSheetUrl: 'https://assets.47campaign.com/factsheets/america-first-economy.pdf',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      pillars: [
        'Middle-class tax relief',
        'Energy dominance',
        'Fair trade deals',
      ],
      comparison: [
        {
          opponent: 'Harris Campaign',
          stance: 'Supports new federal energy mandates and green subsidies.',
          contrast: 'Trump plan removes burdensome regulations and accelerates drilling permits within 90 days.',
        },
        {
          opponent: 'Bipartisan Baseline',
          stance: 'Maintains current tax code through 2026.',
          contrast: 'Extends and expands 2017 tax cuts for working families immediately.',
        },
      ],
      shareMessage:
        'Trump\'s America First Economy plan cuts taxes for workers and brings supply chains back home. Read the fact sheet: https://47campaign.com/economy',
    },
    {
      id: 'border',
      title: 'Secure the Border',
      summary:
        'Finish the border wall, reinstate Remain in Mexico, and deploy advanced technology to target cartels.',
      factSheetUrl: 'https://assets.47campaign.com/factsheets/secure-the-border.pdf',
      videoUrl: 'https://www.youtube.com/embed/V-_O7nl0Ii0',
      pillars: [
        'Complete the wall',
        'Hire 5,000 additional Border Patrol agents',
        'Use AI analytics to disrupt trafficking rings',
      ],
      comparison: [
        {
          opponent: 'Harris Campaign',
          stance: 'Supports partial wall deconstruction and family case review board.',
          contrast: 'Trump plan fully reinstates Remain in Mexico and expands rapid removal authority.',
        },
      ],
      shareMessage:
        'Border security is national security. The Trump plan finishes the wall and restores Remain in Mexico. Details: https://47campaign.com/border',
    },
  ];

  getPolicyPositions(): Observable<PolicyPosition[]> {
    return of(this.positions);
  }
}
