/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('../src/config/cloudinary');
const Product = require('../src/models/Product');

async function uploadLocalFile(filePath, folder) {
  const ext = path.extname(filePath).toLowerCase();
  const resourceType =
    ext === '.mp4' || ext === '.mov' || ext === '.webm' ? 'video' : 'image';
  return cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: resourceType,
  });
}

async function run() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('Missing MONGO_URI');
    process.exit(1);
  }
  const repoRoot = path.resolve(__dirname, '..', '..');
  const productsJsonPath = path.join(
    repoRoot,
    'client',
    'src',
    'data',
    'products.json'
  );
  const imagesRoot = path.join(repoRoot, 'client', 'public'); // so JSON urls like /images/... resolve

  await mongoose.connect(MONGO_URI, {
    dbName: process.env.MONGO_DB || 'katostore',
  });
  console.log('MongoDB connected');

  const raw = fs.readFileSync(productsJsonPath, 'utf-8');
  const products = JSON.parse(raw);

  for (const p of products) {
    try {
      const folder = `katostore/${p.category}/${p.sku}`;
      const uploadedMedia = [];
      for (const m of p.media || []) {
        let localPath = m.url;
        if (localPath.startsWith('/')) localPath = localPath.slice(1);
        const abs = path.join(imagesRoot, localPath);
        if (!fs.existsSync(abs)) {
          console.warn('File not found, skipping:', abs);
          continue;
        }
        const result = await uploadLocalFile(abs, folder);
        uploadedMedia.push({
          url: result.secure_url,
          type: result.resource_type === 'video' ? 'video' : 'image',
          order: m.order || 1,
        });
      }

      const payload = {
        sku: String(p.sku).toLowerCase(),
        name: p.name,
        description: p.description || '',
        category: p.category,
        brand: p.brand || undefined,
        price: p.price,
        originalPrice: p.originalPrice || undefined,
        discount: p.discount || undefined,
        stock: p.stock || 0,
        media: uploadedMedia,
        variants: Array.isArray(p.variants) ? p.variants : [],
        rating: p.rating || 0,
        reviews: p.reviews || 0,
        isActive: true,
      };

      const existing = await Product.findOne({ sku: payload.sku });
      if (existing) {
        await Product.updateOne({ sku: payload.sku }, payload);
        console.log('Updated:', payload.sku);
      } else {
        await Product.create(payload);
        console.log('Inserted:', payload.sku);
      }
    } catch (e) {
      console.error('Failed to import product', p?.sku, e.message);
    }
  }

  await mongoose.disconnect();
  console.log('Import finished');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
