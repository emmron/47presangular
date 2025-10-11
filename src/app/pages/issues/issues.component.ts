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
      id: 'internationals',
      title: "Men's internationals",
      summary: 'Tests, ODIs, and T20s featuring the Australian men.',
      bullets: [
        'Selectors weighing spin options for the next subcontinent tour.',
        'Managing the pace cartel workloads through overlapping series.',
        'Stabilising the middle order in white-ball squads ahead of the World Cup.'
      ]
    },
    {
      id: 'womens-internationals',
      title: "Women's internationals",
      summary: 'World champion Aussies fine-tuning for multi-format series.',
      bullets: [
        'Rotation plan to balance WPL commitments with national duties.',
        'Emerging quicks pressing for debuts after standout WNCL campaigns.',
        'Leadership group mapping out Ashes defence later in the summer.'
      ]
    },
    {
      id: 'domestic',
      title: 'Sheffield Shield & Marsh Cup',
      summary: 'State rivalries driving selection debates and ladder movement.',
      bullets: [
        'Queensland and Victoria jostling for top-two berths in the Shield.',
        'White-ball bolters staking claims with heavy Marsh Cup returns.',
        'Spin depth chart evolving as SCG and Adelaide decks take turn.'
      ]
    },
    {
      id: 'big-bash',
      title: 'Big Bash leagues',
      summary: 'BBL and WBBL squads recalibrating under the new contracting windows.',
      bullets: [
        'Draft retention lists due before international player nominations open.',
        'Clubs chasing marquee all-rounders after standout Hundred campaigns.',
        'Venue upgrades and themed rounds to broaden audience reach.'
      ]
    },
    {
      id: 'pathways',
      title: 'Premier cricket focus',
      summary: 'Club standouts and Australia A tours feeding the national depth chart.',
      bullets: [
        'Under-19 squads locking in for the next Youth World Cup cycle.',
        'Premier competitions trialling nighttime red-ball fixtures.',
        'Academy coaches spotlighting multi-sport talent conversions.'
      ]
    },
    {
      id: 'participation',
      title: 'Participation & growth',
      summary: 'Initiatives widening the player base from schools to social leagues.',
      bullets: [
        'Woolworths Cricket Blast expanding into more remote communities.',
        'State associations piloting inclusive equipment grants.',
        'First Nations programs pairing cultural exchange with coaching clinics.'
      ]
    }
  ];
}
