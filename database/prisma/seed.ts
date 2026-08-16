import { PrismaClient, type Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "DemoPass123!";

const skillNames = [
  "Hair cutting",
  "Hair colouring",
  "Balayage",
  "Foiling",
  "Styling",
  "Blow drying",
  "Barbering",
  "Bridal styling",
  "Customer service",
  "Other",
  "Keratin treatments",
  "Extensions"
];

const qualificationCatalogue = [
  { name: "Certificate III in Hairdressing", level: "Certificate III" },
  { name: "Certificate IV in Hairdressing", level: "Certificate IV" },
  { name: "Diploma of Salon Management", level: "Diploma" },
  { name: "Certificate III in Barbering", level: "Certificate III" }
];

const hairdressers = [
  {
    email: "sarah.nguyen@example.com",
    firstName: "Sarah",
    lastName: "Nguyen",
    title: "Qualified Hairdresser",
    location: "Melbourne, VIC",
    suburb: "Melbourne",
    state: "VIC",
    postcode: "3000",
    years: 6,
    bio: "Colour-focused stylist with a calm chair-side manner and a love of lived-in blondes.",
    skills: ["Hair cutting", "Hair colouring", "Balayage", "Foiling", "Customer service"],
    verified: true
  },
  {
    email: "liam.oconnor@example.com",
    firstName: "Liam",
    lastName: "O'Connor",
    title: "Senior Barber",
    location: "Fitzroy, VIC",
    suburb: "Fitzroy",
    state: "VIC",
    postcode: "3065",
    years: 8,
    bio: "Precision fades, beard sculpting, and classic cuts in a contemporary barber setting.",
    skills: ["Barbering", "Hair cutting", "Styling", "Customer service"],
    verified: true
  },
  {
    email: "amelia.rossi@example.com",
    firstName: "Amelia",
    lastName: "Rossi",
    title: "Bridal & Event Stylist",
    location: "South Yarra, VIC",
    suburb: "South Yarra",
    state: "VIC",
    postcode: "3141",
    years: 5,
    bio: "Specialist in bridal upstyles and soft romantic waves for weddings across Melbourne.",
    skills: ["Bridal styling", "Styling", "Blow drying", "Hair cutting"],
    verified: true
  },
  {
    email: "noah.patel@example.com",
    firstName: "Noah",
    lastName: "Patel",
    title: "Colour Technician",
    location: "Carlton, VIC",
    suburb: "Carlton",
    state: "VIC",
    postcode: "3053",
    years: 4,
    bio: "Balayage and corrective colour with a methodical, consultation-first approach.",
    skills: ["Hair colouring", "Balayage", "Foiling", "Customer service"],
    verified: false
  },
  {
    email: "priya.singh@example.com",
    firstName: "Priya",
    lastName: "Singh",
    title: "Hairdresser",
    location: "Footscray, VIC",
    suburb: "Footscray",
    state: "VIC",
    postcode: "3011",
    years: 3,
    bio: "Versatile stylist comfortable with both salon floor work and fashion editorial looks.",
    skills: ["Hair cutting", "Styling", "Blow drying", "Hair colouring"],
    verified: true
  },
  {
    email: "jordan.lee@example.com",
    firstName: "Jordan",
    lastName: "Lee",
    title: "Junior Hairdresser",
    location: "Geelong, VIC",
    suburb: "Geelong",
    state: "VIC",
    postcode: "3220",
    years: 1,
    bio: "Recently qualified and eager to grow in a supportive salon team.",
    skills: ["Blow drying", "Customer service", "Hair cutting"],
    verified: false
  },
  {
    email: "elena.martinez@example.com",
    firstName: "Elena",
    lastName: "Martinez",
    title: "Senior Stylist",
    location: "Brighton, VIC",
    suburb: "Brighton",
    state: "VIC",
    postcode: "3186",
    years: 10,
    bio: "Ten years behind the chair, known for lived-in colour and precise dry cutting.",
    skills: ["Hair cutting", "Hair colouring", "Balayage", "Styling", "Keratin treatments"],
    verified: true
  },
  {
    email: "marcus.brown@example.com",
    firstName: "Marcus",
    lastName: "Brown",
    title: "Barber & Stylist",
    location: "Collingwood, VIC",
    suburb: "Collingwood",
    state: "VIC",
    postcode: "3066",
    years: 7,
    bio: "Blends barbering structure with salon finishing for a sharp, wearable result.",
    skills: ["Barbering", "Hair cutting", "Styling", "Blow drying"],
    verified: true
  },
  {
    email: "hana.kim@example.com",
    firstName: "Hana",
    lastName: "Kim",
    title: "Creative Colourist",
    location: "Richmond, VIC",
    suburb: "Richmond",
    state: "VIC",
    postcode: "3121",
    years: 5,
    bio: "Creative colour, fashion foils, and careful colour correction.",
    skills: ["Hair colouring", "Foiling", "Balayage", "Extensions"],
    verified: false
  },
  {
    email: "oliver.wright@example.com",
    firstName: "Oliver",
    lastName: "Wright",
    title: "Salon Hairdresser",
    location: "Ballarat, VIC",
    suburb: "Ballarat",
    state: "VIC",
    postcode: "3350",
    years: 2,
    bio: "Friendly regional stylist focused on reliable cuts and everyday colour.",
    skills: ["Hair cutting", "Hair colouring", "Customer service", "Blow drying"],
    verified: true
  }
];

const employers = [
  {
    email: "hello@novasalon.example",
    businessName: "Nova Salon",
    location: "Melbourne, VIC",
    suburb: "Melbourne",
    state: "VIC",
    type: "Salon",
    description: "A light-filled CBD salon focused on modern colour and considered cuts."
  },
  {
    email: "team@harbourandco.example",
    businessName: "Harbour & Co",
    location: "Fitzroy, VIC",
    suburb: "Fitzroy",
    state: "VIC",
    type: "Barber / Salon",
    description: "Neighbourhood barber-salon hybrid with a strong junior development culture."
  },
  {
    email: "bookings@atelierlane.example",
    businessName: "Atelier Lane",
    location: "South Yarra, VIC",
    suburb: "South Yarra",
    state: "VIC",
    type: "Bridal studio",
    description: "Appointment-led bridal and event studio working with Melbourne venues."
  }
];

function avatar(name: string) {
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}`;
}

async function main() {
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobSkill.deleteMany();
  await prisma.job.deleteMany();
  await prisma.portfolioItem.deleteMany();
  await prisma.workExperience.deleteMany();
  await prisma.credentialVerification.deleteMany();
  await prisma.credential.deleteMany();
  await prisma.hairdresserSkill.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.hairdresserProfile.deleteMany();
  await prisma.employerProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.qualification.deleteMany();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const skills = await Promise.all(
    skillNames.map((name) =>
      prisma.skill.create({
        data: {
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          category: "Hair"
        }
      })
    )
  );
  const skillByName = Object.fromEntries(skills.map((skill) => [skill.name, skill]));

  const qualifications = await Promise.all(
    qualificationCatalogue.map((item) => prisma.qualification.create({ data: item }))
  );
  const certIII = qualifications.find((item) => item.name.includes("Certificate III in Hairdressing"))!;
  const certIV = qualifications.find((item) => item.name.includes("Certificate IV"))!;
  const barberQual = qualifications.find((item) => item.name.includes("Barbering"))!;

  const admin = await prisma.user.create({
    data: {
      email: "admin@mmcollege.example",
      passwordHash,
      role: "ADMIN"
    }
  });

  const createdHairdressers = [];
  for (const person of hairdressers) {
    const user = await prisma.user.create({
      data: {
        email: person.email,
        passwordHash,
        role: "HAIRDRESSER",
        hairdresserProfile: {
          create: {
            firstName: person.firstName,
            lastName: person.lastName,
            professionalTitle: person.title,
            location: person.location,
            suburb: person.suburb,
            state: person.state,
            postcode: person.postcode,
            bio: person.bio,
            yearsOfExperience: person.years,
            phone: "0400 000 000",
            profilePhotoUrl: avatar(`${person.firstName} ${person.lastName}`),
            employmentStatus: person.years < 2 ? "SEEKING" : "OPEN_TO_OPPORTUNITIES",
            availability: person.years < 2 ? "IMMEDIATE" : "FLEXIBLE",
            preferredEmploymentType: person.title.includes("Barber") ? "FULL_TIME" : "FULL_TIME",
            profileViews: 12 + person.years * 3,
            skills: {
              create: person.skills.map((name) => ({ skillId: skillByName[name].id }))
            }
          }
        }
      },
      include: { hairdresserProfile: true }
    });
    createdHairdressers.push(user);
  }

  for (const [index, user] of createdHairdressers.entries()) {
    const profile = user.hairdresserProfile!;
    const qualification = profile.professionalTitle?.includes("Barber") ? barberQual : index % 4 === 0 ? certIV : certIII;
    const status = hairdressers[index].verified ? "VERIFIED" : index === 5 ? "REJECTED" : "PENDING";

    const credential = await prisma.credential.create({
      data: {
        hairdresserProfileId: profile.id,
        qualificationId: qualification.id,
        qualificationName: qualification.name,
        issuingOrganisation: "MMCollege",
        credentialNumber: `MMC-2024-${1000 + index}`,
        issueDate: new Date("2023-11-15"),
        status
      }
    });

    if (status !== "PENDING") {
      await prisma.credentialVerification.create({
        data: {
          credentialId: credential.id,
          reviewerId: admin.id,
          status,
          notes: status === "VERIFIED" ? "Document matches MMCollege records." : "Document was unclear. Please re-upload.",
          verifiedAt: status === "VERIFIED" ? new Date("2024-02-01") : null
        }
      });
    }

    await prisma.workExperience.create({
      data: {
        hairdresserProfileId: profile.id,
        employerName: index % 2 === 0 ? "Laneway Colour" : "Harbour & Co",
        position: profile.professionalTitle ?? "Hairdresser",
        startDate: new Date("2022-03-01"),
        endDate: index % 3 === 0 ? null : new Date("2024-12-01"),
        description: "Client consultations, service delivery, and retail recommendations."
      }
    });

    await prisma.portfolioItem.create({
      data: {
        hairdresserProfileId: profile.id,
        imageUrl: `https://picsum.photos/seed/mmconnect-${index}/800/1000`,
        title: index % 2 === 0 ? "Soft balayage" : "Precision cut",
        description: "Studio lighting, finished look.",
        category: index % 2 === 0 ? "Colour" : "Cut"
      }
    });
  }

  const createdEmployers = [];
  for (const business of employers) {
    const user = await prisma.user.create({
      data: {
        email: business.email,
        passwordHash,
        role: "EMPLOYER",
        employerProfile: {
          create: {
            businessName: business.businessName,
            location: business.location,
            suburb: business.suburb,
            state: business.state,
            description: business.description,
            businessType: business.type,
            website: "https://example.com",
            contactEmail: business.email,
            phone: "03 9000 0000",
            logoUrl: avatar(business.businessName),
            profileViews: 40
          }
        }
      },
      include: { employerProfile: true }
    });
    createdEmployers.push(user);
  }

  const jobPayloads: Prisma.JobCreateInput[] = [
    {
      title: "Qualified Hairdresser — Full time",
      description: "Join Nova Salon's CBD team. Strong colour skills and Certificate III required.",
      location: "Melbourne, VIC",
      employmentType: "FULL_TIME",
      salaryDisplay: "$65,000 – $75,000",
      salaryMin: 65000,
      salaryMax: 75000,
      requiredExperienceYears: 2,
      status: "ACTIVE",
      postedAt: new Date(),
      employerProfile: { connect: { id: createdEmployers[0].employerProfile!.id } },
      requiredQualification: { connect: { id: certIII.id } }
    },
    {
      title: "Senior Colourist",
      description: "Lead colour services and mentor juniors in a busy inner-city salon.",
      location: "Melbourne, VIC",
      employmentType: "FULL_TIME",
      salaryDisplay: "$80,000 + commission",
      requiredExperienceYears: 5,
      status: "ACTIVE",
      postedAt: new Date(),
      employerProfile: { connect: { id: createdEmployers[0].employerProfile!.id } },
      requiredQualification: { connect: { id: certIV.id } }
    },
    {
      title: "Barber — Fitzroy",
      description: "Harbour & Co is looking for a barber comfortable with fades and classic cuts.",
      location: "Fitzroy, VIC",
      employmentType: "FULL_TIME",
      requiredExperienceYears: 3,
      status: "ACTIVE",
      postedAt: new Date(),
      employerProfile: { connect: { id: createdEmployers[1].employerProfile!.id } },
      requiredQualification: { connect: { id: barberQual.id } }
    },
    {
      title: "Part-time Stylist",
      description: "Thursday to Saturday stylist for a growing Fitzroy floor.",
      location: "Fitzroy, VIC",
      employmentType: "PART_TIME",
      requiredExperienceYears: 1,
      status: "ACTIVE",
      postedAt: new Date(),
      employerProfile: { connect: { id: createdEmployers[1].employerProfile!.id } }
    },
    {
      title: "Bridal Stylist — Seasonal",
      description: "Weekend bridal styling through spring and summer.",
      location: "South Yarra, VIC",
      employmentType: "CASUAL",
      requiredExperienceYears: 2,
      status: "ACTIVE",
      postedAt: new Date(),
      employerProfile: { connect: { id: createdEmployers[2].employerProfile!.id } }
    },
    {
      title: "Apprentice Hairdresser (draft)",
      description: "Draft role for next intake.",
      location: "Melbourne, VIC",
      employmentType: "APPRENTICESHIP",
      status: "DRAFT",
      employerProfile: { connect: { id: createdEmployers[0].employerProfile!.id } }
    }
  ];

  const jobs = [];
  for (const payload of jobPayloads) {
    const job = await prisma.job.create({ data: payload });
    jobs.push(job);
  }

  await prisma.jobSkill.createMany({
    data: [
      { jobId: jobs[0].id, skillId: skillByName["Hair cutting"].id },
      { jobId: jobs[0].id, skillId: skillByName["Hair colouring"].id },
      { jobId: jobs[1].id, skillId: skillByName["Balayage"].id },
      { jobId: jobs[1].id, skillId: skillByName["Foiling"].id },
      { jobId: jobs[2].id, skillId: skillByName["Barbering"].id },
      { jobId: jobs[4].id, skillId: skillByName["Bridal styling"].id }
    ]
  });

  await prisma.application.create({
    data: {
      jobId: jobs[0].id,
      hairdresserProfileId: createdHairdressers[0].hairdresserProfile!.id,
      coverNote: "I would welcome a conversation about joining your colour team."
    }
  });
  await prisma.application.create({
    data: {
      jobId: jobs[2].id,
      hairdresserProfileId: createdHairdressers[1].hairdresserProfile!.id,
      coverNote: "Fitzroy is my neighbourhood — happy to come in for a trial."
    }
  });

  const [a, b] = createdEmployers[0].id < createdHairdressers[0].id
    ? [createdEmployers[0].id, createdHairdressers[0].id]
    : [createdHairdressers[0].id, createdEmployers[0].id];

  const conversation = await prisma.conversation.create({
    data: { participantAId: a, participantBId: b }
  });
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: createdEmployers[0].id,
      body: "Hi Sarah — we loved your profile. Are you open to a chat about our full-time role?"
    }
  });
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: createdHairdressers[0].id,
      body: "Hello, yes I am. Thursday afternoon works well if that suits."
    }
  });

  await prisma.notification.create({
    data: {
      userId: createdHairdressers[0].id,
      type: "MESSAGE",
      title: "New employer message",
      body: "Nova Salon sent you a message.",
      linkUrl: `/messages/${conversation.id}`
    }
  });

  await prisma.report.create({
    data: {
      reporterId: createdEmployers[1].id,
      reportedUserId: createdHairdressers[5].id,
      targetType: "PROFILE",
      targetId: createdHairdressers[5].hairdresserProfile!.id,
      reason: "Portfolio images appear to be stock photos. Please review."
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "SEED_COMPLETED",
      entityType: "System",
      entityId: admin.id,
      metadata: { hairdressers: createdHairdressers.length, employers: createdEmployers.length }
    }
  });

  console.log("Seed complete.");
  console.log("Demo password for all accounts:", DEMO_PASSWORD);
  console.log("Admin: admin@mmcollege.example");
  console.log("Hairdresser: sarah.nguyen@example.com");
  console.log("Employer: hello@novasalon.example");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
