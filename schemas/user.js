const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const bcrypt = require('bcrypt')

const schema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    default: 'User'
  },
  name: {
    type: String,
    minlength: 5
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    minlength: 5
  },
  email: {
    type: String,
    unique: true,
    required: true,
    minlength: 5
  },
  tickets: [
      {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Tickets'
      }
  ],
})

schema.set('toJSON', {
    transform: (document, returnedObject) => {
        delete returnedObject.__v
        delete returnedObject.password
    }
})

schema.methods.comparePassword = async function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    return cb(null, isMatch);
  })
}

schema.plugin(uniqueValidator)
const User = mongoose.model('User', schema)
module.exports = User