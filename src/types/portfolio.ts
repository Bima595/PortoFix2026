export interface Bio {
  name: string;
  position: string;
  place?: string;
  description: string;
  avatar?: {
    asset: {
      _ref: string;
      _type: string;
    };
  };
  email?: string;
  currentCompany?: string;
  socialLinks?: Array<{
    platform: string;
    username: string;
    url: string;
  }>;
  resume?: string;
}

export interface WorkExperience {
  _id: string;
  role: string;
  company: string;
  companyLink?: string;
  companyLogo?: {
    asset: {
      _ref: string;
      _type: string;
    };
    alt?: string;
  };
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  highlights?: string[];
  techStack?: string[];
}

export interface Reward {
  _id: string;
  name: string;
  date: string;
  description?: string;
}

export interface SideProject {
  _id: string;
  name: string;
  description?: string;
  year?: string;
  images?: Array<{
    _key?: string;
    asset: {
      _ref: string;
      _type: string;
    };
    alt?: string;
  }>;
  repoLink?: string;
  demoLink?: string;
  techStack?: string[];
}

export interface Education {
  _id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  gpa?: string;
  honors?: string;
  achievements?: string[];
}

export interface Certificate {
  _id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialLink?: string;
  image?: {
    asset: {
      _ref: string;
      _type: string;
    };
    alt?: string;
  };
}

export interface Skill {
  _id: string;
  category: string;
  skills: string[];
  order?: number;
}
