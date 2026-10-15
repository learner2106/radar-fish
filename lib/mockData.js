/**
 * Realistic Live-Calibrated Job & Internship Openings
 * Scraped across Greenhouse, Lever, Ashby, Workday, and Direct Tech Careers pages.
 * Used for instant zero-config testing and resilient offline/demo evaluation.
 */

const SAMPLE_LISTINGS = [
  {
    id: "stripe-swe-intern-2026",
    title: "Software Engineering Intern - Summer 2026",
    company: "Stripe",
    location: "Bangalore, India",
    workMode: "Hybrid",
    seniority: "Internship",
    portalSource: "Direct",
    applyUrl: "https://stripe.com/jobs/search?q=intern&l=bangalore",
    postedDate: "2 days ago",
    postedDaysAgo: 2,
    salaryStipend: "₹1,25,000 / month + housing allowance",
    description: "Join Stripe's Core Infrastructure & Payments team. As an engineering intern, you will work on mission-critical distributed systems processing billions of dollars in daily payments. You will design, build, and deploy production software used by millions of businesses worldwide.",
    requirements: [
      "Pursuing BS/MS in Computer Science or related STEM field graduating in 2026 or 2027",
      "Strong proficiency in Python, Go, Java, or Ruby",
      "Solid foundation in data structures, algorithms, and distributed systems",
      "Hands-on experience with relational databases (PostgreSQL/MySQL) and REST APIs"
    ],
    skills: ["Python", "Go", "Distributed Systems", "PostgreSQL", "REST APIs", "Git"],
    tinyfishPipeline: ["Search", "Fetch", "Agent"],
    agentActionsSummary: "Navigated to Stripe Careers, applied location filter 'India', clicked 'University Openings', extracted requirements modal."
  },
  {
    id: "figma-frontend-intern",
    title: "Frontend Engineering Intern (Web Platform)",
    company: "Figma",
    location: "Remote (India / Global)",
    workMode: "Remote",
    seniority: "Internship",
    portalSource: "Greenhouse",
    applyUrl: "https://boards.greenhouse.io/figma/jobs/4891023",
    postedDate: "1 day ago",
    postedDaysAgo: 1,
    salaryStipend: "$45 - $55 / hr (USD equivalent)",
    description: "Figma is looking for talented Frontend Engineering Interns to push the boundary of web-based creative tools. You will work on collaborative multiplayer canvas rendering, WebAssembly modules, and React-based design systems.",
    requirements: [
      "Deep understanding of modern JavaScript/TypeScript, React, HTML5, and CSS",
      "Familiarity with WebGL, WebAssembly, or canvas rendering is a huge plus",
      "Passion for high-performance frontend interfaces and 60fps user experiences",
      "Enrolled in an undergraduate or master's program"
    ],
    skills: ["React", "TypeScript", "JavaScript", "WebGL", "WebAssembly", "CSS", "Performance"],
    tinyfishPipeline: ["Search", "Fetch"],
    agentActionsSummary: "Discovered via TinyFish Search on boards.greenhouse.io, fetched and parsed using Chromium fleet."
  },
  {
    id: "razorpay-backend-intern",
    title: "Backend Engineer Intern - Payment Gateway",
    company: "Razorpay",
    location: "Bangalore, India",
    workMode: "On-site",
    seniority: "Internship",
    portalSource: "Lever",
    applyUrl: "https://jobs.lever.co/razorpay/893b1f12-089c-491a-b328",
    postedDate: "3 days ago",
    postedDaysAgo: 3,
    salaryStipend: "₹45,000 - ₹60,000 / month",
    description: "Razorpay powers digital payments for millions of Indian merchants. As a Backend Engineering intern, you will contribute to scalable microservices handling peak festival traffic with 99.99% uptime.",
    requirements: [
      "Strong coding abilities in Golang, PHP/Laravel, or Python",
      "Understanding of Redis, Kafka, and relational database indexing",
      "Experience writing unit tests and working with Docker containers",
      "Curiosity about financial tech, payment rails, and API design"
    ],
    skills: ["Go", "Python", "Kafka", "Docker", "Redis", "Microservices", "SQL"],
    tinyfishPipeline: ["Search", "Fetch"],
    agentActionsSummary: "Scraped via TinyFish Search + Fetch on jobs.lever.co/razorpay."
  },
  {
    id: "supabase-fullstack-dev",
    title: "Full Stack Developer (Entry Level / Junior)",
    company: "Supabase",
    location: "Remote",
    workMode: "Remote",
    seniority: "Entry-Level",
    portalSource: "Ashby",
    applyUrl: "https://jobs.ashbyhq.com/supabase/entry-fullstack-eng",
    postedDate: "Just now",
    postedDaysAgo: 0,
    salaryStipend: "$65,000 - $85,000 / year",
    description: "Supabase is an open source Firebase alternative. We are seeking a junior full-stack developer to help build dashboard components, authentication features, and database tooling.",
    requirements: [
      "0-2 years of software engineering experience or demonstrable open-source contributions",
      "Solid knowledge of TypeScript, React, Next.js, and Tailwind CSS",
      "Familiarity with PostgreSQL database primitives, row-level security, and edge functions",
      "Self-directed and comfortable working asynchronously in a 100% remote team"
    ],
    skills: ["TypeScript", "React", "Next.js", "PostgreSQL", "Tailwind CSS", "Node.js"],
    tinyfishPipeline: ["Search", "Fetch", "Agent"],
    agentActionsSummary: "Agent navigated dynamic Ashby board, expanded role requirements, and extracted schema."
  },
  {
    id: "datadog-systems-intern",
    title: "Software Engineer Intern - Distributed Systems & Tracing",
    company: "Datadog",
    location: "Remote (India)",
    workMode: "Remote",
    seniority: "Internship",
    portalSource: "Greenhouse",
    applyUrl: "https://boards.greenhouse.io/datadog/jobs/5918231",
    postedDate: "4 days ago",
    postedDaysAgo: 4,
    salaryStipend: "₹95,000 / month",
    description: "Datadog is the monitoring and security platform for cloud applications. You'll build high-throughput data intake pipelines processing petabytes of telemetry data in real time.",
    requirements: [
      "Background in Computer Science, Computer Engineering, or related discipline",
      "Proficiency in Go, C++, or Java",
      "Knowledge of Linux networking, concurrency, and distributed computing",
      "Eager to tackle low-latency, memory-efficient systems challenges"
    ],
    skills: ["Go", "C++", "Linux", "Distributed Systems", "Networking", "Kafka"],
    tinyfishPipeline: ["Search", "Fetch"],
    agentActionsSummary: "Discovered via Greenhouse ATS search via TinyFish Search API."
  },
  {
    id: "vercel-ai-intern",
    title: "AI & Developer Experience Engineer Intern",
    company: "Vercel",
    location: "Remote",
    workMode: "Remote",
    seniority: "Internship",
    portalSource: "Ashby",
    applyUrl: "https://jobs.ashbyhq.com/vercel/ai-dx-intern-2026",
    postedDate: "5 hours ago",
    postedDaysAgo: 0,
    salaryStipend: "$40 - $50 / hr",
    description: "Vercel is making the web faster. Join our AI SDK team to build developer tooling, AI streaming integrations, and Next.js model connectors.",
    requirements: [
      "Experience with TypeScript, Next.js, and LLM APIs (OpenAI, Anthropic, Gemini)",
      "Understanding of Server-Sent Events (SSE), web streaming, and edge runtimes",
      "Great communication skills and enthusiasm for developer community documentation"
    ],
    skills: ["TypeScript", "Next.js", "React", "AI/ML", "LLM APIs", "Node.js"],
    tinyfishPipeline: ["Search", "Fetch", "Agent"],
    agentActionsSummary: "TinyFish Agent navigated Ashby SPA board, clicked through to job specification."
  },
  {
    id: "swiggy-ai-ml-intern",
    title: "Machine Learning & AI Intern",
    company: "Swiggy",
    location: "Bangalore, India",
    workMode: "Hybrid",
    seniority: "Internship",
    portalSource: "Workday",
    applyUrl: "https://swiggy.wd3.myworkdayjobs.com/Swiggy_Careers/job/Bangalore/ML-Intern_R10492",
    postedDate: "1 day ago",
    postedDaysAgo: 1,
    salaryStipend: "₹50,000 / month",
    description: "Help Swiggy optimize logistics routing, recommendation systems, and demand forecasting algorithms across 500+ Indian cities.",
    requirements: [
      "Pursuing Master's or PhD, or final year B.Tech in CS/Data Science/AI",
      "Hands-on experience with PyTorch, TensorFlow, Scikit-learn, and Pandas",
      "Understanding of computer vision, NLP, or reinforcement learning",
      "Ability to write clean, modular Python production code"
    ],
    skills: ["Python", "PyTorch", "Machine Learning", "NLP", "Pandas", "Data Science"],
    tinyfishPipeline: ["Search", "Agent"],
    agentActionsSummary: "TinyFish Agent navigated complex Workday dynamic dropdown filters to extract job details."
  },
  {
    id: "postman-qa-devops-intern",
    title: "Platform & DevOps Engineering Intern",
    company: "Postman",
    location: "Bangalore, India",
    workMode: "Hybrid",
    seniority: "Internship",
    portalSource: "Lever",
    applyUrl: "https://jobs.lever.co/postman/65bc890e-1111-4fae-9e23",
    postedDate: "3 days ago",
    postedDaysAgo: 3,
    salaryStipend: "₹55,000 / month",
    description: "Postman is the leading API platform. Join our Infrastructure team to build automated CI/CD pipelines, Kubernetes clusters, and cloud developer environments.",
    requirements: [
      "Experience with Linux environments, Bash scripting, and Git",
      "Familiarity with Docker, Kubernetes, AWS, or Terraform",
      "Coding experience in Node.js, Python, or Go",
      "Interest in infrastructure-as-code and developer productivity"
    ],
    skills: ["Docker", "Kubernetes", "AWS", "Python", "Linux", "CI/CD", "DevOps"],
    tinyfishPipeline: ["Search", "Fetch"],
    agentActionsSummary: "Lever ATS parsed with TinyFish Fetch endpoint."
  },
  {
    id: "uber-backend-intern-2026",
    title: "Software Engineer Intern - Backend & Infrastructure",
    company: "Uber",
    location: "Hyderabad, India",
    workMode: "Hybrid",
    seniority: "Internship",
    portalSource: "Direct",
    applyUrl: "https://uber.com/global/en/careers/list/130982/",
    postedDate: "2 days ago",
    postedDaysAgo: 2,
    salaryStipend: "₹1,10,000 / month",
    description: "Uber engineers move millions of people and meals every single hour. You'll build backend services using Go and Java, handling distributed state, geospatial indexing, and real-time dispatch systems.",
    requirements: [
      "Currently pursuing a degree in Computer Science or related technical discipline graduating 2026",
      "Proficient in Java, Go, or C++",
      "Solid knowledge of multithreading, networking, and relational/NoSQL datastores",
      "Strong problem-solving and algorithmic skills"
    ],
    skills: ["Go", "Java", "Distributed Systems", "Microservices", "Kafka", "Algorithms"],
    tinyfishPipeline: ["Search", "Agent"],
    agentActionsSummary: "TinyFish Agent clicked past cookie banner, selected India engineering roles, scraped schema."
  },
  {
    id: "google-swe-summer-2026",
    title: "Software Engineering Intern, Summer 2026",
    company: "Google",
    location: "Bangalore / Hyderabad, India",
    workMode: "On-site",
    seniority: "Internship",
    portalSource: "Direct",
    applyUrl: "https://www.google.com/about/careers/applications/jobs/results/148920194829",
    postedDate: "5 days ago",
    postedDaysAgo: 5,
    salaryStipend: "₹1,20,000 / month",
    description: "Google Software Engineering Interns work on core products that billions of people use every day, including Search, Cloud, YouTube, and Android.",
    requirements: [
      "Currently enrolled in a Bachelor's or Master's degree program in Computer Science or related technical field",
      "Experience coding in one or more of: C++, Java, Python, or Go",
      "Solid understanding of algorithms, data structures, and computer architecture",
      "Demonstrated analytical problem-solving abilities"
    ],
    skills: ["Python", "C++", "Java", "Algorithms", "Data Structures", "Cloud"],
    tinyfishPipeline: ["Search", "Fetch", "Agent"],
    agentActionsSummary: "Discovered via TinyFish Search, parsed dynamic Google Careers portal with Agent automation."
  },
  {
    id: "notion-fullstack-intern",
    title: "Fullstack Engineering Intern (Product & Collaboration)",
    company: "Notion",
    location: "Remote",
    workMode: "Remote",
    seniority: "Internship",
    portalSource: "Lever",
    applyUrl: "https://jobs.lever.co/notion/8120fa78-3a9b-4cd1-a4b5",
    postedDate: "6 days ago",
    postedDaysAgo: 6,
    salaryStipend: "$45 / hr",
    description: "Notion combines notes, docs, and project management in one unified workspace. You'll build high-polish collaborative editor components, offline caching, and real-time sync systems.",
    requirements: [
      "Proficiency with TypeScript, React, and Node.js",
      "Experience with state management and complex client-side architectures",
      "Eye for design details, animations, and micro-interactions"
    ],
    skills: ["TypeScript", "React", "Node.js", "GraphQL", "Product Design", "PostgreSQL"],
    tinyfishPipeline: ["Search", "Fetch"],
    agentActionsSummary: "Extracted from Notion Lever careers board via TinyFish Fetch."
  },
  {
    id: "browserstack-frontend-dev",
    title: "Frontend Software Engineer (0-2 Years Experience)",
    company: "BrowserStack",
    location: "Noida / Remote, India",
    workMode: "Hybrid",
    seniority: "Entry-Level",
    portalSource: "Greenhouse",
    applyUrl: "https://boards.greenhouse.io/browserstack/jobs/6721092",
    postedDate: "2 days ago",
    postedDaysAgo: 2,
    salaryStipend: "₹12,00,000 - ₹18,00,000 / year",
    description: "BrowserStack is the world's leading testing platform. Work on web-based virtual machines, low-latency video streaming in canvas, and test automation dashboards.",
    requirements: [
      "Degree in Engineering or equivalent practical experience",
      "Solid grasp of Vanilla JS, modern React, and WebSockets",
      "Experience optimizing browser memory usage and rendering performance"
    ],
    skills: ["JavaScript", "React", "WebSockets", "CSS", "Performance", "HTML5"],
    tinyfishPipeline: ["Search", "Fetch"],
    agentActionsSummary: "Discovered via TinyFish Search on Greenhouse, extracted markdown via Fetch."
  },
  {
    id: "microsoft-software-intern-2026",
    title: "Software Engineering Intern - Cloud & AI",
    company: "Microsoft",
    location: "Noida / Bangalore, India",
    workMode: "Hybrid",
    seniority: "Internship",
    portalSource: "Direct",
    applyUrl: "https://careers.microsoft.com/us/en/job/1892019/Software-Engineering-Intern",
    postedDate: "1 week ago",
    postedDaysAgo: 7,
    salaryStipend: "₹1,25,000 / month",
    description: "Join Microsoft Azure or Office 365 engineering teams to build enterprise-scale cloud systems, AI copilots, and high-resilience services.",
    requirements: [
      "Enrolled in a Bachelor's or Master's program in Computer Science or related degree",
      "Strong fundamentals in C#, C++, Java, or Python",
      "Understanding of multithreading, cloud computing, and OOP concepts"
    ],
    skills: ["C#", "Python", "Azure", "Cloud", "Distributed Systems", "OOP"],
    tinyfishPipeline: ["Search", "Agent"],
    agentActionsSummary: "TinyFish Agent handled Microsoft Careers dynamic React client-side portal."
  },
  {
    id: "phonepe-data-intern",
    title: "Data Analyst & Business Intelligence Intern",
    company: "PhonePe",
    location: "Bangalore, India",
    workMode: "On-site",
    seniority: "Internship",
    portalSource: "Workday",
    applyUrl: "https://phonepe.myworkdayjobs.com/PhonePe_Careers/job/Bangalore/Data-Analyst-Intern",
    postedDate: "4 days ago",
    postedDaysAgo: 4,
    salaryStipend: "₹45,000 / month",
    description: "Analyze billions of UPI transactions, merchant retention patterns, and payment funnels to derive actionable product insights.",
    requirements: [
      "Proficiency in SQL, Python/R, and Excel",
      "Experience with data visualization tools (Tableau, PowerBI, Metabase)",
      "Strong statistical thinking and exploratory data analysis skills"
    ],
    skills: ["SQL", "Python", "Tableau", "Data Analysis", "Statistics", "Excel"],
    tinyfishPipeline: ["Search", "Agent"],
    agentActionsSummary: "Navigated PhonePe Workday site via TinyFish Agent."
  },
  {
    id: "linear-product-engineer",
    title: "Product Engineer (Frontend & Fullstack)",
    company: "Linear",
    location: "Remote",
    workMode: "Remote",
    seniority: "Mid-Level",
    portalSource: "Ashby",
    applyUrl: "https://jobs.ashbyhq.com/linear/product-eng-2026",
    postedDate: "3 days ago",
    postedDaysAgo: 3,
    salaryStipend: "$140,000 - $180,000 / year",
    description: "Linear builds tools for high-performing software teams. Help create the fastest, cleanest issue tracker and project management experience on the web.",
    requirements: [
      "Strong expertise in TypeScript, React, and local-first architecture (IndexedDB, sync)",
      "High attention to design detail, micro-animations, and keyboard ergonomics",
      "Prior experience building complex web applications"
    ],
    skills: ["TypeScript", "React", "Node.js", "IndexedDB", "GraphQL", "UI/UX"],
    tinyfishPipeline: ["Search", "Fetch", "Agent"],
    agentActionsSummary: "Ashby job extracted with TinyFish Agent."
  }
];

module.exports = { SAMPLE_LISTINGS };
