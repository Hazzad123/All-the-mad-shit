# Keystone lab specs

One section per lab. Read `docs/LAB_GUIDE.md` first. Each spec gives the insight, what the learner can do, the rules of the simulation, and the goals (use these goal ids; you may refine the wording). You have freedom over layout and extra touches as long as the insight lands and it works on a phone.

Numbers in simulations should be realistic but clearly approximate. Every lab needs a `help` text and a log (or equivalent) that narrates what happens in plain English.

---

## The Internet

### `url-journey` 🧭 What Happens When You Press Enter
**Insight:** loading a page is a chain of steps, each with a cost, and several can be skipped the second time.
A URL input (default `https://shop.example.com/products`) and a pipeline of stages the learner steps or plays through: parse URL → DNS lookup → TCP handshake → TLS handshake → HTTP request → server works → HTTP response → parse HTML → fetch CSS/JS/images → render. Each stage shows what happens in plain words, the actual data (parsed URL parts; the IP address returned; SYN / SYN-ACK / ACK; the certificate; the raw request and response text) and its time cost on an accumulating timeline. Toggles: "DNS already cached", "connection kept alive", "plain http". Show total time and what was saved.
**Goals:** `full` step through every stage of an https visit · `repeat` do a second visit with cached DNS and a kept-alive connection and see the total drop · `plain` switch to http and spot which step disappears.

### `dns-resolver` 📒 DNS Resolver
**Insight:** resolving a name is a chain of referrals, and caching is why it is usually instant.
Stage: Your laptop → Resolver → Root server → TLD server → Authoritative server. Pick a name from a small list (`example.com`, `www.example.com` as a CNAME, `shop.example.org`, an MX lookup). "Resolve" flies packets along the chain with log lines ("Root: I don't know, but the .com servers do"). Show the resolver's cache as a table with TTLs counting down; buttons to advance the clock ("wait 30 s"). Record-type selector (A, AAAA, CNAME, MX).
**Goals:** `cold` resolve a name the long way · `hit` resolve it again and get an answer from cache with no upstream queries · `expire` let the TTL run out and watch it re-query · `cname` resolve a CNAME and see the extra hop.

### `http-playground` 📨 HTTP Playground
**Insight:** methods and status codes are a conversation with rules.
A request builder (method, path, optional JSON body) with preset buttons, a "Send" button, the raw request text, the raw response (status line, headers, body), and a live view of the server's data (a to-do list). In-memory API: `GET /todos` 200; `GET /todos/:id` 200 or 404; `POST /todos` 201 + `Location` (400 for bad JSON or a missing title); `PUT /todos/:id` replaces (missing fields are wiped — show it); `PATCH /todos/:id` merges; `DELETE /todos/:id` 204 then 404; unknown path 404; wrong method 405 with an `Allow` header; `HEAD` and `OPTIONS` work.
**Goals:** `ok` get a 200 · `create` create a to-do and get 201 · `notfound` cause a 404 · `bad` cause a 400 · `idem` delete the same to-do twice and compare the two answers · `notallowed` get a 405.

### `encapsulation` 📦 Packet Wrapping
**Insight:** each layer wraps the data in its own envelope; routers only open the outer one.
Sender and receiver stacks (Application, Transport, Network, Link). A message to send. "Wrap" steps add headers one layer at a time, drawn as nested coloured boxes with the real fields (ports, sequence number; source/destination IP; source/destination MAC). The frame crosses a router: the link header is replaced (MACs change) while the IP header stays. Then "Unwrap" steps at the receiver. TCP/UDP toggle changes the transport header.
**Goals:** `wrap` wrap a message through all four layers · `hop` send it through the router and notice which header changed · `unwrap` unwrap it at the receiver · `udp` send the same message over UDP and compare the header.

### `firewall-rules` 🧱 Firewall Rules
**Insight:** rules are checked top to bottom, the first match wins, and the safe default is deny.
An ordered rule list (action allow/deny; source: anyone / the office / the app server; port 22, 80, 443, 5432 or any) with add, delete, move up/down, and a default-policy switch. A set of test packets with an expected outcome each (visitor → 443 should pass; attacker → 22 should be blocked; office admin → 22 should pass; app server → 5432 should pass; stranger → 5432 should be blocked…). "Fire" shows, for each packet, which rule matched and whether the result is what was wanted. Include a preset with a rule-order bug.
**Goals:** `web` let public web traffic in while blocking the rest · `ssh` allow SSH only from the office · `order` fix the preset where a broad rule shadows a specific one · `all` get every test packet right with default deny.

---

