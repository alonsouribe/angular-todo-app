import { Injectable } from '@angular/core';
import { Task, Filter } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  tasks: Task[]  = [];
  filter: Filter = 'all';
  private nextId = 1;

  get filteredTasks(): Task[] {
    if (this.filter === 'active') {
      return this.tasks.filter(task => !task.completed);
    }
    if (this.filter === 'completed') {
      return this.tasks.filter(task =>  task.completed);
    }
    return this.tasks;
  }

  get total(): number {
    return this.tasks.length;
  }

  get active(): number {
    return this.tasks.filter(task => !task.completed).length;
  }

  get completed(): number {
    return this.tasks.filter(task =>  task.completed).length
  }

  add(title: string): void {
    this.tasks.push({
      id: this.nextId++,
      title: title,
      completed: false
    });
  }

  toggle(id: number): void {
    const task = this.tasks.find(task => task.id === id);
    if (task) {
      task.completed = !task.completed;
    }
  }

  remove(id: number): void {
    this.tasks = this.tasks.filter(task => task.id !== id);
  }

  setFilter(filter: Filter): void {
    this.filter = filter;
  }
}
