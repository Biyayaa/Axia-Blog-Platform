const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 4000;
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/blog-dev';

mongoose.connect(MONGO)
  .then(()=> {
    console.log('MongoDB connected');
    app.listen(PORT, ()=> console.log(`Server running on ${PORT}`));
  })
  .catch(err => {
    console.error('DB connection error', err);
    process.exit(1);
  });
