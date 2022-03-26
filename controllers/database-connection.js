const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI;

const databaseConnection = () => {
  console.log('connecting to mongodb..')
mongoose.connect(MONGODB_URI).then(() => {
  console.log('connected')
}).catch(err => {
  console.log('error with mongodb', err.message)
})
}

module.exports = databaseConnection