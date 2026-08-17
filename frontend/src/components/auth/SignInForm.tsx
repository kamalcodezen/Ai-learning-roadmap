"use client";

import { authClient } from "@/src/lib/auth-client";
import { FormEvent, useState } from "react";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage("Signing in...");

    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) {
      setMessage(error.message ?? "Signin failed");
      return;
    }

    console.log("Signin successful:", data);
    setMessage("Signed in successfully!");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />

      <button type="submit">Sign In</button>

      <p>{message}</p>
    </form>
  );
}
