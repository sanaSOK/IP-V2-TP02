import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface Category {
  id: number;
  name: string;
}

interface CategoryStore {
  categories: Category[];
  nextCategoryId: number;
}

@Injectable()
export class CategoryService {
  private dataFilePath = path.join(process.cwd(), 'src/data/categories.json');

  private readData(): CategoryStore {
    const data = fs.readFileSync(this.dataFilePath, 'utf-8');
    return JSON.parse(data);
  }

  private writeData(data: CategoryStore): void {
    fs.writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2));
  }

  findAll(): Category[] {
    const data = this.readData();
    return data.categories;
  }

  findOne(id: number): Category | undefined {
    const data = this.readData();
    return data.categories.find((cat) => cat.id === id);
  }

  create(data: { name: string }): Category {
    const store = this.readData();
    const category: Category = {
      id: store.nextCategoryId++,
      name: data.name,
    };
    store.categories.push(category);
    this.writeData(store);
    return category;
  }

  update(id: number, data: { name: string }): Category | undefined {
    const store = this.readData();
    const category = store.categories.find((cat) => cat.id === id);
    if (category) {
      category.name = data.name;
      this.writeData(store);
    }
    return category;
  }

  delete(id: number): boolean {
    const store = this.readData();
    const index = store.categories.findIndex((cat) => cat.id === id);
    if (index > -1) {
      store.categories.splice(index, 1);
      this.writeData(store);
      return true;
    }
    return false;
  }
}
