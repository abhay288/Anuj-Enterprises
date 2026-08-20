export const companyConfig = {
  name: import.meta.env.VITE_COMPANY_NAME || 'Anuj Enterprises',
  tagline: import.meta.env.VITE_COMPANY_TAGLINE || 'Your Trusted B2B Supply Partner',
  address: import.meta.env.VITE_COMPANY_ADDRESS || 'Kanpur, Uttar Pradesh',
  phone: import.meta.env.VITE_COMPANY_PHONE || '+91 88876 83782',
  mobile: import.meta.env.VITE_COMPANY_MOBILE || '+91 70719 79894',
  supportPhones: ['+91 88876 83782', '+91 70719 79894'],
  email: import.meta.env.VITE_COMPANY_EMAIL || 'anujenterprises.fmcg.006@gmail.com',
  website: import.meta.env.VITE_COMPANY_WEBSITE || 'https://anujenterprises.com',
  signatory: import.meta.env.VITE_COMPANY_SIGNATORY || 'Anuj Sharma (Managing Director)',
  terms: [
    'Collection is offline and marked as Pending upon invoice creation.',
    'Customer Classification (Normal / Damage / Expiry) determines inspection rules.',
    'Disputes subject to Kanpur Jurisdiction only.'
  ]
};
