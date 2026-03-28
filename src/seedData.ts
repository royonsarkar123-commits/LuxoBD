import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { db } from './firebase';
import { Product, Category } from './types';

const categories: Omit<Category, 'id'>[] = [
  { name: 'Men', slug: 'men', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1974&auto=format&fit=crop' },
  { name: 'Women', slug: 'women', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1974&auto=format&fit=crop' },
  { name: 'Hoodies', slug: 'hoodie', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1974&auto=format&fit=crop' },
  { name: 'T-Shirts', slug: 't-shirt', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1974&auto=format&fit=crop' },
];

const products: Omit<Product, 'id'>[] = [
  {
    name: 'Midnight Velvet Blazer',
    description: 'A premium velvet blazer in deep midnight black. Perfect for formal events and high-end evening wear.',
    price: 12500,
    discountPrice: 9500,
    category: 'men',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=1000&auto=format&fit=crop'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy'],
    stock: 25,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Golden Silk Evening Gown',
    description: 'Exquisite silk gown with hand-embroidered gold detailing. Designed for the ultimate luxury experience.',
    price: 25000,
    category: 'women',
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=1000&auto=format&fit=crop'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Gold', 'Champagne'],
    stock: 10,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Onyx Leather Jacket',
    description: 'Genuine Italian leather jacket with matte black hardware. A timeless piece for any luxury wardrobe.',
    price: 18000,
    discountPrice: 15000,
    category: 'men',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?q=80&w=1000&auto=format&fit=crop'
    ],
    sizes: ['M', 'L', 'XL'],
    colors: ['Black'],
    stock: 15,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Royal Cashmere Hoodie',
    description: 'Ultra-soft cashmere hoodie in a deep charcoal grey. Combines comfort with high-end luxury.',
    price: 8500,
    category: 'hoodie',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=1000&auto=format&fit=crop'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Charcoal', 'Black'],
    stock: 40,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Signature Gold Logo T-Shirt',
    description: 'Premium Pima cotton t-shirt featuring our signature RAYO logo in metallic gold foil.',
    price: 3500,
    category: 't-shirt',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'White'],
    stock: 100,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const seedDatabase = async () => {
  const productsSnap = await getDocs(query(collection(db, 'products'), limit(1)));
  if (productsSnap.empty) {
    console.log('Seeding database...');
    
    // Seed categories
    for (const cat of categories) {
      await addDoc(collection(db, 'categories'), cat);
    }
    
    // Seed products
    for (const prod of products) {
      await addDoc(collection(db, 'products'), prod);
    }
    
    console.log('Database seeded successfully!');
  }
};
