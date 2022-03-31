require('dotenv').config();
const { ApolloServer, gql, AuthenticationError, UserInputError } = require('apollo-server-express');
const databaseConnection = require('./controllers/database-connection');
databaseConnection();
const resolvers = require('./graphql/resolvers').resolvers;
const typeDefs = require('./graphql/type-defs');
const cors = require('cors');
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const setContext = require('apollo-link-context');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const User = require('./schemas/user');
const path = require('path');
var corsOptions = {
  origin: '*',
  credentials: true
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req.headers['authorization']
    if (auth && auth.toLocaleLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const user = await User.findById(decodedToken.id)
      return { user }
    }
  }
});

const startServer = async () => {
  await server.start()
  server.applyMiddleware({ app, cors: true })
};
startServer()
app.use(cors())
app.use(express.static(__dirname +'/build'))
app.get('*', (req,res) => {
  res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen({ port: PORT}, () =>
  console.log(`Server rready\n Http\t\t@http://localhost:${PORT}\n GraphQL\t@http://localhost:${PORT}${server.graphqlPath}`)
);