import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/ui/Alert";

type FormValues = { email: string; password: string };

export function LoginPage() {
  const { register, handleSubmit } = useForm<FormValues>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-4xl">Welcome back</h1>
      <p className="mt-2 text-sm text-ink-700">Sign in to manage your MM Connect profile.</p>
      <form
        className="card mt-8 space-y-4 p-6"
        onSubmit={handleSubmit(async (values) => {
          setError("");
          try {
            const user = await login(values.email, values.password);
            const from = (location.state as { from?: string } | null)?.from;
            navigate(from ?? (user.role === "ADMIN" ? "/admin" : "/dashboard"));
          } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
          }
        })}
      >
        {error ? <Alert>{error}</Alert> : null}
        <label className="block text-sm">
          Email
          <input className="input mt-1" type="email" {...register("email", { required: true })} />
        </label>
        <label className="block text-sm">
          Password
          <input className="input mt-1" type="password" {...register("password", { required: true })} />
        </label>
        <button className="btn-primary w-full" type="submit">
          Login
        </button>
        <p className="text-center text-sm text-ink-700">
          New here? <Link to="/register" className="font-semibold text-rose-600">Create an account</Link>
        </p>
      </form>
    </main>
  );
}
