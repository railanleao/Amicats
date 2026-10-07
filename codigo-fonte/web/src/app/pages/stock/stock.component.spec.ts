import { signal } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { STOCK_CATEGORIES } from '../../models/stock-category.model';

import { AccessType } from '../../models/auth.model';

import {
  PagedResult,
  StockItem,
  StockSearchParams,
} from '../../models/stock.model';
import { AuthService } from '../../services/resources/auth.service';
import { StockService } from '../../services/resources/stock.service';
import { StockComponent } from './stock.component';

describe('StockComponent', () => {
  let fixture: ComponentFixture<StockComponent>;
  let component: StockComponent;
  let stockServiceSpy: jasmine.SpyObj<StockService>;
  const currentUser = signal<{
    id: number;
    name: string;
    accessType: AccessType;
  } | null>(null);

  function mockItems(): StockItem[] {
    return [
      {
        id: 1,
        name: 'Amoxicilina 250mg',
        category: 'Antibiótico',
        quantity: 42,
        status: 'Normal',
        expirationDate: '2027-03-01',
        unit: 'unidades',
        notes: null,
      },
      {
        id: 2,
        name: 'Interferon felino',
        category: 'Imunomodulador',
        quantity: 6,
        status: 'Low',
        expirationDate: '2026-11-01',
        unit: 'frascos',
        notes: 'Estoque baixo',
      },
    ];
  }

  function pagedResult(
    content: StockItem[],
    page = 0,
    totalPages = 1,
  ): PagedResult<StockItem> {
    return {
      content,
      page,
      size: 20,
      totalElements: content.length,
      totalPages,
    };
  }

  beforeEach(async () => {
    currentUser.set({
      id: 1,
      name: 'Ana',
      accessType: 'Administrator',
    });

   stockServiceSpy = jasmine.createSpyObj<StockService>('StockService', [
     'list',
   ]);

    stockServiceSpy.list.and.returnValue(of(pagedResult(mockItems())));

    await TestBed.configureTestingModule({
      imports: [StockComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { currentUser } },
        { provide: StockService, useValue: stockServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the stock list on init with default pagination', () => {
    expect(stockServiceSpy.list).toHaveBeenCalledWith({
      search: undefined,
      category: undefined,
      status: undefined,
      expirationFrom: undefined,
      expirationTo: undefined,
      page: 0,
      size: 20,
    } as StockSearchParams);
  });

  it('populates the stock list and pagination data', () => {
    expect(component.items()).toEqual(mockItems());
    expect(component.totalElements()).toBe(2);
    expect(component.totalPages()).toBe(1);
    expect(component.loading()).toBeFalse();
  });

  it('shows an error when the stock list request fails', () => {
    stockServiceSpy.list.and.returnValue(
      throwError(() => new Error('network error')),
    );

    component.items.set([]);

    component.loadStock();
    fixture.detectChanges();

    expect(component.errorMessage()).toBe(
      'Não foi possível carregar o estoque. Tente novamente.',
    );

    const errorFeedback =
      fixture.nativeElement.querySelector('.feedback--error');

    const emptyState =
      fixture.nativeElement.querySelector('.empty-state');

    expect(errorFeedback).not.toBeNull();
    expect(emptyState).toBeNull();
  });

it('shows the shared stock categories in the category filter', () => {
  fixture.detectChanges();

  component.showFilters = true;
  fixture.detectChanges();

  const select = fixture.nativeElement.querySelector(
    '#category',
  ) as HTMLSelectElement;

  const options = Array.from(select.options).map(
    (option) => option.value,
  );

  expect(options).toEqual([
    '',
    ...STOCK_CATEGORIES,
  ]);
});


  it('debounces search and resets the page', fakeAsync(() => {
    stockServiceSpy.list.calls.reset();

    component.onPageChange(2);
    stockServiceSpy.list.calls.reset();

    component.onSearch({
      target: { value: 'amoxicilina' },
    } as unknown as Event);

    tick(299);
    expect(stockServiceSpy.list).not.toHaveBeenCalled();

    tick(1);

    expect(component.page()).toBe(0);
    expect(stockServiceSpy.list).toHaveBeenCalledWith(
      jasmine.objectContaining({
        search: 'amoxicilina',
        page: 0,
      }),
    );
  }));

  it('reloads the stock when the status filter changes', () => {
    stockServiceSpy.list.calls.reset();

    component.onStatusChange({
      target: { value: 'Low' },
    } as unknown as Event);

    expect(component.selectedStatus).toBe('Low');
    expect(component.page()).toBe(0);
    expect(stockServiceSpy.list).toHaveBeenCalledWith(
      jasmine.objectContaining({
        status: 'Low',
        page: 0,
      }),
    );
  });

  it('loads the requested page when pagination changes', () => {
    stockServiceSpy.list.calls.reset();

    component.onPageChange(1);

    expect(component.page()).toBe(1);
    expect(stockServiceSpy.list).toHaveBeenCalledWith(
      jasmine.objectContaining({
        page: 1,
      }),
    );
  });

  it('navigates to the stock entry page', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(
      true,
    );

    component.registerEntry();

    expect(navigate).toHaveBeenCalledWith(['/stock/entries/new']);
  });

  it('navigates to the stock edit page', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(
      true,
    );

    component.editItem(1);

    expect(navigate).toHaveBeenCalledWith(['/stock', 1, 'edit']);
  });

  it('formats stock values for display', () => {


    expect(component.quantityLabel(mockItems()[0])).toBe('42 unidades');
    expect(component.expirationLabel('2027-03-01')).toBe('03/2027');
    expect(component.expirationLabel(null)).toBe('—');
  });

  it('shows stock management actions for an administrator', () => {
    currentUser.set({
      id: 1,
      name: 'Ana',
      accessType: 'Administrator',
    });

    fixture.detectChanges();

    const registerEntryButton =
      fixture.nativeElement.querySelector('.new-button');
    const editButton =
      fixture.nativeElement.querySelector('.edit-button');

    expect(registerEntryButton).not.toBeNull();
    expect(editButton).not.toBeNull();
  });

  it('shows stock management actions for an assistant', () => {
    currentUser.set({
      id: 2,
      name: 'Rui',
      accessType: 'Assistant',
    });

    fixture.detectChanges();

    const registerEntryButton =
      fixture.nativeElement.querySelector('.new-button');
    const editButton =
      fixture.nativeElement.querySelector('.edit-button');

    expect(registerEntryButton).not.toBeNull();
    expect(editButton).not.toBeNull();
  });

  it('hides stock management actions from a veterinarian', () => {
    currentUser.set({
      id: 3,
      name: 'Marina',
      accessType: 'Veterinarian',
    });

    fixture.detectChanges();

    const registerEntryButton =
      fixture.nativeElement.querySelector('.new-button');
    const editButton =
      fixture.nativeElement.querySelector('.edit-button');

    expect(registerEntryButton).toBeNull();
    expect(editButton).toBeNull();
  });

  it('hides stock management actions from a viewer', () => {
    currentUser.set({
      id: 4,
      name: 'Paula',
      accessType: 'Viewer',
    });

    fixture.detectChanges();

    const registerEntryButton =
      fixture.nativeElement.querySelector('.new-button');
    const editButton =
      fixture.nativeElement.querySelector('.edit-button');

    expect(registerEntryButton).toBeNull();
    expect(editButton).toBeNull();
  });
});
