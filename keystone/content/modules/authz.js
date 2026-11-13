/* Module: authz — Authorization.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs authz */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('az-basics', {
  eli5: 'Authorization is the bouncer’s second question. Once the system knows who you are, it still has to decide whether you may do this particular thing to that particular item.',

  cards: [
    { kind: 'concept', title: 'You are in. Now what?',
      body: `You walk into your office building. The front desk checks your ID and hands you a pass. That was **authentication**: proof of who you are.

        Now you try the door to the server room. Beep. Red light.

        The system knows exactly who you are. It simply has not been told you may go in there. That decision is **authorization**: *what is this person allowed to do?*

        Software has thousands of "doors": read this invoice, delete that photo, refund this order, view the admin page. Every one needs the same question asked and answered, every time.` },

    { kind: 'metaphor', title: 'The hotel key card',
      body: `A hotel key card is a nice picture of the whole idea.

        The desk **identified** you at check-in (authentication). The card itself does not say "this is Sam". It is just set up so that it opens room 412, the gym and the lift, and nothing else.

        Try room 413 and the lock says no, even though you are a perfectly real, paying guest.

        Software works the same way: being a known, logged-in user opens very few doors by itself. Each door has its own rule about who gets through.` },

    { kind: 'diagram', title: 'Every request is a question',
      body: 'Strip away the jargon and every authorization check asks the same thing: **may this subject do this action to this resource?**',
      nodes: [
        { id: 's', label: 'Subject: Priya', icon: '🧑', x: 0, y: 0 },
        { id: 'a', label: 'Action: delete', icon: '🗑️', x: 1, y: 0 },
        { id: 'r', label: 'Resource: report.pdf', icon: '📄', x: 2, y: 0 },
        { id: 'p', label: 'Policy', icon: '📜', x: 1, y: 1, tone: 'accent' },
        { id: 'd', label: 'Decision', icon: '⚖️', x: 1, y: 2, tone: 'warn' },
        { id: 'ok', label: 'Allow', x: 0, y: 3, tone: 'good' },
        { id: 'no', label: 'Deny', x: 2, y: 3, tone: 'bad' }
      ],
      edges: [
        { from: 's', to: 'p' }, { from: 'a', to: 'p' }, { from: 'r', to: 'p' },
        { from: 'p', to: 'd', label: 'rules decide' },
        { from: 'd', to: 'ok' }, { from: 'd', to: 'no' }
      ],
      caption: 'Sometimes a fourth input joins in: the context, such as the time of day or the network the request came from.' },

    { kind: 'code', title: 'Where the check lives in code',
      body: 'Here is the question inside a real request handler. Tap the highlighted lines.',
      code: { lang: 'js', src: `
        function getInvoice(req, res) {
          const user = req.user;                // set by authentication
          const invoice = db.findInvoice(req.params.id);
          if (!invoice) return res.status(404).end();
          if (!canRead(user, invoice)) return res.status(403).end();
          res.json(invoice);
        }

        function canRead(user, invoice) {
          return invoice.ownerId === user.id
              || user.permissions.includes('invoice:read-all');
        }`,
        notes: {
          2: 'Authentication already happened earlier. This line just *uses* its answer. Knowing who the user is does not decide anything yet.',
          5: 'The authorization check: subject (`user`), action (read, implied by the function) and resource (`invoice`). If it fails we stop **before** any data leaves.',
          10: 'The policy. Two ways to pass: you own the invoice, or you hold a permission that lets you read all of them. Anything else falls through to "no".'
        } } },

    { kind: 'concept', title: 'Default deny: the answer starts as no',
      body: `What should happen when no rule says anything about a request?

        There are two choices. **Default allow**: if nobody forbade it, go ahead. **Default deny**: if nobody *permitted* it, stop.

        Default deny is the one to build. Mistakes then fail safe: a forgotten rule means someone is annoyed that they cannot open a page, and they tell you. With default allow, a forgotten rule means a stranger quietly reads your customers' data, and nobody tells you.

        Think of a guest list: you are on it or you are not. There is no list of everyone who is *banned*.` },

    { kind: 'compare', title: 'Authentication vs authorization',
      body: 'They are often abbreviated *authn* and *authz*, and they are constantly confused. They answer different questions, at different times.',
      cols: ['Authentication', 'Authorization'],
      rows: [
        ['Question', 'Who are you?', 'What may you do?'],
        ['Happens', 'First, usually once per session or token', 'After, on every single request'],
        ['Evidence', 'Password, passkey, code, token', 'Rules, roles, ownership, policies'],
        ['Failure looks like', '`401`: I do not know who you are', '`403`: I know you, and no'],
        ['Analogy', 'The ID check at the door', 'Which rooms the pass opens']
      ] },

    { kind: 'tip', title: 'Least privilege: only the keys you need',
      body: `The **principle of least privilege** says: give every person, app and service the *minimum* access needed to do its job, and no more.

        A cleaner needs the offices but not the safe. A report-generating script needs to read the database, so do not hand it permission to delete tables.

        Why? Because accounts get stolen, people make mistakes and code has bugs. When something goes wrong, the damage is limited by what that account was allowed to do. A leaked read-only key is an annoyance. A leaked all-powerful key is a headline.` },

    { kind: 'pitfall', title: 'Failing open',
      body: `The classic bug is a check that *accidentally says yes*.

        What if the permissions service is down? What if the rule lookup throws an error? What if a field is missing, so the comparison is \`undefined === undefined\`, which is \`true\`?

        Each of those can turn "I could not work out the answer" into "allow". The cure is the same default-deny rule applied to code: the only way to reach the "allow" line is for a rule to have positively said so. Any error, gap or surprise ends at "deny".` },

    { kind: 'sequence', title: 'A request, start to finish',
      body: 'Both checks happen, in this order. Step through to see where `401` and `403` come from.',
      actors: ['Browser', 'API', 'Policy'],
      steps: [
        { from: 0, to: 1, label: 'DELETE /docs/7  (with token)', note: 'The request arrives carrying some proof of identity.' },
        { at: 1, label: 'who is this?', note: '**Authentication.** If the token is missing or fake, stop here with `401 Unauthorized`.' },
        { from: 1, to: 2, label: 'Priya, delete, doc 7?', note: 'Now the API asks the question: subject, action, resource.' },
        { from: 2, to: 1, label: 'deny', dashed: true, note: 'No rule gives Priya delete rights on this document. The default answer stands.' },
        { from: 1, to: 0, label: '403 Forbidden', dashed: true, note: 'The API knows who she is and refuses anyway. Nothing was deleted.' }
      ] }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'A user logs in successfully, then opens the admin page and sees "Access denied". Which statement is true?',
      options: ['Authentication worked; authorization said no to this action', 'Authentication failed, so the system could not trust the login', 'The system forgot who the user was part-way through the session', 'The password was correct but too weak to open admin pages'],
      answer: 0,
      why: [null, 'If login had failed, they would never have got as far as seeing any page.', 'The system knows exactly who they are. That is why it can refuse them by name.', 'Password strength is not what decides which pages you may open.'],
      explain: 'Logging in proves identity. Whether that identity may open the admin page is a separate decision, made by the rules, and here the answer was no.' },

    { type: 'tf', after: 4, statement: 'With a default-deny design, a request that no rule mentions is refused.', answer: true,
      explain: 'That is the whole point. Access has to be granted explicitly, so anything nobody thought about stays closed.' },

    { type: 'bucket', prompt: 'Every check has a subject, an action and a resource. Sort these into the right part of the question.', buckets: ['Subject', 'Action', 'Resource'],
      items: [['Priya, a support agent', 0], ['refund', 1], ['order #8841', 2], ['the nightly backup job', 0], ['read', 1], ['the salary spreadsheet', 2], ['approve', 1], ['a mobile app acting for a user', 0]],
      explain: 'The subject is *who or what* is asking (people and programs both count), the action is *what they want to do*, and the resource is *the thing it is done to*.' },

    { type: 'ab', q: 'Which permission check fails safely?',
      a: { lang: 'js', label: 'Deny unless allowed', src: `
        function canEdit(user, doc) {
          if (doc.editors.includes(user.id)) return true;
          return false;
        }` },
      b: { lang: 'js', label: 'Allow unless blocked', src: `
        function canEdit(user, doc) {
          if (doc.blocked.includes(user.id)) return false;
          return true;
        }` },
      answer: 'a',
      explain: 'The first has to be told explicitly that someone may edit. The second allows everybody it has not heard of, including every new user, every typo in an id and every brand-new account.' },

    { type: 'spot', prompt: 'This check is meant to protect document deletion. Tap the line that makes it fail open.',
      code: { lang: 'js', src: `
        function canDelete(user, doc) {
          try {
            const rules = loadRules(doc.id);
            return rules.allowed.includes(user.id);
          } catch (err) {
            return true;   // rules service is down, do not block people
          }
        }` },
      lines: [6],
      explain: 'Whenever loading the rules fails, everyone is allowed to delete. An attacker only needs to make the rules lookup fail. An error should end in `return false`.' },

    { type: 'order', prompt: 'Put the life of a protected request in order.',
      items: ['The request arrives with some proof of identity', 'The system works out who the caller is (authentication)', 'It asks: may this subject do this action to this resource?', 'The policy answers allow or deny, defaulting to deny', 'Only on allow does the action actually run'],
      explain: 'You cannot ask what someone may do until you know who they are, and the action must wait for the answer. If it ran first, a "no" would arrive too late.' },

    { type: 'cloze', text: 'Giving each account only the minimum access it needs is called the principle of {{least privilege}}, and it limits the {{damage}} when an account is stolen.',
      distractors: ['most privilege', 'speed', 'encryption'],
      explain: 'You cannot stop every account being stolen or every bug being written. Least privilege caps how bad each one can get.' },

    { type: 'scenario', title: 'Sharing in a document app',
      intro: 'You are building **Docshare**, a small app where teams write documents together. Before launch you have to decide how permissions behave. Each choice changes how safe and how pleasant the app is.',
      meters: { safety: 60, usability: 60 },
      steps: [
        { text: 'Someone creates a brand-new document. Who should be able to open it?',
          choices: [
            { label: 'Only the creator, until they share it', score: 2, effects: { safety: 20, usability: 5 }, feedback: 'Default deny. A new document starts private and access is added on purpose. Nobody leaks a draft by forgetting to lock it.' },
            { label: 'Everyone in the company, to encourage collaboration', score: 0, effects: { safety: -20, usability: 10 }, feedback: 'Friendly, until a manager drafts a redundancy list. Default allow means every careless moment is a leak.' },
            { label: 'Anyone who has the link', score: 0, effects: { safety: -25, usability: 10 }, feedback: 'Links get pasted into chats, forwarded and indexed. A link is not a login.' }
          ] },
        { text: 'A teammate asks to *comment* on a document but not change it. How do you model "what they may do"?',
          choices: [
            { label: 'Separate actions: `read`, `comment`, `edit`, granted individually', score: 2, effects: { safety: 15, usability: 10 }, feedback: 'Fine-grained actions mean you can give a reviewer exactly what they need. That is least privilege in practice.' },
            { label: 'One yes/no switch: has access or does not', score: 1, effects: { safety: -10, usability: 5 }, feedback: 'Simple, but now "let them comment" means "let them rewrite everything". People over-grant to get their work done.' },
            { label: 'Make them an admin so it just works', score: 0, effects: { safety: -25, usability: 5 }, feedback: 'Admins can delete the workspace. The cure is wildly bigger than the problem.' }
          ] },
        { text: 'The server that stores permissions is briefly unreachable during a check. What should the app do?',
          choices: [
            { label: 'Refuse the request and show a "try again" message', score: 2, effects: { safety: 15, usability: -5 }, feedback: 'Annoying for a few seconds, safe forever. If you cannot find the answer, the answer is no.' },
            { label: 'Let the request through so users are not blocked', score: 0, effects: { safety: -30, usability: 5 }, feedback: 'You have just built a way to read every document: make the permissions server fail. That is failing open.' },
            { label: 'Use whatever the user could do last time', score: 1, effects: { safety: -5, usability: 5 }, feedback: 'Reasonable for a very short time, but permissions change (someone may have just been removed). It needs a strict expiry, and still needs thought.' }
          ] }
      ],
      outro: 'The pattern to remember: **start closed, grant specific actions, and treat "I could not tell" as "no".**' },

    { type: 'explain', prompt: 'A colleague says: "Users have to log in to use the app, so it is secure." Explain what is missing.',
      model: 'Logging in only proves who someone is (authentication). Every request still needs an authorization check: may this user do this action to this resource? Without it, any logged-in user could read or change anyone’s data. Rules should default to deny and give each user the least access they need.',
      keywords: ['authentication', 'authorization', 'who', 'allowed', 'default deny', 'least privilege'] }
  ],

  flashcards: [
    { q: 'What three things does every authorization check involve?', a: 'A subject (who or what is asking), an action (what they want to do) and a resource (what it is done to). Sometimes also the context.' },
    { q: 'What is the difference between authentication and authorization?', a: 'Authentication proves who you are. Authorization decides what you may do. The first happens once, the second on every request.' },
    { q: 'What does "default deny" mean?', a: 'If no rule explicitly allows a request, it is refused. Mistakes then fail safe.' },
    { q: 'State the principle of least privilege.', a: 'Give every user, app and service only the access it needs to do its job, and no more, so a stolen account can do limited harm.' },
    { q: 'What does "failing open" mean?', a: 'When a check hits an error or missing data and accidentally allows the request. The fix is to make every uncertain path end in deny.' }
  ],

  glossary: [
    { term: 'Authorization', def: 'Deciding whether an identified subject may perform an action on a resource.', like: 'Which doors your hotel key card opens.', aka: ['authz'] },
    { term: 'Subject', def: 'The party making a request: a person, an app or a service.', like: 'The person holding the key card.' },
    { term: 'Resource', def: 'The thing being accessed: a file, an invoice, an API endpoint, a database row.', like: 'The room behind the door.' },
    { term: 'Policy', def: 'The rules that turn a subject, an action and a resource into allow or deny.', like: 'The building’s rulebook for who gets into which room.' },
    { term: 'Default deny', def: 'A design where anything not explicitly permitted is refused.', like: 'A guest list: if you are not on it, you are not in.' },
    { term: 'Least privilege', def: 'Granting only the minimum access required for a job.', like: 'A valet key that starts the car but does not open the boot.' }
  ],

  takeaways: [
    'Every request is a question: may this **subject** do this **action** to this **resource**?',
    'Authentication says who you are. Authorization decides what you may do, on every request.',
    '**Default deny**: nothing is allowed unless a rule says so. Errors end in "no".',
    '**Least privilege**: only the access the job needs. It limits the damage when something goes wrong.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('az-acl', {
  eli5: 'An access control list is a guest list stuck to each door: the item itself carries the names of who may open it and what they may do.',

  cards: [
    { kind: 'concept', title: 'The Share button',
      body: `Open a document in any shared-docs app and click **Share**. A box appears:

        - Maya: Owner
        - Sam: Can edit
        - Priya: Can view
        - Anyone with the link: Can view

        That list is attached to *this* document. Another document has a different list. When someone opens the file, the app reads the list and asks: is this person on it, and does the entry allow what they are trying to do?

        That is an **access control list**, or **ACL**. It is the oldest and most familiar way to do authorization.` },

    { kind: 'metaphor', title: 'A guest list on every door',
      body: `Picture a corridor of rooms. On each door hangs a clipboard.

        The clipboard on room 1 says: *Maya, anything. Sam, come in and rearrange. Priya, look but do not touch.* The clipboard on room 2 lists a completely different set of people.

        The bouncer does not need to know anything about the building. He reads the clipboard, finds your name, checks what it lets you do.

        The key feature: **the permissions live with the thing being protected**, not with the people.` },

    { kind: 'code', title: 'File permissions are an ACL',
      body: 'You have probably already met one. On Linux and macOS every file carries a tiny ACL. Tap each line.',
      code: { lang: 'text', src: `
        -rw-r--r--  maya  staff  notes.txt
        -rw-r-----  maya  devs   report.txt
        -rw-------  maya  maya   diary.txt`,
        notes: {
          1: 'After the leading dash come three triplets: **owner** `rw-` (read, write), **group** `r--` (read only), **everyone else** `r--` (read only). Anyone on the machine can read the notes.',
          2: 'Owner Maya can read and write. Members of the `devs` group can read. Everyone else gets `---`: nothing at all.',
          3: 'Only Maya can touch her diary. The group is just Maya, and "others" have no access.'
        } } },

    { kind: 'diagram', title: 'One resource, one list',
      body: 'The list hangs off the resource. To answer a request, the system looks at *that resource’s* entries and nothing else.',
      nodes: [
        { id: 'doc', label: 'Budget.xlsx', icon: '📊', x: 1, y: 0, tone: 'accent' },
        { id: 'm', label: 'Maya: owner', icon: '🧑', x: 0, y: 1 },
        { id: 's', label: 'Sam: edit', icon: '🧑', x: 1, y: 1 },
        { id: 'p', label: 'Priya: view', icon: '🧑', x: 2, y: 1 },
        { id: 'g', label: 'Finance group: view', icon: '👥', x: 1, y: 2 }
      ],
      edges: [
        { from: 'doc', to: 'm' }, { from: 'doc', to: 's' }, { from: 'doc', to: 'p' }, { from: 'doc', to: 'g', label: 'entry for a group' }
      ],
      caption: 'An entry can name a person or a group. A group saves you from adding twenty names one at a time.' },

    { kind: 'code', title: 'An ACL in a few lines of JavaScript',
      body: 'There is no magic here: an ACL is data plus a lookup.',
      code: { lang: 'js', src: `
        const doc = {
          id: 'budget',
          owner: 'maya',
          acl: [
            { who: 'sam',     can: ['read', 'write'] },
            { who: 'priya',   can: ['read'] },
            { who: 'finance', can: ['read'] }   // a group
          ]
        };

        function allowed(user, action, doc) {
          if (user.id === doc.owner) return true;
          return doc.acl.some(entry =>
            (entry.who === user.id || user.groups.includes(entry.who))
            && entry.can.includes(action));
        }`,
        notes: {
          3: 'The owner is stored on the resource itself. Owners are the people who may also edit the list.',
          5: 'Each entry is a name plus the actions it grants. No entry means no access: default deny again.',
          12: 'The owner always passes. A real system would still let owners lock themselves out on purpose, but keep it simple.',
          13: 'The check walks the list. A match needs the right person (or group) **and** the right action.'
        } } },

    { kind: 'concept', title: 'Owners and sharing',
      body: `Most ACL systems have one special entry: the **owner**, usually whoever created the thing. The owner can read and write, and can also **change the list**.

        That is all "sharing" is: the owner adds an entry, or removes one. The app does not need an administrator for it. Each owner decides about their own files.

        This style is called **discretionary access control** (DAC): access is at the discretion of whoever owns the item. It is wonderfully flexible. It also means the people choosing are not security experts, and some will click "Anyone with the link" because it was quicker.` },

    { kind: 'compare', title: 'What an ACL answers easily, and what it does not',
      body: 'The list lives on the resource, so questions that start from the resource are cheap. Questions that start from the person are not.',
      cols: ['Easy', 'Painful'],
      rows: [
        ['Question', 'Who can open Budget.xlsx?', 'What can Sam open, across the whole company?'],
        ['How', 'Read one list', 'Scan every list on every resource'],
        ['Real task', 'Check one file before sharing', 'Remove a leaver from everything'],
        ['Audit', 'Per-file review is quick', 'A company-wide review is not']
      ] },

    { kind: 'pitfall', title: 'When ACLs stop scaling',
      body: `ACLs are lovely for ten files. For ten million they creak.

        - **Offboarding.** Sam leaves. His name is scattered across thousands of lists, and nobody knows which.
        - **Drift.** Access is added in a hurry and never removed. Years later, half the company can still read the old salary sheet.
        - **No big picture.** Every list is separate, so "who can see the HR folder?" has no single answer.
        - **Copy and paste.** A new project means rebuilding a list by hand, and humans make mistakes.

        The usual escape is to give permissions to **groups**, then to **roles**. That is the next lesson.` },

    { kind: 'realworld', title: 'ACLs in the wild',
      body: `ACLs are everywhere you can say "share with…":

        - **Filesystems** (Unix permissions, Windows folder security tabs).
        - **Shared-document and cloud-storage apps**: the Share dialog.
        - **Network devices**: routers and firewalls use rule lists called ACLs too, though those match addresses and ports instead of people.
        - **Object storage**: cloud buckets began with per-object ACLs, and the advice today is mostly to prefer central policies instead, for exactly the scaling reasons above.

        The idea survives because it is simple. The trick is knowing when to outgrow it.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'Where does an ACL store its permissions?',
      options: ['Attached to each resource, as a list of who may do what', 'On each user, as a list of everything they may open', 'In the browser, so the app can check quickly', 'In one global table used by every app'],
      answer: 0,
      why: [null, 'Putting the list on the user is a different design (capabilities and roles lean this way). An ACL hangs from the item.', 'The browser belongs to the user, who can edit anything there. Never store rules where the person being checked controls them.', 'A single global table is possible, but that is not what makes something an ACL.'],
      explain: 'The defining feature of an ACL is that the permissions travel with the resource. Each door carries its own guest list.' },

    { type: 'short', after: 2, q: 'In Unix file permissions, what single word names the special user who normally controls a file and may change its permissions?', accept: ['owner'], hint: 'The first of the three triplets.',
      explain: 'The **owner** has their own triplet, and can change who else gets access. Group and others come after.' },

    { type: 'match', prompt: 'Match each part of `-rw-r-----` to what it means.',
      pairs: [['rw- (first triplet)', 'The owner can read and write'], ['r-- (second triplet)', 'The group can read only'], ['--- (third triplet)', 'Everyone else has no access'], ['The very first dash', 'This is a regular file, not a directory']],
      explain: 'Read left to right: type, then owner, group, others. The `-` placeholders mean "not granted".' },

    { type: 'tf', statement: 'In a classic ACL system it is easy to list everything a given employee can access across the whole company.', answer: false,
      explain: 'The lists hang from the resources, so to answer that question you have to open every list. That is why audits and leaver clean-ups hurt.' },

    { type: 'bucket', prompt: 'Is this question easy or painful for a system built on per-resource ACLs?', buckets: ['Easy', 'Painful'],
      items: [['Who can edit the Q3 plan?', 0], ['Is Priya allowed to read this one invoice?', 0], ['Which files can Sam open anywhere?', 1], ['Remove a leaver from every shared item', 1], ['Add a colleague to this single document', 0], ['Show everything shared outside the company', 1]],
      explain: 'Anything that starts from one resource reads one list. Anything that starts from a person, or sweeps across everything, has to visit every list.' },

    { type: 'spot', prompt: 'This ACL check has a bug that lets people do more than they were granted. Tap the faulty line.',
      code: { lang: 'js', src: `
        function allowed(user, action, doc) {
          if (user.id === doc.owner) return true;
          return doc.acl.some(entry =>
            entry.who === user.id);
        }` },
      lines: [3, 4],
      explain: 'The check finds Priya’s entry but never looks at *what* it grants. Her `read` entry now allows `write` and `delete` as well. Match the person **and** the action.' },

    { type: 'estimate', q: 'A company has 2,000 staff. On average each person has been added to about 500 shared documents over the years. Roughly how many ACL entries must be reviewed to say who can see what?', answer: 1000000, unit: 'entries', min: 1000, max: 100000000,
      explain: '2,000 × 500 is a million entries, and in practice it is worse because entries are duplicated across versions and folders. Nobody reviews a million lines by hand, which is why access quietly drifts.' },

    { type: 'scenario', title: 'The leaver and the shared drive',
      intro: 'You run IT at a 300-person company whose shared drive uses per-file ACLs. Dan, a long-serving finance manager, has just resigned and leaves on Friday. He has been added to files by dozens of people over eight years.',
      meters: { exposure: 70, effort: 80 },
      steps: [
        { text: 'It is Monday. How do you start removing Dan’s access?',
          choices: [
            { label: 'Disable his login, so he can no longer authenticate at all', score: 2, effects: { exposure: -35, effort: -5 }, feedback: 'Fast and total. No matter how many lists still name him, he cannot prove he is Dan. This is the emergency brake, and it is why leavers are disabled, not just "removed from lists".' },
            { label: 'Ask Dan to tell you which files he owns', score: 0, effects: { exposure: -5, effort: -10 }, feedback: 'He cannot remember eight years of shares, and a leaver is not the best source of truth. Meanwhile his access is untouched.' },
            { label: 'Search every file’s ACL for his name by hand', score: 1, effects: { exposure: -15, effort: -40 }, feedback: 'Correct in spirit, unrealistic at scale. You will miss files and burn the week.' }
          ] },
        { text: 'Dan owned about 400 files that other people still use. What should happen to them?',
          choices: [
            { label: 'Transfer ownership to his manager or team before he goes', score: 2, effects: { exposure: -15, effort: -10 }, feedback: 'Owners are the people who can change sharing. A file with a vanished owner is a file nobody can fix when the list is wrong.' },
            { label: 'Delete his files with his account', score: 0, effects: { exposure: -5, effort: 5 }, feedback: 'Tidy, and you have just destroyed eight years of financial records the company needs.' },
            { label: 'Leave them as they are; ACLs will sort themselves out', score: 0, effects: { exposure: 15, effort: 5 }, feedback: 'They will not. Orphaned files keep their old sharing forever, including "anyone with the link".' }
          ] },
        { text: 'The review reveals the real problem: nobody knows who can read what. What is the sensible long-term answer?',
          choices: [
            { label: 'Move towards group- or role-based access, so people get access through a team and leaving means leaving one group', score: 2, effects: { exposure: -20, effort: -15 }, feedback: 'Instead of a million personal entries you have a handful of groups. That is the idea behind the next lessons.' },
            { label: 'Add a rule that owners must review their ACLs every month', score: 1, effects: { exposure: -5, effort: -20 }, feedback: 'Kind of works for a while, until busy people stop doing it. Process helps, structure helps more.' },
            { label: 'Accept it; this is how shared drives are', score: 0, effects: { exposure: 10 }, feedback: 'It is how they drift to being. Every leaver after Dan will repeat this week.' }
          ] }
      ],
      outro: 'The pattern to remember: **personal entries on resources pile up. Give access through groups, and keep ownership clear.**' },

    { type: 'explain', prompt: 'Explain to a colleague why per-resource ACLs are great for a small team but become hard to manage in a large company.',
      model: 'An ACL is a list on each resource, so it is easy to see who can open one file. But there is no single place that says what one person can open, so removing a leaver or auditing access means checking every list. At scale people get added in a hurry and never removed, so access drifts. Groups or roles fix this by granting access through a few shared definitions.',
      keywords: ['list', 'resource', 'every', 'audit', 'leaver', 'groups', 'drift'] }
  ],

  flashcards: [
    { q: 'What is an ACL?', a: 'An access control list: a list attached to a resource naming who may do what to it.' },
    { q: 'What do the three triplets in `rw-r--r--` mean?', a: 'Permissions for the owner, then the group, then everyone else. Each is read, write, execute.' },
    { q: 'What can an owner do that other users usually cannot?', a: 'Change the access list: share the item with others or take access away.' },
    { q: 'Why are ACLs hard to audit at scale?', a: 'The lists hang from resources, so answering "what can this person access?" means checking every list.' },
    { q: 'What is the usual way out of ACL sprawl?', a: 'Grant access to groups or roles instead of individuals, so there are far fewer rules to manage.' }
  ],

  glossary: [
    { term: 'Access control list', def: 'A list attached to a resource that says which subjects may perform which actions on it.', like: 'A clipboard of names hanging on a door.', aka: ['ACL'] },
    { term: 'Owner', def: 'The subject with control of a resource, who can also change who else may access it.', like: 'The host who writes the guest list.' },
    { term: 'Group', def: 'A named set of users that can be granted access as a single entry.', like: 'A team name on the guest list instead of twenty individual names.' },
    { term: 'Discretionary access control', def: 'A model where owners decide for themselves who gets access to their own resources.', like: 'Each host picks their own guests.', aka: ['DAC'] },
    { term: 'Permission drift', def: 'Access that accumulates over time because grants are added and rarely removed.', like: 'Spare keys handed out over the years that nobody collects back.' }
  ],

  takeaways: [
    'An **ACL** is a list on each resource: who may do what to *this* item.',
    'Unix file permissions are a tiny ACL: owner, group, others, each with read, write, execute.',
    'Owners share by editing the list. Flexible, but humans over-share and forget to revoke.',
    'Cheap to ask "who can open this?", painful to ask "what can *she* open?". Groups and roles come next.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('az-rbac', {
  eli5: 'Instead of telling the system what each person may do, you create job titles, say what each job may do, and then just say who holds which job.',

  cards: [
    { kind: 'concept', title: 'A hospital hires fifty nurses',
      body: `A hospital system has ten thousand records and a thousand staff. Per-person lists would be hopeless.

        But look at what actually happens. A new nurse joins. Nobody sits down and decides, one by one, which of ten thousand records she may see. Someone says: "She is a **nurse**." And everyone knows roughly what that means.

        **Role-based access control** (RBAC) copies that habit. You never grant permissions to people directly. You grant them to **roles**, then you give people roles.

        When the nurse moves to another ward, you change one thing: her role. Not a thousand entries.` },

    { kind: 'metaphor', title: 'Hats, not people',
      body: `Think of a theatre crew with coloured hats. The *stage manager* hat opens the backstage door and the lighting desk. The *usher* hat opens the seating areas and the ticket scanner.

        The door does not know Dev or Alex or Priya. It only knows hats. Whoever wears the stage-manager hat gets in.

        When Dev leaves, you take his hat. You do not walk round every door crossing out his name. When a new usher arrives, you hand over a hat and they work immediately.

        Where the metaphor stops: a person may wear several hats at once, and the system adds them together.` },

    { kind: 'diagram', title: 'Users, roles, permissions',
      body: 'Two simple links: people to roles, roles to permissions. The person never touches a permission directly.',
      nodes: [
        { id: 'u1', label: 'Maya', icon: '🧑', x: 0, y: 0 },
        { id: 'u2', label: 'Sam', icon: '🧑', x: 1, y: 0 },
        { id: 'r1', label: 'Role: Editor', icon: '🎩', x: 0, y: 1, tone: 'accent' },
        { id: 'r2', label: 'Role: Billing', icon: '🎩', x: 2, y: 1, tone: 'accent' },
        { id: 'p1', label: 'doc:read', x: 0, y: 2, tone: 'good' },
        { id: 'p2', label: 'doc:write', x: 1, y: 2, tone: 'good' },
        { id: 'p3', label: 'invoice:read', x: 2, y: 2, tone: 'good' }
      ],
      edges: [
        { from: 'u1', to: 'r1', label: 'has role' }, { from: 'u2', to: 'r1' }, { from: 'u2', to: 'r2' },
        { from: 'r1', to: 'p1' }, { from: 'r1', to: 'p2' }, { from: 'r2', to: 'p3' }
      ],
      caption: 'Sam holds two roles, so Sam can read and write documents and read invoices.' },

    { kind: 'code', title: 'RBAC in a few lines',
      body: 'The whole model is two lookup tables and one function.',
      code: { lang: 'js', src: `
        const rolePermissions = {
          viewer: ['doc:read'],
          editor: ['doc:read', 'doc:write'],
          billing: ['invoice:read', 'invoice:refund']
        };

        const userRoles = {
          maya: ['editor'],
          sam:  ['editor', 'billing']
        };

        function can(userId, permission) {
          const roles = userRoles[userId] || [];
          return roles.some(role =>
            (rolePermissions[role] || []).includes(permission));
        }

        can('sam', 'invoice:refund');   // true
        can('maya', 'invoice:read');    // false`,
        notes: {
          1: 'Table one: what each **role** is allowed to do. Permissions are named as `thing:action`, which keeps them readable.',
          7: 'Table two: which **roles** each person holds. This is the only thing that changes when staff join, leave or move.',
          13: '`|| []` is default deny at work: an unknown user has no roles, so no permissions.',
          17: 'Sam holds `billing`, which includes `invoice:refund`.'
        } } },

    { kind: 'pitfall', title: 'Check permissions, not role names',
      body: `The most common RBAC mistake is putting role names in the application code:

        \`if (user.role === 'admin') { … }\`

        It works on day one. Then a second role needs the same ability, and you edit every check. Then "admin" is split in two, and you edit every check again. Role names are *labels that change*. Permissions are *what the code actually needs*.

        Write \`can(user, 'invoice:refund')\` instead. The code states what it needs, and the mapping from roles to that permission lives in one table you can change without touching a single check.`,
      code: { lang: 'js', src: `
        // Brittle: every new role means editing this
        if (user.role === 'admin' || user.role === 'manager') refund(order);

        // Better: the code names the need
        if (can(user, 'order:refund')) refund(order);`,
        notes: {
          2: 'Which roles may refund is now buried in application code, probably in many places.',
          5: 'The check never mentions a role. Who gets `order:refund` is decided in the role table.'
        } } },

    { kind: 'layers', title: 'Role hierarchies',
      body: 'Roles often build on each other. A senior role simply includes everything a junior one can do, plus more.',
      layers: [
        { label: 'Admin', note: 'Everything an Editor can do, plus manage users and delete workspaces', tone: 'bad', icon: '🛡️' },
        { label: 'Editor', note: 'Everything a Viewer can do, plus create and change content', tone: 'warn', icon: '✏️' },
        { label: 'Viewer', note: 'Read content', tone: 'good', icon: '👀' }
      ] },

    { kind: 'story', title: 'Role explosion',
      body: `A company starts with three roles: Sales, Support, Finance. Then reality arrives.

        "Sales, but only in Europe." "Sales manager, Europe, who can approve discounts." "Support who can refund, but only up to £50." "Finance, read only, for auditors."

        Every new combination of *department, region, seniority and special exception* becomes a new role. Five departments × four regions × three levels is already **sixty roles**, and nobody remembers what half of them mean.

        This is **role explosion**, the classic way RBAC goes wrong. Roles stop being simple job titles and become one-off bundles. The next lesson shows what to do when roles alone are not expressive enough.` },

    { kind: 'realworld', title: 'RBAC everywhere',
      body: `You will meet RBAC in almost every system you work with.

        - **Databases:** create a role, grant it table permissions, grant the role to people. The example below is PostgreSQL.
        - **Cloud platforms:** IAM (identity and access management) attaches permissions to roles, and your servers and apps *assume* roles too.
        - **Kubernetes:** *Roles* list what is allowed, *RoleBindings* attach them to users or service accounts.
        - **Apps:** nearly every SaaS product has Owner / Admin / Member / Guest.`,
      code: { lang: 'sql', src: `
        CREATE ROLE analyst;
        GRANT SELECT ON orders TO analyst;
        GRANT analyst TO priya;`,
        notes: {
          1: 'A role with no powers yet.',
          2: 'Its only permission: read the `orders` table.',
          3: 'Priya joins the role. If she leaves the team, one `REVOKE` removes everything at once.'
        } } },

    { kind: 'tip', title: 'Keep roles boring',
      body: `Good roles map to **real jobs** that people recognise: *Support Agent*, *Billing Admin*, *Auditor*. A few dozen at most.

        When someone needs something unusual, resist minting a role for them. Ask whether it is a genuine new job, or whether the rule depends on a fact (their region, the amount, who owns the item) that roles cannot express.

        And apply least privilege to the bundles themselves: start roles small and add. Removing a power from a role later breaks people. Adding one never does.

        In the lab that follows you will build roles yourself and see who ends up able to do what.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'A new analyst joins the company. In an RBAC system, what is the normal way to give them the access they need?',
      options: ['Assign them the analyst role, which already carries the right permissions', 'Add their name to the access list of every table and report', 'Copy a colleague’s password so they can see the same things', 'Give them admin for now and trim their access later'],
      answer: 0,
      why: [null, 'That is the ACL way, and exactly the sprawl roles were invented to avoid.', 'Sharing passwords destroys accountability: logs would show the colleague, not the analyst.', '"Trim later" very rarely happens. Start with least privilege.'],
      explain: 'RBAC separates who someone is (a role) from what that role can do (permissions). Joining means one assignment, leaving means one removal.' },

    { type: 'spot', after: 4, prompt: 'This code ties a feature to role names. Tap the line that will cause trouble as roles change.',
      code: { lang: 'js', src: `
        app.post('/orders/:id/refund', (req, res) => {
          const user = req.user;
          if (user.role !== 'admin' && user.role !== 'manager') {
            return res.status(403).end();
          }
          refund(req.params.id);
          res.status(204).end();
        });` },
      lines: [3],
      explain: 'The check hard-codes which roles may refund. Add a "support lead" role and you must hunt down every check like this. Ask `can(user, \'order:refund\')` and change the mapping in one place.' },

    { type: 'tf', after: 5, statement: 'In a role hierarchy, a more senior role normally includes everything the junior roles beneath it can do.', answer: true,
      explain: 'That is what makes it a hierarchy. An Admin does not need Viewer and Editor assigned separately: it inherits them.' },

    { type: 'match', prompt: 'Match each RBAC word to what it is.',
      pairs: [['User', 'The person or program who needs access'], ['Role', 'A job-like bundle of permissions'], ['Permission', 'One specific allowed action, like `invoice:read`'], ['Role assignment', 'The link that gives a user a role']],
      explain: 'Users are linked to roles, roles are linked to permissions. Code should ask about the permission at the end of the chain.' },

    { type: 'ab', q: 'Which check will survive the next company reorganisation better?',
      a: { lang: 'js', label: 'Asks about the role', src: `
        if (user.role === 'support-lead') {
          issueCredit(order);
        }` },
      b: { lang: 'js', label: 'Asks about the permission', src: `
        if (can(user, 'order:credit')) {
          issueCredit(order);
        }` },
      answer: 'b',
      explain: 'Roles are renamed, merged and split all the time. The permission describes what the code needs, so only the role-to-permission table has to change.' },

    { type: 'multi', q: 'Which are typical signs of role explosion?',
      options: ['Role names like "Sales-EU-Manager-Discounts-Temp"', 'Nobody can explain what half the roles are for', 'New exceptions are handled by creating yet another role', 'Every user holds exactly one of five clear job-based roles', 'Permissions are named like `invoice:read`'],
      answers: [0, 1, 2],
      explain: 'Roles that encode combinations of region, level and exceptions multiply fast and lose meaning. A short list of clear jobs, and tidy permission names, are signs of a healthy design.' },

    { type: 'estimate', q: 'A firm has 6 departments, 5 regions and 4 seniority levels, and creates one role for every combination. Roughly how many roles is that?', answer: 120, unit: 'roles', min: 1, max: 10000,
      explain: '6 × 5 × 4 = 120. And that is before special cases. Multiplying dimensions is how role explosion sneaks up on you.' },

    { type: 'scenario', title: 'Roles for a hospital',
      intro: 'You are designing access for the records system of a hospital. Staff include doctors, nurses, receptionists, billing clerks and IT support. Patient records are highly sensitive.',
      meters: { 'patient privacy': 60, 'staff can work': 60 },
      steps: [
        { text: 'Where do you start with the permissions?',
          choices: [
            { label: 'List what each job genuinely needs, and create roles for those jobs', score: 2, effects: { 'patient privacy': 20, 'staff can work': 15 }, feedback: 'Roles that match real jobs are easy to explain and review. Receptionists need appointments, not test results.' },
            { label: 'One "staff" role with full read access, to keep it simple', score: 0, effects: { 'patient privacy': -30, 'staff can work': 10 }, feedback: 'Simple, and now a receptionist can browse a celebrity’s file. Least privilege is not optional with health data.' },
            { label: 'A separate custom role for each individual employee', score: 0, effects: { 'patient privacy': -5, 'staff can work': -15 }, feedback: 'This is an ACL wearing a hat. You have a thousand roles and no benefit.' }
          ] },
        { text: 'Dr Okafor covers a colleague’s ward this week. How should access work?',
          choices: [
            { label: 'Give her the extra ward through a temporary role assignment that is removed afterwards', score: 2, effects: { 'patient privacy': 10, 'staff can work': 15 }, feedback: 'The role stays clean and the exception is a visible, time-limited assignment. Remember to remove it, ideally automatically.' },
            { label: 'Make her an administrator for the week', score: 0, effects: { 'patient privacy': -25, 'staff can work': 10 }, feedback: 'Administrators can do far more than read one ward. The fix is wildly out of proportion.' },
            { label: 'Create a new role "Doctor-Ward-7-Covering-Dr-Smith"', score: 1, effects: { 'patient privacy': 0, 'staff can work': 5 }, feedback: 'It works once, and it is the first step to role explosion. Multiply this by every absence and your role list is unreadable.' }
          ] },
        { text: 'The hospital now wants "doctors may only open records of patients currently on their own ward". Can RBAC alone do it?',
          choices: [
            { label: 'Not cleanly. This rule depends on a fact about the patient and the doctor, which needs attribute-based rules (next lesson)', score: 2, effects: { 'patient privacy': 15, 'staff can work': 5 }, feedback: 'Spot-on. Roles can say "doctors may read records". They cannot say "only this doctor’s patients" without one role per ward.' },
            { label: 'Yes: make a role for every ward and every doctor-ward pair', score: 1, effects: { 'patient privacy': 5, 'staff can work': -10 }, feedback: 'It will work, and the number of roles will be huge. This is the explosion the next lesson avoids.' },
            { label: 'Skip it: roles are good enough', score: 0, effects: { 'patient privacy': -20 }, feedback: 'The rule exists because curiosity about patients is a real privacy risk. Choose the right tool instead of dropping it.' }
          ] }
      ],
      outro: 'The pattern to remember: **roles for jobs, permissions for what code asks, and a different tool when the rule depends on facts.**' },

    { type: 'explain', prompt: 'Explain RBAC to a new developer, and say why checks in code should name permissions rather than roles.',
      model: 'In RBAC you give permissions to roles (like editor or billing) and then give users roles, so joining or leaving is one change. Code should ask about the permission it needs, like invoice:refund, not the role name, because roles get renamed and split. Then only the role-to-permission table changes. Too many special-case roles causes role explosion.',
      keywords: ['roles', 'permissions', 'users', 'check', 'role explosion', 'table', 'assign'] }
  ],

  flashcards: [
    { q: 'What are the links in RBAC?', a: 'Users are assigned roles, and roles are granted permissions. Users never get permissions directly.' },
    { q: 'Why check permissions rather than role names in code?', a: 'Roles change names and meaning. Permissions describe what the code needs, so only the role mapping changes.' },
    { q: 'What is a role hierarchy?', a: 'Roles that inherit from one another, so a senior role includes everything junior roles can do.' },
    { q: 'What is role explosion?', a: 'Roles multiplying because every combination of department, region, level and exception gets its own role, until nobody understands them.' },
    { q: 'Name three places RBAC is used.', a: 'Databases (GRANT to roles), cloud IAM, Kubernetes (Roles and RoleBindings), and the Admin/Member/Guest roles of most apps.' }
  ],

  glossary: [
    { term: 'RBAC', def: 'Role-based access control: permissions are granted to roles, and users are given roles.', like: 'Hats that open doors; whoever wears the hat gets in.', aka: ['role-based access control'] },
    { term: 'Role', def: 'A named bundle of permissions, usually matching a job such as Editor or Billing Admin.', like: 'A job title.' },
    { term: 'Permission', def: 'One specific thing that may be done, often written as resource:action, like `invoice:read`.', like: 'A single line on a job description.' },
    { term: 'Role hierarchy', def: 'An arrangement where one role inherits all the permissions of the roles below it.', like: 'A manager can do everything their team can do, and more.' },
    { term: 'Role explosion', def: 'The uncontrolled growth of roles as each special case gets its own one.', like: 'A wardrobe with a separate coat for every possible weather and occasion.' }
  ],

  takeaways: [
    'RBAC: **users → roles → permissions**. Change the role, not a thousand entries.',
    'Code should ask `can(user, \'invoice:refund\')`, never `user.role === \'admin\'`.',
    'Keep roles as a few clear jobs. Roles for every exception lead to **role explosion**.',
    'Databases, cloud IAM and Kubernetes all use RBAC. It struggles when rules depend on facts.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('az-abac', {
  eli5: 'Attribute-based access control decides by looking at facts: who the user is, what the thing is, and what is happening right now, then applying written rules to those facts.',

  cards: [
    { kind: 'concept', title: 'Rules roles cannot say',
      body: `Roles are good at "doctors may read patient records". Real rules are fussier:

        - A doctor may read records, but only for patients on **her** ward.
        - An employee may open a file, but only if it is not marked **secret**.
        - A manager may approve payments, but only **below £10,000** and only **during working hours**.

        Each rule depends on a *fact* about the person, the thing or the moment. To fake that with roles you need a role for every combination: the explosion from the last lesson.

        **Attribute-based access control** (ABAC) takes the facts as direct input.` },

    { kind: 'metaphor', title: 'The bouncer with a checklist',
      body: `A nightclub bouncer does not memorise names. He runs a checklist.

        *Is the person over 18?* (a fact about **them**.) *Is the room under capacity?* (a fact about **the place**.) *Is it before 2am, and is tonight a members-only event?* (facts about **the moment**.)

        Nobody is on a list and nobody has a hat. The decision comes out of the facts, and the same rules handle thousands of people, rooms and nights.

        The metaphor stops at one point: a real bouncer improvises. A good policy never does, and is written down so it can be tested.` },

    { kind: 'diagram', title: 'Three bags of attributes',
      body: 'The decision engine takes attributes from three places, applies the policy, and returns a verdict.',
      nodes: [
        { id: 'u', label: 'User: dept, ward, clearance', icon: '🧑', x: 0, y: 0 },
        { id: 'r', label: 'Resource: owner, class', icon: '📄', x: 1, y: 0 },
        { id: 'e', label: 'Context: time, network', icon: '🕒', x: 2, y: 0 },
        { id: 'p', label: 'Policy engine', icon: '⚙️', x: 1, y: 1, tone: 'accent' },
        { id: 'd', label: 'Allow or deny', icon: '⚖️', x: 1, y: 2, tone: 'warn' }
      ],
      edges: [
        { from: 'u', to: 'p' }, { from: 'r', to: 'p' }, { from: 'e', to: 'p' }, { from: 'p', to: 'd' }
      ],
      caption: 'The same engine and rules answer every request. Only the attributes differ.' },

    { kind: 'code', title: 'A policy as plain code',
      body: 'Even an ordinary function can be an ABAC policy. Notice that there is no role and no list anywhere.',
      code: { lang: 'js', src: `
        function canOpenFile(user, file, context) {
          if (file.classification === 'secret') return false;
          if (user.department !== file.department) return false;
          if (file.classification === 'confidential'
              && context.network !== 'office') return false;
          return true;
        }

        canOpenFile(
          { department: 'finance' },
          { department: 'finance', classification: 'internal' },
          { network: 'home' });             // true`,
        notes: {
          2: 'Reads a fact about the **resource**. Secret files are shut to everyone here.',
          3: 'Compares a fact about the **user** with a fact about the **resource**. People only see their own department’s files.',
          4: 'A fact about the **context**: confidential files need the office network.',
          6: 'Notice the final `true`. A production policy should be the other way round: end in `false` and allow only on a positive rule.'
        } } },

    { kind: 'concept', title: 'Policies as code: OPA and Cedar',
      body: `Writing rules inside application code means they are scattered, hard to review and different in every service. **Policy engines** pull them out into one place, written in a dedicated language.

        Two well-known examples: **Open Policy Agent** (OPA, a CNCF project, with a language called Rego) and **Cedar** (an open-source language from AWS, behind its Verified Permissions service).

        The *idea* looks like this (made-up pseudocode, not real syntax):

        \`\`\`text
        allow if
          user.department == resource.department
          and resource.classification != "secret"
          and context.network == "office"
        \`\`\`

        Rules in a file mean they can be reviewed, versioned in git and tested like any other code.` },

    { kind: 'sequence', title: 'The app asks the engine',
      body: 'The application does not make the decision. It describes the situation and the policy engine answers.',
      actors: ['App', 'Policy engine'],
      steps: [
        { at: 0, label: 'gather the facts', note: 'The app collects attributes: the user from the token, the file from the database, the network from the request.' },
        { from: 0, to: 1, label: 'user, action, file, context', note: 'It sends them as one structured question.' },
        { at: 1, label: 'evaluate the policy', note: 'The engine applies every rule to those facts. It owns no data of its own.' },
        { from: 1, to: 0, label: 'allow / deny', dashed: true, note: 'Only a verdict comes back. The app carries it out.' },
        { note: 'Change a rule in the policy file, and every service asking the engine behaves differently, without redeploying them.' }
      ] },

    { kind: 'compare', title: 'RBAC vs ABAC',
      body: 'Neither is "better". They answer different shapes of problem, and plenty of systems use both.',
      cols: ['RBAC', 'ABAC'],
      rows: [
        ['Decides from', 'Which roles you hold', 'Facts about user, resource and context'],
        ['Strength', 'Simple, easy to explain and audit', 'Fine-grained, flexible, few moving parts'],
        ['Weakness', 'Role explosion for detailed rules', 'Harder to read; "who can see X?" is tough to answer'],
        ['Good fit', 'Job-shaped access: admin, editor, viewer', 'Rules like ward, region, amount, time or owner'],
        ['Often combined as', 'Roles for the broad strokes', 'Attributes for the exceptions']
      ] },

    { kind: 'code', title: 'Testing a policy',
      body: 'A policy is code, so it gets tests. Write the cases that must be allowed and, more importantly, the ones that must be denied.',
      code: { lang: 'js', src: `
        const cases = [
          { who: 'finance', file: 'internal',     net: 'home',   want: true  },
          { who: 'finance', file: 'secret',       net: 'office', want: false },
          { who: 'sales',   file: 'internal',     net: 'office', want: false },
          { who: 'finance', file: 'confidential', net: 'home',   want: false }
        ];

        for (const c of cases) {
          const got = canOpenFile(user(c.who), file(c.file), net(c.net));
          console.assert(got === c.want, 'wrong answer for', c);
        }`,
        notes: {
          3: 'A test for each rule that should say **no**: a secret file, the wrong department, the wrong network. Allowed cases only prove the door opens; denied cases prove it also stays shut.',
          10: 'Run on every change to the policy. Without tests, a one-character edit can silently open everything.'
        } } },

    { kind: 'pitfall', title: 'The costs of attributes',
      body: `ABAC is powerful and it bites in three places.

        - **Where do attributes come from?** If a user can edit their own "department" field, they can promote themselves. Attributes must come from a trusted source.
        - **Stale facts.** The attribute says "on duty", but the shift ended an hour ago.
        - **Hard to answer "who can access this?"** With roles you read a table. With rules you have to run the policy over every user.

        Policy engines also add something to run and keep fast. Use them where rules are truly fact-shaped, and keep it simple elsewhere. The lab that follows lets you build both kinds of rule and test them.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'Which rule is a natural fit for ABAC rather than plain RBAC?',
      options: ['Managers may approve payments only up to £10,000 and only in office hours', 'Editors may edit the documents in their workspace', 'Admins may delete user accounts in the system', 'Viewers may read the shared dashboards'],
      answer: 0,
      why: [null, 'That is a straightforward role-to-permission mapping.', 'A role grants this directly.', 'Also a plain role-to-permission case.'],
      explain: 'The first rule depends on facts: the amount and the time. Those cannot be written down in a role without making one for every amount and hour.' },

    { type: 'bucket', after: 3, prompt: 'In an ABAC decision, is each fact about the user, the resource, or the context?', buckets: ['User', 'Resource', 'Context'],
      items: [['Her department is Finance', 0], ['The file is marked confidential', 1], ['The request comes from the office network', 2], ['It is 3am', 2], ['He holds security clearance level 2', 0], ['The record belongs to ward 7', 1], ['The document’s owner is Maya', 1], ['The device is a managed laptop', 2]],
      explain: 'User attributes describe who is asking. Resource attributes describe the thing. Context attributes describe the situation of this particular request, such as time, place and device.' },

    { type: 'tf', statement: 'A good test suite for an access policy checks only that allowed people get in.', answer: false,
      explain: 'The damaging bugs are the ones that let the wrong people in. Negative tests (secret file, wrong department, wrong network) prove the policy stays closed when it should.' },

    { type: 'spot', prompt: 'This ward-based rule has an operator-precedence bug that lets far too many people in. Tap the line that opens the hole.',
      code: { lang: 'js', src: `
        function canView(user, record) {
          return user.role === 'doctor'
              && record.ward === user.ward
              || user.onCall;
        }` },
      lines: [4],
      explain: '`&&` binds tighter than `||`, so this reads "(doctor and same ward) or on-call". Any on-call user, doctor or not, on any ward, sees every record. Parentheses and tests would have caught it.' },

    { type: 'match', prompt: 'Match each name to what it is.',
      pairs: [['ABAC', 'Access decided from attributes of user, resource and context'], ['Open Policy Agent', 'A general-purpose policy engine; its language is Rego'], ['Cedar', 'An open-source policy language from AWS'], ['Policy as code', 'Rules kept in reviewable, testable files']],
      explain: 'ABAC is the model. OPA and Cedar are tools for expressing and evaluating such rules, and "policy as code" is the habit of treating rules like any other source code.' },

    { type: 'ab', q: 'Which policy is safer to run in production?',
      a: { lang: 'text', label: 'Allow unless a rule denies', src: `
        deny if resource.classification == "secret"
        allow otherwise` },
      b: { lang: 'text', label: 'Deny unless a rule allows', src: `
        allow if user.department == resource.department
          and resource.classification != "secret"
        deny otherwise` },
      answer: 'b',
      explain: 'The second can only open the door when a rule has said so. The first lets in everything nobody thought to forbid, such as a new classification label added next year.' },

    { type: 'multi', q: 'Which of these are real risks when building ABAC?',
      options: ['Users editing their own attributes to grant themselves access', 'Attributes going stale, such as "on duty" after a shift ends', 'It being harder to answer "who can open this file?"', 'ABAC cannot express rules about time or location', 'Policies cannot be tested'],
      answers: [0, 1, 2],
      explain: 'Attributes must come from a trusted, current source, and rule-based decisions are harder to audit in reverse. But ABAC handles time and place easily, and policies are very testable.' },

    { type: 'cloze', text: 'ABAC decides using attributes of the {{user}}, the {{resource}} and the {{context}}, applying a written {{policy}}.',
      distractors: ['password', 'database', 'browser'],
      explain: 'The three bags of facts go into the policy, which is the rulebook that produces allow or deny.' },

    { type: 'scenario', title: 'Rules for a bank',
      intro: 'You are designing access for a bank’s internal payments tool. Staff approve transfers. Fraud is a real threat, and so is a tool so strict that staff cannot work.',
      meters: { 'fraud protection': 50, 'staff can work': 60 },
      steps: [
        { text: 'A role "Payments Approver" exists. How do you handle the limit on how much each approver may approve?',
          choices: [
            { label: 'A rule using attributes: approver’s limit versus the amount of the transfer', score: 2, effects: { 'fraud protection': 20, 'staff can work': 10 }, feedback: 'One rule covers every limit. Change an approver’s limit and nothing else changes. That is what attributes are for.' },
            { label: 'A role per limit: Approver-1k, Approver-5k, Approver-10k, and so on', score: 1, effects: { 'fraud protection': 10, 'staff can work': -10 }, feedback: 'Works, and it is the explosion again. Add currencies and regions and it spirals.' },
            { label: 'Trust staff to stay within their limit', score: 0, effects: { 'fraud protection': -25, 'staff can work': 10 }, feedback: 'Policies exist for the day somebody is careless, or compromised.' }
          ] },
        { text: 'A fraud analyst notes that stolen staff credentials are used from home laptops at 3am. What do you add?',
          choices: [
            { label: 'Context rules: managed device, expected hours, or an extra check for large transfers outside them', score: 2, effects: { 'fraud protection': 20, 'staff can work': -5 }, feedback: 'Context is the part RBAC cannot see. Unusual time and device raise the bar without blocking normal days.' },
            { label: 'Block approvals completely outside office hours', score: 1, effects: { 'fraud protection': 15, 'staff can work': -20 }, feedback: 'Safe and rigid. The overnight team in another time zone can no longer work. A step-up check is kinder than a wall.' },
            { label: 'Ask users to choose stronger passwords', score: 0, effects: { 'fraud protection': -5 }, feedback: 'Good hygiene, but the attacker already has valid credentials. The question is whether this *request* looks right.' }
          ] },
        { text: 'You are about to change a rule. How do you protect against opening a hole by accident?',
          choices: [
            { label: 'Keep policies in version control with tests, including cases that must be denied, and run them on every change', score: 2, effects: { 'fraud protection': 20, 'staff can work': 5 }, feedback: 'Policy as code means a bad edit is caught in review and by tests, not in a fraud report.' },
            { label: 'Edit the live rule and watch for complaints', score: 0, effects: { 'fraud protection': -25 }, feedback: 'Complaints arrive when rules are too strict. Rules that are too loose arrive as breaches, much later.' },
            { label: 'Never change rules once written', score: 1, effects: { 'fraud protection': -5, 'staff can work': -15 }, feedback: 'The business changes, so rules must too. The safe approach is changing them with tests.' }
          ] }
      ],
      outro: 'The pattern to remember: **attributes for limits and context, tests for every rule, and keep policies where they can be reviewed.**' },

    { type: 'explain', prompt: 'Explain ABAC and when you would pick it over RBAC.',
      model: 'ABAC decides using attributes of the user, the resource and the context (time, network), applying written policies, often in a policy engine like OPA or Cedar. I would choose it when rules depend on facts such as department, owner, amount or time, which roles would need explosive numbers of roles to express. Policies should be tested, and attributes must come from a trusted source.',
      keywords: ['attributes', 'user', 'resource', 'context', 'policy', 'roles', 'test'] }
  ],

  flashcards: [
    { q: 'What does ABAC decide from?', a: 'Attributes (facts) of the user, the resource and the context, evaluated against policies.' },
    { q: 'Name two policy engines or languages.', a: 'Open Policy Agent (language: Rego) and Cedar from AWS.' },
    { q: 'When do you choose ABAC over RBAC?', a: 'When rules depend on facts such as ward, department, owner, amount or time that would need a role for each combination.' },
    { q: 'Why test access policies, and which tests matter most?', a: 'A small edit can open access for everyone. Negative tests (cases that must be denied) matter most.' },
    { q: 'What are the main risks of ABAC?', a: 'Untrusted or stale attributes, and it being harder to answer "who can access this?".' }
  ],

  glossary: [
    { term: 'ABAC', def: 'Attribute-based access control: decisions come from attributes of the user, the resource and the context, applied to policies.', like: 'A bouncer with a checklist instead of a guest list.', aka: ['attribute-based access control'] },
    { term: 'Attribute', def: 'A fact used in a decision, such as department, classification, time of day or network.', like: 'One tick-box on the bouncer’s checklist.' },
    { term: 'Policy engine', def: 'A component that evaluates written rules against a request’s facts and returns allow or deny.', like: 'A referee with the rulebook open.' },
    { term: 'Policy as code', def: 'Keeping access rules in versioned, reviewed and tested files, like source code.', like: 'The rulebook is in git, not in someone’s head.' },
    { term: 'Open Policy Agent', def: 'An open-source, general-purpose policy engine whose rules are written in the Rego language.', aka: ['OPA'] },
    { term: 'Cedar', def: 'An open-source policy language created by AWS for writing and evaluating authorization rules.' }
  ],

  takeaways: [
    '**ABAC** decides from facts about the user, the resource and the context, using written policies.',
    'It fits rules like ward, department, amount and time that make roles explode.',
    'Policy engines (OPA with Rego, Cedar) keep rules in one reviewable, testable place.',
    'Test the denials, trust only reliable attributes, and keep roles for the broad strokes.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('az-rebac', {
  eli5: 'Relationship-based access means you can open something because of how you are connected to it: you own it, you are on the team that owns it, or it sits inside a folder you can open.',

  cards: [
    { kind: 'concept', title: '“Why can Priya see this?”',
      body: `Priya opens a budget spreadsheet she has never been sent. Nobody added her to its list. She holds no special role.

        She can open it because the spreadsheet lives in the **Q3 folder**, the Q3 folder is shared with the **Finance team**, and Priya is a **member** of Finance.

        Three links in a chain. Take away any one (move the file, unshare the folder, remove Priya from the team) and the access vanishes by itself.

        **Relationship-based access control** (ReBAC) makes that chain the rule: permissions are *derived from how things are connected*.` },

    { kind: 'metaphor', title: 'The family tree at the door',
      body: `Imagine a village where the rule at every house is simple: *"Family may come in."*

        The door never has a list. It asks: are you the owner's sibling? Their child? Married to one of them? The answer comes from walking the family tree.

        When someone is born, marries or moves out, the tree changes and every door in the village updates at once, with nobody editing a single guest list.

        Where the metaphor stops: software relationships are not just family. They are "owner of", "member of", "inside", "assigned to", whatever your product needs.` },

    { kind: 'diagram', title: 'A chain of relationships',
      body: 'Follow the arrows from Priya to the document. If you can walk there, the permission follows.',
      nodes: [
        { id: 'u', label: 'Priya', icon: '🧑', x: 1, y: 0 },
        { id: 't', label: 'Team: Finance', icon: '👥', x: 1, y: 1, tone: 'accent' },
        { id: 'f', label: 'Folder: Q3', icon: '📁', x: 1, y: 2, tone: 'accent' },
        { id: 'd', label: 'Doc: Budget', icon: '📊', x: 1, y: 3, tone: 'good' }
      ],
      edges: [
        { from: 'u', to: 't', label: 'is member of' },
        { from: 't', to: 'f', label: 'can view' },
        { from: 'f', to: 'd', label: 'contains' }
      ],
      caption: 'Nothing here mentions the document and Priya together. The access is inferred from the chain.' },

    { kind: 'code', title: 'Relationships as plain data',
      body: 'A ReBAC system stores simple facts, and a check is a walk through them.',
      code: { lang: 'js', src: `
        const edges = [
          { from: 'user:priya',   rel: 'member', to: 'team:finance' },
          { from: 'team:finance', rel: 'viewer', to: 'folder:q3' },
          { from: 'folder:q3',    rel: 'parent', to: 'doc:budget' }
        ];

        function canView(user, obj) {
          if (has(user, 'viewer', obj)) return true;
          for (const team of teamsOf(user))
            if (has(team, 'viewer', obj)) return true;
          const folder = parentOf(obj);
          return folder ? canView(user, folder) : false;
        }
        // has(), teamsOf() and parentOf() just search the edges`,
        notes: {
          2: 'A fact: Priya is a member of the Finance team.',
          3: 'Another: the team can view the Q3 folder. Granting a whole team is one fact, not twenty.',
          4: 'And: the folder is the parent of the document.',
          9: 'Does one of the user’s teams hold access to this object? This is how team sharing works.',
          11: 'If not, ask the same question of the **parent folder**. Access flows down the tree, and the walk ends in `false` if nothing matches: default deny again.'
        } } },

    { kind: 'history', title: 'Zanzibar: Google’s answer',
      body: `Google had to answer "may this person open this?" for products like Drive and YouTube: billions of objects, shared in every pattern imaginable, with answers needed in milliseconds.

        In 2019 they published a paper describing the system they built, called **Zanzibar**. Its core idea is the one you just saw: store **relationship facts** (object, relation, user) and *compute* access by following them, including through groups and parent folders.

        It also cares that removing access takes effect quickly and correctly, so an ex-colleague cannot see a document you edited a moment after removing them.

        Open-source systems inspired by it include **OpenFGA** and **SpiceDB**. Most teams adopt one of those rather than building their own.` },

    { kind: 'steps', title: 'Modelling a sharing feature',
      body: 'You model ReBAC by describing your product’s world once, then letting the rules do the walking.',
      steps: [
        { title: 'List your object types', body: 'For a document app: `user`, `team`, `folder`, `document`.' },
        { title: 'Name the relations', body: 'Things like `owner`, `member`, `parent`, `viewer`, `editor`. These are the arrows.' },
        { title: 'Write how permissions derive', body: '"A user can view a document if they are its viewer, **or** a viewer of its parent folder." One rule, applied everywhere.' },
        { title: 'Record facts as things happen', body: 'Uploading a file writes a `parent` fact. Joining a team writes a `member` fact. Sharing writes a `viewer` fact.' },
        { title: 'Ask questions', body: 'The check, "can Priya view Budget?", and the reverse, "which documents can Priya view?", both come from the same facts.' }
      ] },

    { kind: 'compare', title: 'When ReBAC beats RBAC',
      body: 'Roles are about the kind of person you are. Relationships are about how you connect to **this particular thing**.',
      cols: ['RBAC', 'ReBAC'],
      rows: [
        ['Question', 'What job do you hold?', 'How are you connected to this object?'],
        ['Natural fit', 'Admin, editor, auditor across the product', 'Owner of this file, member of this project'],
        ['Per-object access', 'Needs a role per object, which explodes', 'Built in: facts attach to the object'],
        ['Nesting', 'Awkward', 'Natural: folders in folders, teams in teams'],
        ['Setup', 'Two tables', 'A model, a store of facts, often a separate service']
      ] },

    { kind: 'pitfall', title: 'Where ReBAC bites',
      body: `ReBAC is not free.

        - **Keep facts in sync.** If the app deletes a project but the relationship facts stay, a ghost grant might apply to a recycled id. Every change in your data must write or remove the right fact.
        - **Deep trees cost time.** Walking ten levels of folders per check is slow unless the system is built for it. This is exactly what Zanzibar-style engines optimise.
        - **Modelling takes thought.** Inheriting from a parent is wonderful until someone wants "this one file is private". Decide how exceptions work before you ship.

        Use roles for broad job-shaped access, and relationships for sharing, ownership and nesting. Many products use both.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'Priya can open a document nobody shared with her personally. Which explanation fits ReBAC?',
      options: ['She is a member of a team that has access to the folder containing it', 'Her role is "document viewer", which covers every document', 'Her name is on the document’s access list', 'Her token carries a scope called documents'],
      answer: 0,
      why: [null, 'That is RBAC: a role granting a permission everywhere, with no link to this document.', 'A list on the document is an ACL, not a relationship chain.', 'Scopes limit what an app may do. They do not explain why *she* has access.'],
      explain: 'ReBAC derives access by walking relationships: user, team, folder, document. Break any link and the access disappears.' },

    { type: 'order', after: 3, prompt: 'Put the walk in order, starting from the question “can Priya view Budget?”',
      items: ['Check whether Priya is directly a viewer of Budget', 'See that she is a member of the Finance team', 'See that Finance can view the Q3 folder', 'See that Q3 is the parent of Budget', 'Conclude: yes, she can view it'],
      explain: 'Direct access is checked first. Then the check follows team membership and the folder link. When the chain reaches the document, access is granted.' },

    { type: 'tf', statement: 'In a ReBAC system, moving a document into a different folder can change who may open it, without anyone editing a list.', answer: true,
      explain: 'The document’s `parent` fact changes, so the chain that grants access changes with it. That is the main convenience of derived permissions.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [['Relation', 'A named link, such as member, owner or parent'], ['Zanzibar', 'The 2019 Google paper behind modern ReBAC systems'], ['OpenFGA / SpiceDB', 'Open-source systems inspired by Zanzibar'], ['Inheritance', 'Access flowing from a parent object to what it contains']],
      explain: 'Relations are the arrows; Zanzibar is the origin story; OpenFGA and SpiceDB are the tools you can actually adopt.' },

    { type: 'bucket', prompt: 'Is each requirement a better fit for roles (RBAC) or relationships (ReBAC)?', buckets: ['Roles', 'Relationships'],
      items: [['Support agents can issue refunds', 0], ['Anyone in a project’s team can edit its files', 1], ['Auditors can read all reports', 0], ['A folder’s contents inherit the folder’s sharing', 1], ['Admins can manage billing', 0], ['The person who created a doc is its owner', 1]],
      explain: 'Roles suit job-shaped abilities that apply across the product. Relationships suit "this person and this thing" cases: ownership, membership and nesting.' },

    { type: 'ab', q: 'A project has 400 files and a team of 12. Which design for “the team can view the project’s files” is easier to keep correct?',
      a: { lang: 'text', label: 'Per-file entries', src: `
        file-001: viewer maya, sam, priya ...
        file-002: viewer maya, sam, priya ...
        ... (400 files × 12 people)` },
      b: { lang: 'text', label: 'Relationships', src: `
        team:project member maya, sam, priya ...
        team:project viewer project-folder
        file-001 parent project-folder   (and so on)` },
      answer: 'b',
      explain: 'With relationships, joining the team or moving a file is one change and every dependent decision follows. Per-file entries need thousands of updates, and any missed one is a gap or a leak.' },

    { type: 'cloze', text: 'In ReBAC, permissions are {{derived}} from {{relationships}} such as owner, member and {{parent}}. Google’s {{Zanzibar}} paper described the approach at huge scale.',
      distractors: ['copied', 'tokens', 'cookies'],
      explain: 'You do not store every permission. You store the facts and compute the answer by following them.' },

    { type: 'multi', q: 'Which are real challenges when adopting ReBAC?',
      options: ['Keeping relationship facts in sync with the app’s data', 'Checks that walk very deep trees can be slow without optimisation', 'Deciding how to let one item opt out of its folder’s sharing', 'It cannot express team membership', 'It prevents you from answering "what can this user access?"'],
      answers: [0, 1, 2],
      explain: 'Sync, depth and exceptions are the real work. ReBAC handles teams very naturally, and because it stores facts it is actually *good* at the reverse question.' },

    { type: 'scenario', title: 'Sharing for Docshare, round two',
      intro: 'Docshare’s customers want folders, teams and "shared with me". Per-document lists are creaking. You are redesigning sharing with relationships.',
      meters: { 'easy to manage': 50, safety: 60 },
      steps: [
        { text: 'A manager shares a folder with the Design team. What should happen to the 300 documents inside?',
          choices: [
            { label: 'Nothing is copied: documents inherit access through their parent folder link', score: 2, effects: { 'easy to manage': 25, safety: 10 }, feedback: 'One fact grants access to everything under the folder, and files added later are covered automatically.' },
            { label: 'Write 300 entries, one per document', score: 1, effects: { 'easy to manage': -15, safety: 0 }, feedback: 'It works today. Next week’s new files are not covered, and unsharing needs 300 deletions.' },
            { label: 'Email the team the links instead', score: 0, effects: { 'easy to manage': -10, safety: -20 }, feedback: 'Links forwarded in email are not access control. You have lost track of who has them.' }
          ] },
        { text: 'A designer leaves the Design team. What do you do?',
          choices: [
            { label: 'Remove the single "member of Design" fact', score: 2, effects: { 'easy to manage': 20, safety: 20 }, feedback: 'Every access that flowed through that membership disappears together, which is exactly what you want.' },
            { label: 'Find every document she has opened and remove her by hand', score: 0, effects: { 'easy to manage': -20, safety: 5 }, feedback: 'You would miss some, and it fights the design. The point of derived permissions is to avoid this.' },
            { label: 'Leave her in; she probably will not use it', score: 0, effects: { safety: -25 }, feedback: 'Former staff with access is a classic breach. Revoke on the day.' }
          ] },
        { text: 'One document in the shared folder is a sensitive HR letter that only two people should read. How should the model handle it?',
          choices: [
            { label: 'Give the model an explicit way to stop inheritance for that document, with its own owners', score: 2, effects: { 'easy to manage': 5, safety: 25 }, feedback: 'Exceptions are the hard part of inheritance, so design them deliberately and test them. Silent inheritance would have exposed the letter.' },
            { label: 'Leave it in the folder and ask people not to open it', score: 0, effects: { safety: -30 }, feedback: 'Politeness is not a permission model.' },
            { label: 'Remove inheritance from everything', score: 1, effects: { 'easy to manage': -25, safety: 10 }, feedback: 'Safe, and you have thrown away the feature that made sharing manageable.' }
          ] }
      ],
      outro: 'The pattern to remember: **grant to groups and folders, let access flow down, and plan the exceptions.**' },

    { type: 'explain', prompt: 'Explain how ReBAC works using a folder, a team and a document, and why it beats a role for “shared with me”.',
      model: 'ReBAC stores relationships such as "Priya is a member of Finance", "Finance can view the Q3 folder" and "the Q3 folder contains Budget", and derives access by following that chain. Moving a file or leaving the team changes access without editing lists. A role would need one role per folder or document, which explodes, whereas relationships attach to the object.',
      keywords: ['relationship', 'member', 'folder', 'parent', 'derived', 'chain', 'role per'] }
  ],

  flashcards: [
    { q: 'What is ReBAC?', a: 'Relationship-based access control: permissions are derived from relationships between users and objects, like owner, member and parent folder.' },
    { q: 'What is Zanzibar?', a: 'Google’s authorization system, described in a 2019 paper: it stores relationship facts and computes access by following them.' },
    { q: 'Name two open-source ReBAC systems.', a: 'OpenFGA and SpiceDB, both inspired by Zanzibar.' },
    { q: 'When does ReBAC beat RBAC?', a: 'When access depends on how someone connects to a specific object: sharing, ownership, teams and folder nesting.' },
    { q: 'What must you keep in sync with ReBAC?', a: 'The relationship facts and your real data. Stale or missing facts silently grant or deny access.' }
  ],

  glossary: [
    { term: 'ReBAC', def: 'Relationship-based access control: access is computed from relationships such as owner, member and parent.', like: 'The village door that asks only whether you are family.', aka: ['relationship-based access control'] },
    { term: 'Relation', def: 'A named link between two things in the model, such as member, owner or parent.', like: 'One arrow on the family tree.' },
    { term: 'Inheritance', def: 'Access flowing from a container, like a folder or team, to what is inside it.', like: 'A building pass that opens every room on the floor.' },
    { term: 'Zanzibar', def: 'Google’s global authorization system, published in 2019, that influenced later open-source tools.', like: 'The blueprint other projects copied.' }
  ],

  takeaways: [
    '**ReBAC** derives access from relationships: member of, parent of, owner of.',
    'Store simple facts, then answer questions by walking them. Change a fact and the access follows.',
    'It beats roles for folders, teams and "shared with me". **Zanzibar** is the origin; OpenFGA and SpiceDB are descendants.',
    'Keep facts in sync, and design inheritance exceptions on purpose.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('az-scopes-claims', {
  eli5: 'A token is a permission slip an app carries. The slip can only allow things you could do anyway, and only the things you agreed it could do.',

  cards: [
    { kind: 'concept', title: 'The photo-printing app',
      body: `You use a photo-printing app and tap "Connect to my cloud storage". Does it now have everything *you* can do there: delete your files, read your invoices, share your folders?

        It should not. You asked for printing, so the app should be able to *read photos* and nothing else.

        That is the job of **scopes**. When an app gets access on your behalf (the [[OAuth|oauth]] flow from the authentication module), it receives a **token**, and the token lists what that app may do. The list is called its scopes, for example \`photos.read\`.

        So there are two different questions: what may the *user* do, and what may this *token* do?` },

    { kind: 'metaphor', title: 'The permission slip',
      body: `You write a note for your cleaner: *"Please collect my parcel from the post office."*

        The note only works for what it says. The cleaner cannot use it to open your safe, even though you can. And it only works for things *you* are allowed to do: you cannot write a note authorising a collection from someone else’s postbox.

        So the cleaner can do **only what the note says AND only what you could do yourself**.

        A token is the note. The scopes are what is written on it. The user’s own permissions are what limit what you could sign for in the first place.` },

    { kind: 'diagram', title: 'Effective permission is an intersection',
      body: 'The app can do something only when **both** circles allow it.',
      nodes: [
        { id: 'u', label: 'What Maya may do', icon: '🧑', x: 0, y: 0 },
        { id: 't', label: 'What the token’s scopes allow', icon: '🎟️', x: 2, y: 0 },
        { id: 'e', label: 'What the app can actually do', icon: '✅', x: 1, y: 1, tone: 'good' }
      ],
      edges: [
        { from: 'u', to: 'e', label: 'AND' }, { from: 't', to: 'e', label: 'AND' }
      ],
      caption: 'If either side says no, the answer is no.' },

    { kind: 'example', title: 'Both limits at work',
      body: `Maya can read, write and delete her files. She approves a printing app that asks for \`files.read\`.

        | Action | Maya | Token scope | Result |
        |---|---|---|---|
        | read a photo | yes | yes | **allowed** |
        | delete a photo | yes | no | **denied** |

        Now a different app is granted \`files.delete\`, but it acts for Sam, who has only read access.

        | Action | Sam | Token scope | Result |
        |---|---|---|---|
        | delete a photo | no | yes | **denied** |

        A scope can **narrow** what a user could do. It can never **widen** it.` },

    { kind: 'code', title: 'What is inside a token',
      body: 'Tokens often carry **claims**: statements about who this is and what was granted. Here is the decoded payload of a typical access token. Tap a line.',
      code: { lang: 'json', src: `
        {
          "iss": "https://login.example.com",
          "sub": "user-4411",
          "aud": "https://api.example.com",
          "scope": "photos.read",
          "role": "editor",
          "exp": 1767225600
        }`,
        notes: {
          2: '**Issuer**: who created and signed the token. Your API should only trust the issuers it expects.',
          3: '**Subject**: who the token is about, the user.',
          4: '**Audience**: which API this token is meant for. The next card is about why it matters.',
          5: '**Scopes**: what the *app* may do with this token.',
          6: 'A **claim** about the user, copied in when the token was issued. Remember this when we get to stale tokens.',
          7: '**Expiry**: after this moment the token is dead. Short lifetimes limit damage.'
        } } },

    { kind: 'concept', title: 'Check the audience',
      body: `A token is made *for* a particular service, and says so in its \`aud\` claim.

        Without this check, a token issued to access your **photo** API could be replayed at your **billing** API. The signature is valid (your own login server really did sign it), the user is real, and billing wonders no further.

        The rule for every API: after checking the signature and expiry, check that **you are the audience**. If the token says it is for someone else, refuse it, however genuine it looks.

        A hotel key card is signed by the hotel, yet it does not open the neighbouring hotel. Audience is the "which building" part.` },

    { kind: 'story', title: 'The token that outlived the job',
      body: `At 9:00 Dana is made an admin, and her login produces a token containing \`"role": "admin"\`. It lasts an hour.

        At 9:20 she is demoted back to a regular user after a change of team. Her token still says admin, and the API trusts what it carries. Until 10:00 she has admin powers she is no longer entitled to.

        Claims are a **snapshot taken at login**. They go stale.

        The defences: keep access tokens **short-lived** (minutes), re-check sensitive things against the live source of truth, and support **revocation** (a list of cancelled tokens, or asking the issuing server whether a token is still good) for the cases where an hour is too long.` },

    { kind: 'sequence', title: 'The confused deputy',
      body: 'A **deputy** is a program that has real power and acts on others’ requests. It becomes *confused* when it uses its own power for a request the requester could never make themselves.',
      actors: ['Attacker', 'Print service', 'File storage'],
      steps: [
        { from: 0, to: 1, label: 'print /secrets/payroll.csv', note: 'The attacker can use the print service, but has no rights to the payroll folder.' },
        { at: 1, label: 'use my own service key', note: 'The print service is trusted by storage and can read anything. It uses *its own* credentials.' },
        { from: 1, to: 2, label: 'read /secrets/payroll.csv', note: 'Storage sees a request from a powerful, trusted service and approves.' },
        { from: 2, to: 1, label: 'file contents', dashed: true, note: 'The deputy fetches data it should never have fetched for this caller.' },
        { from: 1, to: 0, label: 'printed copy', dashed: true, note: 'The attacker never touched storage. They simply asked a deputy that had the power.' },
        { note: 'The fix: the deputy must act with the *caller’s* authority (pass their token along), or check that the caller may access the file before using its own powers.' }
      ] },

    { kind: 'tip', title: 'A checklist for every incoming token',
      body: `When your API receives a token, check these in order:

        1. **Signature** is valid and the **issuer** is one you trust.
        2. It has not **expired**.
        3. The **audience** is you.
        4. The **scope** covers the action being attempted.
        5. The **user** behind it is actually allowed to do this to *this* resource (scopes alone are never enough).
        6. For sensitive actions, confirm facts that may have gone **stale** against the live source.

        Skipping step 5 is the usual shortcut, and the one attackers look for.` }
  ],

  activities: [
    { type: 'mcq', after: 3, q: 'A token has the scope `files.delete`, but the user it acts for may only read files. What happens when the app tries to delete?',
      options: ['It is denied, because the user cannot delete files', 'It is allowed, because the token says delete', 'It is allowed, because scopes override user permissions', 'It is allowed once, then the scope is removed'],
      answer: 0,
      why: [null, 'A token is a note written on the user’s behalf. It cannot grant more than the user holds.', 'Scopes narrow access; they never widen it.', 'Nothing in OAuth works like a one-time override.'],
      explain: 'The effective permission is the intersection of the token’s scopes and the user’s own permissions. If either says no, the answer is no.' },

    { type: 'match', after: 4, prompt: 'Match each token claim to what it tells you.',
      pairs: [['iss', 'Who issued and signed the token'], ['sub', 'Who the token is about'], ['aud', 'Which service the token is meant for'], ['exp', 'When the token stops being valid']],
      explain: 'These four are checked on almost every request: trust the issuer, know the subject, make sure you are the audience, and reject expired tokens.' },

    { type: 'tf', after: 5, statement: 'If a token has a valid signature, an API can safely accept it without checking the audience.', answer: false,
      explain: 'A valid signature only proves the token is genuine. A genuine token meant for another service could otherwise be replayed against yours.' },

    { type: 'spot', prompt: 'This handler checks the token carefully but is missing something important. Tap the line that acts without a needed check.',
      code: { lang: 'js', src: `
        function handle(req) {
          const token = verify(req.token);
          if (!token.scope.includes('files:read')) return deny();
          return readFile(req.query.path);
        }` },
      lines: [4],
      explain: 'The scope allows the *app* to read files, but nothing checks whether this *user* may read that path, and the audience is never checked either. Anyone who obtains a token could ask for any path.' },

    { type: 'multi', q: 'Which checks should an API perform on an incoming access token?',
      options: ['The signature is valid and the issuer is trusted', 'The audience names this API', 'The token has not expired', 'The user is allowed to act on this specific resource', 'The token is long enough to be secure'],
      answers: [0, 1, 2, 3],
      explain: 'Those four cover who made it, who it is for, whether it is still alive, and whether the user is permitted. Length is not something you check on each request.' },

    { type: 'ab', q: 'Which token design limits the damage of a stolen token better?',
      a: { lang: 'json', label: 'Short and narrow', src: `
        { "scope": "photos.read",
          "exp": "in 10 minutes" }` },
      b: { lang: 'json', label: 'Long and broad', src: `
        { "scope": "everything",
          "exp": "in 1 year" }` },
      answer: 'a',
      explain: 'A thief can only do what the scopes allow, and only until the token expires. Narrow scopes and short lifetimes keep both limits small.' },

    { type: 'order', prompt: 'Put the token checks in a sensible order.',
      items: ['Verify the signature and trusted issuer', 'Check it has not expired', 'Check the audience is this API', 'Check the scope covers the action', 'Check the user may act on this resource'],
      explain: 'First make sure the token is genuine, current and meant for you. Only then ask what it permits, and finally whether the user may touch this object.' },

    { type: 'scenario', title: 'The report exporter',
      intro: 'Your company has a **Reports API** and a small **Exporter** service that turns reports into PDFs. The Exporter holds a powerful service key so it can read any report. Customers upload nothing; they just click "Export".',
      meters: { 'data safety': 50, 'works for users': 60 },
      steps: [
        { text: 'A tester shows that by changing the report id in the export request, they got another customer’s report as a PDF. Why did it work?',
          choices: [
            { label: 'The Exporter used its own powerful key and never checked the caller’s rights: a confused deputy', score: 2, effects: { 'data safety': 10 }, feedback: 'Exactly. Reports trusted the Exporter, and the Exporter trusted whatever id it was handed.' },
            { label: 'The PDF library has a bug', score: 0, effects: { 'data safety': -10 }, feedback: 'Libraries can have bugs, but nothing here needs one. The problem is whose authority is being used.' },
            { label: 'The customer’s password was weak', score: 0, effects: { 'data safety': -10 }, feedback: 'The tester was logged in as themselves. Their password was irrelevant.' }
          ] },
        { text: 'How do you fix it?',
          choices: [
            { label: 'The Exporter calls the Reports API with the **user’s** token, so Reports checks the user’s rights', score: 2, effects: { 'data safety': 30, 'works for users': 5 }, feedback: 'Now the deputy has no power of its own to misuse: it can only get what the caller could already get.' },
            { label: 'Hide the report id in the page so users cannot change it', score: 0, effects: { 'data safety': -5 }, feedback: 'Requests can be edited with any tool. Hiding is not checking.' },
            { label: 'Have the Exporter check the user’s access to each report before using its own key', score: 1, effects: { 'data safety': 20 }, feedback: 'This works too, but now the Exporter duplicates the rules and must stay in step with them. Passing the user’s authority is cleaner.' }
          ] },
        { text: 'The Reports API also receives tokens from the company’s Chat bot, issued for the Chat API. How should Reports treat them?',
          choices: [
            { label: 'Reject them: the audience is not the Reports API', score: 2, effects: { 'data safety': 20 }, feedback: 'A genuine token for a different service is still not for you. The audience check stops replay across services.' },
            { label: 'Accept them: they carry a valid signature from our own login server', score: 0, effects: { 'data safety': -25 }, feedback: 'Anyone who can obtain a Chat token could now call Reports. Genuine is not the same as intended for this service.' },
            { label: 'Accept them, but only for read requests', score: 1, effects: { 'data safety': -10 }, feedback: 'Narrower, but reading reports is the danger already. Reject by audience first.' }
          ] }
      ],
      outro: 'The pattern to remember: **act with the caller’s authority, check the audience, and never treat a valid signature as permission.**' },

    { type: 'explain', prompt: 'Explain the difference between an OAuth scope and a user’s own permissions, and what the effective permission is.',
      model: 'A scope limits what a particular token, meaning an app acting for the user, may do. The user’s permissions limit what the user may do anyway. The effective permission is the intersection: the app can do something only if both the scope and the user allow it. Scopes can narrow access but never widen it.',
      keywords: ['scope', 'token', 'user', 'permission', 'intersection', 'narrow', 'both'] }
  ],

  flashcards: [
    { q: 'What is an OAuth scope?', a: 'A named limit on what a token (an app acting for a user) may do, such as photos.read.' },
    { q: 'What is the effective permission of an app acting for a user?', a: 'The intersection: only what both the token’s scopes and the user’s own permissions allow.' },
    { q: 'Why check the `aud` claim?', a: 'To make sure the token was issued for this API, so a genuine token for another service cannot be replayed here.' },
    { q: 'Why do claims go stale, and what helps?', a: 'They are a snapshot from when the token was issued. Short lifetimes, re-checking live data and revocation help.' },
    { q: 'What is a confused deputy?', a: 'A service with real power that is tricked into using it for a caller who has no such right. Fix it by using the caller’s authority.' }
  ],

  glossary: [
    { term: 'Scope', def: 'A named permission attached to a token that limits what the app holding it may do.', like: 'What is written on the permission slip.' },
    { term: 'Claim', def: 'A statement carried inside a token, such as who the user is, who issued it or what role they had.', like: 'A line printed on the pass.' },
    { term: 'Audience', def: 'The service a token is intended for, recorded in its `aud` claim.', like: 'Which building a key card opens.', aka: ['aud'] },
    { term: 'Token revocation', def: 'Cancelling a token before it expires, for example by keeping a list of cancelled tokens.', like: 'Reporting a key card lost so the lock refuses it.' },
    { term: 'Confused deputy', def: 'A privileged program that is tricked into misusing its authority on behalf of someone who lacks it.', like: 'A bank clerk with the vault key who opens it for anyone who asks nicely.' }
  ],

  takeaways: [
    'Scopes limit the **token** (the app). User permissions limit the **person**. The app gets the **intersection**.',
    'Claims are a snapshot: keep tokens short-lived and re-check sensitive facts.',
    'Always check the **audience**. A genuine signature does not mean the token is for you.',
    'A **confused deputy** misuses its own power. Make services act with the caller’s authority.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('az-enforcement', {
  eli5: 'You can check permissions at the front gate, at the door of the room, or on the filing cabinet itself. Good systems check at more than one, because each place knows different things.',

  cards: [
    { kind: 'concept', title: 'Who stands guard?',
      body: `You have decided your rules: roles, attributes, relationships. Now a more practical question: **where in the system does the code that applies them actually run?**

        A request travels a long way. It crosses the internet, passes a gateway, reaches a service, and finally touches a database. Any of those can say no.

        Put the check in the wrong place, or only in one place, and you get gaps. Put it in many places carelessly and you get five slightly different rulebooks.

        This lesson is about choosing where the guards stand.` },

    { kind: 'metaphor', title: 'Gate, room and filing cabinet',
      body: `Think of a company HQ.

        The **gate** guard checks you have a pass and are going to a floor you are allowed on. Quick and broad, but he knows nothing about individual projects.

        The **department head** in each room knows the business: "Interns can read these files, but only managers can sign off budgets over £5,000." Only she knows those rules.

        The **filing cabinet** has its own lock, in case someone slips past both.

        Each guard sees different things, and each catches different mistakes. That is the design.` },

    { kind: 'diagram', title: 'Three places to enforce',
      body: 'A request meets three kinds of check on its way to the data.',
      nodes: [
        { id: 'c', label: 'Client', icon: '📱', x: 1, y: 0 },
        { id: 'g', label: 'API gateway: coarse', icon: '🚪', x: 1, y: 1, tone: 'accent' },
        { id: 's', label: 'Service: business rules', icon: '🧠', x: 1, y: 2, tone: 'accent' },
        { id: 'd', label: 'Database: backstop', icon: '🗄️', x: 1, y: 3, tone: 'accent' }
      ],
      edges: [
        { from: 'c', to: 'g', label: 'request' }, { from: 'g', to: 's', label: 'if token ok' }, { from: 's', to: 'd', label: 'if rules ok' }
      ],
      caption: 'The client is deliberately not a guard. Anything running on the user’s device can be changed by the user.' },

    { kind: 'compare', title: 'What each guard is good for',
      body: 'Each layer sees a different slice of the situation.',
      cols: ['Gateway', 'Service', 'Database'],
      rows: [
        ['Knows', 'Token, route, rough scope', 'The full business context', 'Rows, tables, the connecting role'],
        ['Good at', 'Valid token? Right audience? Allowed scope for this route?', '"Only the owner may cancel an unshipped order"', 'A last line of defence on data'],
        ['Cannot do', 'Know which order belongs to whom', 'Protect against other services’ bugs', 'Understand business rules'],
        ['Fails by', 'Letting through anything with a valid token', 'A forgotten check on one endpoint', 'Being bypassed by a privileged account']
      ] },

    { kind: 'sequence', title: 'Decision point and enforcement point',
      body: 'Authorization has two jobs that are often separated: **deciding** and **doing**.',
      actors: ['Service (PEP)', 'Policy engine (PDP)'],
      steps: [
        { note: 'The **policy enforcement point** (PEP) is the code that stands in the way of the action. The **policy decision point** (PDP) is the thing that works out allow or deny.' },
        { from: 0, to: 1, label: 'may Priya refund order 91?', note: 'The service asks before doing anything.' },
        { at: 1, label: 'evaluate rules', note: 'The PDP holds the rules (roles, attributes, relationships) in one place.' },
        { from: 1, to: 0, label: 'deny', dashed: true, note: 'The PDP only answers. It cannot stop anything by itself.' },
        { at: 0, label: 'refuse the refund', note: 'The PEP carries the verdict out. If it forgets to ask, or ignores the answer, nothing protects the order.' }
      ] },

    { kind: 'code', title: 'Multi-tenancy: scope every query',
      body: `A **multi-tenant** system serves many customers (tenants) from the same code and database. The worst bug is one tenant seeing another's data. The defence is boring and absolute: **every query is scoped to the tenant.**`,
      code: { lang: 'js', src: `
        // Dangerous: any tenant's invoice id works
        db.query('SELECT * FROM invoices WHERE id = $1', [id]);

        // Scoped: tenant comes from the verified token
        db.query(
          'SELECT * FROM invoices WHERE id = $1 AND tenant_id = $2',
          [id, req.user.tenantId]);`,
        notes: {
          2: 'Nothing here limits the result to the caller’s company. If ids are guessable, or leak, this reads anyone’s data.',
          4: 'The tenant id must come from something the user cannot forge: the verified token or session, never a field in the request body.',
          6: '`AND tenant_id = …` on every query, every time. One forgotten clause is a data breach.'
        } } },

    { kind: 'code', title: 'The database as a backstop: row-level security',
      body: `Relying on every developer remembering \`tenant_id\` is brave. **Row-level security** (RLS) makes the database itself filter rows. In PostgreSQL, you switch it on per table and write a policy. The app tells the database which tenant this request is for, and the database hides every other row.`,
      code: { lang: 'sql', src: `
        ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
        CREATE POLICY tenant_isolation ON invoices
          USING (tenant_id = current_setting('app.tenant_id')::uuid);`,
        notes: {
          1: 'From now on, ordinary queries on this table are filtered by policy.',
          2: 'A named rule attached to the table.',
          3: 'Only rows whose `tenant_id` matches the setting for this connection are visible, even for `SELECT * FROM invoices` with no WHERE at all. The app sets that value from the verified token at the start of each request.'
        } },
      note: 'RLS only protects you if the app connects as a database role the policies apply to. Superuser and table-owner roles may bypass it unless configured otherwise.' },

    { kind: 'concept', title: 'Zero trust: inside the network is not safe',
      body: `Old thinking: a firewall guards the edge, and anything *inside* the network is trusted. So internal services never check who is calling.

        The trouble: attackers get in. One compromised server, one stolen laptop, one vulnerable service, and "inside" is where they are.

        **Zero trust** says: *never trust a request just because of where it came from.* Every call between services is authenticated and authorized too.

        In practice, each service has an identity, and calls use **mutual TLS** (both sides present certificates, so each proves who it is) or signed tokens. The receiving service then asks: is *this* service allowed to do *this* to *that*?` },

    { kind: 'layers', title: 'Defence in depth',
      body: 'No single check is perfect, so stack them. An attacker has to defeat every layer, and a mistake in one is caught by the next.',
      layers: [
        { label: 'Gateway', note: 'Valid token? Right audience? Allowed route and scope?', tone: 'accent', icon: '🚪' },
        { label: 'Service rules', note: 'Does this user own this order? Is it in a state that allows this?', tone: 'accent', icon: '🧠' },
        { label: 'Service-to-service identity', note: 'Is the calling service allowed to ask? (mutual TLS, service accounts)', tone: 'warn', icon: '🔗' },
        { label: 'Database policies', note: 'Row-level security as the last line of defence', tone: 'good', icon: '🗄️' },
        { label: 'Logging and alerts', note: 'Record denials so attacks are noticed', tone: 'muted', icon: '🔔' }
      ] },

    { kind: 'pitfall', title: 'The gateway-only trap',
      body: `A tempting design: "The gateway checks permissions, so services can stay simple."

        It breaks in three ways. The gateway cannot know that order 91 belongs to somebody else, because only the service knows the business rules. Another service, or an engineer on the internal network, can call a service directly and never meet the gateway. And one misrouted rule exposes everything behind it.

        Use the gateway for the **coarse** questions and let each service enforce its **own** rules on every object it holds. The database check is the net under the net.` }
  ],

  activities: [
    { type: 'mcq', after: 3, q: 'The API gateway confirms a token is valid. Why must the order service still check whether this user may cancel *this* order?',
      options: ['Only the service knows the business rules and who owns which order', 'Gateways are never allowed to read tokens', 'Services cannot trust anything, including their own database', 'It is slower for the gateway to do all the checking'],
      answer: 0,
      why: [null, 'Gateways read tokens routinely. That is one of their main jobs.', 'The database is part of the same system. The point is the missing knowledge, not general distrust.', 'Speed is not the reason. A fast gateway still cannot know the rules.'],
      explain: 'A gateway can answer coarse questions (valid token, right audience, allowed scope). Ownership, order state and other rules live in the service.' },

    { type: 'spot', after: 5, prompt: 'This multi-tenant endpoint has a serious flaw. Tap the line (or lines) responsible.',
      code: { lang: 'js', src: `
        app.get('/invoices/:id', auth, async (req, res) => {
          const result = await db.query(
            'SELECT * FROM invoices WHERE id = $1', [req.params.id]);
          res.json(result.rows[0]);
        });` },
      lines: [3, 4],
      explain: 'The query is not scoped to the caller’s tenant. Anyone who is logged in can read any invoice by changing the id. It needs `AND tenant_id = $2` using the tenant from the verified token.' },

    { type: 'tf', after: 7, statement: 'In a zero-trust design, a request from inside the company network is trusted without further checks because it must have come through the firewall.', answer: false,
      explain: 'Zero trust is the opposite: network location earns no trust. Services authenticate each other and authorize each call.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [['Policy decision point (PDP)', 'Works out allow or deny from the rules'], ['Policy enforcement point (PEP)', 'Code that asks, then carries out the verdict'], ['Row-level security', 'The database hides rows the caller may not see'], ['Mutual TLS', 'Both sides of a connection prove who they are with certificates']],
      explain: 'Deciding and enforcing are separate jobs. RLS and mutual TLS are two tools that extend checks to the database and to service-to-service calls.' },

    { type: 'bucket', prompt: 'Where is each check best placed?', buckets: ['Gateway', 'Service', 'Database'],
      items: [['Is the token signed by our login server and not expired?', 0], ['Only the owner of an order may cancel it before shipping', 1], ['Reject requests to /admin routes without the admin scope', 0], ['Never return rows from another tenant, even if a query forgets', 2], ['A manager may approve refunds over £500 only for her team', 1], ['Is the token’s audience this API?', 0]],
      explain: 'Gateway: coarse checks about the token and the route. Service: business rules that need context. Database: a backstop that holds even when code is wrong.' },

    { type: 'ab', q: 'Which approach is safer for a multi-tenant service?',
      a: { lang: 'js', label: 'Tenant from the request', src: `
        const tenant = req.body.tenantId;
        db.query('SELECT * FROM invoices WHERE tenant_id = $1', [tenant]);` },
      b: { lang: 'js', label: 'Tenant from the token', src: `
        const tenant = req.user.tenantId;
        db.query('SELECT * FROM invoices WHERE tenant_id = $1', [tenant]);` },
      answer: 'b',
      explain: 'The verified token cannot be edited by the caller. A tenant id in the request body is simply whatever the caller chooses to type.' },

    { type: 'multi', q: 'Which statements about defence in depth are true?',
      options: ['A mistake in one layer can be caught by another', 'Row-level security can protect data even when a query forgets its tenant filter', 'Internal service calls need authorization too', 'If the gateway checks everything, services need no checks', 'The client app is a reliable place to enforce rules'],
      answers: [0, 1, 2],
      explain: 'Layers overlap on purpose. But the gateway cannot know business rules, and the client belongs to the user, who can change anything running on their device.' },

    { type: 'scenario', title: 'A multi-tenant SaaS audit',
      intro: 'You work on **Ledgerly**, an invoicing SaaS used by thousands of companies, all in one database. A customer reports seeing another company’s invoice for a moment. Panic, then an audit.',
      meters: { 'tenant isolation': 40, 'team speed': 60 },
      steps: [
        { text: 'You find a handler that fetches invoices by id only. What is the immediate fix?',
          choices: [
            { label: 'Scope the query to the tenant from the verified token, then check other handlers for the same pattern', score: 2, effects: { 'tenant isolation': 25, 'team speed': -5 }, feedback: 'Fix this instance, then hunt for siblings. One missing clause usually means several.' },
            { label: 'Make invoice ids longer and random so nobody can guess them', score: 0, effects: { 'tenant isolation': -5 }, feedback: 'Ids leak in emails, logs and links. Hard to guess is not the same as checked.' },
            { label: 'Block that endpoint at the gateway', score: 1, effects: { 'tenant isolation': 5, 'team speed': -10 }, feedback: 'A fine emergency stop, and it fixes nothing: customers need the endpoint.' }
          ] },
        { text: 'How do you stop this class of bug from being possible again?',
          choices: [
            { label: 'Turn on row-level security keyed on the tenant, and set the tenant per request from the token', score: 2, effects: { 'tenant isolation': 30, 'team speed': -5 }, feedback: 'Now even a query with no tenant clause only sees the caller’s rows. The database is a backstop for human error.' },
            { label: 'Add a code review checklist item and trust people', score: 1, effects: { 'tenant isolation': 10 }, feedback: 'Helpful, and humans forget. It should not be the only protection for the most important property of your product.' },
            { label: 'Move each tenant to its own server immediately', score: 1, effects: { 'tenant isolation': 15, 'team speed': -25 }, feedback: 'Strong isolation, at a huge cost in effort and money. Reasonable for a few big customers, a heavy hammer for all.' }
          ] },
        { text: 'The invoice service calls an internal Customers service, which currently accepts anything from the internal network. What do you do?',
          choices: [
            { label: 'Give each service an identity (mutual TLS or signed tokens) and have Customers authorize each caller', score: 2, effects: { 'tenant isolation': 20, 'team speed': -5 }, feedback: 'Zero trust in practice: network location earns nothing, so a compromised neighbour cannot freely read customer data.' },
            { label: 'Rely on the firewall: only our servers can reach it', score: 0, effects: { 'tenant isolation': -15 }, feedback: 'Until one server is compromised. Then every internal service is wide open.' },
            { label: 'Hide the Customers service’s address', score: 0, effects: { 'tenant isolation': -10 }, feedback: 'Obscurity is not a control. Addresses leak through configs, logs and scans.' }
          ] }
      ],
      outro: 'The pattern to remember: **scope every query, add a database backstop, and authorize every call, including internal ones.**' },

    { type: 'explain', prompt: 'Explain why authorization is enforced in more than one place (gateway, service and database) rather than just one.',
      model: 'Each layer knows different things. The gateway can check the token, audience and scope but not business rules. The service knows rules like who owns an order, so it must check every object. The database can add row-level security as a backstop if code forgets a filter. Layers also protect against mistakes and compromised internal services, which is defence in depth and zero trust.',
      keywords: ['gateway', 'service', 'database', 'business rules', 'backstop', 'defence in depth', 'zero trust'] }
  ],

  flashcards: [
    { q: 'What does an API gateway check, and what can it not?', a: 'Coarse things: valid token, audience, scope and route. It cannot know business rules such as who owns an order.' },
    { q: 'What are a PDP and a PEP?', a: 'The policy decision point works out allow or deny. The policy enforcement point is the code that asks and carries out the answer.' },
    { q: 'How do you keep a multi-tenant app from leaking data across tenants?', a: 'Scope every query to the tenant taken from the verified token, and back it with row-level security in the database.' },
    { q: 'What is zero trust?', a: 'Never trust a request just because it comes from inside the network. Authenticate and authorize every call, including between services.' },
    { q: 'What is mutual TLS?', a: 'A TLS connection where both client and server present certificates, so each proves its identity.' }
  ],

  glossary: [
    { term: 'Policy decision point', def: 'The component that evaluates the rules and answers allow or deny.', like: 'The referee who makes the call.', aka: ['PDP'] },
    { term: 'Policy enforcement point', def: 'The code that asks the decision point and then allows or blocks the action.', like: 'The door staff who follow the referee’s call.', aka: ['PEP'] },
    { term: 'Multi-tenancy', def: 'Serving many separate customers (tenants) from the same application and database.', like: 'An apartment block: shared building, private flats.' },
    { term: 'Row-level security', def: 'A database feature that limits which rows each connection may see, according to policies.', like: 'A filing cabinet that only opens the drawers meant for you.', aka: ['RLS'] },
    { term: 'Zero trust', def: 'A design where no request is trusted for where it comes from; everything is authenticated and authorized.', like: 'Showing your pass at every door, even inside the building.' },
    { term: 'Defence in depth', def: 'Using several overlapping layers of protection so one failure does not expose everything.', like: 'A gate, a locked room and a safe.' }
  ],

  takeaways: [
    '**Gateway** for coarse checks, **service** for business rules, **database** as a backstop.',
    'A **PDP** decides, a **PEP** enforces. Forgetting to ask is the common bug.',
    'Multi-tenancy: scope **every** query to the tenant from the verified token; add row-level security.',
    '**Zero trust**: authorize service-to-service calls too. Layer defences so one mistake is not a breach.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('az-failures', {
  eli5: 'The most common web security hole is not clever hacking. It is a server that checks who you are, then forgets to check whether the thing you asked for is yours.',

  cards: [
    { kind: 'story', title: 'Invoice 1041, then 1042',
      body: `Sam is logged in to an invoicing site and opens his invoice. The address bar says:

        \`https://shop.example/invoices/1041\`

        Out of curiosity he changes it to \`…/1042\` and presses Enter. The page loads. It is somebody else's invoice: their name, address and what they bought.

        Sam did not break a password, exploit software or use any special tool. He edited one number. The site checked that he was **logged in**, and never checked that invoice 1042 was **his**.

        This is one of the most common serious security bugs on the web.` },

    { kind: 'concept', title: 'Number one on the list',
      body: `The **OWASP Top 10** is a widely used list of the most serious web application risks, compiled by an open security community. (The next module covers it properly.)

        **Broken Access Control** has been at or near the top of that list in recent editions, ahead of injection and everything else.

        It is the umbrella name for every way a user can act outside their intended permissions: reading others' data, changing it, or using features meant for staff.

        It tops the list because it is easy to get wrong. A scanner cannot know your rules, so each endpoint needs a human to remember the check, every time.` },

    { kind: 'metaphor', title: 'The coat-check ticket',
      body: `You hand in your coat and get ticket number 41. Later you show the ticket and get your coat back. The attendant checks that the ticket is *valid*.

        Now imagine the attendant never checks that the ticket is *yours*. You change the number to 42, and out comes a stranger’s coat. The ticket was real, you really did hand a coat in, and the system still failed.

        That is an insecure direct object reference. "Logged in" is a valid ticket. "This is mine" is a separate check, and it has to happen every time a coat leaves the room.` },

    { kind: 'code', title: 'IDOR: the bug and the fix',
      body: `Sam's trick has a name: **insecure direct object reference** (IDOR). The app takes an identifier from the user and uses it directly to fetch an object, without checking the user may have it.`,
      code: { lang: 'js', src: `
        // Vulnerable: checks login, not ownership
        app.get('/invoices/:id', requireLogin, async (req, res) => {
          const invoice = await db.invoices.findById(req.params.id);
          res.json(invoice);
        });

        // Fixed: ownership checked on every access
        app.get('/invoices/:id', requireLogin, async (req, res) => {
          const invoice = await db.invoices.findById(req.params.id);
          if (!invoice || invoice.ownerId !== req.user.id) {
            return res.status(404).end();
          }
          res.json(invoice);
        });`,
        notes: {
          2: '`requireLogin` is authentication. It tells the code *who* is calling, and nothing about what they may see.',
          3: 'The id comes straight from the URL, which the user controls completely.',
          10: 'The missing line: is this invoice **owned by the caller**? Do it on every object access, in every endpoint.',
          11: 'Many teams return `404` rather than `403` here, so attackers cannot learn which ids exist. A common choice, not a rule.'
        } } },

    { kind: 'pitfall', title: '“But the ids are unguessable”',
      body: `A tempting fix: switch from \`1041\` to long random ids (UUIDs) so nobody can guess a neighbour's.

        It helps a little and it is **not** authorization. Ids leak: in emails, shared screenshots, browser history, logs, analytics and links forwarded to a colleague. Anyone holding the id can then read the object.

        Random ids are a nice extra layer. The actual fix is always the same: **check that this user may access this object, on every access.**

        Think of a house with a secret address and no front-door lock.` },

    { kind: 'concept', title: 'The admin button that was only hidden',
      body: `A second classic: the app hides a **Delete user** button from ordinary people. Only admins ever see it.

        But hiding a button changes the *page*, not the *server*. The button just sends a request, such as \`DELETE /users/17\`. Anyone can send the same request by hand, with a browser tool or a command line, and if the server does not check that the caller is an admin, it will happily obey.

        This is a **missing function-level check**: the feature itself, not just the data, needs its own permission check on the server.

        The interface is a courtesy. The server is the security.` },

    { kind: 'compare', title: 'Two kinds of privilege escalation',
      body: '**Privilege escalation** means getting more power than you were meant to have. It comes in two directions.',
      cols: ['Horizontal', 'Vertical'],
      rows: [
        ['Meaning', 'Reach another user’s things at your own level', 'Gain a higher level of power than you hold'],
        ['Example', 'Sam reads invoice 1042 (a neighbour’s)', 'Sam, an ordinary user, deletes accounts like an admin'],
        ['Typical bug', 'IDOR: no ownership check', 'Missing function-level check'],
        ['Damage', 'Privacy breaches at scale', 'Total takeover of the app']
      ] },

    { kind: 'code', title: 'Never trust the client',
      body: `Anything coming from the browser or app can be edited by the person using it: URLs, form fields, hidden inputs, cookies, JSON bodies. The server must treat all of it as an *untrusted claim*.

        One sneaky case is **mass assignment**: copying the whole request body into a user record.`,
      code: { lang: 'js', src: `
        // Dangerous: the client decides which fields change
        app.patch('/me', requireLogin, (req, res) => {
          Object.assign(req.user, req.body);
          db.users.save(req.user);
        });

        // Attacker sends:  { "name": "Sam", "role": "admin" }`,
        notes: {
          3: 'Every field in the body is copied, including ones the user should never touch.',
          7: 'One extra property and an ordinary user is now an admin. Allow only specific fields (`name`, `email`) and take role, owner and tenant from the server’s own records.'
        } } },

    { kind: 'steps', title: 'How to test authorization',
      body: 'Normal tests prove that the right person succeeds. Authorization bugs hide in the other direction, so you must test who should be **refused**.',
      steps: [
        { title: 'Create two users', body: 'Call them A and B, each with their own data. Add an admin and an anonymous caller for good measure.' },
        { title: 'Cross over their objects', body: 'Log in as A and request B’s invoice by id. It must be refused. This catches IDOR.' },
        { title: 'Call upwards', body: 'As an ordinary user, call every admin endpoint directly. Each must be refused. This catches missing function-level checks.' },
        { title: 'Try without credentials', body: 'No token, expired token, token for another API. All must fail.' },
        { title: 'Automate and keep them', body: 'Put these negative tests in the suite so a new endpoint cannot ship without them. Manual penetration tests are a useful extra, not a replacement.' }
      ] },

    { kind: 'code', title: 'A negative test, in code',
      body: 'The shape of the most valuable test in your suite.',
      code: { lang: 'js', src: `
        test('user A must not read an invoice owned by user B', async () => {
          const invoice = await createInvoiceFor(userB);

          const res = await api.get('/invoices/' + invoice.id).as(userA);

          expect(res.status).toBe(404);   // or 403, if that is your policy
          expect(res.body).not.toHaveProperty('total');
        });`,
        notes: {
          2: 'The data belongs to B, created by test setup.',
          4: 'The request comes from A, a perfectly valid logged-in user.',
          6: 'It must be refused. Choose 403 or 404 and be consistent.',
          7: 'Also check that no data leaked in the body. A refusal that still includes the invoice is no refusal.'
        } } }
  ],

  activities: [
    { type: 'mcq', after: 3, q: 'A logged-in user changes `/invoices/1041` to `/invoices/1042` and sees someone else’s invoice. What is the missing control?',
      options: ['An ownership (authorization) check on that object', 'A stronger password policy', 'HTTPS encryption on the connection', 'A longer login session timeout'],
      answer: 0,
      why: [null, 'The user logged in with their own valid password. Password strength changes nothing here.', 'HTTPS protects data in transit. This user is receiving the data legitimately from the server.', 'Session length is unrelated. The issue is what the logged-in user may see.'],
      explain: 'This is an IDOR. Authentication was fine, but the server never asked whether this user may access invoice 1042.' },

    { type: 'tf', after: 4, statement: 'Replacing sequential ids with long random UUIDs fully fixes an IDOR vulnerability.', answer: false,
      explain: 'Random ids make guessing harder, but ids leak and anyone who gets one can use it. Only a permission check on each access fixes the bug.' },

    { type: 'spot', after: 5, prompt: 'The frontend hides the delete button from non-admins. Tap the line where the server is missing its check.',
      code: { lang: 'js', src: `
        // Frontend
        if (user.isAdmin) showDeleteButton();

        // Backend
        app.delete('/users/:id', requireLogin, (req, res) => {
          db.deleteUser(req.params.id);
          res.status(204).end();
        });` },
      lines: [6, 7],
      explain: 'The server deletes whoever it is asked to for any logged-in caller. Hiding the button only hides the door. The server needs `if (!can(req.user, \'user:delete\')) return res.status(403).end();` before the delete.' },

    { type: 'bucket', prompt: 'Is each attack horizontal or vertical privilege escalation?', buckets: ['Horizontal', 'Vertical'],
      items: [['A customer reads another customer’s order by changing the id', 0], ['An ordinary user calls the admin "delete account" endpoint', 1], ['A user edits another user’s profile through a guessable URL', 0], ['A user adds "role":"admin" to their own profile update', 1], ['A support agent opens a colleague’s private notes', 0], ['A trial user turns on a paid-only feature by editing a request', 1]],
      explain: 'Horizontal means reaching peers’ things at the same level. Vertical means gaining a higher level of power than you were given.' },

    { type: 'short', q: 'What three-letter-plus acronym names the bug where changing an id in a URL reaches someone else’s object?', accept: ['IDOR'], hint: 'Insecure direct object reference.',
      explain: '**IDOR**: the app uses an identifier supplied by the user to fetch an object, without checking the user’s right to it.' },

    { type: 'ab', q: 'Which version of the profile update is safer?',
      a: { lang: 'js', label: 'Copy everything', src: `
        Object.assign(req.user, req.body);
        db.users.save(req.user);` },
      b: { lang: 'js', label: 'Copy only allowed fields', src: `
        const { name, email } = req.body;
        Object.assign(req.user, { name, email });
        db.users.save(req.user);` },
      answer: 'b',
      explain: 'The allow-list means a sneaky `role` or `tenantId` in the body is simply ignored. Copying everything lets the client choose its own privileges.' },

    { type: 'multi', q: 'Which tests would catch broken access control?',
      options: ['User A requests user B’s invoice and must be refused', 'An ordinary user calls an admin endpoint directly and must be refused', 'A request with no token must be refused', 'The login page accepts the right password', 'The dashboard loads quickly'],
      answers: [0, 1, 2],
      explain: 'These are all negative tests: the wrong person trying. Logging in and speed are good things to test, but they say nothing about who is blocked.' },

    { type: 'order', prompt: 'Put the fixing of a reported IDOR in a sensible order.',
      items: ['Reproduce it: log in as A and fetch B’s object', 'Add the ownership check to the endpoint', 'Write a negative test that fails before the fix and passes after', 'Search other endpoints for the same missing check', 'Add the negative test pattern to every new endpoint going forward'],
      explain: 'Reproduce first, so you know the fix works. Test it, then look sideways: one missing check usually has siblings. Finally make the safe path the default.' },

    { type: 'scenario', title: 'The penetration test report',
      intro: 'A security firm tested **QuickBank**, a banking app, and sent you three findings. You have a week. Real people’s money and data are at stake.',
      meters: { 'customer safety': 40, 'time left': 80 },
      steps: [
        { text: 'Finding one: `GET /accounts/8841/statement` returns the statement for **any** account number to any logged-in customer. What do you do?',
          choices: [
            { label: 'Check ownership of the account on the server for every request, and add a negative test', score: 2, effects: { 'customer safety': 25, 'time left': -10 }, feedback: 'The core fix: check the user may have this account, every time. The test makes sure it stays fixed.' },
            { label: 'Replace account numbers with random ids in the URL', score: 1, effects: { 'customer safety': 5, 'time left': -10 }, feedback: 'Makes guessing harder, but ids leak. Without an ownership check, anyone with an id can read it.' },
            { label: 'Hide the link from other customers’ pages', score: 0, effects: { 'customer safety': -5, 'time left': -5 }, feedback: 'The tester typed the URL by hand. Hiding is not a check.' }
          ] },
        { text: 'Finding two: the mobile app shows "Freeze any card" only to staff, but the tester froze a customer’s card by calling `POST /cards/17/freeze` directly. And?',
          choices: [
            { label: 'Add a server-side permission check for the freeze function, and check the caller’s relationship to the card', score: 2, effects: { 'customer safety': 25, 'time left': -10 }, feedback: 'The function needs its own check on the server, covering both the role and the object.' },
            { label: 'Obfuscate the mobile app so testers cannot see the endpoint', score: 0, effects: { 'customer safety': -10, 'time left': -15 }, feedback: 'Anyone can watch the app’s network traffic. Obscurity wastes the week.' },
            { label: 'Rename the endpoint to something less guessable', score: 0, effects: { 'customer safety': -10, 'time left': -5 }, feedback: 'Endpoints are found by watching traffic, not guessing. Rename or not, the missing check is still missing.' }
          ] },
        { text: 'Finding three: editing a profile accepts `"dailyLimit": 1000000` in the request body and saves it. How do you respond?',
          choices: [
            { label: 'Accept only an allow-list of fields from the client; limits are set only by staff-only functions', score: 2, effects: { 'customer safety': 25, 'time left': -10 }, feedback: 'The client may say what it wants. The server decides what is accepted. Sensitive fields come from the server’s own records.' },
            { label: 'Round the limit down if it looks too large', score: 0, effects: { 'customer safety': -10, 'time left': -5 }, feedback: 'A lower limit is still a limit the customer chose for themselves.' },
            { label: 'Log it and review attempts monthly', score: 1, effects: { 'customer safety': 0 }, feedback: 'Logging is useful, but a review next month is after the money has gone. Block it now, log it as well.' }
          ] }
      ],
      outro: 'The pattern to remember: **authorize on the server, for the function and the object, on every request, and prove it with negative tests.**' },

    { type: 'explain', prompt: 'Explain IDOR and how to fix it, and why hiding buttons or using random ids does not solve it.',
      model: 'IDOR is when the app uses an id from the user, such as an invoice number in the URL, to fetch an object without checking that the user may access it, so changing the id reaches someone else’s data. The fix is to check ownership or permission on every object access on the server. Hiding buttons or using random ids only hides things from the interface, since requests can be sent by hand and ids leak.',
      keywords: ['IDOR', 'id', 'ownership', 'every', 'server', 'hidden', 'random ids', 'negative test'] }
  ],

  flashcards: [
    { q: 'What is IDOR?', a: 'Insecure direct object reference: the app uses a user-supplied id to fetch an object without checking the user may access it.' },
    { q: 'What is the correct fix for IDOR?', a: 'Check ownership or permission on every object access, on the server. Random ids are only an extra layer.' },
    { q: 'Why is hiding the admin button not security?', a: 'The server still accepts the request if sent by hand. Every function needs its own server-side permission check.' },
    { q: 'Horizontal vs vertical privilege escalation?', a: 'Horizontal: reaching another user’s things at your own level. Vertical: gaining a higher level of power, such as admin.' },
    { q: 'How do you test authorization?', a: 'With negative tests: user A must not read B’s data, ordinary users must not call admin endpoints, and no token must fail.' }
  ],

  glossary: [
    { term: 'Broken access control', def: 'Any flaw that lets users act outside their intended permissions. It tops the OWASP Top 10 in recent editions.', like: 'A building where the guard checks your pass but not which room you walk into.' },
    { term: 'IDOR', def: 'Insecure direct object reference: fetching an object by a user-supplied id without checking the user’s right to it.', like: 'Changing the number on your coat-check ticket to collect a stranger’s coat.' },
    { term: 'Privilege escalation', def: 'Gaining more access than intended, either sideways (horizontal) or upwards (vertical).', like: 'Borrowing a neighbour’s key, or stealing the manager’s.' },
    { term: 'Function-level access control', def: 'Checking that the caller may use a particular feature or endpoint, not just see particular data.', like: 'A lock on the staff-only door, not just a sign on it.' },
    { term: 'Mass assignment', def: 'Copying every field of a request into an object, so a client can set fields it should never control.', like: 'Letting a customer fill in the “approved by” box on their own form.' }
  ],

  takeaways: [
    '**Broken access control** is the top web risk: logged in is not the same as allowed.',
    '**IDOR**: check ownership on **every** object access. Random ids and hidden buttons are not checks.',
    'Every feature needs its own **server-side** permission check. Never trust the client, including extra fields.',
    'Prove it with **negative tests**: A must not read B’s data; users must not call admin endpoints.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('authz', {
  title: 'The Gatekeeper Golem',
  intro: 'A stone golem guards a vault of customer data and answers only to correct permissions. Beat it by showing you can choose the right model, put the check in the right place and spot the holes attackers use.',
  questions: [
    { type: 'mcq', q: 'A request arrives with a valid login. What is the next question the system must answer before acting?',
      options: ['May this subject do this action to this resource?', 'Is the password strong enough?', 'Is the connection encrypted?', 'Has the user logged in before?'],
      answer: 0,
      why: [null, 'Password strength matters at login. By now authentication is already done.', 'Encryption protects the journey. It says nothing about permission.', 'History does not decide permission for this action.'],
      explain: 'Authentication says who. Authorization asks the subject, action, resource question on every request, and defaults to deny.' },

    { type: 'tf', statement: 'With default deny, forgetting to write a rule for a new feature leaves the feature closed to users.', answer: true,
      explain: 'Anything not explicitly allowed is refused, so a forgotten rule shows up as a bug report, not a breach.' },

    { type: 'bucket', prompt: 'Which model is the natural fit for each requirement?', buckets: ['ACL', 'RBAC', 'ABAC', 'ReBAC'],
      items: [['This one file is shared with Sam and Priya', 0], ['Support agents can issue refunds', 1], ['Managers approve payments below their limit, in office hours only', 2], ['Everything in a folder inherits the folder’s sharing', 3], ['Auditors can read all reports', 1], ['Doctors see only records for patients on their own ward', 2], ['Anyone in the project team can edit its files', 3], ['A guest list on a single document', 0]],
      explain: 'ACLs attach a list to one resource. Roles suit job-shaped abilities. Attributes suit rules about facts like amount, time and ward. Relationships suit ownership, membership and nesting.' },

    { type: 'ab', q: 'Which check will survive reorganisations best?',
      a: { lang: 'js', label: 'Role name', src: `
        if (user.role === 'admin' || user.role === 'manager') {
          approveRefund(order);
        }` },
      b: { lang: 'js', label: 'Permission', src: `
        if (can(user, 'refund:approve')) {
          approveRefund(order);
        }` },
      answer: 'b',
      explain: 'Roles are renamed and split. The permission states what the code needs, and the role mapping can change in one place.' },

    { type: 'multi', q: 'Which of these are classic weaknesses or costs of the models you have studied?',
      options: ['RBAC: role explosion as exceptions become roles', 'ACL: hard to answer "what can this person access?"', 'ABAC: attributes can be stale or untrusted', 'ReBAC: relationship facts must be kept in sync with the data', 'RBAC: it cannot give anyone more than one role'],
      answers: [0, 1, 2, 3],
      explain: 'Each model has its own failure mode. The last option is false: people routinely hold several roles, and their permissions combine.' },

    { type: 'mcq', q: 'An app’s token has the scope `files.delete`. The user it acts for may only read files. The app tries to delete a file. What happens?',
      options: ['It is denied, because the effective permission is the intersection of scope and user rights', 'It is allowed, because the scope names the action', 'It is allowed, because tokens override user permissions', 'It is allowed if the token has not expired'],
      answer: 0,
      why: [null, 'A scope can only narrow what the user may do, never widen it.', 'A token is delegated authority from the user, so it cannot exceed the user’s own.', 'Expiry is one check among several. It does not grant extra power.'],
      explain: 'The app can do only what both the token’s scopes and the user’s permissions allow.' },

    { type: 'short', q: 'Which claim in a token says which service it was issued for?', accept: ['aud', 'audience'], hint: 'Three letters, or the full word.',
      explain: 'The **audience** claim (`aud`) must name the API receiving the token. Otherwise a genuine token for another service could be replayed.' },

    { type: 'match', prompt: 'Match each term to what it means.',
      pairs: [['Policy decision point', 'Evaluates the rules and answers allow or deny'], ['Policy enforcement point', 'Asks the decision point and carries out the answer'], ['Row-level security', 'The database hides rows the caller may not see'], ['Confused deputy', 'A powerful service tricked into acting for an unauthorised caller'], ['Zero trust', 'No request is trusted merely for where it came from']],
      explain: 'Deciding and enforcing are separate jobs. RLS is a database backstop, and zero trust and the confused deputy both concern service-to-service calls.' },

    { type: 'order', prompt: 'Put the checks on an incoming API token in a sensible order.',
      items: ['Verify the signature and trusted issuer', 'Check it has not expired', 'Check the audience is this API', 'Check the scope covers the action', 'Check the user may act on this particular resource'],
      explain: 'First establish the token is genuine, current and meant for you. Then work out what it permits, and last whether the user may touch this object.' },

    { type: 'spot', prompt: 'This multi-tenant endpoint leaks data across customers. Tap the line responsible.',
      code: { lang: 'js', src: `
        app.get('/reports/:id', requireLogin, async (req, res) => {
          const report = await db.query(
            'SELECT * FROM reports WHERE id = $1', [req.params.id]);
          res.json(report.rows[0]);
        });` },
      lines: [3],
      explain: 'The query finds a report by id alone. It needs a tenant (or owner) condition from the verified token, for example `AND tenant_id = $2`, and ideally row-level security as a backstop.' },

    { type: 'cloze', text: 'An {{IDOR}} happens when the server uses an id from the user without checking {{ownership}}. Hiding a button does not fix a missing {{function-level}} check, because requests can be sent {{by hand}}.',
      distractors: ['encryption', 'cookie', 'automatically'],
      explain: 'Both bugs come from trusting the client. The cure is a server-side check for the object and for the function, every time.' },

    { type: 'estimate', q: 'A company with 3,000 staff gives each person about 200 individual ACL entries on shared documents over time. Roughly how many entries would a full access review need to check?', answer: 600000, unit: 'entries', min: 1000, max: 100000000,
      explain: '3,000 × 200 is 600,000. Nobody reviews that by hand, which is why access drifts and why groups, roles and relationships replace personal entries.' }
  ]
});

KS.sheet('authz', {
  title: 'Authorization: cheat sheet',
  sections: [
    { title: 'The core ideas',
      md: `- Every request asks: may this **subject** do this **action** to this **resource** (in this context)?
        - **Authentication** = who you are. **Authorization** = what you may do. The first is not the second.
        - **Default deny:** nothing is allowed unless a rule says so. Errors end in "no", never "yes" (do not fail open).
        - **Least privilege:** the minimum access the job needs.
        - \`401\` = unknown caller. \`403\` = known, refused.` },

    { title: 'The four models',
      md: `| Model | Decides from | Fits |
        |---|---|---|
        | ACL | A list on each resource | Sharing a file; Unix permissions |
        | RBAC | User → role → permission | Job-shaped access; databases, cloud IAM, Kubernetes |
        | ABAC | Attributes of user, resource, context | Limits, time, ward, department |
        | ReBAC | Relationships: owner, member, parent | Folders, teams, "shared with me" |

        Models mix well: roles for broad strokes, attributes or relationships for the detail.` },

    { title: 'RBAC rules of thumb',
      md: `- Check **permissions** (\`can(user, 'invoice:read')\`), not role names.
        - Roles match real jobs. A few dozen at most.
        - Hierarchies: senior roles inherit junior ones.
        - **Role explosion** = a role per combination of department, region, level and exception. Sign you need attributes.
        - Start small. Adding a permission never breaks anyone; removing one does.` },

    { title: 'ABAC and ReBAC',
      md: `- **ABAC:** attributes from user, resource and context go into written policies. Engines: **Open Policy Agent** (Rego), **Cedar** (AWS).
        - Policies are code: review, version and **test denials** first.
        - Risks: untrusted or stale attributes; hard to answer "who can open X?".
        - **ReBAC:** store facts (user is member of team, team views folder, folder contains doc) and walk them.
        - Origin: Google's **Zanzibar** paper (2019). Open source: **OpenFGA**, **SpiceDB**.
        - Risks: keep facts in sync, plan inheritance exceptions.` },

    { title: 'Tokens: scopes and claims',
      md: `- **Scopes** limit the *token* (the app). User permissions limit the *person*. Effective = **intersection**. Scopes never widen.
        - Check, in order: signature and issuer, expiry, **audience (\`aud\`)**, scope, then the user's right to this object.
        - Claims are a **snapshot**; they go stale. Use short lifetimes, re-check sensitive facts, support revocation.
        - **Confused deputy:** a powerful service used by a caller with no rights. Act with the caller's authority.` },

    { title: 'Where to enforce',
      md: `| Layer | Does | Cannot |
        |---|---|---|
        | Gateway | Token valid, audience, scope, route | Know business rules |
        | Service | Ownership, state, business rules | Cover other services' bugs |
        | Database | Row-level security as a backstop | Understand business rules |

        - **PDP** decides, **PEP** enforces. Forgetting to ask is the bug.
        - **Multi-tenant:** every query scoped to the tenant from the *verified token*.
        - **Zero trust:** authorize service-to-service calls (mutual TLS, service identities). Layer defences.` },

    { title: 'Broken access control',
      md: `- #1 category in the OWASP Top 10 in recent editions.
        - **IDOR:** changing an id reaches someone else's object. Fix: ownership check on **every** object access. Random ids are only an extra.
        - **Missing function-level check:** a hidden button is not security. Check on the server.
        - **Horizontal** escalation = same level, another user's data. **Vertical** = higher power (admin).
        - **Never trust the client:** allow-list fields (beware mass assignment), take role and tenant from the server.
        - **Test:** A must not read B's data; ordinary users must not call admin endpoints; no token must fail.` }
  ]
});
