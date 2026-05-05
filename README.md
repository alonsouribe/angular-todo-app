# Angular Todo App

A simple todo application built to explore and compare three different state management approaches in Angular.

## What this project demonstrates

| Implementation | Location | Tests | Approach |
|---|---|---|---|
| Classic class state | `tasks-page/` | ✓ | Plain class properties with getters |
| Signals + computed | `tasks-signals-page/` | ✓ | `signal()`, `computed()`, and `.update()` from Angular 17+ |
| RxJS BehaviorSubject | `tasks-rxjs-page/` | ✓ | `BehaviorSubject` with `AsyncPipe` for reactive streams |

## Getting started

```bash
npm install
ng serve
```

Then open `http://localhost:4200`.

## Built with

- Angular 21
- RxJS
- Angular Signals (built-in)
