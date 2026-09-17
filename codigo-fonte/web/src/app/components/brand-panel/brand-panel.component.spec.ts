import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandPanelComponent } from './brand-panel.component';

describe('BrandPanelComponent', () => {
  let fixture: ComponentFixture<BrandPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BrandPanelComponent);
    fixture.detectChanges();
  });

  it('renders the brand quote', () => {
    const quote: HTMLElement = fixture.nativeElement.querySelector(
      '.brand-panel__quote',
    );
    expect(quote.textContent).toContain('Cada gato tem uma história');
  });

  it('renders all three brand stats', () => {
    const stats: NodeListOf<HTMLElement> =
      fixture.nativeElement.querySelectorAll('.brand-panel__stat');
    expect(stats.length).toBe(3);
    expect(stats[0].textContent).toContain('312');
    expect(stats[0].textContent).toContain('Adoções realizadas');
  });
});
