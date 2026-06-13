// ─── Central data store (simulates the PostgreSQL schema) ───────────────────

export interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  featuredImage: string;
  projectUrl: string;
  githubUrl: string;
  techStack: string[];
  category: 'Web Development' | 'Digital Marketing';
  isFeatured: boolean;
  status: string;
}

export interface Venture {
  id: string;
  name: string;
  slug: string;
  industry: string;
  description: string;
  role: string;
  websiteUrl: string;
  status: 'Active' | 'Growing' | 'Acquired' | 'Exited';
  category: 'Startup' | 'SaaS' | 'Agency' | 'E-commerce' | 'Consulting';
  isFeatured: boolean;
  startDate: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string[];
  featuredImage: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;
  readTime: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
}

export interface SkillCategory {
  name: string;
  icon: string;
  skills: { name: string; level: number }[];
}

// ─── Projects ────────────────────────────────────────────────────────────────
export const projects: Project[] = [
  {
    id: 'p1',
    title: 'ShopBD – Multi-vendor E-commerce Platform',
    slug: 'shopbd-ecommerce-platform',
    shortDescription:
      'A full-featured multi-vendor marketplace with seller dashboards, payment gateway integration and real-time order tracking.',
    fullDescription:
      'ShopBD is a complete multi-vendor e-commerce solution built for the Bangladeshi market. It includes vendor onboarding, product management, bKash & SSLCommerz payment integration, real-time order tracking, an admin moderation panel and a customer review system. The platform handles 10,000+ daily visitors with optimized server-side rendering and Redis caching.',
    featuredImage:
      'https://images.pexels.com/photos/34803986/pexels-photo-34803986.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    projectUrl: 'https://example.com',
    githubUrl: 'https://github.com',
    techStack: ['Next.js', 'PostgreSQL', 'Prisma', 'Tailwind CSS', 'Redis', 'Stripe'],
    category: 'Web Development',
    isFeatured: true,
    status: 'Live',
  },
  {
    id: 'p2',
    title: 'TaskFlow – SaaS Project Management Tool',
    slug: 'taskflow-saas',
    shortDescription:
      'Kanban-based project management SaaS with team collaboration, time tracking and subscription billing.',
    fullDescription:
      'TaskFlow is a productivity SaaS that helps remote teams organize work with Kanban boards, sprints, time tracking and reporting. Built with a multi-tenant architecture, Stripe subscription billing, and WebSocket-powered real-time collaboration. Currently serving 2,000+ active teams.',
    featuredImage:
      'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    projectUrl: 'https://example.com',
    githubUrl: 'https://github.com',
    techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'Socket.io', 'Stripe'],
    category: 'Web Development',
    isFeatured: true,
    status: 'Live',
  },
  {
    id: 'p3',
    title: 'Growth Campaign – D2C Fashion Brand',
    slug: 'growth-campaign-fashion-brand',
    shortDescription:
      '360° digital marketing campaign that scaled a fashion brand from 0 to 50k monthly revenue in 6 months.',
    fullDescription:
      'Designed and executed a complete growth strategy for a direct-to-consumer fashion brand: Facebook & Instagram ads, influencer partnerships, email automation and conversion rate optimization. Result: 4.2x ROAS, 50,000+ monthly revenue and a 38% repeat purchase rate within 6 months.',
    featuredImage:
      'https://images.pexels.com/photos/5961076/pexels-photo-5961076.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    projectUrl: 'https://example.com',
    githubUrl: '',
    techStack: ['Meta Ads', 'Google Analytics', 'Klaviyo', 'Hotjar', 'SEO'],
    category: 'Digital Marketing',
    isFeatured: true,
    status: 'Completed',
  },
  {
    id: 'p4',
    title: 'EduLearn – Online Course Platform',
    slug: 'edulearn-course-platform',
    shortDescription:
      'LMS platform with video streaming, quizzes, certificates and instructor revenue sharing.',
    fullDescription:
      'EduLearn is a learning management system supporting HLS video streaming, interactive quizzes, automated certificates and an instructor payout system. Includes a powerful admin panel for course moderation and analytics dashboards for instructors.',
    featuredImage:
      'https://images.pexels.com/photos/574069/pexels-photo-574069.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    projectUrl: 'https://example.com',
    githubUrl: 'https://github.com',
    techStack: ['Next.js', 'PostgreSQL', 'Prisma', 'AWS S3', 'Mux', 'Tailwind CSS'],
    category: 'Web Development',
    isFeatured: false,
    status: 'Live',
  },
  {
    id: 'p5',
    title: 'Local SEO Domination – Restaurant Chain',
    slug: 'local-seo-restaurant-chain',
    shortDescription:
      'Local SEO strategy that put a 12-branch restaurant chain at #1 in Google Maps across Dhaka.',
    fullDescription:
      'Complete local SEO overhaul for a 12-branch restaurant chain: Google Business Profile optimization, review generation system, local citations, schema markup and location landing pages. Achieved #1 map pack ranking for 40+ keywords and a 210% increase in direction requests.',
    featuredImage:
      'https://images.pexels.com/photos/7495291/pexels-photo-7495291.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    projectUrl: 'https://example.com',
    githubUrl: '',
    techStack: ['Local SEO', 'Schema Markup', 'GBP', 'Content Strategy'],
    category: 'Digital Marketing',
    isFeatured: false,
    status: 'Completed',
  },
  {
    id: 'p6',
    title: 'FinTrack – Personal Finance Dashboard',
    slug: 'fintrack-finance-dashboard',
    shortDescription:
      'Personal finance tracker with bank sync, budgeting, analytics charts and PWA support.',
    fullDescription:
      'FinTrack helps users track expenses, set budgets and visualize spending habits with beautiful interactive charts. Features include CSV bank import, recurring transaction detection, monthly reports and full offline PWA support.',
    featuredImage:
      'https://images.pexels.com/photos/574077/pexels-photo-574077.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    projectUrl: 'https://example.com',
    githubUrl: 'https://github.com',
    techStack: ['React', 'TypeScript', 'Recharts', 'Supabase', 'PWA'],
    category: 'Web Development',
    isFeatured: false,
    status: 'Live',
  },
];

