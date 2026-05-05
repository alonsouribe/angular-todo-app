import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { TasksPage } from './tasks-page';
import { TaskService } from '../../services/task.service';

describe('TasksPage', () => {
  let component: TasksPage;
  let fixture: ComponentFixture<TasksPage>;
  let taskService: TaskService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasksPage],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksPage);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with invalid form', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('should be invalid with less than 3 characters', () => {
    component.form.setValue({ title: 'AB' });
    expect(component.form.invalid).toBe(true);
  });

  it('should be valid with 3 or more characters', () => {
    component.form.setValue({ title: 'Comprar leche' });
    expect(component.form.valid).toBe(true);
  });

  it('should call taskService.add and reset form on valid submit', () => {
    vi.spyOn(taskService, 'add');
    component.form.setValue({ title: 'Nueva tarea' });

    component.onSubmit();

    expect(taskService.add).toHaveBeenCalledWith('Nueva tarea');
    expect(component.form.value.title).toBeNull();
  });

  it('should NOT call taskService.add if form is invalid', () => {
    vi.spyOn(taskService, 'add');

    component.onSubmit();

    expect(taskService.add).not.toHaveBeenCalled();
  });

  it('should render 3 filter buttons', () => {
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('div button');
    expect(buttons.length).toBe(3);
  });

  it('should call taskService.setFilter when filter button is clicked', () => {
    vi.spyOn(taskService, 'setFilter');
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('div button');

    buttons[1].click();

    expect(taskService.setFilter).toHaveBeenCalledWith('active');
  });

  it('should call taskService.toggle when checkbox is clicked', () => {
    taskService.add('Tarea de prueba');
    fixture.detectChanges();
    vi.spyOn(taskService, 'toggle');

    const checkbox = fixture.nativeElement.querySelector('input[type="checkbox"]');
    checkbox.click();

    expect(taskService.toggle).toHaveBeenCalled();
  });

  it('should call taskService.remove when remove button is clicked', () => {
    taskService.add('Tarea de prueba');
    fixture.detectChanges();
    vi.spyOn(taskService, 'remove');

    const removeButton = fixture.nativeElement.querySelector('li button');
    removeButton.click();

    expect(taskService.remove).toHaveBeenCalled();
  });
});
