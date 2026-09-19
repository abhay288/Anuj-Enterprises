export const companyConfig = {
  name: import.meta.env.VITE_COMPANY_NAME || 'Anuj Enterprises',
  tagline: import.meta.env.VITE_COMPANY_TAGLINE || 'Authorized Wholesale FMCG & Confectionery Distributors',
  address: import.meta.env.VITE_COMPANY_ADDRESS || 'Anand Vihar Society, Koyla Nagar, Kanpur, Uttar Pradesh — 208021',
  phone: import.meta.env.VITE_COMPANY_PHONE || '+91 88876 83782',
  mobile: import.meta.env.VITE_COMPANY_MOBILE || '+91 70719 79894',
  supportPhones: ['+91 88876 83782', '+91 70719 79894'],
  email: import.meta.env.VITE_COMPANY_EMAIL || 'anujenterprises.fmcg.006@gmail.com',
  website: import.meta.env.VITE_COMPANY_WEBSITE || 'https://anujfmcg.com',
  signatory: import.meta.env.VITE_COMPANY_SIGNATORY || 'ANUJ',
  gstin: import.meta.env.VITE_COMPANY_GSTIN || '09AAFFA1234F1Z5',
  pan: import.meta.env.VITE_COMPANY_PAN || 'AAFFA1234F',
  fssai: import.meta.env.VITE_COMPANY_FSSAI || '12724055000189',
  state: 'Uttar Pradesh',
  stateCode: '09',
  placeOfSupply: 'Kanpur, Uttar Pradesh (09)',
  terms: [
    'Goods once inspected & accepted on delivery are covered under brand warranty.',
    'Payment due strictly on physical delivery handover / approved B2B credit terms.',
    'All disputes are subject to exclusive Kanpur, Uttar Pradesh jurisdiction.'
  ]
};
