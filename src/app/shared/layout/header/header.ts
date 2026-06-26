import { AuthService } from './../../../core/auth/auth.service';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CategoryType } from '../../../../types/category.type';
import { ServiceCategory } from '../../services/service.category';
import { CommonModule } from '@angular/common';
import { Route, Router, RouterLink } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { DefaultResponseType } from '../../../../types/default.response.type';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServiceCart } from '../../services/service.cart';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, MatMenuModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  private _snackbar = inject(MatSnackBar);
  isLogged = signal<boolean>(false);
  categories = signal<CategoryType[]>([]);
  private cartService = inject(ServiceCart);
  private destroy$ = new Subject<void>();
  cartCount = signal<number>(0);
  @Input() countInCart: number = 0;
  constructor(
    private categoryService: ServiceCategory,
    private authService: AuthService,
    private router: Router,
  ) {
    this.isLogged.set(this.authService.getIsLoggedIn());
  }

  ngOnInit(): void {
    this.loadCartCount();
    this.categoryService.getCategory().subscribe((category: CategoryType[]) => {
      console.log(category);
      this.categories.set(category);
    });
    this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
      this.isLogged.set(isLoggedIn);
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCartCount(): void {
    this.cartService
      .getCartCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.cartCount.set(data.count);
          console.log('Cart count loaded:', data.count);
        },
        error: (err) => {
          console.error('Ошибка загрузки количества:', err);
          this.cartCount.set(0);
        },
      });
    this.cartService.count$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.cartCount.set(data);
        console.log('Cart count loaded:', data);
      },
      error: (err) => {
        console.error('Ошибка загрузки количества:', err);
        this.cartCount.set(0);
      },
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: (data: DefaultResponseType) => {
        if (data.error) {
          this._snackbar.open('Ошибка выхода из системы', '', {
            duration: 3000,
          });
          throw new Error(data.message);
        }
        this.authService.removeTokens();
        this.authService.userId = null;
        this._snackbar.open('Вы вышли из системы', '', {
          duration: 3000,
        });
        this.router.navigate(['/']);
      },
      error: (error: HttpErrorResponse) => {
        if (error.error && error.error.message) {
          this._snackbar.open(error.error.message);
        } else {
          this._snackbar.open('Ошибка выхода из системы', '', {
            duration: 3000,
          });
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
