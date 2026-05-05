import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { TasksRxjsPage } from './tasks-rxjs-page';
import { TaskRxJSService } from '../../services/task-rxjs.service';

describe('TasksRxjsPage', () => {
  let component: TasksRxjsPage;
  let fixture: ComponentFixture<TasksRxjsPage>;
  let service: TaskRxJSService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasksRxjsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksRxjsPage);
    component = fixture.componentInstance;
    service = TestBed.inject(TaskRxJSService);
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

  it('should call service.add and reset form on valid submit', () => {
    vi.spyOn(service, 'add');
    component.form.setValue({ title: 'Nueva tarea' });

    component.onSubmit();

    expect(service.add).toHaveBeenCalledWith('Nueva tarea');
    expect(component.form.value.title).toBeNull();
  });

  it('should NOT call service.add if form is invalid', () => {
    vi.spyOn(service, 'add');

    component.onSubmit();

    expect(service.add).not.toHaveBeenCalled();
  });

  it('should render 3 filter buttons', () => {
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('div button');
    expect(buttons.length).toBe(3);
  });

  it('should call service.setFilter when filter button is clicked', () => {
    vi.spyOn(service, 'setFilter');
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('div button');

    buttons[1].click();

    expect(service.setFilter).toHaveBeenCalledWith('active');
  });

  it('should call service.toggle when checkbox is clicked', async () => {
    service.add('Tarea de prueba');
    await fixture.whenStable();
    vi.spyOn(service, 'toggle');

    const checkbox = fixture.nativeElement.querySelector('input[type="checkbox"]');
    checkbox.click();

    expect(service.toggle).toHaveBeenCalled();
  });

  it('should call service.remove when remove button is clicked', async () => {
    service.add('Tarea de prueba');
    await fixture.whenStable();
    vi.spyOn(service, 'remove');

    const removeButton = fixture.nativeElement.querySelector('li button');
    removeButton.click();

    expect(service.remove).toHaveBeenCalled();
  });
});
