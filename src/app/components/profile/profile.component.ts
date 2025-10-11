import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { NewsStateService } from '../../services/news-state.service';
import { DigestSchedule, DigestSummary, SavedFilterPreset } from '../../models/news.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  presets: SavedFilterPreset[] = [];
  digestSchedule: DigestSchedule | null = null;
  digestHistory: DigestSummary[] = [];

  scheduleFrequency: 'daily' | 'weekly' = 'daily';
  scheduleTime = '08:00';
  scheduleTimezone = 'UTC';
  savingSchedule = false;
  scheduleMessage: string | null = null;
  previewLoading = false;
  previewMessage: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService, private stateService: NewsStateService) {}

  get user$() {
    return this.authService.user$;
  }

  ngOnInit(): void {
    this.stateService.savedPresets$.pipe(takeUntil(this.destroy$)).subscribe((presets) => {
      this.presets = presets;
    });

    this.stateService.digestSchedule$.pipe(takeUntil(this.destroy$)).subscribe((schedule) => {
      this.digestSchedule = schedule?.schedule || null;
      this.digestHistory = schedule?.history || [];
      if (this.digestSchedule) {
        this.scheduleFrequency = this.digestSchedule.frequency;
        this.scheduleTime = this.digestSchedule.timeOfDay;
        this.scheduleTimezone = this.digestSchedule.timezone || 'UTC';
      }
    });
  }

  saveSchedule(): void {
    this.savingSchedule = true;
    this.scheduleMessage = null;

    this.stateService.updateDigestSchedule({
      frequency: this.scheduleFrequency,
      timeOfDay: this.scheduleTime,
      timezone: this.scheduleTimezone
    }).subscribe({
      next: () => {
        this.savingSchedule = false;
        this.scheduleMessage = 'Digest schedule saved successfully.';
      },
      error: (err) => {
        this.savingSchedule = false;
        this.scheduleMessage = err.message || 'Unable to save schedule.';
      }
    });
  }

  clearSchedule(): void {
    this.stateService.clearDigestSchedule().subscribe({
      next: () => {
        this.scheduleMessage = 'Digest schedule cleared.';
      },
      error: (err) => {
        this.scheduleMessage = err.message || 'Unable to clear schedule.';
      }
    });
  }

  sendPreview(): void {
    this.previewLoading = true;
    this.previewMessage = null;

    this.stateService.loadDigestPreview().subscribe({
      next: () => {
        this.previewLoading = false;
        this.previewMessage = 'Preview digest generated. Check the list below to review it.';
      },
      error: (err) => {
        this.previewLoading = false;
        this.previewMessage = err.message || 'Unable to generate a preview digest.';
      }
    });
  }

  deletePreset(preset: SavedFilterPreset): void {
    this.stateService.deleteFilterPreset(preset.id).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
