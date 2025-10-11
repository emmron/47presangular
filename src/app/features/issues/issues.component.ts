import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { PolicyPosition } from '../../models/issue.model';
import { IssuesService } from '../../services/issues.service';

@Component({
  selector: 'app-issues',
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssuesComponent {
  positions$: Observable<PolicyPosition[]> = this.issuesService.getPolicyPositions();
  copiedId?: string;

  constructor(private readonly issuesService: IssuesService) {}

  async copyShareMessage(position: PolicyPosition): Promise<void> {
    try {
      await navigator.clipboard.writeText(position.shareMessage);
      this.copiedId = position.id;
      setTimeout(() => (this.copiedId = undefined), 2000);
    } catch (error) {
      console.error('Unable to copy share message', error);
    }
  }
}
