const config = {
  title: "Mahaan Shrestha | Cybersecurity Student",
  description: {
    long: "Portfolio of Mahaan Shrestha, a BSc (Hons) Ethical Hacking and Cyber Security student interested in security operations and governance, risk and compliance.",
    short:
      "Portfolio of Mahaan Shrestha, a cybersecurity student.",
  },
  keywords: [
    "Mahaan Shrestha",
    "portfolio",
    "cybersecurity student",
    "creative technologist",
    "web development",
    "3D animations",
    "interactive websites",
    "Coding Ducks",
    "The Booking Desk",
    "Ghostchat",
    "web design",
    "GSAP",
    "React",
    "Next.js",
    "Spline",
    "Framer Motion",
  ],
  author: "Mahaan Shrestha",
  email: "sthamahaan55@gmail.com",
  site: "http://localhost:3008",

  // for github stars button
  githubUsername: "Mahaan749",
  githubRepo: "",

  get ogImg() {
    return this.site + "/assets/seo/og-image.png";
  },
  social: {
    twitter: "#",
    linkedin: "https://www.linkedin.com/in/mahaan-shrestha/",
    instagram: "#",
    facebook: "#",
    github: "https://github.com/Mahaan749",
  },
};
export { config };
