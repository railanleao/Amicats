import { STOCK_CATEGORIES } from '../../models/stock-category.model';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
  Router,
} from '@angular/router';
import { of, throwError } from 'rxjs';

import { StockItem } from '../../models/stock.model';
import { StockService } from '../../services/resources/stock.service';
import { StockFormComponent } from './stock-form.component';

describe('StockFormComponent', () => {
  let fixture: ComponentFixture<StockFormComponent>;
  let component: StockFormComponent;
  let stockServiceSpy: jasmine.SpyObj<StockService>;

  let activatedRouteStub: {
    snapshot: {
      paramMap: ReturnType<typeof convertToParamMap>;
    };
  };

  const item: StockItem = {
    id: 1,
    name: 'Amoxicilina 250mg',
    category: 'Antibiótico',
    quantity: 42,
    status: 'Normal',
    expirationDate: '2027-03-01',
    unit: 'unidades',
    notes: 'Estoque atual',
  };

  beforeEach(async () => {
    stockServiceSpy = jasmine.createSpyObj<StockService>('StockService', [
      'findById',
      'update',
    ]);

    stockServiceSpy.findById.and.returnValue(of(item));

    activatedRouteStub = {
      snapshot: {
        paramMap: convertToParamMap({ id: '1' }),
      },
    };

    await TestBed.configureTestingModule({
      imports: [StockFormComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
        {
          provide: StockService,
          useValue: stockServiceSpy,
        },
      ],
    }).compileComponents();

    createComponent();
  });

function createComponent(): void {
  fixture = TestBed.createComponent(StockFormComponent);
  component = fixture.componentInstance;
  fixture.detectChanges();
}

  it('creates the stock form component', () => {
    expect(component).toBeTruthy();
  });

  it('loads the stock item using the route id', () => {
    expect(stockServiceSpy.findById).toHaveBeenCalledOnceWith(1);
    expect(component.item()).toEqual(item);
  });

  it('fills the form with the stock item data', () => {
    expect(component.form.getRawValue()).toEqual({
      name: 'Amoxicilina 250mg',
      category: 'Antibiótico',
      unit: 'unidades',
      notes: 'Estoque atual',
    });
  });


  it('keeps the current category available when it is not in the default list', () => {
    expect(component.stockCategories).toEqual([
      item.category,
      ...STOCK_CATEGORIES,
    ]);

    expect(component.stockCategories).toContain('Antibiótico');
    expect(component.stockCategories).toContain('Medicamento');
  });

  it('updates the item while preserving its quantity', () => {
    const navigate = spyOn(
      TestBed.inject(Router),
      'navigate',
    ).and.resolveTo(true);

    stockServiceSpy.update.and.returnValue(of(item));

    component.form.setValue({
      name: '  Amoxicilina atualizada  ',
      category: 'Antibiótico',
      unit: '  comprimidos  ',
      notes: '  Nova observação  ',
    });

    component.save();

    expect(stockServiceSpy.update).toHaveBeenCalledOnceWith(item.id, {
      name: 'Amoxicilina atualizada',
      category: 'Antibiótico',
      quantity: item.quantity,
      unit: 'comprimidos',
      notes: 'Nova observação',
    });

    expect(navigate).toHaveBeenCalledWith(['/stock']);
  });

  it('sends null when notes is empty', () => {
    stockServiceSpy.update.and.returnValue(of(item));

    component.form.setValue({
      name: 'Amoxicilina 250mg',
      category: 'Antibiótico',
      unit: 'unidades',
      notes: '   ',
    });

    component.save();

    expect(stockServiceSpy.update).toHaveBeenCalledWith(
      item.id,
      jasmine.objectContaining({
        notes: null,
      }),
    );
  });

  it('does not update when the form is invalid', () => {
    component.form.controls.name.setValue('');

    component.save();

    expect(stockServiceSpy.update).not.toHaveBeenCalled();
    expect(component.form.controls.name.touched).toBeTrue();
  });

  it('does not update while already saving', () => {
    component.saving.set(true);

    component.save();

    expect(stockServiceSpy.update).not.toHaveBeenCalled();
  });

  it('shows an error when the item fails to load', () => {
    stockServiceSpy.findById.and.returnValue(
      throwError(() => new Error('network error')),
    );

    createComponent();

    expect(component.loadError()).toBe(
      'Não foi possível carregar o item do estoque. Tente novamente.',
    );
  });

  it('shows an error when the route id is invalid', () => {
    activatedRouteStub.snapshot.paramMap = convertToParamMap({ id: '0' });
    stockServiceSpy.findById.calls.reset();

    createComponent();

    expect(component.loadError()).toBe('Item de estoque inválido.');
    expect(stockServiceSpy.findById).not.toHaveBeenCalled();
  });

  it('shows an error when the update fails', () => {
    stockServiceSpy.update.and.returnValue(
      throwError(() => new Error('server error')),
    );

    component.save();

    expect(component.saveError()).toBe(
      'Não foi possível salvar as alterações. Tente novamente.',
    );
  });
});
