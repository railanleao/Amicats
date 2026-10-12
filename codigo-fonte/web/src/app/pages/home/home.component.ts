import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';

import { Cat } from '../../models/cat.model';
import { Room } from '../../models/room.model';
import { AuthService } from '../../services/resources/auth.service';
import { CatService } from '../../services/resources/cat.service';
import { RoomService } from '../../services/resources/room.service';
import { StockService } from '../../services/resources/stock.service';

interface StatCard {
  value: string;
  label: string;
  tone?: 'danger';
}

interface Reminder {
  date: string;
  text: string;
  tone: 'sky' | 'primary' | 'gold' | 'danger';
}

interface RoomOccupancy {
  name: string;
  occupied: number;
  capacity: number;
  tone: 'primary' | 'gold';
}

interface ActivityEntry {
  date: string;
  relative: string;
  userName: string;
  tag: string;
  subject: string;
  change: string;
}

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' });
const DAY_FORMATTER = new Intl.DateTimeFormat('pt-BR', { day: 'numeric' });
const MONTH_FORMATTER = new Intl.DateTimeFormat('pt-BR', { month: 'long' });
const YEAR_FORMATTER = new Intl.DateTimeFormat('pt-BR', { year: 'numeric' });

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly catService = inject(CatService);
  private readonly roomService = inject(RoomService);
  private readonly stockService = inject(StockService);
  private readonly destroyRef = inject(DestroyRef);

  readonly firstName = computed(() => {
    const name = this.authService.currentUser()?.name ?? '';
    return name.split(' ')[0];
  });

  readonly today = this.formatToday();

  // Real: backed by /cats, /rooms and /stock (all added this round). Shows "—" placeholders
  // until the first load resolves, same idea as a loading skeleton without the extra markup.
  readonly stats = signal<StatCard[]>([
    { value: '—', label: 'Gatinhos ativos' },
    { value: '—', label: 'Disponíveis para adoção' },
    { value: '—', label: 'Ocupação das salas' },
    { value: '—', label: 'Medicamentos em falta' },
  ]);

  readonly roomOccupancy = signal<RoomOccupancy[]>([]);

  // The one danger reminder is real (derived from /stock); the other three stay mocked because
  // vaccines, castrations and prescriptions don't have a backend yet (outside this round's scope).
  readonly stockReminder = signal<Reminder | null>(null);

  // "+ Novo gatinho" is a real link (see the template) — it's the only one of the four whose form
  // and backend exist today.
  readonly quickActions = [
    '+ Nova prescrição',
    '+ Registrar dose',
    '+ Nova adoção',
  ];

  // Mock: no vaccine/castration/prescription-schedule entity exists yet.
  readonly reminders: Reminder[] = [
    {
      date: '12/09',
      text: 'Vacina antirrábica agendada — Tobias',
      tone: 'sky',
    },
    { date: '15/09', text: 'Castração agendada — Zeca', tone: 'primary' },
    {
      date: '18/09',
      text: 'Renovar prescrição — Interferon felino (Nina)',
      tone: 'gold',
    },
  ];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  // Mock: no audit-log entity exists yet.
  readonly activity: ActivityEntry[] = [
    {
      date: '10/09 · 14:32',
      relative: 'há 12 minutos',
      userName: 'Juliana Torres',
      tag: 'Prontuário',
      subject: 'Nina',
      change: 'Registrou reavaliação de FIV e prescreveu Interferon felino',
    },
    {
      date: '10/09 · 11:05',
      relative: 'hoje',
      userName: 'Camila Andrade',
      tag: 'Adoções',
      subject: 'Mia',
      change: 'Registrou nova adoção com Patrícia Nunes',
    },
    {
      date: '09/09 · 17:48',
      relative: 'ontem',
      userName: 'Pedro Henrique Lima',
      tag: 'Medicações',
      subject: 'Zeca',
      change: 'Aplicou dose de Meloxicam 0,3 ml',
    },
    {
      date: '08/09 · 09:20',
      relative: 'há 2 dias',
      userName: 'Rafael Nogueira',
      tag: 'Gatinhos',
      subject: 'Bento',
      change: 'Atualizou estado de saúde — PIF negativo',
    },
    {
      date: '07/09 · 16:12',
      relative: 'há 3 dias',
      userName: 'Camila Andrade',
      tag: 'Salas',
      subject: 'Observação Intensiva',
      change: 'Transferiu Luna para a sala FIV — Adultos',
    },
    {
      date: '05/09 · 08:40',
      relative: 'há 5 dias',
      userName: 'Fernanda Lima',
      tag: 'Estoque',
      subject: 'Doramectina injetável',
      change: 'Registrou entrada de 20 unidades',
    },
  ];

  occupancyPercent(room: RoomOccupancy): number {
    return Math.round((room.occupied / room.capacity) * 100);
  }

  initialsOf(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return '?';
    }
    const first = parts[0][0];
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  private formatToday(): string {
    const now = new Date();
    const weekday = WEEKDAY_FORMATTER.format(now);
    const capitalizedWeekday =
      weekday.charAt(0).toUpperCase() + weekday.slice(1);
    return `${capitalizedWeekday}, ${DAY_FORMATTER.format(now)} de ${MONTH_FORMATTER.format(now)} de ${YEAR_FORMATTER.format(now)}`;
  }

  private loadDashboardData(): void {
    forkJoin({
      total: this.countCats(),
      available: this.countCats({ generalStatus: 'AvailableForAdoption' }),
      adopted: this.countCats({ generalStatus: 'Adopted' }),
      deceased: this.countCats({ generalStatus: 'Deceased' }),
      // size: 100 matches the "fetch every active room" convention used elsewhere (cat-form,
      // transfer-room) rather than true pagination — fine while a shelter realistically stays
      // under 100 active rooms, but occupancy would silently undercount past that.
      activeRooms: this.roomService.list({ active: true, page: 0, size: 100 }).pipe(
        map((page) => page.content),
        catchError(() => of<Room[]>([])),
      ),
      stockLow: this.stockService
        .list({ status: 'Low', page: 0, size: 5 })
        .pipe(catchError(() => of({ content: [], totalElements: 0 }))),
      stockOut: this.stockService
        .list({ status: 'OutOfStock', page: 0, size: 5 })
        .pipe(catchError(() => of({ content: [], totalElements: 0 }))),
    })
      .pipe(
        switchMap((base) =>
          this.roomOccupancies(base.activeRooms).pipe(
            map((occupancies) => ({ ...base, occupancies })),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ total, available, adopted, deceased, stockLow, stockOut, occupancies }) => {
        const activeCats = Math.max(total - adopted - deceased, 0);
        const totalCapacity = occupancies.reduce((sum, room) => sum + room.capacity, 0);
        const totalOccupied = occupancies.reduce((sum, room) => sum + room.occupied, 0);
        const occupancyPercent =
          totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
        const lowStockCount = stockLow.totalElements + stockOut.totalElements;

        this.stats.set([
          { value: String(activeCats), label: 'Gatinhos ativos' },
          { value: String(available), label: 'Disponíveis para adoção' },
          { value: `${occupancyPercent}%`, label: 'Ocupação das salas' },
          {
            value: String(lowStockCount),
            label: 'Medicamentos em falta',
            tone: lowStockCount > 0 ? 'danger' : undefined,
          },
        ]);

        this.roomOccupancy.set(
          [...occupancies]
            .sort((a, b) => b.occupied / b.capacity - a.occupied / a.capacity)
            .slice(0, 3),
        );

        const urgentItem = stockOut.content[0] ?? stockLow.content[0];
        this.stockReminder.set(
          urgentItem
            ? {
                date: 'Hoje',
                text: `Estoque baixo — ${urgentItem.name}, ${urgentItem.quantity} ${urgentItem.unit}`,
                tone: 'danger',
              }
            : null,
        );
      });
  }

  private countCats(filter: { generalStatus?: Cat['generalStatus'] } = {}): Observable<number> {
    return this.catService.list({ ...filter, page: 0, size: 1 }).pipe(
      map((page) => page.totalElements),
      catchError(() => of(0)),
    );
  }

  private roomOccupancies(rooms: Room[]): Observable<RoomOccupancy[]> {
    const withCapacity = rooms.filter((room) => (room.maxCapacity ?? 0) > 0);
    if (withCapacity.length === 0) {
      return of([]);
    }

    return forkJoin(
      withCapacity.map((room) =>
        this.catService.list({ roomId: room.id, page: 0, size: 1 }).pipe(
          map((page) => page.totalElements),
          catchError(() => of(0)),
          map((occupied) => {
            const capacity = room.maxCapacity as number;
            return {
              name: room.title,
              occupied,
              capacity,
              tone: (occupied / capacity >= 0.85 ? 'gold' : 'primary') as 'primary' | 'gold',
            };
          }),
        ),
      ),
    );
  }
}
