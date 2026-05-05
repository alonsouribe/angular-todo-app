# Angular Todo App

App para gestionar tareas. CRUD completo con formularios reactivos, filtros y pruebas unitarias.
El servicio se implementa de **3 formas diferentes** para comparar enfoques.

---

## Lo que practicas con este proyecto

- Formularios reactivos (`ReactiveFormsModule`)
- Servicio como única fuente de verdad (3 enfoques)
- CRUD completo (crear, completar, eliminar)
- Filtros por estado (all / active / completed)
- Pruebas unitarias del servicio y componentes

---

## Arquitectura

```
src/
└── app/
    ├── models/
    │   └── task.model.ts
    ├── services/
    │   └── task.service.ts          ← elige una de las 3 versiones
    │   └── task.service.spec.ts     ← pruebas adaptadas a la versión elegida
    ├── components/
    │   ├── task-form/
    │   │   ├── task-form.component.ts
    │   │   └── task-form.component.spec.ts
    │   ├── task-list/
    │   │   ├── task-list.component.ts
    │   │   └── task-list.component.spec.ts
    │   └── task-summary/
    │       ├── task-summary.component.ts
    │       └── task-summary.component.spec.ts
    ├── app.component.ts
    └── styles.css
```

---

## 1. Crear el proyecto

```bash
ng new angular-todo-app --standalone --style=css --routing=false
cd angular-todo-app
```

> Cuando pregunte SSR → escribe `N`

---

## 2. Crear archivos

```bash
# Modelo
mkdir src/app/models
touch src/app/models/task.model.ts

# Servicio
ng generate service services/task

# Componentes
ng generate component components/task-form --standalone
ng generate component components/task-list --standalone
ng generate component components/task-summary --standalone
```

---

## 3. Modelo

> El modelo es el mismo para las 3 versiones, no cambia.

**`src/app/models/task.model.ts`**

```typescript
export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export type Filter = 'all' | 'active' | 'completed';
```

---

## 4. Servicio — Versión Clásica

> Variables normales de clase. La más sencilla para empezar.

**`src/app/services/task.service.ts`**

```typescript
import { Injectable } from '@angular/core';
import { Task, Filter } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  tasks: Task[]  = [];
  filter: Filter = 'all';
  private nextId = 1;

  get filteredTasks(): Task[] {
    if (this.filter === 'active')    return this.tasks.filter(t => !t.completed);
    if (this.filter === 'completed') return this.tasks.filter(t =>  t.completed);
    return this.tasks;
  }

  get total():     number { return this.tasks.length; }
  get active():    number { return this.tasks.filter(t => !t.completed).length; }
  get completed(): number { return this.tasks.filter(t =>  t.completed).length; }

  add(title: string): void {
    this.tasks.push({ id: this.nextId++, title, completed: false });
  }

  toggle(id: number): void {
    const task = this.tasks.find(t => t.id === id);
    if (task) task.completed = !task.completed;
  }

  remove(id: number): void {
    this.tasks = this.tasks.filter(t => t.id !== id);
  }

  setFilter(filter: Filter): void {
    this.filter = filter;
  }
}
```

**Cómo se lee en el template (sin paréntesis):**
```html
{{ taskService.total }}
{{ taskService.active }}
{{ taskService.filter }}
*ngFor="let task of taskService.filteredTasks"
```

---

## 5. Servicio — Versión Signals

> Usando `signal()` y `computed()`. Más eficiente y reactivo.

