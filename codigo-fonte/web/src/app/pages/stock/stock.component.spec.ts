import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import {
  PagedResult,
  StockItem,
  StockItemSearchParams,
} from '../../models/stock.model';
import { StockService } from '../../services/resources/stock.service';
import { StockComponent } from './stock.component';

describe('StockComponent', () => {
  let fixture: ComponentFixture<StockComponent>;
  let component: StockComponent;
  let stockServiceSpy: jasmine.SpyObj<StockService>;

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
    stockServiceSpy = jasmine.createSpyObj<StockService>('StockService', [
      'list',
      'update',
    ]);

    stockServiceSpy.list.and.returnValue(of(pagedResult(mockItems())));

    await TestBed.configureTestingModule({
      imports: [StockComponent],
      providers: [
        provideRouter([]),
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
    } as StockItemSearchParams);
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

    component.loadStock();

    expect(component.errorMessage()).toBe(
      'Não foi possível carregar o estoque. Tente novamente.',
    );
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

  it('fills the edit form with the selected stock item', () => {
    const item = mockItems()[0];

    component.startEdit(item);

    expect(component.editingItem()).toEqual(item);
    expect(component.editForm.controls.name.value).toBe('Amoxicilina 250mg');
    expect(component.editForm.controls.category.value).toBe('Antibiótico');
    expect(component.editForm.controls.quantity.value).toBe(42);
    expect(component.editForm.controls.unit.value).toBe('unidades');
    expect(component.editForm.controls.notes.value).toBe('');
  });

  it('does not update when the edit form is invalid', () => {
    component.startEdit(mockItems()[0]);

    component.editForm.controls.name.setValue('');

    component.saveEdit();

    expect(stockServiceSpy.update).not.toHaveBeenCalled();
    expect(component.editForm.controls.name.touched).toBeTrue();
  });

  it('updates the stock item with trimmed values', () => {
    const item = mockItems()[0];

    stockServiceSpy.update.and.returnValue(of(item));

    component.startEdit(item);

    component.editForm.setValue({
      name: '  Amoxicilina 250mg  ',
      category: '  Antibiótico  ',
      quantity: 50,
      unit: '  unidades  ',
      notes: '  Estoque atualizado  ',
    });

    component.saveEdit();

    expect(stockServiceSpy.update).toHaveBeenCalledWith(1, {
      name: 'Amoxicilina 250mg',
      category: 'Antibiótico',
      quantity: 50,
      unit: 'unidades',
      notes: 'Estoque atualizado',
    });

    expect(component.editingItem()).toBeNull();
  });

  it('formats stock values for display', () => {
    expect(component.statusLabel('Normal')).toBe('Normal');
    expect(component.statusLabel('Low')).toBe('Baixo');
    expect(component.statusLabel('OutOfStock')).toBe('Em falta');

    expect(component.quantityLabel(mockItems()[0])).toBe('42 unidades');
    expect(component.expirationLabel('2027-03-01')).toBe('03/2027');
    expect(component.expirationLabel(null)).toBe('—');
  });
});
