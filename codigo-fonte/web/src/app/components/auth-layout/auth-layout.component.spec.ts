import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthLayoutComponent } from './auth-layout.component';

@Component({
  imports: [AuthLayoutComponent],
  template: `
    <app-auth-layout>
      <div class="projected-content">Formulário da tela</div>
    </app-auth-layout>
  `,
})
class HostComponent {}

describe('AuthLayoutComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('renders the brand panel', () => {
    const brandPanel = fixture.nativeElement.querySelector('app-brand-panel');
    expect(brandPanel).not.toBeNull();
  });

  it('projects the content passed by the host page', () => {
    const projectedContent: HTMLElement =
      fixture.nativeElement.querySelector('.projected-content');
    expect(projectedContent.textContent).toContain('Formulário da tela');
  });
});
