/* Module: crypto — Cryptography Basics.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs crypto */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('cr-hashing', {
  eli5: 'A hash function squashes any data into a short, fixed-size fingerprint: the same input always gives the same fingerprint, but you cannot rebuild the input from it.',

  cards: [
    { kind: 'concept', title: 'How do you know a download is intact?',
      body: `You download a 4 GB installer. Did every byte arrive? Was the file tampered with on the way? You cannot compare it with the original byte by byte; the original is on someone else’s server.

        So the publisher posts a short **fingerprint** of the file next to the download link. You compute the fingerprint of *your* copy. Same fingerprint, same file. Different fingerprint, something changed.

        The machine that makes fingerprints is called a **hash function**. It takes data of any size and produces a short, fixed-size result called a **hash** (or **digest**).` },

    { kind: 'metaphor', title: 'Fingerprints and smoothies',
      body: `Two pictures help here.

        A **fingerprint** identifies a person, yet you cannot rebuild the person from it. A hash identifies data in the same way.

        A **blender** is the one-way part. Put in a strawberry and a banana, press go, and you get a smoothie. Same fruit, same smoothie, every time. But nobody can hand you the smoothie and get the original strawberry back.

        That is the whole idea: **easy to compute, practically impossible to run backwards.**`,
      note: 'Where it stops being true: a smoothie gets bigger or smaller with the fruit. A hash is always the same size, however big the input.' },

    { kind: 'code', title: 'Hashing in three lines',
      body: 'Here is SHA-256, a modern hash function, in Node.js. **Tap the highlighted lines.**',
      code: { lang: 'js', src: `
        import { createHash } from 'node:crypto';

        const sha = (text) => createHash('sha256').update(text).digest('hex');

        console.log(sha('hello'));
        // 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824`,
        notes: {
          3: 'Feed text in, get a **hex string** out. Hex is just a readable way to write the raw bytes.',
          5: 'Run this a million times and you get the same answer a million times. Hashing is **deterministic**: no randomness, no clock, nothing else involved.',
          6: 'That is 64 hex characters, which is 256 bits (each hex character carries 4 bits). A one-word input and a whole film would both produce exactly this length.'
        } } },

    { kind: 'concept', title: 'The avalanche effect',
      body: `Good hash functions are touchy. Change **one letter** of the input and the output is not slightly different; it is completely different.

        | Input | SHA-256 (first 12 characters) |
        |---|---|
        | \`hello\` | \`2cf24dba5fb0…\` |
        | \`Hello\` | \`185f8db32271…\` |

        Roughly **half the bits flip** for any tiny change. This is called the **avalanche effect**, and it is deliberate. If similar inputs gave similar hashes, an attacker could creep towards a target one small step at a time. Instead there is no hint of "getting warmer".`,
      note: 'You will see this live in the lab that follows: type a letter and watch the whole fingerprint scramble.' },

    { kind: 'concept', title: 'Collisions: two inputs, one hash',
      body: `There are infinitely many possible inputs and only a fixed number of possible outputs. So, by simple counting, **different inputs must sometimes share a hash**. That is a **collision**. It is like a hotel with a billion guests and a finite number of rooms: somebody shares.

        The point is not that collisions *do not exist*. It is that they are impossible to **find on purpose**. A good hash is **collision-resistant**: nobody can realistically produce two different inputs with the same hash.

        When someone *does* find a practical way to do it, the hash is called **broken**, and it can no longer be trusted to vouch for data.` },

    { kind: 'compare', title: 'Which hash functions are still trusted?',
      body: 'Names you will meet in the wild, and where each stands.',
      cols: ['Output size', 'Verdict'],
      rows: [
        ['MD5', '128 bits', 'Broken: collisions are easy to make. Never for security. Still seen as a plain "did it copy correctly?" checksum.'],
        ['SHA-1', '160 bits', 'Broken: researchers have produced real collisions. Phased out of certificates and signatures.'],
        ['SHA-2 (SHA-256, SHA-512)', '256 or 512 bits', 'Solid. The sensible default today.'],
        ['SHA-3', '224–512 bits', 'Solid. A different internal design from SHA-2, so it is a ready backup if SHA-2 ever cracks.']
      ] },

    { kind: 'diagram', title: 'Checking a download with a hash',
      body: 'The publisher and you each hash the file independently, then compare the two short strings.',
      nodes: [
        { id: 'pub', label: 'Publisher’s file', icon: '📦', x: 0, y: 0 },
        { id: 'h1', label: 'SHA-256', icon: '🧮', x: 0, y: 1, tone: 'accent' },
        { id: 'fp', label: 'Published fingerprint', icon: '🔖', x: 0, y: 2 },
        { id: 'mine', label: 'Your downloaded copy', icon: '💾', x: 2, y: 0 },
        { id: 'h2', label: 'SHA-256', icon: '🧮', x: 2, y: 1, tone: 'accent' },
        { id: 'cmp', label: 'Same? File is intact', icon: '✅', x: 1, y: 3, tone: 'good' }
      ],
      edges: [
        { from: 'pub', to: 'h1' }, { from: 'h1', to: 'fp' },
        { from: 'mine', to: 'h2' }, { from: 'h2', to: 'cmp', label: 'yours' },
        { from: 'fp', to: 'cmp', label: 'theirs' }
      ],
      caption: 'One caveat: the fingerprint only helps if you got it from somewhere you trust. Lesson 4 shows how to make that trustworthy.' },

    { kind: 'realworld', title: 'What hashes are used for',
      body: `- **Integrity.** Is this file, backup or message exactly what it was? Download checksums are the classic case.
        - **Deduplication.** Cloud storage can spot identical files by comparing short hashes instead of comparing gigabytes of bytes.
        - **Naming things.** Git names every commit and file version by a hash of its contents, so changing history changes the names.
        - **Signatures.** Signing a huge document is slow, so software signs a short hash of it instead. That is exactly how digital signatures work, two lessons from now.

        Notice that none of these needs the hash to be *reversed*. That is the entire design.` },

    { kind: 'pitfall', title: 'A hash is not encryption',
      body: `People say "the password is encrypted" when they mean "hashed". They are different tools.

        - **Encryption** is reversible: lock with a key, unlock with a key.
        - **Hashing** has no key and no way back.

        There is a catch. If the input is **guessable**, an attacker simply hashes lots of guesses and looks for a match. Hashing "yes" or a four-digit PIN protects nothing, because there are so few inputs to try.

        That is why storing passwords needs more than a plain hash. It is the next lesson.` }
  ],

  activities: [
    { type: 'tf', after: 3, statement: 'If you change one letter of the input, only a small part of the hash changes.', answer: false,
      explain: 'The avalanche effect means a tiny change flips roughly half the output bits, so the new hash looks completely unrelated. That stops anyone from creeping towards a target hash step by step.' },

    { type: 'mcq', after: 4, q: 'Why must collisions exist at all, even in a very good hash function?',
      options: ['There are endless possible inputs but only a fixed number of possible outputs', 'Every hash function has a deliberate flaw built in', 'The output is chosen at random each time, so repeats happen', 'The output is always the same length as the input'],
      answer: 0,
      explain: 'It is pure counting: more pigeons than pigeonholes. The security claim is not "no collisions" but "nobody can find one on purpose".',
      why: [null, 'No flaw is needed. Counting alone forces collisions.', 'A hash is deterministic; the same input always gives the same output.', 'Output size is fixed. That is exactly why collisions are unavoidable.'] },

    { type: 'match', after: 5, prompt: 'Match each term to what it means.',
      pairs: [['MD5', 'Broken for security; fine as a plain checksum'], ['SHA-1', 'Broken: real collisions have been produced'], ['SHA-256', 'A solid member of the SHA-2 family'], ['SHA-3', 'Solid, with a different design from SHA-2'], ['Avalanche effect', 'A tiny input change flips about half the output bits']] },

    { type: 'multi', q: 'Which of these are properties of a cryptographic hash function?',
      options: ['The same input always gives the same output', 'The output is always the same length', 'With the right key you can turn the hash back into the input', 'A tiny change to the input completely changes the output', 'Longer inputs produce longer hashes'],
      answers: [0, 1, 3],
      explain: 'Hashes are deterministic, fixed-size and avalanche-prone. There is no key and no way back, and a 4 GB file hashes to the same length as one word.' },

    { type: 'bucket', prompt: 'Is a hash the right tool for the job?', buckets: ['Good job for a hash', 'Needs something else'],
      items: [['Checking a downloaded file was not corrupted', 0], ['Spotting duplicate photos in cloud storage', 0], ['Sending a secret message the recipient can read', 1], ['Getting the original data back from its hash', 1], ['Producing a short digest of a contract to sign', 0], ['Recovering a lost file using its checksum', 1]],
      explain: 'Hashes confirm and compare; they never carry data. If the receiver must read the content, you need encryption. If you need the data back, you need to have kept it.' },

    { type: 'spot', prompt: 'This code is meant to prove a contract has not been altered. Which line is the security problem?',
      code: { lang: 'py', src: `
        import hashlib
        def seal(contract: bytes) -> str:
            # fingerprint kept as proof of what was agreed
            digest = hashlib.md5(contract).hexdigest()
            return digest` },
      lines: [4],
      explain: 'MD5 is broken for collision resistance: someone can craft two different contracts with the same MD5. For a fingerprint people rely on, use SHA-256 or SHA-3.' },

    { type: 'ab', q: 'You publish release files and want users to verify them. Which command should the instructions tell them to use?',
      a: { lang: 'sh', src: 'sha256sum installer.iso', label: 'Option one' },
      b: { lang: 'sh', src: 'md5sum installer.iso', label: 'Option two' },
      answer: 'a',
      explain: 'SHA-256 is still collision-resistant, so nobody can craft a malicious file with the same fingerprint. MD5 can be fooled that way, so it should not vouch for anything security-related.' },

    { type: 'short', q: 'How many hexadecimal characters long is a SHA-256 hash?', accept: ['64'], hint: '256 bits, and each hex character is 4 bits.',
      explain: '256 ÷ 4 = 64 characters. The length never changes, whether you hash one letter or a film.' },

    { type: 'explain', prompt: 'A colleague says: "We hash the uploaded files, so they are encrypted and safe." Explain what is wrong with that.',
      model: 'Hashing and encryption are different. A hash is a short one-way fingerprint with no key, so it cannot be turned back into the file, and it does not hide anything for someone to later read. It only lets you check that the file matches. Encryption uses a key and is reversible. If the files need to be kept secret *and* readable later, they need encryption, not just a hash.',
      keywords: ['one-way', 'fingerprint', 'no key', 'reversible', 'encryption', 'integrity'] }
  ],

  flashcards: [
    { q: 'What are the key properties of a cryptographic hash?', a: 'Deterministic, fixed-size output, one-way, avalanche effect (a tiny change scrambles the output) and collision-resistant.' },
    { q: 'What is the avalanche effect?', a: 'A tiny change in the input flips roughly half the bits of the output, so similar inputs give unrelated hashes.' },
    { q: 'What is a collision, and why are they unavoidable?', a: 'Two different inputs with the same hash. Infinite inputs map onto finite outputs, so they must exist; a good hash makes them infeasible to find.' },
    { q: 'Which hash functions are broken, and which are fine?', a: 'MD5 and SHA-1 are broken for security. SHA-2 (e.g. SHA-256) and SHA-3 are fine.' },
    { q: 'Hashing vs encryption?', a: 'Encryption is reversible with a key. Hashing has no key and cannot be reversed; it only confirms or compares.' }
  ],

  glossary: [
    { term: 'Hash function', def: 'A function that turns data of any size into a short, fixed-size fingerprint. The same input always gives the same output, and it cannot be run backwards.', like: 'A blender: easy to use, impossible to reverse.', aka: ['digest function'] },
    { term: 'Hash', def: 'The fixed-size output of a hash function, usually written as hex characters.', like: 'A fingerprint of the data.', aka: ['digest', 'checksum'] },
    { term: 'Avalanche effect', def: 'The property that changing one tiny piece of input changes about half of the output bits.', like: 'Nudging one pebble and triggering a whole landslide.' },
    { term: 'Collision', def: 'Two different inputs that produce the same hash. A hash is "broken" when collisions can be found deliberately.', like: 'Two guests handed the same hotel room key.' },
    { term: 'SHA-256', def: 'A widely used hash function from the SHA-2 family that produces a 256-bit (64 hex character) hash.' }
  ],

  takeaways: [
    'A hash is a **short, fixed-size fingerprint**: same input, same output; no way back.',
    'The **avalanche effect**: change one letter and the whole hash changes.',
    '**MD5 and SHA-1 are broken** for security; use **SHA-256 / SHA-3**.',
    'Hashing is **not encryption**: it confirms data, it does not hide it.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('cr-passwords', {
  eli5: 'Websites should never keep your password; they keep a slow, salted fingerprint of it, so even a stolen database does not hand the attacker your actual password.',

  cards: [
    { kind: 'story', title: 'The night the users table walked out',
      body: `Imagine your site is hacked, and the attacker copies the whole \`users\` table. What is in the password column?

        - **Plain text:** every account is open, instantly. Worse, people reuse passwords, so their email, shopping and bank logins are in danger too.
        - **Something clever:** the attacker has a pile of gibberish that is hard to turn back into passwords.

        The aim is simple, and slightly odd: store something that lets you **check** a password without ever being able to **read** it. Nobody on your team, including you, should be able to see what users typed.`,
      note: 'Hashing is the "check but never read" tool from the last lesson. This lesson is about using it properly.' },

    { kind: 'sequence', title: 'Signing up, then logging in',
      body: 'The server keeps only the hash. Step through both visits.',
      actors: ['Browser', 'Server', 'Database'],
      steps: [
        { from: 0, to: 1, label: 'sign up: email + password', note: 'Sent over HTTPS, so nobody on the wire can read it.' },
        { at: 1, label: 'hash the password', note: 'The server runs the password through a hash function.' },
        { from: 1, to: 2, label: 'store email + hash', note: 'Only the hash is saved. The real password is thrown away.' },
        { from: 0, to: 1, label: 'log in: email + password', note: 'Weeks later, the user comes back and types it again.' },
        { from: 1, to: 2, label: 'fetch hash for this email', note: 'The server looks up what it stored.' },
        { from: 2, to: 1, label: 'stored hash', dashed: true, note: 'The database hands back the salt and the hash it saved at sign-up.' },
        { at: 1, label: 'hash the attempt, compare', note: 'Same input gives the same hash, so equal hashes mean the right password. The server never needed to know it.' }
      ] },

    { kind: 'pitfall', title: 'Fast hashes are the wrong tool',
      body: `SHA-256 is secure, so is it good enough for passwords? No. It was designed to be **fast**, which is lovely for checking big files and terrible here.

        An attacker with your stolen hashes cannot reverse them. But they can **guess**: hash a likely password, compare, repeat. Against a fast hash, a single graphics card can try on the order of billions of guesses per second.

        And human passwords are predictable: \`password1\`, \`Summer2024!\`, a pet's name. A big list of likely guesses falls in minutes.

        For checksums, speed is a feature. For passwords, **speed helps the attacker**.`,
      note: 'The lab that follows lets you race a fast hash against a slow one and see how long guessing takes.' },

    { kind: 'metaphor', title: 'The answer book, and a different exam for everyone',
      body: `Attackers do not always guess live. They can do the work in advance and keep the results: a giant lookup table of "this password produces this hash". One of these is called a **rainbow table**. It is like owning the answer book to a test.

        Two other problems show up in a stolen table: every user who chose \`password1\` has the **identical hash**, so one cracked hash cracks them all, and the attacker can see who shares a password.

        The fix is to give every student a **different exam**. A **salt** is a random string added to each password before hashing. The answer book no longer matches anyone's paper.` },

    { kind: 'steps', title: 'How salting works',
      body: 'It is a small change with a big effect.',
      steps: [
        { title: 'Pick a random salt', body: 'When a user sets a password, generate a fresh random salt (a handful of random bytes). Every user gets their own.' },
        { title: 'Mix and hash', body: 'Hash the salt and the password together. The same password with a different salt gives a completely different hash.' },
        { title: 'Store the salt beside the hash', body: 'Keep both in the database. The salt is **not secret**; its job is to be unique, not hidden.' },
        { title: 'At login, reuse it', body: 'Read the user’s salt, mix it with the attempt, hash, compare. Same recipe, same result.' }
      ] },

    { kind: 'compare', title: 'Slow, purpose-built password hashes',
      body: `Salt stops pre-computation, but not fast guessing. So passwords use hashes built to be **deliberately slow**. Some are also **memory-hard**: each guess needs plenty of RAM, so thousands of parallel graphics-card guesses become expensive.`,
      cols: ['What to know', 'Verdict'],
      rows: [
        ['Argon2id', 'Memory-hard; won an open competition for password hashing in 2015', 'First choice for new systems'],
        ['bcrypt', 'Old (1999), battle-tested, tunable cost; only reads the first 72 bytes of a password', 'Good, very widely supported'],
        ['scrypt', 'Memory-hard, in many libraries', 'Good'],
        ['PBKDF2', 'Repeats a hash many times; not memory-hard', 'Acceptable, often where compliance requires it'],
        ['SHA-256, MD5 on their own', 'Fast, even with a salt', 'Never for passwords']
      ] },

    { kind: 'code', title: 'In practice: let a library do it',
      body: 'Never assemble this yourself. Here is Python with the `argon2-cffi` library. **Tap the highlighted lines.**',
      code: { lang: 'py', src: `
        from argon2 import PasswordHasher

        ph = PasswordHasher()

        stored = ph.hash("correct horse battery staple")
        # save \`stored\` in the database

        ph.verify(stored, attempt)     # raises an error if wrong
        if ph.check_needs_rehash(stored):
            stored = ph.hash(attempt)  # upgrade quietly at login`,
        notes: {
          3: 'The library picks sensible defaults. The **work factor** (how slow each hash is) is a setting you can raise.',
          5: 'It generates a random salt for you. The result is one string that contains the algorithm, its settings, the salt **and** the hash, so you store a single column.',
          8: 'Verification re-reads the salt and settings from the stored string. You never handle the salt yourself.',
          9: 'Hardware gets faster, so you raise the work factor over time. This check spots old hashes, and you can upgrade them the next time that user logs in.'
        } },
      note: 'Do not quote cost numbers from memory or old blog posts. Follow current OWASP guidance and raise the work factor as hardware improves.' },

    { kind: 'tip', title: 'Pepper: a secret the database does not hold',
      body: `A salt is public-ish and sits next to the hash. A **pepper** is different: a secret value mixed in that is kept **outside the database**, for example in a secrets manager or in the app’s configuration.

        If an attacker steals only the database (a very common breach), the pepper is missing, and cracking gets much harder.

        It is an extra layer, not a replacement for salting and slow hashing. The trade-off: if you ever lose or rotate the pepper carelessly, **nobody can log in**.`,
      note: 'Salt: unique per user, stored beside the hash. Pepper: one secret, stored away from the data.' },

    { kind: 'realworld', title: 'Breach lists and credential stuffing',
      body: `Billions of leaked email and password pairs are circulating. Attackers do not need to crack *your* site: they take pairs leaked from site A and try them on yours. This is **credential stuffing**. It works because people reuse passwords.

        Strong hashing cannot help here, since the password is being typed in correctly. The defences are different:

        - **Rate-limit** and monitor failed logins
        - Offer **multi-factor authentication**
        - **Check new passwords against known breach lists**
        - Favour **length over fussy rules**, which is current NIST guidance` }
  ],

  activities: [
    { type: 'order', after: 1, prompt: 'Put the login check in order.',
      items: ['The user types their password (sent over HTTPS)', 'The server fetches the stored salt and hash for that email', 'The server hashes the attempt with that salt', 'The server compares the result with the stored hash', 'If they match, the user is let in'],
      explain: 'The server never decrypts anything. It repeats the same recipe on the attempt and checks whether the fingerprints agree.' },

    { type: 'mcq', after: 2, q: 'SHA-256 is cryptographically secure. Why is it still a poor choice for storing passwords?',
      options: ['It is so fast that attackers can try huge numbers of guesses per second', 'It can be reversed if the attacker has the right key', 'Its output is too short to be unique', 'It has been broken, like MD5'],
      answer: 0,
      explain: 'Security against reversing is not the issue; the problem is guessing speed. Password hashes are deliberately slow and memory-hungry so each guess is expensive.',
      why: [null, 'Hashes have no key. They cannot be reversed, only guessed.', 'Output size is not the weakness; SHA-256 output is long enough.', 'SHA-256 is not broken. It is simply the wrong tool for this job.'] },

    { type: 'tf', after: 4, statement: 'A salt must be kept secret, just like a password.', answer: false,
      explain: 'A salt is stored right next to the hash. It only has to be random and unique per user, so identical passwords hash differently and pre-computed tables are useless.' },

    { type: 'multi', q: 'What does a unique random salt per user achieve?',
      options: ['Two users with the same password get different hashes', 'Pre-computed rainbow tables no longer match', 'Each stolen hash has to be attacked separately', 'A weak password becomes impossible to guess', 'The server no longer needs to hash the password'],
      answers: [0, 1, 2],
      explain: 'Salting breaks sharing and pre-computation. It does not make a weak password strong; for that you need a slow hash and a long password.' },

    { type: 'bucket', prompt: 'Sort each way of storing passwords.', buckets: ['Acceptable', 'Never'],
      items: [['Argon2id through a library', 0], ['bcrypt with a per-user salt', 0], ['Plain text, "for support purposes"', 1], ['Unsalted SHA-256', 1], ['Salted MD5', 1], ['Passwords encrypted with AES, key stored on the same server', 1], ['scrypt through a library', 0], ['PBKDF2 through a library', 0]],
      explain: 'Plain text and encryption can both be undone (encryption by anyone who steals the key). Fast hashes, even salted, are too quick to guess against. Slow salted hashes from a library are the answer.' },

    { type: 'spot', prompt: 'A developer wrote this sign-up code. Which line is the real weakness?',
      code: { lang: 'py', src: `
        def register(email, password):
            salt = os.urandom(16)
            digest = hashlib.sha256(salt + password.encode()).hexdigest()
            db.save(email, salt, digest)` },
      lines: [3],
      explain: 'The random salt is good, and storing it is right. But SHA-256 is fast, so each guess is cheap. Swap that line for a slow password hash such as Argon2id or bcrypt from a vetted library.' },

    { type: 'cloze', text: 'A {{salt}} is random, unique per user and stored beside the hash. A {{pepper}} is a secret kept outside the database. As hardware gets faster you raise the {{work factor}}.',
      distractors: ['checksum', 'token', 'collision'],
      explain: 'Salt stops shared and pre-computed attacks. Pepper protects against a database-only leak. The work factor keeps each guess expensive as computers improve.' },

    { type: 'short', q: 'Which algorithm, the winner of a 2015 password hashing competition, is the current first choice for new systems?', accept: ['Argon2', 'Argon2id'], hint: 'It starts with A and is memory-hard.',
      explain: 'Argon2id is the recommended default. bcrypt, scrypt and PBKDF2 are acceptable alternatives when needed.' },

    { type: 'scenario', title: 'The leak at Lantern Books',
      intro: 'Your small bookshop site was breached. The attacker copied the users table, where passwords are stored as plain, **unsalted SHA-256** hashes. You are the developer on call.',
      meters: { 'user trust': 60, 'exposure': 80 },
      steps: [
        { text: 'The breach is confirmed. What is your first move?',
          choices: [
            { label: 'Force password resets and tell users promptly', score: 2, effects: { 'user trust': 10, 'exposure': -30 }, feedback: 'Right. Unsalted fast hashes will fall to guessing, and people reuse passwords elsewhere, so users must hear it from you quickly and change them.' },
            { label: 'Wait and see whether the hashes get cracked', score: 0, effects: { 'user trust': -30, 'exposure': 10 }, feedback: 'By the time you see proof, accounts have been taken over. Assume weak passwords will be cracked.' },
            { label: 'Quietly delete the old table and carry on', score: 1, effects: { 'user trust': -15, 'exposure': -5 }, feedback: 'The attacker already has their copy. Deleting yours fixes nothing and hides the problem from your users.' }
          ] },
        { text: 'Now rebuild the login system. How should passwords be stored?',
          choices: [
            { label: 'Argon2id via a well-reviewed library, with a unique salt per user', score: 2, effects: { 'user trust': 10, 'exposure': -25 }, feedback: 'Exactly: slow, salted and built by experts. Rehash existing users the next time they log in.' },
            { label: 'Switch to SHA-512 because it is bigger', score: 0, effects: { 'exposure': 5 }, feedback: 'Still a fast hash. Bigger output does not slow down guessing.' },
            { label: 'Encrypt passwords with AES and keep the key in the config file', score: 1, effects: { 'user trust': -5, 'exposure': -5 }, feedback: 'Better than nothing, but a thief who finds the key (often next to the data) reads every password. Hashing means there is no key to steal.' }
          ] },
        { text: 'A week later your login endpoint sees thousands of attempts, each with an email and a password that look real. These come from lists leaked from other sites. What do you do?',
          choices: [
            { label: 'Rate-limit logins, add multi-factor authentication and block known breached passwords', score: 2, effects: { 'user trust': 20, 'exposure': -20 }, feedback: 'This is credential stuffing. The hashes are fine; the passwords are reused. Those three measures all cut it down.' },
            { label: 'Demand 16-character passwords with symbols', score: 1, effects: { 'user trust': -5, 'exposure': -5 }, feedback: 'Length helps for new passwords, but stuffing uses passwords people already reuse. It does nothing about the reuse.' },
            { label: 'Blame users for reusing passwords and do nothing', score: 0, effects: { 'user trust': -20, 'exposure': 15 }, feedback: 'They do reuse passwords; that is exactly why you must defend against it. Your site gets the blame when accounts are drained.' }
          ] }
      ],
      outro: 'Store passwords with a slow salted hash, and assume attackers already hold other sites’ leaks.' }
  ],

  flashcards: [
    { q: 'Why should passwords never be stored in plain text?', a: 'A breach, a backup or a curious employee would expose every password, and users reuse passwords on other sites.' },
    { q: 'Why is a fast hash like SHA-256 wrong for passwords?', a: 'Speed lets an attacker with stolen hashes make billions of guesses per second. Password hashes are deliberately slow.' },
    { q: 'What is a salt, and is it secret?', a: 'A random value, unique per user, mixed in before hashing and stored beside the hash. It is not secret. It defeats rainbow tables and hides identical passwords.' },
    { q: 'What is a pepper?', a: 'A secret value mixed into the hash and kept outside the database, so a database-only leak is much harder to crack.' },
    { q: 'Which algorithms should you use for passwords?', a: 'Argon2id first, then scrypt or bcrypt, or PBKDF2 where required. Use a library and follow current OWASP guidance for the work factor.' }
  ],

  glossary: [
    { term: 'Salt', def: 'A random value, unique per user, added to a password before hashing and stored next to the hash. It is not secret.', like: 'A different exam paper for each student.' },
    { term: 'Rainbow table', def: 'A pre-computed lookup table of passwords and their hashes, used to reverse unsalted hashes quickly.', like: 'The answer book to a test.' },
    { term: 'Work factor', def: 'A setting that controls how slow a password hash is to compute. You raise it as hardware improves.', aka: ['cost factor'] },
    { term: 'Pepper', def: 'A secret value mixed into password hashes and stored outside the database.', like: 'A secret ingredient kept in a locked pantry, not on the recipe card.' },
    { term: 'Credential stuffing', def: 'An attack that tries email and password pairs leaked from one site on many other sites, hoping people reused them.', like: 'Trying a stolen key on every door in the street.' }
  ],

  takeaways: [
    'Store a **slow, salted hash**, never the password itself.',
    'Fast hashes (MD5, SHA-256) help attackers; use **Argon2id**, scrypt, bcrypt or PBKDF2 from a library.',
    'A **salt** is public but unique; a **pepper** is secret and kept elsewhere.',
    'Credential stuffing beats good hashing, so add rate limits, MFA and breached-password checks.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('cr-encryption', {
  eli5: 'Encryption scrambles data so only someone with the right key can read it: either one shared key for both locking and unlocking, or a public padlock anyone can use and a private key only you hold.',

  cards: [
    { kind: 'concept', title: 'Three things people mix up',
      body: `You find the text \`SGVsbG8=\` in a config file. Is it secret? Not at all: it is just **Base64**, and it decodes to \`Hello\`. Anyone can do that in a second, with no key.

        Three tools get confused all the time:

        - **Encoding** changes the *format* of data (Base64, hex) so it travels safely. It hides nothing.
        - **Hashing** makes a one-way fingerprint. You covered it in the last two lessons.
        - **Encryption** scrambles data so only someone with the **key** can read it back.

        Only one of those is about keeping secrets.` },

    { kind: 'compare', title: 'Encoding vs hashing vs encryption',
      body: 'Ask two questions of any scheme: can I get the data back, and what does it take?',
      cols: ['Encoding', 'Hashing', 'Encryption'],
      rows: [
        ['Goal', 'Safe format for transport', 'Fingerprint / comparison', 'Keep data secret'],
        ['Reversible?', 'Yes, by anyone', 'No', 'Yes, with the key'],
        ['Needs a key?', 'No', 'No', 'Yes'],
        ['Examples', 'Base64, hex, URL encoding', 'SHA-256, Argon2id', 'AES, RSA']
      ] },

    { kind: 'metaphor', title: 'Symmetric: one key for the front door',
      body: `In **symmetric encryption**, the same key locks and unlocks, like the key to your front door. The standard is **AES**. It is fast, trusted worldwide, and built into modern processors.

        It has one big weakness: **both sides need the same key**. If you are posting a locked box to a friend, how do you get them the key safely? If you send it in the same post, a thief gets both.

        That is the **key distribution problem**, and it is why people invented a very different kind of lock.`,
      note: 'AES scrambles data in fixed-size blocks. A "mode" decides how blocks are chained, and getting that wrong is a classic bug. One more reason to use a library, never your own code.' },

    { kind: 'metaphor', title: 'Asymmetric: a padlock anyone can snap shut',
      body: `**Asymmetric encryption** uses a **key pair**. Picture a padlock you hand out freely. Anyone can click it shut on a box, but only *you* hold the key that opens it.

        - The **public key** is the open padlock. Share it with everyone.
        - The **private key** opens it. It never leaves you.

        Whatever the public key locks, only the private key unlocks. The famous algorithms are **RSA** and **elliptic curves**, which reach similar strength with much shorter keys.

        The catch: asymmetric maths is **slow**, so it handles small jobs, not bulk data.` },

    { kind: 'sequence', title: 'Sending a secret to a shop',
      body: 'No shared key needed beforehand. Step through it.',
      actors: ['You', 'Eavesdropper', 'Shop'],
      steps: [
        { from: 2, to: 0, label: 'public key', note: 'The shop publishes its public key. It is meant to be seen by everyone.' },
        { at: 1, label: 'copies the public key', note: 'The eavesdropper grabs it too. That is fine; it can only lock things.' },
        { at: 0, label: 'lock message with it', note: 'You encrypt your card details with the shop’s public key.' },
        { from: 0, to: 2, label: 'encrypted message', note: 'The scrambled message travels across the open internet.' },
        { at: 1, label: 'sees only scrambled bytes', note: 'The eavesdropper holds the public key, but it cannot undo what it locked.' },
        { at: 2, label: 'unlock with private key', note: 'Only the shop’s private key opens it. Mission accomplished, without ever sharing a secret first.' }
      ] },

    { kind: 'steps', title: 'Diffie–Hellman: agreeing a secret in public',
      body: 'Two strangers shout across a crowded room and still end up with a secret nobody else knows. The trick is easiest with paint.',
      steps: [
        { title: 'Agree on a public colour', body: 'Alice and Bob openly agree on a starting colour, say yellow. Everyone, including Eve the eavesdropper, can hear.' },
        { title: 'Each picks a private colour', body: 'Alice secretly picks red, Bob secretly picks blue. These are never shared.' },
        { title: 'Mix and swap', body: 'Alice mixes yellow and red and sends the result over. Bob mixes yellow and blue and does the same. Eve sees both mixes.' },
        { title: 'Add your own secret', body: 'Alice adds her red to Bob’s mix; Bob adds his blue to Alice’s. Both end up with yellow + red + blue: the **same colour**.' },
        { title: 'Eve is stuck', body: 'Un-mixing paint is hard. In real life the "mixing" is a maths operation that is easy one way and infeasible to reverse. Modern systems use an elliptic-curve version.' }
      ] },

    { kind: 'concept', title: 'The best of both: a hybrid',
      body: `Symmetric is fast but needs a shared key. Asymmetric solves the sharing but is slow. So real systems **combine** them:

        1. Use asymmetric tools (a key pair, or Diffie–Hellman) to agree a fresh **session key**.
        2. Switch to fast symmetric encryption, such as AES, for all the actual data.

        It is like using a slow, careful courier to deliver a single front-door key, and then talking through the front door all day.

        This is precisely how HTTPS works. Two lessons from now you will watch it happen.` },

    { kind: 'compare', title: 'At rest and in transit',
      body: 'Data can be exposed in two situations, and each needs its own protection.',
      cols: ['At rest', 'In transit'],
      rows: [
        ['Where', 'On disks, in databases and backups', 'Moving across a network'],
        ['Threat', 'Stolen drive, leaked backup, curious admin', 'Eavesdropper or tamperer on the path'],
        ['Typical tool', 'Disk and database encryption, AES', 'TLS (HTTPS)'],
        ['Key question', 'Where is the key stored?', 'Is the other end really who it claims?']
      ] },

    { kind: 'pitfall', title: 'Never invent your own cryptography',
      body: `Writing a cipher feels like a clever puzzle. Real crypto is a field where **smart people's secret schemes get broken routinely**, and the flaws are invisible until an attacker finds them. Experts only trust algorithms that have been attacked in public for years.

        So:

        - Use a **well-reviewed library** and its recommended defaults. Never XOR-with-a-password it yourself.
        - Treat the **key** as the real secret. A key stored next to the encrypted data, or committed to Git, protects nothing.
        - Lose the key and the data is gone for ever. That is the point.` }
  ],

  activities: [
    { type: 'bucket', after: 1, prompt: 'Which of the three is it?', buckets: ['Encoding', 'Hashing', 'Encryption'],
      items: [['Base64', 0], ['Hexadecimal', 0], ['SHA-256', 1], ['bcrypt', 1], ['AES', 2], ['RSA', 2]],
      explain: 'Encoding changes the format, with no secret. Hashing is one-way. Encryption needs a key and can be undone with it. Base64 in a config file is not protection.' },

    { type: 'mcq', after: 3, q: 'A shop publishes a public key. You encrypt your card number with it. Which key can read the message?',
      options: ['The shop’s private key, and only that', 'The same public key you used to lock it', 'Your own private key', 'Any key from the same algorithm'],
      answer: 0,
      explain: 'What the public key locks, only its matching private key opens. That is why the public key can be shared with the whole world.',
      why: [null, 'The public key can only lock, which is why sharing it is safe.', 'Your private key belongs to your own pair, not the shop’s.', 'Keys come in matched pairs. Only the partner works.'] },

    { type: 'tf', after: 5, statement: 'In Diffie–Hellman, the two parties send each other the final shared secret.', answer: false,
      explain: 'They only swap partial "mixes". Each then combines the other’s mix with a private value that never leaves them, and both arrive at the same secret independently.' },

    { type: 'multi', q: 'Which statements about asymmetric encryption are true?',
      options: ['The public key can be shared openly', 'It is generally slower than symmetric encryption', 'The private key must never leave its owner', 'It needs both sides to hold the same key', 'It is normally used to encrypt all the bulk data'],
      answers: [0, 1, 2],
      explain: 'Key pairs remove the need for a shared secret, but the maths is slow, so systems only use it to set up a symmetric key and then switch.' },

    { type: 'match', prompt: 'Match each name to its role.',
      pairs: [['AES', 'Fast symmetric encryption for bulk data'], ['RSA', 'Asymmetric key-pair algorithm'], ['Elliptic curves', 'Asymmetric maths with much shorter keys'], ['Diffie–Hellman', 'Two strangers agree a shared secret in public'], ['Base64', 'Encoding, not protection']] },

    { type: 'spot', prompt: 'A developer says card numbers are "encrypted before saving". Which line shows the real problem?',
      code: { lang: 'js', src: `
        function protect(card) {
          const secret = Buffer.from(card).toString('base64');
          db.save(secret);
        }` },
      lines: [2],
      explain: 'Base64 is encoding, not encryption. Anyone who reads the database can decode it instantly. A real fix is encryption through a vetted library, with the key kept outside the database.' },

    { type: 'cloze', text: '{{Symmetric}} encryption such as {{AES}} uses one shared key. In {{asymmetric}} encryption you lock with the {{public}} key and unlock with the private key.',
      distractors: ['hashing', 'Base64', 'salt'],
      explain: 'One key both ways is symmetric. A matched pair, where the public half locks and the private half unlocks, is asymmetric.' },

    { type: 'short', q: 'What three-letter name is given to the standard fast symmetric cipher used almost everywhere?', accept: ['AES'], hint: 'Advanced Encryption Standard.',
      explain: 'AES is the workhorse of symmetric encryption, used for disks, databases, and the data inside HTTPS.' },

    { type: 'scenario', title: 'Securing the notes app',
      intro: 'You are building a notes app. Three security calls land on your desk this week. Each one tests whether you reach for the right kind of protection.',
      meters: { 'data safety': 40, 'sanity': 80 },
      steps: [
        { text: 'A backup drive of the notes database goes missing from the office. How could you have made that harmless?',
          choices: [
            { label: 'Encrypt the data at rest, with the key in a separate secrets store', score: 2, effects: { 'data safety': 30 }, feedback: 'A thief gets scrambled bytes and no key. The key location is the real security: it must not sit beside the data.' },
            { label: 'Base64-encode every note', score: 0, effects: { 'data safety': -10, 'sanity': -10 }, feedback: 'Base64 is encoding. The thief decodes the lot in seconds, and now you have given a false sense of security.' },
            { label: 'Hash every note', score: 1, effects: { 'data safety': 5, 'sanity': -15 }, feedback: 'It hides the notes, but nobody can ever read them again, including your users. Hashing is the wrong tool when data must come back.' }
          ] },
        { text: 'Two of your servers must start sharing an encryption key, and the only link between them is the public internet. What now?',
          choices: [
            { label: 'Use a key exchange such as Diffie–Hellman, as TLS does', score: 2, effects: { 'data safety': 25 }, feedback: 'Exactly. They derive the same key without it ever being sent. In practice you simply use TLS and it does this for you.' },
            { label: 'Email the key to the second server’s admin', score: 0, effects: { 'data safety': -25 }, feedback: 'Anyone who reads that email now holds the key. This is the key distribution problem in action.' },
            { label: 'Hard-code the same key in both codebases', score: 1, effects: { 'data safety': -5 }, feedback: 'It works, but the key now lives in Git history and every laptop, and you can never rotate it cleanly.' }
          ] },
        { text: 'A colleague proposes a home-made cipher: "XOR each byte with a secret word. Nobody knows how it works, so nobody can break it."',
          choices: [
            { label: 'Decline politely and use a well-reviewed library built on AES', score: 2, effects: { 'data safety': 25, 'sanity': 15 }, feedback: 'Secrecy of the method is not security. Public, heavily attacked algorithms are the ones worth trusting.' },
            { label: 'Ship it, then ask a friend to review it later', score: 1, effects: { 'data safety': -10, 'sanity': -10 }, feedback: 'A friend’s review is not decades of public attack. Repeating-key XOR falls to textbook techniques.' },
            { label: 'Ship it. Obscurity is a defence', score: 0, effects: { 'data safety': -25, 'sanity': -20 }, feedback: 'Attackers assume they know the algorithm. Only the key should be secret.' }
          ] }
      ],
      outro: 'Pick the right tool (encryption, not encoding or hashing), protect the key, and use a library.' }
  ],

  flashcards: [
    { q: 'Encoding vs hashing vs encryption?', a: 'Encoding is a reversible format change with no secret. Hashing is one-way. Encryption is reversible only with a key.' },
    { q: 'What is symmetric encryption and its main weakness?', a: 'One shared key locks and unlocks (e.g. AES). Its weakness is getting that key safely to the other side.' },
    { q: 'How do public and private keys work together?', a: 'The public key locks and can be shared; only the matching private key unlocks. Asymmetric maths (RSA, elliptic curves) is slower than AES.' },
    { q: 'What does Diffie–Hellman achieve?', a: 'Two parties agree a shared secret over a public channel without ever sending it.' },
    { q: 'Encryption at rest vs in transit?', a: 'At rest protects stored data (disks, backups). In transit protects data moving over a network, usually with TLS.' }
  ],

  glossary: [
    { term: 'Encryption', def: 'Scrambling data with a key so that only someone with the right key can read it back.', like: 'A lockbox that opens only with its key.' },
    { term: 'Symmetric encryption', def: 'Encryption where the same key locks and unlocks. AES is the standard example.', like: 'One front-door key, copied for both people.', aka: ['shared-key encryption'] },
    { term: 'Public/private key pair', def: 'Two matched keys: a public one you share and a private one you keep. What one locks, only the other unlocks.', like: 'A padlock anyone can snap shut, with the only key held by you.', aka: ['asymmetric keys'] },
    { term: 'Diffie–Hellman', def: 'A method for two parties to agree on a shared secret over a public channel without sending the secret itself.', like: 'Mixing paint colours so both end with the same shade.', aka: ['key exchange'] },
    { term: 'AES', def: 'The Advanced Encryption Standard: the fast, trusted symmetric cipher used for most bulk encryption.' }
  ],

  takeaways: [
    '**Encoding** hides nothing, **hashing** is one-way, **encryption** needs a key.',
    '**Symmetric** (AES): one key, fast. **Asymmetric** (RSA, elliptic curves): a key pair, slower.',
    '**Diffie–Hellman** lets strangers agree a secret in public; real systems then switch to AES.',
    'Never invent your own crypto, and never keep the key beside the data.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('cr-signatures', {
  eli5: 'A digital signature proves a message really came from its sender and was not changed on the way; an HMAC does the same job when both sides share a secret.',

  cards: [
    { kind: 'concept', title: 'Who really sent this?',
      body: `Your shop exposes a web address for payment alerts: when a payment succeeds, the card company sends a request saying "order 42 is paid". Your code then ships the goods.

        But anyone on the internet can send a request to that address. How do you know it is really the card company, and not a stranger typing "order 42 is paid" into a terminal?

        Two separate questions:

        - **Authenticity:** did this really come from who it claims?
        - **Integrity:** is it exactly what they sent, with nothing altered?

        Hashing alone cannot answer either, because anyone can compute a hash.` },

    { kind: 'metaphor', title: 'The wax seal',
      body: `Before email, important letters were closed with a **wax seal** pressed by a signet ring. Only the owner had the ring. Anyone could look at the seal and recognise it, and a broken seal showed the letter had been opened.

        A **digital signature** works the same way:

        - Only the owner can **create** it (private key, like the ring).
        - Anybody can **check** it (public key, like knowing what the seal looks like).
        - Change a word and the seal no longer matches.

        Note the letter is still readable. A seal proves who and untouched, not secret.` },

    { kind: 'sequence', title: 'Signing and verifying',
      body: 'Remember that hashes are short and signing is slow, so we sign the **hash**, not the whole message.',
      actors: ['Signer', 'Verifier'],
      steps: [
        { at: 0, label: 'hash the message', note: 'A short fingerprint of the message, however long the message is.' },
        { at: 0, label: 'sign hash with private key', note: 'Only the signer’s private key can produce this signature.' },
        { from: 0, to: 1, label: 'message + signature', note: 'Both travel together. Neither is secret.' },
        { at: 1, label: 'hash the message again', note: 'The verifier computes their own fingerprint of what arrived.' },
        { at: 1, label: 'check with public key', note: 'The public key tells them what hash the signer signed.' },
        { at: 1, label: 'match? valid. Otherwise reject', note: 'A different message gives a different hash, so any change is caught.' }
      ] },

    { kind: 'concept', title: 'What a valid signature proves',
      body: `If the check passes, you know three things:

        - **Authenticity:** it was made by whoever holds that private key.
        - **Integrity:** the message is byte-for-byte what was signed.
        - **Non-repudiation:** the signer cannot credibly claim "that was not me", because nobody else has the private key.

        What it does **not** do: hide the message. A signed message is readable by anyone.`,
      note: 'Real algorithms (RSA, ECDSA, Ed25519) differ in the details of how signing works, but the sign-the-hash-with-the-private-key picture is the right way to think about it.' },

    { kind: 'metaphor', title: 'HMAC: a secret handshake',
      body: `Sometimes both sides already share a secret, and public/private keys are overkill. **HMAC** (hash-based message authentication code) mixes the **shared secret** into a hash of the message to produce a short **tag**.

        The sender attaches the tag. The receiver recomputes it with the same secret and compares. A stranger who lacks the secret cannot make a tag that matches.

        It is like a secret handshake between two friends: each recognises the other, and a stranger cannot fake it.

        Do not glue "secret + message" together yourself and hash it. Use the real HMAC construction from your library.` },

    { kind: 'compare', title: 'Signature vs HMAC',
      body: 'Same goals, different key arrangements.',
      cols: ['Digital signature', 'HMAC'],
      rows: [
        ['Keys', 'Private key signs, public key verifies', 'One shared secret does both'],
        ['Who can create one?', 'Only the private-key owner', 'Anyone holding the secret'],
        ['Authenticity + integrity', 'Yes', 'Yes'],
        ['Non-repudiation', 'Yes', 'No: both sides could have made it'],
        ['Speed', 'Slower', 'Very fast']
      ] },

    { kind: 'code', title: 'Checking a webhook in Node.js',
      body: 'The card company signs each alert with HMAC and a secret you both hold. **Tap the highlighted lines.**',
      code: { lang: 'js', src: `
        import { createHmac, timingSafeEqual } from 'node:crypto';

        function isGenuine(rawBody, signatureHex, secret) {
          const expected = createHmac('sha256', secret)
            .update(rawBody)
            .digest();
          const given = Buffer.from(signatureHex, 'hex');
          return given.length === expected.length
            && timingSafeEqual(given, expected);
        }`,
        notes: {
          5: 'Recompute the tag over the **raw bytes** you received. If you parse the JSON and re-write it, the bytes can differ and the tag will not match.',
          8: 'The tag from the request header, converted from hex.',
          10: 'A **constant-time** comparison. A normal `===` can leak, through tiny timing differences, how many leading characters were right.'
        } } },

    { kind: 'realworld', title: 'Where you will meet them',
      body: `- **JWTs** (login tokens, coming in the next module) carry either an HMAC tag or a signature, so a server can tell whether the token has been altered.
        - **Webhooks:** Stripe, GitHub and many others sign each alert so you can reject forgeries.
        - **Software updates and packages:** your phone or package manager only installs an update if its signature verifies against the vendor’s public key baked in.
        - **Signed Git commits and tags**, and later, the **certificates** in the next lesson.

        The pattern is always: attach proof, let the receiver check it.` },

    { kind: 'pitfall', title: 'Signed does not mean secret',
      body: `Two classic misunderstandings:

        **"It is signed, so nobody can read it."** Wrong. Signing proves origin and integrity, not secrecy. To hide the content you must encrypt as well.

        **"The signature is valid, so it is fresh."** Also wrong. An attacker can record a genuine signed message and **replay** it tomorrow. Defences include putting a timestamp or unique ID inside the signed data and rejecting anything old or already seen.

        Finally, verifying only helps if you hold the **right** public key. How you know whose key is whose is the next-but-one lesson.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'In a digital signature, which key does the **verifier** use?',
      options: ['The signer’s public key', 'The signer’s private key', 'A key they share secretly with the signer', 'No key; a hash is enough'],
      answer: 0,
      explain: 'The private key makes signatures and stays secret. The public key is shared so anyone can check them but nobody can forge them.',
      why: [null, 'If the verifier had the private key they could forge signatures too.', 'That describes HMAC, not a signature.', 'Anyone can compute a hash. The key is what proves who made it.'] },

    { type: 'match', after: 3, prompt: 'Match each guarantee to its meaning.',
      pairs: [['Authenticity', 'It really came from the claimed sender'], ['Integrity', 'It has not been changed since signing'], ['Non-repudiation', 'The sender cannot credibly deny sending it'], ['Signing key', 'The private key'], ['Verifying key', 'The public key']] },

    { type: 'tf', after: 5, statement: 'An HMAC proves which of two parties who share the secret created a message.', answer: false,
      explain: 'Both parties hold the same secret, so either could have produced the tag. HMAC gives authenticity against outsiders and integrity, but no non-repudiation. For that you need a signature.' },

    { type: 'order', prompt: 'Put the software-update check in order.',
      items: ['The vendor hashes the update and signs the hash with its private key', 'The device downloads the update and its signature', 'The device hashes the downloaded update itself', 'The device checks the signature using the vendor’s public key', 'Only if the check passes does it install'],
      explain: 'Anyone can host the file, so trust comes from the signature. A tampered update would hash differently and fail the check, so it is never installed.' },

    { type: 'multi', q: 'Which of these does a valid digital signature give you?',
      options: ['The message really came from the key holder', 'The message was not altered after signing', 'The signer cannot credibly deny it', 'The message is hidden from eavesdroppers', 'The message can never be replayed later'],
      answers: [0, 1, 2],
      explain: 'Signatures give authenticity, integrity and non-repudiation. They do not hide content, and a genuine signed message can be replayed unless you add a timestamp or unique ID.' },

    { type: 'bucket', prompt: 'Signature or HMAC?', buckets: ['Digital signature', 'HMAC'],
      items: [['The signer keeps a private key nobody else holds', 0], ['Both sides hold one shared secret', 1], ['A third party can verify but cannot forge', 0], ['Very fast, ideal for high-volume API checks', 1], ['Provides non-repudiation', 0], ['A webhook check where you hold the endpoint’s signing secret', 1]],
      explain: 'Public-key signatures separate who can sign from who can check. HMAC is simpler and faster but anyone with the secret can create valid tags.' },

    { type: 'spot', prompt: 'This webhook handler has a serious ordering bug. Which line?',
      code: { lang: 'js', src: `
        app.post('/hooks/pay', (req, res) => {
          markOrderPaid(req.body.orderId);
          const ok = verifyHmac(req);
          if (!ok) return res.sendStatus(401);
          res.sendStatus(200);
        });` },
      lines: [2],
      explain: 'The order is marked paid before the signature is checked, so a forged request has already done its damage when it is rejected. Verify first, act second.' },

    { type: 'short', q: 'Which key does a signer keep secret: public or private?', accept: ['private'], hint: 'Think of the signet ring.',
      explain: 'The private key creates signatures and must never be shared. The public key is handed out so anyone can verify.' },

    { type: 'scenario', title: 'The forged payment alert',
      intro: 'Your shop ships goods when the card company’s webhook says an order is paid. Yesterday a customer got a laptop for free: someone posted a fake "paid" alert.',
      meters: { 'fraud losses': 80, 'confidence': 40 },
      steps: [
        { text: 'How should your endpoint decide whether an alert is genuine?',
          choices: [
            { label: 'Check an HMAC tag made with the secret you share with the card company', score: 2, effects: { 'fraud losses': -35, 'confidence': 20 }, feedback: 'Exactly. A stranger without the secret cannot produce a valid tag, and any edit to the body breaks it.' },
            { label: 'Trust the order ID in the body if it exists in your database', score: 0, effects: { 'fraud losses': 10, 'confidence': -20 }, feedback: 'Order IDs are guessable and easy to find. That is exactly how the fake alert worked.' },
            { label: 'Only accept requests from the card company’s published IP addresses', score: 1, effects: { 'fraud losses': -10, 'confidence': 5 }, feedback: 'It helps as an extra layer, but addresses change and can be spoofed in some setups. A signature is the real proof.' }
          ] },
        { text: 'You now compute the tag. Which implementation detail matters most?',
          choices: [
            { label: 'Use the raw request bytes and a constant-time comparison', score: 2, effects: { 'fraud losses': -15, 'confidence': 15 }, feedback: 'Raw bytes avoid re-serialisation mismatches and constant-time comparison avoids timing leaks.' },
            { label: 'Parse the JSON, tidy it, then hash your re-written version', score: 1, effects: { 'confidence': -10 }, feedback: 'Re-writing can reorder keys or change spacing, so genuine alerts will fail verification.' },
            { label: 'Check that a header says the sender is the card company', score: 0, effects: { 'fraud losses': 10, 'confidence': -15 }, feedback: 'Anyone can write any header. Only a value derived from the secret proves anything.' }
          ] },
        { text: 'An attacker records a genuine signed alert for a cheap order and sends it again later for a different shipment. How do you stop replays?',
          choices: [
            { label: 'Include a timestamp in the signed data and reject old alerts', score: 2, effects: { 'fraud losses': -20, 'confidence': 20 }, feedback: 'A signature proves the message is genuine, not new. A signed timestamp lets you refuse anything stale.' },
            { label: 'Keep a list of event IDs and ignore repeats', score: 1, effects: { 'fraud losses': -10, 'confidence': 10 }, feedback: 'A good complement, since duplicates are ignored, but the list grows without bound. Alongside a signed timestamp it is excellent.' },
            { label: 'Nothing; a valid signature is valid for ever', score: 0, effects: { 'fraud losses': 15, 'confidence': -20 }, feedback: 'That is exactly the replay attack.' }
          ] }
      ],
      outro: 'Verify first, check the right bytes, and make signed messages go stale.' }
  ],

  flashcards: [
    { q: 'What do authenticity and integrity mean?', a: 'Authenticity: it came from who it claims. Integrity: it has not been altered.' },
    { q: 'How does a digital signature work?', a: 'Hash the message, sign the hash with the private key, and anyone can verify with the public key.' },
    { q: 'What is HMAC?', a: 'A keyed hash using a shared secret: authenticity and integrity against outsiders, but no non-repudiation.' },
    { q: 'Signature vs HMAC: when would you pick each?', a: 'HMAC when both sides share a secret and want speed (webhooks). Signatures when many verifiers must check but only one party may sign.' },
    { q: 'Does a signature hide the message or prevent replay?', a: 'No to both. Encrypt to hide it; include a timestamp or unique ID to stop replays.' }
  ],

  glossary: [
    { term: 'Digital signature', def: 'A value made by signing a message’s hash with a private key; anyone with the public key can check it.', like: 'A wax seal only you can press.' },
    { term: 'HMAC', def: 'A hash of a message mixed with a shared secret, producing a tag that proves the sender knew the secret.', like: 'A secret handshake between two friends.', aka: ['keyed hash'] },
    { term: 'Authenticity', def: 'The assurance that a message really came from the party it claims to come from.' },
    { term: 'Integrity', def: 'The assurance that data is exactly what was sent, with nothing changed.', like: 'A sealed envelope that shows tampering.' },
    { term: 'Non-repudiation', def: 'The sender cannot credibly deny having sent a signed message, since only they hold the private key.' }
  ],

  takeaways: [
    '**Signature**: sign the hash with the private key, verify with the public key.',
    '**HMAC**: hash plus a shared secret; fast, but either side could have made it.',
    'Verify first, then act, and use a constant-time comparison.',
    'Signed is **not secret** and not automatically **fresh**.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('cr-pki', {
  eli5: 'A certificate is an ID card for a website’s public key, signed by an authority your device already trusts, so you can be sure you are talking to the real site and not an impostor.',

  cards: [
    { kind: 'concept', title: 'Whose public key is this?',
      body: `Public keys solve a lot, but they leave a nasty gap. You connect to \`mybank.com\` and it hands you a public key. Great, now you can encrypt to it.

        But **whose key is it**? If an attacker sits between you and the bank, they can hand you *their own* public key and claim it is the bank’s. You would happily encrypt your password to the attacker. This is a **man-in-the-middle** attack.

        Encryption without knowing who is at the other end is just a private conversation with a stranger. We need a way to **bind a key to a name** that we can trust.` },

    { kind: 'metaphor', title: 'The passport',
      body: `At border control, the officer does not know you. They trust your **passport** because it was issued by a government they recognise, with your photo, name and an expiry date, and it is hard to forge.

        They trust the *issuer*, not you.

        A **digital certificate** is a passport for a public key. It says "this key belongs to \`mybank.com\`", and it is signed by an issuer your browser already trusts, called a **certificate authority** (CA).

        Your device ships with a list of CAs it trusts, the **trust store**. Trust is bootstrapped from there.`,
      note: 'The system of CAs, certificates and trust rules is called PKI: public key infrastructure.' },

    { kind: 'diagram', title: 'The chain of trust',
      body: 'Root CAs keep their precious keys offline, so they delegate to intermediates that do the day-to-day signing.',
      nodes: [
        { id: 'store', label: 'Your device’s trust store', icon: '🗃️', x: 1, y: 0, tone: 'muted' },
        { id: 'root', label: 'Root CA', icon: '🏛️', x: 1, y: 1, tone: 'accent' },
        { id: 'inter', label: 'Intermediate CA', icon: '🏢', x: 1, y: 2, tone: 'info' },
        { id: 'leaf', label: 'mybank.com certificate', icon: '📜', x: 1, y: 3, tone: 'good' }
      ],
      edges: [
        { from: 'store', to: 'root', label: 'already trusts' },
        { from: 'root', to: 'inter', label: 'signed' },
        { from: 'inter', to: 'leaf', label: 'signed' }
      ],
      caption: 'The site’s own certificate is the "leaf". The browser walks up from leaf to intermediate to root, and stops when it reaches one it already trusts.' },

    { kind: 'code', title: 'What is inside a certificate',
      body: 'Simplified, but these are the fields that matter. **Tap the highlighted lines.**',
      code: { lang: 'text', src: `
        Subject:        mybank.com
        Alt names:      mybank.com, www.mybank.com
        Public key:     (the site’s public key)
        Issuer:         Example Intermediate CA
        Not before:     1 March
        Not after:      1 June
        Signature:      (made by the issuer’s private key)`,
        notes: {
          1: 'The **name** the certificate is for. A certificate for one name is useless for another.',
          2: 'Subject Alternative Names list every address it covers. Browsers actually match against this list.',
          3: 'The thing being vouched for. Note there is **no private key here**: the certificate is public, and the private key stays on the server.',
          4: 'Who vouched for it. The browser looks up this issuer to continue up the chain.',
          5: 'Certificates have a lifetime. Outside these dates the browser refuses it.',
          7: 'The issuer signs all the above. Change any field and this signature no longer verifies.'
        } } },

    { kind: 'steps', title: 'What your browser checks',
      body: 'Every time you open an HTTPS site, in a blink:',
      steps: [
        { title: 'Does the name match?', body: 'The address you typed must be on the certificate’s name list. A certificate for another site is rejected.' },
        { title: 'Is it in date?', body: 'Today must fall between "not before" and "not after".' },
        { title: 'Does the chain lead to a trusted root?', body: 'Each certificate’s signature is checked using the one above it, until a root in the trust store is reached.' },
        { title: 'Has it been revoked?', body: 'Browsers use revocation lists or live status checks to see if the issuer has cancelled it early.' },
        { title: 'Does the server hold the private key?', body: 'During the handshake it proves this. We watch that happen in the next lesson.' }
      ] },

    { kind: 'realworld', title: 'Getting a certificate: Let’s Encrypt and ACME',
      body: `To get a certificate, you must prove to a CA that you **control the domain**, usually by placing a specific file on your website or a record in your DNS.

        Historically that meant forms and fees. Then **Let’s Encrypt** arrived: a free CA that issues certificates automatically through a protocol called **ACME**. A small tool on your server proves control, fetches a certificate and installs it, with no human involved.

        That is why HTTPS is now the default almost everywhere, and why certificate lifetimes can be short and renewal is automated.`,
      note: 'A certificate proves you control the name, not that the site is honest. Scam sites get padlocks too.' },

    { kind: 'concept', title: 'Expiry and revocation',
      body: `Certificates **expire** on purpose, so a stolen or mistaken one cannot work for ever. The classic outage is a certificate that quietly lapsed because nobody renewed it. Automated renewal and monitoring prevent most of these.

        Sometimes a certificate must be cancelled early, for example when its private key leaks. That is **revocation**. A CA publishes a **CRL** (certificate revocation list), or answers live queries through **OCSP**.

        Revocation checking is famously patchy in practice, which is one reason short lifetimes are popular: a compromised certificate soon expires by itself.` },

    { kind: 'metaphor', title: 'Mutual TLS: both show their passports',
      body: `Normally only the server shows its certificate; you are anonymous. In **mutual TLS** (mTLS) the **client presents a certificate too**, and the server verifies it just as strictly.

        It is like a secure building where the guard checks your pass and you also check the guard’s badge.

        It is rarely used for ordinary website visitors. It shines for **machine-to-machine** traffic, such as one internal service calling another, where every caller has to prove who it is before it is allowed in.` },

    { kind: 'pitfall', title: 'The "temporary" verify=False',
      body: `Certificate errors are annoying in development, and the tempting fix is to **turn verification off**.

        With checks disabled, your program accepts *any* certificate, including an attacker’s. It still encrypts, but to whoever is in the middle. The "temporary" setting has a habit of reaching production.

        Instead, fix the cause: a missing intermediate, a wrong name, an expired certificate, or a private CA that needs adding to the trust store properly.`,
      note: 'Self-signed certificates are fine for local experiments, as long as you tell your tools to trust that one certificate rather than trusting everything.' }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'Why does your browser trust the certificate for a website it has never visited?',
      options: ['It is signed by a certificate authority the device already trusts', 'The website’s owner said it was trustworthy', 'The certificate contains the website’s private key', 'The padlock icon appears automatically'],
      answer: 0,
      explain: 'Trust flows from the issuer, like a passport. The device ships with a trust store of root CAs, and the chain of signatures must lead back to one of them.',
      why: [null, 'A site vouching for itself proves nothing. Anyone can do that.', 'Certificates never contain the private key; that stays secret on the server.', 'The padlock is the result of the checks, not the reason.'] },

    { type: 'tf', after: 3, statement: 'A website’s certificate contains the site’s private key.', answer: false,
      explain: 'The certificate is public and holds the public key. The private key stays on the server; sharing it would let anyone impersonate the site.' },

    { type: 'order', after: 4, prompt: 'Put the browser’s checks in a sensible order.',
      items: ['Check the certificate name matches the address typed', 'Check today’s date is within the validity period', 'Follow signatures up the chain to a trusted root', 'Check the certificate has not been revoked', 'Confirm the server holds the matching private key'],
      explain: 'Cheap local checks come first, then the chain and revocation, and finally proof of key possession during the handshake. Failing any one stops the connection.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [['Certificate', 'A signed statement binding a public key to a name'], ['Certificate authority', 'The issuer whose signature browsers trust'], ['Trust store', 'The list of root CAs shipped with your device'], ['OCSP / CRL', 'Ways to check a certificate was cancelled early'], ['mTLS', 'The client presents a certificate too']] },

    { type: 'bucket', prompt: 'Will the browser accept or reject this?', buckets: ['Accepts', 'Rejects'],
      items: [['Valid chain to a trusted root, name matches, in date', 0], ['Certificate expired yesterday', 1], ['Certificate for shop.example.com served on bank.example.com', 1], ['Self-signed certificate with no trusted issuer', 1], ['A site’s certificate lists www.example.com and example.com; you visit example.com', 0], ['Leaf signed by a trusted intermediate that chains to a trusted root', 0]],
      explain: 'All three checks must pass: name, dates and a chain to a trusted root. The lab that follows lets you break each one yourself.' },

    { type: 'spot', prompt: 'This works, but which line quietly destroys the security of the connection?',
      code: { lang: 'py', src: `
        import requests
        r = requests.get("https://api.partner.com/data",
                         timeout=5,
                         verify=False)   # temporary fix` },
      lines: [4],
      explain: 'verify=False tells the library to accept any certificate, so a man-in-the-middle is invisible. Fix the real cause (name, expiry, missing intermediate, untrusted private CA) instead.' },

    { type: 'cloze', text: 'A {{certificate}} binds a public key to a name and is signed by a {{CA}}. The chain runs from the leaf through an {{intermediate}} up to a {{root}} that the device already trusts.',
      distractors: ['salt', 'session', 'token'],
      explain: 'Each link vouches for the next, and the root is trusted because it is in the device’s trust store.' },

    { type: 'short', q: 'What is the name of the protocol Let’s Encrypt uses to issue and renew certificates automatically?', accept: ['ACME'], hint: 'A four-letter acronym.',
      explain: 'ACME lets software prove domain control, fetch a certificate and renew it with no human involved.' },

    { type: 'scenario', title: 'The 3am padlock',
      intro: 'At 3am, monitoring shows customers seeing a big red browser warning on your shop. Sales have stopped. You are the one awake.',
      meters: { 'uptime': 20, 'customer trust': 60 },
      steps: [
        { text: 'The warning says the certificate has expired. What do you do first?',
          choices: [
            { label: 'Renew the certificate and install it, then reload the web server', score: 2, effects: { 'uptime': 60, 'customer trust': 5 }, feedback: 'The error is exactly what it says: it lapsed. Renewing and installing fixes it within minutes.' },
            { label: 'Switch the site to plain HTTP so the warning goes away', score: 0, effects: { 'uptime': 20, 'customer trust': -30 }, feedback: 'Customers can load pages again, but logins and cards now travel unprotected. Browsers will warn about that too.' },
            { label: 'Tell customers to click through the warning', score: 0, effects: { 'customer trust': -35 }, feedback: 'You have just taught people to ignore the warning that protects them from real attackers.' }
          ] },
        { text: 'The site is back. How do you stop it happening again?',
          choices: [
            { label: 'Automate renewal with ACME and add monitoring for expiry dates', score: 2, effects: { 'uptime': 15, 'customer trust': 15 }, feedback: 'Humans forget; software does not. Automation plus an alert before expiry removes the classic outage.' },
            { label: 'Put a reminder in a calendar for next year', score: 1, effects: { 'uptime': 5, 'customer trust': 3 }, feedback: 'Better than nothing, but reminders get lost when people leave, and lifetimes are getting shorter.' },
            { label: 'Hope it does not recur', score: 0, effects: { 'customer trust': -10 }, feedback: 'Certificates always expire on purpose. It will recur.' }
          ] },
        { text: 'A week later, a laptop containing a copy of the site’s private key is stolen. What do you do?',
          choices: [
            { label: 'Generate a new key, get a new certificate, and revoke the old one', score: 2, effects: { 'customer trust': 15, 'uptime': 5 }, feedback: 'Whoever holds the old key could impersonate the site. A new key makes the old one useless, and revocation tells clients to refuse it.' },
            { label: 'Do nothing; certificates are public anyway', score: 0, effects: { 'customer trust': -25 }, feedback: 'The certificate is public, but the **private key** is not. That key is the entire secret.' },
            { label: 'Delete the certificate file from the server', score: 1, effects: { 'uptime': -30, 'customer trust': -5 }, feedback: 'That breaks your site and does nothing about the stolen key.' }
          ] }
      ],
      outro: 'Automate renewal, monitor expiry, and treat a leaked private key as an incident.' }
  ],

  flashcards: [
    { q: 'What problem do certificates solve?', a: 'They bind a public key to a name, so you know whose public key you hold and cannot be tricked by a man-in-the-middle.' },
    { q: 'What is the chain of trust?', a: 'Leaf certificate, signed by an intermediate, signed by a root CA that is already in your device’s trust store.' },
    { q: 'What is inside a certificate?', a: 'The name(s), the public key, the issuer, the validity dates and the issuer’s signature. Never the private key.' },
    { q: 'How are certificates issued, renewed and revoked?', a: 'A CA checks you control the domain (Let’s Encrypt automates this with ACME). Certificates expire, and early cancellation uses CRLs or OCSP.' },
    { q: 'What is mutual TLS?', a: 'Both sides present certificates, so the server also verifies the client. Common between internal services.' }
  ],

  glossary: [
    { term: 'Certificate', def: 'A signed document that binds a public key to a name (such as a domain) and has start and end dates.', like: 'A passport for a public key.', aka: ['X.509 certificate', 'TLS certificate'] },
    { term: 'Certificate authority', def: 'An organisation trusted to issue certificates by checking that you control the name.', like: 'The passport office.', aka: ['CA'] },
    { term: 'Trust store', def: 'The list of root CAs built into an operating system or browser, from which all trust is derived.', like: 'The list of governments whose passports the border officer accepts.' },
    { term: 'Chain of trust', def: 'The path from a site’s certificate through intermediates to a trusted root, each signed by the one above.' },
    { term: 'Mutual TLS', def: 'TLS in which the client presents a certificate as well as the server.', like: 'Both people show ID at the door.', aka: ['mTLS'] }
  ],

  takeaways: [
    'A **certificate** binds a public key to a name, signed by a **CA** you already trust.',
    'Browsers check **name, dates, chain to a trusted root**, and revocation.',
    '**Let’s Encrypt + ACME** make issuing and renewing free and automatic.',
    'Never switch verification off; fix the real cause. **mTLS** makes clients prove themselves too.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('cr-tls', {
  eli5: 'The TLS handshake is the quick opening chat where your browser and a website check each other’s identity and agree a secret key, so everything afterwards is scrambled.',

  cards: [
    { kind: 'concept', title: 'Before the padlock appears',
      body: `You type \`https://mybank.com\`. Before a single byte of your page is sent, your browser and the server have a short conversation called the **TLS handshake**. It takes a few milliseconds and has to solve three problems at once:

        1. **Who are you?** Prove the server is really \`mybank.com\`.
        2. **What secret can we share?** Two strangers must agree a key in public.
        3. **How do we then go fast?** Asymmetric maths is too slow for all your data.

        Every piece you have learnt in this module, hashes, key exchange, signatures, certificates, plays a part.`,
      note: '**TLS** (Transport Layer Security) is the protocol; HTTPS is simply HTTP carried inside it.' },

    { kind: 'sequence', title: 'The TLS 1.3 handshake, simplified',
      body: 'Real handshakes carry more detail, but this is the honest outline. Step through it.',
      actors: ['Browser', 'Server'],
      steps: [
        { from: 0, to: 1, label: 'ClientHello: ciphers + key share', note: 'The browser lists the ciphers it supports and sends its half of a Diffie–Hellman exchange (the "paint mix").' },
        { from: 1, to: 0, label: 'ServerHello: choice + key share', note: 'The server picks a cipher and sends its own half of the exchange.' },
        { note: 'Both sides now combine what they have with their private values and independently derive the **same session keys**. Nothing secret was ever sent. From here on, everything is encrypted.' },
        { from: 1, to: 0, label: 'certificate + signed proof', dashed: true, note: 'The server sends its certificate and signs the handshake with its private key, proving the certificate is really theirs.' },
        { at: 0, label: 'verify chain, name, signature', note: 'The browser runs the certificate checks from the last lesson.' },
        { from: 0, to: 1, label: 'Finished', note: 'Each side sends a short confirmation proving that nothing in the handshake was tampered with.' },
        { from: 1, to: 0, label: 'Finished', dashed: true, note: 'The server confirms in return. The secure channel is now fully established.' },
        { from: 0, to: 1, label: 'GET / (encrypted)', note: 'The real request travels, scrambled with fast symmetric encryption.' }
      ] },

    { kind: 'concept', title: 'Hello: agreeing the rules',
      body: `The first message is a polite negotiation. The browser says which **cipher suites** it supports: combinations of key exchange, signature and encryption methods. The server picks one both can use.

        If there is no overlap, the connection fails, which is why a server stuck on ancient settings will lock out modern browsers (and the reverse).

        TLS 1.3 deliberately offers only a short list of strong, modern choices, so there is far less room to select something weak by accident.` },

    { kind: 'concept', title: 'Checking the certificate',
      body: `The server then shows its certificate and the browser applies the passport checks: name, dates, chain to a trusted root, revocation.

        But a certificate is public, so anyone could copy one and show it. To prove it is theirs, the server also **signs the handshake** with the private key that matches the certificate’s public key.

        Only the real owner can do that. An impostor can show the passport but cannot produce the matching signature, and the browser walks away.`,
      note: 'Here you meet the signature from lesson 4 and the certificate from lesson 5, working together.' },

    { kind: 'metaphor', title: 'Agreeing the session key',
      body: `Remember the paint-mixing trick from the encryption lesson? That is the heart of this step.

        Each side sent a public "mix" in its hello. Combining the other’s mix with a value kept private produces the same shared secret on both sides, while an eavesdropper who saw both mixes cannot reconstruct it.

        From that shared secret, both sides derive fresh **session keys** for this one connection. Real implementations use the elliptic-curve version of Diffie–Hellman, which keeps the numbers small.` },

    { kind: 'concept', title: 'Switching to fast symmetric encryption',
      body: `With session keys in hand, the slow asymmetric work is over. All your actual data now travels under fast **symmetric encryption**, such as AES, which modern processors handle at enormous speed.

        Each chunk is not only scrambled but also **checked for tampering**, so a changed byte is detected and the connection is dropped.

        The hybrid design is the whole trick: slow, clever maths to start, fast simple maths to carry the load.` },

    { kind: 'compare', title: 'TLS 1.2 vs TLS 1.3',
      body: 'Version 1.3 is the modern one. 1.2 is still common and acceptable when configured well.',
      cols: ['TLS 1.2', 'TLS 1.3'],
      rows: [
        ['Full handshake', 'Two round trips', 'One round trip'],
        ['Key exchange', 'Several options, some without forward secrecy', 'Always ephemeral Diffie–Hellman'],
        ['Old, weak options', 'Many remain available, so config matters', 'Removed entirely'],
        ['Server certificate', 'Sent in the clear', 'Encrypted after the hellos']
      ],
      note: 'TLS 1.3 also supports resuming a past session faster, with some replay caveats. Details are beyond this lesson.' },

    { kind: 'story', title: 'Forward secrecy: the long game',
      body: `Imagine an attacker records years of your encrypted traffic, unable to read it. Then one day they steal the server’s **private key**. Can they now decrypt everything they hoarded?

        Not with **forward secrecy**. Because each connection’s session key came from a fresh, throw-away Diffie–Hellman exchange (**ephemeral**), the long-term private key only proves identity; it never protected the session keys, and those are deleted when the connection ends.

        It is like a notepad whose pages are shredded after each conversation. Stealing the cabinet key later gets you nothing. TLS 1.3 gives this on every connection.` },

    { kind: 'realworld', title: 'SSL, obsolete versions, and spotting it',
      body: `You will still hear "**SSL certificate**". SSL was TLS’s predecessor, and it and the early **TLS 1.0 and 1.1** are obsolete and insecure. Nobody should enable them; the name "SSL" survives only as habit.

        You can watch real handshakes yourself: a browser’s padlock details show the version and cipher, and the command-line tools \`curl -v\` and \`openssl s_client\` print the negotiation.

        Often TLS ends at a load balancer or reverse proxy (called **TLS termination**), which then talks to your app. With mutual TLS, the client presents a certificate during this same handshake.` }
  ],

  activities: [
    { type: 'order', after: 1, prompt: 'Put the TLS 1.3 handshake in order.',
      items: ['The browser sends ClientHello with its ciphers and key share', 'The server replies with its chosen cipher and key share', 'Both sides derive the same session keys', 'The server sends its certificate and a signed proof, and the browser verifies them', 'Both sides confirm with Finished messages', 'Data flows under fast symmetric encryption'],
      explain: 'Hello, then key agreement, then identity, then confirmation, then bulk data. The slow asymmetric steps come first so the rest can be fast.' },

    { type: 'mcq', after: 3, q: 'A certificate is public, so anyone can copy it. Why can’t an impostor use a copied certificate?',
      options: ['The server must also sign the handshake with the matching private key', 'The certificate is encrypted, so it cannot be copied', 'Browsers only accept each certificate once', 'The certificate contains a secret password'],
      answer: 0,
      explain: 'The signature proves possession of the private key. A copied certificate without its private key fails that proof.',
      why: [null, 'Certificates are public by design.', 'Browsers accept the same certificate for millions of connections.', 'There is no password in a certificate; the proof is the signature.'] },

    { type: 'tf', after: 5, statement: 'TLS encrypts all of your data using slow asymmetric cryptography for the whole connection.', answer: false,
      explain: 'Asymmetric cryptography and key exchange are only used in the handshake. The data itself travels under fast symmetric encryption such as AES.' },

    { type: 'match', prompt: 'Match each handshake term to its meaning.',
      pairs: [['ClientHello', 'The browser opens with its ciphers and key share'], ['Cipher suite', 'A bundle of algorithms the two sides agree on'], ['Session key', 'The fresh symmetric key for this connection only'], ['Forward secrecy', 'Old traffic stays safe even if the server key leaks later'], ['Certificate', 'Shows the server’s identity, checked by chain']] },

    { type: 'bucket', prompt: 'Should you enable it today?', buckets: ['Use', 'Obsolete'],
      items: [['TLS 1.3', 0], ['TLS 1.2, configured well', 0], ['TLS 1.1', 1], ['TLS 1.0', 1], ['SSL, any version', 1]],
      explain: 'SSL and TLS 1.0/1.1 have known weaknesses and are retired. TLS 1.2 remains acceptable with a strong configuration, and 1.3 is the best choice.' },

    { type: 'ab', q: 'Which server configuration is better?',
      a: { lang: 'text', src: 'ssl_protocols TLSv1 TLSv1.1 TLSv1.2;', label: 'Setting one' },
      b: { lang: 'text', src: 'ssl_protocols TLSv1.2 TLSv1.3;', label: 'Setting two' },
      answer: 'b',
      explain: 'The older versions are obsolete and should be off. Offering only TLS 1.2 and 1.3 stays compatible with modern clients while removing the weak options.' },

    { type: 'short', q: 'How many round trips does a full TLS 1.3 handshake need?', accept: ['1', 'one'], hint: 'Fewer than TLS 1.2, which needed two.',
      explain: 'TLS 1.3 completes in a single round trip, so connections feel faster, as well as being more secure.' },

    { type: 'scenario', title: 'Hardening the payments API',
      intro: 'You are setting up TLS for a new payments API. Three decisions come across your desk, each with a trade-off.',
      meters: { 'security': 40, 'speed': 50 },
      steps: [
        { text: 'Which protocol versions do you allow?',
          choices: [
            { label: 'TLS 1.2 and TLS 1.3 only', score: 2, effects: { 'security': 25, 'speed': 10 }, feedback: 'Modern, widely supported, and nothing obsolete left on. TLS 1.3 gets used wherever both sides can manage it.' },
            { label: 'Everything, including TLS 1.0, for old clients', score: 0, effects: { 'security': -20 }, feedback: 'Obsolete versions invite downgrade attacks. A few ancient clients are not worth that.' },
            { label: 'Only TLS 1.3, no exceptions', score: 1, effects: { 'security': 20, 'speed': 10 }, feedback: 'Great security, but you may lock out some legitimate clients that only support 1.2. Check who your callers are first.' }
          ] },
        { text: 'A colleague wants a key exchange without forward secrecy, so captured traffic can be decrypted later for debugging with the server key. Your call?',
          choices: [
            { label: 'Keep forward secrecy and debug with application-level logs', score: 2, effects: { 'security': 25 }, feedback: 'Forward secrecy means a future key theft cannot expose past traffic. Log what you need in a controlled way instead.' },
            { label: 'Agree: debugging matters more', score: 0, effects: { 'security': -30 }, feedback: 'That creates a single key that decrypts every recorded conversation, past and future. Convenience is a poor trade.' },
            { label: 'Agree, but only on weekends', score: 0, effects: { 'security': -15 }, feedback: 'Attackers record traffic all the time, so there is no safe window.' }
          ] },
        { text: 'Users on slow mobile networks say the first connection feels sluggish. What helps most?',
          choices: [
            { label: 'Prefer TLS 1.3, which needs one round trip instead of two', score: 2, effects: { 'speed': 30, 'security': 5 }, feedback: 'Every round trip costs real time on a slow link, and 1.3 halves the handshake cost.' },
            { label: 'Turn off certificate checking on the client', score: 0, effects: { 'speed': 5, 'security': -35 }, feedback: 'You save almost nothing and give up the entire point of the handshake.' },
            { label: 'Switch to plain HTTP', score: 0, effects: { 'speed': 10, 'security': -40 }, feedback: 'Payments in the clear. Absolutely not.' }
          ] }
      ],
      outro: 'Modern versions, forward secrecy, and verification always on.' },

    { type: 'explain', prompt: 'In your own words, explain what happens between typing an https address and the padlock appearing.',
      model: 'The browser and server do a TLS handshake. They agree which ciphers to use and swap Diffie–Hellman key shares so both derive the same secret session key without ever sending it. The server shows its certificate and proves it holds the private key by signing the handshake. The browser checks the certificate against its trusted authorities. Then both switch to fast symmetric encryption, such as AES, for all the data.',
      keywords: ['handshake', 'key', 'certificate', 'symmetric', 'private key', 'Diffie–Hellman', 'session'] }
  ],

  flashcards: [
    { q: 'What problems does the TLS handshake solve?', a: 'It proves the server’s identity, agrees a shared session key in public, and sets up fast symmetric encryption for the data.' },
    { q: 'What happens in the TLS 1.3 handshake?', a: 'ClientHello and ServerHello swap ciphers and key shares, both derive session keys, the server proves its identity with a certificate and signature, and encrypted data flows.' },
    { q: 'Why does TLS switch to symmetric encryption?', a: 'Asymmetric maths is slow. It sets up the key, then AES carries the data quickly.' },
    { q: 'What is forward secrecy?', a: 'Each connection uses a throw-away key exchange, so stealing the server’s long-term key later cannot decrypt recorded old traffic. TLS 1.3 always provides it.' },
    { q: 'TLS 1.2 vs 1.3, and what about SSL?', a: 'TLS 1.3: one round trip, always forward secrecy, weak options removed. SSL and TLS 1.0/1.1 are obsolete; "SSL" is just a leftover name.' }
  ],

  glossary: [
    { term: 'TLS', def: 'Transport Layer Security: the protocol that authenticates a server and encrypts the connection. HTTPS is HTTP carried over TLS.', like: 'A private tunnel built before the conversation starts.', aka: ['SSL (old name)'] },
    { term: 'TLS handshake', def: 'The opening exchange where client and server agree ciphers, check identity and derive session keys.', like: 'Two strangers agreeing a code before talking.' },
    { term: 'Cipher suite', def: 'The bundle of algorithms (key exchange, signature, encryption) that both sides agree to use.' },
    { term: 'Session key', def: 'A fresh symmetric key derived during the handshake and used for one connection only.', like: 'A single-use key for one conversation.' },
    { term: 'Forward secrecy', def: 'The property that past recorded traffic stays unreadable even if the server’s long-term private key is later stolen.', like: 'Shredding the notepad after every chat.', aka: ['perfect forward secrecy'] }
  ],

  takeaways: [
    'The handshake **negotiates ciphers, checks the certificate, agrees a session key**, then switches to **AES**.',
    'The server proves identity by **signing the handshake** with its private key.',
    '**TLS 1.3**: one round trip, always ephemeral Diffie–Hellman, so **forward secrecy**.',
    '**SSL and TLS 1.0/1.1 are obsolete**; "SSL" is just a name that stuck.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('crypto', {
  title: 'The Cipher Sphinx',
  intro: 'The Sphinx guards the vault of secrets and asks riddles about fingerprints, locks, seals and handshakes. Answer correctly to pass; guess wrongly and it will smile politely.',
  questions: [
    { type: 'mcq', q: 'A teammate says: "We Base64 the API tokens in the database, so they are encrypted." What is the best reply?',
      options: ['Base64 is encoding: anyone can decode it, so it protects nothing', 'Base64 is a weak form of hashing, so it is partly protected', 'That is fine as long as the database is behind a firewall', 'Base64 is reversible only with the right key'],
      answer: 0,
      explain: 'Encoding changes format and needs no key. If the tokens must be secret, encrypt them with a vetted library and keep the key elsewhere.' },

    { type: 'multi', q: 'Which of these are true of a good cryptographic hash such as SHA-256?',
      options: ['Same input, same output, every time', 'The output length is fixed', 'A one-character change alters about half the output bits', 'The input can be recovered using a secret key', 'It is the best choice for storing passwords'],
      answers: [0, 1, 2],
      explain: 'Hashes are deterministic, fixed-size and avalanche-prone. They have no key to reverse them, and being fast makes them poor for passwords.' },

    { type: 'tf', statement: 'Adding a random salt to a fast hash such as SHA-256 makes it a good way to store passwords.', answer: false,
      explain: 'A salt defeats rainbow tables and hides duplicate passwords, but the hash is still fast to guess against. Use Argon2id, scrypt, bcrypt or PBKDF2.' },

    { type: 'ab', q: 'Which stored value is the safer way to keep a password?',
      a: { lang: 'text', src: '$argon2id$v=19$m=...,t=...,p=...$<salt>$<hash>', label: 'Stored value one' },
      b: { lang: 'text', src: '5e884898da28047151d0e56f8dc62927...  (plain SHA-256)', label: 'Stored value two' },
      answer: 'a',
      explain: 'The first is a slow, salted Argon2id hash with its settings and salt stored inside it. The second is an unsalted fast hash, which a stolen table would reveal to a quick dictionary attack.' },

    { type: 'match', prompt: 'Match each tool to its job.',
      pairs: [['Diffie–Hellman', 'Agree a shared secret in public'], ['HMAC', 'Authenticate with a shared secret'], ['Digital signature', 'Prove origin using a private key'], ['AES', 'Fast bulk encryption with one key'], ['Certificate', 'Bind a public key to a name']] },

    { type: 'order', prompt: 'Order the steps of verifying a digitally signed download.',
      items: ['Download the file and its signature', 'Hash the downloaded file yourself', 'Use the publisher’s public key on the signature', 'Compare the result with your own hash', 'Install only if they match'],
      explain: 'You recompute the fingerprint yourself and compare it with what the public key reveals was signed. Any tampering changes the hash and fails.' },

    { type: 'bucket', prompt: 'Which would a browser accept or reject?', buckets: ['Accept', 'Reject'],
      items: [['Valid chain to a trusted root, right name, in date', 0], ['Certificate expired last week', 1], ['Certificate issued for a different domain', 1], ['Self-signed certificate not in the trust store', 1], ['Leaf signed by a trusted intermediate chaining to a trusted root', 0], ['Chain that ends at an unknown issuer', 1]],
      explain: 'Name, dates and a chain to a trusted root must all hold.' },

    { type: 'cloze', text: 'In TLS, {{asymmetric}} cryptography authenticates the server and agrees a key; then fast {{symmetric}} encryption carries the data. TLS 1.3 always uses {{ephemeral}} Diffie–Hellman, which gives forward {{secrecy}}.',
      distractors: ['hashing', 'Base64', 'static'],
      explain: 'The slow cleverness is used only to set up a throw-away session key; the throw-away nature is what provides forward secrecy.' },

    { type: 'spot', prompt: 'Which line of this webhook code is a security bug?',
      code: { lang: 'js', src: `
        app.post('/hooks/stripe', (req, res) => {
          const tag = req.headers['x-signature'];
          const mine = hmacSha256(SECRET, req.rawBody);
          if (tag == mine) { grantAccess(req.body); }
          res.sendStatus(200);
        });` },
      lines: [4],
      explain: 'A normal comparison can leak timing information about how much of the tag was right. Use a constant-time comparison from your crypto library.' },

    { type: 'short', q: 'What name is given to a secret value kept outside the database and mixed into password hashes?', accept: ['pepper'], hint: 'A seasoning that sits next to salt.',
      explain: 'A pepper is kept away from the data (for example in a secrets manager), so a database-only leak is much harder to crack.' },

    { type: 'estimate', q: 'How many hexadecimal characters long is a SHA-256 hash of a 4 GB file?', answer: 64, unit: 'characters', tolerance: 1.2,
      explain: 'The output is always 256 bits, which is 64 hex characters, whatever the size of the input.' },

    { type: 'mcq', q: 'Why does TLS 1.3 give forward secrecy?',
      options: ['Session keys come from a fresh throw-away Diffie–Hellman exchange', 'It encrypts the certificate with the server’s private key', 'It uses a longer RSA key than TLS 1.2', 'It stores each session key safely for later auditing'],
      answer: 0,
      explain: 'Because each connection’s key is ephemeral and then deleted, stealing the long-term private key later cannot decrypt old recorded traffic.' }
  ]
});

KS.sheet('crypto', {
  title: 'Cryptography Basics cheat sheet',
  sections: [
    { title: 'Encoding vs hashing vs encryption', md: `| | Reversible? | Key? | Examples |
|---|---|---|---|
| Encoding | Yes, by anyone | No | Base64, hex |
| Hashing | No | No | SHA-256, Argon2id |
| Encryption | Yes, with key | Yes | AES, RSA |

Only encryption keeps secrets. Never call Base64 "encrypted".` },

    { title: 'Hash functions', md: `- Fixed-size output, deterministic, one-way
- **Avalanche effect:** a tiny change flips about half the bits
- **Collision-resistant:** nobody can find two inputs with the same hash

| Status | Algorithms |
|---|---|
| Broken for security | MD5, SHA-1 |
| Fine | SHA-2 (SHA-256, SHA-512), SHA-3 |

Uses: integrity, deduplication, signatures. MD5 survives only as a non-security checksum.` },

    { title: 'Storing passwords', md: `- Never plain text, never a fast hash, even salted
- Use **Argon2id** first; then scrypt, bcrypt, or PBKDF2 where required
- **Salt:** random, unique per user, stored beside the hash, not secret
- **Pepper:** a secret kept outside the database
- **Work factor:** follow current OWASP guidance and raise it as hardware improves
- Always use a library
- Defend against **credential stuffing**: rate limits, MFA, breached-password checks` },

    { title: 'Symmetric vs asymmetric', md: `| | Symmetric | Asymmetric |
|---|---|---|
| Keys | One shared | Public + private pair |
| Examples | AES | RSA, elliptic curves |
| Speed | Fast | Slow |
| Problem | Sharing the key | Speed |

**Diffie–Hellman:** agree a shared secret in public. **Hybrid:** asymmetric sets up the key, symmetric carries the data. Protect data **at rest** and **in transit**.` },

    { title: 'Signatures and HMAC', md: `| | Signature | HMAC |
|---|---|---|
| Key(s) | Private signs, public verifies | One shared secret |
| Authenticity + integrity | Yes | Yes |
| Non-repudiation | Yes | No |

Seen in: JWTs, webhooks, software updates. Verify **before** acting, compare in **constant time**, add timestamps against replay. Signed does not mean secret.` },

    { title: 'Certificates and PKI', md: `- A certificate binds a **public key to a name**, signed by a CA
- Chain: **leaf → intermediate → root** (root is in the trust store)
- Contains: names, public key, issuer, validity dates, signature; never the private key
- Browser checks: name, dates, chain, revocation (CRL, OCSP)
- Let's Encrypt issues free certificates via **ACME**
- **Mutual TLS:** the client presents a certificate too
- Never use \`verify=False\`` },

    { title: 'The TLS handshake', md: `1. ClientHello: ciphers + key share
2. ServerHello: choice + key share
3. Both derive the same **session keys**
4. Certificate + signed proof; browser verifies
5. Finished both ways, then AES-encrypted data

**TLS 1.3:** one round trip, always ephemeral DH, so **forward secrecy**. SSL and TLS 1.0/1.1 are obsolete; "SSL" is only a name. Never invent your own cryptography.` }
  ]
});
