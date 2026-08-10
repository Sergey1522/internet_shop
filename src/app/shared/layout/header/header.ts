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
import { debounce, debounceTime, pipe, Subject, takeUntil } from 'rxjs';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductType } from '../../../../types/product.type';
import { ProductService } from '../../services/product.service';
import { Environments } from '../../../environments/environments';
import { ScrollService } from '../../services/scroll-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, MatMenuModule, FormsModule, ReactiveFormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  private productService = inject(ProductService);
  private scrollService = inject(ScrollService);
  private _snackbar = inject(MatSnackBar);
  showedSaerch = signal<boolean>(false);
  isLogged = signal<boolean>(false);
  categories = signal<CategoryType[]>([]);
  products = signal<ProductType[]>([]);
  private cartService = inject(ServiceCart);
  private destroy$ = new Subject<void>();
  cartCount = signal<number>(0);
  // searchValue = signal<string>('');
  searchFiald = new FormControl();
  urlImg = Environments.urlImg;
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
      this.categories.set(category);
    });
    this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
      this.isLogged.set(isLoggedIn);
    });
    this.searchFiald.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
      if (value && value.length > 2) {
        this.productService.getProductSearch(value).subscribe((data: ProductType[]) => {
          this.products.set(data);
        });
      } else {
        this.products.set([]);
      }
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
    this.router.navigate(['/catalog'], {
      queryParams: { category: categoryUrl },
    });
  }
  scrollToSection(sectionId: string): void {
    this.scrollService.scrollToElement(sectionId);
  }
  selectProduct(url: string | undefined) {
    this.router.navigate(['/product/' + url]);
    this.searchFiald.setValue('');
    this.products.set([]);
  }
  showedChangeSearch(value: boolean) {
    setTimeout(() => {
      this.showedSaerch.set(value);
    }, 1000);
  }
}
