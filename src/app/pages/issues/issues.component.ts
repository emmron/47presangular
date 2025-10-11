import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface IssueSection {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
}

@Component({
  selector: 'app-issues',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.scss']
})
export class IssuesComponent {
  readonly sections: IssueSection[] = [
    {
      id: 'economy',
      title: 'Economy first agenda',
      summary: 'Tax relief for working families, energy dominance, and small business expansion.',
      bullets: [
        'Pledge to extend middle-class tax cuts and expand opportunity zones.',
        'Reinvest in American energy with new drilling permits and refining capacity.',
        'Launch apprenticeship partnerships with community colleges.'
      ]
    },
    {
      id: 'security',
      title: 'Border & national security',
      summary: 'Finish the wall, restore remain-in-Mexico, and boost law enforcement resources.',
      bullets: [
        'Deploy additional border agents and accelerate asylum processing reforms.',
        'Block fentanyl trafficking with new technology at ports of entry.',
        'Back the blue with federal support for local task forces.'
      ]
    },
    {
      id: 'healthcare',
      title: 'Healthcare & social supports',
      summary: 'Lower costs, protect seniors, and expand rural care access.',
      bullets: [
        'Drive price transparency across hospitals and insurers.',
        'Expand telehealth waivers for rural clinics and veteran care.',
        'Protect Medicare and Social Security with fiscal discipline.'
      ]
    },
    {
      id: 'elections',
      title: 'Election integrity',
      summary: 'Secure ballots, clean voter rolls, and restore confidence in elections.',
      bullets: [
        'Advance voter ID standards with state partners.',
        'Invest in poll watcher training and legal rapid response teams.',
        'Modernize election systems with paper backups and audits.'
      ]
    },
    {
      id: 'grassroots',
      title: 'Grassroots spotlights',
      summary: 'Stories from volunteers building the movement at the local level.',
      bullets: [
        'Faith coalition in Georgia registering new voters weekly.',
        'Small business owners hosting roundtables on regulatory reform.',
        'College chapters leading campus debate nights.'
      ]
    },
    {
      id: 'media',
      title: 'Media statements',
      summary: 'Official campaign messaging and fact checks in response to breaking news.',
      bullets: [
        'Weekly talking points for surrogate interviews.',
        'Shareable graphics for social platforms.',
        'Rapid rebuttal briefs for newsroom outreach.'
      ]
    }
  ];
}