// ─── Business Ventures ───────────────────────────────────────────────────────
export const ventures: Venture[] = [
  {
    id: 'b1',
    name: 'DevCraft Agency',
    slug: 'devcraft-agency',
    industry: 'Software Development',
    description:
      'A full-service web development agency delivering custom web apps, e-commerce solutions and SaaS products for clients across Bangladesh, UAE and the UK.',
    role: 'Founder & CEO',
    websiteUrl: 'https://example.com',
    status: 'Active',
    category: 'Agency',
    isFeatured: true,
    startDate: '2021',
  },
  {
    id: 'b2',
    name: 'TaskFlow',
    slug: 'taskflow',
    industry: 'Productivity SaaS',
    description:
      'B2B project management SaaS serving 2,000+ remote teams worldwide with Kanban boards, sprints and time tracking.',
    role: 'Co-founder & CTO',
    websiteUrl: 'https://example.com',
    status: 'Growing',
    category: 'SaaS',
    isFeatured: true,
    startDate: '2022',
  },
  {
    id: 'b3',
    name: 'BD Style House',
    slug: 'bd-style-house',
    industry: 'Fashion E-commerce',
    description:
      'Direct-to-consumer fashion brand selling premium streetwear with nationwide delivery and 38% repeat purchase rate.',
    role: 'Co-founder',
    websiteUrl: 'https://example.com',
    status: 'Active',
    category: 'E-commerce',
    isFeatured: true,
    startDate: '2022',
  },
  {
    id: 'b4',
    name: 'GrowthLab Consulting',
    slug: 'growthlab-consulting',
    industry: 'Business Consulting',
    description:
      'Growth strategy consulting for startups & SMEs — go-to-market planning, digital transformation and marketing audits.',
    role: 'Principal Consultant',
    websiteUrl: 'https://example.com',
    status: 'Active',
    category: 'Consulting',
    isFeatured: false,
    startDate: '2023',
  },
  {
    id: 'b5',
    name: 'LaunchPad BD',
    slug: 'launchpad-bd',
    industry: 'Startup Incubation',
    description:
      'Early-stage startup incubator helping young Bangladeshi founders validate ideas, build MVPs and raise seed funding.',
    role: 'Founding Partner',
    websiteUrl: 'https://example.com',
    status: 'Growing',
    category: 'Startup',
    isFeatured: false,
    startDate: '2024',
  },
];

