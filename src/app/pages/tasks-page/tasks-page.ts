import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { TaskService } from '../../services/task.service';
import { Filter } from '../../models/task.model';

@Component({
  selector: 'app-tasks-page',
  imports: [ReactiveFormsModule],
  templateUrl: './tasks-page.html',
  styleUrl: './tasks-page.scss',
})
export class TasksPage {
  taskService = inject(TaskService);
  formBuilder  = inject(FormBuilder);
  filters: Filter[] = ['all', 'active', 'completed'];

  form = this.formBuilder.group({
    title: ['', [Validators.required, Validators.minLength(3)]]
  });

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    this.taskService.add(this.form.value.title!);
    this.form.reset();
  }
}