## The Machine Room

### `race-condition` 🏁 Race Condition
**Insight:** "read, add one, write" is three steps, and two threads can interleave them.
A shared counter and two threads, each shown as its three steps with its own private copy of the value. Manual mode: step either thread to choose the interleaving. Auto mode: each thread does 100 increments with random interleaving and the final value is shown against the expected 200. A "use a lock" toggle makes a thread wait while the other holds the lock. A second tab shows deadlock: two threads, two locks, acquired in opposite orders, steppable; a "same order" fix.
**Goals:** `lost` interleave by hand so two increments leave the counter at 1 · `auto` run 100 + 100 without a lock and lose updates · `lock` turn the lock on and get exactly 200 · `deadlock` create a deadlock, then fix it with consistent lock ordering.

### `git-graph` 🌳 Git Graph
**Insight:** history is a graph of commits; a branch is just a movable label.
An SVG commit graph (circles, parent lines, branch labels, a HEAD marker) driven by buttons and a small command box that understands `git commit`, `git branch <name>`, `git switch <name>` (and `checkout`), `git merge <name>`, `git rebase <name>`. Explain each command's effect in a log. Fast-forward merges move the label; diverged merges create a commit with two parents; rebase re-creates commits on top of the target.
**Goals:** `commit` make two commits · `branch` create a branch and commit on it · `ff` do a fast-forward merge · `merge` create a merge commit with two parents · `rebase` rebase a branch to get a straight line.

---

## Code Craft

### `pattern-toys` 🧸 Pattern Playground
**Insight:** each pattern is a small trick you can feel working.
Tabs, one toy each, showing the handful of lines of code that matter next to a live widget. **Strategy:** a delivery-cost calculator where the strategy (standard, express, free-over-£50) is swapped at run time. **Observer:** a product price with subscribers you add and remove (email alert, dashboard, audit log); changing the price notifies each. **Decorator:** a coffee with wrappers (milk, syrup, cream) stacked in any order; price and description compose through the chain. **State:** an order (new → paid → shipped → delivered, plus cancel) where invalid moves are refused by the current state. **Command:** a small editor whose actions are objects on an undo/redo stack.
**Goals:** `strategy` get three different prices for the same basket · `observer` notify two subscribers, unsubscribe one, notify again · `decorator` stack three decorators · `state` reach "delivered" and get an illegal move refused · `command` do three actions and undo them all.

### `coupling-graph` 🕸️ Coupling Graph
**Insight:** a change spreads to everything that depends on it; an interface cuts the path.
A graph of about seven modules (OrderService, PaymentService, StripeClient, EmailSender, InvoicePdf, ReportJob, Database) with "depends on" arrows. Click a module to change it: every module that depends on it, directly or transitively, lights up, with a count of what must be re-tested. Toggles insert an interface on chosen edges (for example `PaymentGateway` between PaymentService and StripeClient), which reverses the arrow and shrinks the blast radius. One toggle introduces a dependency cycle so that everything lights up.
**Goals:** `blast` change a module that at least five others depend on · `invert` insert an interface so changing StripeClient affects at most one module · `cycle` create a cycle, see the damage, and break it · `calm` reach a design where no single change touches more than three modules.

---

## Data

### `sql-sandbox` 🧮 SQL Sandbox
**Insight:** SQL is a question you ask a table; you get good by asking lots.
A real (small) SQL engine written for this lab, over a shop database with about eight rows per table: `customers(id, name, email, city)`, `products(id, name, price, category)`, `orders(id, customer_id, created_at, status)`, `order_items(order_id, product_id, quantity)`. Include a customer with no orders and a product never ordered. Must support: `SELECT [DISTINCT]` columns, `*`, `table.column`, aliases with `AS`; `COUNT(*)`, `COUNT(col)`, `SUM`, `AVG`, `MIN`, `MAX`; `FROM t [alias]`; `[INNER] JOIN` and `LEFT JOIN … ON a = b` (several joins); `WHERE` with `= <> != < > <= >=`, `LIKE` (`%`, `_`), `IN (…)`, `IS NULL`, `IS NOT NULL`, `AND`, `OR`, `NOT`, parentheses; `GROUP BY`; `HAVING`; `ORDER BY … ASC|DESC` (several keys, aliases allowed); `LIMIT`. Case-insensitive keywords; friendly error messages that say what was expected. UI: schema browser (tap a table to preview it), editor (Ctrl+Enter runs), result table with row count, and eight graded challenges checked by comparing result rows (not SQL text), from "customers in Leeds" up to "customers who have never ordered" and "revenue per category". A "show a hint" link per challenge.
**Goals:** `run` run any query · `three` solve three challenges · `join` solve a JOIN challenge · `group` solve a GROUP BY challenge.

