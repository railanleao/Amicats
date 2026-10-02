import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { EMPTY, of, throwError } from 'rxjs';

import { PagedResult, StockItem } from '../../models/stock.model';
import { StockService } from '../../services/resources/stock.service';
import { StockEntryComponent } from './stock-entry.component';

describe('StockEntryComponent', () => {
  let stockServiceSpy: jasmine.SpyObj<StockService>;
  let fixture: ComponentFixture<StockEntryComponent>;
  let component: StockEntryComponent;

  beforeEach(async () => {
    stockServiceSpy = jasmine.createSpyObj<StockService>('StockService', [
      'list',
      'registerEntry',
    ]);

    const emptyPage: PagedResult<StockItem> = {
      content: [],
      page: 0,
      size: 1000,
      totalElements: 0,
      totalPages: 0,
    };

    stockServiceSpy.list.and.returnValue(of(emptyPage));

    await TestBed.configureTestingModule({
      imports: [StockEntryComponent],
      providers: [
        provideRouter([]),
        { provide: StockService, useValue: stockServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StockEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the stock entry component', () => {
    expect(component).toBeTruthy();
  });

  it('loads stock items on init', () => {
    expect(stockServiceSpy.list).toHaveBeenCalledWith({
      page: 0,
      size: 1000,
    });
  });

  it('stores the stock items returned by the service', () => {
    const items: StockItem[] = [
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
    ];

    stockServiceSpy.list.and.returnValue(
      of({
        content: items,
        page: 0,
        size: 1000,
        totalElements: 1,
        totalPages: 1,
      }),
    );

    component.loadStockItems();

    expect(component.items()).toEqual(items);
  });

  it('selects the current stock item when the medication changes', () => {
    const item: StockItem = {
      id: 1,
      name: 'Amoxicilina 250mg',
      category: 'Antibiótico',
      quantity: 42,
      status: 'Normal',
      expirationDate: '2027-03-01',
      unit: 'unidades',
      notes: null,
    };

    component.items.set([item]);
    component.form.controls.stockItemId.setValue(1);

    component.onStockItemChange();

    expect(component.selectedStockItem()).toEqual(item);
  });

  it('enables and requires donor name when origin is donated', () => {
    const donorNameControl = component.form.controls.donorName;

    expect(donorNameControl.disabled).toBeTrue();

    component.form.controls.origin.setValue('DONATED');
    component.onOriginChange();

    expect(donorNameControl.enabled).toBeTrue();

    donorNameControl.setValue('');
    donorNameControl.updateValueAndValidity();

    expect(donorNameControl.hasError('required')).toBeTrue();
  });

  it('disables and clears donor name when origin is purchased', () => {
    const donorNameControl = component.form.controls.donorName;

    component.form.controls.origin.setValue('DONATED');
    component.onOriginChange();

    donorNameControl.setValue('Clínica VetAmigo');

    component.form.controls.origin.setValue('PURCHASED');
    component.onOriginChange();

    expect(donorNameControl.disabled).toBeTrue();
    expect(donorNameControl.value).toBe('');
    expect(donorNameControl.hasError('required')).toBeFalse();
  });

  it('does not register an entry when the form is invalid', () => {
    component.onSubmit();

    expect(stockServiceSpy.registerEntry).not.toHaveBeenCalled();
    expect(component.form.controls.stockItemId.touched).toBeTrue();
    expect(component.form.controls.origin.touched).toBeTrue();
    expect(component.form.controls.quantity.touched).toBeTrue();
    expect(component.form.controls.entryDate.touched).toBeTrue();
  });

  it('registers a stock entry with the correct payload', () => {
    stockServiceSpy.registerEntry.and.returnValue(EMPTY);

    component.form.controls.stockItemId.setValue(1);
    component.form.controls.origin.setValue('DONATED');
    component.onOriginChange();

    component.form.controls.donorName.setValue('Clínica VetAmigo');
    component.form.controls.quantity.setValue(10);
    component.form.controls.entryDate.setValue('2026-09-10');
    component.form.controls.expirationDate.setValue('2028-04-01');

    component.onSubmit();

    expect(stockServiceSpy.registerEntry).toHaveBeenCalledWith({
      stockItemId: 1,
      origin: 'DONATED',
      donorName: 'Clínica VetAmigo',
      quantity: 10,
      entryDate: '2026-09-10',
      expirationDate: '2028-04-01',
    });
  });

  it('navigates back to stock after a successful entry registration', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(
      true,
    );

    stockServiceSpy.registerEntry.and.returnValue(of(void 0));

    component.form.controls.stockItemId.setValue(1);
    component.form.controls.origin.setValue('PURCHASED');
    component.onOriginChange();

    component.form.controls.quantity.setValue(10);
    component.form.controls.entryDate.setValue('2026-09-10');

    component.onSubmit();

    expect(navigate).toHaveBeenCalledWith(['/stock']);
  });

it('shows an error message when entry registration fails', () => {
  stockServiceSpy.registerEntry.and.returnValue(
    throwError(() => new Error('server error')),
  );

  component.form.controls.stockItemId.setValue(1);
  component.form.controls.origin.setValue('PURCHASED');
  component.onOriginChange();

  component.form.controls.quantity.setValue(10);
  component.form.controls.entryDate.setValue('2026-09-10');

  component.onSubmit();

  expect(component.saveError()).toBe(
    'Não foi possível registrar a entrada. Tente novamente.',
  );
});
it('shows an error message when stock items fail to load', () => {
  stockServiceSpy.list.and.returnValue(
    throwError(() => new Error('network error')),
  );

  component.loadStockItems();

  expect(component.loadError()).toBe(
    'Não foi possível carregar os itens do estoque. Tente novamente.',
  );
});
});
