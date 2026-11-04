import { jwtAuthProvider } from "./ra-auth-jwt";
import {
  CREDENTIALS_LOCAL_STORAGE_ITEM,
  USER_DATA_LOCAL_STORAGE_ITEM,
} from "../constants";
import { apolloClient } from "../data-provider/graphqlDataProvider";

jest.mock("../data-provider/graphqlDataProvider", () => ({
  apolloClient: {
    mutate: jest.fn(),
  },
}));

describe("jwtAuthProvider.login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("stores credentials and user data on successful login", async () => {
    (apolloClient.mutate as jest.Mock).mockResolvedValue({
      data: {
        login: {
          username: "admin",
          accessToken: "token-123",
        },
      },
    });

    await expect(
      jwtAuthProvider.login({ username: "admin", password: "password" })
    ).resolves.toBeUndefined();

    expect(localStorage.getItem(CREDENTIALS_LOCAL_STORAGE_ITEM)).toBe(
      "Bearer token-123"
    );
    expect(localStorage.getItem(USER_DATA_LOCAL_STORAGE_ITEM)).toBe(
      JSON.stringify({
        login: {
          username: "admin",
          accessToken: "token-123",
        },
      })
    );
  });

  it("throws sanitized error when mutate rejects", async () => {
    (apolloClient.mutate as jest.Mock).mockRejectedValue(
      new Error("GraphQL timeout details")
    );

    await expect(
      jwtAuthProvider.login({ username: "admin", password: "password" })
    ).rejects.toThrow(
      "Login failed. Please check your credentials and try again."
    );

    expect(localStorage.getItem(CREDENTIALS_LOCAL_STORAGE_ITEM)).toBeNull();
    expect(localStorage.getItem(USER_DATA_LOCAL_STORAGE_ITEM)).toBeNull();
  });

  it("throws invalid payload error when response is missing login", async () => {
    (apolloClient.mutate as jest.Mock).mockResolvedValue({
      data: {},
    });

    await expect(
      jwtAuthProvider.login({ username: "admin", password: "password" })
    ).rejects.toThrow(
      "Login failed due to an unexpected server response. Please try again."
    );
  });

  it("throws invalid payload error when username is missing", async () => {
    (apolloClient.mutate as jest.Mock).mockResolvedValue({
      data: {
        login: {
          accessToken: "token-only",
        },
      },
    });

    await expect(
      jwtAuthProvider.login({ username: "admin", password: "password" })
    ).rejects.toThrow(
      "Login failed due to an unexpected server response. Please try again."
    );
  });

  it("throws invalid payload error when accessToken is missing", async () => {
    (apolloClient.mutate as jest.Mock).mockResolvedValue({
      data: {
        login: {
          username: "admin",
        },
      },
    });

    await expect(
      jwtAuthProvider.login({ username: "admin", password: "password" })
    ).rejects.toThrow(
      "Login failed due to an unexpected server response. Please try again."
    );
  });
});
