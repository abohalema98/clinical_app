
import { ApolloServer, gql } from "apollo-server";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import express from "express";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const prisma = new PrismaClient();
config();


// Type definitions (schema)
const typeDefs = gql`
type User {
  id: Int!
  name: String
  password: String!
  email: String!
  role: String
}

  type Query {
    users: [User!]!
    user(id: Int!): User
  }

  type Mutation {
    create(name: String!, password: String!,email:String! ): User!
    update(id:Int,name: String!, password: String!,email:String!): User!
    delete(id: Int!): User
    register(email: String!, password: String!, name:String  ): User
    login(email: String!, password: String!): String
  }
`;

// Resolvers
const resolvers = {
  Query: {
    users: async () => {
      return await prisma.user.findMany();
    },
  },
  Mutation: {
    register: async (_, { email, password, name }) => {

      const user = await prisma.user.findUnique({ where: { email } });

      if (user) {
        throw new Error('email already exists');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      return await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name
        },
      });

    }, // register
    login: async (_, { email, password }) => {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        throw new Error('User not found');
      }

      const passwordMatch = await bcrypt.compare(password, user.password)

      if (!passwordMatch) {
        throw new Error('Invalid password');
      }

      const token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
      return token;

    }, // login 
    create: async (_, { name, password, email }) => {
      return await prisma.user.create({ data: { name, password, email } });
    },
    update: async (_, { id, name, password, email }) => {
      return prisma.user.update({ where: { id }, data: { name, password, email } });
    },
    delete: async (_, { id }) => {
      return prisma.user.delete({ where: { id } });
    }
  }
};


const server = new ApolloServer({ typeDefs, resolvers });


// Start the server
server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
