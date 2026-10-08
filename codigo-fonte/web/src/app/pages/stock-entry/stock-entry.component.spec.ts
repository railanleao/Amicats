import { HttpErrorResponse } from '@angular/common/http';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { EMPTY, of, Subject, throwError } from 'rxjs';

import {
  MEDICATION_CATEGORY,
  PagedResult,
  StockItem,
} from '../../models/stock.model';
import { StockService } from '../../services/resources/stock.service';
import { StockEntryComponent } from './stock-entry.component';

describe('StockEntryComponent', () => {
  let stockServiceSpy: jasmine.SpyObj<StockService>;
  let fixture: ComponentFixture<StockEntryComponent>;
  let component: StockEntryComponent;

  beforeEach(async () => {
    stockServiceSpy = jasmine.createSpyObj<StockService>('StockService', [
      'list',
      'create',
      'registerEntry',
    ]);

    const emptyPage: PagedResult<StockItem> = {
      content: [],
      page: 0,
      size: 20,
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
      search: undefined,
      page: 0,
      size: 20,
    });
  });

it('searches stock items after the debounce time', fakeAsync(() => {
  stockServiceSpy.list.calls.reset();

  component.stockSearchControl.setValue('amoxi');

  tick(299);

  expect(stockServiceSpy.list).not.toHaveBeenCalled();

  tick(1);

  expect(stockServiceSpy.list).toHaveBeenCalledOnceWith({
    search: 'amoxi',
    page: 0,
    size: 20,
  });
}));


  it('allows creating a new medication when there is no exact match', () => {
    component.stockSearchControl.setValue('Dipirona 500mg', {
      emitEvent: false,
    });

    component.loadedSearchTerm.set('Dipirona 500mg');
    component.items.set([]);

    expect(component.canCreateNewItem()).toBeTrue();
  });

  it('does not allow creating a duplicate medication ignoring case', () => {
    component.stockSearchControl.setValue('AMOXICILINA 250MG', {
      emitEvent: false,
    });

    component.loadedSearchTerm.set('AMOXICILINA 250MG');

    component.items.set([
      {
        id: 1,
        name: 'Amoxicilina 250mg',
        category: MEDICATION_CATEGORY,
        quantity: 42,
        status: 'Normal',
        expirationDate: '2027-03-01',
        unit: 'unidades',
        notes: null,
      },
    ]);

    expect(component.canCreateNewItem()).toBeFalse();
  });

  it('adds and selects a newly created medication', () => {
    const createdItem: StockItem = {
      id: 10,
      name: 'Dipirona 500mg',
      category: MEDICATION_CATEGORY,
      quantity: 0,
      status: 'OutOfStock',
      expirationDate: null,
      unit: 'frascos',
      notes: null,
    };

    component.creatingNewItem.set(true);

    component.onNewItemCreated(createdItem);

    expect(component.items()).toContain(createdItem);
    expect(component.form.controls.stockItemId.value).toBe(10);
    expect(component.selectedStockItem()).toEqual(createdItem);
    expect(component.creatingNewItem()).toBeFalse();
  });

  it('ignores an older stock search response when a newer search finishes first', () => {
    const olderSearch = new Subject<PagedResult<StockItem>>();
    const newerSearch = new Subject<PagedResult<StockItem>>();

    const olderItem: StockItem = {
      id: 1,
      name: 'Amoxicilina antiga',
      category: MEDICATION_CATEGORY,
      quantity: 10,
      status: 'Normal',
      expirationDate: null,
      unit: 'unidades',
      notes: null,
    };

    const newerItem: StockItem = {
      id: 2,
      name: 'Dipirona nova',
      category: MEDICATION_CATEGORY,
      quantity: 5,
      status: 'Normal',
      expirationDate: null,
      unit: 'unidades',
      notes: null,
    };

    stockServiceSpy.list.and.returnValues(
      olderSearch.asObservable(),
      newerSearch.asObservable(),
    );

    component.loadStockItems('amoxicilina');
    component.loadStockItems('dipirona');

    newerSearch.next({
      content: [newerItem],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    });
    newerSearch.complete();

    olderSearch.next({
      content: [olderItem],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    });
    olderSearch.complete();

    expect(component.items()).toEqual([newerItem]);
    expect(component.loadedSearchTerm()).toBe('dipirona');
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
        size: 20,
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


    expect(component.selectedStockItem()).toEqual(item);
  });

  it('enables and requires donor name when origin is donated', () => {
    const donorNameControl = component.form.controls.donorName;

    expect(donorNameControl.disabled).toBeTrue();

    component.form.controls.origin.setValue('DONATED');

    expect(donorNameControl.enabled).toBeTrue();

    donorNameControl.setValue('');
    donorNameControl.updateValueAndValidity();

    expect(donorNameControl.hasError('required')).toBeTrue();
  });

  it('disables and clears donor name when origin is purchased', () => {
    const donorNameControl = component.form.controls.donorName;

    component.form.controls.origin.setValue('DONATED');


    donorNameControl.setValue('Clínica VetAmigo');

    component.form.controls.origin.setValue('PURCHASED');


    expect(donorNameControl.disabled).toBeTrue();
    expect(donorNameControl.value).toBe('');
    expect(donorNameControl.hasError('required')).toBeFalse();
  });

   it('starts the entry date with today', () => {
     expect(component.form.controls.entryDate.value).toBe(component.today);
   });

   it('does not allow a future entry date', () => {
     const entryDateControl = component.form.controls.entryDate;

     entryDateControl.setValue('9999-12-31');
     entryDateControl.updateValueAndValidity();

     expect(entryDateControl.hasError('futureDate')).toBeTrue();
   });

   it('validates expiration date against the entry date', () => {
     component.form.controls.entryDate.setValue('2026-09-10');

     component.form.controls.expirationDate.setValue('2026-09-09');
     component.form.updateValueAndValidity();

     expect(component.form.hasError('expirationBeforeEntry')).toBeTrue();

     component.form.controls.expirationDate.setValue('2026-09-10');
     component.form.updateValueAndValidity();

     expect(component.form.hasError('expirationBeforeEntry')).toBeFalse();

     component.form.controls.expirationDate.setValue('2026-09-11');
     component.form.updateValueAndValidity();

     expect(component.form.hasError('expirationBeforeEntry')).toBeFalse();
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


    component.form.controls.quantity.setValue(10);
    component.form.controls.entryDate.setValue('2026-09-10');

    component.onSubmit();

    expect(navigate).toHaveBeenCalledWith(['/stock']);
  });

it('shows an error message when entry registration fails', () => {
  stockServiceSpy.registerEntry.and.returnValue(
    throwError(
      () =>
        new HttpErrorResponse({
          status: 500,
          statusText: 'Server Error',
        }),
    )
  );

  component.form.controls.stockItemId.setValue(1);
  component.form.controls.origin.setValue('PURCHASED');


  component.form.controls.quantity.setValue(10);
  component.form.controls.entryDate.setValue('2026-09-10');

  component.onSubmit();

  expect(component.saveError()).toBe(
    'Não foi possível registrar a entrada. Tente novamente.',
  );
});
it('shows an error message when stock items fail to load', () => {
  stockServiceSpy.list.and.returnValue(
    throwError(
      () =>
        new HttpErrorResponse({
          status: 500,
          statusText: 'Network Error',
        }),
    )
  );

  component.loadStockItems();

  expect(component.loadError()).toBe(
    'Não foi possível carregar os itens do estoque. Tente novamente.',
  );
});
});