// ─── Blog Posts ──────────────────────────────────────────────────────────────
export const blogPosts: BlogPost[] = [
  {
    id: 'bl1',
    title: 'How I Built a SaaS to 2,000 Teams Without Outside Funding',
    slug: 'bootstrapped-saas-journey',
    excerpt:
      'The full story of bootstrapping TaskFlow from a weekend side-project to a profitable SaaS — lessons, mistakes and the numbers behind it.',
    content: [
      'When I started TaskFlow in 2022, it was nothing more than a weekend experiment. I was frustrated with the bloated project management tools my agency was using, so I decided to build something simpler for my own team.',
      'The first version took three weekends. It was ugly, it had bugs, but my team actually preferred it over the expensive tools we were paying for. That was the first signal that there might be a real product here.',
      'Instead of raising money, I followed a simple rule: every feature must be paid for by revenue. We launched a paid plan in month two with just 14 customers. By month six we hit 100 paying teams, and today we serve over 2,000.',
      'Three lessons stand out. First, talk to your users every single week — our roadmap is built entirely from support conversations. Second, charge from day one; free users give you compliments, paying users give you truth. Third, distribution matters more than features. Half my time goes into content, SEO and partnerships.',
      'Bootstrapping is slower, but you keep control, you stay profitable, and every decision is yours. If you are a developer in Bangladesh thinking about SaaS — the global market is open to you. Start small, charge early, and keep shipping.',
    ],
    featuredImage:
      'https://images.pexels.com/photos/574077/pexels-photo-574077.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    category: 'Entrepreneurship',
    tags: ['SaaS', 'Bootstrapping', 'Startup'],
    author: 'Emran Hossain',
    publishedAt: '2025-11-18',
    readTime: '7 min read',
  },
  {
    id: 'bl2',
    title: 'Next.js + Prisma + PostgreSQL: My Production Stack in 2025',
    slug: 'nextjs-prisma-postgresql-stack',
    excerpt:
      'Why this stack powers every project I ship — architecture decisions, folder structure, and performance tips from real production apps.',
    content: [
      'After shipping dozens of client projects and two SaaS products, my default stack has settled: Next.js App Router on the frontend, Prisma ORM for data access, and PostgreSQL as the database — deployed on Vercel with Neon for the database.',
      'The App Router changed how I think about data fetching. Server Components mean most pages never ship a data-fetching waterfall to the client. Combined with route-level caching, my Lighthouse scores stay above 95 without heroic optimization.',
      'Prisma gives me type-safe queries that catch bugs at compile time. My rule: one `lib/db.ts` singleton, repository functions per model, and never raw queries unless profiling proves I need them.',
      'For PostgreSQL, three habits keep things fast: index every slug and foreign key, use `select` to fetch only needed columns, and paginate everything with cursor-based pagination.',
      'Deployment is boring on purpose — Vercel previews for every PR, Neon branching for database previews, and GitHub Actions for migrations. Boring infrastructure means I spend my energy on product, not servers.',
    ],
    featuredImage:
      'https://images.pexels.com/photos/34803986/pexels-photo-34803986.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    category: 'Web Development',
    tags: ['Next.js', 'Prisma', 'PostgreSQL'],
    author: 'Emran Hossain',
    publishedAt: '2025-10-02',
    readTime: '6 min read',
  },
  {
    id: 'bl3',
    title: 'The Digital Marketing Playbook for Bangladeshi SMEs',
    slug: 'digital-marketing-playbook-bd-smes',
    excerpt:
      'A practical, budget-friendly framework for small businesses in Bangladesh to win customers online — no agency required.',
    content: [
      'Most small businesses in Bangladesh waste their marketing budget by boosting random Facebook posts. After running campaigns for 50+ local brands, here is the framework that actually works.',
      'Step one: own your Google Business Profile. It is free, and for local businesses it drives more qualified leads than any paid channel. Complete every field, add photos weekly, and reply to every review.',
      'Step two: build a simple conversion-focused landing page. Not a 20-page website — one page with a clear offer, social proof, and a WhatsApp button. Speed matters: if it loads in under 2 seconds, you are already ahead of 80% of competitors.',
      'Step three: run Meta ads with a structured funnel — broad awareness video, retargeting carousel, and a messenger campaign for closing. Start with 500 taka a day and scale only what converts.',
      'Step four: collect every customer phone number and email. Owned audiences are the only asset the platforms cannot take away from you. A monthly SMS or email with a real offer outperforms any boosted post.',
    ],
    featuredImage:
      'https://images.pexels.com/photos/7495291/pexels-photo-7495291.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    category: 'Digital Marketing',
    tags: ['Marketing', 'SME', 'Bangladesh'],
    author: 'Emran Hossain',
    publishedAt: '2025-08-21',
    readTime: '5 min read',
  },
  {
    id: 'bl4',
    title: 'From Freelancer to Agency Owner: Scaling Beyond Yourself',
    slug: 'freelancer-to-agency-owner',
    excerpt:
      'The mindset shifts and systems that took me from solo freelancing to running a team of 12 at DevCraft Agency.',
    content: [
      'In 2020 I was a freelancer billing by the hour. In 2021 I founded DevCraft. Today we are a team of 12 serving clients in three countries. The hardest part was not finding clients — it was changing how I think.',
      'Shift one: sell outcomes, not hours. Clients do not care about your hours; they care about their revenue. When we switched to value-based project pricing, our average deal size tripled.',
      'Shift two: document everything. The first three hires struggled because everything lived in my head. Now we have SOPs for project kickoff, code review, deployment and client communication. Systems scale; founders do not.',
      'Shift three: hire for attitude, train for skill. Our best developers were juniors with curiosity and ownership. Skills can be taught in months; ownership cannot.',
      'If you are freelancing right now and drowning in work — that is the signal. Raise your prices, hire your first teammate, and start building something bigger than yourself.',
    ],
    featuredImage:
      'https://images.pexels.com/photos/5961076/pexels-photo-5961076.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    category: 'Business Strategy',
    tags: ['Agency', 'Freelancing', 'Growth'],
    author: 'Emran Hossain',
    publishedAt: '2025-06-10',
    readTime: '6 min read',
  },
];

