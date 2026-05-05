import { Component, inject } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { TaskRxJSService } from '../../services/task-rxjs.service';
import { Filter } from '../../models/task.model';

@Component({
  selector: 'app-tasks-rxjs-page',
  imports: [AsyncPipe, ReactiveFormsModule],
  templateUrl: './tasks-rxjs-page.html',
  styleUrl: './tasks-rxjs-page.scss',
})
export class TasksRxjsPage {
  taskRxJSService = inject(TaskRxJSService);
  fb  = inject(FormBuilder);
  filters: Filter[] = ['all', 'active', 'completed'];

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]]
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.taskRxJSService.add(this.form.value.title!);
    this.form.reset();
  }
}
