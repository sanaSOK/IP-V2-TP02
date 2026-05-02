import { Injectable } from '@nestjs/common';

export interface Category {
  id: number;
  name: string;
}

@Injectable()
export class CategoryService {
  private categories: Category[] = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Books' },
  ];
  private idCounter = 3;

  findAll(): Category[] {
    return this.categories;
  }

  findOne(id: number): Category | undefined {
    return this.categories.find((cat) => cat.id === id);
  }

  create(data: { name: string }): Category {
    const category: Category = {
      id: this.idCounter++,
      name: data.name,
    };
    this.categories.push(category);
    return category;
  }

  update(id: number, data: { name: string }): Category | undefined {
    const category = this.findOne(id);
    if (category) {
      category.name = data.name;
    }
    return category;
  }

  delete(id: number): boolean {
    const index = this.categories.findIndex((cat) => cat.id === id);
    if (index > -1) {
      this.categories.splice(index, 1);
      return true;
    }
    return false;
  }
}
