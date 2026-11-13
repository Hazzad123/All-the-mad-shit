/* Keystone curriculum — part 2 of 3 (worlds 5–8). See curriculum-1.js for the format. */
(function () {
  'use strict';
  const L = (id, title, mins, summary, topics, covers, lab) => ({ id, title, mins, summary, topics, covers: covers || [], lab: lab || null });

  // ───────────────────────────── WORLD 5 ─────────────────────────────
  KS.world({
    id: 'apis', title: 'APIs & Messaging', emoji: '🔌', color: '#fbbf24',
    blurb: 'How programs talk to each other: REST, gRPC, GraphQL, real-time connections and message queues.',
    modules: [
      { id: 'api-design', title: 'API Design & REST', emoji: '📋', tagline: 'Contracts between programs, done well.', lessons: [
        L('api-what', 'What Is an API?', 7, 'A menu that tells other programs what they can order.', 'an API as a contract between programs; endpoints, requests and responses; public, private and partner APIs; the main API styles at a glance; why backend work is mostly API work', ['be:learn-about-apis', 'sa:apis--integrations']),
        L('api-rest', 'REST: Resources & Representations', 9, 'Treat everything as a thing with an address.', 'resources and their URLs; representations (usually JSON); using HTTP methods and status codes properly; statelessness; the REST constraints in plain English', ['be:rest', 'sa:rest'], 'http-playground'),
        L('api-rest-design', 'Designing Good REST APIs', 10, 'The small decisions that make an API a joy or a chore.', 'naming resources (nouns, plurals, nesting); filtering, sorting and pagination; versioning strategies; consistent error responses; the Richardson maturity model', ['be:rest']),
        L('api-json', 'JSON APIs & Data Formats', 8, 'The shapes data takes while it travels.', 'JSON and why it won; the JSON:API specification; XML, Protocol Buffers and friends; serialising and deserialising; dates, big numbers and other JSON traps', ['be:json-apis']),
        L('api-openapi-hateoas', 'OpenAPI Specs & HATEOAS', 8, 'APIs that describe themselves.', 'describing an API in a machine-readable file; OpenAPI (Swagger) and generated docs, clients and mocks; design-first vs code-first; HATEOAS: responses that carry their own links', ['be:open-api-specs']),
        L('api-reliability', 'Reliable APIs: Idempotency, Retries & Limits', 9, 'Assume the network will drop your request at the worst moment.', 'a timeout on every call; safe retries and idempotency keys; rate limiting and 429; pagination and payload limits; backwards compatibility and deprecation', []),
        L('api-integration-patterns', 'Integration Patterns', 9, 'The handful of ways two systems can be wired together.', 'synchronous vs asynchronous integration; request/reply, webhooks and polling; file transfer and shared databases (and why to avoid them); messaging; API gateways and backends-for-frontends', ['be:integration-patterns'])
      ] },
      { id: 'api-styles', title: 'Beyond REST', emoji: '🧬', tagline: 'SOAP, gRPC, GraphQL and enterprise integration.', lessons: [
        L('api-soap', 'SOAP & XML Web Services', 7, 'The formal, contract-heavy grandparent of web APIs.', 'envelopes, WSDL and strict contracts; the WS-* standards; why enterprises still run it; SOAP vs REST', ['be:soap', 'sa:esb-soap']),
        L('api-grpc', 'gRPC & Protocol Buffers', 9, 'Call a function on another machine as if it were local.', 'remote procedure calls; Protocol Buffers and generated code; HTTP/2 streaming (unary, server, client, bidirectional); where gRPC shines: service-to-service; limits in the browser', ['be:grpc', 'sa:grpc']),
        L('api-graphql', 'GraphQL', 10, 'One endpoint; ask for exactly the fields you need.', 'one endpoint, precise queries; schema, types, queries and mutations; resolvers; over-fetching and under-fetching; the N+1 trap, DataLoader, and clients like Apollo and Relay', ['be:graphql', 'sa:graphql'], 'graphql-explorer'),
        L('api-esb-bpm', 'ESB, BPM & BPEL', 8, 'The enterprise switchboard and the workflow engines around it.', 'the enterprise service bus as a central switchboard; smart pipes vs smart endpoints; business process management and BPEL; orchestration engines; what the industry kept and what it dropped', ['sa:esb-soap', 'sa:bpm-bpel']),
        L('api-choosing', 'Choosing an API Style', 8, 'REST, gRPC, GraphQL or SOAP? It depends — here is on what.', 'REST vs gRPC vs GraphQL vs SOAP on one page; public APIs vs internal calls vs mobile apps; mixing styles in one system; a decision checklist', [])
      ] },
      { id: 'realtime', title: 'Real-Time Communication', emoji: '⚡', tagline: 'Polling, Server-Sent Events and WebSockets.', lessons: [
        L('rt-why', 'Real-Time Data: The Problem', 6, 'HTTP only speaks when spoken to. So how do chat apps work?', 'HTTP only answers when asked; what “real-time” actually means; push vs pull; the four techniques at a glance', ['be:real-time-data']),
        L('rt-polling', 'Short & Long Polling', 7, '“Are we there yet?” versus “tell me when we arrive”.', 'short polling: are we there yet?; wasted requests and delay; long polling: hold the line open; timeouts and reconnects; when polling is good enough', ['be:long--short-polling']),
        L('rt-sse', 'Server-Sent Events', 7, 'A one-way news ticker over plain HTTP.', 'a one-way stream over plain HTTP; the EventSource API; automatic reconnection and event IDs; ideal uses: feeds, notifications and progress', ['be:server-sent-events']),
        L('rt-websockets', 'WebSockets & Choosing a Technique', 9, 'A phone call instead of an exchange of letters.', 'upgrading HTTP to a two-way connection; frames, pings and pongs; scaling stateful connections; webhooks for server-to-server pushes; choosing between polling, SSE, WebSockets and webhooks', ['be:websockets'], 'realtime-lab')
      ] },
      { id: 'messaging', title: 'Messaging & Event Streaming', emoji: '📬', tagline: 'Queues, pub/sub, RabbitMQ and Kafka.', lessons: [
        L('mq-why', 'Why Message Queues?', 8, 'Let systems talk without both being awake at the same time.', 'decoupling in time; buffering spikes (load levelling); retrying without losing work; producers, brokers and consumers; when a queue is the wrong tool', ['be:message-brokers', 'sa:messaging-queues', 'sd:message-queues--streams'], 'queue-lab'),
        L('mq-patterns', 'Queues, Pub/Sub & Streams', 9, 'One reader, many readers, or a tape you can rewind.', 'point-to-point queues and competing consumers; publish/subscribe and fan-out; topics and routing; event streams as a replayable log; consumer groups', ['sd:message-queues--streams']),
        L('mq-guarantees', 'Delivery Guarantees', 9, 'At most once, at least once, and the myth of exactly once.', 'at-most-once, at-least-once and “exactly-once”; acknowledgements and redelivery; idempotent consumers; ordering; dead-letter queues and poison messages', ['sa:messaging-queues']),
        L('mq-rabbitmq', 'RabbitMQ', 8, 'The smart post office.', 'exchanges, queues and bindings; direct, topic, fanout and headers exchanges; routing keys; acknowledgements and prefetch; what RabbitMQ is best at', ['be:rabbitmq']),
        L('mq-kafka', 'Kafka', 9, 'The append-only log that half the industry runs on.', 'topics, partitions and offsets; the log that keeps everything; consumer groups and rebalancing; retention and compaction; Kafka vs RabbitMQ', ['be:kafka'])
      ] }
    ]
  });

  // ───────────────────────────── WORLD 6 ─────────────────────────────
  KS.world({
    id: 'security', title: 'Security & Identity', emoji: '🔐', color: '#fb7185',
    blurb: 'Who are you? What are you allowed to do? And how do we keep everyone else out? Authentication, authorization and web security from first principles.',
    modules: [
      { id: 'crypto', title: 'Cryptography Basics', emoji: '🔑', tagline: 'Hashes, keys, signatures and certificates.', lessons: [
        L('cr-hashing', 'Hashing: Digital Fingerprints', 9, 'Turn anything into a short fingerprint you cannot reverse.', 'one-way functions; fixed-size output and the avalanche effect; collisions; MD5 and SHA-1 are broken, SHA-2 and SHA-3 are not; uses: integrity, deduplication and signatures', ['be:md5', 'be:sha', 'sa:hashing-algorithms'], 'hash-lab'),
        L('cr-passwords', 'Storing Passwords Safely', 9, 'How to keep passwords so that even you cannot read them.', 'never store plain text or fast hashes; salts and rainbow tables; slow hashes: bcrypt, scrypt and Argon2; work factors and peppers; credential stuffing and breach lists', ['be:bcrypt', 'be:scrypt', 'sa:hashing-algorithms'], 'hash-lab'),
        L('cr-encryption', 'Encryption: Symmetric & Asymmetric', 9, 'One shared key, or a padlock anyone can snap shut.', 'encoding vs hashing vs encryption; symmetric keys (AES); public/private key pairs (RSA, elliptic curves); key exchange with Diffie–Hellman; encryption at rest and in transit', []),
        L('cr-signatures', 'Digital Signatures & HMAC', 8, 'Proving who sent it, and that nobody changed it.', 'authenticity and integrity; signing with a private key, verifying with a public key; HMAC with a shared secret; where you meet them: JWTs, webhooks and software updates', []),
        L('cr-pki', 'PKI & Certificates', 9, 'How your browser decides a stranger’s key can be trusted.', 'the problem: whose public key is this?; certificate authorities and the chain of trust; what is inside a certificate; issuing, renewing and revoking; mutual TLS', ['sa:pki'], 'pki-chain'),
        L('cr-tls', 'The TLS Handshake, Step by Step', 9, 'The few milliseconds where two strangers agree on a secret.', 'hello and cipher negotiation; checking the certificate; agreeing a session key; switching to fast symmetric encryption; TLS 1.2 vs 1.3 and forward secrecy', ['be:ssltls', 'be:https'])
      ] },
      { id: 'authn', title: 'Authentication', emoji: '🪪', tagline: 'Proving who you are: sessions, tokens, JWT, OAuth, OIDC, SAML.', lessons: [
        L('au-basics', 'Authentication vs Authorization', 7, 'Who you are, versus what you are allowed to do.', 'who you are vs what you may do; identity, credentials and factors; the life of a login; sessions vs tokens preview; vocabulary: principal, claim, identity provider', ['be:authentication', 'sa:auth-strategies', 'sa:security']),
        L('au-basic', 'Basic Authentication', 6, 'Username and password on every single request.', 'username:password in a header; Base64 is not encryption; why it needs HTTPS; where it is still fine; a footnote on Digest auth', ['be:basic-authentication']),
        L('au-sessions', 'Sessions & Cookie-Based Auth', 9, 'The cloakroom ticket of the web.', 'the server remembers you with a session; session IDs in cookies; HttpOnly, Secure and SameSite; session stores and scaling; logout, expiry and session fixation', ['be:cookie-based-auth'], 'session-vs-token'),
        L('au-tokens', 'Token Authentication', 8, 'Carry proof with you instead of being remembered.', 'bearer tokens; opaque tokens vs self-contained tokens; API keys; access tokens and refresh tokens; where to keep tokens in a browser or app', ['be:token-authentication'], 'session-vs-token'),
        L('au-jwt', 'JWT: Anatomy of a Token', 10, 'A signed note that says who you are — readable by anyone.', 'header, payload and signature; claims (iss, sub, aud, exp); signed is not encrypted; verifying and expiring; the revocation problem and classic mistakes', ['be:jwt'], 'jwt-lab'),
        L('au-oauth', 'OAuth 2.0: Delegated Access', 11, 'Giving an app a valet key instead of your house keys.', 'access without handing over your password; the four roles; the authorization code flow with PKCE; scopes and consent; client credentials, and why the implicit and password flows died', ['be:oauth'], 'oauth-flow'),
        L('au-oidc', 'OpenID Connect', 8, 'The layer that makes “Sign in with…” buttons work.', 'OAuth is authorization, OIDC adds identity; the ID token; “Sign in with…” buttons; userinfo and discovery; OIDC vs OAuth vs SAML', ['be:openid']),
        L('au-saml-sso', 'SAML & Enterprise SSO', 8, 'One company login to rule them all.', 'single sign-on; identity provider and service provider; XML assertions; SP-initiated vs IdP-initiated login; when you will meet SAML', ['be:saml']),
        L('au-mfa', 'MFA, TOTP & Passkeys', 9, 'A second lock, and the end of passwords.', 'something you know, have and are; how TOTP codes work; the risks of SMS codes; WebAuthn and passkeys; recovery flows as the weak link', [], 'totp-lab'),
        L('au-choosing', 'Choosing an Auth Strategy', 9, 'Sessions or JWTs? Build or buy? Decide with a clear head.', 'sessions vs JWTs for a web app; mobile apps and single-page apps; machine-to-machine; build vs buy (Auth0, Cognito, Keycloak); a decision checklist', ['sa:auth-strategies'])
      ] },
      { id: 'authz', title: 'Authorization', emoji: '🛂', tagline: 'Deciding what each user may do: ACL, RBAC, ABAC, ReBAC.', lessons: [
        L('az-basics', 'Authorization 101', 8, 'Every request asks: may this person do this, to that?', 'subject, action and resource; default deny; least privilege; policies and decisions; authentication is not authorization', ['sa:auth-strategies']),
        L('az-acl', 'ACLs & Ownership', 7, 'A guest list on every door.', 'per-resource permission lists; owners and sharing; file permissions as an ACL; where ACLs become unmanageable', []),
        L('az-rbac', 'RBAC: Roles & Permissions', 9, 'Give permissions to job titles, not to people.', 'users → roles → permissions; role hierarchies; role explosion; check permissions, not role names; RBAC in databases, clouds and apps', [], 'rbac-lab'),
        L('az-abac', 'ABAC & Policy Engines', 9, 'Decide using facts about the user, the thing and the moment.', 'decisions from attributes of user, resource and context; policies as code (OPA, Cedar); RBAC vs ABAC; testing policies', [], 'rbac-lab'),
        L('az-rebac', 'ReBAC: Relationship-Based Access', 8, '“You can see it because you are in the folder’s team.”', 'permissions from relationships (owner, member, parent folder); the Google Zanzibar model; when ReBAC beats RBAC; modelling shares and groups', []),
        L('az-scopes-claims', 'Scopes, Claims & Tokens', 8, 'What a token is allowed to do, and what it says about you.', 'OAuth scopes vs user permissions; claims carried in tokens; audience checks; stale tokens and revocation; the confused deputy', []),
        L('az-enforcement', 'Where to Enforce Authorization', 9, 'At the gate, in the room, and on the filing cabinet.', 'gateway vs service vs database; decision points vs enforcement points; multi-tenancy and row-level security; service-to-service auth and zero trust; defence in depth', []),
        L('az-failures', 'Broken Access Control', 9, 'The number-one web vulnerability, and how it happens.', 'IDOR: changing an ID in the URL; missing function-level checks; privilege escalation; trusting the client; how to test authorization', [])
      ] },
      { id: 'websec', title: 'Web Security', emoji: '🛡️', tagline: 'OWASP, injection, XSS, CSRF, CORS and hardening.', lessons: [
        L('ws-mindset', 'Thinking Like an Attacker', 8, 'You cannot defend a system until you have imagined breaking it.', 'assets, threats and attack surface; threat modelling with STRIDE; defence in depth; security as a trade-off', ['be:web-security', 'sa:security']),
        L('ws-owasp', 'The OWASP Top 10', 9, 'The ten ways web apps most often get hurt.', 'what OWASP is; the ten risk categories in plain English; which ones bite most often; using the list as a checklist', ['be:owasp-risks', 'sa:owasp']),
        L('ws-injection', 'Injection: SQLi & Friends', 9, 'When user input gets mistaken for code.', 'mixing code and data; SQL injection step by step; parameterised queries; command and template injection; input validation vs output encoding', ['be:owasp-risks'], 'injection-lab'),
        L('ws-xss-csp', 'XSS & Content Security Policy', 9, 'An attacker’s script, running on your page, as your user.', 'stored, reflected and DOM XSS; what an attacker’s script can do; output encoding and safe templating; Content Security Policy; HttpOnly cookies', ['be:csp'], 'injection-lab'),
        L('ws-csrf-cors', 'CSRF, Same-Origin Policy & CORS', 10, 'The browser rule everyone meets as a red console error.', 'the same-origin policy; CSRF and why cookies make it possible; CSRF tokens and SameSite; CORS: relaxing the rule on purpose; preflight requests and common misconfigurations', ['be:cors'], 'cors-lab'),
        L('ws-server-security', 'Server Security & Hardening', 8, 'Locking the machine itself.', 'patching and minimal installs; least privilege and SSH keys; firewalls and closed ports; secrets management; security headers and TLS configuration', ['be:server-security']),
        L('ws-api-security', 'API Security Best Practices', 9, 'A checklist to run before anything goes live.', 'authenticate and authorise every request; validate input, limit output; rate limiting and abuse protection; secrets, logging and audit trails; a pre-launch checklist', ['be:web-security'])
      ] }
    ]
  });

  // ───────────────────────────── WORLD 7 ─────────────────────────────
  KS.world({
    id: 'scale', title: 'Performance & Scale', emoji: '🚀', color: '#fb923c',
    blurb: 'From ten users to ten million without falling over: caching, load balancing, resilience and observability.',
    modules: [
      { id: 'caching', title: 'Caching', emoji: '⚡', tagline: 'Remember answers so you do not have to work them out twice.', lessons: [
        L('ca-why', 'Caching: Remembering Answers', 8, 'The single biggest performance trick in computing.', 'trading memory for speed; hits, misses and hit rate; TTL; the layers where caches live; the two hard problems', ['be:caching'], 'cache-sim'),
        L('ca-http', 'HTTP Caching', 9, 'Getting browsers to do your caching for free.', 'Cache-Control (max-age, no-cache, no-store, private, public); ETag and conditional requests; 304 Not Modified; cache-busting with fingerprinted filenames; client-side caches', ['be:http-caching'], 'http-cache-lab'),
        L('ca-cdn', 'CDNs', 8, 'Copies of your site, parked near every user.', 'edge servers near users; the origin and cache misses; what belongs on a CDN; purging and invalidation; a CDN as a shield', ['be:caching'], 'cdn-lab'),
        L('ca-server', 'Server-Side Caching: Redis & Memcached', 8, 'A scratchpad in memory, between your app and your database.', 'in-memory caches between app and database; Redis vs Memcached; what to cache (queries, sessions, computed pages); cache keys; local vs distributed caches', ['be:redis', 'be:memcached']),
        L('ca-strategies', 'Caching Strategies', 9, 'Five ways a cache and a database can share the work.', 'cache-aside; read-through; write-through; write-behind; refresh-ahead', ['be:caching']),
        L('ca-invalidation', 'Invalidation, Eviction & Stampedes', 9, 'Where caching goes wrong.', 'stale data and invalidation; eviction policies (LRU, LFU, TTL); the thundering herd; hot keys; negative caching', ['be:caching'], 'cache-sim')
      ] },
      { id: 'servers-scaling', title: 'Web Servers & Scaling Out', emoji: '🏭', tagline: 'Servers, load balancers and growing gracefully.', lessons: [
        L('sv-web-servers', 'What a Web Server Does', 7, 'The receptionist of your backend.', 'accepting connections and speaking HTTP; serving static files; reverse-proxying to app servers; TLS termination, compression and logging; web server vs application server', ['be:learn-about-web-servers']),
        L('sv-server-tour', 'Nginx, Apache, Caddy & IIS', 8, 'Four receptionists with different habits.', 'Nginx and the event loop; Apache and its modules; Caddy and automatic HTTPS; IIS in Windows shops; choosing one', ['be:nginx', 'be:apache', 'be:caddy', 'be:ms-iis']),
        L('sv-scaling-types', 'Vertical vs Horizontal Scaling', 8, 'A bigger machine, or more machines?', 'a bigger machine vs more machines; the limits and costs of each; single points of failure; what must change before you can scale out', ['be:building-for-scale']),
        L('sv-load-balancing', 'Load Balancing', 10, 'One front door, many servers behind it.', 'spreading requests across servers; round robin, least connections and hashing; health checks; layer 4 vs layer 7; sticky sessions', [], 'load-balancer'),
        L('sv-stateless', 'Stateless Services', 8, 'If any server can handle any request, scaling gets easy.', 'why state on a server blocks scaling; moving sessions to a shared store; shared-nothing design; idempotent handlers; where state should live', []),
        L('sv-capacity', 'Capacity Planning & Autoscaling', 9, 'How many servers do we need? Do the sums.', 'requests per second, concurrency and headroom; back-of-the-envelope sizing; autoscaling signals; scale-up lag and warm-up; cost', [], 'estimation-lab'),
        L('sv-latency', 'Latency & Performance Thinking', 9, 'Know your numbers; find the bottleneck.', 'latency numbers every engineer should know; percentiles (p50, p95, p99); throughput vs latency; finding the bottleneck; Amdahl’s law in plain English', [], 'latency-lab')
      ] },
      { id: 'resilience', title: 'Resilience', emoji: '🧯', tagline: 'Staying up when things break — because they will.', lessons: [
        L('rs-failure', 'Everything Fails', 8, 'At scale, failure is not an event. It is the weather.', 'failure is normal at scale; single points of failure and redundancy; availability “nines”; blast radius; designing for failure', ['be:building-for-scale']),
        L('rs-timeouts-retries', 'Timeouts, Retries & Backoff', 9, 'How to try again without making things worse.', 'always set a timeout; retrying safely; exponential backoff and jitter; retry storms; idempotency again', []),
        L('rs-circuit-breaker', 'Circuit Breakers', 8, 'Stop phoning a number that never picks up.', 'stop calling a service that is down; closed, open and half-open; failing fast and falling back; thresholds and tuning', ['be:circuit-breaker'], 'circuit-breaker'),
        L('rs-throttling', 'Throttling & Rate Limiting', 9, 'A polite “slow down” that keeps the service alive.', 'protecting a service from too many requests; token bucket, leaky bucket, fixed and sliding windows; limits per user and per IP; 429 and Retry-After', ['be:throttling'], 'rate-limiter'),
        L('rs-backpressure', 'Backpressure', 8, 'When the sink fills faster than it drains.', 'when producers outrun consumers; unbounded queues are a time bomb; push back, buffer or drop; backpressure in streams and in HTTP', ['be:backpressure'], 'queue-lab'),
        L('rs-loadshifting', 'Load Shifting & Load Shedding', 7, 'Do it later, or do not do it at all.', 'moving work to quieter times; queues and scheduled jobs; shedding low-priority load; prioritising traffic', ['be:loadshifting']),
        L('rs-graceful-degradation', 'Graceful Degradation', 8, 'A worse experience beats no experience.', 'a worse experience beats none; fallbacks and cached answers; feature flags and kill switches; bulkheads; designing the degraded mode on purpose', ['be:graceful-degradation']),
        L('rs-migration', 'Migration Strategies', 9, 'Changing the engine while the plane is flying.', 'changing a system while it runs; the strangler fig; blue/green and canary releases; dual writes and backfills; expand and contract', ['be:migrations'], 'deploy-strategies')
      ] },
      { id: 'observability', title: 'Observability', emoji: '🔭', tagline: 'Logs, metrics, traces and knowing why it broke.', lessons: [
        L('ob-why', 'Monitoring vs Observability', 7, 'Knowing that it is broken, versus knowing why.', 'knowing something is wrong vs knowing why; the three pillars; known unknowns and unknown unknowns; observability as a design goal', ['be:observability', 'be:monitoring']),
        L('ob-logs', 'Logs', 8, 'The diary your system keeps.', 'structured logs; log levels; correlation and request IDs; centralised logging; what must never be logged', ['be:monitoring']),
        L('ob-metrics', 'Metrics', 9, 'Numbers over time, and which ones matter.', 'counters, gauges and histograms; the RED and USE methods; percentiles, not averages; dashboards; cardinality', ['be:monitoring']),
        L('ob-traces', 'Distributed Tracing', 8, 'Following one request through twenty services.', 'following one request across services; traces and spans; propagating context; finding the slow hop; sampling', ['be:observability'], 'tracing-lab'),
        L('ob-instrumentation', 'Instrumentation & Telemetry', 8, 'Wiring your code so it can tell you what it is doing.', 'instrumenting code; automatic vs manual instrumentation; telemetry pipelines; OpenTelemetry; the overhead budget', ['be:instrumentation', 'be:telemetry']),
        L('ob-slo-alerting', 'SLOs, Alerting & Incidents', 9, 'Deciding how good is good enough — and who gets woken up.', 'SLIs, SLOs and SLAs; error budgets; alert on symptoms, not causes; on-call and runbooks; blameless postmortems', ['be:monitoring'])
      ] }
    ]
  });

  // ───────────────────────────── WORLD 8 ─────────────────────────────
  KS.world({
    id: 'architecture', title: 'Architecture', emoji: '🏛️', color: '#818cf8',
    blurb: 'The big shapes software systems take — and the reasoning that picks one over another.',
    modules: [
      { id: 'arch-principles', title: 'Architectural Principles', emoji: '🧱', tagline: 'Coupling, cohesion, components and boundaries.', lessons: [
        L('ap-what', 'What Is Architecture, Really?', 8, 'The decisions you wish you could get right early.', 'the decisions that are hard to change; structure: components and relationships; quality attributes (the “-ilities”); architecture vs design; everything is a trade-off', ['sd:architectural-principles']),
        L('ap-coupling-cohesion', 'Coupling & Cohesion', 9, 'The two forces behind almost every design rule.', 'coupling: how much modules know about each other; cohesion: how well a module’s parts belong together; kinds of coupling; the goal: low coupling, high cohesion; measuring the blast radius of a change', ['sd:coupling-and-cohesion'], 'coupling-graph'),
        L('ap-component-cohesion', 'Component Principles I: What Belongs Together', 8, 'Deciding which classes ship in the same box.', 'what a component is; the Reuse/Release Equivalence Principle; the Common Closure Principle; the Common Reuse Principle; the tension between them', ['sd:component-principles']),
        L('ap-component-coupling', 'Component Principles II: Managing Dependencies', 9, 'Which box may depend on which.', 'the Acyclic Dependencies Principle; breaking cycles; the Stable Dependencies Principle; the Stable Abstractions Principle; the main sequence in plain English', ['sd:component-principles']),
        L('ap-policy-detail', 'Policy vs Detail', 8, 'Business rules are the point. Databases and frameworks are details.', 'business rules are policy; databases, frameworks and UIs are details; keeping details replaceable; deferring decisions', ['sd:policy-vs-detail']),
        L('ap-boundaries', 'Boundaries', 9, 'Drawing lines so change on one side does not leak to the other.', 'lines between things that change for different reasons; the dependency rule; plug-in architecture; data that crosses a boundary; anti-corruption layers', ['sd:boundaries']),
        L('ap-quality-attributes', 'Quality Attributes & Trade-offs', 9, 'Fast, cheap, safe, simple: pick the ones that matter most.', 'scalability, availability, performance, security, maintainability and cost; you cannot maximise them all; characteristics drive structure; fitness functions', [])
      ] },
      { id: 'arch-styles', title: 'Architectural Styles', emoji: '🗺️', tagline: 'Monolith, layered, client–server, peer-to-peer, event-driven.', lessons: [
        L('as-overview', 'Styles vs Patterns: The Big Map', 7, 'A field guide to the vocabulary.', 'architectural style vs architectural pattern vs design pattern; the structural, distributed and messaging families; there is no best style', ['sd:architectural-styles', 'sa:architecture']),
        L('as-monolith', 'Monolithic Architecture', 8, 'One deployable thing — and why that is often fine.', 'one deployable unit; why monoliths are underrated; the big ball of mud; the modular monolith; when it starts to hurt', ['sd:monolithic', 'be:monolith', 'sd:structural']),
        L('as-layered', 'Layered (N-Tier) Architecture', 8, 'The default shape of most business software.', 'presentation, business, persistence and database layers; closed vs open layers; three-tier deployments; the sinkhole anti-pattern', ['sd:layered', 'sa:layered']),
        L('as-component-based', 'Component-Based Architecture', 7, 'Systems built from replaceable parts.', 'replaceable parts with clear interfaces; components vs classes vs services; reuse and its limits; examples in user interfaces and backends', ['sd:component-based']),
        L('as-client-server', 'Client–Server', 7, 'Those who ask, and those who answer.', 'requesters and providers; thin vs thick clients; two-tier, three-tier and n-tier; the model behind the web', ['sd:client-server', 'sa:client--server', 'sd:distributed']),
        L('as-p2p', 'Peer-to-Peer', 7, 'Everyone is both customer and shop.', 'every node is both client and server; no central point; discovery and distributed hash tables; BitTorrent, blockchains and WebRTC; the trade-offs', ['sd:peer-to-peer']),
        L('as-event-driven', 'Event-Driven Architecture', 9, 'Parts that react to news instead of taking orders.', 'components react to events instead of calling each other; events vs commands; brokers and mediators; choreography vs orchestration; debugging a flow you cannot see', ['sd:event-driven', 'sd:messaging']),
        L('as-pubsub', 'Publish–Subscribe', 7, 'Broadcast without knowing who is listening.', 'publishers do not know their subscribers; topics and fan-out; adding features without touching the publisher; delivery and ordering concerns', ['sd:publish-subscribe']),
        L('as-distributed', 'Distributed Systems & the Eight Fallacies', 9, 'Eight comfortable lies about networks.', 'what makes a system distributed; the eight fallacies; partial failure; time and ordering; why you avoid distribution until you need it', ['sa:distributed-systems'])
      ] },
      { id: 'arch-patterns-systems', title: 'Architectural Patterns I: Shapes of Systems', emoji: '🏙️', tagline: 'MVC, hexagonal, microservices, serverless and more.', lessons: [
        L('apx-mvc', 'MVC, MVP & MVVM', 9, 'Three ways to keep data, display and decisions apart.', 'separating data, display and control; Model–View–Controller; Model–View–Presenter; MVVM and data binding; where each one is used', ['sd:model-view-controller', 'sa:mvc-mvp-mvvm', 'sd:architectural-patterns', 'be:architectural-patterns']),
        L('apx-hexagonal', 'Hexagonal, Onion & Clean Architecture', 9, 'Business rules in the middle; everything else plugs in.', 'the domain at the centre; ports and adapters; the dependency rule; swapping databases and UIs; the cost of ceremony', ['sd:architectural-patterns']),
        L('apx-microkernel', 'Microkernel (Plug-in) Architecture', 7, 'A tiny core and a shelf of plug-ins.', 'a small core plus plug-ins; extension points and registries; examples: IDEs and browsers; the trade-offs', ['sd:microkernel']),
        L('apx-blackboard', 'The Blackboard Pattern', 7, 'Specialists solving a puzzle on a shared whiteboard.', 'specialists cooperating through shared knowledge; knowledge sources and the controller; where it is used; echoes in modern AI agent systems', ['sd:blackboard-pattern']),
        L('apx-soa', 'Service-Oriented Architecture', 8, 'The enterprise idea that came before microservices.', 'business capabilities as shared services; contracts and the service bus; SOA vs microservices; lessons learned', ['sd:soa', 'be:soa', 'sa:service-oriented']),
        L('apx-microservices', 'Microservices', 10, 'Many small services, each owned by a small team.', 'small services owned by small teams; independent deployment; a database per service; synchronous vs asynchronous communication; what you gain and what you pay', ['sd:microservices', 'be:microservices', 'sa:microservices']),
        L('apx-microservices-hard', 'Microservices: The Hard Parts', 10, 'Everything the conference talks skip.', 'service discovery and API gateways; distributed data and consistency; cascading failures; the distributed monolith; when not to use microservices', ['be:microservices'], 'microservices-cascade'),
        L('apx-serverless', 'Serverless', 9, 'There are servers. They are just not your problem.', 'functions as a service; paying per invocation; cold starts and limits; event triggers; backend-as-a-service and when serverless fits', ['sd:serverless-architecture', 'be:serverless', 'sa:serverless', 'sa:serverless-concepts']),
        L('apx-service-mesh', 'Service Mesh', 8, 'Moving the networking chores out of your code.', 'moving networking concerns out of the code; sidecar proxies; data plane and control plane; mutual TLS, retries and traffic shifting for free; is it worth the complexity?', ['be:service-mesh', 'sa:service-mesh']),
        L('apx-twelve-factor', 'The Twelve-Factor App', 9, 'Twelve habits of apps that behave well in the cloud.', 'the twelve factors in plain English; config in the environment; stateless, disposable processes; dev/prod parity; logs as streams', ['be:twelve-factor-apps'])
      ] },
      { id: 'arch-patterns-domain', title: 'Architectural Patterns II: Data & Domain', emoji: '🧠', tagline: 'DDD, CQRS, event sourcing and actors.', lessons: [
        L('ddd-strategic', 'Domain-Driven Design I: Strategic', 10, 'Carving a big messy business into pieces that make sense.', 'tackling complexity at the heart of the business; ubiquitous language; subdomains (core, supporting, generic); bounded contexts; context maps', ['sd:domain-driven-design', 'sa:ddd']),
        L('ddd-tactical', 'Domain-Driven Design II: Tactical', 10, 'The building blocks inside one bounded context.', 'entities and value objects; aggregates and their roots; repositories and domain services; domain events; keeping aggregates small', ['sd:domain-driven-design', 'sa:ddd']),
        L('apx-cqrs', 'CQRS', 9, 'One model for changing things, another for reading them.', 'separate models for writing and reading; why reads and writes differ; projections and read models; eventual consistency; when CQRS is overkill', ['sd:cqrs', 'sa:cqrs-eventual-consistency'], 'event-sourcing-lab'),
        L('apx-event-sourcing', 'Event Sourcing', 10, 'Keep every change, like a bank statement — not just the balance.', 'store what happened, not just the current state; rebuilding state by replaying events; snapshots; audit and time travel; the costs: versioning and complexity', ['sd:event-sourcing'], 'event-sourcing-lab'),
        L('apx-queues-streams', 'Message Queues & Streams as Architecture', 8, 'When the queue becomes the backbone.', 'queues and streams as the backbone of a system; event notification vs event-carried state transfer; the log as source of truth; choreography vs orchestration revisited', ['sd:message-queues--streams']),
        L('apx-actors', 'The Actor Model', 8, 'Tiny independent workers that only talk by mail.', 'actors: private state plus a mailbox; no shared memory; supervision and “let it crash”; Erlang, Akka and Orleans; when actors fit', ['sa:actors']),
        L('apx-choosing', 'Choosing an Architecture', 10, 'Start simple. Earn your complexity.', 'start from requirements and team size; monolith first; matching styles to quality attributes; evolutionary architecture; a decision walkthrough', ['sd:architectural-patterns'])
      ] },
      { id: 'enterprise-patterns', title: 'Enterprise Patterns', emoji: '🏢', tagline: 'DTOs, repositories, entities, value objects and use cases.', lessons: [
        L('ep-transaction-script', 'Enterprise Patterns & Transaction Script', 8, 'The simplest way to organise business logic.', 'Fowler’s catalogue of enterprise application patterns; ways to organise business logic; transaction script: one procedure per request; when that is perfectly fine', ['sd:enterprise-patterns', 'sd:transaction-script']),
        L('ep-domain-model', 'The Domain Model Pattern', 8, 'Business logic that lives inside business objects.', 'an object model of the business that has behaviour; domain model vs transaction script vs table module; the cost of richness', ['sd:domain-models']),
        L('ep-entities-value-objects', 'Entities & Value Objects', 9, 'Things with identity, and things that are just their value.', 'identity vs value; equality rules; immutable value objects; money, dates and addresses; primitive obsession', ['sd:entities', 'sd:value-objects']),
        L('ep-repositories', 'Repositories', 8, 'Pretend the database is just a collection in memory.', 'a collection-like interface to stored objects; hiding the query language; repository vs DAO; one repository per aggregate; testing with in-memory repositories', ['sd:repositories']),
        L('ep-mappers-orms', 'Data Mappers & ORMs', 9, 'The translators between your objects and your rows.', 'moving data between objects and rows; data mapper vs active record; unit of work; lazy loading; what ORMs automate', ['sd:mappers', 'sd:orms']),
        L('ep-identity-map', 'Identity Maps', 7, 'Never load the same row twice.', 'one object per database row per session; avoiding duplicate loads and conflicting copies; the ORM session as a first-level cache', ['sd:identity-maps']),
        L('ep-dtos', 'DTOs', 8, 'Plain parcels for carrying data across a boundary.', 'plain objects that carry data across boundaries; why not expose your entities; mapping and its tedium; DTO vs value object vs entity', ['sd:dtos']),
        L('ep-use-cases', 'Use Cases', 8, 'One class per thing a user wants to get done.', 'one class per thing the user wants to do; application services and interactors; orchestration without business rules; input and output boundaries', ['sd:usecases']),
        L('ep-commands-queries', 'Commands & Queries', 8, 'Requests as objects you can validate, log and route.', 'requests as objects: commands change, queries read; handlers and buses; hooks for validation and authorization; the bridge to CQRS', ['sd:commands--queries'])
      ] }
    ]
  });
})();
