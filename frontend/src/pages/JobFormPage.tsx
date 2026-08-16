import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../services/api";
import type { Qualification, Skill } from "../types";
import { Alert } from "../components/ui/Alert";

export function JobFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void api.get("/skills").then(({ data }) => setSkills(data.items));
    void api.get("/qualifications").then(({ data }) => setQualifications(data.items));
    if (id) {
      void api.get(`/jobs/${id}`).then(({ data }) => {
        reset({
          ...data.job,
          skillIds: data.job.requiredSkills?.map((item: { skill: Skill }) => item.skill.id) ?? []
        });
      });
    }
  }, [id, reset]);

  return (
    <div>
      <h1 className="font-display text-4xl">{id ? "Edit job" : "Create job"}</h1>
      <form
        className="card mt-6 grid gap-3 p-6"
        onSubmit={handleSubmit(async (values) => {
          setError("");
          const payload = {
            ...values,
            requiredExperienceYears: values.requiredExperienceYears ? Number(values.requiredExperienceYears) : undefined,
            skillIds: Array.isArray(values.skillIds) ? values.skillIds : values.skillIds ? [values.skillIds] : []
          };
          try {
            const { data } = id
              ? await api.put(`/jobs/${id}`, payload)
              : await api.post("/jobs", payload);
            navigate(`/jobs/${data.job.id}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Could not save job");
          }
        })}
      >
        {error ? <Alert>{error}</Alert> : null}
        <input className="input" placeholder="Job title" {...register("title", { required: true })} />
        <textarea className="input min-h-32" placeholder="Description" {...register("description", { required: true })} />
        <input className="input" placeholder="Location" {...register("location", { required: true })} />
        <select className="input" {...register("employmentType", { required: true })}>
          <option value="FULL_TIME">Full time</option>
          <option value="PART_TIME">Part time</option>
          <option value="CASUAL">Casual</option>
          <option value="CONTRACT">Contract</option>
          <option value="APPRENTICESHIP">Apprenticeship</option>
        </select>
        <input className="input" placeholder="Salary display (optional)" {...register("salaryDisplay")} />
        <input className="input" type="number" placeholder="Required years of experience" {...register("requiredExperienceYears")} />
        <select className="input" {...register("requiredQualificationId")}>
          <option value="">Required qualification</option>
          {qualifications.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <select className="input" multiple {...register("skillIds")}>
          {skills.map((skill) => (
            <option key={skill.id} value={skill.id}>{skill.name}</option>
          ))}
        </select>
        <select className="input" {...register("status")}>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="CLOSED">Closed</option>
        </select>
        <button className="btn-primary" type="submit">Save job</button>
      </form>
    </div>
  );
}