**`src/app/services/task.service.ts`**

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { Task, Filter } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasks  = signal<Task[]>([]);
  private nextId = 1;

  filter = signal<Filter>('all');

  filteredTasks = computed(() => {
    const f = this.filter();
    const t = this.tasks();
    if (f === 'active')    return t.filter(t => !t.completed);
    if (f === 'completed') return t.filter(t =>  t.completed);
    return t;
  });

  total     = computed(() => this.tasks().length);
  active    = computed(() => this.tasks().filter(t => !t.completed).length);
  completed = computed(() => this.tasks().filter(t =>  t.completed).length);

  add(title: string): void {
    this.tasks.update(list => [
      ...list,
      { id: this.nextId++, title, completed: false }
    ]);
  }

  toggle(id: number): void {
    this.tasks.update(list =>
      list.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    );
  }

  remove(id: number): void {
    this.tasks.update(list => list.filter(t => t.id !== id));
  }

  setFilter(filter: Filter): void {
    this.filter.set(filter);
  }
}
```

**Cómo se lee en el template (con paréntesis porque son funciones):**
```html
{{ taskService.total() }}
{{ taskService.active() }}
{{ taskService.filter() }}
*ngFor="let task of taskService.filteredTasks()"
```

---

## 6. Servicio — Versión RxJS

> Usando `BehaviorSubject` y `AsyncPipe`. Útil para flujos reactivos.

**`src/app/services/task.service.ts`**

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { Task, Filter } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasks$  = new BehaviorSubject<Task[]>([]);
  private filter$ = new BehaviorSubject<Filter>('all');
  private nextId  = 1;

  filteredTasks$ = combineLatest([this.tasks$, this.filter$]).pipe(
    map(([tasks, filter]) => {
      if (filter === 'active')    return tasks.filter(t => !t.completed);
      if (filter === 'completed') return tasks.filter(t =>  t.completed);
      return tasks;
    })
  );

  total$     = this.tasks$.pipe(map(t => t.length));
  active$    = this.tasks$.pipe(map(t => t.filter(t => !t.completed).length));
  completed$ = this.tasks$.pipe(map(t => t.filter(t =>  t.completed).length));
  filter     = this.filter$;

  add(title: string): void {
    const current = this.tasks$.value;
    this.tasks$.next([...current, { id: this.nextId++, title, completed: false }]);
  }

  toggle(id: number): void {
    const current = this.tasks$.value;
    this.tasks$.next(
      current.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    );
  }

  remove(id: number): void {
    const current = this.tasks$.value;
    this.tasks$.next(current.filter(t => t.id !== id));
  }

  setFilter(filter: Filter): void {
    this.filter$.next(filter);
  }
}
```

**Cómo se lee en el template (con `async` pipe):**
```html
{{ taskService.total$ | async }}
{{ taskService.active$ | async }}
*ngFor="let task of taskService.filteredTasks$ | async"
```

> El componente también necesita importar `AsyncPipe` en su `imports: []`

---

## Diferencias del Servicio

| | Clásico | Signals | RxJS |
|---|---|---|---|
| **Variable** | `tasks: Task[] = []` | `tasks = signal<Task[]>([])` | `tasks$ = new BehaviorSubject<Task[]>([])` |
| **Leer en template** | `taskService.total` | `taskService.total()` | `taskService.total$ \| async` |
| **Valor derivado** | `get total()` | `computed(() => ...)` | `.pipe(map(...))` |
| **Modificar** | `this.tasks.push(...)` | `this.tasks.update(...)` | `this.tasks$.next(...)` |
| **Filtro reactivo** | `get filteredTasks()` | `computed(() => ...)` | `combineLatest + map` |
| **Import extra** | Ninguno | `signal, computed` | `AsyncPipe` en componente |

---

## 7. Componentes

> Los componentes son casi iguales en las 3 versiones.
> Solo cambia cómo se leen los valores del servicio en el template.

---

### task-form (igual en las 3 versiones)

**`src/app/components/task-form/task-form.component.ts`**

