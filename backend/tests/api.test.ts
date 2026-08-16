import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/config/prisma.js";

const app = createApp();
const suffix = Date.now();

const hairEmail = `hair.${suffix}@example.com`;
const employerEmail = `employer.${suffix}@example.com`;
const password = "ValidPass123!";

let hairToken = "";
let employerToken = "";
let adminToken = "";
let hairProfileId = "";
let jobId = "";
let credentialId = "";
let skillId = "";
let qualificationId = "";

beforeAll(async () => {
  const skill = await prisma.skill.findFirst({ where: { isActive: true } });
  const qualification = await prisma.qualification.findFirst({ where: { isActive: true } });
  if (!skill || !qualification) {
    throw new Error("Seed the database before running tests (npm run db:seed)");
  }
  skillId = skill.id;
  qualificationId = qualification.id;

  const admin = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@mmcollege.example", password: "DemoPass123!" });
  if (admin.status !== 200) {
    throw new Error("Admin seed login failed. Run npm run db:seed.");
  }
  adminToken = admin.body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("authentication", () => {
  it("rejects admin self-registration", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: `admin.${suffix}@example.com`,
      password,
      role: "ADMIN"
    });
    expect(res.status).toBe(400);
  });

  it("rejects invalid registration payloads", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "not-an-email",
      password: "short",
      role: "HAIRDRESSER"
    });
    expect(res.status).toBe(400);
  });

  it("registers a hairdresser", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: hairEmail,
      password,
      role: "HAIRDRESSER",
      firstName: "Test",
      lastName: "Stylist"
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.body.user.role).toBe("HAIRDRESSER");
    hairToken = res.body.token;
    hairProfileId = res.body.user.hairdresserProfile.id;
  });

  it("registers an employer", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: employerEmail,
      password,
      role: "EMPLOYER",
      businessName: "Test Salon"
    });
    expect(res.status).toBe(201);
    employerToken = res.body.token;
  });

  it("rejects duplicate emails", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: hairEmail,
      password,
      role: "HAIRDRESSER"
    });
    expect(res.status).toBe(409);
  });

  it("logs in and returns the current user", async () => {
    const login = await request(app).post("/api/auth/login").send({ email: hairEmail, password });
    expect(login.status).toBe(200);
    const me = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${login.body.token}`);
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe(hairEmail);
  });

  it("rejects invalid login", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: hairEmail,
      password: "WrongPass999!"
    });
    expect(res.status).toBe(401);
  });

  it("rejects unauthenticated /me", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});

describe("role authorisation", () => {
  it("blocks hairdressers from admin APIs", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${hairToken}`);
    expect(res.status).toBe(403);
  });

  it("blocks employers from creating hairdresser credentials", async () => {
    const res = await request(app)
      .post("/api/hairdressers/qualifications")
      .set("Authorization", `Bearer ${employerToken}`)
      .send({
        qualificationName: "Certificate III in Hairdressing",
        issuingOrganisation: "MMCollege"
      });
    expect(res.status).toBe(403);
  });
});

describe("profiles, credentials, jobs, search", () => {
  it("updates a hairdresser profile", async () => {
    const res = await request(app)
      .put("/api/hairdressers/profile")
      .set("Authorization", `Bearer ${hairToken}`)
      .send({
        firstName: "Test",
        lastName: "Stylist",
        location: "Melbourne, VIC",
        suburb: "Melbourne",
        state: "VIC",
        professionalTitle: "Qualified Hairdresser",
        yearsOfExperience: 3,
        bio: "Test bio for profile completion.",
        phone: "0400 111 222",
        employmentStatus: "SEEKING",
        availability: "IMMEDIATE",
        preferredEmploymentType: "FULL_TIME"
      });
    expect(res.status).toBe(200);
    expect(res.body.profile.location).toContain("Melbourne");
  });

  it("adds skills and a pending qualification", async () => {
    const skills = await request(app)
      .post("/api/hairdressers/skills")
      .set("Authorization", `Bearer ${hairToken}`)
      .send({ skillIds: [skillId] });
    expect(skills.status).toBe(200);

    const credential = await request(app)
      .post("/api/hairdressers/qualifications")
      .set("Authorization", `Bearer ${hairToken}`)
      .send({
        qualificationId,
        qualificationName: "Certificate III in Hairdressing",
        issuingOrganisation: "MMCollege",
        credentialNumber: "TEST-1"
      });
    expect(credential.status).toBe(201);
    expect(credential.body.credential.status).toBe("PENDING");
    credentialId = credential.body.credential.id;
  });

  it("does not allow a hairdresser to self-verify", async () => {
    const res = await request(app)
      .put(`/api/admin/credentials/${credentialId}/verify`)
      .set("Authorization", `Bearer ${hairToken}`)
      .send({ notes: "I am verified" });
    expect(res.status).toBe(403);
  });

  it("allows an admin to verify a credential", async () => {
    const res = await request(app)
      .put(`/api/admin/credentials/${credentialId}/verify`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ notes: "Matches MMCollege records" });
    expect(res.status).toBe(200);
    expect(res.body.credential.status).toBe("VERIFIED");
  });

  it("creates a job as an employer", async () => {
    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${employerToken}`)
      .send({
        title: "Test Hairdresser Role",
        description: "A full-time qualified hairdresser is needed for a Melbourne salon floor.",
        location: "Melbourne, VIC",
        employmentType: "FULL_TIME",
        requiredExperienceYears: 2,
        skillIds: [skillId],
        status: "ACTIVE"
      });
    expect(res.status).toBe(201);
    expect(res.body.job.status).toBe("ACTIVE");
    jobId = res.body.job.id;
  });

  it("rejects invalid job payloads", async () => {
    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${employerToken}`)
      .send({ title: "x" });
    expect(res.status).toBe(400);
  });

  it("searches hairdressers from the database", async () => {
    const res = await request(app).get("/api/hairdressers").query({
      location: "Melbourne",
      minExperience: 1,
      verified: "true"
    });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.some((item: { id: string }) => item.id === hairProfileId)).toBe(true);
    expect(res.body.items[0].phone).toBeUndefined();
  });

  it("creates an application", async () => {
    const res = await request(app)
      .post(`/api/jobs/${jobId}/apply`)
      .set("Authorization", `Bearer ${hairToken}`)
      .send({ coverNote: "I would like to express interest." });
    expect(res.status).toBe(201);
  });

  it("rejects a duplicate application", async () => {
    const res = await request(app)
      .post(`/api/jobs/${jobId}/apply`)
      .set("Authorization", `Bearer ${hairToken}`)
      .send({ coverNote: "Applying again" });
    expect(res.status).toBe(409);
  });
});
