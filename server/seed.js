// Seed file to populate Supabase with all 120 Veloura products
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CATALOGUE_PATH = path.resolve(__dirname, '../catalogue_120_products.json');

async function seedProducts() {
  console.log('🚀 Starting Veloura Supabase Seeder...');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-id') || supabaseKey.includes('your-supabase-anon-key')) {
    console.error('❌ Error: Valid SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) must be provided in .env');
    console.log('ℹ️  Example:');
    console.log('   SUPABASE_URL=https://xyzcompany.supabase.co');
    console.log('   SUPABASE_ANON_KEY=eyJhbGciOi...');
    process.exit(1);
  }

  if (!fs.existsSync(CATALOGUE_PATH)) {
    console.error(`❌ Error: Catalogue file not found at ${CATALOGUE_PATH}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(CATALOGUE_PATH, 'utf-8');
  const products = JSON.parse(rawData);

  console.log(`📦 Loaded ${products.length} products from catalogue_120_products.json`);

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  const formattedRows = products.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory,
    description: p.description,
    price: Number(p.price),
    original_price: p.originalPrice ? Number(p.originalPrice) : Number(p.price) * 1.3,
    discount_percent: p.discountPercent || 0,
    image: p.image,
    images: p.images || [p.image],
    sizes: p.sizes || ['S', 'M', 'L', 'XL'],
    colors: p.colors || [],
    in_stock: p.inStock ?? true,
    stock_quantity: p.stockQuantity ?? 25,
    rating: Number(p.rating || 4.5),
    review_count: Number(p.reviewCount || 50),
    is_best_seller: Boolean(p.isBestSeller),
    tags: p.tags || [],
    fabric: p.fabric || '100% Sustainable Cotton',
    care: p.care || 'Machine wash cold, delicate cycle',
    complete_the_look_ids: p.completeTheLookIds || [],
  }));

  // Batch insert in chunks of 30 to avoid payload limits
  const chunkSize = 30;
  let totalInserted = 0;

  for (let i = 0; i < formattedRows.length; i += chunkSize) {
    const chunk = formattedRows.slice(i, i + chunkSize);
    const { error } = await supabase
      .from('products')
      .upsert(chunk, { onConflict: 'id' });

    if (error) {
      console.error(`❌ Error seeding chunk ${i / chunkSize + 1}:`, error.message);
      process.exit(1);
    }
    totalInserted += chunk.length;
    console.log(`  ✓ Inserted/Updated items ${i + 1} to ${Math.min(i + chunkSize, formattedRows.length)}`);
  }

  console.log(`🎉 Successfully seeded all ${totalInserted} products into Supabase!`);
  console.log('   Category Breakdown: 30 Men, 30 Women, 30 Kids, 30 Infants.');
}

seedProducts().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
