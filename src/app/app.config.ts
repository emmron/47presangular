import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { LayoutModule } from './layout/layout.module';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(LayoutModule),
    provideRouter(routes),
    provideHttpClient()
  ]
};
