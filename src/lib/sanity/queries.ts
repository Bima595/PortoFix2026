// GROQ Queries for Sanity CMS

export const bioQuery = `*[_type == "bio"][0] {
  name,
  position,
  place,
  description,
  avatar,
  email,
  currentCompany,
  socialLinks,
  "resume": resume.asset->url
}`;

export const workExperienceQuery = `*[_type == "workExperience"] | order(startDate desc) {
  _id,
  role,
  company,
  companyLink,
  companyLogo,
  startDate,
  endDate,
  isCurrent,
  description,
  highlights,
  techStack
}`;

export const rewardQuery = `*[_type == "Reward"] | order(date desc) {
  _id,
  name,
  date,
  description
}`;

export const sideProjectQuery = `*[_type == "sideProject"] | order(_createdAt desc) {
  _id,
  name,
  description,
  year,
  images,
  repoLink,
  demoLink,
  techStack
}`;

export const educationQuery = `*[_type == "education"] | order(startDate desc) {
  _id,
  institution,
  degree,
  fieldOfStudy,
  startDate,
  endDate,
  description,
  gpa,
  honors,
  achievements
}`;

export const certificateQuery = `*[_type == "certificate"] | order(issueDate desc) {
  _id,
  title,
  issuer,
  issueDate,
  credentialLink,
  image
}`;

export const skillQuery = `*[_type == "skill"] | order(order asc) {
  _id,
  category,
  skills,
  order
}`;

export const statsQuery = `*[_type == "stats"] | order(order asc) {
  _id,
  label,
  value,
  suffix,
  order
}`;

export const projectQuery = `*[_type == "project"] | order(order asc) {
  _id,
  title,
  icon,
  order
}`;

export const fieldQuery = `*[_type == "field"] | order(order asc) {
  _id,
  title,
  icon,
  order
}`;

export const pricingQuery = `*[_type == "pricing"] | order(order asc) {
  _id,
  tag,
  title,
  price,
  priceSuffix,
  originalPrice,
  priceLabel,
  description,
  features,
  ctaLabel,
  addOnTitle,
  addOnPrice,
  addOnDescription,
  addOnFeatures,
  addOnCtaLabel,
  order
}`;
