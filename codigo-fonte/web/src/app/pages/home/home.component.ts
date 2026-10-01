import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/resources/auth.service';

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
export class HomeComponent {
  private readonly authService = inject(AuthService);

  readonly firstName = computed(() => {
    const name = this.authService.currentUser()?.name ?? '';
    return name.split(' ')[0];
  });

  readonly today = this.formatToday();

  // Mock data until the dashboard has real endpoints to back it (RF-014, Etapa 4).
  // Cats, medications, adoptions and the audit log don't exist in the backend yet — only the
  // greeting above and the room count/occupancy would be real once /cats and /rooms/{id}/... grow
  // the fields this needs. Replace each section as its data becomes available.
  readonly stats: StatCard[] = [
    { value: '47', label: 'Gatinhos ativos' },
    { value: '18', label: 'Disponíveis para adoção' },
    { value: '68%', label: 'Ocupação das salas' },
    { value: '3', label: 'Medicamentos em falta', tone: 'danger' },
  ];

  // "+ Novo gatinho" is a real link (see the template) — it's the only one of the four whose form
  // and backend exist today.
  readonly quickActions = [
    '+ Nova prescrição',
    '+ Registrar dose',
    '+ Nova adoção',
  ];

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
    {
      date: 'Hoje',
      text: 'Estoque baixo — Doramectina injetável, 0 unidades',
      tone: 'danger',
    },
  ];

  readonly roomOccupancy: RoomOccupancy[] = [
    {
      name: 'Saudáveis — Adultos',
      occupied: 14,
      capacity: 16,
      tone: 'primary',
    },
    { name: 'FIV — Adultos', occupied: 8, capacity: 12, tone: 'primary' },
    { name: 'Observação Intensiva', occupied: 7, capacity: 8, tone: 'gold' },
  ];

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
}
