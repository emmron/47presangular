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
      id: 'international-men',
      title: "Men's internationals",
      summary: 'Tour news, selection calls, and form lines for the Baggy Greens across Test, ODI, and T20 formats.',
      bullets: [
        'Monitor the New Zealand Test tour with focus on the pace attack rotation.',
        'Track ODI squad refresh ahead of the Champions Trophy qualification window.',
        'Analyse David Warner succession planning for the next home summer.'
      ]
    },
    {
      id: 'international-women',
      title: "Women's internationals",
      summary: 'Southern Stars scheduling, squad depth, and World Cup defence storylines.',
      bullets: [
        'Selection squeeze with Kim Garth, Darcie Brown, and Tayla Vlaeminck returning from injury.',
        'Spin tandem of Alana King and Ash Gardner prepping for subcontinental tours.',
        'Multi-format captaincy balance for Meg Lanning successors and leadership group.'
      ]
    },
    {
      id: 'domestic-red-ball',
      title: 'Sheffield Shield & Marsh Cup',
      summary: 'State cricket trends that influence national call-ups and contract decisions.',
      bullets: [
        'Western Australia pushing for a three-peat with Cameron Bancroft in prolific form.',
        'Victorian quicks vying for Australia A selection through strong Shield returns.',
        'Marsh Cup final permutations as Queensland chase net run rate boosts.'
      ]
    },
    {
      id: 'big-bash',
      title: 'Big Bash spotlight',
      summary: 'BBL and WBBL recruitment moves, tactical shifts, and broadcast innovations.',
      bullets: [
        'Hurricanes and Renegades in market for marquee overseas finishers.',
        'New power surge strategies and analytics-led fielding alignments.',
        'Negotiations underway for expanded WBBL regional festival rounds.'
      ]
    },
    {
      id: 'pathways',
      title: 'Emerging talent pipeline',
      summary: 'Pathway programs fueling the next generation of Australian stars.',
      bullets: [
        'National Performance Squad camp at Allan Border Field focused on fast bowling loads.',
        'Australia A to tour England in July with an eye on Ashes depth.',
        'Under-19 world cup recap spotlighting MVP Kate Pelle and Harry Dixon.'
      ]
    },
    {
      id: 'community-media',
      title: 'Community & media',
      summary: 'Grassroots initiatives and coverage shifts keeping fans connected.',
      bullets: [
        'Cricket Australia rolling out PlayHQ upgrades for live scoring at grade level.',
        'ABC confirms expanded digital radio rights for WBBL and WNCL.',
        'Indigenous cricket programs delivering combined youth carnivals in Alice Springs.'
      ]
    }
  ];
}
