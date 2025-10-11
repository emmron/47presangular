import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { LayoutHeaderComponent } from './components/header/layout-header.component';
import { LayoutNavComponent } from './components/nav/layout-nav.component';
import { LayoutFooterComponent } from './components/footer/layout-footer.component';

@NgModule({
  declarations: [
    LayoutComponent,
    LayoutHeaderComponent,
    LayoutNavComponent,
    LayoutFooterComponent
  ],
  imports: [CommonModule, RouterModule],
  exports: [LayoutComponent]
})
export class LayoutModule {}
