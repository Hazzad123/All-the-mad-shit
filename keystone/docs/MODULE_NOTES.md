# Module notes for writers

Extra guidance per module, on top of `docs/WRITER_BRIEF.md`. Find your module ids below.

## patterns-creational-structural, patterns-behavioral
Code-centric (model on lesson `dp-srp`). JavaScript examples, TypeScript-style `interface` (`lang: 'ts'`) where a contract matters; business-flavoured (payments, notifications, orders, documents). For every pattern: the problem it solves, a metaphor, a short before/after code card with tappable notes, when NOT to use it. Activities: "which pattern fits?" scenarios and mcqs, `spot`, `ab`, `match` (pattern ↔ intent), `bucket` (creational/structural/behavioural). Accurate GoF definitions. Singleton: be honest that many consider it an anti-pattern for testability. `posa-patterns`: Layers, Pipes and Filters, Broker, MVC, Reactor/Proactor at overview level. `patterns-picker`: decision practice across all 23 GoF patterns. Lab: `patterns-picker` → `pattern-toys`.

## testing
Jest-like JavaScript tests, Arrange–Act–Assert, test doubles (stub, mock, fake, spy) defined precisely, the testing pyramid (some teams prefer a "trophy"), TDD red–green–refactor, BDD Given/When/Then, coverage is not quality. Use `spot` (bad test), `ab`, `order`, `bucket` (unit/integration/e2e).

## nosql
Fair and durable, no benchmark numbers. Data models as JSON. Document stores (embedding vs referencing), key-value (Redis structures; DynamoDB partition/sort keys, design from access patterns), wide-column (Cassandra/ScyllaDB partition keys), columnar analytics (ClickHouse), graph (Neo4j Cypher briefly; Neptune, Dgraph), time series (InfluxDB; TimescaleDB as a Postgres extension), realtime (Firebase/Firestore, RethinkDB changefeeds), search (inverted index, analysis, relevance; Elasticsearch, Solr; search is a secondary store, not the source of truth). BASE vs ACID. `db-choosing`: start from access patterns; Postgres is a sensible default. `scenario` activities for choosing a database.

## scaling-data
The hardest ideas in the curriculum: use `sequence` and `diagram` cards heavily, and `scenario` activities. Leader/follower replication; sync vs async; lag and stale reads (read-your-writes); failover, split brain; multi-leader, leaderless. Sharding: range, hash, directory; shard key choice; hot spots; consistent hashing. CAP: the choice between C and A exists only during a Partition; CP vs AP examples; PACELC; it is not "pick 2 of 3". Quorums R + W > N; last-write-wins, vector clocks, CRDTs (conceptual). 2PC and its blocking problem, sagas with compensating actions, idempotency keys, the transactional outbox. Labs: sd-replication→replication-lab, sd-sharding→sharding-ring, sd-cap→cap-lab, sd-consistency→quorum-lab, sd-distributed-tx→saga-lab.

## big-data
OLTP vs OLAP; row vs column storage; warehouses (star schema: facts and dimensions), lakes, lakehouses (Snowflake, BigQuery, Redshift named only); ETL vs ELT; MapReduce (map, shuffle, reduce; move code to data; HDFS) and Hadoop's place today; Spark (in-memory, DataFrames, lazy evaluation, DAG); stream processing (windows, watermarks; Kafka Streams, Flink; lambda vs kappa). Lab: bd-mapreduce-hadoop→mapreduce.

## api-design
The learner finished "HTTP & HTTPS" (methods, status codes, idempotency, headers): build on it. Use `http` and `json` code cards with notes; `spot` (bad endpoint), `ab` (better API design), `scenario` (designing a shop API). REST constraints in plain English; resource naming; pagination (offset vs cursor), filtering, sorting; versioning; consistent error format; Richardson maturity model; JSON traps (big numbers, ISO 8601 dates); OpenAPI design-first vs code-first; HATEOAS; idempotency keys, timeouts, retries, 429 + Retry-After; backwards compatibility; integration patterns (request/reply, webhooks, polling, file transfer, shared-database anti-pattern, messaging, API gateway, BFF). Lab: api-rest → http-playground.

