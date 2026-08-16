import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/ui/Alert";
import type { Role } from "../types";

type FormValues = {
  email: string;
  password: string;
  role: Exclude<Role, "ADMIN">;
  firstName?: string;
  lastName?: string;
  businessName?: string;
};

export function RegisterPage() {
  const [params] = useSearchParams();
  const defaultRole = params.get("role") === "EMPLOYER" ? "EMPLOYER" : "HAIRDRESSER";
  const { register, handleSubmit, watch } = useForm<FormValues>({ defaultValues: { role: defaultRole } });
  const role = watch("role");
  const { register: createAccount } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-4xl">Create your account</h1>
      <p className="mt-2 text-sm text-ink-700">Hairdressers and employers can register. Admin accounts are issued by MMCollege.</p>
      <form
        className="card mt-8 space-y-4 p-6"
        onSubmit={handleSubmit(async (values) => {
          setError("");
          try {
            const user = await createAccount(values);
            navigate(user.role === "EMPLOYER" ? "/dashboard" : "/dashboard");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed");
          }
        })}
      >
        {error ? <Alert>{error}</Alert> : null}
        <div className="grid grid-cols-2 gap-2">
          {(["HAIRDRESSER", "EMPLOYER"] as const).map((option) => (
            <label key={option} className="card cursor-pointer px-3 py-3 text-center text-sm">
              <input type="radio" value={option} {...register("role")} className="mr-2" />
              {option === "HAIRDRESSER" ? "Hairdresser" : "Employer"}
            </label>
          ))}
        </div>
        {role === "HAIRDRESSER" ? (
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="First name" {...register("firstName")} />
            <input className="input" placeholder="Last name" {...register("lastName")} />
          </div>
        ) : (
          <input className="input" placeholder="Business name" {...register("businessName")} />
        )}
        <input className="input" type="email" placeholder="Email" {...register("email", { required: true })} />
        <input className="input" type="password" placeholder="Password (min 8 characters)" {...register("password", { required: true, minLength: 8 })} />
        <button className="btn-primary w-full" type="submit">
          Sign up
        </button>
        <p className="text-center text-sm text-ink-700">
          Already registered? <Link to="/login" className="font-semibold text-rose-600">Login</Link>
        </p>
      </form>
    </main>
  );
}
