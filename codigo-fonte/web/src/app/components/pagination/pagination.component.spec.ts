import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationComponent } from './pagination.component';

describe('PaginationComponent (unit)', () => {
  let fixture: ComponentFixture<PaginationComponent>;
  let component: PaginationComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
  });

  function setInputs(
    page: number,
    size: number,
    totalElements: number,
    totalPages: number,
  ): void {
    component.page = page;
    component.size = size;
    component.totalElements = totalElements;
    component.totalPages = totalPages;
    fixture.detectChanges();
  }

  it('computes the displayed range for a middle page', () => {
    setInputs(1, 20, 45, 3);

    expect(component.rangeStart).toBe(21);
    expect(component.rangeEnd).toBe(40);
  });

  it('caps the range end at the total on the last page', () => {
    setInputs(2, 20, 45, 3);

    expect(component.rangeStart).toBe(41);
    expect(component.rangeEnd).toBe(45);
  });

  it('shows an empty range when there are no results', () => {
    setInputs(0, 20, 0, 0);

    expect(component.rangeStart).toBe(0);
    expect(component.rangeEnd).toBe(0);
    expect(component.displayedTotalPages).toBe(1);
  });

  it('disables previous on the first page and enables next when more pages exist', () => {
    setInputs(0, 20, 45, 3);

    expect(component.hasPreviousPage).toBeFalse();
    expect(component.hasNextPage).toBeTrue();
  });

  it('disables next on the last page and enables previous', () => {
    setInputs(2, 20, 45, 3);

    expect(component.hasPreviousPage).toBeTrue();
    expect(component.hasNextPage).toBeFalse();
  });

  it('emits the previous page number when going back', () => {
    setInputs(1, 20, 45, 3);
    let emitted: number | undefined;
    component.pageChange.subscribe((page) => (emitted = page));

    component.goToPrevious();

    expect(emitted).toBe(0);
  });

  it('emits the next page number when going forward', () => {
    setInputs(1, 20, 45, 3);
    let emitted: number | undefined;
    component.pageChange.subscribe((page) => (emitted = page));

    component.goToNext();

    expect(emitted).toBe(2);
  });

  it('does not emit when there is no previous or next page', () => {
    setInputs(0, 20, 5, 1);
    let emitted = false;
    component.pageChange.subscribe(() => (emitted = true));

    component.goToPrevious();
    component.goToNext();

    expect(emitted).toBeFalse();
  });

  it('disables both buttons in the DOM when there is a single page', () => {
    setInputs(0, 20, 5, 1);

    const buttons: NodeListOf<HTMLButtonElement> =
      fixture.nativeElement.querySelectorAll('button');
    buttons.forEach((button) => expect(button.disabled).toBeTrue());
  });
});
