/**
 * Slug generator and resolver for SEO-friendly, clean product URLs
 */

export const generateProductSlug = (product) => {
  if (!product) return '';
  const baseName = (product.name || 'product')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  const shortId = (product.sku || product.id || 'ae').toLowerCase().replace(/[^\w-]/g, '');
  return `${baseName}-${shortId}`;
};

export const findProductBySlugOrId = (products, slugOrId) => {
  if (!products || !slugOrId) return null;
  const target = String(slugOrId).toLowerCase().trim();

  // 1. Direct ID match
  const directMatch = products.find(p => String(p.id).toLowerCase() === target || String(p.productId || '').toLowerCase() === target);
  if (directMatch) return directMatch;

  // 2. Direct SKU match
  const skuMatch = products.find(p => String(p.sku || '').toLowerCase() === target);
  if (skuMatch) return skuMatch;

  // 3. Generated slug match
  const slugMatch = products.find(p => generateProductSlug(p) === target);
  if (slugMatch) return slugMatch;

  // 4. Fuzzy slug end-matching (e.g. ends with sku or id)
  const fuzzyMatch = products.find(p => {
    const pSlug = generateProductSlug(p);
    return target.includes(pSlug) || pSlug.includes(target) || (p.sku && target.endsWith(p.sku.toLowerCase()));
  });

  return fuzzyMatch || products[0] || null;
};