### `normalizer` 🧹 Normalizer
**Insight:** storing a fact twice means it can disagree with itself.
A single wide `orders` table (order id, customer name, email, city, product, price, quantity) with repeated customer and product facts. Let the learner: edit a customer's email in one row (other rows now disagree — highlight it), delete a customer's only order (the customer vanishes), and try to add a product nobody has ordered (impossible). Then "Normalise" in steps into customers, products, orders and order_items with keys shown, and repeat the same edits: now each fact lives in one place. Show a joined view that rebuilds the original.
**Goals:** `update` cause an update anomaly · `delete` cause a delete anomaly · `split` normalise into separate tables · `once` change the email once and see every order pick it up.

### `transaction-lab` 🏦 Transaction Lab
**Insight:** without isolation, two correct transactions can produce a wrong result; without atomicity a crash loses money.
Two transactions over accounts A, B, C, stepped by hand (BEGIN, READ, WRITE, COMMIT, ROLLBACK), each with its own view of the data beside the committed database. Isolation selector: read uncommitted, read committed, serializable (locking: the second writer waits). A crash button mid-transfer shows the rollback. Presets set up "lost update" and "dirty read". Show total money as a conserved quantity that goes red when it is wrong.
**Goals:** `transfer` commit a transfer and conserve the total · `atomic` crash halfway through and see everything rolled back · `lost` produce a lost update · `fix` prevent it with serializable isolation · `dirty` cause a dirty read under read uncommitted.

### `index-lab` 🔎 Index Lab
**Insight:** without an index the database reads every row; with one it takes a handful of steps; every index taxes writes.
A users table (size slider from 100 to 1,000,000). Look up a user by email two ways and race them: a full scan (count rows read) and an index lookup (show the binary-search / B-tree descent and count comparisons, about log₂ N). A "create index" switch. A lookup on a column with no index still scans. An insert benchmark compares the cost of adding rows with zero, one and three indexes.
**Goals:** `scan` look up a row without an index in a big table · `seek` add the index and find it in under 25 steps · `miss` search an un-indexed column and get a scan anyway · `write` compare insert cost with no indexes and with three.

### `nplus1` 🔁 N+1 Detector
**Insight:** an innocent loop over an ORM can fire one query per row.
A page showing N posts with their authors (N slider, 5–50). Loading strategies: lazy (one query for the posts, then one per post for its author), eager JOIN (one query), batched `IN (…)` (two). A query log lists every SQL statement with its time, plus a total; show the ORM-style code for each strategy.
**Goals:** `lazy` load ten posts lazily and count eleven queries · `join` get it down to one query · `batch` do it in two · `scale` push N to 50 and compare total times.

### `replication-lab` 🪞 Replication Lab
**Insight:** copies lag; reading a copy can show the past; failover can lose the latest write.
Client, a leader and two followers. Writes go to the leader and reach followers after a lag (slider). Read from any node; a stale read is flagged. Sync/async switch (sync waits for followers: slower, never stale). Kill the leader: writes fail until a follower is promoted; with async replication the promoted follower may lack the last write.
**Goals:** `stale` write, then read an old value from a lagging follower · `sync` switch to synchronous and get no stale reads (and slower writes) · `failover` kill the leader and promote a follower · `lostwrite` lose an acknowledged write through an async failover.

### `sharding-ring` 🍩 Sharding Ring
**Insight:** `hash mod N` reshuffles almost everything when N changes; consistent hashing moves only a slice.
Sixty keys and three to six nodes, with a real hash function. Mode 1, `hash mod N`: keys in buckets by node; adding or removing a node flashes every key that moved and reports "moved 47 of 60". Mode 2, consistent hashing: an SVG ring with node and key positions; adding a node moves only the keys in one arc. A virtual-nodes switch evens out the distribution; show keys per node.
**Goals:** `mod` add a node under mod-N and see more than half the keys move · `ring` add a node on the ring and move fewer than 40% · `remove` remove a node and see where its keys go · `vnodes` turn on virtual nodes and improve the balance.

### `cap-lab` ✂️ CAP Lab
**Insight:** when the network splits you must choose: refuse some requests, or accept answers that disagree.
Two nodes (London, Tokyo) holding the same value, each with a client that can read and write. A "cut the network" switch. Mode CP: during the split the side without the majority/leader refuses requests (errors, but no disagreement). Mode AP: both sides accept writes and diverge; on healing, a conflict is detected and resolved by last-write-wins, visibly discarding a write.
**Goals:** `sync` write with a healthy network and see both nodes agree · `cp` split the network in CP mode and get a refused request · `ap` split in AP mode and make the two sides disagree · `heal` heal the network and watch a write get thrown away.

