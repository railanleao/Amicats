import {
  Component,
  DestroyRef,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  of,
} from 'rxjs';

import { CatAvatarComponent } from '../../components/cat-avatar/cat-avatar.component';
import { UserAvatarComponent } from '../../components/user-avatar/user-avatar.component';
import {
  AGE_GROUP_LABELS,
  Cat,
  HEALTH_STATUS_LABELS,
  SEX_LABELS,
} from '../../models/cat.model';
import {
  ACCESS_TYPE_LABELS,
  PagedResult,
  User,
} from '../../models/user.model';
import {
  STOCK_STATUS_LABELS,
  StockItem,
} from '../../models/stock.model';
import { CatService } from '../../services/resources/cat.service';
import { StockService } from '../../services/resources/stock.service';
import { UserService } from '../../services/resources/user.service';

const SEARCH_DEBOUNCE_MS = 300;
const RESULTS_PAGE_SIZE = 50;

type ResultTab = 'all' | 'cats' | 'records' | 'users' | 'stock';

interface SearchResult {
  type: 'cat' | 'record' | 'user' | 'stock';
  id: number;
  title: string;
  subtitle: string;
  cat?: Cat;
  user?: User;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CatAvatarComponent, UserAvatarComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnDestroy {
  private readonly catService = inject(CatService);
  private readonly userService = inject(UserService);
  private readonly stockService = inject(StockService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchInput$ = new Subject<string>();

  readonly searchTerm = signal('');
  readonly loading = signal(false);
  readonly activeTab = signal<ResultTab>('all');

  readonly cats = signal<Cat[]>([]);
  readonly users = signal<User[]>([]);
  readonly stockItems = signal<StockItem[]>([]);

  constructor() {
    this.searchInput$
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((term) => this.runSearch(term));
  }

  ngOnDestroy(): void {
    this.searchInput$.complete();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchInput$.next(input.value);
  }

  selectTab(tab: ResultTab): void {
    this.activeTab.set(tab);
  }

  // "Prontuário" results mirror the cats search one-for-one (see `results` below). They're
  // deliberately left out of the total/"Todos" so each cat isn't counted or shown twice —
  // Prontuários only appears as its own tab.
  get totalCount(): number {
    return this.cats().length + this.users().length + this.stockItems().length;
  }

  get results(): SearchResult[] {
    const catResults: SearchResult[] = this.cats().map((cat) => ({
      type: 'cat',
      id: cat.id,
      title: cat.name,
      subtitle: this.catSubtitle(cat),
      cat,
    }));

    // "Prontuário" isn't a separate backend entity — every cat has one clinical record, so this
    // reuses the same cats search and just points each result at /medical-records instead.
    const recordResults: SearchResult[] = this.cats().map((cat) => ({
      type: 'record',
      id: cat.id,
      title: `Prontuário — ${cat.name}`,
      subtitle: this.catSubtitle(cat),
      cat,
    }));

    const userResults: SearchResult[] = this.users().map((user) => ({
      type: 'user',
      id: user.id,
      title: user.fullName,
      subtitle: `${user.email} · ${ACCESS_TYPE_LABELS[user.accessType]}`,
      user,
    }));

    const stockResults: SearchResult[] = this.stockItems().map((item) => ({
      type: 'stock',
      id: item.id,
      title: item.name,
      subtitle: this.stockSubtitle(item),
    }));

    switch (this.activeTab()) {
      case 'cats':
        return catResults;
      case 'records':
        return recordResults;
      case 'users':
        return userResults;
      case 'stock':
        return stockResults;
      default:
        // Prontuários are excluded here on purpose — see the totalCount comment above.
        return [...catResults, ...userResults, ...stockResults];
    }
  }

  openResult(result: SearchResult): void {
    if (result.type === 'cat') {
      void this.router.navigate(['/cats', result.id]);
    } else if (result.type === 'record') {
      void this.router.navigate(['/medical-records', result.id]);
    } else if (result.type === 'user') {
      void this.router.navigate(['/users', result.id, 'edit']);
    }
    // Stock items have no dedicated page yet — not navigable.
  }

  private runSearch(term: string): void {
    const trimmed = term.trim();
    this.searchTerm.set(trimmed);

    if (!trimmed) {
      this.cats.set([]);
      this.users.set([]);
      this.stockItems.set([]);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);

    forkJoin({
      cats: this.catService
        .list({ search: trimmed, page: 0, size: RESULTS_PAGE_SIZE })
        .pipe(catchError(() => of(this.emptyPage<Cat>()))),
      users: this.userService
        .list({ search: trimmed, page: 0, size: RESULTS_PAGE_SIZE })
        .pipe(catchError(() => of(this.emptyPage<User>()))),
      stock: this.stockService
        .list({ search: trimmed, page: 0, size: RESULTS_PAGE_SIZE })
        .pipe(catchError(() => of(this.emptyPage<StockItem>()))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ cats, users, stock }) => {
        this.cats.set(cats.content);
        this.users.set(users.content);
        this.stockItems.set(stock.content);
        this.loading.set(false);
      });
  }

  private emptyPage<T>(): PagedResult<T> {
    return { content: [], page: 0, size: RESULTS_PAGE_SIZE, totalElements: 0, totalPages: 0 };
  }

  private catSubtitle(cat: Cat): string {
    const parts = [
      cat.roomTitle ?? (cat.generalStatus === 'TemporaryHome' ? 'Lar temporário' : '—'),
      cat.sex ? SEX_LABELS[cat.sex] : null,
      cat.ageGroup ? AGE_GROUP_LABELS[cat.ageGroup] : null,
      cat.healthStatus !== 'Healthy' && cat.healthStatus !== 'NotTested'
        ? HEALTH_STATUS_LABELS[cat.healthStatus]
        : null,
    ];
    return parts.filter(Boolean).join(' · ');
  }

  private stockSubtitle(item: StockItem): string {
    return `${item.category} · ${item.quantity} ${item.unit} · ${STOCK_STATUS_LABELS[item.status]}`;
  }
}