```typescript
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="form-card">
      <h2>Nueva Tarea</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <input
          formControlName="title"
          placeholder="¿Qué hay que hacer?"
          type="text" />
        <button type="submit" [disabled]="form.invalid">Agregar</button>
      </form>
    </div>
  `,
  styles: [`
    .form-card { border: 2px solid #3498db; border-radius: 8px; padding: 20px; }
    input { width: 100%; padding: 10px; margin-bottom: 10px; box-sizing: border-box; font-size: 1rem; }
    button { width: 100%; padding: 10px; background: #3498db; color: white; border: none; cursor: pointer; border-radius: 4px; font-size: 1rem; }
    button:disabled { background: #aaa; cursor: not-allowed; }
  `]
})
export class TaskFormComponent {
  private taskService = inject(TaskService);
  private fb          = inject(FormBuilder);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]]
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.taskService.add(this.form.value.title!);
    this.form.reset();
  }
}
```

---

### task-list — Versión Clásica

**`src/app/components/task-list/task-list.component.ts`**

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { Filter } from '../../models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="list-card">
      <div class="filters">
        <button
          *ngFor="let f of filters"
          [class.active]="taskService.filter === f"
          (click)="setFilter(f)">
          {{ f | titlecase }}
        </button>
      </div>
      <p *ngIf="taskService.filteredTasks.length === 0">Sin tareas.</p>
      <ul>
        <li *ngFor="let task of taskService.filteredTasks">
          <input type="checkbox" [checked]="task.completed" (change)="toggle(task.id)" />
          <span [class.done]="task.completed">{{ task.title }}</span>
          <button (click)="remove(task.id)">✕</button>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .list-card { border: 2px solid #2ecc71; border-radius: 8px; padding: 20px; margin-top: 16px; }
    .filters { display: flex; gap: 8px; margin-bottom: 16px; }
    .filters button { padding: 6px 14px; border: 1px solid #ccc; background: white; cursor: pointer; border-radius: 4px; }
    .filters button.active { background: #2ecc71; color: white; border-color: #2ecc71; }
    ul { list-style: none; padding: 0; margin: 0; }
    li { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #eee; }
    span { flex: 1; }
    span.done { text-decoration: line-through; color: #aaa; }
    li button { background: #e74c3c; color: white; border: none; padding: 4px 8px; cursor: pointer; border-radius: 4px; }
  `]
})
export class TaskListComponent {
  taskService = inject(TaskService);
  filters: Filter[] = ['all', 'active', 'completed'];

  toggle(id: number): void   { this.taskService.toggle(id); }
  remove(id: number): void   { this.taskService.remove(id); }
  setFilter(f: Filter): void { this.taskService.setFilter(f); }
}
```

---

### task-list — Versión Signals

> Solo cambia el template: agrega `()` a las llamadas del servicio.

```typescript
// mismo código que la versión clásica, solo cambia el template:
template: `
  <div class="list-card">
    <div class="filters">
      <button
        *ngFor="let f of filters"
        [class.active]="taskService.filter() === f"
        (click)="setFilter(f)">
        {{ f | titlecase }}
      </button>
    </div>
    <p *ngIf="taskService.filteredTasks().length === 0">Sin tareas.</p>
    <ul>
      <li *ngFor="let task of taskService.filteredTasks()">
        <input type="checkbox" [checked]="task.completed" (change)="toggle(task.id)" />
        <span [class.done]="task.completed">{{ task.title }}</span>
        <button (click)="remove(task.id)">✕</button>
      </li>
    </ul>
  </div>
`
```

---

### task-list — Versión RxJS

> Agrega `AsyncPipe` en imports y usa `| async` en el template.

```typescript
import { AsyncPipe, CommonModule } from '@angular/common';

// en imports del componente:
imports: [CommonModule, AsyncPipe],

// template:
template: `
  <div class="list-card">
    <div class="filters">
      <button
        *ngFor="let f of filters"
        [class.active]="(taskService.filter | async) === f"
        (click)="setFilter(f)">
        {{ f | titlecase }}
      </button>
    </div>
    <ng-container *ngIf="taskService.filteredTasks$ | async as tasks">
      <p *ngIf="tasks.length === 0">Sin tareas.</p>
      <ul>
        <li *ngFor="let task of tasks">
          <input type="checkbox" [checked]="task.completed" (change)="toggle(task.id)" />
          <span [class.done]="task.completed">{{ task.title }}</span>
          <button (click)="remove(task.id)">✕</button>
        </li>
      </ul>
    </ng-container>
  </div>
`
```

---

### task-summary — Versión Clásica

**`src/app/components/task-summary/task-summary.component.ts`**

```typescript
import { Component, inject } from '@angular/core';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-summary',
  standalone: true,
  template: `
    <div class="summary-card">
      <h2>Resumen</h2>
      <p>Total: <strong>{{ taskService.total }}</strong></p>
      <p>Activas: <strong>{{ taskService.active }}</strong></p>
      <p>Completadas: <strong>{{ taskService.completed }}</strong></p>
    </div>
  `,
  styles: [`
    .summary-card { border: 2px solid #f39c12; border-radius: 8px; padding: 20px; margin-top: 16px; display: flex; gap: 24px; align-items: center; }
    h2 { margin: 0 16px 0 0; }
    p { margin: 0; font-size: 1rem; }
  `]
})
export class TaskSummaryComponent {
  taskService = inject(TaskService);
}
```

> **Signals:** cambia `taskService.total` → `taskService.total()`
>
> **RxJS:** cambia `taskService.total` → `taskService.total$ | async` y agrega `AsyncPipe` en imports

---

### app.component.ts (igual en las 3 versiones)

**`src/app/app.component.ts`**

```typescript
import { Component } from '@angular/core';
import { TaskFormComponent }    from './components/task-form/task-form.component';
import { TaskListComponent }    from './components/task-list/task-list.component';
import { TaskSummaryComponent } from './components/task-summary/task-summary.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TaskFormComponent, TaskListComponent, TaskSummaryComponent],
  template: `
    <div class="container">
      <h1>✅ Todo App</h1>
      <app-task-form />
      <app-task-summary />
      <app-task-list />
    </div>
  `,
  styles: [`
    .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: sans-serif; }
    h1 { text-align: center; }
  `]
})
export class AppComponent {}
```

**`src/styles.css`**

```css
body {
  margin: 0;
  padding: 0;
  background: #f5f5f5;
  box-sizing: border-box;
}
```

---

## 8. Pruebas Unitarias

> Las pruebas del formulario y lista son iguales en las 3 versiones.
> El servicio cambia según la versión elegida.

---

### Servicio — Versión Clásica

**`src/app/services/task.service.spec.ts`**

```typescript
import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';

