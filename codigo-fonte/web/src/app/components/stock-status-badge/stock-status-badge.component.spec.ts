import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockStatusBadgeComponent } from './stock-status-badge.component';

describe('StockStatusBadgeComponent', () => {
  let fixture: ComponentFixture<StockStatusBadgeComponent>;
  let component: StockStatusBadgeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockStatusBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockStatusBadgeComponent);
    component = fixture.componentInstance;
  });

  it('shows the normal status', () => {
    component.status = 'Normal';
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.status-badge');

    expect(badge.textContent.trim()).toBe('Normal');
    expect(badge.classList).toContain('status-badge--normal');
  });

  it('shows the low status', () => {
    component.status = 'Low';
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.status-badge');

    expect(badge.textContent.trim()).toBe('Baixo');
    expect(badge.classList).toContain('status-badge--low');
  });

  it('shows the out of stock status', () => {
    component.status = 'OutOfStock';
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.status-badge');

    expect(badge.textContent.trim()).toBe('Em falta');
    expect(badge.classList).toContain('status-badge--out');
  });
});