### `quorum-lab` 🗳️ Quorum Lab
**Insight:** if readers and writers must overlap (R + W > N), a read always sees the latest write.
N replicas (3 or 5) each showing its version of a value. Sliders for W (acks needed for a write) and R (replicas asked on a read). A write reaches a random W replicas immediately (the rest stay old until repaired); a read asks a random R and returns the newest it saw, flagging stale results. Show whether R + W > N and highlight the overlapping replica. Kill switches per replica; writes fail when fewer than W are alive. "Run 50 reads" reports the stale count.
**Goals:** `stale` choose R and W so a stale read happens · `strong` choose them so 50 reads give zero stale results · `survive` kill a replica and still read and write · `block` set W = N, kill a replica and see writes refused.

### `saga-lab` 🧾 Saga Lab
**Insight:** you cannot roll back across services, so you undo with compensating actions.
Four services in a row: Order, Payment, Inventory, Shipping. "Place order" runs the steps in turn, with each service's state shown. Failure switches per service. Mode "no saga": a failure halfway leaves the customer charged with no order. Mode "saga": on failure the earlier steps are compensated in reverse (refund, cancel) with red backward arrows. A timeout-and-retry button for Payment shows a double charge unless "idempotency key" is on.
**Goals:** `happy` complete an order end to end · `mess` fail Inventory without a saga and leave money taken · `compensate` fail it with the saga and see the refund · `idem` retry a payment with an idempotency key and charge once.

### `mapreduce` 🗺️ MapReduce
**Insight:** split the work, do the pieces in parallel, group by key, combine.
Word count over a short editable text split into chunks. Steppable phases: split → map (each mapper emits `(word, 1)` chips) → shuffle (pairs grouped by word and routed to reducers by hash) → reduce (sum) → sorted output. Choose 2–4 mappers and 1–3 reducers. Kill a mapper mid-job: its chunk is re-run elsewhere and the result is unchanged.
**Goals:** `run` run a word count to the end · `scale` change the number of mappers and get the same answer · `fault` kill a worker and still get the right answer · `top` find the most common word.

---

## APIs & Messaging

### `graphql-explorer` 🕸 GraphQL Explorer
**Insight:** one request, exactly the fields you ask for — and a new way to make too many database calls.
A schema tree with tick-boxes (`user { name email posts { title comments { text author { name } } } }`), the generated query, and the JSON result from built-in sample data. Beside it, the REST equivalent: the list of requests needed, their count and bytes, and how much of that data would be unused. A resolver-call counter shows the N+1 pattern on nested fields, with a "DataLoader (batching)" switch that collapses it.
**Goals:** `tiny` fetch only a user's name · `nested` fetch posts with comments in one query and see how many REST calls it replaces · `batch` turn on batching and watch resolver database calls drop.

### `realtime-lab` 📡 Real-Time Lab
**Insight:** four ways to get news from a server, with very different costs.
Four lanes on one timeline: short polling (interval slider), long polling, Server-Sent Events, WebSocket. Server events fire at random and from a button. Each lane draws its requests, empty answers, held connections and deliveries. Per-lane stats: requests made, wasted requests, average delay from event to delivery, open connections. A "send from the client" button works in one message only on the WebSocket lane; the others need a separate request.
**Goals:** `compare` run for 20 seconds with at least five events and compare request counts · `delay` raise the polling interval and watch the delay grow · `twoway` send a message from client to server over the WebSocket · `wasted` find the technique that wastes the most requests.

### `queue-lab` 📬 Queue Lab
**Insight:** a queue lets the producer and the consumer run at different speeds — until it fills up.
Producer (rate slider) → queue (messages drawn as chips, depth shown) → one to four consumers (speed slider, add/remove, crash). Ack mode switch: with auto-ack a crash loses the message in flight; with manual ack it is redelivered. A "poison message" always fails: after three attempts it moves to a dead-letter queue. A bounded-queue switch: when full, the producer is pushed back (count blocked sends). Stats: produced, consumed, lost, redelivered, backlog, age of the oldest message.
**Goals:** `backlog` build a backlog of more than 20 · `drain` clear it by adding consumers · `redeliver` crash a consumer with manual acks and lose nothing · `dlq` send a poison message to the dead-letter queue · `pressure` fill a bounded queue and see backpressure.

