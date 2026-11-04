import { gql } from "@apollo/client/core";
import { AuthProvider } from "react-admin";
import {
  CREDENTIALS_LOCAL_STORAGE_ITEM,
  USER_DATA_LOCAL_STORAGE_ITEM,
} from "../constants";
import { Credentials, LoginMutateResult } from "../types";
import { apolloClient } from "../data-provider/graphqlDataProvider";

const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(credentials: { username: $username, password: $password }) {
      username
      accessToken
    }
  }
`;

export const jwtAuthProvider: AuthProvider = {
  login: async (credentials: Credentials) => {
    let userData: LoginMutateResult | null | undefined;

    try {
      const response = await apolloClient.mutate<LoginMutateResult>({
        mutation: LOGIN,
        variables: {
          ...credentials,
        },
      });
      userData = response.data;
    } catch {
      throw new Error(
        "Login failed. Please check your credentials and try again."
      );
    }

    const username = userData?.login?.username;
    const accessToken = userData?.login?.accessToken;

    if (!username || !accessToken) {
      throw new Error(
        "Login failed due to an unexpected server response. Please try again."
      );
    }

    localStorage.setItem(
      CREDENTIALS_LOCAL_STORAGE_ITEM,
      createBearerAuthorizationHeader(accessToken)
    );
    localStorage.setItem(USER_DATA_LOCAL_STORAGE_ITEM, JSON.stringify(userData));
    return Promise.resolve();
  },
  logout: () => {
    localStorage.removeItem(CREDENTIALS_LOCAL_STORAGE_ITEM);
    return Promise.resolve();
  },
  checkError: ({ status }: any) => {
    if (status === 401 || status === 403) {
      localStorage.removeItem(CREDENTIALS_LOCAL_STORAGE_ITEM);
      return Promise.reject();
    }
    return Promise.resolve();
  },
  checkAuth: () => {
    return localStorage.getItem(CREDENTIALS_LOCAL_STORAGE_ITEM)
      ? Promise.resolve()
      : Promise.reject();
  },
  getPermissions: () => Promise.reject("Unknown method"),
  getIdentity: () => {
    const str = localStorage.getItem(USER_DATA_LOCAL_STORAGE_ITEM);
    const userData: LoginMutateResult = JSON.parse(str || "");

    return Promise.resolve({
      id: userData.login.username,
      fullName: userData.login.username,
      avatar: undefined,
    });
  },
};

export function createBearerAuthorizationHeader(accessToken: string) {
  return `Bearer ${accessToken}`;
}
