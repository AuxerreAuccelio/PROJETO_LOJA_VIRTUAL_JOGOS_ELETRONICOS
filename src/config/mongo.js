const mongoose = require('mongoose');

async function conectarMongo() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI ausente no .env');

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log('MongoDB conectado');
}

module.exports = { conectarMongo };