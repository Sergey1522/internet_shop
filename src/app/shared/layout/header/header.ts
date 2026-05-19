import { AuthService } from './../../../core/auth/auth.service';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CategoryType } from '../../../../types/category.type';
import { ServiceCategory } from '../../services/service.category';
import { CommonModule } from '@angular/common';
import { Route, Router, RouterLink } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { DefaultResponseType } from '../../../../types/default.response.type';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, MatMenuModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  private _snackbar = inject(MatSnackBar);
  isLogged: boolean = false;
  categories = signal<CategoryType[]>([]);
  constructor(
    private categoryService: ServiceCategory,
    private authService: AuthService,
    private router: Router,
  ) {
    this.isLogged = this.authService.getIsLoggedIn();
  }

  ngOnInit(): void {
    this.categoryService.getCategory().subscribe((category: CategoryType[]) => {
      console.log(category);
      this.categories.set(category);
    });
    this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
      this.isLogged = isLoggedIn;
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: (data: DefaultResponseType) => {
        if (data.error) {
          this._snackbar.open('Ошибка выхода из системы');
          throw new Error(data.message);
        }
        this.authService.removeTokens();
        this.authService.userId = null;
        this._snackbar.open('Вы вышли из системы');
      },
      error: (error: HttpErrorResponse) => {
        if (error.error && error.error.message) {
          this._snackbar.open(error.error.message);
        } else {
          this._snackbar.open('Ошибка выхода из системы');
        }
      },
    });
  }
  goToCategory(categoryUrl: string): void {
    // Находим тип в категории
    // Для простого перехода по категории используем URL категории
    this.router.navigate(['/catalog'], {
      queryParams: { category: categoryUrl },
    });
  }
}
