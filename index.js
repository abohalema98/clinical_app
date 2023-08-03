import { ApolloServer, gql } from "apollo-server";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();
config();


// Type definitions (schema)
const typeDefs = gql`
  type User {
    id: Int
    name: String
    password: String!
    email: String!
    role: String
  }

  type Clinicaldata {
    id: Int
    name: String
    status: String
    files: String
  }

  type Query {
    users: [User!]!
    user(id: Int!): User
    allClinicaldata: [Clinicaldata!]!
    clinicalQuery(id: Int!): Clinicaldata
  }

  type Mutation {
    create(
      name: String!
      status: String!
      files: String!
    ): Clinicaldata!
    update(
      id: Int
      name: String!
      status: String!
      files: String!
    ): Clinicaldata!
    delete(id: Int): Clinicaldata


    register(email: String!, password: String!, name: String): User
    login(email: String!, password: String!): String
  }
`;

// Resolvers
const resolvers = {
  Query: {
    users: async () => {
      return await prisma.user.findMany();
    },
    allClinicaldata: async () => {
      return await prisma.clinicalQuery.findMany();
    },
  },
  Mutation: {
    register: async (_, { email, password, name }) => {
      const user = await prisma.user.findUnique({ where: { email } });

      if (user) {
        throw new Error("email already exists");
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      return await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      });
    }, // register
    login: async (_, { email, password }) => {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        throw new Error("User not found");
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        throw new Error("Invalid password");
      }

      const token = jwt.sign(
        { id: user.id, role: "test role" },
        process.env.TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      return token;
    }, // login

    create: async (_, { name, status, files }) => {

      if (role !== "doctor") {
        return;
      } else {
        return await prisma.clinicalQuery.create({ data: { name, status, files } });
      }
    },
    update: async (_, { id, name, status, files }) => {
      if (role !== "doctor" && "assistant") {
        return;
      } else {
        return await prisma.clinicalQuery.update({
          where: { id },
          data: { name, status, files },
        });
      }
    },
    delete: async (_, { id, role }) => {
      if (role !== "doctor") {
        return;
      } else {
        return prisma.clinicalQuery.delete({ where: { id } });
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization || "";
    try {
      const user = jwt.verify(token, process.env.TOKEN_SECRET);
      return { user };
    } catch (err) {
      return { user: null };
    }
  },
});

// Start the server
server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
