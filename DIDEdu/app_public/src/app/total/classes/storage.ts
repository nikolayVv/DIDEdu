import { InjectionToken } from "@angular/core";

export const BROWSER_STORAGE = new InjectionToken<Storage> (
  'Browser storage',
  {
    providedIn: 'root',
    factory: () => localStorage
  }
);

