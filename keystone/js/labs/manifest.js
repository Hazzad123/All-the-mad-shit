/* Keystone — lab manifest. One file per lab in this folder: js/labs/<id>.js, loaded lazily in this (gallery) order.
   To add a lab: create the file (see docs/LAB_GUIDE.md) and add its id here. Missing files are skipped. */
KS.labFiles = [
  // The Internet
  'url-journey', 'dns-resolver', 'http-playground', 'encapsulation', 'firewall-rules',
  // The Machine Room
  'race-condition', 'git-graph',
  // Code Craft
  'pattern-toys', 'coupling-graph',
  // Data
  'sql-sandbox', 'normalizer', 'transaction-lab', 'index-lab', 'nplus1', 'replication-lab', 'sharding-ring', 'cap-lab', 'quorum-lab', 'saga-lab', 'mapreduce',
  // APIs & Messaging
  'graphql-explorer', 'realtime-lab', 'queue-lab',
  // Security & Identity
  'hash-lab', 'pki-chain', 'session-vs-token', 'jwt-lab', 'oauth-flow', 'totp-lab', 'rbac-lab', 'injection-lab', 'cors-lab',
  // Performance & Scale
  'cache-sim', 'http-cache-lab', 'cdn-lab', 'load-balancer', 'estimation-lab', 'latency-lab', 'circuit-breaker', 'rate-limiter', 'deploy-strategies', 'tracing-lab',
  // Architecture
  'microservices-cascade', 'event-sourcing-lab',
  // Ship It + The Architect
  'k8s-lab', 'cicd-pipeline', 'kanban-sim',
  // System Design Studio
  'startup-survival'
];
