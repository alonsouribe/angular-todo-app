import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start empty', () => {
    expect(service.total).toBe(0);
  });

  it('should add a task', () => {
    service.add('Comprar leche');
    expect(service.total).toBe(1);
    expect(service.tasks[0].title).toBe('Comprar leche');
  });

  it('should start task as not completed', () => {
    service.add('Comprar leche');
    expect(service.tasks[0].completed).toBe(false);
  });

  it('should toggle a task', () => {
    service.add('Comprar leche');
    const id = service.tasks[0].id;
    service.toggle(id);
    expect(service.tasks[0].completed).toBe(true);
  });

  it('should remove a task', () => {
    service.add('Comprar leche');
    const id = service.tasks[0].id;
    service.remove(id);
    expect(service.total).toBe(0);
  });

  it('should count active and completed correctly', () => {
    service.add('Tarea 1');
    service.add('Tarea 2');
    service.add('Tarea 3');
    service.toggle(service.tasks[0].id);
    expect(service.active).toBe(2);
    expect(service.completed).toBe(1);
  });

  it('should filter active tasks', () => {
    service.add('Tarea 1');
    service.add('Tarea 2');
    service.toggle(service.tasks[0].id);
    service.setFilter('active');
    expect(service.filteredTasks.length).toBe(1);
    expect(service.filteredTasks[0].completed).toBe(false);
  });

  it('should filter completed tasks', () => {
    service.add('Tarea 1');
    service.add('Tarea 2');
    service.toggle(service.tasks[0].id);
    service.setFilter('completed');
    expect(service.filteredTasks.length).toBe(1);
    expect(service.filteredTasks[0].completed).toBe(true);
  });
});
