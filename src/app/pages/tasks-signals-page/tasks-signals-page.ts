import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { TaskSignalsService } from '../../services/task-signals.service';
import { Filter } from '../../models/task.model';

@Component({
  selector: 'app-tasks-signals-page',
  imports: [ReactiveFormsModule],
  templateUrl: './tasks-signals-page.html',
  styleUrl: './tasks-signals-page.scss',
})
export class TasksSignalsPage {
  taskSignalsService = inject(TaskSignalsService);
  formBuilder  = inject(FormBuilder);
  filters: Filter[] = ['all', 'active', 'completed'];

  form = this.formBuilder.group({
    title: ['', [Validators.required, Validators.minLength(3)]]
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.taskSignalsService.add(this.form.value.title!);
    this.form.reset();
  }
}
