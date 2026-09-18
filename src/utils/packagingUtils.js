/**
 * Packaging and Unit Utility for FMCG / Kirana B2B Wholesale Catalogue
 * Supports flexible dynamic packaging levels: Unit, Pack, Bundle, Mala, Bori, Case, Carton, Custom Packaging.
 * Rule: Admin controls what is displayed. If filled -> show it. If empty -> hide it. Never show empty/hardcoded values.
 */

export const UNIT_TYPES = [
  'Piece',
  'Gram (g)',
  'Kilogram (kg)',
  'Millilitre (ml)',
  'Litre (L)',
  'Packet',
  'Box',
  'Bottle',
  'Pouch',
  'Bundle',
  'Mala',
  'Bori',
  'Case',
  'Carton',
  'Dozen',
  'Other'
];

/**
 * Check if a packaging value is empty, zero, or unconfigured
 */
export const isZeroOrEmpty = (val) => {
  if (val === null || val === undefined) return true;
  const str = String(val).trim();
  if (!str || str === '' || str === '-' || str === '0' || str.toLowerCase() === 'none' || str.toLowerCase() === 'n/a') {
    return true;
  }
  return false;
};

/**
 * Extract list of all configured packaging levels for a product.
 * Returns only non-empty, Admin-defined packaging specifications.
 */
export const getPackagingLevels = (product) => {
  if (!product) return [];
  const levels = [];

  // 1. Unit Quantity & Unit Type
  const unitVal = product.unitQuantity ? String(product.unitQuantity).trim() : (product.unitDetail ? String(product.unitDetail).trim() : '');
  const unitType = product.unitType ? String(product.unitType).trim() : '';

  if (!isZeroOrEmpty(unitVal)) {
    levels.push({
      key: 'unit',
      label: 'Unit',
      value: unitVal,
      tag: unitType || 'Unit'
    });
  } else if (!isZeroOrEmpty(unitType) && unitType !== 'Other') {
    levels.push({
      key: 'unit',
      label: 'Unit Type',
      value: unitType,
      tag: 'Unit'
    });
  }

  // 2. Pack Size
  if (!isZeroOrEmpty(product.packSize)) {
    levels.push({
      key: 'pack',
      label: 'Pack',
      value: String(product.packSize).trim(),
      tag: 'Pack'
    });
  }

  // 3. Bundle Size
  if (!isZeroOrEmpty(product.bundleSize)) {
    levels.push({
      key: 'bundle',
      label: 'Bundle',
      value: String(product.bundleSize).trim(),
      tag: 'Bundle'
    });
  }

  // 4. Mala Size
  if (!isZeroOrEmpty(product.malaSize)) {
    levels.push({
      key: 'mala',
      label: 'Mala',
      value: String(product.malaSize).trim(),
      tag: 'Mala'
    });
  }

  // 5. Bori Size
  if (!isZeroOrEmpty(product.boriSize)) {
    levels.push({
      key: 'bori',
      label: 'Bori',
      value: String(product.boriSize).trim(),
      tag: 'Bori'
    });
  }

  // 6. Case Size
  if (!isZeroOrEmpty(product.caseSize)) {
    levels.push({
      key: 'case',
      label: 'Case',
      value: String(product.caseSize).trim(),
      tag: 'Case'
    });
  }

  // 7. Carton Size
  if (!isZeroOrEmpty(product.cartonSize)) {
    levels.push({
      key: 'carton',
      label: 'Carton',
      value: String(product.cartonSize).trim(),
      tag: 'Carton'
    });
  }

  // 8. Custom Packaging / Breakdown Notes
  if (!isZeroOrEmpty(product.customPackaging)) {
    levels.push({
      key: 'custom',
      label: 'Packaging Breakdown',
      value: String(product.customPackaging).trim(),
      tag: 'Breakdown'
    });
  }

  return levels;
};

/**
 * Returns whether a product has at least one configured packaging detail
 */
export const hasConfiguredPackaging = (product) => {
  return getPackagingLevels(product).length > 0;
};

/**
 * Returns a concise formatted packaging string for cards, invoices, tables
 */
export const formatPackagingSummary = (product, separator = ' • ') => {
  const levels = getPackagingLevels(product);
  if (!levels.length) return '';
  return levels.map(l => `${l.label}: ${l.value}`).join(separator);
};

/**
 * Validate packaging inputs before saving
 */
export const validatePackagingInputs = (form) => {
  if (!form) return { isValid: true };

  const fieldsToCheck = [
    { key: 'unitQuantity', name: 'Unit Quantity' },
    { key: 'packSize', name: 'Pack Size' },
    { key: 'bundleSize', name: 'Bundle Size' },
    { key: 'malaSize', name: 'Mala Size' },
    { key: 'boriSize', name: 'Bori Size' },
    { key: 'caseSize', name: 'Case Size' },
    { key: 'cartonSize', name: 'Carton Size' }
  ];

  for (const field of fieldsToCheck) {
    const val = form[field.key];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      const str = String(val).trim();
      // Check for strictly negative numbers (e.g. -5, -10kg)
      if (/^-\d+/.test(str)) {
        return {
          isValid: false,
          message: `${field.name} cannot be a negative value.`
        };
      }
      // Check for zero only (e.g. "0", "0 pcs", "0 units")
      if (/^0\s*(pc|pcs|piece|pieces|unit|units|kg|g|ml|l|box|packet)?$/i.test(str)) {
        return {
          isValid: false,
          message: `${field.name} cannot be 0. Please enter a valid quantity or leave it empty.`
        };
      }
    }
  }

  return { isValid: true };
};

/**
 * Safe Image Resolution for Products
 * Extracts clean string image URL whether stored as string, array, or object
 */
export const getProductImageUrl = (product) => {
  if (!product) return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80';
  const extract = (it) => {
    if (!it) return '';
    if (typeof it === 'string') return it.trim();
    if (typeof it === 'object') return (it.url || it.secure_url || it.src || '').trim();
    return '';
  };

  const primary = extract(product.image);
  if (primary) return primary;

  if (Array.isArray(product.images) && product.images.length > 0) {
    const first = extract(product.images[0]);
    if (first) return first;
  }

  if (Array.isArray(product.gallery) && product.gallery.length > 0) {
    const first = extract(product.gallery[0]);
    if (first) return first;
  }

  return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80';
};

export const getProductImages = (product) => {
  if (!product) return ['https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80'];
  const extract = (it) => {
    if (!it) return '';
    if (typeof it === 'string') return it.trim();
    if (typeof it === 'object') return (it.url || it.secure_url || it.src || '').trim();
    return '';
  };

  const raw = (Array.isArray(product.images) && product.images.length > 0)
    ? product.images
    : ((Array.isArray(product.gallery) && product.gallery.length > 0)
      ? product.gallery
      : (product.image ? [product.image] : []));

  const clean = raw.map(extract).filter(Boolean);
  return clean.length > 0 ? clean : ['https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80'];
};
