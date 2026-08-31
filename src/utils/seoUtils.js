/**
 * Dynamic SEO, Meta tag and Schema.org JSON-LD manager for B2B Product Catalogue & Storefront
 */

export const updatePageSEO = ({
  title,
  description,
  image,
  url,
  product = null,
  breadcrumbs = []
}) => {
  // 1. Update Document Title
  const siteTitle = 'Anuj Enterprises | B2B FMCG Wholesale & Enterprise Supply Platform | Kanpur';
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

  const defaultDescription = 'Anuj Enterprises is Uttar Pradesh\'s premier B2B FMCG wholesale distributor based in Kanpur. Direct factory wholesale supplies for Amul, Nestlé, Britannia, Cadbury, Colgate, Fortune, and HUL with fast delivery, flexible packaging tiers, and official B2B invoicing.';
  const currentDesc = description || defaultDescription;
  const currentUrl = url || window.location.href;
  const currentImage = image || 'https://anujfmcg.com/logo.png';

  // Standard Meta Tags
  setMetaTag('name', 'description', currentDesc);
  setMetaTag('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
  setMetaTag('name', 'author', 'Anuj Enterprises');

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

  // 4. Inject or Update JSON-LD Structured Data Schema for Products & Breadcrumbs
  const existingProductScript = document.getElementById('json-ld-dynamic-product-schema');
  if (existingProductScript) {
    existingProductScript.remove();
  }

  const existingBreadcrumbScript = document.getElementById('json-ld-dynamic-breadcrumb-schema');
  if (existingBreadcrumbScript) {
    existingBreadcrumbScript.remove();
  }

  if (product) {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': product.name,
      'image': product.gallery && product.gallery.length > 0 ? product.gallery : [product.image || 'https://anujfmcg.com/logo.png'],
      'description': product.description || `${product.name} - Official B2B Wholesale FMCG Item distributed by Anuj Enterprises Kanpur`,
      'sku': product.sku || product.id,
      'mpn': product.sku || product.id,
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
        'availability': (product.stock > 0 || product.status !== 'Out of Stock') ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        'seller': {
          '@type': 'Organization',
          'name': 'Anuj Enterprises',
          'url': 'https://anujfmcg.com/',
          'telephone': '+91-8887683782'
        }
      }
    };

    const script = document.createElement('script');
    script.id = 'json-ld-dynamic-product-schema';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }

  if (breadcrumbs && breadcrumbs.length > 0) {
    const breadcrumbList = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': breadcrumbs.map((bc, idx) => ({
        '@type': 'ListItem',
        'position': idx + 1,
        'name': bc.name,
        'item': bc.url
      }))
    };

    const bScript = document.createElement('script');
    bScript.id = 'json-ld-dynamic-breadcrumb-schema';
    bScript.type = 'application/ld+json';
    bScript.text = JSON.stringify(breadcrumbList);
    document.head.appendChild(bScript);
  }
};

