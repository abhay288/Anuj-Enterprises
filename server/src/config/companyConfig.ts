import dotenv from 'dotenv';

dotenv.config();

export const companyConfig = {
  name: process.env.COMPANY_NAME || 'Anuj Enterprises',
  tagline: process.env.COMPANY_TAGLINE || 'Authorized Wholesale FMCG & Confectionery Distributors',
  address: process.env.COMPANY_ADDRESS || 'Anand Vihar Society, Koyla Nagar, Kanpur, Uttar Pradesh — 208021',
  phone: process.env.COMPANY_PHONE || '+91 88876 83782',
  mobile: process.env.COMPANY_MOBILE || '+91 70719 79894',
  supportPhones: ['+91 88876 83782', '+91 70719 79894'],
  email: process.env.COMPANY_EMAIL || 'anujenterprises.fmcg.006@gmail.com',
  website: process.env.COMPANY_WEBSITE || 'https://anujfmcg.com',
  signatory: process.env.COMPANY_SIGNATORY || 'ANUJ',
  gstin: process.env.COMPANY_GSTIN || '09AAFFA1234F1Z5',
  pan: process.env.COMPANY_PAN || 'AAFFA1234F',
  fssai: process.env.COMPANY_FSSAI || '12724055000189',
  state: 'Uttar Pradesh',
  stateCode: '09',
  placeOfSupply: 'Kanpur, Uttar Pradesh (09)',
  resendApiKey: process.env.RESEND_API_KEY || ''
};
