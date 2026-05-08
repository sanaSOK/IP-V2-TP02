import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number;
}

interface ProductStore {
  products: Product[];
  nextProductId: number;
}

@Injectable()
export class ProductService {
  private dataFilePath = path.join(process.cwd(), 'src/data/products.json');

  private readData(): ProductStore {
    const data = fs.readFileSync(this.dataFilePath, 'utf-8');
    return JSON.parse(data);
  }

  private writeData(data: ProductStore): void {
    fs.writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2));
  }

  findAll(): Product[] {
    const data = this.readData();
    return data.products;
  }

  findOne(id: number): Product | undefined {
    const data = this.readData();
    return data.products.find((prod) => prod.id === id);
  }

  findByCategory(categoryId: number): Product[] {
    const data = this.readData();
    return data.products.filter((prod) => prod.categoryId === categoryId);
  }

  create(data: { name: string; price: number; categoryId: number }): Product {
    const store = this.readData();
    const product: Product = {
      id: store.nextProductId++,
      name: data.name,
      price: data.price,
      categoryId: data.categoryId,
    };
    store.products.push(product);
    this.writeData(store);
    return product;
  }

  update(id: number, data: Partial<{ name: string; price: number; categoryId: number }>): Product | undefined {
    const store = this.readData();
    const product = store.products.find((prod) => prod.id === id);
    if (product) {
      Object.assign(product, data);
      this.writeData(store);
    }
    return product;
  }

  delete(id: number): boolean {
    const store = this.readData();
    const index = store.products.findIndex((prod) => prod.id === id);
    if (index > -1) {
      store.products.splice(index, 1);
      this.writeData(store);
      return true;
    }
    return false;
  }
}
