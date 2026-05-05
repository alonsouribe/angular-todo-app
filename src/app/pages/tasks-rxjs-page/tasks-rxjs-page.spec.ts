import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksRxjsPage } from './tasks-rxjs-page';

describe('TasksRxjsPage', () => {
  let component: TasksRxjsPage;
  let fixture: ComponentFixture<TasksRxjsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasksRxjsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksRxjsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
