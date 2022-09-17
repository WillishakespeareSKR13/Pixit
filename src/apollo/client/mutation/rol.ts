import { gql } from '@apollo/client';

export const CREATEROLE = gql`
  mutation newRole($input: InputRole!) {
    newRole(input: $input) {
      id
      name
      label
    }
  }
`;

export const UPDATEROLE = gql`
  mutation updateRole($id: ID!, $input: InputRole!) {
    updateRole(id: $id, input: $input) {
      id
      name
      label
    }
  }
`;

export const DELETEROLE = gql`
  mutation deleteRole($id: ID!) {
    deleteRole(id: $id) {
      id
    }
  }
`;
