import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from './environments/environment';

import { AppModule } from './app/app.module';

const APP_BASE = environment.appBase;

if (environment.production) {
  enableProdMode();
}

// setting up cookie for visited site
document.cookie = 'lastapp=' + APP_BASE + '; expires=Thu, 31 Dec 2099 12:00:00 UTC; path=/';

platformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.error(err));





