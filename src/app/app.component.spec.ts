import { TestBed } from '@angular/core/testing';
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
    return 'T47-TEST';
  }
}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent]
      imports: [AppComponent],
      providers: [
        { provide: ExperimentService, useClass: ExperimentServiceStub },
        { provide: ReferralService, useClass: ReferralServiceStub },
      ],
    }).compileComponents();
  });

  it('should create the app shell', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have the tracker title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Trump 47 Campaign Tracker');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand')?.textContent).toContain('Trump 47 Campaign Tracker');
  });
});