## api-styles
SOAP/WSDL/WS-*; gRPC with a Protocol Buffers example (`lang: 'proto'`), HTTP/2 streaming modes, browser limits (gRPC-Web); GraphQL schema/queries/mutations/resolvers (`lang: 'graphql'`), over/under-fetching, N+1 and DataLoader, Apollo/Relay; ESB, smart pipes vs smart endpoints, BPM/BPEL; a decision lesson comparing styles. Lab: api-graphql → graphql-explorer.

## realtime
`sequence` cards for client/server timelines; `scenario` ("which technique for live scores / chat / a progress bar?"). Short polling, long polling, Server-Sent Events (EventSource, auto-reconnect, Last-Event-ID, one-way), WebSockets (Upgrade handshake, full-duplex frames, ping/pong, scaling stateful connections, a pub/sub backplane), webhooks for server-to-server. Lab: rt-websockets → realtime-lab.

## messaging
Why queues (decoupling in time, load levelling, retries); point-to-point with competing consumers vs pub/sub fan-out vs replayable streams; consumer groups; at-most-once / at-least-once / "exactly-once" (effectively-once via idempotent consumers); acks, redelivery, ordering limits, dead-letter queues, poison messages. RabbitMQ: exchanges (direct, topic, fanout, headers), queues, bindings, routing keys, prefetch. Kafka: topics, partitions, offsets, ordering within a partition only, consumer groups and rebalancing, retention, log compaction. Kafka vs RabbitMQ honestly. Lab: mq-why → queue-lab.

## caching
Hits/misses/hit rate/TTL; the "two hard things" quip (Phil Karlton); HTTP caching (no-store vs no-cache vs max-age, private/public, ETag + If-None-Match → 304, fingerprinted filenames); CDNs (edge, origin, purge, shielding); Redis vs Memcached; cache-aside, read-through, write-through, write-behind, refresh-ahead (a `sequence` card each); eviction LRU/LFU/TTL; stampede (locking, single-flight, jittered TTLs), hot keys, negative caching. Labs: ca-why & ca-invalidation→cache-sim, ca-http→http-cache-lab, ca-cdn→cdn-lab.

## servers-scaling
Web server vs application server; Nginx (event-driven), Apache (modules), Caddy (automatic HTTPS), IIS — no benchmarks; vertical vs horizontal; load-balancing algorithms, health checks, L4 vs L7, sticky sessions; stateless services; back-of-the-envelope capacity with the arithmetic shown (a day ≈ 86,400 s ≈ 10^5 s); autoscaling; latency numbers (approximate, labelled rough), p50/p95/p99, Amdahl's law. Use `estimate` activities generously. Labs: sv-load-balancing→load-balancer, sv-capacity→estimation-lab, sv-latency→latency-lab.

## resilience
`scenario` activities with meters (uptime, customer trust, cost), `sequence` cards, small JavaScript (retry with exponential backoff and jitter; a token bucket). Failure is normal; SPOFs, redundancy; availability nines with correct arithmetic (99.9% ≈ 8.8 h/yr, 99.99% ≈ 53 min/yr); blast radius; timeouts always; safe retries, retry storms; circuit breaker closed/open/half-open; rate-limit algorithms, 429 + Retry-After; backpressure; load shifting and shedding; graceful degradation, fallbacks, feature flags, bulkheads; strangler fig, blue/green, canary, dual writes, expand/contract. Labs: rs-circuit-breaker→circuit-breaker, rs-throttling→rate-limiter, rs-backpressure→queue-lab, rs-migration→deploy-strategies.

## observability
Monitoring vs observability; structured logs, levels, correlation IDs, never log secrets or personal data; counters, gauges, histograms; RED and USE; percentiles not averages; cardinality; traces, spans, context propagation, sampling; OpenTelemetry; SLI/SLO/SLA, error budgets, alert on symptoms, on-call, runbooks, blameless postmortems. Lab: ob-traces→tracing-lab.

