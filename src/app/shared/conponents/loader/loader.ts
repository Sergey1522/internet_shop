import { Component, inject, OnInit, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoaderService } from '../../services/loader';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: './loader.html',
  styleUrl: './loader.css',
})
export class Loader implements OnInit {
  private loaderService = inject(LoaderService);
  isShowLoader = signal<boolean>(false);
  ngOnInit(): void {
    this.loaderService.isShowLoader$.subscribe((isShowLoader: boolean) => {
      this.isShowLoader.set(isShowLoader);
    });
  }
}
