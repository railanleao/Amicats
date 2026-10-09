import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import {
  MEDICATION_CATEGORY,
  StockItem,
} from '../../../models/stock.model';
import { StockService } from '../../../services/resources/stock.service';
import { StockEntryNewItemComponent } from './stock-entry-new-item.component';

describe('StockEntryNewItemComponent', () => {
  let fixture: ComponentFixture<StockEntryNewItemComponent>;
  let component: StockEntryNewItemComponent;
  let stockServiceSpy: jasmine.SpyObj<StockService>;

  beforeEach(async () => {
    stockServiceSpy = jasmine.createSpyObj<StockService>(
      'StockService',
      ['create'],
    );

    await TestBed.configureTestingModule({
      imports: [StockEntryNewItemComponent],
      providers: [
        {
          provide: StockService,
          useValue: stockServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StockEntryNewItemComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('name', 'Dipirona 500mg');
    fixture.detectChanges();
  });

  it('creates a new medication with zero quantity', () => {
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

    stockServiceSpy.create.and.returnValue(of(createdItem));

    const createdSpy = spyOn(component.created, 'emit');

    component.unitControl.setValue('  frascos  ');
    component.create();

    expect(stockServiceSpy.create).toHaveBeenCalledOnceWith({
      name: 'Dipirona 500mg',
      category: MEDICATION_CATEGORY,
      quantity: 0,
      unit: 'frascos',
      notes: null,
    });

    expect(createdSpy).toHaveBeenCalledOnceWith(createdItem);
  });

  it('does not create a medication when the unit is blank', () => {
    component.unitControl.setValue('   ');

    component.create();

    expect(stockServiceSpy.create).not.toHaveBeenCalled();
    expect(component.unitControl.hasError('required')).toBeTrue();
  });
});