describe('TaskService (Clásico)', () => {
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

    expect(service.tasks[0].completed).toBeFalse();
  });

  it('should toggle a task', () => {
    service.add('Comprar leche');
    const id = service.tasks[0].id;

    service.toggle(id);

    expect(service.tasks[0].completed).toBeTrue();
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
    expect(service.filteredTasks[0].completed).toBeFalse();
  });

  it('should filter completed tasks', () => {
    service.add('Tarea 1');
    service.add('Tarea 2');
    service.toggle(service.tasks[0].id);

    service.setFilter('completed');

    expect(service.filteredTasks.length).toBe(1);
    expect(service.filteredTasks[0].completed).toBeTrue();
  });
});
```

---

### Servicio — Versión Signals

**`src/app/services/task.service.spec.ts`**

```typescript
import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';

describe('TaskService (Signals)', () => {
  let service: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start empty', () => {
    expect(service.total()).toBe(0);
  });

  it('should add a task', () => {
    service.add('Comprar leche');

    expect(service.total()).toBe(1);
    expect(service.filteredTasks()[0].title).toBe('Comprar leche');
  });

  it('should start task as not completed', () => {
    service.add('Comprar leche');

    expect(service.filteredTasks()[0].completed).toBeFalse();
  });

  it('should toggle a task', () => {
    service.add('Comprar leche');
    const id = service.filteredTasks()[0].id;

    service.toggle(id);

    expect(service.filteredTasks()[0].completed).toBeTrue();
  });

  it('should remove a task', () => {
    service.add('Comprar leche');
    const id = service.filteredTasks()[0].id;

    service.remove(id);

    expect(service.total()).toBe(0);
  });

  it('should count active and completed correctly', () => {
    service.add('Tarea 1');
    service.add('Tarea 2');
    service.add('Tarea 3');
    service.toggle(service.filteredTasks()[0].id);

    expect(service.active()).toBe(2);
    expect(service.completed()).toBe(1);
  });

  it('should filter active tasks', () => {
    service.add('Tarea 1');
    service.add('Tarea 2');
    service.toggle(service.filteredTasks()[0].id);

    service.setFilter('active');

    expect(service.filteredTasks().length).toBe(1);
    expect(service.filteredTasks()[0].completed).toBeFalse();
  });

  it('should filter completed tasks', () => {
    service.add('Tarea 1');
    service.add('Tarea 2');
    service.toggle(service.filteredTasks()[0].id);

    service.setFilter('completed');

    expect(service.filteredTasks().length).toBe(1);
    expect(service.filteredTasks()[0].completed).toBeTrue();
  });
});
```

---

### Servicio — Versión RxJS

**`src/app/services/task.service.spec.ts`**

```typescript
import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';

