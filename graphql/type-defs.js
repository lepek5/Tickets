const { gql } = require('apollo-server-express')

const typeDefs = gql`
  type User {
    role: String!
    name: String
    phone: String
    email: String!
    password: String!
    id: ID
    tickets: [Ticket]
    assigned: [Ticket]
  }
  input UserInput {
    role: String
    name: String
    phone: String
    email: String
    id: ID
  }
  type Comment {
    text: String
    author: User
    date: String
    ticket: Ticket
    id: ID
  }
  type Token {
      value: String!
  }
  type TicketContent {
    title: String
    text: String
  }
  input TicketContentInput {
    title: String
    text: String
  }
  input RegisterFormInput {
    email: String!
    password: String!
  }
  type Ticket {
    author: User
    date: String!
    content: TicketContent
    status: String
    id: ID
    order: Int
    comments: [Comment]
    assigned: [User]
  }
  type Mutation {
    removeUserFromTicket(id: String, uid: String): Ticket
    removeTicket(id: String!): Ticket
    removeComment(id: String, cid: String): Ticket
    removeUser(id: String!): User
      login(
          email: String!
          password: String!
      ): Token
      editUser(
        name: String
        phone: String
        email: String
        role: String
        id: String
      ): User
      editTicket(
        id: String
        status: String
      ): Ticket
      addComment(
        id: String
        text: String
        uid: String
      ): Comment
      addUser(
          email: String!
          password: String!
          id: ID
      ): User
      addUserToTicket(
        id: String
        userid: String
      ): User
      addTicket(
        content: TicketContentInput
        author: UserInput
        status: String
      ): Ticket
  }
  type Query {
    ticketsByUser(id: String): [Ticket]
    userCount: Int!
    ticketCount: Int!
    allUsers: [User!]!
    ticket(id: String!): Ticket
    findUser(id: String!): User
    me: User
    allTickets: [Ticket!]!
    findComment(id: String!): [Comment]
    comments: [Comment]
  }
`
module.exports = typeDefs