/* Keystone curriculum — part 3 of 3 (worlds 9–12). See curriculum-1.js for the format. */
(function () {
  'use strict';
  const L = (id, title, mins, summary, topics, covers, lab) => ({ id, title, mins, summary, topics, covers: covers || [], lab: lab || null });

  // ───────────────────────────── WORLD 9 ─────────────────────────────
  KS.world({
    id: 'shipping', title: 'Ship It', emoji: '📦', color: '#2dd4bf',
    blurb: 'Containers, pipelines and the cloud: getting code to production and keeping it there.',
    modules: [
      { id: 'containers', title: 'Containers & Orchestration', emoji: '🐳', tagline: 'Docker, Kubernetes and “works on my machine”.', lessons: [
        L('ct-vm-vs-container', 'Virtual Machines vs Containers', 8, 'A whole house, versus a flat in a shared building.', 'the “works on my machine” problem; virtual machines and hypervisors; containers: shared kernel, isolated processes; namespaces and cgroups; LXC and where Docker came from', ['be:lxc', 'sa:containers']),
        L('ct-docker', 'Docker: Images & Containers', 10, 'A recipe, a frozen meal, and a meal being eaten.', 'images vs containers; the Dockerfile and its layers; registries; ports, volumes and environment variables; good image hygiene', ['sa:containers']),
        L('ct-compose', 'Multi-Container Apps', 7, 'App, database and cache, started with one command.', 'one container per concern; Docker Compose; container networks and service names; volumes for data; reproducible dev environments', ['sa:containers']),
        L('ct-k8s-basics', 'Kubernetes I: Desired State', 10, 'Tell it what you want; it keeps making it true.', 'why orchestration exists; the control loop: desired vs actual state; pods, deployments and services; self-healing and scaling; nodes and the control plane', ['sa:containers'], 'k8s-lab'),
        L('ct-k8s-more', 'Kubernetes II: Running Real Workloads', 9, 'The pieces you meet on day two.', 'ingress; ConfigMaps and Secrets; rolling updates and rollbacks; requests, limits and autoscaling; namespaces and Helm; do you even need Kubernetes?', ['sa:containers'])
      ] },
      { id: 'delivery', title: 'CI/CD, Cloud & Infrastructure', emoji: '🚚', tagline: 'Pipelines, infrastructure as code and cloud patterns.', lessons: [
        L('dl-ci', 'Continuous Integration', 9, 'Merge small, merge often, let robots check.', 'merging small and often; the pipeline: build, lint, test; fast feedback; build artefacts; keeping the main branch green', ['be:ci--cd', 'sa:ci--cd'], 'cicd-pipeline'),
        L('dl-cd', 'Continuous Delivery & Deployment', 9, 'Making releases boring.', 'delivery vs deployment; environments and promotion; rolling, blue/green and canary releases; feature flags; rollbacks', ['be:ci--cd', 'sa:ci--cd'], 'deploy-strategies'),
        L('dl-iac', 'Infrastructure as Code', 8, 'Servers described in files, reviewed like code.', 'servers defined in files; declarative vs imperative; Terraform, CloudFormation and Ansible; immutable infrastructure; GitOps', ['sa:infrastructure-as-code']),
        L('dl-cloud', 'Cloud Providers & Service Models', 9, 'Renting computers by the second — and everything built on top.', 'AWS, Azure and Google Cloud; IaaS, PaaS, SaaS and FaaS; regions and availability zones; the shared responsibility model; managed services vs running your own', ['sa:cloud-providers']),
        L('dl-cloud-patterns', 'Cloud Design Patterns', 9, 'A catalogue of solutions that keep turning up in the cloud.', 'a catalogue of proven cloud solutions; sidecar and ambassador; gateway aggregation and backends-for-frontends; retry, circuit breaker and bulkhead; strangler fig, CQRS and competing consumers', ['sa:cloud-design-patterns']),
        L('dl-operations', 'Operations Knowledge for Builders', 8, 'You build it, you run it.', 'environments and configuration; secrets; backups and disaster recovery; cost awareness; “you build it, you run it”', ['sa:operations-knowledge'])
      ] }
    ]
  });

  // ───────────────────────────── WORLD 10 ─────────────────────────────
  KS.world({
    id: 'architect', title: 'The Architect', emoji: '🧭', color: '#e879f9',
    blurb: 'The job beyond the code: decisions, people, frameworks, process and the enterprise landscape.',
    modules: [
      { id: 'architect-role', title: 'The Architect’s Job', emoji: '🎩', tagline: 'What architects actually do all day.', lessons: [
        L('ar-what-is-architecture', 'What Is Software Architecture?', 7, 'The shape of a system and the reasons behind it.', 'structure plus the decisions behind it; why architecture matters more as systems grow; architecture is never finished; good architecture makes change cheap', ['sa:what-is-software-architecture']),
        L('ar-what-is-architect', 'What Does an Architect Do?', 8, 'Less drawing boxes, more making good decisions with people.', 'the role in one sentence; day-to-day responsibilities; architect vs senior developer vs tech lead; the ivory-tower anti-pattern', ['sa:what-is-a-software-architect', 'sa:responsibilities']),
        L('ar-levels', 'Levels: Application, Solution, Enterprise', 8, 'Zooming from one app to the whole company.', 'application architecture; solution architecture; enterprise architecture; zooming in and out; who talks to whom', ['sa:levels-of-architecture', 'sa:application-architecture', 'sa:solution-architecture', 'sa:enterprise-architecture']),
        L('ar-design-decide', 'Design, Decide, Simplify', 9, 'The three verbs of the job.', 'design and architecture as a skill; deciding with incomplete information; Architecture Decision Records; the last responsible moment; simplifying as the core job', ['sa:important-skills-to-learn', 'sa:design--architecture', 'sa:decision-making', 'sa:simplifying-things']),
        L('ar-code-document', 'Keep Coding, Keep Documenting', 8, 'Stay credible, and write things people actually read.', 'why architects must still code; prototypes and spikes; documentation that gets read; the C4 model and arc42; diagrams as code', ['sa:how-to-code', 'sa:documentation']),
        L('ar-communicate', 'Communication, Consulting & Coaching', 8, 'Your design is only as good as your ability to explain it.', 'explaining to developers, managers and customers; listening first; consulting and coaching instead of dictating; running a design review', ['sa:communication', 'sa:consult--coach']),
        L('ar-estimate-balance', 'Estimate, Evaluate & Balance', 9, 'How long, how much, which option — and what to sacrifice.', 'estimating effort and cost; evaluating technologies and designs; build vs buy; balancing quality, deadlines and technical debt; pragmatic trade-offs', ['sa:estimate-and-evaluate', 'sa:balance']),
        L('ar-marketing', 'Marketing Your Ideas', 7, 'A great idea nobody adopts is worth nothing.', 'a good idea nobody adopts is worthless; motivating and convincing; prototypes and demos; finding allies; building a reputation', ['sa:marketing-skills'])
      ] },
      { id: 'architect-frameworks', title: 'Frameworks, Modelling & Process', emoji: '📚', tagline: 'UML, TOGAF, agile methods and classic project management.', lessons: [
        L('af-uml', 'UML & Diagramming', 9, 'A shared alphabet for drawing software.', 'why draw at all; class, sequence, component and deployment diagrams; reading UML arrows; UML vs the C4 model; just enough diagramming', ['sa:uml', 'sa:frameworks']),
        L('af-togaf', 'TOGAF', 8, 'The best-known framework for enterprise architecture.', 'what an enterprise architecture framework is; the ADM cycle; business, data, application and technology architectures; when TOGAF helps and when it is theatre', ['sa:togaf']),
        L('af-babok-iaf', 'BABOK & IAF', 7, 'The business analyst’s handbook, and Capgemini’s framework.', 'BABOK: the business analysis body of knowledge; eliciting requirements and analysing stakeholders; IAF: the Integrated Architecture Framework; how architects use them', ['sa:babok', 'sa:iaf']),
        L('af-agile-scrum', 'Agile & Scrum', 9, 'Short loops, real feedback.', 'the Agile Manifesto in plain English; Scrum roles, events and artefacts; sprints and the backlog; architecture inside an agile team', ['sa:scrum', 'sa:management']),
        L('af-kanban-xp', 'Kanban & Extreme Programming', 8, 'Limit work in progress; turn good practices up to eleven.', 'visualising work and limiting work in progress; flow, lead time and cycle time; XP practices: pairing, TDD, CI and refactoring; choosing between Scrum and Kanban', ['sa:kanban', 'sa:xp'], 'kanban-sim'),
        L('af-scaled-agile', 'Scaling Agile: LeSS & SAFe', 7, 'What happens when fifty teams try to be agile together.', 'many teams, one product; LeSS: Scrum scaled with few extras; SAFe: release trains and layers of roles; the criticisms, and when they fit', ['sa:less', 'sa:safe']),
        L('af-classic-pm', 'PMI, PRINCE2, RUP & ITIL', 8, 'The classic acronyms you will meet in big organisations.', 'PMI and the PMBOK; PRINCE2; the Rational Unified Process; ITIL and service management; what an architect needs from each', ['sa:pmi', 'sa:prince2', 'sa:rup', 'sa:itil']),
        L('af-tools', 'The Architect’s Toolbox', 6, 'Git, Slack, Trello, Jira and Confluence.', 'Git and GitHub for everything-as-code; Slack and asynchronous communication; Trello and boards; Jira and Confluence; choosing tools the team will actually use', ['sa:tools', 'sa:git', 'sa:github', 'sa:slack', 'sa:trello', 'sa:atlassian-tools'])
      ] },
      { id: 'web-mobile', title: 'Web & Mobile Architecture', emoji: '📱', tagline: 'SPA, SSR, microfrontends, mobile and web standards.', lessons: [
        L('wm-rendering', 'SPA, SSR & SSG', 9, 'Where does the HTML get built: browser, server, or build time?', 'where the HTML gets built; single-page apps; server-side rendering; static site generation; hydration, SEO and how to choose', ['sa:spa-ssr-ssg', 'sa:web-mobile']),
        L('wm-frameworks', 'React, Vue & Angular', 8, 'Three takes on building interfaces from components.', 'components and declarative UI; React; Vue; Angular; what an architect should weigh when choosing', ['sa:react-vue-angular']),
        L('wm-state-reactive', 'State, Reactivity & Functional UIs', 8, 'The screen is a function of the data.', 'UI as a function of state; one-way data flow; reactive state and signals; functional ideas in front ends; client state vs server state', ['sa:reactive-programming', 'sa:functional-programming']),
        L('wm-microfrontends', 'Microfrontends', 8, 'Microservices, but for the front end.', 'microservices for the front end; ways to compose them; shared design systems; when it helps and the price you pay', ['sa:microfrontends']),
        L('wm-mobile-pwa', 'Mobile Apps & PWAs', 8, 'Native, cross-platform, or a website that acts like an app.', 'native, cross-platform and hybrid apps; progressive web apps and service workers; offline-first; backends for mobile: BFF, push and versioning', ['sa:web-mobile']),
        L('wm-standards', 'W3C, WHATWG & Web Standards', 6, 'Who decides how the web works.', 'who decides how the web works; W3C and WHATWG; living standards; browser support and progressive enhancement; accessibility as a standard', ['sa:w3c-and-whatwg'])
      ] },
      { id: 'enterprise-software', title: 'Enterprise Software', emoji: '🏦', tagline: 'SAP, Salesforce, Dynamics and the systems big companies run on.', lessons: [
        L('es-landscape', 'The Enterprise Software Landscape', 7, 'ERP, CRM, DMS, BPM: decoding the acronyms.', 'what “enterprise software” means; ERP, CRM, DMS and BPM; systems of record; why architects must know the big vendors; buy, build or integrate', ['sa:enterprise-software']),
        L('es-sap', 'SAP: ERP, HANA & BusinessObjects', 8, 'The system that runs the back office of the world.', 'what an ERP does; SAP’s modules; HANA: the in-memory database; BusinessObjects for reporting; integrating with SAP', ['sa:sap-erp-hana-business-objects']),
        L('es-dynamics-salesforce', 'Microsoft Dynamics & Salesforce', 8, 'Customer relationships as a platform.', 'CRM in one picture; Salesforce as a platform; Microsoft Dynamics 365; customising vs configuring; APIs and integration', ['sa:ms-dynamics', 'sa:salesforce']),
        L('es-ibm-emc', 'IBM BPM & EMC Document Management', 7, 'Workflow engines and digital filing cabinets.', 'business process management suites; IBM BPM; document management systems; EMC Documentum; workflow, compliance and retention', ['sa:ibm-bpm', 'sa:emc-dms']),
        L('es-integration', 'Integrating with Enterprise Systems', 8, 'Living alongside systems you cannot change.', 'point-to-point spaghetti; integration platforms and iPaaS; anti-corruption layers; vendor lock-in; data ownership and master data', ['sa:enterprise-software'])
      ] }
    ]
  });

  // ───────────────────────────── WORLD 11 ─────────────────────────────
  KS.world({
    id: 'ai', title: 'AI for Builders', emoji: '🤖', color: '#60a5fa',
    blurb: 'How large language models work, how to code with them, and how to build them into a backend.',
    modules: [
      { id: 'ai-foundations', title: 'LLMs & AI-Assisted Coding', emoji: '✨', tagline: 'How the models work and how to work with them.', lessons: [
        L('ai-how-llms-work', 'How LLMs Work', 10, 'Autocomplete that has read most of the internet.', 'predicting the next token; tokens and context windows; training vs inference; temperature and randomness; hallucinations and knowledge cut-offs', ['be:how-llms-work']),
        L('ai-vs-traditional', 'AI vs Traditional Coding', 7, 'Exact instructions versus educated guesses.', 'deterministic code vs probabilistic models; what AI is good and bad at; you are still responsible for the code; where AI fits in the development loop', ['be:ai-vs-traditional-coding', 'be:ai-assisted-coding']),
        L('ai-prompting', 'Prompting Techniques', 9, 'Brief the model like a smart new colleague.', 'clear instructions and context; examples (few-shot prompting); asking for step-by-step reasoning; roles and system prompts; iterating on a prompt', ['be:prompting-techniques']),
        L('ai-coding-tools', 'AI Coding Tools', 8, 'Chat, autocomplete and agents that edit your repo.', 'chat assistants, editor autocomplete and coding agents; Claude Code; Cursor; GitHub Copilot; Google Antigravity; working safely with agents', ['be:claude-code', 'be:cursor', 'be:copilot', 'be:antigravity']),
        L('ai-providers', 'Model Providers: OpenAI, Anthropic & Gemini', 7, 'Intelligence as an API call.', 'models as an API; OpenAI; Anthropic; Google Gemini; choosing a model: capability, speed, cost and context; open-weight models', ['be:openai', 'be:anthropic', 'be:gemini']),
        L('ai-applications', 'AI in Your Workflow', 8, 'Reviews, refactors, docs and tests — with a co-pilot.', 'AI code review; refactoring with AI; generating documentation; writing tests; knowing when not to trust it', ['be:applications', 'be:code-reviews', 'be:refactoring', 'be:documentation-generation'])
      ] },
      { id: 'ai-building', title: 'Building with LLMs', emoji: '🧰', tagline: 'Structured outputs, tools, RAG, agents and MCP.', lessons: [
        L('ai-structured-outputs', 'Structured Outputs', 7, 'Getting JSON you can trust instead of prose you must parse.', 'getting JSON instead of prose; schemas; validating and retrying; why structure makes LLMs usable from code', ['be:structured-outputs']),
        L('ai-function-calling', 'Function Calling & Tools', 9, 'Letting the model ask your code to do things.', 'letting a model ask your code to act; describing tools; the request → execute → respond loop; safety and permissions', ['be:function-calling']),
        L('ai-streaming', 'Streaming Responses', 7, 'Why the words appear one at a time.', 'why tokens arrive one at a time; streaming over Server-Sent Events; time to first token; handling partial output and cancellation', ['be:streaming']),
        L('ai-embeddings-vectors', 'Embeddings & Vector Databases', 9, 'Turning meaning into coordinates you can search.', 'meaning as a list of numbers; similarity search; vector databases and their indexes; chunking documents; uses beyond search', ['be:embeddings', 'be:vectors']),
        L('ai-rag', 'Retrieval-Augmented Generation', 9, 'An open-book exam for the model.', 'giving a model your own data at question time; retrieve, augment, generate; chunking and ranking; citations; RAG vs fine-tuning', ['be:rags']),
        L('ai-agents', 'AI Agents', 9, 'A model in a loop, with tools and a goal.', 'a model in a loop with tools; plan, act, observe; memory and context management; multi-agent systems; failure modes and guardrails', ['be:agents']),
        L('ai-mcp-skills', 'MCP & Skills', 8, 'A standard plug for giving AI tools and know-how.', 'the Model Context Protocol: a standard plug for tools and data; hosts, clients and servers; skills: packaged instructions an agent loads on demand; security considerations', ['be:mcp', 'be:skills'])
      ] }
    ]
  });

  // ───────────────────────────── WORLD 12 ─────────────────────────────
  KS.world({
    id: 'studio', title: 'System Design Studio', emoji: '🏗️', color: '#facc15',
    blurb: 'Put it all together. A method for designing any system, then eight guided designs where you make the calls.',
    modules: [
      { id: 'system-design', title: 'The System Design Method', emoji: '🧮', tagline: 'A repeatable way to design anything.', lessons: [
        L('sdm-framework', 'A Framework for Any Design Problem', 9, 'Five steps that turn a vague brief into a defensible design.', 'clarify the requirements; estimate the scale; define the API and data model; sketch the high-level design; dive deep and discuss trade-offs', []),
        L('sdm-estimation', 'Back-of-the-Envelope Estimation', 9, 'Rough numbers, fast — good enough to choose a design.', 'powers of two and ten; from daily users to requests per second; storage and bandwidth; sanity checks; rounding without fear', [], 'estimation-lab'),
        L('sdm-building-blocks', 'The Building Blocks', 9, 'The dozen parts nearly every large system is made of.', 'load balancers, app servers, databases, caches, queues, CDNs, object storage and search; what each is for; the signal that you need one; common combinations', []),
        L('sdm-evolution', 'From One User to Ten Million', 10, 'The classic scaling story, one bottleneck at a time.', 'one box; splitting app and database; replicas and caches; stateless servers behind a load balancer; queues, sharding and multiple regions', [], 'startup-survival')
      ] },
      { id: 'capstones', title: 'Capstone Designs', emoji: '🎓', tagline: 'Eight real systems. You are the architect.', lessons: [
        L('cap-url-shortener', 'Design a URL Shortener', 12, 'Small on the surface, a full system underneath.', 'requirements and scale; generating short keys; storage and the redirect path; caching and analytics; preventing abuse', []),
        L('cap-chat', 'Design a Chat App', 12, 'Messages that arrive instantly, in order, exactly once-ish.', 'real-time delivery with WebSockets; storing and ordering messages; presence and typing indicators; offline delivery and push; group chats', []),
        L('cap-news-feed', 'Design a News Feed', 12, 'What happens when someone with fifty million followers posts.', 'fan-out on write vs fan-out on read; the celebrity problem; ranking; caching the feed; pagination', []),
        L('cap-checkout', 'Design an E-Commerce Checkout', 12, 'Take the money once, ship the thing once.', 'inventory and overselling; payments and idempotency; the order saga; consistency vs availability choices; handling failure', []),
        L('cap-video', 'Design a Video Streaming Service', 12, 'From an upload button to a billion plays.', 'uploads and object storage; transcoding pipelines with queues; adaptive bitrate streaming; CDN delivery; metadata and search', []),
        L('cap-ride-hailing', 'Design a Ride-Hailing Service', 12, 'Matching moving dots on a map in real time.', 'location updates at scale; geospatial indexing; matching riders and drivers; real-time tracking; surge pricing and consistency', []),
        L('cap-auth-platform', 'Design Auth for a Multi-Tenant SaaS', 12, 'Logins, roles and tenant walls for thousands of companies.', 'tenants, users and organisations; login: sessions, tokens and SSO; roles, permissions and tenant isolation; API keys and service accounts; audit logs', []),
        L('cap-incident', '3 a.m.: Production Is Down', 12, 'Your pager is going off. What do you do first?', 'triage: what changed?; reading dashboards and logs; mitigate first, fix later; communicating during an incident; the blameless postmortem', [])
      ] }
    ]
  });
})();
