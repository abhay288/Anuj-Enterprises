import dotenv from 'dotenv';

dotenv.config();

export const companyConfig = {
  name: process.env.COMPANY_NAME || 'Anuj Enterprises',
  tagline: process.env.COMPANY_TAGLINE || 'Your Trusted B2B Supply Partner',
  address: process.env.COMPANY_ADDRESS || 'Kanpur, Uttar Pradesh',
  phone: process.env.COMPANY_PHONE || '+91 88876 83782',
  mobile: process.env.COMPANY_MOBILE || '+91 70719 79894',
  supportPhones: ['+91 88876 83782', '+91 70719 79894'],
  email: process.env.COMPANY_EMAIL || 'anujenterprises.fmcg.006@gmail.com',
  website: process.env.COMPANY_WEBSITE || 'https://anujenterprises.com',
  signatory: process.env.COMPANY_SIGNATORY || 'Anuj Sharma (Managing Director)',
  resendApiKey: process.env.RESEND_API_KEY || ''
};
