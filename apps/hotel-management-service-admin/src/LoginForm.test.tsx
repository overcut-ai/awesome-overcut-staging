import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LoginForm from "./LoginForm";
import { useLogin, useNotify } from "react-admin";

jest.mock("react-admin", () => ({
  useLogin: jest.fn(),
  useNotify: jest.fn(),
}));

describe("LoginForm", () => {
  const loginMock = jest.fn();
  const notifyMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useLogin as jest.Mock).mockReturnValue(loginMock);
    (useNotify as jest.Mock).mockReturnValue(notifyMock);
  });

  it("submits username and password via login", async () => {
    loginMock.mockResolvedValue(undefined);

    render(<LoginForm />);

    fireEvent.change(screen.getByRole("textbox", { name: /username/i }), {
      target: { value: "safari-user" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "secret-pass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() =>
      expect(loginMock).toHaveBeenCalledWith({
        username: "safari-user",
        password: "secret-pass",
      })
    );
  });

  it("shows loading state and disables form controls while submitting", async () => {
    let resolveLogin: (() => void) | undefined;
    loginMock.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveLogin = resolve;
        })
    );

    render(<LoginForm />);

    const usernameInput = screen.getByRole("textbox", { name: /username/i });
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(usernameInput, {
      target: { value: "pending-user" },
    });
    fireEvent.change(passwordInput, {
      target: { value: "pending-pass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(screen.getByRole("button", { name: /logging in\.\.\./i })).toBeDisabled();
    expect(usernameInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();

    resolveLogin?.();

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /log in/i })).toBeEnabled()
    );
  });

  it("notifies with backend error message when login fails", async () => {
    loginMock.mockRejectedValue(new Error("Wrong credentials"));

    render(<LoginForm />);

    fireEvent.change(screen.getByRole("textbox", { name: /username/i }), {
      target: { value: "bad-user" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "bad-pass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() =>
      expect(notifyMock).toHaveBeenCalledWith("Wrong credentials")
    );
  });

  it("uses fallback message when login fails without error message", async () => {
    loginMock.mockRejectedValue({});

    render(<LoginForm />);

    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() =>
      expect(notifyMock).toHaveBeenCalledWith(
        "Unable to log in. Please check your credentials."
      )
    );
  });
});