---

## Security & Identity

### `hash-lab` #️⃣ Hash Lab
**Insight:** a hash is a one-way fingerprint; storing passwords safely needs salt and slowness.
Tab 1, fingerprints: type text and see its real SHA-256 (`crypto.subtle`) live; change one character and see how many of the 256 bits flipped, drawn as a bit grid. Tab 2, passwords: a small user table storing unsalted SHA-256; an attacker's precomputed table of common passwords cracks matching rows instantly. A salt switch gives each user a random salt: identical passwords now have different hashes and the table fails. A work-factor slider (PBKDF2 iterations via `crypto.subtle`, measured for real) shows time per guess and the estimated time for a billion guesses.
**Goals:** `avalanche` change one letter and flip at least 40% of the bits · `crack` crack an unsalted hash with the table · `salt` add salts and watch the attack fail · `slow` raise the work factor until a billion guesses would take years.

### `pki-chain` 📜 Certificate Chain
**Insight:** your browser trusts a site because of a chain of signatures ending at a root it already trusts.
Three certificate cards (root CA in the trust store → intermediate CA → `shop.example.com`) with subject, issuer, validity dates, key and signature. "Check" runs the browser's steps one by one (name matches? in date? each signature verifies? ends at a trusted root?). Use real signatures with `crypto.subtle` (ECDSA P-256) generated when the lab starts. Break switches: expire the leaf, visit a different hostname, remove the intermediate, swap in a self-signed root, tamper with a field. Result: a padlock or the browser's warning with the reason.
**Goals:** `valid` get a padlock · `expired` trigger an expiry warning · `name` trigger a name mismatch · `chain` break the chain by removing the intermediate · `tamper` change a field and see the signature fail.

### `session-vs-token` 🎫 Sessions vs Tokens
**Insight:** sessions live on the server and must be shared; tokens travel with the client and are hard to take back.
A login form, a "get my profile" button and one, then two, servers behind a load balancer. Session mode: the server keeps a session table and sets a cookie; with a second server and no shared store, requests that land there get 401; fix with a shared session store (or sticky sessions, with its drawback noted). Token mode: the server signs a token (real HMAC); both servers verify it with the shared key and no table. Log-out: deleting a session works at once; a token keeps working until it expires (visible countdown) unless a deny-list is switched on.
**Goals:** `login` log in with a session and fetch the profile · `break` add a second server and get a 401 · `share` fix it with a shared session store · `token` switch to tokens and get both servers to accept · `revoke` log out with a token and see it still work until expiry.

### `jwt-lab` 🪙 JWT Lab
**Insight:** anyone can read a JWT; only the key holder can make a valid one.
Left: the encoded token with its three parts colour-coded. Right: editable header and payload JSON, a secret box, and a verification badge. Real base64url and HMAC-SHA256 (`crypto.subtle`). Editing the payload without re-signing gives "signature invalid"; "Sign" re-signs with the current secret; a wrong secret on the verifying side fails. An `exp` claim with a clock and a "fast-forward one hour" button. An "alg: none" demonstration: a naive verifier accepts an unsigned token, a strict one refuses.
**Goals:** `read` decode a token and read its claims without the secret · `tamper` change the role to admin and get "invalid signature" · `sign` re-sign it with the right secret · `expire` let it expire · `none` see why "alg: none" must be rejected.

### `oauth-flow` 🔁 OAuth Flow
**Insight:** the app gets a limited key to your data and never sees your password.
A guided role-play of the authorization-code flow with PKCE between You, the Browser, the PhotoPrint app, the Accounts server and the Photos API, drawn on a stage with packets. At each step show the actual redirect or request (URLs, parameters, headers) and ask the learner to choose the next move from two or three options; wrong choices explain why. Include the consent screen with scopes, the code, a real SHA-256 PKCE challenge, the token exchange, and an API call with a bearer token. Afterwards: an out-of-scope call returns 403, and an expired access token is renewed with a refresh token.
**Goals:** `flow` complete the flow and fetch the photos · `password` identify the only party that sees the password · `scope` try an out-of-scope action and get a 403 · `refresh` renew an expired access token.

### `totp-lab` ⏱️ TOTP Lab
**Insight:** your phone and the server each compute the same six digits from a shared secret and the time.
Real TOTP (RFC 6238, HMAC-SHA1 via `crypto.subtle`, 30-second steps, 6 digits). A phone panel shows the current code and a countdown ring; a server panel verifies a typed code. Show the derivation: time → counter → HMAC → truncate → six digits. A phone-clock skew slider (±120 s) makes codes fail; a "tolerate ±1 step" switch fixes small skew. A replay button resubmits an already-used code and is refused.
**Goals:** `verify` enter a correct code · `rotate` wait for the code to change and see the old one refused · `skew` move the phone clock until codes fail · `window` allow ±1 step and make a slightly skewed phone work.

