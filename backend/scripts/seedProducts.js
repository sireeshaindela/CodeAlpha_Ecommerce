require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/database');
const Product = require('../models/Product');
const User = require('../models/User');

const sampleProducts = [
  {
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Immersive sound experience with active noise cancellation, 40-hour battery life, and ultra-soft memory foam earcups.',
    price: 349900, // ₹3,499.00
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 25,
    featured: true,
    isActive: true
  },
  {
    name: 'Smart Fitness Tracker Watch',
    description: 'Track your heart rate, sleep quality, daily steps, and workout metrics with full AMOLED display and water resistance up to 50m.',
    price: 249900, // ₹2,499.00
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 40,
    featured: true,
    isActive: true
  },
  {
    name: 'Ergonomic Wireless Optical Mouse',
    description: 'Silent click switches, 2.4GHz wireless and Bluetooth 5.0 dual-mode connectivity with adjustable DPI settings up to 4000.',
    price: 89900, // ₹899.00
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 50,
    featured: false,
    isActive: true
  },
  {
    name: 'Mechanical RGB Gaming Keyboard',
    description: 'Tenkeyless tactile switches, customizable per-key RGB backlighting, durable aluminum frame, and detachable USB-C braided cable.',
    price: 289900, // ₹2,899.00
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 20,
    featured: true,
    isActive: true
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: 'Rich 360-degree stereo sound with deep bass, IPX7 waterproof casing, and 15-hour continuous playback for outdoor adventures.',
    price: 179900, // ₹1,799.00
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 30,
    featured: false,
    isActive: true
  },
  {
    name: 'Adjustable Aluminum Phone & Tablet Stand',
    description: 'Heavy-duty foldable desk mount with dual hinges, anti-slip silicone pads, and cable cutout for hands-free video calls.',
    price: 59900, // ₹599.00
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 65,
    featured: false,
    isActive: true
  },
  {
    name: 'Waterproof Laptop Travel Backpack',
    description: 'Padded compartment accommodating laptops up to 15.6 inches, integrated USB charging port, anti-theft back pocket, and breathable mesh back.',
    price: 199900, // ₹1,999.00
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 35,
    featured: true,
    isActive: true
  },
  {
    name: 'Minimalist Matte Phone Case',
    description: 'Shock-absorbent bumper case with raised camera lip, scratch-resistant matte finish, and precise cutouts for buttons and ports.',
    price: 39900, // ₹399.00
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 80,
    featured: false,
    isActive: true
  },
  {
    name: '7-in-1 Aluminum USB-C Hub',
    description: 'Multiport adapter featuring 4K HDMI, 100W Power Delivery, SD/TF card reader slots, and 3 USB 3.0 super-speed ports.',
    price: 149900, // ₹1,499.00
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 45,
    featured: false,
    isActive: true
  },
  {
    name: 'Dimmable LED Desk Lamp with USB Port',
    description: 'Eye-caring architectural desk lamp with 5 color temperatures, 7 brightness levels, flexible gooseneck, and built-in USB charging port.',
    price: 129900, // ₹1,299.00
    category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 28,
    featured: true,
    isActive: true
  },
  {
    name: 'Insulated Stainless Steel Water Bottle (750ml)',
    description: 'Double-wall vacuum insulation keeps cold drinks iced for 24 hours and hot coffee steaming for 12 hours. BPA-free leakproof lid.',
    price: 74900, // ₹749.00
    category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 55,
    featured: false,
    isActive: true
  },
  {
    name: 'Aroma Diffuser & Cool Mist Humidifier',
    description: 'Ultrasonic whisper-quiet essential oil diffuser with 7 ambient mood lights, auto-off protection, and 300ml water tank capacity.',
    price: 119900, // ₹1,199.00
    category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 22,
    featured: false,
    isActive: true
  },
  {
    name: 'Classic Oxford Cotton Button-Down Shirt',
    description: 'Tailored fit 100% breathable combed cotton with button-down collar and chest pocket. Comfortable all-day formal and casual wear.',
    price: 149900, // ₹1,499.00
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 30,
    featured: true,
    isActive: true
  },
  {
    name: 'Canvas Weekender Duffel Bag',
    description: 'Rugged vintage canvas travel holdall with genuine leather trim, dedicated shoe compartment, and padded shoulder strap.',
    price: 219900, // ₹2,199.00
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 18,
    featured: false,
    isActive: true
  }
];

/**
 * Core seeding function that works on the active Mongoose connection
 */
async function populateData() {
  let createdCount = 0;
  let updatedCount = 0;

  for (const prod of sampleProducts) {
    const existing = await Product.findOne({ name: prod.name });
    if (existing) {
      await Product.updateOne({ _id: existing._id }, { $set: prod });
      updatedCount++;
    } else {
      await Product.create(prod);
      createdCount++;
    }
  }

  console.log(`[Seed] Products processed: ${createdCount} created, ${updatedCount} updated (Total: ${sampleProducts.length}).`);

  // Demo Accounts
  const customerEmail = 'customer@shopeasy.com';
  let customer = await User.findOne({ email: customerEmail });
  if (!customer) {
    customer = new User({
      name: 'Demo Customer',
      email: customerEmail,
      password: 'Password123',
      role: 'customer',
      phone: '+91 98765 43210',
      shippingAddress: {
        street: '123 MG Road, Flat 4B',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'India'
      }
    });
    await customer.save();
    console.log(`[Seed] Created demo customer account: ${customerEmail} (Password: Password123)`);
  }

  const adminEmail = 'admin@shopeasy.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = new User({
      name: 'ShopEasy Administrator',
      email: adminEmail,
      password: 'AdminPass123',
      role: 'admin',
      phone: '+91 98765 00000',
      shippingAddress: {
        street: 'Admin Towers, Tech Park',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560100',
        country: 'India'
      }
    });
    await admin.save();
    console.log(`[Seed] Created demo admin account: ${adminEmail} (Password: AdminPass123)`);
  }
}

async function seed() {
  console.log('[Seed] Starting database seeding process...');
  try {
    await connectDB();
    await populateData();
    console.log('[Seed] Database seeding completed successfully!');
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

if (require.main === module) {
  seed();
}

module.exports = {
  seed,
  populateData,
  sampleProducts
};