## arch-principles
Architecture = decisions that are hard to change; quality attributes and trade-offs; coupling and cohesion; Robert C. Martin's component principles — REP, CCP, CRP (the tension triangle), ADP (no cycles; break with dependency inversion), SDP, SAP, the main sequence explained simply; policy vs detail; boundaries, the dependency rule, plug-in architecture, anti-corruption layer; fitness functions. `diagram` cards for dependency graphs. Lab: ap-coupling-cohesion→coupling-graph.

## arch-styles
Style vs pattern vs design pattern; monolith (modular monolith, big ball of mud); layered/n-tier (closed vs open layers, sinkhole anti-pattern); component-based; client–server; peer-to-peer (DHTs, BitTorrent, WebRTC); event-driven (events vs commands, broker vs mediator, choreography vs orchestration); publish–subscribe; distributed systems and the eight fallacies (list them correctly). `scenario` activities choosing a style for a described product.

## arch-patterns-systems
MVC / MVP / MVVM (differences precisely); hexagonal (ports and adapters), onion, clean architecture (dependency rule); microkernel; blackboard; SOA vs microservices; microservices (independent deployment, database per service, sync vs async, Conway's law) and the hard parts (discovery, API gateway, distributed data, cascading failures, distributed monolith, "monolith first"); serverless (FaaS, cold starts, limits, BaaS); service mesh (sidecars, data vs control plane, mTLS; Istio/Linkerd named); the Twelve-Factor App (all twelve, correctly). Lab: apx-microservices-hard→microservices-cascade.

## arch-patterns-domain
DDD strategic (ubiquitous language, core/supporting/generic subdomains, bounded contexts, context maps incl. anti-corruption layer) and tactical (entities, value objects, aggregates and roots, repositories, domain services, domain events, small aggregates); CQRS (and when it is overkill); event sourcing (replay, snapshots, versioning cost); queues/streams as backbone (event notification vs event-carried state transfer); the actor model (Erlang, Akka, Orleans; supervision); choosing an architecture (start simple, earn complexity). Labs: apx-cqrs & apx-event-sourcing→event-sourcing-lab.

## enterprise-patterns
From Fowler's Patterns of Enterprise Application Architecture and DDD: transaction script, domain model, table module; entities vs value objects (equality, immutability, money, primitive obsession); repositories (vs DAO, per aggregate, in-memory fakes); data mapper vs active record, unit of work, lazy loading; identity map; DTOs; use cases / interactors; command and query objects with handlers. Code-centric: JavaScript/TypeScript, `spot`, `ab`, `cloze` code.

## containers
VMs vs containers (hypervisor; shared kernel; namespaces and cgroups; LXC); images vs containers, Dockerfile (`lang: 'docker'`) layers and caching, registries, ports/volumes/env, image hygiene; Docker Compose (`lang: 'yaml'`); Kubernetes: desired state and control loops, pods, deployments, services, nodes/control plane, self-healing, ingress, ConfigMaps/Secrets, rolling updates/rollbacks, requests/limits, autoscaling, namespaces, Helm; "do you even need Kubernetes?". Lab: ct-k8s-basics→k8s-lab.

## delivery
CI (small frequent merges, pipeline stages, keep main green; a GitHub Actions-style `yaml` example), continuous delivery vs deployment, environments, rolling/blue-green/canary, feature flags, rollbacks; infrastructure as code (declarative vs imperative; Terraform `lang: 'tf'`, CloudFormation, Ansible; immutable infrastructure; GitOps); cloud providers, IaaS/PaaS/SaaS/FaaS, regions and zones, shared responsibility; cloud design patterns (sidecar, ambassador, gateway aggregation, BFF, retry, circuit breaker, bulkhead, strangler fig, CQRS, competing consumers); operations (config, secrets, backups and DR, cost). Labs: dl-ci→cicd-pipeline, dl-cd→deploy-strategies.

## architect-role
Soft-skills module: practical and story-driven with many `scenario` activities (stakeholder meetings, decision reviews, estimate pushback). What architecture and architects are, levels (application/solution/enterprise), deciding under uncertainty, ADRs (show a short one), last responsible moment, simplifying, staying hands-on, documentation (C4 levels, arc42), communication, consulting/coaching, estimating, build vs buy, balancing technical debt, "marketing" ideas. No invented quotes.

## architect-frameworks
UML (class, sequence, component, deployment; arrow meanings) vs C4; TOGAF (ADM at overview level; business/data/application/technology); BABOK and IAF briefly and accurately (omit detail you are unsure of); the Agile Manifesto's four values; Scrum roles/events/artefacts; Kanban (WIP limits, lead vs cycle time); XP practices; LeSS and SAFe (fair, with criticisms); PMBOK, PRINCE2, RUP, ITIL at overview level; tools (Git, Slack, Trello, Jira/Confluence). Lab: af-kanban-xp→kanban-sim.

## web-mobile
SPA vs SSR vs SSG (hydration, SEO), React/Vue/Angular (fair, no popularity claims), UI as a function of state, one-way data flow, signals, client vs server state; microfrontends (composition, trade-offs); native vs cross-platform vs hybrid, PWAs and service workers, offline-first, BFF, API versioning for old app versions; W3C vs WHATWG, living standards, progressive enhancement, accessibility.

## enterprise-software
ERP, CRM, DMS, BPM explained through a fictional company; SAP (modules at a high level, HANA in-memory database, BusinessObjects reporting), Salesforce as a platform, Microsoft Dynamics 365, IBM BPM, Documentum; configuring vs customising; integration (point-to-point spaghetti, iPaaS, anti-corruption layers, master data, lock-in). Vendor facts general and durable; no market-share numbers.

## ai-foundations
How LLMs work (next-token prediction, tokens, context windows, training vs inference, temperature, hallucinations, knowledge cut-offs) without hype; deterministic code vs probabilistic models; prompting (clear context, few-shot, step-by-step reasoning, system prompts, iteration); coding tools Claude Code, Cursor, GitHub Copilot, Google Antigravity described only generically (do not invent features); providers OpenAI, Anthropic, Google Gemini, open-weight models (no version numbers or prices); AI for code review, refactoring, docs, tests — always verified. The developer stays responsible.

## ai-building
Provider-neutral; generic JavaScript pseudo-SDK code and JSON. Structured outputs (schemas, validate and retry); tool use loop (model requests a tool, your code runs it, the result goes back), permissions; streaming over SSE (time to first token, partial output, cancellation); embeddings and vector databases (cosine similarity, chunking, approximate nearest-neighbour indexes conceptually); RAG (retrieve–augment–generate, citations, RAG vs fine-tuning); agents (plan/act/observe loop, memory, guardrails, failure modes); MCP (hosts, clients, servers exposing tools/resources/prompts; trust and least privilege) and skills (packaged instructions an agent loads on demand). A `sequence` card per loop.

## system-design
The five-step framework; back-of-the-envelope estimation with full arithmetic and `estimate` activities; the building blocks (load balancer, app servers, database, cache, queue, CDN, object storage, search) each with "the signal you need one"; the scaling story from one box to multiple regions as a growing series of `diagram` cards. Labs: sdm-estimation→estimation-lab, sdm-evolution→startup-survival.

## capstones
The finale. Each lesson designs one real system using the method (requirements → estimates → API/data model → high-level design → trade-offs). Per lesson: short scene-setting cards; a `diagram` that grows (v1, then improved); a `compare` card of trade-offs; 2–3 `scenario` activities with meters (latency, cost, reliability, user trust) where the learner makes the key calls; plus `estimate`, `order`, `bucket`. Refer to earlier concepts by name. URL shortener (base62 keys, collisions, 301 vs 302, cache, abuse); chat (WebSockets, per-conversation ordering, presence, offline push, groups); news feed (fan-out on write vs read, celebrity problem, ranking, cursor pagination); checkout (inventory reservation, payment idempotency, order saga); video (object storage, transcoding queue, adaptive bitrate, CDN); ride-hailing (location updates, geohash/quadtree, matching, tracking, surge); multi-tenant SaaS auth (tenants, OIDC/SAML SSO, RBAC per tenant, isolation, API keys/service accounts, audit logs); incident (triage "what changed?", dashboards/logs/traces, mitigate first, communication, blameless postmortem). The boss mixes all eight.
