import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { TaskRxJSService } from './task-rxjs.service';

describe('TaskRxJSService', () => {
  let service: TaskRxJSService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskRxJSService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start empty', async () => {
    expect(await firstValueFrom(service.total$)).toBe(0);
  });

  it('should add a task', async () => {
    service.add('Comprar leche');
    const tasks = await firstValueFrom(service.filteredTasks$);
    expect(tasks.length).toBe(1);
    expect(tasks[0].title).toBe('Comprar leche');
  });

  it('should start task as not completed', async () => {
    service.add('Comprar leche');
    const tasks = await firstValueFrom(service.filteredTasks$);
    expect(tasks[0].completed).toBe(false);
  });

  it('should toggle a task', async () => {
    service.add('Comprar leche');
    const id = service['tasks$'].value[0].id;
    service.toggle(id);
    const tasks = await firstValueFrom(service.filteredTasks$);
    expect(tasks[0].completed).toBe(true);
  });

  it('should remove a task', async () => {
    service.add('Comprar leche');
    const id = service['tasks$'].value[0].id;
    service.remove(id);
    expect(await firstValueFrom(service.total$)).toBe(0);
  });

  it('should count active and completed correctly', async () => {
    service.add('Tarea 1');
    service.add('Tarea 2');
    service.add('Tarea 3');
    service.toggle(service['tasks$'].value[0].id);
    expect(await firstValueFrom(service.active$)).toBe(2);
    expect(await firstValueFrom(service.completed$)).toBe(1);
  });

  it('should filter active tasks', async () => {
    service.add('Tarea 1');
    service.add('Tarea 2');
    service.toggle(service['tasks$'].value[0].id);
    service.setFilter('active');
    const tasks = await firstValueFrom(service.filteredTasks$);
    expect(tasks.length).toBe(1);
    expect(tasks[0].completed).toBe(false);
  });

  it('should filter completed tasks', async () => {
    service.add('Tarea 1');
    service.add('Tarea 2');
    service.toggle(service['tasks$'].value[0].id);
    service.setFilter('completed');
    const tasks = await firstValueFrom(service.filteredTasks$);
    expect(tasks.length).toBe(1);
    expect(tasks[0].completed).toBe(true);
  });
});
