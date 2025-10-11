import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';
import { ExperimentService, ExperimentVariant } from './services/experiment.service';
import { ReferralService } from './services/referral.service';

class ExperimentServiceStub {
  assignVariant(_: string, variants: ExperimentVariant[]): ExperimentVariant {
    return variants[0];
  }
}

class ReferralServiceStub {
  getReferralCode(): string {
    return 'ACC-TEST';
  }
}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: ExperimentService, useClass: ExperimentServiceStub },
        { provide: ReferralService, useClass: ReferralServiceStub }
      ]
    }).compileComponents();
  });

  it('should create the app shell', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the brand title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.shell__title')?.textContent).toContain('Aussie Cricket Central');
  });

  it('should expose a skip link for accessibility', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.skip-link')?.textContent?.trim()).toBe('Skip to main content');
  });
});
