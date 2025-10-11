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
      id: 'mens-australia',
      title: "Men's national team",
      summary: 'Test, ODI, and T20 squads juggling a packed summer and overseas tours.',
      bullets: [
        'Usman Khawaja leads the Test top order with selectors weighing Marsh Cup form for the final batting spot.',
        'Pat Cummins managing workloads with rotation plans for the India and New Zealand series.',
        'White-ball squad refreshing middle-order options ahead of the 2025 Champions Trophy.'
      ]
    },
    {
      id: 'womens-australia',
      title: "Women’s national team",
      summary: 'The Southern Stars balance a dominant home schedule with global franchise commitments.',
      bullets: [
        'Meg Lanning mentoring emerging leaders while Alyssa Healy returns from injury.',
        'Spin depth led by Ash Gardner and Alana King with WBBL form dictating selections.',
        'Expanded tour of India creating chances for WNCL standouts to debut.'
      ]
    },
    {
      id: 'big-bash',
      title: 'Big Bash League spotlight',
      summary: 'BBL|14 and WBBL|10 innovate with power surge tactics and local wildcard rules.',
      bullets: [
        'Draft retentions lock in international stars while clubs chase emerging quicks.',
        'Clubs investing in member experiences with revamped live sites and digital hubs.',
        'New finals format ensures double-headers for both BBL and WBBL weekends.'
      ]
    },
    {
      id: 'sheffield-shield',
      title: 'Sheffield Shield & Marsh Cup',
      summary: 'Red-ball form lines continue to shape national selection narratives.',
      bullets: [
        'Queensland and Victoria pace stocks dominate the wickets tally through four rounds.',
        'WA blooding young batters after back-to-back titles keeps pressure on incumbents.',
        'Day-night Shield fixtures at Adelaide Oval used to simulate Test conditions.'
      ]
    },
    {
      id: 'premier-cricket',
      title: 'Premier & pathway cricket',
      summary: 'Club competitions feed talent into state squads and Cricket Australia academies.',
      bullets: [
        'Premier T20 competitions streaming weekly with enhanced analytics for scouts.',
        'National Championships in Adelaide showcase next generation quicks topping 140kph.',
        'State rookie contracts linked to community coaching and ambassador roles.'
      ]
    },
    {
      id: 'community-cricket',
      title: 'Community & participation',
      summary: 'Inclusion and growth programs expanding across metropolitan and regional hubs.',
      bullets: [
        'Woolworths Cricket Blast participation up 12% year-on-year nationwide.',
        'Regional infrastructure grants funding new hybrid turf wickets in the NT.',
        'Female leadership forums connecting club presidents and pathway mentors.'
      ]
    }
  ];
}
