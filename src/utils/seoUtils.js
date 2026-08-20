/**
 * Dynamic SEO, Meta tag and Schema.org JSON-LD manager for B2B Product Catalogue
 */

export const updatePageSEO = ({
  title,
  description,
  image,
  url,
  product = null
}) => {
  // 1. Update Title
  const siteTitle = 'Anuj Enterprises | B2B E-Commerce & FMCG Distribution Platform';
  document.title = title ? `${title} | Anuj Enterprises` : siteTitle;

  // 2. Helper to set or update meta tag
  const setMetaTag = (attr, key, content) => {
    let element = document.querySelector(`meta[${attr}="${key}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attr, key);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content || '');
  };

  // 3. Helper to set or update canonical link
  const setCanonical = (href) => {
    let element = document.querySelector('link[rel="canonical"]');
    if (!element) {
      element = document.createElement('link');
      element.setAttribute('rel', 'canonical');
      document.head.appendChild(element);
    }
    element.setAttribute('href', href || window.location.href);
  };

  const defaultDescription = 'Anuj Enterprises - Premium B2B Wholesale FMCG Sourcing and Enterprise Distribution Portal. Direct manufacturer pricing, GST invoicing, and bulk deliveries.';
  const currentDesc = description || defaultDescription;
  const currentUrl = url || window.location.href;
  const currentImage = image || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1200&q=80';

  // Standard Meta Tags
  setMetaTag('name', 'description', currentDesc);
  setMetaTag('name', 'robots', 'index, follow');

  // Open Graph Meta Tags
  setMetaTag('property', 'og:title', title ? `${title} | Anuj Enterprises` : siteTitle);
  setMetaTag('property', 'og:description', currentDesc);
  setMetaTag('property', 'og:image', currentImage);
  setMetaTag('property', 'og:url', currentUrl);
  setMetaTag('property', 'og:type', product ? 'product' : 'website');
  setMetaTag('property', 'og:site_name', 'Anuj Enterprises');

  // Twitter Card Tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', title ? `${title} | Anuj Enterprises` : siteTitle);
  setMetaTag('name', 'twitter:description', currentDesc);
  setMetaTag('name', 'twitter:image', currentImage);

  // Canonical Tag
  setCanonical(currentUrl);

  // 4. Inject or Update JSON-LD Structured Data Schema for Products
  const existingScript = document.getElementById('json-ld-product-schema');
  if (existingScript) {
    existingScript.remove();
  }

  if (product) {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': product.name,
      'image': product.gallery && product.gallery.length > 0 ? product.gallery : [product.image],
      'description': product.description || `${product.name} - B2B Wholesale Item by ${product.brand}`,
      'sku': product.sku,
      'brand': {
        '@type': 'Brand',
        'name': product.brand || 'Anuj Enterprises'
      },
      'category': product.category,
      'offers': {
        '@type': 'Offer',
        'priceCurrency': 'INR',
        'price': product.price || 0,
        'itemCondition': 'https://schema.org/NewCondition',
        'availability': product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        'seller': {
          '@type': 'Organization',
          'name': 'Anuj Enterprises'
        }
      }
    };

    const script = document.createElement('script');
    script.id = 'json-ld-product-schema';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }
};
