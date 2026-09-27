import { Component } from '@angular/core';

interface BrandStat {
  value: string;
  label: string;
}

@Component({
  selector: 'app-brand-panel',
  imports: [],
  templateUrl: './brand-panel.component.html',
  styleUrl: './brand-panel.component.css',
})
export class BrandPanelComponent {
  readonly quote =
    'Cada gatinho tem uma história. Nós cuidamos de cada capítulo dela.';

  readonly stats: BrandStat[] = [
    { value: '312', label: 'Adoções realizadas' },
    { value: '47', label: 'Gatinhos sob cuidados' },
    { value: '18', label: 'Voluntários ativos' },
  ];
}
