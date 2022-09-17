import { gql } from 'apollo-server-micro';

const typeDefs = gql`
  #######################TYPES#######################

  type Role {
    id: ID
    name: String
    label: String
  }

  #######################INPUT#######################

  input InputRole {
    name: String!
    label: String
  }

  input FilterRole {
    id: ID
    name: String
    label: String
  }

  #######################QUERY#######################
  extend type Query {
    getRoles: [Role]
    getRoleById(id: ID!): Role
  }

  #######################MUTACION######################
  extend type Mutation {
    newRole(input: InputRole): Role
    updateRole(id: ID!, input: InputRole): Role
    deleteRole(id: ID!): Role
  }
`;

export default typeDefs;
