import { doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { legacyProducts } from '../data/legacyProducts.js';

export async function migrateLegacyProducts() {
  const batch = writeBatch(db);

  legacyProducts.forEach((product, index) => {
    const reference = doc(db, 'products', product.id);
    batch.set(reference, {
      ...product,
      order: index,
      migratedFrom: 'legacy-v1',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  });

  await batch.commit();
  return legacyProducts.length;
}
