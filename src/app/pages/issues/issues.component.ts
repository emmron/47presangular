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
      id: 'australia-men',
      title: 'Australian men’s teams',
      summary: 'Tests in New Zealand, ODIs v Sri Lanka, and a T20 build-up to the Champions Trophy.',
      bullets: [
        'Mitchell Marsh leads the white-ball squads with Travis Head rested for parts of the tour.',
        'Spin depth monitored closely with Kuhnemann and Murphy sharing Shield overs.',
        'World Test Championship standings tighten ahead of the 2025 Ashes trip.'
      ]
    },
    {
      id: 'australia-women',
      title: 'Australian women’s teams',
      summary: 'Southern Stars juggle multi-format series against India and England while integrating youth.',
      bullets: [
        'Phoebe Litchfield locks in the opener role alongside Alyssa Healy.',
        'Annabel Sutherland’s allround brilliance keeps her central to every XI.',
        'WNCL form from Lauren Smith and Tess Flintoff pushing for national call-ups.'
      ]
    },
    {
      id: 'big-bash',
      title: 'Big Bash League & WBBL',
      summary: 'List lodgements, draft chatter, and coaching moves ahead of summer.',
      bullets: [
        'Sydney Sixers and Adelaide Strikers headline retention picks after finals runs.',
        'Melbourne Stars chase marquee internationals with a focus on leg-spin options.',
        'WBBL expansion squads target rising teenage pace bowlers from Premier Cricket.'
      ]
    },
    {
      id: 'sheffield-shield',
      title: 'Sheffield Shield spotlight',
      summary: 'Shield finals race heats up with NSW and Tasmania separating from the pack.',
      bullets: [
        'Tasmania banking on Jordan Silk’s consistency and a rejuvenated Jackson Bird.',
        'NSW fast-bowling cartel rotated to manage workloads before the ODI series.',
        'Queensland bloods teen leggie to fast-track spin experience.'
      ]
    },
    {
      id: 'state-competitions',
      title: 'Marsh Cup & WNCL',
      summary: 'One-day formats providing selection stories and breakout performers.',
      bullets: [
        'Western Australia closing in on another Marsh Cup finals berth.',
        'WNCL batting charts dominated by Elyse Villani and Katie Mack.',
        'Emerging quicks like Liam Haskett and Milly Illingworth impressing scouts.'
      ]
    },
    {
      id: 'fan-stories',
      title: 'Supporter & club cricket stories',
      summary: 'Grassroots tales and initiatives from across the states.',
      bullets: [
        'Night matches in Darwin’s Strike League drawing record crowds.',
        'Community clubs trial inclusive programs for neurodiverse players.',
        'Fan podcasts breaking down BBL analytics and Premier Cricket nuggets.'
      ]
    }
  ];
}
