import { Component, effect, OnInit, signal } from '@angular/core';
import { ProductType } from '../../../../types/product.type';
import { ProductService } from '../../../shared/services/product.service';
import { ProductCard } from '../../../shared/conponents/product-card/product-card';
import { CategoryWithTypeType } from '../../../../types/category-with-type.type';
import { ServiceCategory } from '../../../shared/services/service.category';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgClass } from '../../../../../node_modules/@angular/common/types/_common_module-chunk';
import { ActiveParamsType } from '../../../../types/active.params.type';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [ProductCard, FormsModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
})
export class Catalog implements OnInit {
  openCategoryIndex = signal<number | null>(null);
  products = signal<ProductType[]>([]);
  categoryWithType = signal<CategoryWithTypeType[]>([]);
  open = false;
  pages: number[] = [];

  selectedTypeUrls = signal<Set<string>>(new Set());
  heightFrom = signal<number | null>(null);
  heightTo = signal<number | null>(null);
  diameterFrom = signal<number | null>(null);
  diameterTo = signal<number | null>(null);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);

  activeFilters = signal<{ key: string; label: string; type: string; value?: any }[]>([]);

  constructor(
    private productService: ProductService,
    private serviceCategory: ServiceCategory,
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
    this.route.queryParams.subscribe((params) => {
      this.applyFiltersFromUrl(params);
    });
    this.loadCategoryWithTypes();
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

  loadProducts(): void {
    const params = this.getApiParams();
    params.page = this.currentPage(); // Добавляем параметр page
    params.limit = 12; // Количество товаров на странице
    this.productService.getProducts(params).subscribe({
      next: (response) => {
        this.pages = [];
        this.totalPages.set(response.pages || 1);

        for (let i = 1; i <= response.pages; i++) {
          this.pages.push(i);
        }
        this.products.set(response.items || []);
        console.log(response);
      },
      error: (err) => {
        console.error('Ошибка загрузки продуктов:', err);
      },
    });
  }
  loadCategoryWithTypes(): void {
    this.serviceCategory.getCategoryWithTypes().subscribe((items) => {
      console.log(items);
      this.categoryWithType.set(items);
    });
  }
  private getApiParams(): any {
    const params: any = {};

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
      this.currentPage.set(1);
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
    this.currentPage.set(1);
  }
  onHeightFromChange(value: string): void {
    this.heightFrom.set(value ? Number(value) : null);
    this.loadProducts();
    this.currentPage.set(1);
  }

  onHeightToChange(value: string): void {
    this.heightTo.set(value ? Number(value) : null);
    this.loadProducts();
    this.currentPage.set(1);
  }

  onDiameterFromChange(value: string): void {
    this.diameterFrom.set(value ? Number(value) : null);
    this.loadProducts();
    this.currentPage.set(1);
  }

  onDiameterToChange(value: string): void {
    this.diameterTo.set(value ? Number(value) : null);
    this.loadProducts();
    this.currentPage.set(1);
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

    if (this.currentPage() > 1) {
      queryParams.page = this.currentPage();
    }

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
    this.currentPage.set(1);
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
}
