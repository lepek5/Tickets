const { v1: uuid } = require('uuid');
const bcrypt = require('bcrypt');
const User = require('../schemas/user');
const Tickets = require('../schemas/tickets');
const Comment = require('../schemas/comment');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const resolvers = {
  Query: {
    userCount: () => User.collection.countDocuments(),
    ticketCount: () => Tickets.collection.countDocuments(),
    allUsers: async (root, args) => {
      var debug = await User.find({}).populate('assigned');
      return debug;
    },
    findUser: async (root, args) => {
      const temp = await User.findById(args.id).populate('tickets');
      return temp;
    },
    ticket: async (root, args) => {
      var temp = await Tickets.findById(args.id).populate('assigned').populate('author');
      return temp;
    },
    me: (root, args, context) => context.user,
    allTickets: async () => {
      var debug = await Tickets.find({}).populate('assigned');
      return debug;
    },
    findComment: async (root, args) => {
      var debug = await Comment.find({ticket: args.id});
      return debug;
    },
    comments: async () => {
      var debug = await Comment.find({});
      return debug;
    },
    ticketsByUser: async (root, args) => {
      var debug = await Tickets.find({author: args.id})
    }
  },
  User: {
    tickets: async (parent) => {
      const res = await Tickets.find({author: parent._id.toString()});
      return res;
    },
    assigned: async (parent) => {
      let debug = await Tickets.find({assigned: parent._id})
      return debug;
    }
  },
  Ticket: {
    author: async (parent) => {
      var debug = await User.findOne(parent.author)
      return debug;
    },
    comments: async (parent) => {
      var debug = await Tickets.findById(parent._id);
      return debug.messages;
    },
    assigned: async (root) => {
      var temp = [];
      for (var user of root.assigned) {
        temp.push(await User.findById(user._id))
      }
      return temp;
    }
  },
  Comment: {
    author: async (root, args) => {
      var debug = await User.findOne({_id: root.author});
      return debug;
    },
    ticket: async (root, args) => {
      var debug = await Tickets.findOne({_id: root.ticket});
      return debug;
    }
  },
  Mutation: {
    editUser: async (root, args) => {
      let result = await User.findByIdAndUpdate(args.id, args)
      return result
    },
    editTicket: async (root, args) => {
      console.log('args',args)
      return await Tickets.findByIdAndUpdate(args.id, {
        ticketStatus: args.ticketStatus,
      });
    },
    addComment: async (root, args) => {
      var author = await User.findById({_id: args.uid});
      var ticket = await Tickets.findById({_id: args.id});
      const comment = new Comment({
        text: args.text,
        author: author ? author : 'unregistered',
        date: new Date(),
        ticket,
      });
      return comment.save();
    },
    removeUser: async (root, args) => {
      let result = await User.findByIdAndDelete(args.id)
      return result
    },
    removeComment: async (root, args) => {
      return await Tickets.findByIdAndUpdate(
        {
          _id: args.id
        },
        {
          $pull: {
            messages: {
              _id: args.cid
            }
          }
        }
      )
    },
    removeTicket: async (parent, args) => {
      let result = await Tickets.findByIdAndRemove(args.id)
      await User.findByIdAndUpdate(result.author, { $pull: { tickets: args.id } })
      return result
    },
    addUser: async (root, args) => {
      const user = {
        ...args,
        id: uuid(),
        password: await bcrypt.hash(args.password, 10)
      };
      const newUser = new User(user)
      await newUser.save()
      return newUser
    },
    removeUserFromTicket: async (root, args) => {
      return await Tickets.findByIdAndUpdate(args.id, { $pull: { assigned: args.uid }});
    },
    addUserToTicket: async (root, args) => {
      var user = await User.findOne({email: args.email});
      var ticket = await Tickets.findOneAndUpdate({_id: args.id}, {
        $addToSet: {
          assigned: user
        }
      })
      return ticket;
    },
    addTicket: async (root, args, { user }) => {
      var cu = await User.findById(user?.id);
      var count = await Tickets.collection.countDocuments();
      try {
        const ticket = { ...args, order: count + 1, date: new Date(), status: 'pending', author: cu ? cu : 'unregistered' }
        const newTicket = new Tickets(ticket)
        await newTicket.save()
        return newTicket
      } catch (error) {
        throw new Error(error.message, { invalidArgs: args })
      }
    },
    login: async (root, args) => {
      const user = await User.findOne({ email: args.email })
      if (!user) {
        return { value: 'user not found', status: 404 }
      }
      isValidPassword = await bcrypt.compare(args.password, user.password)
      if (!isValidPassword) return { value: 'wrong password', status: 400 }
      const userForToken = {
        email: user.email,
        id: user.id.toString(),
        role: user.role,
      }
      return { value: jwt.sign(userForToken, JWT_SECRET), status: 200 };
    }
  },
}
exports.resolvers = resolvers;