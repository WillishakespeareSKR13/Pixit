import { gql } from '@apollo/client';

export const NEWSALEORDER = gql`
  mutation newSaleOrder($input: InputSaleOrder) {
    newSaleOrder(input: $input) {
      id
      stripeId
      secret
      product {
        id
      }
      board {
        id
      }
      quantity
      total
      customer {
        id
        name
      }
      status
      colorsaleorder {
        id
      }
    }
  }
`;

export const NEWSALEORDERCASH = gql`
  mutation newSaleOrderCash($input: InputSaleOrder) {
    newSaleOrderCash(input: $input) {
      id
      stripeId
      secret
      product {
        id
      }
      board {
        id
      }
      quantity
      total
      customer {
        id
        name
      }
      status
      colorsaleorder {
        id
      }
    }
  }
`;

export const UPDATESALEORDER = gql`
  mutation updateSaleOrder($id: ID!, $input: InputSaleOrder) {
    updateSaleOrder(id: $id, input: $input) {
      id
      ticket
    }
  }
`;

export const SENDEMAIL = gql`
  mutation sendEmailSaleOrder($id: ID!, $email: String!) {
    sendMailSaleOrder(id: $id, email: $email) {
      message
    }
  }
`;