describe('TaskService (RxJS)', () => {
  let service: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start empty', (done) => {
    service.total$.subscribe(total => {
      expect(total).toBe(0);
      done();
    });
  });

  it('should add a task', (done) => {
    service.add('Comprar leche');

    service.filteredTasks$.subscribe(tasks => {
      expect(tasks.length).toBe(1);
      expect(tasks[0].title).toBe('Comprar leche');
      done();
    });
  });

  it('should toggle a task', (done) => {
    service.add('Comprar leche');
    const id = service['tasks$'].value[0].id;

    service.toggle(id);

    service.filteredTasks$.subscribe(tasks => {
      expect(tasks[0].completed).toBeTrue();
      done();
    });
  });

  it('should remove a task', (done) => {
    service.add('Comprar leche');
    const id = service['tasks$'].value[0].id;

    service.remove(id);

    service.total$.subscribe(total => {
      expect(total).toBe(0);
      done();
    });
  });

  it('should filter active tasks', (done) => {
    service.add('Tarea 1');
    service.add('Tarea 2');
    const id = service['tasks$'].value[0].id;
    service.toggle(id);

    service.setFilter('active');

    service.filteredTasks$.subscribe(tasks => {
      expect(tasks.length).toBe(1);
      expect(tasks[0].completed).toBeFalse();
      done();
    });
  });
});
```

---

### task-form.component.spec.ts (igual en las 3 versiones)

**`src/app/components/task-form/task-form.component.spec.ts`**

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskFormComponent } from './task-form.component';
import { TaskService } from '../../services/task.service';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;
  let taskService: TaskService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with invalid form', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('should be invalid with less than 3 characters', () => {
    component.form.setValue({ title: 'AB' });
    expect(component.form.invalid).toBeTrue();
  });

  it('should be valid with 3 or more characters', () => {
    component.form.setValue({ title: 'Comprar leche' });
    expect(component.form.valid).toBeTrue();
  });

  it('should call service.add and reset on submit', () => {
    spyOn(taskService, 'add');
    component.form.setValue({ title: 'Comprar leche' });

    component.onSubmit();

    expect(taskService.add).toHaveBeenCalledWith('Comprar leche');
    expect(component.form.value.title).toBeNull();
  });

  it('should NOT call service.add if form is invalid', () => {
    spyOn(taskService, 'add');

    component.onSubmit();

    expect(taskService.add).not.toHaveBeenCalled();
  });
});
```

---

### task-list.component.spec.ts (igual en las 3 versiones)

**`src/app/components/task-list/task-list.component.spec.ts`**

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskListComponent } from './task-list.component';
import { TaskService } from '../../services/task.service';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let taskService: TaskService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call service.toggle with correct id', () => {
    spyOn(taskService, 'toggle');
    component.toggle(1);
    expect(taskService.toggle).toHaveBeenCalledWith(1);
  });

  it('should call service.remove with correct id', () => {
    spyOn(taskService, 'remove');
    component.remove(1);
    expect(taskService.remove).toHaveBeenCalledWith(1);
  });

  it('should call service.setFilter with correct filter', () => {
    spyOn(taskService, 'setFilter');
    component.setFilter('active');
    expect(taskService.setFilter).toHaveBeenCalledWith('active');
  });
});
```

---

## 9. Correr el proyecto y pruebas

```bash
# Iniciar app
ng serve

# Correr pruebas
ng test
```

Abre **`http://localhost:4200`**

---

## Resumen: qué cambia entre versiones

| | Clásico | Signals | RxJS |
|---|---|---|---|
| **Leer en template** | `taskService.total` | `taskService.total()` | `taskService.total$ \| async` |
| **Valor derivado** | `get total()` | `computed(...)` | `.pipe(map(...))` |
| **Filtro reactivo** | `get filteredTasks()` | `computed(...)` | `combineLatest + map` |
| **Modificar estado** | mutación directa | `.update() / .set()` | `.next()` |
| **Import extra** | ninguno | `signal, computed` | `AsyncPipe` |
| **Pruebas** | acceso directo | llamada con `()` | `subscribe + done` |

---

## Qué aprendiste vs el Counter

| | Counter | Todo App |
|---|---|---|
| Estado | en el componente | en **servicio compartido** |
| Formularios | sin formularios | `ReactiveFormsModule` + `Validators` |
| Componentes | 1 componente | múltiples componentes coordinados |
| Modelos | sin modelo | interface `Task` y tipo `Filter` |
| CRUD | solo +/- | agregar, completar y eliminar |
| Valor derivado | doble del contador | filtros, total, activas, completadas |
