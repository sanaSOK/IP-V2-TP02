import { Injectable } from '@nestjs/common';

export interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number;
}

@Injectable()
export class ProductService {
  private products: Product[] = [
    { id: 1, name: 'Laptop', price: 1200, categoryId: 1 },
    { id: 2, name: 'Mouse', price: 25, categoryId: 1 },
    { id: 3, name: 'JavaScript Book', price: 45, categoryId: 2 },
  ];
  private idCounter = 4;

  findAll(): Product[] {
    return this.products;
  }

  findOne(id: number): Product | undefined {
    return this.products.find((prod) => prod.id === id);
  }

  findByCategory(categoryId: number): Product[] {
    return this.products.filter((prod) => prod.categoryId === categoryId);
  }

  

  create(data: { name: string; price: number; categoryId: number }): Product {
    const product: Product = {
      id: this.idCounter++,
      name: data.name,
      price: data.price,
      categoryId: data.categoryId,
    };
    this.products.push(product);
    return product;
  }

  update(id: number, data: Partial<{ name: string; price: number; categoryId: number }>): Product | undefined {
    const product = this.findOne(id);
    if (product) {
      Object.assign(product, data);
    }
    return product;
  }

  delete(id: number): boolean {
    const index = this.products.findIndex((prod) => prod.id === id);
    if (index > -1) {
      this.products.splice(index, 1);
      return true;
    }
    return false;
  }
}
