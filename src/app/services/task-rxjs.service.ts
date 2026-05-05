import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { Task, Filter } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskRxJSService {
  private tasks$  = new BehaviorSubject<Task[]>([]);
  private filter$ = new BehaviorSubject<Filter>('all');
  private nextId  = 1;

  filteredTasks$ = combineLatest([this.tasks$, this.filter$]).pipe(
    map(([tasks, filter]) => {
      if (filter === 'active') {
        return tasks.filter(task => !task.completed);
      }
      if (filter === 'completed') {
        return tasks.filter(task =>  task.completed);
      }
      return tasks;
    })
  );

  total$ = this.tasks$.pipe(map(task => task.length));
  active$ = this.tasks$.pipe(map(task => task.filter(task => !task.completed).length));
  completed$ = this.tasks$.pipe(map(task => task.filter(task =>  task.completed).length));
  filter = this.filter$;

  add(title: string): void {
    const current = this.tasks$.value;
    this.tasks$.next([
      ...current,
      {
        id: this.nextId++,
        title: title,
        completed: false
       }
    ]);
  }

  toggle(id: number): void {
    const current = this.tasks$.value;
    this.tasks$.next(
      current.map(task => task.id === id ? {
        ...task,
        completed: !task.completed
      } : task)
    );
  }

  remove(id: number): void {
    const current = this.tasks$.value;
    this.tasks$.next(current.filter(task => task.id !== id));
  }

  setFilter(filter: Filter): void {
    this.filter$.next(filter);
  }
}
