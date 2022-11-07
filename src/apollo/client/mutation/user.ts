import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation login($input: InputLogin) {
    login(input: $input) {
      token
    }
  }
`;

export const UPDATEUSER = gql`
  mutation updateUser($input: InputUser, $id: ID!) {
    updateUser(input: $input, id: $id) {
      id
    }
  }
`;

export const DELETEUSER = gql`
  mutation deleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
    }
  }
`;