// ─── Gallery ─────────────────────────────────────────────────────────────────
export const galleryImages: GalleryImage[] = [
  { id: 'g1', title: 'Late night coding session', imageUrl: 'https://images.pexels.com/photos/34803986/pexels-photo-34803986.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200', category: 'Workspace' },
  { id: 'g2', title: 'Debugging in progress', imageUrl: 'https://images.pexels.com/photos/34803990/pexels-photo-34803990.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200', category: 'Workspace' },
  { id: 'g3', title: 'Building TaskFlow', imageUrl: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200', category: 'Workspace' },
  { id: 'g4', title: 'Code review day', imageUrl: 'https://images.pexels.com/photos/574069/pexels-photo-574069.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200', category: 'Workspace' },
  { id: 'g5', title: 'Planning the sprint', imageUrl: 'https://images.pexels.com/photos/574070/pexels-photo-574070.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200', category: 'Workspace' },
  { id: 'g6', title: 'Frontend deep work', imageUrl: 'https://images.pexels.com/photos/574077/pexels-photo-574077.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200', category: 'Workspace' },
  { id: 'g7', title: 'DevCraft team meeting', imageUrl: 'https://images.pexels.com/photos/7495291/pexels-photo-7495291.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200', category: 'Team' },
  { id: 'g8', title: 'Client strategy session', imageUrl: 'https://images.pexels.com/photos/5961076/pexels-photo-5961076.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200', category: 'Team' },
  { id: 'g9', title: 'Collaboration at the office', imageUrl: 'https://images.pexels.com/photos/7792836/pexels-photo-7792836.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200', category: 'Team' },
  { id: 'g10', title: 'Quarterly review', imageUrl: 'https://images.pexels.com/photos/5256822/pexels-photo-5256822.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200', category: 'Events' },
  { id: 'g11', title: 'Mentoring session', imageUrl: 'https://images.pexels.com/photos/5256823/pexels-photo-5256823.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200', category: 'Events' },
  { id: 'g12', title: 'Workshop with founders', imageUrl: 'https://images.pexels.com/photos/7180965/pexels-photo-7180965.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200', category: 'Events' },
];

// ─── Skills ──────────────────────────────────────────────────────────────────
export const skillCategories: SkillCategory[] = [
  {
    name: 'Frontend',
    icon: '🎨',
    skills: [
      { name: 'React / Next.js', level: 95 },
      { name: 'TypeScript', level: 90 },
      { name: 'Tailwind CSS', level: 95 },
      { name: 'Framer Motion', level: 80 },
    ],
  },
  {
    name: 'Backend',
    icon: '⚙️',
    skills: [
      { name: 'Node.js / Express', level: 90 },
      { name: 'PostgreSQL / Prisma', level: 88 },
      { name: 'REST & GraphQL APIs', level: 85 },
      { name: 'AWS / Vercel / Docker', level: 78 },
    ],
  },
  {
    name: 'Marketing',
    icon: '📈',
    skills: [
      { name: 'Meta & Google Ads', level: 90 },
      { name: 'SEO & Content Strategy', level: 88 },
      { name: 'Email Automation', level: 82 },
      { name: 'Analytics & CRO', level: 85 },
    ],
  },
  {
    name: 'Business Strategy',
    icon: '🚀',
    skills: [
      { name: 'Go-to-Market Planning', level: 88 },
      { name: 'Product Strategy', level: 85 },
      { name: 'Team Leadership', level: 90 },
      { name: 'Financial Planning', level: 75 },
    ],
  },
];

// ─── CV Data ─────────────────────────────────────────────────────────────────
export const experience = [
  {
    role: 'Founder & CEO',
    company: 'DevCraft Agency',
    period: '2021 – Present',
    points: [
      'Built and lead a 12-person team delivering 60+ web projects for clients in BD, UAE & UK.',
      'Grew agency revenue 3x year-over-year through value-based pricing and productized services.',
      'Established SOP-driven delivery process reducing project turnaround time by 40%.',
    ],
  },
  {
    role: 'Co-founder & CTO',
    company: 'TaskFlow (SaaS)',
    period: '2022 – Present',
    points: [
      'Architected a multi-tenant SaaS serving 2,000+ teams with 99.9% uptime.',
      'Bootstrapped to profitability without external funding.',
      'Lead product, engineering and growth — shipped 120+ releases.',
    ],
  },
  {
    role: 'Senior Full Stack Developer',
    company: 'TechVision Ltd.',
    period: '2019 – 2021',
    points: [
      'Developed enterprise web applications using React, Node.js and PostgreSQL.',
      'Mentored a team of 4 junior developers and introduced code review culture.',
      'Reduced page load time of flagship product by 60% through performance optimization.',
    ],
  },
  {
    role: 'Freelance Web Developer & Marketer',
    company: 'Upwork / Fiverr',
    period: '2017 – 2019',
    points: [
      'Completed 150+ projects with 5-star rating across web development and digital marketing.',
      'Specialized in WordPress, custom web apps and Facebook ad campaigns.',
    ],
  },
];

export const education = [
  {
    degree: 'B.Sc. in Computer Science & Engineering',
    institution: 'University of Dhaka',
    period: '2014 – 2018',
    detail: 'CGPA 3.78/4.00 · Thesis on scalable web architectures.',
  },
  {
    degree: 'Higher Secondary Certificate (Science)',
    institution: 'Dhaka College',
    period: '2012 – 2014',
    detail: 'GPA 5.00/5.00 · Dhaka Board.',
  },
];

export const services = [
  {
    icon: '💻',
    title: 'Web Development',
    description:
      'Custom web applications, e-commerce platforms and SaaS products built with modern stacks — fast, secure and scalable.',
  },
  {
    icon: '📊',
    title: 'Digital Marketing',
    description:
      'Data-driven growth campaigns — SEO, paid ads, email automation and conversion optimization that deliver measurable ROI.',
  },
  {
    icon: '🧭',
    title: 'Business Strategy',
    description:
      'Go-to-market planning, digital transformation and growth consulting for startups and SMEs ready to scale.',
  },
];

export const siteInfo = {
  name: 'Emran Hossain',
  tagline: 'Full Stack Developer · Digital Marketer · Entrepreneur',
  email: 'hello@emranhossain.com',
  phone: '+880 1700-000000',
  location: 'Dhaka, Bangladesh',
  socials: {
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com',
    facebook: 'https://facebook.com',
  },
};
