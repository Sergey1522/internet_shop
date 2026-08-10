import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  isShowLoader$ = new Subject<boolean>();
  constructor() {}

  show() {
    this.isShowLoader$.next(true);
  }
  hide() {
    this.isShowLoader$.next(false);
  }
}