### `rbac-lab` 🛂 Access Control Lab
**Insight:** authorization is a function of who, what and which thing; the default answer is no.
Tab RBAC: four users with role tick-boxes; an editable roles × permissions grid (`doc:read`, `doc:edit`, `doc:delete`, `invoice:read`, `user:manage`); a tester (user + action → decision with its trace: user → roles → permissions → ALLOW/DENY). Tab ABAC: documents with owner, department and classification; users with department and clearance; context (office hours, on the office network); a few rules to switch on and off ("owners may edit their own documents", "same department may read", "confidential needs clearance 2+", "no deletes outside office hours"); the tester shows which rule decided, or default deny.
**Goals:** `role` let Bob edit documents but not delete them · `deny` hit a default deny · `owner` let owners edit only their own documents and prove Alice cannot edit Bob's · `clearance` block a confidential read for someone with low clearance.

### `injection-lab` 💉 Injection Lab
**Insight:** when input is glued into code, the attacker writes part of your program.
Tab SQL injection: a login form; the SQL string built by concatenation is shown live; a small evaluator runs that exact string against a users table, so `' OR '1'='1` and `admin' --` really work. A "parameterised query" switch treats input as data and the attack fails. Tab XSS: a comment box and a comment list. In vulnerable mode the comment is treated as HTML — **never actually execute it**; detect script tags and event-handler attributes and show a "this script would now run as the visitor" panel listing what it could do (read the cookie, post as the user). Switches: escape output, Content-Security-Policy, HttpOnly cookie, each changing the outcome and saying why.
**Goals:** `bypass` log in as admin without the password · `param` switch to a parameterised query and watch the same input fail · `xss` land a stored XSS · `escape` neutralise it with output escaping · `httponly` stop the cookie theft with HttpOnly.

