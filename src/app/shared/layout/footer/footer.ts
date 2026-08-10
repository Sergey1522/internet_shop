import { Component, inject, OnInit, signal } from '@angular/core';
import { CategoryType } from '../../../../types/category.type';
import { ServiceCategory } from '../../services/service.category';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer implements OnInit {
  private readonly categoryService = inject(ServiceCategory);
  categories = signal<CategoryType[]>([]);

  ngOnInit(): void {
    this.categoryService.getCategory().subscribe((category: CategoryType[]) => {
      this.categories.set(category);
    });
  }
}
