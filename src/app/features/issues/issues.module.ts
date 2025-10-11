import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { IssuesComponent } from './issues.component';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';

const routes: Routes = [
  {
    path: '',
    component: IssuesComponent,
  },
];

@NgModule({
  declarations: [IssuesComponent],
  imports: [CommonModule, SafeUrlPipe, RouterModule.forChild(routes)],
})
export class IssuesModule {}
