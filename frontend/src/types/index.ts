export type Role = "HAIRDRESSER" | "EMPLOYER" | "ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED";
export type CredentialStatus = "PENDING" | "VERIFIED" | "REJECTED" | "EXPIRED";
export type JobStatus = "DRAFT" | "ACTIVE" | "CLOSED";

export type User = {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
  hairdresserProfile?: HairdresserProfile | null;
  employerProfile?: EmployerProfile | null;
};

export type Skill = { id: string; name: string; slug: string };
export type Qualification = { id: string; name: string; level?: string | null };

export type Credential = {
  id: string;
  qualificationName: string;
  issuingOrganisation: string;
  credentialNumber?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  status: CredentialStatus;
  documentKey?: string | null;
};

export type WorkExperience = {
  id: string;
  employerName: string;
  position: string;
  startDate: string;
  endDate?: string | null;
  description?: string | null;
};

export type PortfolioItem = {
  id: string;
  imageUrl: string;
  title: string;
  description?: string | null;
  category?: string | null;
};

export type HairdresserProfile = {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  profilePhotoUrl?: string | null;
  phone?: string | null;
  location?: string | null;
  suburb?: string | null;
  state?: string | null;
  postcode?: string | null;
  bio?: string | null;
  professionalTitle?: string | null;
  yearsOfExperience: number;
  employmentStatus?: string | null;
  availability?: string | null;
  preferredEmploymentType?: string | null;
  profileViews?: number;
  skills?: { skill: Skill }[];
  credentials?: Credential[];
  workExperiences?: WorkExperience[];
  portfolioItems?: PortfolioItem[];
  profileCompletion?: number;
  verified?: boolean;
};

export type EmployerProfile = {
  id: string;
  businessName: string;
  logoUrl?: string | null;
  description?: string | null;
  location?: string | null;
  website?: string | null;
  phone?: string | null;
  contactEmail?: string | null;
  businessType?: string | null;
  jobs?: Job[];
};

export type Job = {
  id: string;
  title: string;
  description: string;
  location: string;
  employmentType: string;
  salaryDisplay?: string | null;
  requiredExperienceYears?: number | null;
  status: JobStatus;
  postedAt?: string | null;
  employerProfile?: EmployerProfile;
  requiredSkills?: { skill: Skill }[];
  requiredQualification?: Qualification | null;
  _count?: { applications: number };
};

export type Conversation = {
  id: string;
  participantA: UserPreview;
  participantB: UserPreview;
  messages: { id: string; body: string; createdAt: string; senderId: string }[];
  updatedAt: string;
};

export type UserPreview = {
  id: string;
  role: Role;
  hairdresserProfile?: { id: string; firstName: string; lastName: string; profilePhotoUrl?: string | null } | null;
  employerProfile?: { id: string; businessName: string; logoUrl?: string | null } | null;
};

export type Message = {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
  readAt?: string | null;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  linkUrl?: string | null;
  readAt?: string | null;
  createdAt: string;
};

export type Paginated<T> = {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
};
