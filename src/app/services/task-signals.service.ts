import { Injectable, signal, computed } from '@angular/core';
import { Task, Filter } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskSignalsService {
  private tasks  = signal<Task[]>([]);
  private nextId = 1;

  filter = signal<Filter>('all');

  filteredTasks = computed(() => {
    const filter = this.filter();
    const tasks = this.tasks();
    if (filter === 'active') {
      return tasks.filter(task => !task.completed);
    }
    if (filter === 'completed') {
      return tasks.filter(task =>  task.completed);
    }
    return tasks;
  });

  total = computed(() => this.tasks().length);
  active = computed(() => this.tasks().filter(task => !task.completed).length);
  completed = computed(() => this.tasks().filter(task =>  task.completed).length);

  add(title: string): void {
    this.tasks.update(list => [
      ...list,
      {
        id: this.nextId++,
        title: title,
        completed: false
      }
    ]);
  }

  toggle(id: number): void {
    this.tasks.update(list =>
      list.map(task => task.id === id ? {
        ...task,
        completed:
        !task.completed
      } : task)
    );
  }

  remove(id: number): void {
    this.tasks.update(list => list.filter(task => task.id !== id));
  }

  setFilter(filter: Filter): void {
    this.filter.set(filter);
  }
}
