import mongoose from 'mongoose';
const uri = 'mongodb+srv://anujenterprisesfmcg006_db_user:cXAYumLKip9B3SSF@anujenterprises.nix5vcy.mongodb.net/?appName=Anujenterprises';

async function inspect() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) throw new Error('No DB');
  
  const companies = await db.collection('companies').find({}).toArray();
  console.log('COMPANIES IN DB:', companies.length);
  companies.forEach(c => console.log(`Company: "${c.name}", Rank: ${c.rank}, Status: ${c.status}, ID: ${c._id}`));

  const categories = await db.collection('categories').find({}).toArray();
  console.log('\nCATEGORIES IN DB:', categories.length);
  categories.forEach(c => console.log(`Category: "${c.name}", Status: ${c.status}, ID: ${c._id}`));

  // Check support tickets
  const collections = await db.listCollections().toArray();
  console.log('\nCOLLECTIONS IN DB:', collections.map(c => c.name));

  process.exit(0);
}

inspect().catch(e => { console.error(e); process.exit(1); });
