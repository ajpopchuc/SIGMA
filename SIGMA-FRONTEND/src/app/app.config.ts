import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { newcustomInterceptor } from './service/newcustom.interceptor'; // Import the functional interceptor

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([newcustomInterceptor]), // Use the functional interceptor
      withFetch()
    )
  ]
};
