import { Component } from '@angular/core';

import { BrandPanelComponent } from '../brand-panel/brand-panel.component';

@Component({
  selector: 'app-auth-layout',
  imports: [BrandPanelComponent],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css',
})
export class AuthLayoutComponent {}
