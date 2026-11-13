/* Module: containers — Containers & Orchestration.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs containers */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ct-vm-vs-container', {
  eli5: 'Containers let you pack an app together with everything it needs so it runs the same everywhere. A virtual machine does it by faking a whole computer; a container just fences off a few processes on the real one.',

  cards: [
    { kind: 'story', title: '“But it works on my machine!”',
      body: `You build an app on your laptop. It runs beautifully. You send it to a teammate, and it falls over: *"Cannot find module"*. Then you deploy it to a server, and it falls over differently: *"wrong version of Python"*.

        Your laptop has a particular operating system, particular versions of languages and libraries, particular settings and some tools you forgot you installed in 2022. The app quietly depends on all of it.

        This is the famous **"works on my machine"** problem. The dream is to ship the app *together with its whole environment*, as one sealed box that behaves identically everywhere. There are two main ways to build such a box.` },

    { kind: 'metaphor', title: 'A whole house, or a flat in a shared building',
      body: `Imagine you need a private place to live.

        You could **build a whole house**: its own foundations, its own plumbing, its own electricity supply. Total independence, but it is slow to build, expensive and takes lots of land. That is a **virtual machine**.

        Or you could rent a **flat** in a building. You get your own front door, your own rooms and your own lock, but you share the foundations, the water mains and the lift with the other flats. It is quick to move in and cheap. That is a **container**.

        Where it stops: a flat is less isolated than a house. A fire in the building worries everyone, and that trade-off is exactly the real one.` },

    { kind: 'diagram', title: 'Virtual machines: a computer inside a computer',
      body: 'A **hypervisor** is software that carves one physical machine into several pretend ones. Each virtual machine (VM) gets its **own complete operating system**.',
      nodes: [
        { id: 'a1', label: 'App A', x: 0, y: 0 }, { id: 'a2', label: 'App B', x: 2, y: 0 },
        { id: 'g1', label: 'Guest OS 1', x: 0, y: 1, tone: 'warn' }, { id: 'g2', label: 'Guest OS 2', x: 2, y: 1, tone: 'warn' },
        { id: 'hv', label: 'Hypervisor', icon: '🧩', x: 1, y: 2, tone: 'accent' },
        { id: 'hw', label: 'Physical hardware', icon: '🖥️', x: 1, y: 3 }
      ],
      edges: [
        { from: 'a1', to: 'g1' }, { from: 'a2', to: 'g2' },
        { from: 'g1', to: 'hv' }, { from: 'g2', to: 'hv' }, { from: 'hv', to: 'hw' }
      ],
      groups: [{ label: 'VM 1', x: 0, y: 0, w: 1, h: 2 }, { label: 'VM 2', x: 2, y: 0, w: 1, h: 2 }],
      caption: 'Strong separation, because each VM thinks it is a real computer. The price is that each one carries a whole OS, using gigabytes and taking a while to start.' },

    { kind: 'layers', title: 'Containers: one kernel, many fenced-off groups',
      body: 'The **kernel** is the core of an operating system, the part that talks to hardware and manages processes. Containers **share the host’s kernel**. Each is just an ordinary group of processes, fenced off from the others.',
      layers: [
        { label: 'Container A · Container B · Container C', note: 'Each holds one app plus its own libraries and files. No separate OS.', icon: '📦', tone: 'accent' },
        { label: 'Container runtime', note: 'Software such as Docker that sets up and manages the fences.', icon: '⚙️' },
        { label: 'Host operating system (one shared kernel)', note: 'Every container’s processes run on this single kernel.', icon: '🐧', tone: 'warn' },
        { label: 'Physical hardware', note: 'The actual machine.', icon: '🖥️' }
      ] },

    { kind: 'compare', title: 'Side by side',
      body: 'Neither is "better". They answer different questions.',
      cols: ['Virtual machine', 'Container'],
      rows: [
        ['What it virtualises', 'The hardware', 'The operating system’s view'],
        ['Own operating system?', 'Yes, a full guest OS', 'No: shares the host kernel'],
        ['Size', 'Gigabytes, typically', 'Often tens to hundreds of megabytes'],
        ['Start-up', 'Tens of seconds to minutes', 'Usually about a second or so'],
        ['Isolation', 'Very strong', 'Good, but weaker (shared kernel)'],
        ['Can run another OS?', 'Yes, e.g. Windows on a Linux host', 'Same kernel type as the host']
      ] },

    { kind: 'concept', title: 'How the fence is built: namespaces and cgroups',
      body: `A container is not a magic object. It is ordinary Linux processes wrapped with two kernel features.

        **Namespaces** control **what a process can see**. Give a process its own *process-ID namespace* and it believes it is the only thing running. Give it its own *network* namespace and it has its own network interfaces and ports, and its own *mount* namespace gives it its own view of the file system.

        **Control groups (cgroups)** control **how much it can use**: at most this much memory, at most that much CPU. A greedy container cannot starve its neighbours.

        So: **namespaces hide, cgroups limit.** Put them together and you have a container.` },

    { kind: 'history', title: 'From LXC to Docker',
      body: `Ideas for fencing off processes go back decades (Unix has had \`chroot\` for ages). In the late 2000s Linux gained the namespace and cgroup features above, and **LXC** (Linux Containers) packaged them into a usable tool.

        LXC worked, but it was fiddly. Then, around 2013, **Docker** arrived and made containers easy: one command to build, one to run, and a simple way to share what you built. It first used LXC underneath and later replaced it with its own code. Within a few years containers became the standard way to ship server software.

        Today common formats are standardised (the *Open Container Initiative*), so tools other than Docker can build and run the same containers.` },

    { kind: 'pitfall', title: 'Shared kernel, shared risk',
      body: `Because containers share one kernel, a serious bug in that kernel, or a badly configured container, can in principle let one container affect the host or its neighbours. A VM has a much harder wall to climb.

        That is why some setups run **containers inside VMs**: one VM per customer, say, with containers inside. You will see this in most cloud platforms.

        Another surprise: containers use the host's kernel type. Linux containers need a Linux kernel. On a Mac or Windows laptop, Docker quietly runs a small hidden **Linux VM** to host them.` },

    { kind: 'tip', title: 'Which to reach for',
      body: `Rough guide:

        - **Container**: you want to package and run *your own application* consistently, start quickly, and pack many onto one machine. This is the default for modern server apps.
        - **VM**: you need a *different operating system*, **strong isolation** between untrusted workloads, or you are running something that expects a whole machine (like a legacy app).
        - **Both**: very common. The cloud gives you VMs, and you run containers on them.

        Next lesson: how Docker turns an app into a container, step by step.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What is the key difference between a VM and a container?',
      options: ['A VM carries its own full operating system; containers share the host’s kernel', 'A VM is always faster than a container', 'Containers need special hardware that VMs do not', 'A VM can only run one program, but a container can run many'],
      answer: 0,
      why: [null, 'It is usually the other way round: containers start faster and use less.', 'Containers need no special hardware. They use ordinary kernel features.', 'Either can run many programs. This is not the distinction.'],
      explain: 'A VM fakes a whole computer with its own guest OS. A container is just fenced-off processes on the host’s one kernel, which is why it is lighter and quicker.' },

    { type: 'tf', after: 4, statement: 'Containers usually start faster and use less space than virtual machines, because they do not boot a separate operating system.', answer: true,
      explain: 'Without a guest OS to boot or store, a container is mostly your app and its libraries. That is why you can start one in about a second and run many on one machine.' },

    { type: 'bucket', prompt: 'Which sounds more like a VM, and which like a container?', buckets: ['Virtual machine', 'Container'],
      items: [['Runs its own full guest operating system', 0], ['Shares the host’s kernel', 1], ['Managed by a hypervisor', 0], ['Starts in about a second', 1], ['Best wall between untrusted tenants', 0], ['Can run Windows software on a Linux host', 0], ['Built from namespaces and cgroups', 1]],
      explain: 'VMs virtualise hardware, which gives strong separation and the freedom to run any OS. Containers virtualise the OS’s view with namespaces and cgroups, which makes them light and fast.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [['Hypervisor', 'Software that splits one machine into virtual ones'], ['Kernel', 'The core of the OS that manages hardware and processes'], ['Namespace', 'Limits what a process can see'], ['cgroup', 'Limits how much CPU and memory a process can use'], ['LXC', 'An early toolset for Linux containers']] },

    { type: 'multi', q: 'Which of these are true about how containers are built?',
      options: ['Namespaces give a process its own view of processes, network and files', 'Control groups limit CPU and memory use', 'They rely on features built into the Linux kernel', 'Each container boots its own copy of the operating system', 'They need a hypervisor to work'],
      answers: [0, 1, 2],
      explain: 'Containers are ordinary processes, wrapped with namespaces (what they see) and cgroups (what they can use), both kernel features. No guest OS and no hypervisor required.' },

    { type: 'short', q: 'Which Linux kernel feature caps how much CPU and memory a container may consume? (its short name, one word)', accept: ['cgroups', 'cgroup', 'controlgroups', 'controlgroup'], hint: 'Short for "control groups".',
      explain: '**cgroups** (control groups) set the resource ceiling. Namespaces decide what the process can see; cgroups decide how much it can use.' },

    { type: 'cloze', text: 'A {{hypervisor}} runs virtual machines, each with its own {{guest OS}}; containers instead share the host’s {{kernel}}, fenced off with namespaces and {{cgroups}}.',
      distractors: ['compiler', 'registry', 'firewall'],
      explain: 'Hypervisors and guest operating systems belong to VMs. Containers share one kernel and use namespaces and cgroups to fence off each group of processes.' },

    { type: 'scenario', title: 'Two workloads, one server room', intro: 'You run IT for a small software company. You have a pile of spare servers and two jobs to place on them. Your manager wants sensible choices, not a lecture.',
      meters: { 'cost': 60, 'safety': 50 },
      steps: [
        { text: 'First job: a legacy accounting program that only runs on Windows Server, and the rest of your servers run Linux. What do you do?',
          choices: [
            { label: 'Run it in a virtual machine with a Windows guest OS', score: 2, effects: { 'cost': -10, 'safety': 15 }, feedback: 'A VM brings its own operating system, so a Windows program can run on a Linux host. Exactly what VMs are for.' },
            { label: 'Put it in a Linux container', score: 0, effects: { 'cost': 5, 'safety': -20 }, feedback: 'A Linux container shares the Linux kernel. It cannot run a Windows-only program.' },
            { label: 'Rewrite it in a weekend', score: 0, effects: { 'cost': -30 }, feedback: 'Legacy accounting code is rarely a weekend job.' }
          ] },
        { text: 'Second job: ten small web services your own team wrote, all Linux, which need to start quickly and be packed densely onto a few machines. And "it works on my machine" keeps biting.',
          choices: [
            { label: 'Package each as a container image, so the environment travels with the app', score: 2, effects: { 'cost': 20, 'safety': 10 }, feedback: 'Containers are light, quick to start, pack tightly and carry the app’s environment with them. A good fit.' },
            { label: 'Give each service its own VM', score: 1, effects: { 'cost': -20, 'safety': 10 }, feedback: 'It works, and the isolation is strong, but ten whole operating systems is heavy and slow to start for ten small services.' },
            { label: 'Install everything directly on one server and hope', score: 0, effects: { 'cost': 10, 'safety': -20 }, feedback: 'Conflicting library versions and no separation. It is "works on my machine" with extra steps.' }
          ] }
      ],
      outro: 'Pick by need: a **different OS or strong walls** points to a VM; **quick, dense, repeatable app packaging** points to containers.' },

    { type: 'explain', prompt: 'Explain how a container differs from a virtual machine, and how a container is actually built.',
      model: 'A virtual machine uses a hypervisor to fake a whole computer, and each VM runs its own full guest operating system, so it is heavy but strongly isolated. A container is just ordinary processes sharing the host’s kernel, fenced off with namespaces (limiting what they can see) and cgroups (limiting how much CPU and memory they use), so it is light and starts quickly.',
      keywords: ['hypervisor', 'guest OS', 'kernel', 'namespaces', 'cgroups', 'isolation', 'lightweight'] }
  ],

  flashcards: [
    { q: 'What is the "works on my machine" problem?', a: 'An app depends on things in its developer’s environment (OS, versions, settings) that are missing elsewhere, so it behaves differently or fails.' },
    { q: 'What does a hypervisor do?', a: 'It splits one physical machine into several virtual ones, each running its own full guest operating system.' },
    { q: 'How do containers differ from VMs?', a: 'Containers share the host’s kernel and are just fenced-off processes, so they are lighter and faster to start, but less strongly isolated.' },
    { q: 'What are namespaces and cgroups?', a: 'Linux kernel features. Namespaces limit what a process can see; cgroups limit how much CPU and memory it can use. Together they build containers.' },
    { q: 'What was LXC, and where did Docker come from?', a: 'LXC (Linux Containers) was an early toolset for containers. Docker (about 2013) made them easy to build, run and share.' }
  ],

  glossary: [
    { term: 'Virtual machine', def: 'A software-made computer with its own full operating system, run on a real machine by a hypervisor.', like: 'A whole house with its own plumbing.', aka: ['VM'] },
    { term: 'Hypervisor', def: 'The software that creates and runs virtual machines on a physical computer.', like: 'The property developer who divides land into plots.' },
    { term: 'Container', def: 'A group of processes isolated from the rest of the system and packaged with the files and libraries they need.', like: 'A flat in a shared building.' },
    { term: 'Kernel', def: 'The core of an operating system, which manages hardware, memory and processes.', like: 'The building’s foundations and water mains.' },
    { term: 'Namespace', def: 'A Linux feature that gives a process its own private view of something, such as processes, network or files.', like: 'Blinkers: you only see your own lane.' },
    { term: 'cgroups', def: 'A Linux feature that limits how much CPU, memory and other resources a group of processes may use.', like: 'A fuse for each flat.', aka: ['control groups'] }
  ],

  takeaways: [
    'Containers fix **"works on my machine"** by shipping the environment with the app.',
    'A **VM** fakes a whole computer with its own OS. A **container** shares the host kernel.',
    '**Namespaces hide, cgroups limit**: that is a container.',
    'VMs give stronger walls; containers give speed and density. Often you use **both**.'
  ],

  links: [
    { label: 'Docker docs: What is a container?', url: 'https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ct-docker', {
  eli5: 'A Dockerfile is a recipe, an image is the frozen meal made from it, and a container is that meal being eaten. You write the recipe once and can run identical meals anywhere.',

  cards: [
    { kind: 'metaphor', title: 'A recipe, a frozen meal, a meal being eaten',
      body: `Docker has three words that sound alike and mean different things.

        - A **Dockerfile** is the **recipe**: a text file of instructions for building your app's environment.
        - An **image** is the **frozen meal**: the finished, sealed result of following the recipe. It never changes.
        - A **container** is a **meal being eaten**: a running copy started from an image.

        You can start ten containers from one image, just as you can heat ten portions of the same frozen meal. Delete a container and the image is untouched.

        The whole job is: *write the recipe, build the image, run containers.*` },

    { kind: 'code', title: 'A Dockerfile, line by line',
      body: 'Each instruction adds a step to the recipe. Tap the highlighted lines.',
      code: { lang: 'docker', src: `
        FROM node:20-slim
        WORKDIR /app
        COPY package*.json ./
        RUN npm ci --omit=dev
        COPY . .
        EXPOSE 3000
        USER node
        CMD ["node", "server.js"]`,
        notes: {
          1: '**FROM**: start from an existing image (a small Linux with Node pre-installed). You rarely start from nothing.',
          3: '**COPY**: bring files from your project into the image. Just the dependency list first, for a reason we will see.',
          4: '**RUN**: execute a command **while building**. Here, install the dependencies.',
          6: '**EXPOSE** documents which port the app listens on. It does not publish it, as we will see.',
          7: '**USER**: stop running as the all-powerful root user. Smaller blast radius if the app is hacked.',
          8: '**CMD**: the command to run **when a container starts**. Not during the build.'
        } } },

    { kind: 'diagram', title: 'Layers, stacked like pancakes',
      body: 'Each instruction in the Dockerfile that changes files becomes a **layer**: a read-only slice, stacked on the one before. A running container adds a thin **writable** layer on top.',
      nodes: [
        { id: 'w', label: 'Container’s writable layer', x: 1, y: 0, tone: 'warn' },
        { id: 'l4', label: 'COPY . . (your code)', x: 1, y: 1 },
        { id: 'l3', label: 'RUN npm ci (dependencies)', x: 1, y: 2 },
        { id: 'l2', label: 'COPY package*.json', x: 1, y: 3 },
        { id: 'l1', label: 'FROM node:20-slim (base)', x: 1, y: 4, tone: 'accent' }
      ],
      edges: [{ from: 'w', to: 'l4' }, { from: 'l4', to: 'l3' }, { from: 'l3', to: 'l2' }, { from: 'l2', to: 'l1' }],
      caption: 'Image layers are shared and never change. Anything a container writes goes in its own top layer, and vanishes when the container is removed.' },

    { kind: 'concept', title: 'The build cache: order matters',
      body: `Docker remembers each layer. When you rebuild, it reuses every layer **up to the first one that changed**, and rebuilds only from there.

        Look at the Dockerfile again. We copy \`package*.json\` and install dependencies **before** copying the rest of the code. Your code changes every few minutes; your dependencies change rarely. So the slow \`npm ci\` layer is reused from the cache, and a rebuild takes seconds.

        Had we written \`COPY . .\` first, *any* edit to *any* file would invalidate that layer and everything after it, including the install. Same recipe, much slower.

        **Rule: put the things that change least at the top.**` },

    { kind: 'sequence', title: 'From recipe to running container',
      body: 'Images travel through a **registry**, a library for images, such as Docker Hub or one run by your cloud provider.',
      actors: ['Your laptop', 'Registry', 'Server'],
      steps: [
        { at: 0, label: 'docker build', note: 'Follow the Dockerfile and produce an image on your own machine.' },
        { from: 0, to: 1, label: 'docker push', note: 'Upload the image to the registry, tagged with a name and version.' },
        { from: 2, to: 1, label: 'docker pull', note: 'On the server, download that exact image.' },
        { from: 1, to: 2, label: 'the image', dashed: true, note: 'The same bytes you built. Nothing is reinstalled or recompiled.' },
        { at: 2, label: 'docker run', note: 'Start a container from it. It behaves exactly as it did on your laptop.' }
      ] },

    { kind: 'code', title: 'Ports, volumes and environment variables',
      body: 'A container is sealed off, so you have to cut deliberate holes in the walls.',
      code: { lang: 'sh', src: `
        docker run -d \\
          -p 8080:3000 \\
          -e DATABASE_URL=postgres://db/shop \\
          -v shop-data:/var/lib/uploads \\
          shop-api:1.0`,
        notes: {
          2: '**\`-p host:container\`** publishes a port. Visits to port 8080 on your machine go to port 3000 inside the container.',
          3: '**\`-e\`** sets an **environment variable**. This is how you configure a container without rebuilding the image.',
          4: '**\`-v\`** mounts a **volume**: storage that outlives the container. Without it, files written inside vanish when it is removed.'
        } } },

    { kind: 'pitfall', title: 'Containers forget everything',
      body: `A container's writable layer is **ephemeral**: when the container is deleted, everything it wrote is gone. That surprises people the first time their uploaded photos disappear after a redeploy.

        So anything you want to keep, such as database files or uploads, belongs in a **volume** (or in an external service). The container itself should be disposable: stop it, delete it, start a fresh one from the image, and nothing is lost.

        Likewise, put *configuration* (passwords, URLs) in environment variables rather than baking it into the image. The same image can then run in testing and production with different settings.` },

    { kind: 'tip', title: 'Image hygiene',
      body: `A few habits make images smaller, safer and more predictable.

        - **Pin versions.** \`node:20-slim\`, not \`node:latest\`: *latest* changes under you.
        - **Small base images** (\`-slim\`, or alpine-style ones) mean less to download and less to attack.
        - **Never bake secrets in.** A password in a layer stays there forever, even if a later step deletes it.
        - **Do not run as root.** Add a \`USER\` line.
        - **Use a \`.dockerignore\` file** to keep \`.git\`, \`node_modules\` and local config out of the image.
        - **Multi-stage builds** compile in one stage and copy only the result into a clean, small final image.
        - **One main process per container.**` },

    { kind: 'realworld', title: 'Registries in the wild',
      body: `A **registry** stores images and serves them by name and **tag**: \`shop-api:1.0\`, \`postgres:16\`, \`nginx:stable\`.

        **Docker Hub** is the best-known public one, full of official images for databases, web servers and languages, so you rarely build a database image yourself: you just pull one. Cloud providers and code hosts run their own, such as GitHub's container registry, and companies often run **private** ones for their own images.

        Treat random public images with the caution you would give random downloads: prefer official ones, and check who publishes them.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'Which statement matches the recipe, frozen meal and meal-being-eaten analogy?',
      options: ['Dockerfile is the recipe, image is the frozen meal, container is the running meal', 'Image is the recipe, Dockerfile is the frozen meal, container is the kitchen', 'Container is the recipe, image is the running meal, Dockerfile is the fridge', 'Dockerfile, image and container are three names for the same thing'],
      answer: 0,
      why: [null, 'The Dockerfile is the instructions. The image is built from it.', 'A container is a running thing, not instructions.', 'They are three different things, and mixing them up is the classic beginner mistake.'],
      explain: 'You write a Dockerfile (instructions), build an image (sealed result) and run containers (live copies). Many containers can come from one image.' },

    { type: 'tf', after: 3, statement: 'If you edit one source file, Docker must rebuild every layer of the image from the very start.', answer: false,
      explain: 'Docker reuses cached layers up to the first changed one. Order the Dockerfile so rarely-changing steps (like installing dependencies) come first, and a code edit only rebuilds the last layers.' },

    { type: 'order', prompt: 'Put the journey of an app from your laptop to a server in order.',
      items: ['Write a Dockerfile', 'Build an image', 'Push the image to a registry', 'Pull the image on the server', 'Run a container from it'],
      explain: 'The recipe produces an image, the registry carries it between machines, and a container only exists once the image has been pulled and started.' },

    { type: 'ab', q: 'Which Dockerfile rebuilds faster when you edit one line of code?',
      a: { lang: 'docker', label: 'Code first', src: `
        COPY . .
        RUN npm ci` },
      b: { lang: 'docker', label: 'Dependencies first', src: `
        COPY package*.json ./
        RUN npm ci
        COPY . .` },
      answer: 'b',
      explain: 'Copying only the dependency list first means the slow install layer stays cached until the dependencies actually change. With code first, every edit invalidates the install as well.' },

    { type: 'spot', prompt: 'This Dockerfile has hygiene problems. Tap a line that is a problem.',
      code: { lang: 'docker', src: `
        FROM node:latest
        WORKDIR /app
        ENV DB_PASSWORD=hunter2
        COPY . .
        RUN npm install
        CMD ["node", "server.js"]` },
      lines: [1, 3],
      explain: '`node:latest` can change underneath you, so builds are not repeatable: pin a version. And a password in `ENV` is baked into the image where anyone who can pull it can read it. Pass secrets at run time instead.' },

    { type: 'bucket', prompt: 'Is it an image or a container?', buckets: ['Image', 'Container'],
      items: [['A sealed, read-only package built from a Dockerfile', 0], ['A running copy with a writable layer on top', 1], ['Stored in and pulled from a registry', 0], ['Loses its written files when deleted', 1], ['You can start many from one of these', 0], ['Has a process running with its own network namespace', 1]],
      explain: 'Images are the static, shareable blueprints. Containers are the live instances made from them, with their own state that disappears when removed.' },

    { type: 'cloze', text: 'In {{-p}} 8080:3000, port {{8080}} is on the host and {{3000}} is inside the container; use {{-v}} to keep data after the container is gone.',
      distractors: ['-e', '443', '-d'],
      explain: '`-p host:container` publishes a port. `-v` mounts a volume, which is how data outlives a disposable container.' },

    { type: 'scenario', title: 'The 1.5 GB image with a secret', intro: 'A teammate’s first Dockerfile builds a 1.5 GB image and takes eight minutes every time. In code review you also notice an API key written inside it.',
      meters: { 'security': 30, 'build speed': 30 },
      steps: [
        { text: 'The API key is set with `ENV API_KEY=abc123` in the Dockerfile and the image is already in the shared registry. What first?',
          choices: [
            { label: 'Treat the key as leaked: revoke it, remove it from the Dockerfile, pass it at run time instead', score: 2, effects: { 'security': 50 }, feedback: 'Anyone who can pull the image can read the key, so it must be rotated. Going forward, supply secrets when the container starts.' },
            { label: 'Delete the line and rebuild; the old image is gone anyway', score: 0, effects: { 'security': -20 }, feedback: 'The old image is still in the registry and in anyone’s cache. Deleting the line does not un-leak the key.' },
            { label: 'Hide it with a later `RUN unset API_KEY` step', score: 0, effects: { 'security': -10 }, feedback: 'The earlier layer still contains it. Layers are permanent records of each step.' }
          ] },
        { text: 'Now the size and slowness. The Dockerfile starts from a big full-fat base, copies the whole project first, then installs. How do you improve it?',
          choices: [
            { label: 'Use a slim base, copy the dependency list and install first, then copy code, and add a .dockerignore', score: 2, effects: { 'build speed': 55, 'security': 10 }, feedback: 'Smaller base, cached install layer and no junk copied in. Rebuilds drop from minutes to seconds and the image shrinks.' },
            { label: 'Compress the finished image with zip before pushing', score: 0, effects: { 'build speed': -5 }, feedback: 'That is not how images are stored, and it fixes nothing about the build time.' },
            { label: 'Build less often', score: 0, effects: { 'build speed': 0 }, feedback: 'Slow builds then become slow releases. Fix the Dockerfile instead.' }
          ] }
      ],
      outro: 'Small base, stable layers first, no secrets baked in.' },

    { type: 'explain', prompt: 'Explain the difference between an image and a container, and why data in a container is lost unless you use a volume.',
      model: 'An image is a read-only, sealed package built from a Dockerfile, made of layers. A container is a running instance started from an image, with a thin writable layer on top. That layer is ephemeral and is deleted with the container, so anything worth keeping, like a database or uploads, must be stored in a volume that outlives the container.',
      keywords: ['image', 'container', 'layers', 'writable', 'ephemeral', 'volume', 'Dockerfile'] }
  ],

  flashcards: [
    { q: 'Image versus container?', a: 'An image is a read-only, built package. A container is a running instance of an image with its own writable layer.' },
    { q: 'What is a Dockerfile?', a: 'A text file of instructions (FROM, COPY, RUN, CMD...) that tells Docker how to build an image.' },
    { q: 'Why does instruction order matter in a Dockerfile?', a: 'Docker caches layers and reuses them until the first changed one. Put rarely-changing steps first so rebuilds are fast.' },
    { q: 'What does `-p 8080:3000` do?', a: 'Publishes a port: traffic to port 8080 on the host goes to port 3000 inside the container.' },
    { q: 'How do you keep data after a container is removed?', a: 'Store it in a volume (or an external service), since a container’s own writable layer is deleted with it.' },
    { q: 'Name three image hygiene habits.', a: 'Pin versions rather than `latest`, use small base images, and never bake secrets in. Also run as a non-root user.' }
  ],

  glossary: [
    { term: 'Image', def: 'A read-only package, made of layers, containing an app and everything it needs to run.', like: 'A frozen meal.' },
    { term: 'Dockerfile', def: 'A text file of build instructions that Docker follows to create an image.', like: 'The recipe.' },
    { term: 'Layer', def: 'One read-only step in an image, stacked on the previous. Unchanged layers are cached and shared.', like: 'One pancake in the stack.' },
    { term: 'Registry', def: 'A service that stores images and serves them by name and tag, such as Docker Hub.', like: 'A library for images.' },
    { term: 'Volume', def: 'Storage managed outside a container’s own writable layer, so data survives when the container is removed.', like: 'A storage locker beside the flat.' },
    { term: 'Environment variable', def: 'A named setting passed to a program when it starts, used to configure a container without rebuilding it.', like: 'A note pinned to the door saying where the database is.', aka: ['env var'] }
  ],

  takeaways: [
    '**Dockerfile** (recipe) → **image** (frozen meal) → **container** (running meal).',
    'Images are **layers**. Put what changes least first, so the cache helps.',
    'Containers are **disposable**: keep data in volumes, config in env vars.',
    'Pin versions, stay small, run as non-root and **never bake in secrets**.'
  ],

  links: [
    { label: 'Docker docs: Dockerfile reference', url: 'https://docs.docker.com/reference/dockerfile/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ct-compose', {
  eli5: 'Real apps are several programs working together, such as a web app, a database and a cache. Docker Compose lets you describe all of them in one file and start the whole set with a single command.',

  cards: [
    { kind: 'concept', title: 'Three programs, three commands',
      body: `A real app is rarely one program. Your shop needs a **web app**, a **database** to remember orders and a **cache** to keep things quick.

        To run it on a fresh laptop, the README says: start the database like *this*, with these passwords. Start the cache like *that*. Now build your app, and link it to the other two using these flags. Six steps, and one typo in step four costs an hour.

        **Docker Compose** replaces the README with a single file, \`compose.yaml\`, that describes every container, how they connect and what they store. Then one command, \`docker compose up\`, brings the whole app to life.` },

    { kind: 'metaphor', title: 'The band’s booking sheet',
      body: `A band has a singer, a drummer and a bassist. To book them for a gig you do not phone each one separately and explain the venue three times. You send **one booking sheet**: who is playing, what each needs (a drum riser, two microphones), and where everyone stands.

        Then you say "start the show" and they all turn up, set up and begin.

        The Compose file is the booking sheet. Each member is a **service** (a container with a job). The sheet says what each one needs and how they are placed, and \`docker compose up\` starts the show.

        Where it stops: a band has live humans who can improvise. A Compose file is rigid, and exactly the same every time. That is the point.` },

    { kind: 'concept', title: 'One container, one concern',
      body: `You *could* cram the web app, database and cache into a single container. Resist. The usual rule is **one container per concern** (one main process each), for good reasons:

        - **Restart independently.** Redeploying the app should not restart the database.
        - **Scale independently.** Need more web servers? Run five web containers and still one database.
        - **Swap parts easily.** Upgrade the database image without touching your code.
        - **Clear logs and limits.** Each container has its own log stream and its own memory cap.

        Small, single-purpose containers, joined by a network, are the Lego bricks of this style.` },

    { kind: 'code', title: 'A compose.yaml for the shop',
      body: 'Three services and one volume. Tap the highlighted lines.',
      code: { lang: 'yaml', src: `
        services:
          web:
            build: .
            ports:
              - "8080:3000"
            environment:
              DATABASE_URL: postgres://app:secret@db:5432/shop
              REDIS_URL: redis://cache:6379
            depends_on:
              - db
              - cache
          db:
            image: postgres:16
            environment:
              POSTGRES_USER: app
              POSTGRES_PASSWORD: secret
              POSTGRES_DB: shop
            volumes:
              - dbdata:/var/lib/postgresql/data
          cache:
            image: redis:7
        volumes:
          dbdata:`,
        notes: {
          3: '**build: .** means "build this service’s image from the Dockerfile in this folder".',
          5: 'Only \`web\` publishes a port to your machine. The database and cache are **not reachable from outside**: safer by default.',
          7: 'The database host is just \`db\`: the **service name**. No IP address needed. We will see why next.',
          13: '**image:** pulls a ready-made official image. No Dockerfile needed for standard software.',
          19: 'A **volume** keeps the database files safe. Without it, the data vanishes with the container.',
          22: 'Named volumes are declared once at the bottom. (The passwords here are dev-only. Real secrets stay out of files you commit.)'
        } } },

    { kind: 'diagram', title: 'A private network, created for you',
      body: 'Compose makes a private network and puts every service on it. Only the ports you publish are visible from outside.',
      nodes: [
        { id: 'you', label: 'Your browser', icon: '🌐', x: 1, y: 0 },
        { id: 'web', label: 'web', x: 1, y: 1, tone: 'accent' },
        { id: 'db', label: 'db (Postgres)', icon: '🗄️', x: 0, y: 2 },
        { id: 'cache', label: 'cache (Redis)', x: 2, y: 2 },
        { id: 'vol', label: 'volume: dbdata', x: 0, y: 3, tone: 'good' }
      ],
      edges: [
        { from: 'you', to: 'web', label: 'localhost:8080' },
        { from: 'web', to: 'db', label: 'db:5432' },
        { from: 'web', to: 'cache', label: 'cache:6379' },
        { from: 'db', to: 'vol', dashed: true }
      ],
      groups: [{ label: 'Private compose network', x: 0, y: 1, w: 3, h: 2 }],
      caption: 'Inside the box, containers find each other by service name. From outside, only port 8080 exists.' },

    { kind: 'concept', title: 'Service names, and the localhost trap',
      body: `On Compose's private network there is a tiny built-in **DNS** (you met DNS in the networking modules). Every service name becomes a hostname. From inside \`web\`, the name \`db\` finds the database container, and if that container restarts with a new IP, the name still works.

        Now the classic trap. Inside a container, **\`localhost\` means the container itself**, not your laptop and not the other containers. So \`postgres://localhost:5432\` inside \`web\` looks for a database running inside the web container, and finds nothing.

        Rule: to reach another service, use **its service name**. Use \`localhost\` only for things inside the same container.` },

    { kind: 'code', title: 'Day-to-day commands',
      body: 'A handful of commands covers nearly everything.',
      code: { lang: 'sh', src: `
        docker compose up -d        # build if needed, start everything
        docker compose ps           # what is running?
        docker compose logs -f web  # follow one service's logs
        docker compose down         # stop and remove the containers
        docker compose down -v      # ...and delete the volumes too!`,
        notes: {
          1: '\`-d\` runs it in the background. The first run pulls images and builds, and later runs are fast.',
          4: '\`down\` removes containers and the network, but **volumes survive**, so your data is safe.',
          5: 'Adding \`-v\` deletes the volumes as well. That wipes the database, which is great for a fresh start and awful by accident.'
        } } },

    { kind: 'pitfall', title: '“Started” is not “ready”',
      body: `\`depends_on\` makes Compose start the database container **before** the web app. It does **not** wait until Postgres has finished setting itself up and is accepting connections. Postgres can take a few seconds, and an impatient app crashes on its first try.

        Two common remedies:

        - Give the database a **health check**, and have the app wait until it passes (Compose supports this).
        - Make the app **retry** its connection for a while. This is the more robust habit, since it also copes with a database restarting later in production.

        Same story with volumes: forget one and the data disappears with the container.` },

    { kind: 'tip', title: 'A reproducible dev environment',
      body: `The big win is not the YAML. It is what the file means for your team.

        A new developer clones the repository, runs \`docker compose up\`, and has the **same** database version, cache version and settings as everyone else, in minutes, with nothing installed on their own machine except Docker.

        - Commit \`compose.yaml\` so the environment is versioned with the code.
        - Keep per-person settings and secrets in an untracked \`.env\` file.
        - Compose is mostly for **development, testing and small deployments**. For running many machines at scale, the next lessons introduce Kubernetes.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'Why is it usually better to run the web app and the database in separate containers?',
      options: ['They can be restarted, scaled and upgraded independently', 'Containers cannot run more than one process at all', 'It makes the app run faster on a single CPU', 'Databases are not allowed inside containers'],
      answer: 0,
      why: [null, 'Containers can run several processes. Separating concerns is a design choice, not a hard limit.', 'There is no speed gain from separation. The benefit is operational flexibility.', 'Databases run in containers happily, especially for development.'],
      explain: 'One concern per container means redeploying the app does not touch the database, you can run more web containers without more databases, and each part can be upgraded on its own.' },

    { type: 'tf', after: 5, statement: 'Inside a container, `localhost` refers to the host laptop, so the app can reach a database running on your machine.', answer: false,
      explain: 'Inside a container `localhost` means that very container. To reach another service on the Compose network, use its service name (like `db`).' },

    { type: 'match', prompt: 'Match each Compose idea to what it does.',
      pairs: [['services', 'The list of containers that make up the app'], ['build: .', 'Builds the image from a Dockerfile in this folder'], ['image: postgres:16', 'Pulls a ready-made image from a registry'], ['ports', 'Publishes a container port to the host'], ['volumes', 'Keeps data outside the container’s own layer']] },

    { type: 'spot', prompt: 'The web container cannot connect to its database. Tap the line with the mistake.',
      code: { lang: 'yaml', src: `
        services:
          web:
            build: .
            environment:
              DATABASE_URL: postgres://app:secret@localhost:5432/shop
          db:
            image: postgres:16` },
      lines: [5],
      explain: 'Inside `web`, `localhost` is the web container itself, which has no database. The host should be the service name, `db`.' },

    { type: 'ab', q: 'Which setup is better for the shop’s database?',
      a: { lang: 'yaml', label: 'No volume', src: `
        db:
          image: postgres:16` },
      b: { lang: 'yaml', label: 'With a volume', src: `
        db:
          image: postgres:16
          volumes:
            - dbdata:/var/lib/postgresql/data` },
      answer: 'b',
      explain: 'Without a volume, the database files live in the container’s writable layer and are deleted with it. A named volume survives the container being removed and recreated.' },

    { type: 'cloze', code: true, text: `services:
  web:
    environment:
      DATABASE_URL: postgres://app@{{db}}:5432/shop
  db:
    image: postgres:16
    volumes:
      - {{dbdata}}:/var/lib/postgresql/data
# reach another container by its {{service}} name`,
      distractors: ['localhost', 'web', 'latest'],
      explain: 'The host in the URL is the database service’s name, the volume name keeps data safe, and service names double as hostnames on the Compose network.' },

    { type: 'multi', q: 'Which of these are real benefits of describing your stack in a compose file?',
      options: ['A new teammate can start everything with one command', 'Everyone runs the same versions of the database and cache', 'The environment is versioned alongside the code', 'It guarantees the database is fully ready before the app starts', 'It spreads your containers across many machines automatically'],
      answers: [0, 1, 2],
      explain: 'Compose gives you a repeatable, shareable environment. It does not by itself wait for readiness (that needs a health check or retries), and it targets one machine. Spreading across machines is orchestration, covered next.' },

    { type: 'scenario', title: 'The vanishing database', intro: 'Your teammate runs `docker compose down -v` to "clean things up" before lunch. After lunch, the shop’s local database is empty and a week of test data is gone. You are asked to prevent a repeat.',
      meters: { 'data safety': 30, 'team trust': 50 },
      steps: [
        { text: 'What happened to the data?',
          choices: [
            { label: 'The -v flag deleted the volume that held the database files', score: 2, effects: { 'data safety': 10, 'team trust': 10 }, feedback: 'Exactly. `down` alone keeps volumes. With `-v` they are removed, and the data went with them.' },
            { label: 'Postgres automatically empties itself on restart', score: 0, effects: { 'team trust': -10 }, feedback: 'Postgres keeps its data on disk. It only vanished because the volume holding it was deleted.' },
            { label: 'The cache container overwrote it', score: 0, effects: { 'team trust': -10 }, feedback: 'The cache is a separate container with its own storage. It cannot touch the database files.' }
          ] },
        { text: 'How do you protect the team from this next time?',
          choices: [
            { label: 'Keep seed data in a script that recreates the database in one command, and note what `down -v` does', score: 2, effects: { 'data safety': 40, 'team trust': 20 }, feedback: 'If a fresh database can be rebuilt in seconds, wiping it is cheap. Knowledge of the flag does the rest.' },
            { label: 'Ban the word "down"', score: 0, effects: { 'data safety': 0, 'team trust': -10 }, feedback: '`down` is a safe, useful command. It was `-v` that bit, and banning commands does not teach anyone.' },
            { label: 'Never use volumes, so there is nothing to delete', score: 0, effects: { 'data safety': -30 }, feedback: 'Without volumes the data is lost on every container removal, so you would make the problem worse.' }
          ] }
      ],
      outro: 'Volumes keep data alive; `-v` on `down` deliberately removes them.' },

    { type: 'explain', prompt: 'Explain what Docker Compose is for, and how one container reaches another on a Compose network.',
      model: 'Docker Compose describes a multi-container app (services such as web, database and cache, plus networks and volumes) in one file so it can be started with a single command and reproduced on any machine. Compose puts the services on a private network where each service name works as a hostname, so the web container reaches the database at its service name (for example db), not localhost.',
      keywords: ['services', 'one file', 'network', 'service name', 'hostname', 'localhost', 'volumes'] }
  ],

  flashcards: [
    { q: 'What is Docker Compose?', a: 'A tool that describes a multi-container app in one YAML file (services, networks, volumes) and starts it with `docker compose up`.' },
    { q: 'Why one container per concern?', a: 'So parts can be restarted, scaled and upgraded independently, and each has its own logs and limits.' },
    { q: 'How do containers in a Compose app find each other?', a: 'By service name, such as `db`, which works as a hostname on the private network.' },
    { q: 'What does `localhost` mean inside a container?', a: 'The container itself, not your laptop or another container.' },
    { q: 'Does `depends_on` wait for the database to be ready?', a: 'No, it only controls start order. Use a health check or have the app retry its connection.' }
  ],

  glossary: [
    { term: 'Docker Compose', def: 'A tool for defining and running multi-container apps from one YAML file.', like: 'The band’s booking sheet.', aka: ['Compose'] },
    { term: 'Service', def: 'In Compose, one container definition (such as web or db) that does a single job in the app.', like: 'One band member.' },
    { term: 'Compose network', def: 'A private network Compose creates so services can talk to each other by name.', like: 'The backstage corridor only the band can use.' },
    { term: 'Health check', def: 'A small test Docker runs inside a container to tell whether the program is actually ready and working.', like: 'Tapping the microphone to see if it is on.' }
  ],

  takeaways: [
    'Compose turns a README of commands into **one file** and **one command**.',
    '**One container per concern**: restart, scale and swap parts independently.',
    'Services find each other by **service name**. `localhost` is the container itself.',
    'Use **volumes** for data, and remember **started is not ready**.'
  ],

  links: [
    { label: 'Docker docs: Docker Compose overview', url: 'https://docs.docker.com/compose/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ct-k8s-basics', {
  eli5: 'Kubernetes is a manager for lots of containers across lots of machines. You tell it what you want running, and it keeps checking and fixing things until reality matches your wish.',

  cards: [
    { kind: 'concept', title: 'Forty containers, ten machines, 3am',
      body: `Compose is great on one machine. Now picture your shop growing: forty containers spread over ten servers. At 3am one server dies. Someone must notice, work out which containers were on it, find room on other machines, and start them again.

        Add the daily chores: rolling out a new version without downtime, adding more copies when traffic spikes, giving everything a stable address.

        Doing this by hand is a full-time, sleepless job. **Container orchestration** is software that does it for you. The famous one is **Kubernetes** (often written *K8s*), which began at Google and is now an open, community-run project that most cloud providers offer.` },

    { kind: 'metaphor', title: 'The thermostat',
      body: `You do not tell a thermostat "switch the heating on for twelve minutes". You tell it **"I want 20 degrees"**. Then it measures the room, compares it with what you asked for, and turns the heating on or off. It repeats this forever. Open a window and it just works harder.

        Kubernetes works the same way. You do not say "start three copies". You say **"I want three copies running"**. It checks how many exist, and fixes any gap, forever.

        Your wish is the **desired state**. What exists right now is the **actual state**. The endless measure-compare-fix cycle is called a **control loop**.

        Where it stops: a thermostat controls one thing. Kubernetes runs many loops at once, for many kinds of thing.` },

    { kind: 'sequence', title: 'The control loop in action',
      body: 'Say you ask for three copies of your app, and then one crashes.',
      actors: ['You', 'Control plane', 'Nodes'],
      steps: [
        { from: 0, to: 1, label: 'I want 3 copies', note: 'You submit the **desired state**. That is all you do.' },
        { from: 1, to: 2, label: 'start 3 containers', note: 'The control plane picks machines and tells them to run the containers.' },
        { from: 2, to: 1, label: 'all 3 running', dashed: true, note: 'Actual state now matches the wish. The loop keeps watching.' },
        { at: 2, label: 'one container crashes', note: 'At 3am. Nobody is awake.' },
        { from: 2, to: 1, label: 'only 2 running', dashed: true, note: 'The nodes report back what is really happening.' },
        { from: 1, to: 2, label: 'start 1 more', note: '**Actual (2) is not desired (3)**, so it acts. Fixed with no human involved.' }
      ] },

    { kind: 'concept', title: 'Pods: the smallest unit',
      body: `Kubernetes does not run containers directly. It runs **pods**. A pod is a small wrapper around **one or more containers** that always travel together: they share a network address and can share storage. Usually a pod holds a single container, and sometimes a helper alongside it.

        Two things to remember:

        - **Pods are disposable.** They are created, replaced and thrown away constantly. A replacement pod is a *new* pod with a *new* IP address.
        - **You rarely create pods yourself.** You describe a higher-level thing that creates them for you. The most common is a **Deployment**.` },

    { kind: 'code', title: 'A Deployment: "keep 3 copies running"',
      body: 'A short YAML file that states your desire. Tap the highlighted lines.',
      code: { lang: 'yaml', src: `
        apiVersion: apps/v1
        kind: Deployment
        metadata:
          name: shop-api
        spec:
          replicas: 3
          selector:
            matchLabels: { app: shop-api }
          template:
            metadata:
              labels: { app: shop-api }
            spec:
              containers:
                - name: api
                  image: shop-api:1.0
                  ports:
                    - containerPort: 3000`,
        notes: {
          2: '**kind** says what sort of thing this is. A Deployment manages a set of identical pods.',
          6: '**replicas: 3** is the desired state. Change the number and Kubernetes adds or removes pods to match.',
          9: 'The **template** is the blueprint for each pod it creates.',
          11: '**Labels** are tags stuck on the pods. Other things find pods *by label*.',
          15: 'The container image to run, which can come straight from your registry.'
        } } },

    { kind: 'code', title: 'A Service: a stable front door',
      body: 'Pods come and go and their addresses change. A **Service** is a steady address that always points at whichever pods are currently alive.',
      code: { lang: 'yaml', src: `
        apiVersion: v1
        kind: Service
        metadata:
          name: shop-api
        spec:
          selector: { app: shop-api }
          ports:
            - port: 80
              targetPort: 3000`,
        notes: {
          6: 'The **selector** picks pods by label. Anything labelled \`app: shop-api\` receives traffic, and new pods join automatically.',
          8: 'Callers use port 80 on the Service, which forwards to port 3000 in the pods and **spreads the load** between them.'
        } } },

    { kind: 'diagram', title: 'Deployment, pods and Service',
      body: 'The Deployment keeps the pods alive. The Service gives callers one address for all of them.',
      nodes: [
        { id: 'svc', label: 'Service', icon: '🚪', x: 1, y: 0, tone: 'accent' },
        { id: 'p1', label: 'Pod 1', x: 0, y: 1 }, { id: 'p2', label: 'Pod 2', x: 1, y: 1 }, { id: 'p3', label: 'Pod 3', x: 2, y: 1 },
        { id: 'dep', label: 'Deployment: 3 replicas', icon: '📋', x: 1, y: 2, tone: 'warn' }
      ],
      edges: [
        { from: 'svc', to: 'p1', label: 'by label' }, { from: 'svc', to: 'p2' }, { from: 'svc', to: 'p3' },
        { from: 'dep', to: 'p2', label: 'keeps alive', dashed: true }
      ],
      caption: 'Kill a pod and the Deployment makes another. The Service never changes, and it simply starts routing to the newcomer.' },

    { kind: 'diagram', title: 'Nodes and the control plane',
      body: 'A **cluster** is a group of machines. **Worker nodes** run your pods. The **control plane** is the brain that decides what runs where.',
      nodes: [
        { id: 'api', label: 'API server', icon: '📮', x: 0, y: 0, tone: 'accent' },
        { id: 'sch', label: 'Scheduler', x: 1, y: 0, tone: 'accent' },
        { id: 'ctl', label: 'Controllers', x: 2, y: 0, tone: 'accent' },
        { id: 'n1', label: 'Node 1 (kubelet)', icon: '🖥️', x: 0, y: 2 },
        { id: 'n2', label: 'Node 2 (kubelet)', icon: '🖥️', x: 2, y: 2 }
      ],
      edges: [
        { from: 'api', to: 'n1', both: true, dashed: true }, { from: 'ctl', to: 'n2', both: true, dashed: true }, { from: 'sch', to: 'api', label: 'asks', dashed: true }
      ],
      groups: [{ label: 'Control plane', x: 0, y: 0, w: 3, h: 1 }, { label: 'Worker nodes', x: 0, y: 2, w: 3, h: 1 }],
      caption: 'The API server is the front door and notice board. The scheduler picks a node for each new pod. Controllers run the control loops. A **kubelet** on each node starts and watches the containers.' },

    { kind: 'concept', title: 'Self-healing and scaling, for free',
      body: `Because it is all one big control loop, two superpowers fall out of it.

        **Self-healing.** A pod crashes? Replaced. A whole node dies? The pods that were on it are started on the surviving nodes. The cluster looks for **actual ≠ desired** and fixes it.

        **Scaling.** Want ten copies? Edit \`replicas: 10\` and apply it, or run \`kubectl scale\`. Kubernetes creates seven more and spreads them across nodes. Scale back down just as easily. (It can even adjust the number automatically from load, which you will meet next lesson.)

        In the lab that follows, you will declare replicas, kill pods and nodes, and watch the loop repair things.` },

    { kind: 'pitfall', title: 'Cattle, not pets',
      body: `The mindset shift: pods are **cattle, not pets**. You do not name them, nurse them or log in to fix them. If one misbehaves, you delete it and the Deployment makes a fresh one.

        That has consequences:

        - Never rely on a pod's IP address. Go through a **Service**.
        - Never keep important data inside a pod. It is **ephemeral** (the volumes lesson applies again).
        - Do not edit running pods by hand. Change the YAML and apply it, so the file stays the truth. Keeping those files in Git is a good habit.
        - Kubernetes is **powerful and complicated**. A lot of vocabulary arrives all at once, so take it one concept at a time.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What does "desired state" mean in Kubernetes?',
      options: ['What you declare should be running; Kubernetes works to make reality match it', 'The state a container was in when it last crashed', 'The settings of the physical machine', 'A log of everything that has happened in the cluster'],
      answer: 0,
      why: [null, 'That is history, not a wish. Desired state is about the future you ask for.', 'Machine settings are separate. Desired state describes workloads.', 'A log records the past. Desired state is a declaration of what you want now.'],
      explain: 'You declare the outcome ("three copies of this app") and the control loop keeps comparing actual with desired, fixing any difference, like a thermostat.' },

    { type: 'tf', after: 4, statement: 'In a Deployment, changing `replicas: 3` to `replicas: 5` and applying it makes Kubernetes start two more pods.', answer: true,
      explain: 'The desired state changed from 3 to 5, the actual state is 3, so the control loop creates two more to close the gap.' },

    { type: 'match', prompt: 'Match each Kubernetes object to its role.',
      pairs: [['Pod', 'Smallest unit: one or more containers together'], ['Deployment', 'Keeps a chosen number of identical pods running'], ['Service', 'A stable address that routes to matching pods'], ['Node', 'A machine in the cluster that runs pods'], ['Control plane', 'The brain that decides what runs where']] },

    { type: 'order', prompt: 'A pod crashes. Put the control loop’s response in order.',
      items: ['The pod stops running', 'The nodes report fewer pods than desired', 'The controller notices actual does not match desired', 'It asks for a replacement pod to be started', 'A new pod runs and actual matches desired again'],
      explain: 'Nothing is "told" about the crash by a human. The loop notices the gap between actual and desired and closes it.' },

    { type: 'spot', prompt: 'Users report the Service gets no traffic to the pods. Tap the line with the mistake.',
      code: { lang: 'yaml', src: `
        kind: Deployment
        spec:
          replicas: 3
          template:
            metadata:
              labels: { app: shop-api }
        ---
        kind: Service
        spec:
          selector: { app: shop-web }` },
      lines: [10],
      explain: 'Services find pods by label. The pods are labelled `shop-api` but the Service selects `shop-web`, so it matches no pods and has nothing to send traffic to.' },

    { type: 'bucket', prompt: 'Which part of the cluster does each job?', buckets: ['Control plane', 'Worker node'],
      items: [['Decides which node a new pod goes on', 0], ['Runs your application’s containers', 1], ['Stores and serves the desired state (API server)', 0], ['Runs a kubelet that starts and watches containers', 1], ['Runs the control loops that fix differences', 0], ['Is where a pod actually lives', 1]],
      explain: 'The control plane makes decisions and holds the desired state. Worker nodes do the actual running of pods, reporting back through their kubelets.' },

    { type: 'cloze', text: 'A {{Deployment}} keeps the desired number of {{pods}} running, a {{Service}} gives them one steady address, and each worker node runs a {{kubelet}}.',
      distractors: ['volume', 'registry', 'hypervisor'],
      explain: 'Deployment maintains replicas, Service provides a stable address, and the kubelet is the node’s agent that actually starts containers.' },

    { type: 'scenario', title: 'Node down at 3am', intro: 'Your shop runs six replicas of its API on a three-node cluster. At 3am the hardware under Node 2 fails. Your phone buzzes, though you would rather it did not.',
      meters: { 'uptime': 70, 'stress': 50 },
      steps: [
        { text: 'You open your laptop. Two of the six pods were on Node 2. What do you expect to find?',
          choices: [
            { label: 'Kubernetes has noticed and is starting replacements on the surviving nodes', score: 2, effects: { uptime: 25, stress: -25 }, feedback: 'The control loop sees fewer pods than desired and reschedules them. Often it is already healed by the time you look.' },
            { label: 'Two pods are gone forever until someone adds them back by hand', score: 0, effects: { uptime: -10, stress: 10 }, feedback: 'That is life without orchestration. The Deployment’s job is to restore the desired count automatically.' },
            { label: 'The whole cluster has stopped', score: 0, effects: { uptime: -15, stress: 15 }, feedback: 'Other nodes carry on. The cluster is designed to tolerate a node failing.' }
          ] },
        { text: 'Traffic is climbing, because a TV ad has just aired. You have six replicas and the CPU is hot. What do you do?',
          choices: [
            { label: 'Increase `replicas`, and apply it', score: 2, effects: { uptime: 20, stress: -10 }, feedback: 'Changing the desired state is the whole point. Kubernetes adds pods and spreads them around the nodes.' },
            { label: 'Log into each pod and tune it by hand', score: 0, effects: { uptime: -10, stress: 20 }, feedback: 'Pods are cattle. Hand-tuning one is lost the moment it is replaced.' },
            { label: 'Restart the cluster and hope', score: 0, effects: { uptime: -25, stress: 15 }, feedback: 'You would drop traffic during the busiest moment for no benefit.' }
          ] }
      ],
      outro: 'Declare what you want. Let the loop do the repairing.' },

    { type: 'explain', prompt: 'Explain the control loop in Kubernetes, and name three objects you would use to run an app.',
      model: 'Kubernetes stores your desired state (for example three copies of an app) and continually compares it with the actual state, taking action to close any gap. That is a control loop, and it gives self-healing and scaling. To run an app you use pods (containers that run together), a Deployment (keeps the right number of pods running) and a Service (a stable address that routes to those pods).',
      keywords: ['desired state', 'actual state', 'control loop', 'pod', 'Deployment', 'Service', 'self-healing'] }
  ],

  flashcards: [
    { q: 'Why does container orchestration exist?', a: 'To automatically place, restart, scale, connect and update many containers across many machines, a job too big to do by hand.' },
    { q: 'What is the control loop?', a: 'Kubernetes continually compares desired state with actual state and acts to close any difference.' },
    { q: 'What is a pod?', a: 'The smallest deployable unit: one or more containers that share a network address and storage. Pods are disposable.' },
    { q: 'What do a Deployment and a Service each do?', a: 'A Deployment keeps a set number of identical pods running. A Service gives them one stable address and spreads traffic between them.' },
    { q: 'What are the control plane and worker nodes?', a: 'The control plane makes decisions and stores desired state. Worker nodes run the pods, each with a kubelet agent.' }
  ],

  glossary: [
    { term: 'Kubernetes', def: 'An open-source system that runs and manages containers across many machines, keeping them matching a declared desired state.', like: 'A thermostat for your whole fleet of containers.', aka: ['K8s'] },
    { term: 'Desired state', def: 'The outcome you declare, such as "three copies of this app", that Kubernetes works to maintain.', like: 'The 20 degrees you set on the dial.' },
    { term: 'Control loop', def: 'The endless cycle of observing actual state, comparing it with desired state and acting on the difference.', like: 'A thermostat’s measure, compare, adjust.' },
    { term: 'Pod', def: 'The smallest unit Kubernetes runs: one or more containers sharing a network address.', like: 'A single serving dish on the table.' },
    { term: 'Deployment', def: 'An object that keeps a chosen number of identical pods running and manages updates.', like: 'A manager who always keeps three cooks on shift.' },
    { term: 'Service', def: 'An object that gives a set of pods one stable address and shares traffic across them.', like: 'A restaurant’s phone number, however the staff change.' }
  ],

  takeaways: [
    'Kubernetes works by a **control loop**: desired state vs actual state, forever.',
    'You run **pods** through a **Deployment**, and reach them through a **Service**.',
    'The **control plane** decides; **worker nodes** run the pods.',
    'Self-healing and scaling are just the loop closing the gap. Treat pods as **cattle**.'
  ],

  links: [
    { label: 'Kubernetes docs: Overview', url: 'https://kubernetes.io/docs/concepts/overview/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ct-k8s-more', {
  eli5: 'Once your app runs in Kubernetes you meet the day-two questions: how users reach it, where settings and passwords live, how to ship a new version safely, how much machine each app gets, and whether you needed all this in the first place.',

  cards: [
    { kind: 'concept', title: 'Day two',
      body: `Day one went well. Your app runs as three pods behind a Service, and the cluster heals itself. Then real life turns up.

        - Customers type \`shop.example.com\`. How does that reach a Service *inside* the cluster?
        - The database password differs between testing and production. Where does it live?
        - You have a new version. How do you ship it **without downtime**, and take it back if it is broken?
        - One greedy app is eating all the memory on a node. How do you stop that?
        - The cluster is getting crowded with different teams' stuff. How do you keep it tidy?

        This lesson takes those in turn, and finishes with an honest question: do you even need Kubernetes?` },

    { kind: 'metaphor', title: 'The reception desk',
      body: `A large office building has one front door and one reception desk. Visitors do not wander the corridors hunting for the right room. They say *"I'm here for the accounts team"* and reception points them to the right floor.

        An **ingress** is that reception desk for your cluster. It is a set of **rules** that say *"requests for \`/api\` go to the API service, and requests for \`/\` go to the website service"*. One public entrance, many services behind it.

        Where it stops: reception needs staff to carry out the rules. In Kubernetes that is an **ingress controller** (such as an NGINX-based one), which you install separately. Rules without a controller do nothing.` },

    { kind: 'diagram', title: 'Traffic through an ingress',
      body: 'One address in, routed by host name and path. The ingress controller is also a handy place to handle **HTTPS**, by holding the certificate for the whole cluster.',
      nodes: [
        { id: 'user', label: 'Visitors', icon: '🌐', x: 1, y: 0 },
        { id: 'ing', label: 'Ingress', icon: '🛎️', x: 1, y: 1, tone: 'accent' },
        { id: 'web', label: 'Service: website', x: 0, y: 2 },
        { id: 'api', label: 'Service: api', x: 2, y: 2 },
        { id: 'p1', label: 'website pods', x: 0, y: 3 },
        { id: 'p2', label: 'api pods', x: 2, y: 3 }
      ],
      edges: [
        { from: 'user', to: 'ing', label: 'shop.example.com' },
        { from: 'ing', to: 'web', label: '/' }, { from: 'ing', to: 'api', label: '/api' },
        { from: 'web', to: 'p1' }, { from: 'api', to: 'p2' }
      ],
      caption: 'Services remain private inside the cluster. Only the ingress is exposed to the outside world.' },

    { kind: 'code', title: 'ConfigMaps and Secrets',
      body: 'Keep settings **out of the image**, so one image runs everywhere. Tap the highlighted lines.',
      code: { lang: 'yaml', src: `
        # ConfigMap: ordinary settings
        apiVersion: v1
        kind: ConfigMap
        metadata: { name: shop-config }
        data:
          LOG_LEVEL: info
        ---
        # Secret: sensitive values
        apiVersion: v1
        kind: Secret
        metadata: { name: shop-secrets }
        stringData:
          DATABASE_PASSWORD: change-me
        ---
        # In the pod spec: pull both in as environment variables
        envFrom:
          - configMapRef: { name: shop-config }
          - secretRef: { name: shop-secrets }`,
        notes: {
          5: 'A **ConfigMap** holds plain settings. Staging and production each get their own, with the same image.',
          12: 'A **Secret** is the same idea for passwords and keys. Careful: by default it is only **base64-encoded, not encrypted**. Lock it down with access rules, encryption at rest, or an external secret manager.',
          16: 'The container sees both as environment variables (they can also be mounted as files). Change a setting without rebuilding anything.'
        } } },

    { kind: 'steps', title: 'A rolling update, then a rollback',
      body: 'Change the image version and Kubernetes swaps pods **gradually**, so the app never goes fully down.',
      steps: [
        { title: 'Declare the new version', body: 'Edit the Deployment’s image from `shop-api:1.0` to `1.1` and apply it. Desired state has changed.' },
        { title: 'Start one new pod', body: 'A pod running 1.1 starts alongside the three running 1.0 pods. Traffic only reaches it once it reports **ready**.' },
        { title: 'Retire one old pod', body: 'Once the new pod is ready, one 1.0 pod is stopped. The count stays near three, so users keep being served.' },
        { title: 'Repeat until all are new', body: 'The settings `maxSurge` and `maxUnavailable` set how fast. Watch with `kubectl rollout status deployment/shop-api`.' },
        { title: 'Roll back if it is bad', body: '`kubectl rollout undo deployment/shop-api` returns to the previous version using the same gentle swap in reverse.' }
      ] },

    { kind: 'concept', title: 'Requests and limits',
      body: `Every container can say how much machine it needs.

        A **request** is a **reservation**: "I need at least this much." The scheduler uses it to decide which node has room.

        A **limit** is a **ceiling**: "never let me use more than this." Go over a CPU limit and you are **throttled** (slowed down). Go over a memory limit and the container is **killed** and restarted.

        Without them, one leaky app can eat a whole node and starve its neighbours. \`250m\` CPU means a quarter of one core.`,
      code: { lang: 'yaml', src: `
        resources:
          requests: { cpu: 250m, memory: 256Mi }
          limits:   { memory: 512Mi }`,
        notes: {
          2: 'Reserve a quarter of a core and 256 MiB. The scheduler only places the pod where this fits.',
          3: 'Memory above 512 MiB means the container is killed. Many teams set a memory limit but leave out a CPU limit, to avoid needless throttling.'
        } } },

    { kind: 'concept', title: 'Autoscaling',
      body: `Instead of changing \`replicas\` by hand, you can let Kubernetes do it. The **Horizontal Pod Autoscaler** watches a measurement, typically average CPU use, and adds or removes pods to keep it near a target, between a minimum and maximum you choose.

        \`kubectl autoscale deployment shop-api --min=3 --max=10 --cpu-percent=70\`

        Notice that CPU use is measured *relative to the request*, so **you need requests set** for this to make sense.

        More pods need somewhere to live. A **cluster autoscaler**, offered by most cloud providers, adds or removes whole **nodes** when pods cannot fit. And be realistic: if your bottleneck is one database, more web pods will not help.` },

    { kind: 'concept', title: 'Namespaces and Helm',
      body: `A **namespace** is a named partition inside one cluster, like a folder. You might have \`staging\`, \`production\` and a namespace per team. Names only need to be unique inside their namespace, and you can attach **quotas** and **access rules** to each one. It is tidiness and soft separation, not a security wall like a separate cluster.

        **Helm** is the **package manager** for Kubernetes. A **chart** is a bundle of templated YAML. **Values** fill in the blanks (replica count, image tag, hostnames). Installing a chart creates a **release** you can upgrade or roll back. It is also how you install off-the-shelf software, like a database or ingress controller, with one command.`,
      code: { lang: 'sh', src: `
        kubectl create namespace staging
        helm install shop ./shop-chart -n staging -f values-staging.yaml
        helm upgrade shop ./shop-chart -n staging -f values-staging.yaml
        helm rollback shop 1 -n staging`,
        notes: {
          2: 'Same chart, **different values file per environment**: staging gets two replicas, production gets ten.',
          4: 'Releases are versioned, so Helm can roll back to an earlier revision too.'
        } } },

    { kind: 'pitfall', title: 'Easy ways to get hurt',
      body: `- **Memory limit too tight.** The app spikes, gets killed, restarts, spikes again: a *crash loop*. Start generous, then tune from real measurements.
        - **No readiness check.** A rolling update only waits for "ready" if you tell Kubernetes how to check. Without a **readiness probe**, traffic may reach a pod that is still starting.
        - **Secrets in plain Git.** A Secret manifest committed to a repository is a leaked password.
        - **YAML sprawl.** Dozens of near-identical files drift apart. Charts or templates help.
        - **\`latest\` tags.** Pin versions, as in the Docker lesson, or rollbacks become guesswork.` },

    { kind: 'compare', title: 'Do you even need Kubernetes?',
      body: 'Honest answer: often not yet. Experts do disagree here, but the sensible middle is to match the tool to the size of the problem.',
      cols: ['Simpler options', 'Kubernetes'],
      rows: [
        ['What it looks like', 'One server with Compose, a PaaS that runs your containers for you, or serverless functions', 'A cluster, usually managed by a cloud provider'],
        ['Good fit', 'A few services, steady traffic, a small team', 'Many services, several teams, many machines, lots of change'],
        ['Learning curve', 'Gentle', 'Steep: many concepts and a lot of YAML'],
        ['Self-healing & rollouts', 'Basic, or provided by the platform', 'Built in, and very configurable'],
        ['Main risk', 'Outgrowing it later', 'Paying for complexity you do not need']
      ] }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'What is an ingress for?',
      options: ['Routing outside traffic into the right Services by host and path', 'Storing passwords for the pods', 'Deciding which node a pod runs on', 'Limiting how much memory a container may use'],
      answer: 0,
      why: [null, 'That is a Secret.', 'That is the scheduler.', 'That is a resource limit.'],
      explain: 'An ingress is a set of routing rules (handled by an ingress controller) that sends requests arriving at one public address to the right internal Service, and it is a common place to terminate HTTPS.' },

    { type: 'tf', after: 3, statement: 'A Kubernetes Secret is encrypted by default, so it is safe to commit it to a public Git repository.', answer: false,
      explain: 'By default a Secret is only base64-encoded, which anyone can decode. Protect it with access controls, encryption at rest or an external secret manager, and never commit real values.' },

    { type: 'order', after: 4, prompt: 'Put a rolling update in order.',
      items: ['Apply a Deployment with the new image version', 'A new pod starts and becomes ready', 'An old pod is stopped', 'The steps repeat until every pod is the new version', 'You can run `rollout undo` if something is wrong'],
      explain: 'New capacity comes up and becomes ready before old capacity is retired, which is why users keep being served throughout.' },

    { type: 'bucket', prompt: 'Request, limit, or neither?', buckets: ['Request', 'Limit', 'Neither'],
      items: [['"I need at least 256 MiB to start"', 0], ['Used by the scheduler to choose a node', 0], ['Exceed it on memory and the container is killed', 1], ['A ceiling on how much CPU may be used', 1], ['The number of replicas to run', 2], ['The version of the image to deploy', 2]],
      explain: 'Requests reserve resources and guide scheduling. Limits cap use and trigger throttling or killing. Replicas and image tags belong to the Deployment’s desired state instead.' },

    { type: 'ab', q: 'Which approach is better for a database password?',
      a: { lang: 'docker', label: 'In the image', src: `
        FROM shop-api-base
        ENV DATABASE_PASSWORD=change-me` },
      b: { lang: 'yaml', label: 'Supplied at runtime', src: `
        envFrom:
          - secretRef: { name: shop-secrets }` },
      answer: 'b',
      explain: 'A password baked into an image travels with it everywhere and cannot differ between staging and production. A Secret supplied at run time keeps the image generic and the value controlled.' },

    { type: 'spot', prompt: 'Something here is in the wrong place. Tap the line.',
      code: { lang: 'yaml', src: `
        apiVersion: v1
        kind: ConfigMap
        metadata: { name: shop-config }
        data:
          LOG_LEVEL: info
          DATABASE_PASSWORD: hunter2` },
      lines: [6],
      explain: 'ConfigMaps are for ordinary, non-sensitive settings and are easy to read. A password belongs in a Secret (and ideally an externally managed one).' },

    { type: 'short', q: 'Which `kubectl rollout` subcommand reverts a Deployment to its previous version? (one word)', accept: ['undo'], hint: 'The opposite of "do".',
      explain: '`kubectl rollout undo deployment/shop-api` rolls back to the previous revision, using the same gradual swap as an update.' },

    { type: 'scenario', title: 'Release night', intro: 'You are shipping version 1.1 of the shop API on a Friday afternoon (a choice you may regret). The cluster has three pods of 1.0 running. Marketing has an email going out in an hour.',
      meters: { 'uptime': 80, 'confidence': 50 },
      steps: [
        { text: 'How do you roll out 1.1?',
          choices: [
            { label: 'Update the Deployment’s image and let the rolling update swap pods gradually', score: 2, effects: { uptime: 10, confidence: 15 }, feedback: 'New pods become ready before old ones go, so users never see the whole app down.' },
            { label: 'Delete all three pods, then start three new ones', score: 0, effects: { uptime: -35, confidence: -15 }, feedback: 'Between the delete and the new pods being ready, nothing serves traffic. That is an outage you chose.' },
            { label: 'Edit the code in the running pods directly', score: 0, effects: { uptime: -15, confidence: -20 }, feedback: 'Pods are disposable and the change vanishes the moment one is replaced. The YAML must be the truth.' }
          ] },
        { text: 'Twenty minutes in, errors spike: 1.1 has a bug. The email goes out in forty minutes. What now?',
          choices: [
            { label: 'Run `kubectl rollout undo` to return to 1.0, then fix 1.1 calmly', score: 2, effects: { uptime: 25, confidence: 20 }, feedback: 'Rollback is a first-class feature. Restore service first, investigate second.' },
            { label: 'Push a rushed hotfix straight to production', score: 1, effects: { uptime: -5, confidence: -5 }, feedback: 'It may work, but you are changing code under pressure with users watching. Roll back first, then fix.' },
            { label: 'Wait and see if it gets better', score: 0, effects: { uptime: -25, confidence: -15 }, feedback: 'A bug does not heal itself, and the campaign is coming.' }
          ] }
      ],
      outro: 'Gradual rollouts plus a ready rollback make releases boring. That is the goal.' },

    { type: 'explain', prompt: 'Explain requests versus limits, and give an honest answer to “do we need Kubernetes?”',
      model: 'A request is the amount of CPU or memory a container reserves, which the scheduler uses to place it; a limit is a ceiling, where exceeding memory gets the container killed and exceeding CPU throttles it. Whether you need Kubernetes depends on scale: for a few services and a small team, a single server with Compose or a platform that runs containers is simpler, while many services, several teams and many machines benefit from Kubernetes’ self-healing, rollouts and scaling.',
      keywords: ['request', 'limit', 'scheduler', 'killed', 'throttled', 'simpler', 'scale', 'complexity'] }
  ],

  flashcards: [
    { q: 'What is an ingress?', a: 'A set of routing rules (run by an ingress controller) that send outside traffic to the right Service by host and path, often also handling HTTPS.' },
    { q: 'ConfigMap versus Secret?', a: 'A ConfigMap holds ordinary settings. A Secret holds sensitive values, but is only base64-encoded by default, so it still needs protecting.' },
    { q: 'How does a rolling update avoid downtime?', a: 'It starts new pods and waits for them to be ready before stopping old ones, gradually. `kubectl rollout undo` reverses it.' },
    { q: 'Requests versus limits?', a: 'A request reserves resources and guides scheduling. A limit is a ceiling: exceeding memory kills the container, exceeding CPU throttles it.' },
    { q: 'What do the Horizontal Pod Autoscaler and a cluster autoscaler do?', a: 'The first adds or removes pods based on load. The second adds or removes nodes when pods do not fit.' },
    { q: 'What are namespaces and Helm?', a: 'Namespaces partition a cluster into named areas such as staging and production. Helm is a package manager that installs templated bundles (charts) with environment values.' }
  ],

  glossary: [
    { term: 'Ingress', def: 'Rules for routing outside HTTP traffic to Services inside the cluster, run by an ingress controller.', like: 'The reception desk of an office building.' },
    { term: 'ConfigMap', def: 'A Kubernetes object that holds non-sensitive settings, which pods read as environment variables or files.', like: 'A notice board of settings.' },
    { term: 'Secret', def: 'A Kubernetes object for sensitive values like passwords. Only encoded by default, so it needs extra protection.', like: 'A locked drawer whose key is easy to copy unless you fit a better lock.' },
    { term: 'Rolling update', def: 'Replacing pods with a new version gradually, so some are always serving traffic.', like: 'Swapping the crew of a ship one sailor at a time.' },
    { term: 'Namespace', def: 'A named partition within a cluster, used to organise and lightly separate teams or environments.', like: 'A folder inside the cluster.' },
    { term: 'Helm', def: 'The package manager for Kubernetes: installs and upgrades templated bundles called charts.', like: 'An app store with an undo button.' }
  ],

  takeaways: [
    '**Ingress** is the front door. **ConfigMaps and Secrets** keep settings out of the image.',
    '**Rolling updates** swap pods gradually, and `rollout undo` goes back.',
    '**Requests** reserve, **limits** cap. Autoscaling needs requests.',
    '**Namespaces** tidy a cluster and **Helm** packages it. Honestly ask: do you need Kubernetes yet?'
  ],

  links: [
    { label: 'Kubernetes docs: Concepts', url: 'https://kubernetes.io/docs/concepts/' },
    { label: 'Helm docs', url: 'https://helm.sh/docs/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('containers', {
  title: 'The Container Kraken',
  intro: 'A many-armed kraken coils around your cluster, and each tentacle holds a question about boxes, images and orchestration. Cut through them by knowing what is shared, what is sealed and what is only a wish.',
  questions: [
    { type: 'mcq', q: 'Two teammates both run the same container image, yet one finds the app behaves differently from the other. What is the most likely cause?',
      options: ['A different environment variable or mounted volume was supplied at run time', 'The image changed itself between their runs', 'Each machine rebuilt the image differently', 'Containers randomly change their libraries'],
      answer: 0,
      why: [null, 'Images are read-only and never change.', 'They pulled the same image, not rebuilt it.', 'The libraries are baked into the image and stay put.'],
      explain: 'The image is identical, so differences come from outside it: settings (environment variables), mounted data (volumes) or the network around it.' },

    { type: 'tf', statement: 'A Linux container carries its own full operating system kernel.', answer: false,
      explain: 'Containers share the host’s kernel and are fenced off with namespaces and cgroups. Only a virtual machine carries its own kernel.' },

    { type: 'match', prompt: 'Match each item to what it does.',
      pairs: [['Namespace', 'Limits what a process can see'], ['cgroup', 'Limits how much a process can use'], ['Registry', 'Stores and serves images by name and tag'], ['Volume', 'Keeps data beyond a container’s life'], ['Service name', 'A hostname on the Compose network']] },

    { type: 'spot', prompt: 'A web container cannot reach its database in Compose. Tap the faulty line.',
      code: { lang: 'yaml', src: `
        services:
          web:
            build: .
            environment:
              DB_HOST: localhost
          db:
            image: postgres:16` },
      lines: [5],
      explain: 'Inside `web`, `localhost` is the web container itself. It needs the database service’s name, `db`.' },

    { type: 'ab', q: 'Which Dockerfile ordering gives faster rebuilds when you change application code?',
      a: { lang: 'docker', label: 'Install first', src: `
        COPY package*.json ./
        RUN npm ci
        COPY . .` },
      b: { lang: 'docker', label: 'Copy everything first', src: `
        COPY . .
        RUN npm ci` },
      answer: 'a',
      explain: 'The install layer only depends on the dependency list, so it stays cached until that changes. Copying all code first invalidates the install on every edit.' },

    { type: 'order', prompt: 'Put the journey from recipe to running container in order.',
      items: ['Write a Dockerfile', 'Build an image', 'Push it to a registry', 'Pull it onto the server', 'Run a container'],
      explain: 'A recipe makes an image, the registry carries it, and a container exists only once the image is started.' },

    { type: 'bucket', prompt: 'Does this belong to the control plane or to a worker node?', buckets: ['Control plane', 'Worker node'],
      items: [['Scheduler picks a node for a new pod', 0], ['Kubelet starts the containers', 1], ['API server stores desired state', 0], ['Your application’s pods actually run here', 1], ['Controllers fix differences between actual and desired', 0]],
      explain: 'The control plane decides and records; worker nodes run. The kubelet is each node’s agent that carries out the plan.' },

    { type: 'mcq', q: 'A Service has no traffic although three healthy pods exist. The pods are labelled `app: api` and the Service selects `app: web`. What is wrong?',
      options: ['The selector does not match the pods’ labels', 'Services cannot route to pods at all', 'Three replicas is too few for a Service', 'The Deployment must be deleted first'],
      answer: 0,
      why: [null, 'Services route to pods by label. That is their job.', 'A Service works with any number of pods.', 'Nothing needs deleting; the labels simply disagree.'],
      explain: 'A Service sends traffic to pods whose labels match its selector. With `web` versus `api`, it matches nothing.' },

    { type: 'multi', q: 'Which of these are good Docker image habits?',
      options: ['Pin base image versions instead of using `latest`', 'Run the app as a non-root user', 'Keep secrets out of the image', 'Put the password in an ENV line so deployment is easier', 'Run the database, cache and app together in one container'],
      answers: [0, 1, 2],
      explain: 'Pinned versions, non-root users and no baked-in secrets make images repeatable and safer. A secret in an ENV line stays in the layers forever, and one container per concern keeps things independent.' },

    { type: 'short', q: 'Rolling out a bad release: which `kubectl rollout` word takes you back to the previous version? (one word)', accept: ['undo'], hint: 'It is the opposite of do.',
      explain: '`kubectl rollout undo` reverts a Deployment to its previous revision.' },

    { type: 'cloze', text: 'Kubernetes continually compares {{desired}} state with {{actual}} state, a cycle called a {{control loop}}, and a {{Deployment}} keeps the right number of pods running.',
      distractors: ['stored', 'cache', 'namespace'],
      explain: 'Desired versus actual, repeated forever, is the control loop. A Deployment is the object that maintains the number of pods.' },

    { type: 'mcq', q: 'A small team runs three services with steady traffic and no dedicated operations person. Which is the sensible starting point?',
      options: ['Containers on one server with Compose, or a platform that runs them for you', 'A large self-managed Kubernetes cluster from day one', 'Abandon containers entirely', 'One container holding all three services'],
      answer: 0,
      why: [null, 'That brings a lot of complexity the team does not yet need.', 'Containers still solve "works on my machine". It is orchestration that can wait.', 'That gives up independent restarts and scaling.'],
      explain: 'Match the tool to the problem. Kubernetes shines with many services, several teams and many machines, and it is expensive in learning and upkeep until then.' }
  ]
});

KS.sheet('containers', {
  title: 'Containers & Kubernetes: cheat sheet',
  sections: [
    { title: 'VM versus container',
      md: `| | Virtual machine | Container |
        |---|---|---|
        | Virtualises | Hardware | OS view |
        | OS | Own guest OS | Shares host **kernel** |
        | Start | Minutes | About a second |
        | Isolation | Very strong | Good, weaker |

        **Namespaces** hide (what a process sees). **cgroups** limit (CPU, memory). Origins: **LXC**, then **Docker** (~2013). Mac and Windows run Linux containers in a hidden Linux VM.` },

    { title: 'Docker words and commands',
      md: `**Dockerfile** (recipe) → **image** (sealed, layered) → **container** (running, ephemeral).

        | Command | Does |
        |---|---|
        | \`docker build -t name:tag .\` | Build an image |
        | \`docker push / pull\` | Send / fetch via a registry |
        | \`docker run -d -p 8080:3000\` | Run, publish host:container port |
        | \`-e KEY=value\` | Set an environment variable |
        | \`-v name:/path\` | Mount a volume |` },

    { title: 'Dockerfile and image hygiene',
      md: `\`FROM\` base · \`WORKDIR\` · \`COPY\` · \`RUN\` (build time) · \`EXPOSE\` (documents a port) · \`USER\` · \`CMD\` (start time).

        - Least-changing steps first, so the **layer cache** helps
        - **Pin** versions, no \`latest\`
        - Slim base images; **multi-stage** builds
        - **No secrets** in the image; use \`.dockerignore\`
        - Non-root **USER**; one main process per container` },

    { title: 'Docker Compose',
      md: `One \`compose.yaml\` describes **services**, networks and volumes.

        - \`docker compose up -d\` · \`ps\` · \`logs -f web\` · \`down\` (\`down -v\` **deletes volumes**)
        - Services reach each other by **service name** (\`db\`), never \`localhost\`
        - \`depends_on\` orders start, but does **not** wait for readiness: use a health check or retries
        - **Volumes** for data; commit the file; secrets in an untracked \`.env\`
        - Best for dev, tests, small deployments` },

    { title: 'Kubernetes core',
      md: `**Control loop:** desired state vs actual state, forever.

        | Object | Job |
        |---|---|
        | Pod | One or more containers; disposable |
        | Deployment | Keeps N identical pods; handles updates |
        | Service | Stable address, spreads traffic (selects by **label**) |
        | Node | A machine that runs pods (kubelet) |
        | Control plane | API server, scheduler, controllers |

        Self-healing and scaling both fall out of the loop. Pods are cattle, not pets.` },

    { title: 'Day two and the big decision',
      md: `| Need | Answer |
        |---|---|
        | Route outside traffic | **Ingress** (+ controller), also HTTPS |
        | Settings / passwords | **ConfigMap** / **Secret** (base64, not encryption) |
        | Ship safely | **Rolling update**; \`kubectl rollout undo\` |
        | Resources | **Requests** reserve, **limits** cap (memory over = killed) |
        | Scale | **HPA** (pods), cluster autoscaler (nodes) |
        | Organise | **Namespaces**; package with **Helm** |

        **Need Kubernetes?** Few services, small team: Compose or a platform. Many services, many teams: yes.` }
  ]
});

