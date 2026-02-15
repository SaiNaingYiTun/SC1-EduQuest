require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eduquest';

async function deduplicateArrayField(collection, field) {
  const docs = await collection.find({ [field]: { $exists: true } }).toArray();
  for (const doc of docs) {
    const arr = doc[field] || [];
    const deduped = [...new Set(arr.map(String))];
    if (arr.length !== deduped.length) {
      await collection.updateOne(
        { _id: doc._id },
        { $set: { [field]: deduped } }
      );
      console.log(`Deduplicated ${field} for document ${doc._id}`);
    }
  }
}

async function main() {
  await mongoose.connect(MONGODB_URI);

  const userCollection = mongoose.connection.collection('users');
  const studentStateCollection = mongoose.connection.collection('studentstates');

  await deduplicateArrayField(userCollection, 'studentClasses');
  await deduplicateArrayField(studentStateCollection, 'studentClasses');

  await mongoose.disconnect();
  console.log('Deduplication complete!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});