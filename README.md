# TrumpTracker

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.0.3.

## Engagement services

The front-end now integrates with a companion Express microservice that powers polls, newsletter capture, analytics tracking, and dynamic OpenGraph image generation.

1. Start the engagement service:
   ```bash
   cd backend/engagement-service
   npm install
   npm start
   ```
2. Run the Angular app in a separate terminal with `ng serve`.

The Angular services expect the engagement service to be available at `http://localhost:4000`. Update `EngagementService` if you need a different origin.

## Key features

- Dedicated engagement sidebar featuring a newsletter sign-up form, social share controls, and live poll snapshots.
- Poll and survey results sourced from the engagement microservice.
- Dynamic OpenGraph image previews for each story to enrich social sharing.
- Analytics events fired for newsletter conversions and share interactions.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
