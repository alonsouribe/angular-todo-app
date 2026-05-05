import { Routes } from '@angular/router';
import { TasksPage } from './pages/tasks-page/tasks-page';
import { TasksRxjsPage } from './pages/tasks-rxjs-page/tasks-rxjs-page';
import { TasksSignalsPage } from './pages/tasks-signals-page/tasks-signals-page';

export const routes: Routes = [
  { path: '', redirectTo: 'tasks', pathMatch: 'full' },
  { path: 'tasks', component: TasksPage },
  { path: 'rxjs', component: TasksRxjsPage },
  { path: 'signals', component: TasksSignalsPage }
];