### `cors-lab` 🚧 CORS Lab
**Insight:** the browser, not the server, enforces the same-origin rule, and the server's headers switch it off selectively.
A page at `https://shop.example` calling `https://api.bank.example`. Request controls: method, content type, a custom `Authorization` header, "send cookies". Server controls: `Access-Control-Allow-Origin` (none, `*`, the shop's origin), allowed methods, allowed headers, `Allow-Credentials`. "Send" shows the exchange as a sequence (a simple request, or a preflight `OPTIONS` first) and the browser's verdict with a realistic console message. Make clear that a blocked simple request still reached the server. A same-origin switch shows that none of this applies.
**Goals:** `blocked` get blocked for a missing Allow-Origin header · `allow` fix it by allowing the shop's origin · `preflight` trigger a preflight and make it pass · `creds` try `*` with cookies and see it refused.

---

## Performance & Scale

### `cache-sim` ⚡ Cache Simulator
**Insight:** a small cache in front of a slow store absorbs most of the load, and then lies to you.
App → cache → database on a stage. Requests arrive for keys with a skewed popularity (a few hot keys). Controls: cache size, TTL, eviction policy (LRU, LFU, FIFO), request rate. Show cache contents (key, age, hits), hit rate, average latency (hit ≈ 2 ms, miss ≈ 50 ms) and database load. "Change a value in the database" produces stale reads until the TTL, unless "invalidate on write" is on. "Stampede": expire the hottest key under load so many requests miss at once and hammer the database, unless "single-flight" is on.
**Goals:** `hit` reach an 80% hit rate · `stale` serve a stale value after a database change · `invalidate` fix it with invalidate-on-write · `stampede` trigger a stampede, then tame it.

### `http-cache-lab` 🧊 HTTP Cache Lab
**Insight:** two headers decide whether a request is skipped, revalidated or repeated.
A browser cache and a server for one file. Response header controls: `Cache-Control` (`no-store`, `no-cache`, `max-age=N`), ETag on/off. A clock with fast-forward buttons, a "change the file on the server" button, and a "request" button. Each request ends as one of: served from cache with no network, 304 Not Modified, or 200 with a full download; count bytes transferred. A fingerprinted-filename mode (`logo.3f9a.png`, long max-age): changing the file changes the URL, so nothing is ever stale.
**Goals:** `hit` get a response from cache with no network at all · `revalidate` get a 304 · `nostore` use `no-store` and download every time · `stale` change the file inside max-age and get the old copy · `fingerprint` fix that with a fingerprinted filename.

### `cdn-lab` 🌍 CDN Lab
**Insight:** distance is latency; a copy nearby is faster, after the first miss.
A simple map of cities (London, New York, São Paulo, Mumbai, Tokyo, Sydney) with the origin server in one place and switchable edge locations. "Send requests from every city" shows latency per city (distance-based). The first request through an edge is a miss (the edge fetches from the origin); later ones are hits. Purge button. An "origin is down" switch: edges keep serving what they have cached.
**Goals:** `far` measure latency from Sydney with no CDN · `edge` add an edge near Sydney and get a miss, then a hit · `purge` purge and see the miss return · `shield` take the origin down and still serve cached pages.

### `estimation-lab` 🧮 Estimation Lab
**Insight:** you can size a system on the back of an envelope.
A calculator with inputs (daily users, requests per user per day, peak multiplier, response size, share of writes, bytes per write, years kept, requests per second one server handles) and outputs with the working shown line by line (average and peak requests per second, bandwidth, storage per year and in total, servers needed with one spare). Presets: small blog, chat app, photo sharing, video. A rules-of-thumb panel (a day ≈ 10⁵ seconds; a million requests a day ≈ 12 per second). Three "guess first, then reveal" challenges.
**Goals:** `rps` find peak requests per second for the chat preset · `servers` work out the servers needed to survive a 10× spike · `storage` produce a five-year storage figure · `guess` land a challenge within a factor of two.

### `latency-lab` 🐢 Latency Lab
**Insight:** computers work on wildly different time scales, and the slow tail is what users feel.
Part 1: order a handful of famous operations from fastest to slowest (memory access, SSD read, a round trip inside a data centre, a hard-disk seek, a round trip across an ocean…), using clearly approximate figures. Part 2: "human scale" — if a memory access took one second, show how long the others take. Part 3: a page budget — one database query, three cache lookups and one cross-continent API call as a stacked bar; choose what to fix first. Part 4: a thousand simulated requests with a long tail: show average, p50, p95, p99, and how calling ten services makes the tail the norm.
**Goals:** `order` order five operations correctly · `budget` find the dominant cost in the page budget · `tail` produce a run where p99 is over five times p50 · `fanout` see the tail take over with a ten-way fan-out.

### `circuit-breaker` 🔌 Circuit Breaker
**Insight:** when a dependency is failing, stop calling it; failing fast protects you.
App → breaker → payment service. Downstream health: healthy, slow, down. Traffic by button or rate slider. Breaker settings: failure threshold, cool-down, trial requests. Show the state machine (closed, open with a countdown, half-open), calls sent downstream versus failed fast, what the user waited, and the app's thread pool filling up. A switch removes the breaker so a slow dependency exhausts the pool and takes the app down too. A fallback switch gives users a degraded answer instead of an error.
**Goals:** `trip` trip the breaker open · `recover` watch it go half-open and close again after the service recovers · `exhaust` remove the breaker and exhaust the thread pool with a slow dependency · `fallback` serve a fallback while the breaker is open.

### `rate-limiter` 🚦 Rate Limiter
**Insight:** limits protect a service; the algorithm decides how bursts are treated.
Three algorithms as tabs: token bucket (capacity and refill sliders, tokens drawn), fixed window, sliding window. A spam-able "send" button, a "burst of 20" button and an auto-rate slider. A timeline of recent requests marked 200 or 429 (with Retry-After). A "boundary burst" button demonstrates the fixed-window weakness (twice the limit across a window edge). Two clients and a "limit per client" switch show a noisy neighbour being contained.
**Goals:** `limited` get a 429 · `refill` wait for the bucket to refill and succeed again · `boundary` sneak twice the limit past the fixed window · `sliding` show the sliding window stops that · `fair` keep client B working while client A spams.

### `deploy-strategies` 🚀 Deploy Strategies
**Insight:** how you roll out decides how many users a bad release hurts and how fast you can undo it.
A fleet of eight instances, a traffic split bar, and an error-rate meter. Strategies: rolling (two at a time), blue/green (a full second fleet, then switch), canary (5% → 25% → 50% → 100% with a health check between steps and optional automatic rollback). Ship a good or a faulty version. Report users affected, time to roll back and extra servers needed.
**Goals:** `rolling` finish a rolling deploy · `bluegreen` switch to green and roll back instantly · `canary` catch a bad release with at most 5% of users affected · `cost` compare the extra capacity each strategy needs.

### `tracing-lab` 🔬 Tracing Lab
**Insight:** a trace shows where the time went across services.
A waterfall of spans for `GET /checkout` (gateway → checkout → cart, pricing → database, payment → bank API, then an email queue), nested and to scale; tap a span for its service, duration and tags, including the propagated trace id. Several traces to choose from: one normal, and slow ones with different culprits (an N+1 burst of tiny database spans, a slow external API, a retry storm, calls made one after another that could run in parallel). "Find the culprit": tap the span to blame and get feedback. A sampling switch (keep 10%) shows how a rare slow trace can be missed.
**Goals:** `read` open the normal trace and find its longest span · `culprit` correctly diagnose two slow traces · `nplus1` spot the N+1 pattern · `parallel` spot the calls that should have been parallel.

### `microservices-cascade` 🌊 Cascade Lab
**Insight:** one slow service can drown the ones that wait on it.
Users → gateway → orders → inventory → pricing, with recommendations as an optional side call. Each service shows a thread pool, latency and status. Make pricing slow: with no defences the waiting spreads upstream until the whole site is down. Defences to switch on per call: timeout, circuit breaker, bulkhead (a separate small pool for recommendations), fallback. Show the percentage of user requests served.
**Goals:** `cascade` take the whole site down by slowing one service · `timeout` stop the spread with timeouts · `bulkhead` keep checkout working while recommendations is down · `recover` get back above 95% success while pricing is still broken.

---

## Architecture

### `event-sourcing-lab` 📜 Event Sourcing Lab
**Insight:** store what happened, and the current state is just the sum.
A bank account. Command buttons (deposit, withdraw, change overdraft limit) are validated against the current state and, if accepted, append an immutable event to a numbered log. The current state is shown as the fold of the events, with the working visible. A time-travel slider replays up to any event. A read model ("statement") is updated after a delay you can set, so reads can lag (eventual consistency). A snapshot button, and "rebuild from snapshot + later events". For contrast, a plain CRUD row that only ever knows the latest balance.
**Goals:** `events` record five events · `travel` travel back to an earlier balance · `reject` have a command refused and see that no event was stored · `lag` read a stale statement and watch it catch up · `snapshot` rebuild the state from a snapshot.

---

## Ship It and The Architect

### `k8s-lab` ☸️ Kubernetes Lab
**Insight:** you declare what you want; a control loop keeps making it true.
A desired-state panel (replicas slider, image version) and a cluster of three nodes holding pod boxes with statuses. A reconcile loop ticks about once a second, compares desired with actual and acts, narrating ("wanted 4, found 3: starting one pod"). Tap a pod to kill it; kill a node (its pods are rescheduled, or go Pending if there is no room); change the image for a rolling update that never drops below replicas − 1 ready pods; deploy a broken image whose pods crash-loop while the old ones keep serving; roll back. A traffic meter shows the share of requests served.
**Goals:** `scale` scale to five replicas · `heal` kill a pod and watch it come back · `node` kill a node and see pods rescheduled · `update` do a rolling update with no downtime · `rollback` roll back a broken release.

### `cicd-pipeline` 🏭 CI/CD Pipeline
**Insight:** a pipeline is a row of nets; cheap, fast nets go first, and a missing net lets bugs through.
Build a pipeline from stages (lint, unit tests, build, integration tests, security scan, deploy to staging, end-to-end tests, deploy to production): add, remove, reorder. Push a commit carrying a chosen defect (none, style error, logic bug, broken contract between services, vulnerable dependency, broken user flow, wrong production config). The run animates stage by stage with realistic durations; the first stage able to catch that defect fails and stops the line; if none does, it reaches production and customers find it. Report time to feedback.
**Goals:** `green` take a clean commit to production · `catch` catch a logic bug before production · `fast` order the stages so a style error fails in under a minute · `escape` let a bug reach production by removing a stage, then fix the pipeline · `vuln` catch a vulnerable dependency.

### `kanban-sim` 📋 Kanban Simulator
**Insight:** limiting work in progress makes work finish sooner.
A board (To do → Dev → Review → Test → Done) with a fixed number of workers per column and tasks of random size. Start/pause and speed controls. WIP limit per column (none or a number). Metrics: throughput, average cycle time, total work in progress, and the age of the oldest card; mark the bottleneck. Without limits, work piles up before the slowest column and cycle time balloons; with limits, upstream stops starting and helps finish.
**Goals:** `baseline` run 30 days with no limits and note the cycle time · `bottleneck` identify the bottleneck column · `limit` set WIP limits and cut average cycle time by a quarter · `flow` keep every column within its limit for 20 days.
