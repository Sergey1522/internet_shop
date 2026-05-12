import { Component, OnInit, signal } from '@angular/core';
import { CategoryType } from '../../../../types/category.type';
import { ServiceCategory } from '../../services/service.category';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer implements OnInit {
  categories = signal<CategoryType[]>([]);

  constructor(private categoryService: ServiceCategory) {}

  ngOnInit(): void {
    this.categoryService.getCategory().subscribe((category: CategoryType[]) => {
      console.log(category);
      this.categories.set(category);
    });
  }
}
