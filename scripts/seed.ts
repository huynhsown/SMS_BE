import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ProductService } from '../src/product/product.service';
import { CategoryService } from '../src/category/category.service';
import { Category } from '../src/category/entities/category.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productService = app.get(ProductService);
  const categoryService = app.get(CategoryService);

  try {
    // Tạo category mẫu (nếu chưa có)
    const sampleCategories = [
      { name: 'Điện thoại', slug: 'dien-thoai' },
      { name: 'Laptop', slug: 'laptop' },
      { name: 'Tablet', slug: 'tablet' },
      { name: 'Phụ kiện', slug: 'phu-kien' }
    ];

    const categories: Category[] = [];
    for (const cat of sampleCategories) {
      try {
        const category = await categoryService.create(cat);
        categories.push(category);
        console.log(`Created category: ${category.name}`);
      } catch (error) {
        console.log(`Category ${cat.name} might already exist`);
        // For simplicity, we'll use hardcoded category IDs if they exist
        // In production, you'd want to implement getBySlug in CategoryService
      }
    }

    // If no categories were created (they already exist), skip product creation
    if (categories.length === 0) {
      console.log('No new categories created. Please check existing categories manually.');
      return;
    }

    // Tạo sản phẩm mẫu
    const sampleProducts = [
      {
        name: 'iPhone 15 Pro Max',
        slug: 'iphone-15-pro-max',
        images: ['https://via.placeholder.com/400x300?text=iPhone+15+Pro+Max'],
        stock: 50,
        price: 29990000,
        discountPrice: 27990000,
        discountPercent: 7,
        description: 'iPhone 15 Pro Max với chip A17 Pro mạnh mẽ',
        categoryId: categories[0]._id.toString()
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        slug: 'samsung-galaxy-s24-ultra',
        images: ['https://via.placeholder.com/400x300?text=Samsung+S24+Ultra'],
        stock: 30,
        price: 28990000,
        discountPrice: 25990000,
        discountPercent: 10,
        description: 'Samsung Galaxy S24 Ultra với bút S Pen',
        categoryId: categories[0]._id.toString()
      },
      {
        name: 'MacBook Pro M3',
        slug: 'macbook-pro-m3',
        images: ['https://via.placeholder.com/400x300?text=MacBook+Pro+M3'],
        stock: 25,
        price: 45990000,
        discountPrice: 43990000,
        discountPercent: 4,
        description: 'MacBook Pro với chip M3 siêu mạnh',
        categoryId: categories.length > 1 ? categories[1]._id.toString() : categories[0]._id.toString()
      },
      {
        name: 'Dell XPS 13',
        slug: 'dell-xps-13',
        images: ['https://via.placeholder.com/400x300?text=Dell+XPS+13'],
        stock: 40,
        price: 35990000,
        discountPrice: 32990000,
        discountPercent: 8,
        description: 'Dell XPS 13 siêu mỏng nhẹ',
        categoryId: categories.length > 1 ? categories[1]._id.toString() : categories[0]._id.toString()
      },
      {
        name: 'iPad Pro 12.9',
        slug: 'ipad-pro-12-9',
        images: ['https://via.placeholder.com/400x300?text=iPad+Pro+12.9'],
        stock: 35,
        price: 25990000,
        discountPrice: 23990000,
        discountPercent: 8,
        description: 'iPad Pro 12.9 inch với màn hình Liquid Retina',
        categoryId: categories.length > 2 ? categories[2]._id.toString() : categories[0]._id.toString()
      },
      {
        name: 'AirPods Pro',
        slug: 'airpods-pro',
        images: ['https://via.placeholder.com/400x300?text=AirPods+Pro'],
        stock: 100,
        price: 5990000,
        discountPrice: 4990000,
        discountPercent: 17,
        description: 'AirPods Pro với chống ồn chủ động',
        categoryId: categories.length > 3 ? categories[3]._id.toString() : categories[0]._id.toString()
      },
      {
        name: 'Apple Watch Series 9',
        slug: 'apple-watch-series-9',
        images: ['https://via.placeholder.com/400x300?text=Apple+Watch+S9'],
        stock: 60,
        price: 8990000,
        discountPrice: 7990000,
        discountPercent: 11,
        description: 'Apple Watch Series 9 với chip S9',
        categoryId: categories.length > 3 ? categories[3]._id.toString() : categories[0]._id.toString()
      },
      {
        name: 'Xiaomi 14 Ultra',
        slug: 'xiaomi-14-ultra',
        images: ['https://via.placeholder.com/400x300?text=Xiaomi+14+Ultra'],
        stock: 45,
        price: 22990000,
        discountPrice: 19990000,
        discountPercent: 13,
        description: 'Xiaomi 14 Ultra với camera Leica',
        categoryId: categories[0]._id.toString()
      }
    ];

    for (const product of sampleProducts) {
      try {
        const createdProduct = await productService.create(product);
        console.log(`Created product: ${createdProduct.name}`);
        
        // Simulate some views and sales
        const randomViews = Math.floor(Math.random() * 1000) + 100;
        const randomSales = Math.floor(Math.random() * 50) + 10;
        
        // Update view count and sold count manually
        await productService['productRepository'].update(
          { _id: createdProduct._id },
          { 
            viewCount: randomViews,
            soldCount: randomSales
          }
        );
        
      } catch (error) {
        console.log(`Product ${product.name} might already exist or error:`, error.message);
      }
    }

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await app.close();
  }
}

seed();
