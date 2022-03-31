const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const schema = new mongoose.Schema({
  date: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  content: {
    title: String,
    text: String
  },
  order: {
    type: Number,
    required: true
  },
  tags: [
    {
      type: String
    }
  ],
  ticketStatus: {
    type: String,
    enum: ['pending', 'on-work', 'busy', 'solved'],
    default: 'pending'
  },
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ],
  assigned: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
  ]
})

schema.plugin(uniqueValidator)
const Tickets = mongoose.model('Tickets', schema)
module.exports = Tickets