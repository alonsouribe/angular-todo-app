import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksSignalsPage } from './tasks-signals-page';

describe('TasksSignalsPage', () => {
  let component: TasksSignalsPage;
  let fixture: ComponentFixture<TasksSignalsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasksSignalsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksSignalsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
