import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent (unit)', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let component: ConfirmDialogComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    component.title = 'Desativar usuário';
    component.message = 'Desativar o acesso de Marina Alves?';
    fixture.detectChanges();
  });

  it('renders the title and message', () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('#confirm-dialog-title')?.textContent).toContain(
      'Desativar usuário',
    );
    expect(element.querySelector('#confirm-dialog-message')?.textContent).toContain(
      'Desativar o acesso de Marina Alves?',
    );
  });

  it('emits confirmed when the confirm button is clicked', () => {
    let emitted = false;
    component.confirmed.subscribe(() => (emitted = true));

    component.onConfirm();

    expect(emitted).toBeTrue();
  });

  it('emits cancelled when the cancel button is clicked', () => {
    let emitted = false;
    component.cancelled.subscribe(() => (emitted = true));

    component.onCancel();

    expect(emitted).toBeTrue();
  });

  it('does not emit confirmed or cancelled while a confirmation is already in flight', () => {
    component.confirmLoading = true;
    let confirmedEmitted = false;
    let cancelledEmitted = false;
    component.confirmed.subscribe(() => (confirmedEmitted = true));
    component.cancelled.subscribe(() => (cancelledEmitted = true));

    component.onConfirm();
    component.onCancel();

    expect(confirmedEmitted).toBeFalse();
    expect(cancelledEmitted).toBeFalse();
  });

  it('disables both buttons while a confirmation is in flight', () => {
    component.confirmLoading = true;
    fixture.detectChanges();

    const buttons: NodeListOf<HTMLButtonElement> =
      fixture.nativeElement.querySelectorAll('button');
    buttons.forEach((button) => expect(button.disabled).toBeTrue());
  });
});
