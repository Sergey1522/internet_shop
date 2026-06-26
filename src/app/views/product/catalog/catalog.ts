import { map } from 'rxjs';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ProductType } from '../../../../types/product.type';
import { ProductService } from '../../../shared/services/product.service';
import { ProductCard } from '../../../shared/conponents/product-card/product-card';
import { CategoryWithTypeType } from '../../../../types/category-with-type.type';
import { ServiceCategory } from '../../../shared/services/service.category';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ServiceCart } from '../../../shared/services/service.cart';
import { TypeCart } from '../../../../types/cart.type';
import { FavoriteService } from '../../../shared/services/favorite.service';
import { FavoriteType } from '../../../../types/favorite.type';
import { DefaultResponseType } from '../../../../types/default.response.type';

export type SortType = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';
@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [ProductCard, FormsModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
})
export class Catalog implements OnInit {
  private favoriteService = inject(FavoriteService);
  openCategoryIndex = signal<number | null>(null);
  products = signal<ProductType[]>([]);
  product = signal<ProductType | null>(null);
  favorites = signal<FavoriteType[]>([]);
  categoryWithType = signal<CategoryWithTypeType[]>([]);
  open = false;
  pages: number[] = [];
  cart = signal<TypeCart | null>(null);

  selectedTypeUrls = signal<Set<string>>(new Set());
  heightFrom = signal<number | null>(null);
  heightTo = signal<number | null>(null);
  diameterFrom = signal<number | null>(null);
  diameterTo = signal<number | null>(null);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);

  activeFilters = signal<{ key: string; label: string; type: string; value?: any }[]>([]);

  currentSort = signal<SortType>('name-asc');
  showSortMenu = signal<boolean>(false);
  productsRaw = computed(() => {
    const cartItems = this.cart()?.items || [];
    const favoritesIds = new Set(this.favorites().map((f) => f.id));

    return this.products().map((product) => ({
      ...product,
      countInCart: cartItems.find((item) => item.product.id === product.id)?.quantity ?? 0,
      isInFavorite: favoritesIds.has(Number(product.id)),
    }));
  });

  constructor(
    private productService: ProductService,
    private serviceCategory: ServiceCategory,
    private cartServices: ServiceCart,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    effect(() => {
      this.updateActiveFilters();
    });
    effect(() => {
      this.loadProducts();
    });
    effect(() => {
      this.updateUrlParams();
    });
  }

  ngOnInit(): void {
    this.cartServices.getCart().subscribe((data: TypeCart) => {
      this.cart.set(data);
      console.log('Корзина загружена:', data);

      this.loadCategoryWithTypes();
    });
    this.route.queryParams.subscribe((params) => {
      this.applyFiltersFromUrl(params);
      const categoryUrl = params['category'];
      if (categoryUrl) {
        this.applyCategoryFilter(categoryUrl);
      }
      this.loadCategoryWithTypes();
    });
    // this.favoriteService.getFavorites().subscribe((data: FavoriteType[] | DefaultResponseType) => {
    //   if ((data as DefaultResponseType).error !== undefined) {
    //     const error = (data as DefaultResponseType).message;
    //     throw new Error(error);
    //   }
    //   const products = this.products();
    //   products.forEach((product) => {
    //     const favoriteProducts = data as FavoriteType[];
    //     const currentFavoriteProducts = favoriteProducts.find((item) => item.id === product.id);
    //     console.log(currentFavoriteProducts);
    //     if (currentFavoriteProducts) {
    //       if (product) {
    //         product.isInFavorite = true;
    //         console.log(product);
    //       }
    //     }
    //   });
    // });
  }
  private updateActiveFilters(): void {
    const filters: { key: string; label: string; type: string; value?: any }[] = [];

    this.selectedTypeUrls().forEach((typeUrl) => {
      let typeName = typeUrl;
      for (const category of this.categoryWithType()) {
        const type = category.types.find((t) => t.url === typeUrl);
        if (type) {
          typeName = type.name;
          break;
        }
      }
      filters.push({ key: `type-${typeUrl}`, label: typeName, type: 'type', value: typeUrl });
    });

    this.activeFilters.set(filters);
  }

  private applyCategoryFilter(categoryUrl: string): void {
    // Находим категорию и её типы
    const category = this.categoryWithType().find((c) => c.url === categoryUrl);

    if (category && category.types && category.types.length > 0) {
      // Собираем все URL типов из выбранной категории
      const typeUrls = category.types.map((type) => type.url);
      this.selectedTypeUrls.set(new Set(typeUrls));
      console.log(`✅ Применен фильтр по категории: ${category.name}, типы:`, typeUrls);
    } else {
      console.warn(`Категория с URL "${categoryUrl}" не найдена`);
    }
  }

  loadProducts(): void {
    const params = this.getApiParams();
    // params.page = this.currentPage();
    const currentPage = this.currentPage();
    if (currentPage > 1) {
      params.page = currentPage;
    }
    // Добавляем параметр page
    params.limit = 12; // Количество товаров на странице
    this.productService.getProducts(params).subscribe({
      next: (response) => {
        this.pages = [];
        this.totalPages.set(response.pages || 1);

        for (let i = 1; i <= response.pages; i++) {
          this.pages.push(i);
        }
        if (this.cart()) {
          const cartItems = this.cart()?.items || [];
          const updatedProducts = response.items.map((product) => ({
            ...product,
            countInCart: cartItems.find((item) => item.product.id === product.id)?.quantity ?? 0,
          }));
          this.products.set(updatedProducts);
          console.log(updatedProducts);
        } else {
          this.products.set(response.items || []);
          console.log(response);
        }
      },
      error: (err) => {
        console.error('Ошибка загрузки продуктов:', err);
      },
    });
  }
  loadCategoryWithTypes(): void {
    this.serviceCategory.getCategoryWithTypes().subscribe((items) => {
      this.categoryWithType.set(items);
    });
  }
  private getApiParams(): any {
    const params: any = {
      sort: this.currentSort(),
      page: this.currentPage(),
      limit: 12,
    };

    const types = Array.from(this.selectedTypeUrls());
    if (types.length > 0) {
      params.types = types;
    }

    if (this.heightFrom() !== null) params.heightFrom = this.heightFrom();
    if (this.heightTo() !== null) params.heightTo = this.heightTo();
    if (this.diameterFrom() !== null) params.diameterFrom = this.diameterFrom();
    if (this.diameterTo() !== null) params.diameterTo = this.diameterTo();

    return params;
  }

  private applyFiltersFromUrl(params: any): void {
    const typesParam = params['types[]'];
    if (params['sort']) {
      this.currentSort.set(params['sort']);
    }
    if (typesParam) {
      console.log(typesParam);
      const typeUrls = Array.isArray(typesParam) ? typesParam : [typesParam];
      this.selectedTypeUrls.set(new Set(typeUrls));
    } else {
      this.selectedTypeUrls.set(new Set());
    }

    if (params['heightFrom']) this.heightFrom.set(Number(params['heightFrom']));
    if (params['heightTo']) this.heightTo.set(Number(params['heightTo']));
    if (params['diameterFrom']) this.diameterFrom.set(Number(params['diameterFrom']));
    if (params['diameterTo']) this.diameterTo.set(Number(params['diameterTo']));

    if (params['page']) {
      this.currentPage.set(Number(params['page']));
    } else {
      // this.currentPage.set(1);
    }
  }

  onTypeChange(typeUrl: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const currentSet = new Set(this.selectedTypeUrls());

    if (isChecked) {
      currentSet.add(typeUrl);
    } else {
      currentSet.delete(typeUrl);
    }

    this.selectedTypeUrls.set(currentSet);
    // this.currentPage.set(1);
  }
  onHeightFromChange(value: string): void {
    this.heightFrom.set(value ? Number(value) : null);
    // this.loadProducts();
    // this.currentPage.set(1);
  }

  onHeightToChange(value: string): void {
    this.heightTo.set(value ? Number(value) : null);
    // this.loadProducts();
    // this.currentPage.set(1);
  }

  onDiameterFromChange(value: string): void {
    this.diameterFrom.set(value ? Number(value) : null);
    // this.loadProducts();
    // this.currentPage.set(1);
  }

  onDiameterToChange(value: string): void {
    this.diameterTo.set(value ? Number(value) : null);
    // this.loadProducts();
    // this.currentPage.set(1);
  }
  private updateUrlParams(): void {
    const queryParams: any = {};

    const types = Array.from(this.selectedTypeUrls());
    if (types.length > 0) {
      queryParams['types[]'] = types;
    }

    if (this.heightFrom() !== null) queryParams.heightFrom = this.heightFrom();
    if (this.heightTo() !== null) queryParams.heightTo = this.heightTo();
    if (this.diameterFrom() !== null) queryParams.diameterFrom = this.diameterFrom();
    if (this.diameterTo() !== null) queryParams.diameterTo = this.diameterTo();
    if (this.currentSort() !== 'name-asc') {
      queryParams.sort = this.currentSort();
    }
    queryParams.page = this.currentPage();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true,
    });
  }
  removeFilter(filterKey: string): void {
    if (filterKey.startsWith('type-')) {
      const typeUrl = filterKey.replace('type-', '');
      const currentSet = new Set(this.selectedTypeUrls());
      currentSet.delete(typeUrl);
      this.selectedTypeUrls.set(currentSet);
    } else if (filterKey === 'height') {
      this.heightFrom.set(null);
      this.heightTo.set(null);
    } else if (filterKey === 'diameter') {
      this.diameterFrom.set(null);
      this.diameterTo.set(null);
    }
    // this.currentPage.set(1);
  }

  toggleCategory(index: number): void {
    if (this.openCategoryIndex() === index) {
      this.openCategoryIndex.set(null);
      this.open = false;
    } else {
      this.openCategoryIndex.set(index);
      this.open = true;
    }
  }
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }

    this.currentPage.set(page);
    this.loadProducts(); // Перезагружаем товары
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  //Sorting

  // ✅ Текущая метка сортировки
  currentSortLabel = computed(() => {
    const labels: Record<SortType, string> = {
      'name-asc': 'От А до Я',
      'name-desc': 'От Я до А',
      'price-asc': 'По возрастанию цены',
      'price-desc': 'По убыванию цены',
    };
    return labels[this.currentSort()];
  });

  // ✅ Методы сортировки
  setSort(sort: SortType): void {
    this.currentSort.set(sort);
    this.currentPage.set(1); // Сбрасываем на первую страницу
    this.showSortMenu.set(false);
  }
}
