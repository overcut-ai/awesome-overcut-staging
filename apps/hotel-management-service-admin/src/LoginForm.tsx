import { useState } from "react";
import { useLogin, useNotify } from "react-admin";
import { Button } from "@mui/material";
import "./login.scss";

const KNOWN_LOGIN_ERROR_MESSAGES = new Set([
  "Invalid username or password",
  "Unable to log in. Please check your credentials.",
  "Login failed due to an unexpected server response.",
]);

const getSafeLoginErrorMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : "";

  if (KNOWN_LOGIN_ERROR_MESSAGES.has(message)) {
    return message;
  }

  return "Unable to log in. Please check your credentials.";
};

const LoginForm = ({ theme }: any) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const login = useLogin();
  const notify = useNotify();
  const BASE_URI = process.env.REACT_APP_SERVER_URL;

  const submit = async (e: any) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ username, password });
    } catch (error: unknown) {
      notify(getSafeLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <label>
        <span>Username</span>

        <input
          name="username"
          type="textbox"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isSubmitting}
        />
      </label>
      <label>
        <span>Password</span>

        <input
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
        />
      </label>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Logging in..." : "Log in"}
      </Button>
    </form>
  );
};

export default LoginForm;
