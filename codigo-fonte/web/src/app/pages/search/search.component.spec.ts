import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { Cat, PagedResult as CatPagedResult } from '../../models/cat.model';
import { StockItem } from '../../models/stock.model';
import { User } from '../../models/user.model';
import { CatService } from '../../services/resources/cat.service';
import { StockService } from '../../services/resources/stock.service';
import { UserService } from '../../services/resources/user.service';
import { SearchComponent } from './search.component';

describe('SearchComponent (unit)', () => {
  let fixture: ComponentFixture<SearchComponent>;
  let component: SearchComponent;
  let catServiceSpy: jasmine.SpyObj<CatService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let stockServiceSpy: jasmine.SpyObj<StockService>;

  function aCat(overrides: Partial<Cat> = {}): Cat {
    return {
      id: 1,
      name: 'Nina',
      photoUrl: null,
      roomId: 2,
      roomTitle: 'Sala FIV',
      sex: 'Female',
      estimatedBirthDate: '2022-09-01',
      ageGroup: 'Adult',
      coat: 'Tricolor',
      weightKg: 4.1,
      characteristics: null,
      generalStatus: 'InClinic',
      healthStatus: 'Fiv',
      fivFelvExamDate: null,
      pifResult: 'NotTested',
      pifExamDate: null,
      severity: null,
      neuteringStatus: null,
      neuteringDate: null,
      microchip: null,
      rescueDate: null,
      foundConditions: null,
      sponsorName: null,
      sponsorPhone: null,
      sponsorFunding: null,
      createdAt: '2026-01-01T00:00:00',
      ...overrides,
    } as Cat;
  }

  function aUser(overrides: Partial<User> = {}): User {
    return {
      id: 7,
      fullName: 'Camila Andrade',
      email: 'camila@amicats.org.br',
      phoneNumber: null,
      imageUrl: null,
      accessType: 'Administrator',
      crmv: null,
      ufCrmv: null,
      active: true,
      createdAt: '2026-01-01T00:00:00',
      ...overrides,
    } as User;
  }

  function aStockItem(overrides: Partial<StockItem> = {}): StockItem {
    return {
      id: 9,
      name: 'Amoxicilina',
      category: 'Antibiótico',
      quantity: 5,
      status: 'Low',
      expirationDate: null,
      unit: 'comprimidos',
      notes: null,
      ...overrides,
    };
  }

  function pagedCats(content: Cat[]): CatPagedResult<Cat> {
    return { content, page: 0, size: 50, totalElements: content.length, totalPages: 1 };
  }

  function pagedUsers(content: User[]) {
    return { content, page: 0, size: 50, totalElements: content.length, totalPages: 1 };
  }

  function pagedStock(content: StockItem[]) {
    return { content, page: 0, size: 50, totalElements: content.length, totalPages: 1 };
  }

  beforeEach(async () => {
    catServiceSpy = jasmine.createSpyObj<CatService>('CatService', ['list', 'photo']);
    userServiceSpy = jasmine.createSpyObj<UserService>('UserService', ['list', 'photo']);
    stockServiceSpy = jasmine.createSpyObj<StockService>('StockService', ['list']);

    catServiceSpy.photo.and.returnValue(of(new Blob()));
    userServiceSpy.photo.and.returnValue(of(new Blob()));

    await TestBed.configureTestingModule({
      imports: [SearchComponent],
      providers: [
        provideRouter([]),
        { provide: CatService, useValue: catServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: StockService, useValue: stockServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not call any service while the search box is empty', () => {
    expect(catServiceSpy.list).not.toHaveBeenCalled();
    expect(userServiceSpy.list).not.toHaveBeenCalled();
    expect(stockServiceSpy.list).not.toHaveBeenCalled();
  });

  it('searches cats, users and stock in parallel after debouncing input', fakeAsync(() => {
    catServiceSpy.list.and.returnValue(of(pagedCats([aCat()])));
    userServiceSpy.list.and.returnValue(of(pagedUsers([aUser()])));
    stockServiceSpy.list.and.returnValue(of(pagedStock([aStockItem()])));

    component.onSearch({ target: { value: 'nina' } } as unknown as Event);
    tick(299);
    expect(catServiceSpy.list).not.toHaveBeenCalled();

    tick(1);
    expect(catServiceSpy.list).toHaveBeenCalledWith({ search: 'nina', page: 0, size: 50 });
    expect(userServiceSpy.list).toHaveBeenCalledWith({ search: 'nina', page: 0, size: 50 });
    expect(stockServiceSpy.list).toHaveBeenCalledWith({ search: 'nina', page: 0, size: 50 });

    expect(component.cats()).toEqual([aCat()]);
    expect(component.users()).toEqual([aUser()]);
    expect(component.stockItems()).toEqual([aStockItem()]);
    // 1 cat + 1 "Prontuário" (mirrors the cat) + 1 user + 1 stock item.
    expect(component.totalCount).toBe(4);
  }));

  it('builds the combined "Todos" results list across all types, including the mirrored "Prontuário" entries', fakeAsync(() => {
    catServiceSpy.list.and.returnValue(of(pagedCats([aCat()])));
    userServiceSpy.list.and.returnValue(of(pagedUsers([aUser()])));
    stockServiceSpy.list.and.returnValue(of(pagedStock([aStockItem()])));

    component.onSearch({ target: { value: 'a' } } as unknown as Event);
    tick(300);

    expect(component.results.map((r) => r.type)).toEqual(['cat', 'record', 'user', 'stock']);
  }));

  it('filters results by the selected tab', fakeAsync(() => {
    catServiceSpy.list.and.returnValue(of(pagedCats([aCat()])));
    userServiceSpy.list.and.returnValue(of(pagedUsers([aUser()])));
    stockServiceSpy.list.and.returnValue(of(pagedStock([aStockItem()])));

    component.onSearch({ target: { value: 'a' } } as unknown as Event);
    tick(300);

    component.selectTab('cats');
    expect(component.results.map((r) => r.type)).toEqual(['cat']);

    component.selectTab('records');
    expect(component.results.map((r) => r.type)).toEqual(['record']);
    expect(component.results[0].title).toBe('Prontuário — Nina');

    component.selectTab('stock');
    expect(component.results.map((r) => r.type)).toEqual(['stock']);
  }));

  it('treats a failing category as empty instead of breaking the whole search', fakeAsync(() => {
    catServiceSpy.list.and.returnValue(of(pagedCats([aCat()])));
    userServiceSpy.list.and.returnValue(throwError(() => new Error('403')));
    stockServiceSpy.list.and.returnValue(of(pagedStock([aStockItem()])));

    component.onSearch({ target: { value: 'a' } } as unknown as Event);
    tick(300);

    expect(component.cats()).toEqual([aCat()]);
    expect(component.users()).toEqual([]);
    expect(component.stockItems()).toEqual([aStockItem()]);
  }));

  it('clears results when the search box is cleared', fakeAsync(() => {
    catServiceSpy.list.and.returnValue(of(pagedCats([aCat()])));
    userServiceSpy.list.and.returnValue(of(pagedUsers([])));
    stockServiceSpy.list.and.returnValue(of(pagedStock([])));

    component.onSearch({ target: { value: 'nina' } } as unknown as Event);
    tick(300);
    expect(component.cats().length).toBe(1);

    component.onSearch({ target: { value: '' } } as unknown as Event);
    tick(300);
    expect(component.cats()).toEqual([]);
    expect(component.searchTerm()).toBe('');
  }));

  it('navigates to the cat ficha when a cat result is opened', fakeAsync(() => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    catServiceSpy.list.and.returnValue(of(pagedCats([aCat()])));
    userServiceSpy.list.and.returnValue(of(pagedUsers([])));
    stockServiceSpy.list.and.returnValue(of(pagedStock([])));

    component.onSearch({ target: { value: 'nina' } } as unknown as Event);
    tick(300);

    component.openResult(component.results[0]);

    expect(navigate).toHaveBeenCalledWith(['/cats', 1]);
  }));

  it('navigates to the medical record when a "Prontuário" result is opened', fakeAsync(() => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    catServiceSpy.list.and.returnValue(of(pagedCats([aCat()])));
    userServiceSpy.list.and.returnValue(of(pagedUsers([])));
    stockServiceSpy.list.and.returnValue(of(pagedStock([])));

    component.onSearch({ target: { value: 'nina' } } as unknown as Event);
    tick(300);

    component.selectTab('records');
    component.openResult(component.results[0]);

    expect(navigate).toHaveBeenCalledWith(['/medical-records', 1]);
  }));

  it('navigates to the user edit form when a user result is opened', fakeAsync(() => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    catServiceSpy.list.and.returnValue(of(pagedCats([])));
    userServiceSpy.list.and.returnValue(of(pagedUsers([aUser()])));
    stockServiceSpy.list.and.returnValue(of(pagedStock([])));

    component.onSearch({ target: { value: 'camila' } } as unknown as Event);
    tick(300);

    component.openResult(component.results[0]);

    expect(navigate).toHaveBeenCalledWith(['/users', 7, 'edit']);
  }));

  it('does not navigate when a stock result is opened', fakeAsync(() => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    catServiceSpy.list.and.returnValue(of(pagedCats([])));
    userServiceSpy.list.and.returnValue(of(pagedUsers([])));
    stockServiceSpy.list.and.returnValue(of(pagedStock([aStockItem()])));

    component.onSearch({ target: { value: 'amox' } } as unknown as Event);
    tick(300);

    component.openResult(component.results[0]);

    expect(navigate).not.toHaveBeenCalled();
  }));
});
