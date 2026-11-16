/* Module: os — Operating Systems (7 lessons) */

KS.lesson('os-what', {
  eli5: 'The operating system is the manager of a computer: it decides which program gets the processor, the memory and the disk, so dozens of programs can share one machine without trampling each other.',

  cards: [
    { kind: 'concept', title: 'One computer, forty programs',
      body: `Right now your laptop is probably running a browser, a music player, a code editor, a chat app and a pile of background helpers. Yet it has only a few **processor cores** (the parts that actually execute instructions) and one lot of memory.

        So who decides which program runs next? Who stops the music player from reading the memory your editor is using? Who makes sure two programs do not write to the same spot on the disk at the same moment?

        Not the programs themselves. They are far too busy. The job belongs to one special piece of software that starts before all the others: the **operating system**, or **OS**.` },

    { kind: 'metaphor', title: 'The shared-house manager',
      body: `Picture a big shared house with one kitchen, one bathroom and one broadband connection, and twelve housemates who all want them *now*.

        Without a house manager it is chaos. With one, there is a rota for the bathroom, a rule that you do not wander into someone else's bedroom, and a single person who handles the awkward stuff like the boiler.

        The OS is that manager. The housemates are your programs, and the shared stuff (processor time, memory, disk, network) is the **resources**. The OS is a **resource manager**: it hands resources out fairly, and it protects each program from the others.

        Where the metaphor stops: a house manager nags. An OS does its job silently, thousands of times a second.` },

    { kind: 'layers', title: 'Where the OS sits',
      body: 'Everything you run sits in a stack. Each layer only talks to the one directly below it.',
      layers: [
        { label: 'Your programs', note: 'Browser, Node.js server, database, your code.', icon: '📱', tone: 'accent' },
        { label: 'Libraries & runtimes', note: 'Reusable code your programs lean on, such as the Node.js runtime.', icon: '📚' },
        { label: 'Operating system (kernel)', note: 'Shares out the hardware and enforces the rules.', icon: '🧠', tone: 'good' },
        { label: 'Hardware', note: 'Processor, RAM, disk, network card.', icon: '🔌', tone: 'muted' }
      ] },

    { kind: 'compare', title: 'Kernel space vs user space',
      body: `The heart of the OS is the **kernel**. It is the one piece of code allowed to touch the hardware directly. Everything else, including every program you write, runs in **user space** with its hands tied.`,
      cols: ['Kernel space', 'User space'],
      rows: [
        ['Who runs here', 'The kernel and its drivers', 'Your code, browsers, databases'],
        ['Power', 'Full access to hardware and all memory', 'Can only touch its own memory'],
        ['If it crashes', 'The whole machine goes down', 'Only that program dies'],
        ['Reaches hardware by', 'Directly', 'Asking the kernel politely']
      ],
      note: 'The split is deliberate. A bug in your app should cost you one app, not the whole computer.' },

    { kind: 'sequence', title: 'A system call, step by step',
      body: 'A program in user space cannot read a file itself. It has to ask. That request is called a **system call**. Step through reading one file.',
      actors: ['Your program', 'Kernel', 'Disk'],
      steps: [
        { from: 0, to: 1, label: 'open("notes.txt")', note: 'Your program makes a **system call**: a formal request to the kernel. This is the only door into kernel space.' },
        { at: 1, label: 'check permissions', note: 'The kernel checks that this program is allowed to see this file. Refusing is part of its job.' },
        { from: 1, to: 2, label: 'fetch the data', note: 'The kernel, not your program, talks to the hardware.' },
        { from: 2, to: 1, label: 'bytes', dashed: true, note: 'The disk answers. This is the slow part (more on that in a later lesson).' },
        { from: 1, to: 0, label: 'here is your data', dashed: true, note: 'The kernel copies the bytes into your program\'s memory and hands control back.' }
      ] },

    { kind: 'concept', title: 'Abstractions: the OS hides the mess',
      body: `Disks come in dozens of makes, each with its own quirks. If every program had to know them all, nothing would ever get written. So the OS offers a few clean ideas instead, called **abstractions**:

        - a **file**: a named bundle of bytes you can open, read and write, whatever disk it is really on
        - a **process**: a running program with its own private world
        - a **device**: a keyboard, screen or network card, reached through the same simple calls

        Unix-style systems such as Linux go furthest: a huge number of things are reached the way files are, which is why you will hear "everything is a file".` },

    { kind: 'code', title: 'Your code is already making system calls',
      body: 'You never type "system call", but you make them constantly. Tap the highlighted lines.',
      code: { lang: 'js', src: `
        const fs = require('fs');

        const text = fs.readFileSync('notes.txt', 'utf8');
        console.log(text.length);

        const server = require('http').createServer();
        server.listen(3000);`,
        notes: {
          3: 'Behind this one line the runtime asks the kernel to **open** the file, **read** its bytes, then **close** it. Roughly three system calls.',
          4: 'Even `console.log` is a system call underneath: the kernel is what actually puts text on your terminal.',
          7: 'Listening on a **port** is a request to the kernel too: "send me any connection that arrives on 3000". The kernel keeps the rule and does the networking.'
        } } },

    { kind: 'realworld', title: 'Why a backend developer cares',
      body: `A server is just a computer, and the OS is what hands out its resources. So almost every production headache is an OS headache in disguise:

        - **The server slows to a crawl.** Probably a CPU, memory or disk limit.
        - **"Too many open files".** Each connection costs the kernel something, and there is a limit.
        - **"Address already in use".** Two programs asked the kernel for the same port.
        - **A process vanishes.** The kernel may have killed it for using too much memory.

        You do not need to write an OS. You need to know what it is *doing on your behalf*, so those messages make sense.` },

    { kind: 'pitfall', title: '"Works on my machine"',
      body: `Many developers build on macOS or Windows and deploy to Linux. The OS underneath differs, and so do small things your code may rely on:

        - File names are **case-sensitive** on Linux: \`Logo.png\` and \`logo.png\` are different files. On default macOS and Windows setups they are the same file, so a typo hides until deployment.
        - Windows paths use \`\\\` and Linux uses \`/\`.
        - Line endings and some default limits differ.

        This is one big reason servers are tested on the same OS they run on.`,
      note: 'Later lessons in this module cover Linux, since that is where most backends live.' }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'Which description of an operating system is closest to the truth?',
      options: ['A manager that shares the hardware between programs and keeps them apart', 'A program that makes other programs run faster by compressing them', 'The screen and menus you click on, and nothing underneath', 'A set of drivers that only matter when you plug something in'],
      answer: 0,
      why: [null, 'It does not speed programs up; it shares resources between them.', 'The desktop is only one visible part. Most of the OS is invisible.', 'Drivers are part of the picture, but the OS does far more than that.'],
      explain: 'The OS is a **resource manager** and a referee: it divides processor time, memory, disk and network between programs, and stops them interfering with each other.' },

    { type: 'tf', after: 3, statement: 'A normal program running in user space can read the disk directly, without asking the kernel.', answer: false,
      explain: 'User-space programs have no direct access to hardware. They must make a **system call** and let the kernel do it, after checking permissions. That is what keeps one buggy program from damaging everything.' },

    { type: 'match', prompt: 'Match each OS idea to what it is.',
      pairs: [['Kernel', 'The privileged core that talks to the hardware'], ['User space', 'Where ordinary programs run, with restricted power'], ['System call', 'A request from a program asking the kernel to do something'], ['File', 'An abstraction: named bytes, whatever the disk is'], ['Process', 'An abstraction: a running program with its own private world']] },

    { type: 'order', prompt: 'Put the steps of a program reading a file in order.',
      items: ['The program makes a system call asking to open the file', 'The kernel checks the program is allowed to read it', 'The kernel fetches the bytes from the disk', 'The kernel copies the bytes into the program\'s memory', 'The program carries on, now holding its data'],
      explain: 'The program never touches the disk. It asks, the kernel checks and fetches, and only then does control come back to the program with the data in hand.' },

    { type: 'bucket', prompt: 'Who does this job: the kernel, or your program in user space?', buckets: ['Kernel', 'User space'],
      items: [['Deciding which program gets the processor next', 0], ['Adding up the items in a shopping basket', 1], ['Reading bytes off the physical disk', 0], ['Turning an object into JSON text', 1], ['Checking whether you may open a file', 0], ['Deciding what the "Pay" button does', 1]],
      explain: 'Anything that shares or guards hardware is the kernel\'s job. Anything that is your own logic runs in user space and reaches the hardware only through system calls.' },

    { type: 'short', q: 'What is the name for a request from a program to the kernel, such as "open this file"? (two words, or one if you know the short form)', accept: ['system call', 'syscall', 'system calls', 'syscalls'], hint: 'It is the only door from user space into the kernel.',
      explain: 'A **system call** (syscall) is how user-space code asks the kernel for something it is not allowed to do itself: files, network, starting processes.' },

    { type: 'scenario', title: 'The server that would not start', intro: 'You deploy a new Node.js service to a Linux server. Instead of starting, it prints an error and quits. Your teammate is watching.',
      meters: { 'time wasted': 10, 'team confidence': 70 },
      steps: [
        { text: 'The error says: `EADDRINUSE: address already in use :::3000`. What is your first thought?',
          choices: [
            { label: 'Something else already asked the kernel for port 3000', score: 2, effects: { 'team confidence': 10 }, feedback: 'Exactly. A port can belong to only one program at a time, and the kernel keeps the register. Another process (perhaps an old copy of your own app) is holding it.' },
            { label: 'The server has run out of memory', score: 0, effects: { 'time wasted': 30, 'team confidence': -10 }, feedback: 'Out-of-memory errors look different. Reading the message first would have saved half an hour.' },
            { label: 'Windows and Linux disagree about port numbers', score: 0, effects: { 'time wasted': 25, 'team confidence': -10 }, feedback: 'Port numbers mean the same everywhere. The message is about a port being taken, not about the OS.' }
          ] },
        { text: 'So some other program owns the port. How do you handle it?',
          choices: [
            { label: 'Find which program holds the port, then decide whether to stop it or move your app', score: 2, effects: { 'time wasted': 5, 'team confidence': 15 }, feedback: 'Right. You will learn the commands for this later in the module. The key idea: the kernel knows who holds each port, and you can ask.' },
            { label: 'Reboot the whole server', score: 1, effects: { 'time wasted': 20 }, feedback: 'It will probably work, but it is a sledgehammer. If that server runs other services, they all go down too.' },
            { label: 'Change the code to try random ports until one works', score: 0, effects: { 'time wasted': 25, 'team confidence': -15 }, feedback: 'Now nobody (including the load balancer) knows where your app lives, and the real culprit is still running.' }
          ] }
      ],
      outro: 'The lesson: when something fails, ask **which resource** it needs (a port, memory, a file) and **who currently holds it**. The OS always has the answer.' },

    { type: 'explain', prompt: 'A friend says: "The OS is just Windows or macOS, the thing with the icons." Explain what an OS really does, and why programs cannot just use the hardware themselves.',
      model: 'The OS is a resource manager: it shares the processor, memory, disk and network between many programs and keeps them apart. Programs run in user space with limited power and ask the kernel for anything involving hardware, using system calls. That way one buggy or greedy program cannot crash the machine or read another program\'s data. The icons are only the most visible part.',
      keywords: ['resource', 'kernel', 'system call', 'user space', 'share', 'protect'] }
  ],

  flashcards: [
    { q: 'What is the main job of an operating system?', a: 'To share the computer\'s resources (processor, memory, disk, network) between many programs and protect them from each other.' },
    { q: 'Kernel space vs user space?', a: 'The kernel runs with full hardware access. Ordinary programs run in user space with restricted power and must ask the kernel for anything privileged.' },
    { q: 'What is a system call?', a: 'A request from a program to the kernel to do something it cannot do itself, such as open a file or listen on a port.' },
    { q: 'Name three abstractions an OS provides.', a: 'Files (named bytes), processes (running programs with private memory) and devices (hardware reached through simple, uniform calls).' },
    { q: 'Why is a file called Logo.png sometimes a deployment bug?', a: 'Linux file names are case-sensitive, while default macOS and Windows setups are not, so a wrongly-cased name works locally and fails on the server.' }
  ],

  glossary: [
    { term: 'Operating system', def: 'The core software that manages a computer\'s hardware and shares it between programs.', like: 'The manager of a shared house.', aka: ['OS'] },
    { term: 'Kernel', def: 'The privileged heart of the OS, the only code allowed to touch the hardware directly.', like: 'The caretaker with the master key.' },
    { term: 'User space', def: 'The restricted area where ordinary programs run. They can only affect their own memory and must ask the kernel for anything else.', like: 'The customer side of a shop counter.' },
    { term: 'System call', def: 'A formal request from a program to the kernel, such as opening a file or sending data over the network.', like: 'Filling in a request form at the counter.', aka: ['syscall'] },
    { term: 'Abstraction', def: 'A simple idea (like "file") that hides messy details underneath (the many kinds of disk).', like: 'A car pedal: you press, and never think about the fuel injection.' },
    { term: 'Resource', def: 'Anything a program needs and the OS shares out: processor time, memory, disk space, network bandwidth, open ports.' }
  ],

  takeaways: [
    'The OS is a **resource manager**: it shares processor, memory, disk and network and keeps programs apart.',
    'The **kernel** has full hardware power; your code lives in **user space** and asks via **system calls**.',
    'Files, processes and devices are **abstractions** that hide the messy hardware.',
    'Most server problems are really about a resource running out, so know who holds what.'
  ]
});

KS.lesson('os-processes-threads', {
  eli5: 'A process is a running program with its own private memory; threads are several workers inside one process that share that memory. The OS flips between them so fast that everything seems to happen at once.',

  cards: [
    { kind: 'concept', title: 'A program is not a process',
      body: `You double-click a browser icon. Then you double-click it again. You now have **one program** on disk but **two windows**, each with its own tabs, its own state, its own crash.

        The file sitting on the disk is a **program**: instructions, doing nothing. When the OS loads it and starts running it, that live, running thing is a **process**.

        One program can be started many times, giving many processes. Your server is the same: \`node server.js\` is the program, and each time you launch it you get a new process.` },

    { kind: 'metaphor', title: 'Recipe, kitchen and cooks',
      body: `A **program** is a recipe in a book. Nothing happens until someone cooks.

        A **process** is a cook working in their own kitchen: their own counter, their own ingredients, their own fridge. Two cooks in two kitchens cannot spoil each other's dinner.

        A **thread** is an extra pair of hands in the *same* kitchen. Three cooks sharing one counter get dinner out faster, but they can also reach for the same knife, or one can throw away an ingredient another was about to use.

        Where it stops: real threads do not argue politely. They just corrupt data, as the next lesson shows.` },

    { kind: 'concept', title: 'Isolation and the PID',
      body: `Every process gets two things from the OS:

        - A **PID** (process ID): a unique number, like a ticket number at a deli counter. It is how you point at one process when you want to inspect or stop it.
        - **Its own private memory.** Process A cannot read or write process B's memory. If it tries, the kernel stops it.

        This **isolation** is why a crashing browser tab does not take your editor with it, and why one customer's data in a server process cannot leak into another process by accident.

        Processes can still talk, but only through channels the OS provides (a later lesson covers them).` },

    { kind: 'diagram', title: 'One process, three threads',
      body: 'Threads live inside a process. Each has its own place in the code it is running, but all of them share the process\'s memory.',
      nodes: [
        { id: 'p', label: 'Process: web server', icon: '🖥️', x: 1, y: 0, tone: 'accent' },
        { id: 't1', label: 'Thread 1', x: 0, y: 1 },
        { id: 't2', label: 'Thread 2', x: 1, y: 1 },
        { id: 't3', label: 'Thread 3', x: 2, y: 1 },
        { id: 'm', label: 'Shared memory', icon: '🧠', x: 1, y: 2, tone: 'warn' }
      ],
      edges: [
        { from: 'p', to: 't1', dashed: true }, { from: 'p', to: 't2', dashed: true }, { from: 'p', to: 't3', dashed: true },
        { from: 't1', to: 'm', both: true }, { from: 't2', to: 'm', both: true }, { from: 't3', to: 'm', both: true }
      ],
      caption: 'Sharing memory makes threads quick to cooperate, and easy to get wrong.' },

    { kind: 'compare', title: 'Process vs thread',
      body: 'The same trade-off appears everywhere in backend design: **isolation** against **cheap sharing**.',
      cols: ['Process', 'Thread'],
      rows: [
        ['Memory', 'Its own, private', 'Shared with its siblings'],
        ['Cost to start', 'Heavier', 'Lighter'],
        ['If one crashes', 'Others usually carry on', 'A bad crash can take the whole process down'],
        ['Talking to each other', 'Needs OS channels', 'Just read and write shared memory'],
        ['Main danger', 'Slower to share data', 'Bugs from sharing data']
      ] },

    { kind: 'sequence', title: 'A context switch',
      body: 'A processor core runs **one** thing at a time. To look like it is doing many, the OS keeps swapping them. Each swap is a **context switch**.',
      actors: ['Scheduler', 'Process A', 'Process B'],
      steps: [
        { from: 0, to: 1, label: 'run for a short slice', note: 'The **scheduler** (the part of the kernel that picks who runs) gives A the core for a few milliseconds.' },
        { at: 1, label: 'working…', note: 'A computes happily, unaware of what is about to happen.' },
        { from: 1, to: 0, label: 'time is up', dashed: true, note: 'A timer fires and the kernel takes the core back. A did not get a vote.' },
        { at: 0, label: 'save A, load B', note: 'The kernel saves A\'s place (where it was, what it was holding) and restores B\'s. That bookkeeping is the **context switch**.' },
        { from: 0, to: 2, label: 'run for a short slice', note: 'B now runs. Later A gets its turn again and carries on exactly where it left off.' }
      ] },

    { kind: 'pitfall', title: 'Switching is not free',
      body: `Slices are so short that it *feels* simultaneous. But every switch costs a little time, and it also disturbs the processor's fast caches.

        So **more threads is not always faster**. Four cores can truly run four things at once. Start four thousand busy threads and the machine spends a growing share of its time just swapping between them.

        Threads that are mostly *waiting* (for a network reply, say) cost far less than threads busy computing, because a waiting thread does not need the core until its answer arrives.` },

    { kind: 'realworld', title: 'How real servers choose',
      body: `There is no single winner. Well-known examples:

        - **PostgreSQL** gives each client connection its own process: strong isolation.
        - **Java web servers** typically keep a pool of threads and give each request to one.
        - **nginx** runs a few worker processes, each handling many connections on its own event loop.
        - **Node.js** runs your JavaScript on a single thread, and people start extra processes to use more cores.
        - In standard **Python**, a lock inside the interpreter stops threads running Python code in parallel, so CPU-heavy work usually goes to processes.

        Rule of thumb: **processes for isolation, threads for cheap sharing.**` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'Two processes are running. Process A has a bug and starts writing to random memory addresses. What happens to process B\'s memory?',
      options: ['It is safe: the kernel stops A from touching memory that is not its own', 'It is corrupted, because all processes share one big memory', 'It is safe only if B started first', 'It is corrupted, but only when both run on the same core'],
      answer: 0,
      why: [null, 'That describes threads in one process, not separate processes.', 'Start order makes no difference to isolation.', 'Cores are irrelevant; isolation is enforced by the kernel.'],
      explain: 'Each process has private memory, and the kernel refuses any access outside it. A\'s stray writes get A killed, and B is untouched. Threads inside one process have no such wall.' },

    { type: 'tf', after: 5, statement: 'A computer with a single processor core cannot make progress on more than one program at a time, so it relies on rapid switching between them.', answer: true,
      explain: 'One core executes one instruction stream at any instant. The scheduler swaps programs so quickly that they appear to run together. True simultaneous running needs more than one core.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [['Program', 'Instructions stored on disk, not yet running'], ['Process', 'A running program with its own private memory'], ['Thread', 'A path of execution sharing its process\'s memory'], ['Scheduler', 'The kernel part that decides who runs next'], ['Context switch', 'Saving one task\'s state and loading another\'s']] },

    { type: 'bucket', prompt: 'Is this true of a process, or of a thread?', buckets: ['Process', 'Thread'],
      items: [['Has memory that siblings cannot touch', 0], ['Shares memory with others in the same program', 1], ['A crash usually leaves other peers running', 0], ['Cheaper to create', 1], ['Is identified by its own PID', 0], ['Can pass data just by writing to a shared variable', 1]],
      explain: 'Processes trade speed for walls; threads trade walls for speed. Every item here follows from one fact: process memory is private and thread memory is shared.' },

    { type: 'order', prompt: 'Put a context switch in order.',
      items: ['A timer fires and the kernel takes the core back', 'The kernel saves the running task\'s state', 'The scheduler picks the next task', 'The kernel loads that task\'s saved state', 'The new task runs on the core'],
      explain: 'The kernel saves where the old task was before choosing and restoring the next, so nothing is lost and each task resumes where it left off.' },

    { type: 'short', q: 'What do we call the unique number the OS gives each running process?', accept: ['PID', 'process ID', 'process id'], hint: 'Three letters; it stands for "process ID".',
      explain: 'The **PID** is how you tell the OS which process you mean, for example when asking it to stop one.' },

    { type: 'scenario', title: 'Picking a design', intro: 'Your team is building two services. You must choose between separate processes, threads, or a single event loop for each. Think about isolation, sharing and cost.',
      meters: { reliability: 60, speed: 60 },
      steps: [
        { text: 'Service one resizes uploaded photos. Each job is heavy on the processor and jobs never need to share data. What do you choose?',
          choices: [
            { label: 'A pool of worker processes, roughly one per core', score: 2, effects: { reliability: 15, speed: 20 }, feedback: 'Good. Heavy jobs keep every core busy, jobs share nothing so isolation is free, and a crash in one worker does not hurt the others.' },
            { label: 'One thread doing every photo in turn', score: 0, effects: { speed: -25 }, feedback: 'It uses a single core, so a queue of photos waits behind the first big one while other cores sit idle.' },
            { label: 'Thousands of threads, one per photo', score: 1, effects: { speed: -5, reliability: -10 }, feedback: 'More threads than cores just adds switching overhead, and one bad crash can take the whole process (and all the photos in flight) with it.' }
          ] },
        { text: 'Service two is a chat server holding 20,000 connections, nearly all idle waiting for the next message. It also keeps a shared list of who is online. Which is the better fit?',
          choices: [
            { label: 'A small number of threads or event loops sharing the online list in memory', score: 2, effects: { speed: 15, reliability: 5 }, feedback: 'Idle connections cost almost nothing when they only wait, and shared memory makes the online list easy. (Mind the next lesson on guarding shared data.)' },
            { label: 'One process per connection', score: 1, effects: { reliability: 5, speed: -15 }, feedback: 'Strongly isolated, but 20,000 processes is a lot of memory and sharing the online list now needs OS channels.' },
            { label: 'Start a new process every time a message arrives', score: 0, effects: { speed: -25, reliability: -10 }, feedback: 'Starting a process is much more expensive than the message it was started for.' }
          ] }
      ],
      outro: 'Ask two questions: **does the work need the processor or just waiting?** and **does it need to share data?**' },

    { type: 'explain', prompt: 'Explain to a friend the difference between a process and a thread, and one situation where you would pick each.',
      model: 'A process is a running program with its own private memory, so processes are isolated: one crashing or misbehaving does not corrupt another. Threads live inside one process and share its memory, which makes them cheap and good at cooperating, but they can corrupt shared data and a bad crash takes them all down. I would use processes for heavy, independent jobs, and threads when workers need to share data cheaply.',
      keywords: ['private memory', 'isolation', 'share', 'crash', 'cheap', 'PID'] }
  ],

  flashcards: [
    { q: 'Program vs process?', a: 'A program is instructions on disk. A process is that program running, with its own memory and PID.' },
    { q: 'What does process isolation give you?', a: 'Each process has private memory that others cannot touch, so one crashing or buggy process does not corrupt the rest.' },
    { q: 'What do threads in one process share?', a: 'The same memory (and open files). That makes sharing cheap, and also makes bugs from sharing possible.' },
    { q: 'What is a context switch?', a: 'The kernel saving one task\'s state and loading another\'s so the core can run something else. Useful, but not free.' },
    { q: 'Rule of thumb for processes vs threads?', a: 'Processes for isolation and independent heavy work; threads for cheap sharing between workers.' }
  ],

  glossary: [
    { term: 'Process', def: 'A running instance of a program, with its own private memory and a unique PID.', like: 'A cook in their own kitchen.' },
    { term: 'PID', def: 'Process ID: the unique number the OS gives each process.', like: 'A ticket number at a deli counter.', aka: ['process ID'] },
    { term: 'Thread', def: 'A separate path of execution inside a process. Threads in one process share its memory.', like: 'Extra pairs of hands in the same kitchen.' },
    { term: 'Scheduler', def: 'The part of the kernel that decides which process or thread runs on each core next.', like: 'A referee handing out turns.' },
    { term: 'Context switch', def: 'Saving the state of the running task and restoring another\'s, so the core can switch between them.', like: 'Putting a bookmark in one book and opening another.' }
  ],

  takeaways: [
    'A **program** sits on disk; a **process** is it running, with private memory and a **PID**.',
    '**Threads** share their process\'s memory: cheap to cooperate, easy to get wrong.',
    'The **scheduler** swaps tasks on each core; switching is fast but not free.',
    'Processes for **isolation**, threads for **cheap sharing**.'
  ]
});

KS.lesson('os-concurrency', {
  eli5: 'When several things run at the same time and touch the same data, the order they happen in can change the answer. Locks, careful design and event loops are how we keep that under control.',

  cards: [
    { kind: 'concept', title: 'Two words people mix up',
      body: `Picture one barista making coffees. A customer orders a latte. While the milk steams, she starts an espresso for the next person, then returns to the milk. One person, several drinks **in progress**. That is **concurrency**: dealing with many things at once by interleaving them.

        Now add a second barista. Two drinks are being made at the *same instant*. That is **parallelism**: doing many things at the same moment, which needs more than one worker (for computers, more than one core).

        Concurrency is about **structure**. Parallelism is about **simultaneous execution**. You can have either without the other.` },

    { kind: 'metaphor', title: 'The shared notepad',
      body: `Two flatmates share a paper shopping list on the fridge. It says "milk: 1".

        Both walk past at the same moment. Both read "milk: 1". Each thinks "we need more" and writes "milk: 2". The list says 2, but **two** people each wanted to add one, so it should say 3.

        Neither did anything wrong on their own. The mistake came from both reading *before* either wrote. That is the heart of a **race condition**: the result depends on who wins the race.` },

    { kind: 'code', title: 'The bug in code',
      body: 'This looks innocent. Imagine two threads both running `deposit` on the same account. Tap the lines.',
      code: { lang: 'py', src: `
        balance = 100

        def deposit(amount):
            global balance
            current = balance          # read
            current = current + amount # change
            balance = current          # write back

        # thread 1: deposit(50)    thread 2: deposit(30)
        # expected final balance: 180`,
        notes: {
          5: '**Read.** Both threads can read 100 before either has written anything.',
          6: 'Each computes its own answer from the old value: 150 and 130.',
          7: '**Write.** Whoever writes last wins. The final balance is 150 or 130, never 180. One deposit has vanished.'
        } } },

    { kind: 'sequence', title: 'Unlucky timing, one step at a time',
      body: 'Here is one way the two deposits interleave. Nothing crashes; the answer is just wrong.',
      actors: ['Thread 1', 'Balance', 'Thread 2'],
      steps: [
        { from: 0, to: 1, label: 'read: 100', note: 'Thread 1 reads the balance.' },
        { from: 2, to: 1, label: 'read: 100', note: 'The scheduler swaps in thread 2 before thread 1 has written. It also reads 100.' },
        { from: 0, to: 1, label: 'write: 150', note: 'Thread 1 writes 100 + 50.' },
        { from: 2, to: 1, label: 'write: 130', note: 'Thread 2 writes 100 + 30, wiping out thread 1\'s work.' },
        { note: 'Final balance: **130**. The 50 is gone. Run it again with different timing and it might be correct, which is what makes these bugs so slippery.' }
      ] },

    { kind: 'concept', title: 'Locks: one at a time, please',
      body: `A race condition needs two ingredients: **shared data that can change**, and **unlucky timing**. Remove either and it goes away.

        Often you cannot remove the sharing, so you control the timing with a **lock** (also called a **mutex**, short for "mutual exclusion"). Before touching the shared data a thread **acquires** the lock; when done it **releases** it. If the lock is taken, everyone else **waits**.

        Think of a toilet door with a lock: you go in, you lock it, others queue, you unlock. The code between acquire and release is the **critical section**, and only one thread can be inside it.

        The lab that follows lets you run this with and without a lock and watch the counter break.` },

    { kind: 'code', title: 'The fix, with a lock',
      body: 'The same function, now with a lock around the dangerous part.',
      code: { lang: 'py', src: `
        import threading

        balance = 100
        lock = threading.Lock()

        def deposit(amount):
            global balance
            with lock:                 # acquire, then release on exit
                current = balance
                balance = current + amount`,
        notes: {
          9: 'Only one thread at a time can be inside this block. The second waits until the first leaves.',
          10: 'Read and write now happen together as one unbroken step, so no deposit can slip in between.'
        } } },

    { kind: 'story', title: 'Deadlock: everyone politely waits',
      body: `Locks create a new danger. Two threads, two locks:

        - Thread 1 grabs lock **A** and then wants **B**.
        - Thread 2 grabs lock **B** and then wants **A**.

        Each holds the lock the other needs and will not let go until it gets the second one. Neither can ever proceed. The program does not crash or print an error. It simply **freezes**. This is a **deadlock**: a cycle of threads each waiting on the next.

        It is the corridor standoff where two people each wait for the other to step aside. The classic cure is to make everyone take locks in the **same order** (always A, then B), so a cycle cannot form. Holding locks for as short a time as possible helps too.` },

    { kind: 'concept', title: 'Another way: one thread, never waiting',
      body: `Locks and threads are hard to get right. A server has a different big problem anyway: most of a request's life is **waiting** (for the database, for a file, for another service).

        **Async I/O** solves it differently. Instead of a thread sitting idle until the reply arrives, the program says "tell me when it is done" and carries on with something else. Node.js is built around this: your JavaScript runs on **one thread**, driven by an **event loop** that picks up each finished job's callback and runs it.

        Because only one piece of your code runs at once, plain variables cannot be corrupted midway. In effect: lots of concurrency, no parallel JavaScript, and no locks needed for most of your code.` },

    { kind: 'pitfall', title: 'Never block the event loop',
      body: `The event loop has one thread, so one slow piece of code stalls **everybody**. Compare:

        - \`await fetch(url)\` hands control back while waiting, so other requests run.
        - A huge loop, or a synchronous call such as \`fs.readFileSync\` on a big file, holds the thread. Every other request waits until it is done.

        This is like one barista who refuses to do anything else while a single customer decides what they want.

        For genuinely heavy computing, move the work to another thread or process. Concurrency copes with waiting; it does not make computing free.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'A single-core machine runs three tasks by switching between them quickly. Which word fits best?',
      options: ['Concurrency, but not parallelism', 'Parallelism, because three things progress', 'Neither, since only one thing runs at a time', 'Both, since the tasks overlap in time'],
      answer: 0,
      why: [null, 'With one core nothing executes at the same instant, so it is not parallel.', 'Several tasks are in progress and make headway, which is concurrency.', 'They overlap in time but never run at the same instant.'],
      explain: 'Interleaving many tasks is **concurrency**. **Parallelism** needs several cores executing at the same instant.' },

    { type: 'tf', after: 3, statement: 'A race condition always produces the wrong answer.', answer: false,
      explain: 'It only goes wrong when the timing is unlucky. Most runs may be fine, which is exactly why these bugs slip through testing and appear under load in production.' },

    { type: 'multi', q: 'Which of these are needed for a race condition to be possible?',
      options: ['Shared data that can be changed', 'Two or more tasks that can interleave', 'Timing where one task acts between another\'s read and write', 'A deadlock', 'More than four processor cores'],
      answers: [0, 1, 2],
      explain: 'Sharing, interleaving and an unlucky gap between read and write are the ingredients. Deadlocks are a separate problem, and a race can happen on one core.' },

    { type: 'spot', prompt: 'Two threads both run this to count visitors. Tap the line where the race hides.',
      code: { lang: 'js', src: `
        let visitors = 0;

        function onVisit() {
          const current = visitors;
          visitors = current + 1;
          log('new total', visitors);
        }` },
      lines: [4, 5],
      explain: 'Reading `visitors` and writing it back are separate steps. If another thread runs between them, one increment is lost. The read-modify-write must happen as one protected unit.' },

    { type: 'order', prompt: 'Put the lifecycle of a lock in order.',
      items: ['A thread acquires the lock', 'It reads the shared data', 'It changes and writes the data', 'It releases the lock', 'A waiting thread can now acquire it'],
      explain: 'The whole read-and-write sits between acquire and release, so waiting threads only see the data once it is consistent again.' },

    { type: 'cloze', text: 'A deadlock happens when thread 1 holds lock A and waits for lock {{B}}, while thread 2 holds lock B and waits for lock {{A}}. A common cure is to always take locks in the same {{order}}.',
      distractors: ['C', 'size', 'thread'],
      explain: 'Each thread is waiting for something the other holds, forming a cycle. A fixed lock order makes a cycle impossible.' },

    { type: 'ab', q: 'Which Node.js handler keeps the server responsive while it waits for the data?',
      a: { lang: 'js', label: 'Version one', src: `
        app.get('/report', async (req, res) => {
          const rows = await db.query('SELECT ...');
          res.json(rows);
        });` },
      b: { lang: 'js', label: 'Version two', src: `
        app.get('/report', (req, res) => {
          const rows = bigSyncReport();  // 5 s of CPU
          res.json(rows);
        });` },
      answer: 'a',
      explain: 'While waiting for the database, the first handler gives the event loop back, so other requests are served. The second hogs the single thread for five seconds, and everyone else waits.' },

    { type: 'scenario', title: 'The freezing checkout', intro: 'Your shop\'s order service uses threads and locks. Twice a day it freezes completely: no errors, no crash, CPU idle, requests pile up. A restart fixes it.',
      meters: { 'customers served': 70, 'sanity': 70 },
      steps: [
        { text: 'It freezes without any error and the CPU is idle. What does that pattern most suggest?',
          choices: [
            { label: 'A deadlock: threads waiting on each other\'s locks', score: 2, effects: { sanity: 10 }, feedback: 'Idle CPU with stuck requests means threads are waiting, not working. A cycle of lock waits fits perfectly.' },
            { label: 'A race condition corrupting data', score: 1, effects: { sanity: -5 }, feedback: 'Races give wrong answers rather than a clean freeze. Freezing with idle CPU points at waiting.' },
            { label: 'The processor is overheating', score: 0, effects: { sanity: -15, 'customers served': -10 }, feedback: 'An overheated machine would be busy and slow, not idle.' }
          ] },
        { text: 'Looking at the code: the "reserve stock" path takes the stock lock then the payment lock; the "refund" path takes the payment lock then the stock lock. What is the fix?',
          choices: [
            { label: 'Make both paths take the locks in the same order', score: 2, effects: { 'customers served': 25, sanity: 15 }, feedback: 'Same order means no cycle, so no deadlock. Keeping each critical section short helps further.' },
            { label: 'Remove the locks entirely', score: 0, effects: { 'customers served': -20, sanity: -20 }, feedback: 'Now stock and payments are racing, and you will oversell items instead of freezing.' },
            { label: 'Schedule a restart every six hours', score: 1, effects: { 'customers served': 5, sanity: -5 }, feedback: 'It hides the freeze but customers still lose carts at every restart, and the bug remains.' }
          ] }
      ],
      outro: 'Freezing with idle CPU is the deadlock signature. The cure is **consistent lock order** (or fewer locks).' },

    { type: 'explain', prompt: 'Explain why a Node.js server can serve thousands of waiting requests on a single thread, and what could ruin that.',
      model: 'Most of a request is spent waiting for I/O such as a database. Node uses non-blocking async I/O: it starts the operation, returns to the event loop, and runs the callback when the result arrives, so one thread can juggle many requests. A long-running synchronous piece of code blocks the loop, so every other request has to wait until it finishes.',
      keywords: ['event loop', 'non-blocking', 'waiting', 'single thread', 'block', 'async'] }
  ],

  flashcards: [
    { q: 'Concurrency vs parallelism?', a: 'Concurrency is dealing with many tasks by interleaving them. Parallelism is running many tasks at the same instant, which needs multiple cores.' },
    { q: 'What two ingredients does a race condition need?', a: 'Shared mutable data, and unlucky timing between tasks that touch it.' },
    { q: 'What does a lock (mutex) do?', a: 'It lets only one thread at a time into a critical section; others wait until it is released.' },
    { q: 'What is a deadlock, and a standard cure?', a: 'Threads wait on each other\'s locks in a cycle and none can proceed. Always acquire locks in a consistent order.' },
    { q: 'How does Node.js handle many requests on one thread?', a: 'Non-blocking I/O plus an event loop: it starts a slow operation, carries on, and runs a callback when it finishes. Blocking the loop stalls everyone.' }
  ],

  glossary: [
    { term: 'Concurrency', def: 'Handling many tasks in overlapping time by interleaving them, even on one core.', like: 'One barista juggling several drinks.' },
    { term: 'Parallelism', def: 'Running tasks at the very same instant on separate cores.', like: 'Two baristas each making a drink.' },
    { term: 'Race condition', def: 'A bug where the result depends on the timing of tasks sharing changeable data.', like: 'Two flatmates updating one shopping list at once.' },
    { term: 'Mutex', def: 'A lock giving one thread at a time exclusive access to shared data.', like: 'The lock on a toilet door.', aka: ['lock', 'mutual exclusion'] },
    { term: 'Deadlock', def: 'A freeze where threads each hold something another needs, forming a waiting cycle.', like: 'Two people stuck in a corridor, each waiting for the other to move.' },
    { term: 'Event loop', def: 'A loop that waits for events (such as finished I/O) and runs the matching callbacks, one at a time.', like: 'A receptionist answering whichever phone rings next.' }
  ],

  takeaways: [
    '**Concurrency** is juggling; **parallelism** is several jugglers.',
    'A race condition = **shared mutable data + unlucky timing**. Locks fix it.',
    '**Deadlock** = a cycle of lock waits. Take locks in a consistent order.',
    'Node\'s event loop handles waiting well, but one blocking call stalls everyone.'
  ]
});

KS.lesson('os-memory', {
  eli5: 'Memory (RAM) is the computer\'s fast desk space. Small, short-lived values go on a tidy stack, bigger long-lived objects go on a messy heap, and something has to clean the heap up before it fills.',

  cards: [
    { kind: 'story', title: 'The server that died on day three',
      body: `A team launches a new API. It runs perfectly for two days. On day three it gets slower, then it vanishes from the process list. Restart it and all is well, for another three days.

        Nobody changed anything. What changed was **memory**: the process asked for a little more every hour, never gave any back, and eventually the OS ran out of patience.

        To see why, you need to know where your variables live, how the OS hands out memory, and who is supposed to clean up. That is this lesson.` },

    { kind: 'metaphor', title: 'The desk and the filing cabinet',
      body: `**RAM** (random-access memory) is your desk: small, instantly reachable, and cleared when you go home (power off).

        The **disk** is the filing cabinet: vast and permanent, but you have to walk over and rummage.

        A program can only *work on* things that are on the desk. So the OS keeps loading what is needed from the cabinet onto the desk, and the desk is always the scarce resource.

        Where it stops: a real desk is not secretly divided between twelve people who each believe they own all of it. A computer's is, as the next card explains.` },

    { kind: 'concept', title: 'Virtual memory: everyone gets a private map',
      body: `Every process believes it has a huge, tidy block of memory all to itself, starting at address zero. That is **virtual memory**.

        In truth the OS keeps a **map** from each process's imaginary addresses to real places in RAM. Two processes can both use "address 1000" and land in completely different spots.

        Three nice results:

        - **Isolation**: a process simply has no address that points at someone else's memory.
        - **Convenience**: your program does not care where it really sits in RAM.
        - **Flexibility**: the OS can move rarely used chunks out to disk and bring them back when needed.

        Think of hotel room numbers: every hotel has a room 101, and each is a different real room.` },

    { kind: 'compare', title: 'Stack vs heap',
      body: 'A running program uses two main areas of memory, and they behave very differently.',
      cols: ['Stack', 'Heap'],
      rows: [
        ['Holds', 'Function calls and their local values', 'Objects and data that outlive one call'],
        ['Managed by', 'Automatically: push on call, pop on return', 'A garbage collector, or by hand'],
        ['Speed', 'Very fast and tidy', 'Slower; can get fragmented'],
        ['Size', 'Small and fixed', 'Large, can grow'],
        ['Typical failure', 'Stack overflow', 'Memory leak, out of memory']
      ],
      note: 'The stack is the neat pile of plates; the heap is the big storeroom where things are put wherever there is space.' },

    { kind: 'code', title: 'Which variable lives where?',
      body: 'Roughly speaking (languages differ in the details). Tap the lines.',
      code: { lang: 'js', src: `
        function makeUser(name) {
          const age = 30;
          const user = { name: name, age: age };
          return user;
        }

        const u = makeUser('Sam');`,
        notes: {
          2: 'A small local value. It lives in this call\'s **stack frame** and vanishes the moment the function returns.',
          3: 'The object itself is created on the **heap**. The variable `user` on the stack just holds a reference to it.',
          4: 'The stack frame is destroyed on return, but the object survives because `u` still points at it. Stack values die with the call; heap objects live as long as something refers to them.'
        } } },

    { kind: 'steps', title: 'The call stack and the overflow',
      body: 'Each function call adds a **frame** to the stack; each return removes one.',
      steps: [
        { title: 'main calls a()', body: 'A frame for `a` is pushed on top. The stack is now main, a.' },
        { title: 'a calls b()', body: 'Another frame is pushed: main, a, b. Only the top one is running.' },
        { title: 'b returns', body: 'Its frame is popped and its local values vanish. Back in `a`.' },
        { title: 'A function calls itself forever', body: 'With no stopping condition, frames pile up until the stack\'s small fixed space runs out.' },
        { title: 'Stack overflow', body: 'The program is stopped with an error (in JavaScript, "Maximum call stack size exceeded"). Missing base cases in recursion are the usual cause.' }
      ] },

    { kind: 'compare', title: 'Who cleans up the heap?',
      body: 'Heap objects do not vanish when a function returns, so somebody must decide when they are no longer needed.',
      cols: ['Manual', 'Garbage collected'],
      rows: [
        ['How it works', 'You ask for memory and free it yourself', 'A runtime finds objects nothing refers to and frees them'],
        ['Seen in', 'C, C++', 'JavaScript, Python, Java, Go, C#'],
        ['Upside', 'Full control, no pauses', 'Whole classes of bugs gone'],
        ['Downside', 'Forget to free: leak. Free too early: crash or corruption', 'Some runtime cost, occasional pauses']
      ],
      note: 'Rust is a third way: the compiler works out when to free memory, with no garbage collector at run time.' },

    { kind: 'pitfall', title: 'Leaks happen even with a garbage collector',
      body: `A garbage collector frees objects **nothing refers to**. It cannot tell the difference between "still needed" and "still referenced by accident".

        \`\`\`js
        const cache = {};
        function getUser(id) {
          if (!cache[id]) cache[id] = loadUser(id);
          return cache[id];
        }
        \`\`\`

        Every new id is added to \`cache\` and **never removed**. The object holds references to all of them forever, so the collector must keep them. Memory creeps up for days: exactly the day-three server.

        Typical culprits: caches with no size limit, lists that only grow, and event listeners that are added but never removed.` },

    { kind: 'concept', title: 'When RAM runs out: swap and the OOM killer',
      body: `Suppose all the RAM is in use. The OS has two options.

        First, **swap**: move rarely used chunks of memory out to a file or partition on disk to free the desk. It works, but disk is vastly slower than RAM, so a machine that is swapping heavily crawls. (This slowdown is called **thrashing**.)

        If even that is not enough, on Linux the **OOM killer** ("out of memory") steps in and **kills a process**, usually a big one, to save the machine. Your server simply disappears, often with a line in the system log.

        So when a process vanishes with no crash message, check memory first.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'Two different processes both read "address 4000" in their own code. What happens?',
      options: ['Each reads its own memory: the OS maps them to different real places', 'They read the same real location, so they see each other\'s data', 'The second process is blocked until the first one finishes', 'The kernel crashes, because two processes claimed one address'],
      answer: 0,
      why: [null, 'That would break isolation. Virtual memory exists to prevent exactly this.', 'There is no clash to wait for; the addresses are different places underneath.', 'Overlapping virtual addresses are completely normal.'],
      explain: 'Virtual addresses are private to each process. The OS keeps a map to real RAM, so "4000" means something different in every process.' },

    { type: 'tf', after: 5, statement: 'When a function returns, the local values in its stack frame are discarded automatically.', answer: true,
      explain: 'The stack is managed automatically: calling pushes a frame, returning pops it. Heap objects are different, because they can outlive the call.' },

    { type: 'bucket', prompt: 'Where does each of these typically live?', buckets: ['Stack', 'Heap'],
      items: [['The local counter `i` in a for loop', 0], ['A large array that is returned from a function', 1], ['The frame for a function call in progress', 0], ['An object stored in a cache for hours', 1], ['A function\'s parameters while it runs', 0], ['A user record loaded from the database', 1]],
      explain: 'Short-lived, call-sized values go on the stack. Anything that must outlive the call, or is large and variable in size, goes on the heap.' },

    { type: 'spot', prompt: 'This server slowly eats memory over days. Tap the line that causes it.',
      code: { lang: 'js', src: `
        const seen = [];

        app.get('/hit', (req, res) => {
          seen.push({ ip: req.ip, at: Date.now() });
          res.send('ok');
        });` },
      lines: [4],
      explain: 'Every request adds an object to `seen`, which lives at module level and is never trimmed. The garbage collector cannot free anything still referenced, so memory grows with traffic. Cap it, rotate it, or store it elsewhere.' },

    { type: 'order', prompt: 'Put what happens as a server runs out of memory in a likely order.', items: ['Memory use creeps up until RAM is nearly full', 'The OS starts moving chunks of memory to swap on disk', 'Everything slows down as the machine thrashes', 'The OOM killer picks a large process and ends it', 'The service is gone until someone restarts it'],
      explain: 'Swap buys time at a heavy speed cost. If memory is still exhausted, the kernel sacrifices a process to keep the machine alive.' },

    { type: 'short', q: 'What error do you get when a function with no stopping condition calls itself until the stack is full? (two words)', accept: ['stack overflow', 'stackoverflow'], hint: 'It is also the name of a famous Q&A site.',
      explain: 'Each call needs a frame on the small fixed stack. Endless recursion fills it, causing a **stack overflow**.' },

    { type: 'scenario', title: 'The vanishing API', intro: 'Your API process disappears every few days. The logs show no crash. Your manager wants it fixed by Friday.',
      meters: { 'uptime': 50, 'team patience': 70 },
      steps: [
        { text: 'There is no error in your own logs. What do you check first?',
          choices: [
            { label: 'The system log for an out-of-memory kill, and the process\'s memory trend', score: 2, effects: { uptime: 10, 'team patience': 10 }, feedback: 'A silent disappearance is the OOM killer\'s signature. A graph of memory over time that climbs steadily would confirm a leak.' },
            { label: 'Rewrite the API in a language with no garbage collector', score: 0, effects: { 'team patience': -30 }, feedback: 'A rewrite is days of work for a guess, and manual memory management can leak too.' },
            { label: 'Add more swap and hope', score: 1, effects: { uptime: 5, 'team patience': -10 }, feedback: 'Swap delays the kill but makes the server crawl while it thrashes. The leak is still there.' }
          ] },
        { text: 'Memory climbs steadily with traffic. You find a cache object that is never trimmed. What is the proper fix?',
          choices: [
            { label: 'Bound the cache with a maximum size or expiry, then watch memory again', score: 2, effects: { uptime: 35, 'team patience': 15 }, feedback: 'Bounded growth means a plateau, not a climb. Check the graph to confirm the fix actually worked.' },
            { label: 'Restart the process on a timer every night', score: 1, effects: { uptime: 15, 'team patience': -5 }, feedback: 'A fine temporary bandage, but requests in flight die at each restart and the leak stays.' },
            { label: 'Call garbage collection manually more often', score: 0, effects: { 'team patience': -15 }, feedback: 'The collector can only free what is unreferenced, and the cache still references everything.' }
          ] }
      ],
      outro: '**Silent death plus a rising memory graph** means a leak. Bound whatever grows.' },

    { type: 'explain', prompt: 'Explain the difference between the stack and the heap, and how a program can leak memory even in a language with garbage collection.',
      model: 'The stack holds function calls and their local values, and is cleaned up automatically as functions return. The heap holds larger or longer-lived objects and needs a garbage collector (or manual freeing). A garbage collector only frees objects nothing refers to, so if code keeps references, such as a cache or list that only grows, that memory is never freed and the process leaks.',
      keywords: ['stack', 'heap', 'automatic', 'garbage collector', 'reference', 'cache', 'leak'] }
  ],

  flashcards: [
    { q: 'What is virtual memory?', a: 'A private map of addresses per process that the OS translates to real RAM, giving isolation and letting it move chunks out to disk.' },
    { q: 'Stack vs heap?', a: 'Stack: fast, automatic, call-sized values that die on return. Heap: larger, longer-lived objects needing a garbage collector or manual freeing.' },
    { q: 'What causes a stack overflow?', a: 'Function calls nesting too deep, typically recursion with no stopping condition, so the fixed-size stack fills.' },
    { q: 'How can a garbage-collected program leak memory?', a: 'By keeping references to objects it no longer needs, such as an unbounded cache or growing list.' },
    { q: 'What is the OOM killer?', a: 'The Linux mechanism that kills a process when the machine runs out of memory, often leaving a log line but no error from the app.' }
  ],

  glossary: [
    { term: 'RAM', def: 'The computer\'s fast, temporary working memory. Its contents are lost when power is off.', like: 'A desk, as opposed to the filing cabinet that is the disk.' },
    { term: 'Virtual memory', def: 'A per-process private address space that the OS maps onto real RAM, and sometimes disk.', like: 'Hotel room numbers: every hotel has a room 101.' },
    { term: 'Stack', def: 'The memory area for function calls and local values, pushed on call and popped on return automatically.', like: 'A pile of plates: only the top one is in use.' },
    { term: 'Heap', def: 'The large memory area for objects that can outlive a function call. Something must free it.', like: 'A storeroom where things go wherever there is space.' },
    { term: 'Memory leak', def: 'Memory a program no longer needs but never releases, so usage grows over time.', like: 'A slow tap you forgot to turn off.' },
    { term: 'Garbage collection', def: 'Automatic freeing of heap objects that nothing refers to any more.', like: 'A cleaner who only bins things nobody owns.', aka: ['GC'] }
  ],

  takeaways: [
    '**Virtual memory** gives each process a private map of memory, enforced by the OS.',
    'The **stack** is automatic and call-sized; the **heap** holds longer-lived objects.',
    'A garbage collector cannot free what you still **reference**: unbounded caches leak.',
    'Out of RAM means swap (slow), then the **OOM killer** (process vanishes).'
  ]
});

KS.lesson('os-io', {
  eli5: 'Input and output (reading files, using the network) are the slowest things a computer does, so the OS and your code use handles, buffers and non-blocking tricks to avoid sitting idle while they finish.',

  cards: [
    { kind: 'concept', title: 'The processor spends its life waiting',
      body: `A modern processor can do billions of simple steps every second. Reading a file from disk, or a reply from another server, takes **enormously longer** than that by comparison.

        Scale it to human time: if one processor step took a **second**, fetching from RAM would take a couple of minutes, reading a solid-state disk would take on the order of a day, and a network round trip across the world would take months. (Rough figures, but the gap is real.)

        Anything that reads from or writes to the outside world is **I/O** (input/output). Backend programs are mostly I/O: they take a request, ask a database, read a file, call another service. So how you wait matters more than how fast you compute.` },

    { kind: 'metaphor', title: 'The kitchen supply chain',
      body: `Think of cooking:

        - Ingredients **in your hand**: instant (processor cache).
        - The **fridge** next to you: a few seconds (RAM).
        - The **supermarket** down the road: a trip (disk).
        - An **order from overseas**: weeks (a network call to a far-away server).

        A good cook does not stand at the door staring down the road waiting for the delivery. They start chopping something else. That instinct is the whole idea behind non-blocking I/O.` },

    { kind: 'compare', title: 'Blocking vs non-blocking',
      body: 'Two ways to wait for the same slow operation.',
      cols: ['Blocking', 'Non-blocking'],
      rows: [
        ['What happens', 'The call does not return until the data is ready', 'The call returns at once; you are told when data is ready'],
        ['The thread meanwhile', 'Sleeps, doing nothing useful', 'Free to do other work'],
        ['Code style', 'Simple, reads top to bottom', 'Callbacks, promises or async/await'],
        ['Scaling idea', 'One thread per waiting task', 'One thread juggles many waiting tasks']
      ],
      note: 'Neither is "right". Blocking with threads is perfectly fine at modest scale; non-blocking pays off with thousands of mostly-idle connections.' },

    { kind: 'code', title: 'The same read, two ways',
      body: 'In Node.js both exist. Tap the highlighted lines.',
      code: { lang: 'js', src: `
        const fs = require('fs');

        // Blocking: the whole program waits here
        const a = fs.readFileSync('big.log', 'utf8');
        console.log('read it all');

        // Non-blocking: carry on, be told later
        fs.readFile('big.log', 'utf8', (err, b) => {
          console.log('finished reading');
        });
        console.log('already moved on');`,
        notes: {
          4: 'Nothing else in this process can run until the disk has delivered the whole file. In a server, every other request waits too.',
          8: 'The callback is only **scheduled**. The runtime asks the OS to read the file and goes back to the event loop.',
          11: 'This prints **before** "finished reading": the call returned immediately, and the callback runs later when the data has arrived.'
        } } },

    { kind: 'concept', title: 'File descriptors: numbered handles',
      body: `When a program opens a file, the kernel does not hand over the file. It hands back a small whole number, a **file descriptor** (**fd**): a ticket that means "your open file number 5". Every later read or write quotes that number.

        Three are pre-opened for every process:

        - **0** standard input (stdin)
        - **1** standard output (stdout), where \`console.log\` goes
        - **2** standard error (stderr), for error messages

        The big insight on Unix-like systems: network connections are also reached through descriptors. A web server with 10,000 clients connected is holding roughly 10,000 of them.` },

    { kind: 'code', title: 'There is a limit',
      body: 'Each process may only hold so many descriptors. You can check it in the terminal.',
      code: { lang: 'sh', src: `
        $ ulimit -n
        1024`,
        notes: {
          1: '`ulimit` shows or sets per-process limits. `-n` asks for the maximum number of **open files** (descriptors).',
          2: 'A common default is 1024, though it varies by system. A busy server with thousands of connections must raise it, or it will start failing with "Too many open files".'
        } },
      note: 'Forgetting to close files or connections leaks descriptors, just as forgetting to free memory leaks RAM.' },

    { kind: 'concept', title: 'Buffering: carry things in bulk',
      body: `Every trip to the disk or network has a fixed cost, however small the cargo. Writing a million characters one at a time means a million trips.

        So the OS and your language collect data in a **buffer** (a holding area in memory) and send it in big chunks. Reads work the same way, fetching a block ahead of time.

        The catch: data in a buffer has not been delivered yet. If the process crashes before the buffer is **flushed**, the last few log lines can be lost. It is also why output sometimes arrives in bursts when it is piped somewhere rather than shown on a screen.

        Think of a bus: it waits to fill up, which is efficient for the company but not for the passenger in a hurry.` },

    { kind: 'compare', title: 'Processes talking to each other',
      body: 'Isolated processes sometimes need to cooperate. The OS offers several **inter-process communication** (IPC) channels.',
      cols: ['Like…', 'Good for'],
      rows: [
        ['Pipe', 'A tube between two cooks', 'Streaming one program\'s output into another\'s input'],
        ['Socket', 'A telephone call', 'Two-way talk, even across machines (this is what the network uses)'],
        ['Signal', 'A tap on the shoulder', 'A tiny message such as "please stop"; no data attached'],
        ['Shared memory', 'A whiteboard in a shared room', 'The fastest way to share lots of data, but needs locks']
      ],
      note: 'Shared memory brings back the race conditions from the concurrency lesson: processes using it need locks too.' },

    { kind: 'pitfall', title: 'Everything you open, you must close',
      body: `A handler that opens a file, a database connection or a socket and forgets to close it on **one** code path (say, when an error is thrown) leaks a descriptor every time that path runs.

        Nothing breaks at first. Then, hours later, the process reaches its limit and **every** new connection fails, including healthy ones. The symptom ("Too many open files") shows up far from the cause.

        The habits that prevent it: use language features that close automatically (\`with\` in Python, \`try/finally\`), and use **connection pools** that reuse a few connections rather than opening a new one each time.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'A Node.js server calls `fs.readFileSync` on a large file inside a request handler. What happens to other users\' requests during the read?',
      options: ['They wait, because the single thread is blocked until the read completes', 'They carry on normally, because the OS handles reading in the background', 'They are cancelled and must retry', 'They run faster, since the file is now cached'],
      answer: 0,
      why: [null, 'Only the non-blocking `readFile` hands the waiting to the OS and keeps the loop free.', 'Nothing is cancelled; they just sit in the queue.', 'Caching is unrelated to the thread being blocked.'],
      explain: 'A blocking call keeps the only JavaScript thread busy waiting, so the event loop cannot serve anyone else. The non-blocking version avoids that.' },

    { type: 'tf', after: 4, statement: 'A file descriptor is the file itself, copied into your program.', answer: false,
      explain: 'It is only a small number the kernel hands out as a **handle** for an open file or connection. The data stays with the kernel until you read it.' },

    { type: 'match', prompt: 'Match each IPC mechanism to what it is best at.',
      pairs: [['Pipe', 'Streaming output of one program into another'], ['Socket', 'Two-way conversation, even across a network'], ['Signal', 'A tiny nudge like "please stop"'], ['Shared memory', 'Fast sharing of large data, if guarded by locks']] },

    { type: 'order', prompt: 'Order these from fastest to slowest to reach.', items: ['Data already in the processor cache', 'Data in RAM', 'Data on a solid-state disk', 'A reply from a server on another continent'],
      explain: 'Each step out is much slower than the one before. That is why caches exist and why avoiding needless network round trips matters most.' },

    { type: 'cloze', text: 'Every process starts with three open descriptors: {{0}} is stdin, {{1}} is stdout, and {{2}} is {{stderr}}.',
      distractors: ['3', 'stdlog', 'stdfile'],
      explain: 'Standard input, output and error are numbers 0, 1 and 2. `console.log` writes to 1; error messages go to 2.' },

    { type: 'estimate', q: 'A chat server keeps one connection open for each of its 10,000 online users. Roughly how many file descriptors does it need, at minimum, just for those connections?', answer: 10000, unit: 'descriptors', tolerance: 2,
      explain: 'Each connection is a socket, and each socket uses a descriptor. 10,000 clients need at least 10,000, which is far above a common default limit of 1024.' },

    { type: 'scenario', title: 'Too many open files', intro: 'Your upload service has run fine for weeks. Today it starts rejecting every new request with "Too many open files", even though traffic is normal.',
      meters: { 'service health': 40, 'confidence': 60 },
      steps: [
        { text: 'What does the message most likely mean?',
          choices: [
            { label: 'The process has used up its allowance of file descriptors', score: 2, effects: { confidence: 10 }, feedback: 'Right. Sockets and files both use descriptors, and each process has a limit.' },
            { label: 'The disk is full', score: 0, effects: { confidence: -10 }, feedback: 'A full disk reports "No space left on device". This message is about open handles, not storage.' },
            { label: 'The CPU is too busy to accept connections', score: 0, effects: { confidence: -10 }, feedback: 'A busy CPU makes things slow, not this specific error.' }
          ] },
        { text: 'You inspect the code and find that the upload handler opens a temporary file but only closes it if the upload succeeds. What is the right fix?',
          choices: [
            { label: 'Close the file on every path, using try/finally or an auto-closing construct, then consider the limit', score: 2, effects: { 'service health': 45, confidence: 20 }, feedback: 'Every failed upload leaked one descriptor. Closing on all paths fixes the cause; raising the limit afterwards is only a safety margin.' },
            { label: 'Only raise the descriptor limit to a very large number', score: 1, effects: { 'service health': 15, confidence: -5 }, feedback: 'It buys time, but the leak continues and will reach any limit eventually.' },
            { label: 'Restart the service every hour', score: 0, effects: { 'service health': 5, confidence: -15 }, feedback: 'Restarts hide the symptom and drop in-flight uploads each time.' }
          ] }
      ],
      outro: 'Handles are a finite resource. **Release what you acquire on every path**, including the error paths.' },

    { type: 'explain', prompt: 'Explain why backend programs care so much about blocking vs non-blocking I/O.',
      model: 'Backend programs spend most of their time waiting for slow I/O like databases, disks and other services. With blocking I/O the thread just sleeps, doing nothing useful, so you need many threads to cope. With non-blocking I/O the thread starts the operation and does other work until it is notified, so one thread can serve many waiting requests.',
      keywords: ['waiting', 'slow', 'blocking', 'non-blocking', 'thread', 'many requests'] }
  ],

  flashcards: [
    { q: 'Why is I/O the thing backend developers worry about?', a: 'Disk and network are vastly slower than the processor, and servers spend most of their time waiting on them.' },
    { q: 'Blocking vs non-blocking I/O?', a: 'Blocking: the call waits until the data is ready. Non-blocking: it returns immediately and you are told when it is done, so the thread can do other work.' },
    { q: 'What is a file descriptor?', a: 'A small number the kernel gives you as a handle for an open file or connection. 0, 1 and 2 are stdin, stdout and stderr.' },
    { q: 'Why does buffering exist, and what is the catch?', a: 'Batching data is far cheaper than many tiny reads and writes. But buffered data is not delivered until flushed, so a crash can lose it.' },
    { q: 'Name four IPC mechanisms.', a: 'Pipes, sockets, signals and shared memory.' }
  ],

  glossary: [
    { term: 'I/O', def: 'Input/output: any reading from or writing to something outside the processor and memory, such as disk or network.', like: 'Going out for supplies, as opposed to cooking with what is on the counter.' },
    { term: 'Blocking I/O', def: 'An operation that makes the caller wait until it finishes.', like: 'Standing at the oven door until the bread is done.' },
    { term: 'Non-blocking I/O', def: 'An operation that returns immediately and notifies you later, so the caller can do other work.', like: 'Setting a timer and getting on with the washing-up.' },
    { term: 'File descriptor', def: 'A small number the kernel uses as a handle for an open file, socket or pipe.', like: 'A cloakroom ticket.', aka: ['fd'] },
    { term: 'Buffer', def: 'A holding area in memory where data is collected so it can be sent or read in bigger chunks.', like: 'A bus waiting to fill up before leaving.' },
    { term: 'IPC', def: 'Inter-process communication: the OS channels (pipes, sockets, signals, shared memory) that let isolated processes cooperate.', aka: ['inter-process communication'] }
  ],

  takeaways: [
    'I/O is **vastly slower** than computing, and servers are mostly I/O.',
    '**Non-blocking** I/O lets one thread serve many waiting requests; blocking calls stall it.',
    'A **file descriptor** is a numbered handle; sockets count too, and there is a limit.',
    '**Buffer** for speed, **close** what you open, and pick the right IPC channel.'
  ]
});

KS.lesson('os-linux-terminal', {
  eli5: 'Almost every server runs Linux, and you talk to it by typing short commands into a text window. A handful of commands plus pipes will get you surprisingly far.',

  cards: [
    { kind: 'concept', title: 'The black window with no buttons',
      body: `Your app is deployed. Something is wrong. You connect to the server and... there is no desktop, no mouse, no icons. Just a blinking cursor.

        That is normal. Most servers run **Linux** and are driven through a **terminal**: a text window where you type commands. A program called the **shell** reads each line you type, works out what you mean and runs it.

        Why Linux? It is free, stable, light (no graphics needed), easy to automate, and it is what most cloud servers and containers run. Learn the basics once and they work on nearly any server you will ever meet.` },

    { kind: 'metaphor', title: 'Ordering by exact phrase',
      body: `A graphical interface is like a restaurant with a picture menu: point at what you want.

        The terminal is like phoning in your order. You must say it in the right words, but in exchange you can order **a hundred identical meals in one sentence**, repeat yesterday's order exactly, or write the order on a card and hand it to someone else to run every night.

        That repeatability is why servers use text. Anything you can type, you can **script**, and anything you can script, a machine can do at 3 a.m. without you.

        The shell is a very literal waiter: it does exactly what you said, even if what you said was a mistake.` },

    { kind: 'diagram', title: 'The filesystem is one tree',
      body: 'Windows has drives like `C:`. Linux has a **single tree** that starts at `/` (the root). Everything, including other disks, hangs off it.',
      nodes: [
        { id: 'root', label: '/ (root)', icon: '🌳', x: 1, y: 0, tone: 'accent' },
        { id: 'home', label: '/home', x: 0, y: 1 },
        { id: 'etc', label: '/etc', x: 1, y: 1 },
        { id: 'var', label: '/var', x: 2, y: 1 },
        { id: 'sam', label: '/home/sam', x: 0, y: 2, tone: 'good' },
        { id: 'conf', label: 'config files', x: 1, y: 2, tone: 'info' },
        { id: 'log', label: '/var/log', x: 2, y: 2, tone: 'warn' }
      ],
      edges: [
        { from: 'root', to: 'home' }, { from: 'root', to: 'etc' }, { from: 'root', to: 'var' },
        { from: 'home', to: 'sam' }, { from: 'etc', to: 'conf' }, { from: 'var', to: 'log' }
      ],
      caption: 'Your files live under /home, settings under /etc, and logs usually under /var/log.' },

    { kind: 'code', title: 'Finding your way around',
      body: 'Four commands do most navigation. The `$` is the prompt; you type what follows it. **Tap the lines.**',
      code: { lang: 'sh', src: `
        $ pwd
        /home/sam
        $ ls
        app  notes.txt
        $ cd app
        $ cat README.md
        # My app
        $ cd ..`,
        notes: {
          1: '`pwd` = **p**rint **w**orking **d**irectory: "where am I?"',
          3: '`ls` lists what is here. `ls -l` adds sizes, owners and permissions (see below).',
          5: '`cd app` moves **into** the folder called `app`.',
          6: '`cat` prints a whole file. For a long one use `less file`, which lets you scroll and press `q` to quit.',
          8: '`..` means "the folder above". So `cd ..` takes you back up.'
        } } },

    { kind: 'concept', title: 'Permissions: who may do what',
      body: `Every file has an **owner**, a **group** and three sets of permissions, each made of up to three letters:

        - **r** read, **w** write, **x** execute (run it, or enter it if it is a folder)
        - for three audiences, in this order: the **user** (owner), the **group**, and **other** (everyone else)

        \`-rwxr-xr--\` reads as: a file (\`-\`); owner can read, write, run; group can read and run; everyone else can only read.

        Programs run *as* a user, so they inherit that user's permissions. Your web server should run as a low-privilege user, so a hacked app can touch as little as possible.

        Numbers are shorthand: r=4, w=2, x=1, added up per audience. \`755\` means \`rwxr-xr-x\`.` },

    { kind: 'code', title: 'chmod, chown and sudo',
      body: 'A script that will not run is almost always a missing `x`.',
      code: { lang: 'sh', src: `
        $ ./deploy.sh
        bash: ./deploy.sh: Permission denied
        $ chmod +x deploy.sh
        $ ./deploy.sh
        Deploying...
        $ sudo chown www-data:www-data /var/www/site`,
        notes: {
          2: 'No execute permission, so the kernel refuses to run it.',
          3: '`chmod` **ch**anges the **mod**e (permissions). `+x` adds execute for everyone allowed to use it.',
          6: '`sudo` runs one command as the all-powerful **root** user, after checking you are allowed. `chown` changes the owner (and group, after the colon). Changing ownership needs root.'
        } },
      note: 'Root can do anything, including break everything. Use sudo for the one command that needs it, not for a whole session.' },

    { kind: 'code', title: 'Search, stream and chain',
      body: 'The real power: commands do one small job each, and the **pipe** (`|`) feeds one command\'s output into the next.',
      code: { lang: 'sh', src: `
        $ grep ERROR app.log
        ERROR db timeout
        ERROR db timeout
        $ grep ERROR app.log | wc -l
        2
        $ grep ERROR app.log > errors.txt
        $ tail -f app.log`,
        notes: {
          1: '`grep` prints only the lines containing a word. Add `-i` to ignore case.',
          4: '`|` sends grep\'s output into `wc -l`, which **c**ounts **l**ines. Two small tools made a new one.',
          6: '`>` **redirects** output into a file instead of the screen (and overwrites it). `>>` appends instead.',
          7: '`tail -f` shows the end of a file and **follows** it live as new lines arrive. Press Ctrl+C to stop. Essential for watching a server\'s log.'
        } } },

    { kind: 'code', title: 'Environment variables',
      body: 'Settings such as ports and database passwords are passed to programs through **environment variables**: named values every process inherits.',
      code: { lang: 'sh', src: `
        $ export PORT=8080
        $ echo $PORT
        8080
        $ PORT=9000 node server.js
        $ env`,
        notes: {
          1: '`export` sets a variable for this shell and for every program it starts. In Node you read it as `process.env.PORT`.',
          2: '`$PORT` means "the value of PORT". The shell swaps it in before running.',
          4: 'Putting `NAME=value` before a command sets it for **that command only**.',
          5: '`env` lists every variable. It is handy for checking what your program will really see.'
        } },
      note: 'Keep secrets in the environment (or a secrets tool), not in your code or Git history.' },

    { kind: 'pitfall', title: 'The terminal does not ask twice',
      body: `The shell assumes you meant it. There is no recycle bin and no "are you sure?" for most commands.

        - Deleting is final. Before you run a delete on a pattern, run \`ls\` with the same pattern first to see what it would hit.
        - \`sudo\` removes the safety rails. A typo plus sudo can damage the system.
        - Never paste a command from the internet that you cannot explain, especially one with \`sudo\` or \`curl … | sh\`.
        - \`chmod 777\` ("everyone can do everything") is the classic lazy fix for a permission error. It makes the problem disappear and opens a hole.

        Helpers: **Tab** completes names, the **Up arrow** recalls commands, and \`command --help\` or \`man command\` explains the options.` }
  ],

  activities: [
    { type: 'mcq', after: 4, q: 'A file shows `-rw-r-----` in `ls -l`. Who can do what?',
      options: ['Owner reads and writes, group reads, others get nothing', 'Everyone can read it, and only the owner can write to it', 'The owner can run it, and everyone else can read it', 'Only the group can read it; the owner has no access at all'],
      answer: 0,
      why: [null, 'That would be `rw-r--r--`. Here the last three characters are all dashes.', 'There is no x anywhere, so nobody can run it.', 'The first set belongs to the owner, and it has rw.'],
      explain: 'Read the string as: type, then owner (rw-), group (r--), other (---). The final three dashes mean everyone outside the owner and group gets nothing.' },

    { type: 'tf', after: 7, statement: 'Writing `PORT=9000 node server.js` sets PORT for that one command only, not for the rest of your shell session.', answer: true,
      explain: 'A `NAME=value` prefix applies only to that command. `export NAME=value` sets it for the whole shell session and everything it launches.' },

    { type: 'match', prompt: 'Match each command to what it does.',
      pairs: [['pwd', 'Show the folder you are in'], ['cat file', 'Print the whole file to the screen'], ['tail -f app.log', 'Follow a log file live'], ['chmod +x run.sh', 'Make a script executable'], ['sudo', 'Run one command with root privileges'], ['grep ERROR log', 'Show only lines containing a word']] },

    { type: 'cloze', text: 'To count the lines that contain ERROR: `grep ERROR app.log {{|}} wc -l`. To save those lines to a file: `grep ERROR app.log {{>}} errors.txt`. To add to a file without overwriting it, use {{>>}}.',
      distractors: ['<', '&&', ';'], code: true,
      explain: 'The pipe `|` connects one command\'s output to the next one\'s input. `>` redirects to a file and replaces it; `>>` appends.' },

    { type: 'short', q: 'Which command prints the folder you are currently in?', accept: ['pwd'], hint: 'Print working directory.',
      explain: '`pwd` is the quickest way to answer "where am I?" before you run anything that deletes or moves files.' },

    { type: 'spot', prompt: 'A teammate fixes "Permission denied" while uploading to a web folder. Tap the line that opens a security hole.',
      code: { lang: 'sh', src: `
        $ cd /var/www/site
        $ ls -l uploads
        drwxr-xr-x 2 root root 4096 Nov 12 uploads
        $ sudo chmod -R 777 /var/www/site
        $ ./restart.sh` },
      lines: [4],
      explain: '`777` lets any user on the machine read, change and run everything in the site. The real fix is to give the web server\'s user ownership of just the uploads folder (for example with `chown`), so only it can write there.' },

    { type: 'ab', q: 'A new `deploy.sh` says "Permission denied". Which is the better fix?',
      a: { lang: 'sh', label: 'Fix one', src: `
        $ sudo chmod 777 deploy.sh` },
      b: { lang: 'sh', label: 'Fix two', src: `
        $ chmod +x deploy.sh` },
      answer: 'b',
      explain: 'The file only lacks execute permission, so add exactly that. Making it writable by everyone means any user could edit a script that your server runs, and `sudo` was never needed for your own file.' },

    { type: 'scenario', title: 'Debugging live over SSH', intro: 'The site is returning errors. You are logged in to the Linux server through the terminal. The logs are in `/var/log/myapp/app.log`.',
      meters: { 'customer impact': 70, 'risk': 10 },
      steps: [
        { text: 'First move: you want to see what is going wrong right now. Which command?',
          choices: [
            { label: '`tail -f /var/log/myapp/app.log`, watching new lines arrive', score: 2, effects: { 'customer impact': -5 }, feedback: 'Following the live log shows errors as they happen, and it changes nothing.' },
            { label: '`cat /var/log/myapp/app.log` on a log that is several gigabytes', score: 1, effects: { 'customer impact': -5 }, feedback: 'It will scroll for ages and bury the part you want. `tail` or `less` would serve better.' },
            { label: '`sudo rm /var/log/myapp/app.log` to start with a clean log', score: 0, effects: { risk: 50, 'customer impact': 10 }, feedback: 'You just deleted your evidence while the problem is still happening.' }
          ] },
        { text: 'You see many lines containing "ERROR". You want to know how many happened in the log so far. What do you type?',
          choices: [
            { label: '`grep ERROR /var/log/myapp/app.log | wc -l`', score: 2, effects: { 'customer impact': -10 }, feedback: 'grep keeps the matching lines and `wc -l` counts them: two small tools, one answer.' },
            { label: 'Scroll through the log and count by eye', score: 0, effects: { 'customer impact': 10 }, feedback: 'Slow and error-prone while customers wait.' },
            { label: '`ls -l /var/log/myapp`', score: 0, effects: {}, feedback: 'That lists files and sizes, not how many lines contain a word.' }
          ] }
      ],
      outro: 'Look without touching first (`tail`, `grep`, `ls`), then change things deliberately.' },

    { type: 'explain', prompt: 'Explain to a colleague what the pipe `|` does and why it makes the terminal powerful. Give a short example.',
      model: 'A pipe sends the output of one command into the input of the next, so you can chain small tools that each do one job. For example `grep ERROR app.log | wc -l` finds the error lines and then counts them. Because each tool is simple and they combine freely, you can answer very specific questions without writing a program.',
      keywords: ['output', 'input', 'chain', 'grep', 'small tools', 'combine'] }
  ],

  flashcards: [
    { q: 'Why do most servers run Linux?', a: 'It is free, stable, lightweight (no GUI needed), easy to automate and well supported by cloud providers.' },
    { q: 'What does `-rwxr-xr--` mean?', a: 'A file. Owner can read, write and execute; the group can read and execute; everyone else can only read.' },
    { q: 'What do `chmod`, `chown` and `sudo` do?', a: 'chmod changes permissions, chown changes the owner, sudo runs one command as root.' },
    { q: 'Pipe vs redirect?', a: '`|` feeds one command\'s output into another command. `>` writes output to a file (replacing it); `>>` appends.' },
    { q: 'How does a program normally get its config, like a port?', a: 'Through environment variables, such as `export PORT=8080`, which it reads at start-up (in Node, `process.env.PORT`).' }
  ],

  glossary: [
    { term: 'Terminal', def: 'A text window where you type commands and read the output.', like: 'Phoning in an order instead of pointing at a menu.' },
    { term: 'Shell', def: 'The program inside the terminal that reads your commands and runs them. Bash is a common one.', aka: ['bash'] },
    { term: 'Filesystem tree', def: 'Linux\'s single hierarchy of folders starting at `/` (root), with everything attached beneath it.', like: 'One family tree with every file as a descendant.' },
    { term: 'Permissions', def: 'Read, write and execute rights, set separately for a file\'s owner, its group and everyone else.', like: 'Three keys on a ring: owner, group, public.' },
    { term: 'Root', def: 'The all-powerful administrator user. `sudo` lets you act as root for one command.', like: 'The master key.', aka: ['superuser'] },
    { term: 'Environment variable', def: 'A named value (like PORT) that a process inherits from the shell that started it.', like: 'A note pinned to a person before they start work.', aka: ['env var'] }
  ],

  takeaways: [
    'Servers run **Linux**, driven by a **shell** in a terminal, because text can be scripted.',
    'One tree from `/`: files in `/home`, config in `/etc`, logs in `/var/log`.',
    '**rwx** for user, group, other. Fix with `chmod`/`chown`, never lazily with `777`.',
    '**Pipes** chain small tools; **environment variables** configure programs.'
  ]
});

KS.lesson('os-running-services', {
  eli5: 'To keep a program running when nobody is watching, you hand it to a service manager that starts it at boot, restarts it if it dies and keeps its logs, and you learn the commands to inspect and stop it.',

  cards: [
    { kind: 'story', title: 'The site that died when you closed your laptop',
      body: `You log in to your server over the network, type \`node server.js\`, see "Listening on 3000" and the site works. Delighted, you close your laptop.

        The site dies. Your program was a child of your terminal session; when the session ended, so did it.

        And what if it crashes at 4 a.m.? Or the server reboots for an update? Nobody is there to type the command again.

        Running something on your own machine and **keeping it alive on a server** are different jobs. This lesson covers the tools for the second: looking at processes, stopping them politely, running them as managed services and watching their logs.` },

    { kind: 'code', title: 'Seeing what is running: ps and top',
      body: '`ps` takes a snapshot of processes. `top` is a live dashboard. **Tap the lines.**',
      code: { lang: 'sh', src: `
        $ ps aux | grep server.js
        sam  4021  1.2  3.4  912340 70124 ? Sl 09:30 0:05 node server.js
        $ top
        %Cpu(s):  3.0 us,  1.0 sy, 95.0 id
        MiB Mem :   3900.0 total,   210.0 free
          PID USER   %CPU %MEM COMMAND
         4021 sam     1.2  3.4 node`,
        notes: {
          1: '`ps aux` lists every process, and `grep` narrows it to yours.',
          2: 'The second column, **4021**, is the PID. The next two are CPU and memory percentages, and the last is the command.',
          3: '`top` refreshes every few seconds and sorts by busiest. Press `q` to leave. `htop` is a friendlier lookalike if installed.',
          4: 'Overall CPU: `id` is **idle**. 95 idle means the machine is relaxed.',
          5: 'Free memory is a number to watch. Low free memory plus high swap use is the warning from the memory lesson.'
        } } },

    { kind: 'compare', title: 'SIGTERM vs SIGKILL',
      body: `To stop a process you send it a **signal**. The two you need:`,
      cols: ['SIGTERM (15)', 'SIGKILL (9)'],
      rows: [
        ['Command', '`kill 4021` (the default)', '`kill -9 4021`'],
        ['Tone', 'A polite request to stop', 'Instant removal by the kernel'],
        ['Can the program catch it?', 'Yes: it can clean up first', 'No, it cannot be caught or ignored'],
        ['Cleanup', 'Finish requests, close files, flush buffers', 'None: buffers lost, locks and temp files left behind'],
        ['Use it', 'First, always', 'Last resort, when the process is stuck']
      ],
      note: 'Like asking someone to leave versus switching off the power at the wall.' },

    { kind: 'code', title: 'Handling SIGTERM yourself',
      body: 'Because SIGTERM can be caught, a well-built server uses it to shut down tidily.',
      code: { lang: 'js', src: `
        process.on('SIGTERM', () => {
          console.log('shutting down...');
          server.close(() => {
            db.end();
            process.exit(0);
          });
        });`,
        notes: {
          1: 'Registers a handler: "when the OS asks me to terminate, run this instead of dying immediately".',
          3: '`server.close` stops accepting new connections but lets in-flight requests finish.',
          4: 'Release the database connection, so nothing is left half-written.',
          5: 'Exit with code **0**: success. Non-zero means something went wrong (next cards).'
        } } },

    { kind: 'metaphor', title: 'Daemons, and the hotel night manager called systemd',
      body: `A **daemon** (or **service**) is a program that runs in the background with no terminal attached: your web server, your database, the clock-sync tool.

        On most modern Linux distributions the manager for them is **systemd**, the first process the kernel starts. It launches services at boot, restarts them if they fail and collects their output.

        Think of it as a night manager at a hotel. Staff are started at the right time, one who faints is replaced, and nobody needs the owner to be awake.

        You describe each service in a small text file called a **unit file**, and then talk to systemd with the command \`systemctl\`.` },

    { kind: 'code', title: 'A unit file for your API',
      body: 'This tells systemd how to run your app. It usually lives in `/etc/systemd/system/`.',
      code: { lang: 'text', src: `
        [Unit]
        Description=My API
        After=network.target

        [Service]
        User=sam
        WorkingDirectory=/home/sam/app
        ExecStart=/usr/bin/node server.js
        Restart=on-failure
        Environment=PORT=8080

        [Install]
        WantedBy=multi-user.target`,
        notes: {
          3: 'Start only **after** the network is up.',
          6: 'Run as a normal user, not root: a compromised app then has few rights.',
          8: 'The command to run, with its full path. A service has no shell around it, so be explicit.',
          9: 'If the process **crashes** (non-zero exit), start it again. This is what saves you at 4 a.m.',
          10: 'Environment variables for this service.',
          13: 'Start it automatically at normal boot.'
        } } },

    { kind: 'code', title: 'Driving it: systemctl and journalctl',
      body: 'Four verbs cover most days, and `journalctl` reads the logs systemd collected.',
      code: { lang: 'sh', src: `
        $ sudo systemctl start myapi
        $ sudo systemctl enable myapi
        $ systemctl status myapi
        ● myapi.service - My API
             Active: active (running) since Thu 2026-11-12 09:30:11 UTC
           Main PID: 4021 (node)
        $ journalctl -u myapi -n 2
        Nov 12 11:02:01 web1 node[4021]: GET /health 200
        Nov 12 11:02:09 web1 node[4021]: GET /orders 200`,
        notes: {
          1: '`start` runs it now. `stop` and `restart` do what they say.',
          2: '`enable` makes it start **at boot**. Starting and enabling are separate, and forgetting `enable` is a classic way to lose a service after a reboot.',
          3: '`status` shows whether it is alive, its PID and its last log lines.',
          7: '`journalctl -u myapi` shows that service\'s logs. `-n 2` is the last two lines; `-f` follows live, like `tail -f`.'
        } } },

    { kind: 'concept', title: 'Exit codes: how a program says how it went',
      body: `Every process ends with a number, its **exit code**. **0 means success.** Anything else means some kind of failure, and the number can say which.

        This is how scripts and systemd decide what to do next. In a shell, \`$?\` holds the exit code of the last command, and \`&&\` runs the next command only if the first returned 0.

        \`\`\`sh
        $ grep -q PANIC app.log
        $ echo $?
        1
        \`\`\`

        Here \`grep -q\` found no match, so it exits with 1. Match found would give 0. Notice that "failure" does not always mean "something is broken", just "the answer is no".`,
      note: 'Logs say what happened; exit codes say how it ended. Use both when something fails overnight.' },

    { kind: 'code', title: 'Cron: run it on a schedule',
      body: '**cron** runs commands at set times, such as a nightly backup. You edit your list with `crontab -e`.',
      code: { lang: 'sh', src: `
        $ crontab -l
        # minute hour day-of-month month day-of-week  command
        30 2 * * *  /home/sam/backup.sh >> /home/sam/backup.log 2>&1
        0 * * * *   /home/sam/cleanup.sh`,
        notes: {
          2: 'Five time fields, then the command. A `*` means "every".',
          3: 'Minute 30, hour 2, every day, month and weekday: **02:30 every night**. The `>> … 2>&1` part appends both normal output and errors to a log, otherwise you never see failures.',
          4: 'Minute 0 of every hour: on the hour, every hour.'
        } },
      note: 'Cron jobs start with a very bare environment (a short PATH, few variables), so use full paths. A script that works when you type it can fail under cron.' },

    { kind: 'realworld', title: 'SSH: the door to the server',
      body: `**SSH** (Secure Shell) is how you get a terminal on a remote machine, with everything encrypted. It talks over port 22 by default.

        \`\`\`sh
        $ ssh sam@203.0.113.10
        \`\`\`

        That means "log in as user \`sam\` on that address". Most teams use **SSH keys** instead of passwords: you keep a private key on your laptop and put the matching public key on the server. The server checks that you hold the private half, and the key itself never travels.

        Once in, you are in the world of this module: \`ps\`, \`top\`, \`systemctl\`, \`journalctl\`, \`tail -f\`. (The address above is a documentation example, not a real server.)` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'A server is stuck and ignoring `kill 4021`. What is the sensible order of action?',
      options: ['Give SIGTERM time to work, then use `kill -9` if the process is truly stuck', 'Start with `kill -9` every time, since it is more reliable', 'Reboot the server straight away', 'Delete the program file from disk'],
      answer: 0,
      why: [null, 'It works, but skips cleanup and can lose buffered data or leave locks behind.', 'It would also kill every other service on the machine.', 'Deleting the file does not stop the running process.'],
      explain: 'SIGTERM lets the program shut down cleanly. SIGKILL cannot be caught, which makes it certain but rough, so keep it for a process that will not respond.' },

    { type: 'tf', after: 5, statement: 'Running `systemctl start myapi` is enough to guarantee the service also starts after the server reboots.', answer: false,
      explain: '`start` only runs it now. `enable` is what tells systemd to start it at boot.' },

    { type: 'match', prompt: 'Match each tool to its job.',
      pairs: [['ps aux', 'Snapshot of running processes'], ['top', 'Live view of CPU and memory use'], ['systemctl status myapi', 'Is the service alive, and since when?'], ['journalctl -u myapi', 'Read the service\'s logs'], ['crontab -e', 'Edit your scheduled jobs'], ['ssh user@host', 'Open a remote terminal securely']] },

    { type: 'order', prompt: 'Put the steps of a graceful shutdown in order.', items: ['Something sends the process SIGTERM', 'The handler stops accepting new connections', 'In-flight requests finish', 'Database connections are closed', 'The process exits with code 0'],
      explain: 'Stop taking new work, finish what is in flight, release resources, then exit with 0. That sequence avoids dropped requests and half-written data.' },

    { type: 'cloze', text: 'A cron line `30 2 * * *` runs at minute {{30}} of hour {{2}}, every day. An exit code of {{0}} means success, and a non-zero code means {{failure}}.',
      distractors: ['12', '1', 'success'],
      explain: 'The first two fields are minute and hour. By convention 0 is success and anything else is a failure of some kind.' },

    { type: 'short', q: 'What exit code means a program finished successfully?', accept: ['0', 'zero'], hint: 'It is the opposite of what many people expect.',
      explain: '**0** means success. Anything non-zero signals a failure, which is why `Restart=on-failure` can tell when to restart.' },

    { type: 'spot', prompt: 'This restart script has a flaw that can lose data. Tap the line.',
      code: { lang: 'sh', src: `
        #!/bin/sh
        cd /home/sam/app
        git pull
        kill -9 $(pgrep -f server.js)
        node server.js &` },
      lines: [4],
      explain: '`kill -9` is SIGKILL: the app gets no chance to finish requests or flush buffers. Use a plain `kill` (SIGTERM) first and let it shut down cleanly, or better, `systemctl restart`.' },

    { type: 'scenario', title: 'The service that keeps dying', intro: 'Your API runs under systemd. Customers report it was down for a minute at night, twice this week. Nobody was on call.',
      meters: { 'uptime': 60, 'evidence': 30 },
      steps: [
        { text: 'Where do you start looking?',
          choices: [
            { label: '`systemctl status myapi` and `journalctl -u myapi` around the time it went down', score: 2, effects: { evidence: 40 }, feedback: 'The journal holds the app\'s last words, and status shows restart history and exit status. Evidence first.' },
            { label: 'Increase the server size and see if it goes away', score: 0, effects: { uptime: -5, evidence: -5 }, feedback: 'Spending money before knowing the cause. It might not even be resource-related.' },
            { label: 'Delete the unit file and run the app by hand in a terminal', score: 0, effects: { uptime: -25 }, feedback: 'You have removed the automatic restart, and the app now dies when your session ends.' }
          ] },
        { text: 'The log shows the process was killed at 03:02 with no error from your code, and memory was nearly full. What is the likely story, and the fix?',
          choices: [
            { label: 'The kernel\'s OOM killer ended it; find and fix the memory growth (and keep `Restart=on-failure`)', score: 2, effects: { uptime: 30, evidence: 20 }, feedback: 'A silent kill with low memory fits the OOM killer. Restart covered the gap, but the leak is the root cause.' },
            { label: 'A bug in systemd; switch to cron', score: 0, effects: { uptime: -15 }, feedback: 'Cron does not supervise long-running programs at all.' },
            { label: 'Ignore it, since it restarted by itself', score: 1, effects: { uptime: 5 }, feedback: 'The restart hides the problem, but it will come back and may drop requests each time.' }
          ] }
      ],
      outro: 'Supervise with systemd, then **read the logs**. Auto-restart buys you time, not a fix.' },

    { type: 'explain', prompt: 'Explain the difference between SIGTERM and SIGKILL and why you should usually try SIGTERM first.',
      model: 'SIGTERM asks a process to stop and can be caught, so the program can finish requests, close files and flush buffers before exiting. SIGKILL cannot be caught or ignored: the kernel removes the process instantly, with no cleanup, so data can be lost. So try SIGTERM first and use SIGKILL only for a process that is stuck.',
      keywords: ['SIGTERM', 'SIGKILL', 'catch', 'cleanup', 'last resort', 'polite'] }
  ],

  flashcards: [
    { q: 'ps vs top?', a: '`ps` prints a snapshot of processes; `top` is a live, refreshing view of CPU and memory use. Press q to quit top.' },
    { q: 'SIGTERM vs SIGKILL?', a: 'SIGTERM (kill PID) asks politely and can be handled for clean-up. SIGKILL (kill -9) cannot be caught and gives no clean-up, so it is a last resort.' },
    { q: 'What does systemd do for a service?', a: 'Starts it at boot (if enabled), restarts it when it fails and collects its logs, driven by a unit file and `systemctl`.' },
    { q: 'What is an exit code?', a: 'The number a process ends with. 0 is success, non-zero is failure; `$?` shows the last one in a shell.' },
    { q: 'What do the five fields in a cron line mean?', a: 'Minute, hour, day of month, month, day of week, followed by the command. `30 2 * * *` is 02:30 daily.' }
  ],

  glossary: [
    { term: 'Signal', def: 'A small message the OS sends to a process, such as a request to terminate.', like: 'A tap on the shoulder.' },
    { term: 'SIGTERM', def: 'The polite "please stop" signal. A program can catch it and shut down cleanly.', like: 'Asking someone to leave.' },
    { term: 'SIGKILL', def: 'The signal that ends a process at once. It cannot be caught or ignored.', like: 'Cutting the power at the wall.' },
    { term: 'Daemon', def: 'A background program with no terminal, usually started at boot, such as a web server or database.', aka: ['service'] },
    { term: 'systemd', def: 'The service manager on most modern Linux systems; it starts, supervises and restarts services.', like: 'A hotel night manager.' },
    { term: 'Cron', def: 'A scheduler that runs commands at set times, defined in a crontab.', like: 'An alarm clock that runs a script.' }
  ],

  takeaways: [
    '**ps** and **top** show what is running; **kill** sends a signal. Try **SIGTERM** before **SIGKILL**.',
    '**systemd** keeps services alive: start, **enable** at boot, restart on failure.',
    'Read **journalctl** logs and **exit codes** (0 = success) to learn why something stopped.',
    '**cron** schedules jobs; **SSH** (preferably with keys) gets you onto the box.'
  ]
});

KS.boss('os', {
  title: 'The Kernel Kraken',
  intro: 'Deep in the machine room, something with a lot of tentacles is hogging every resource. Prove you understand processes, memory, I/O and the terminal, and it will let your server go.',
  questions: [
    { type: 'mcq', q: 'Why can a bug in your web app not crash the whole computer, while a bug in the kernel can?',
      options: ['Your app runs in walled-off user space; only the kernel has full power', 'Kernel code is always far better tested than app code', 'User programs run on a separate processor from the kernel', 'The kernel restarts apps automatically when they fail'],
      answer: 0,
      explain: 'User space is walled off: a user program can only damage itself. The kernel has full hardware access, so a fault there takes everything down.' },

    { type: 'tf', statement: 'Two threads in the same process share memory, but two separate processes do not.', answer: true,
      explain: 'Threads share their process\'s memory, which is cheap and risky. Processes have private memory enforced by the kernel.' },

    { type: 'multi', q: 'Which of these are true of a context switch?',
      options: ['The kernel saves one task\'s state and loads another\'s', 'It costs a little time every time it happens', 'It lets one core look like it runs many tasks', 'It needs one core per task', 'It removes the need for locks'],
      answers: [0, 1, 2],
      explain: 'Switching creates the illusion of simultaneity at a small cost. It does not need extra cores and does not solve races on shared data.' },

    { type: 'ab', q: 'Which request handler keeps a single-threaded Node.js server responsive?',
      a: { lang: 'js', label: 'Version one', src: `
        app.get('/export', (req, res) => {
          const data = fs.readFileSync('huge.csv', 'utf8');
          res.send(data);
        });` },
      b: { lang: 'js', label: 'Version two', src: `
        app.get('/export', (req, res) => {
          fs.readFile('huge.csv', 'utf8', (err, data) => {
            res.send(data);
          });
        });` },
      answer: 'b',
      explain: 'The non-blocking read returns to the event loop while the OS fetches the file, so other requests carry on. The blocking version freezes everyone until it finishes.' },

    { type: 'bucket', prompt: 'Which problem does each symptom point to?', buckets: ['Race condition', 'Deadlock', 'Memory leak'],
      items: [['Counter ends up lower than the number of clicks, but only sometimes', 0], ['App freezes with idle CPU and no errors', 1], ['Memory graph climbs for days, then the process vanishes', 2], ['Two deposits at once, and one is lost', 0], ['Thread 1 holds lock A and waits for B; thread 2 holds B and waits for A', 1], ['An unbounded cache that is never trimmed', 2]],
      explain: 'Wrong answers only sometimes means a race. A silent freeze means waiting in a cycle. A steady climb that ends in a vanishing process means a leak and the OOM killer.' },

    { type: 'order', prompt: 'Put what happens when a program reads a file into order.',
      items: ['Program makes a system call', 'Kernel checks permissions', 'Kernel fetches bytes from the disk', 'Bytes are copied into the program\'s memory', 'The program carries on with its data'],
      explain: 'Only the kernel touches the hardware, so every file read is a request, a check, a fetch and a hand-back.' },

    { type: 'cloze', text: 'Function calls and their local values live on the {{stack}}, which is cleaned up automatically. Objects that outlive a call live on the {{heap}}, which needs a {{garbage collector}} or manual freeing.',
      distractors: ['disk', 'cache', 'scheduler'],
      explain: 'The stack is automatic and call-sized; the heap holds longer-lived objects and needs someone to clean up.' },

    { type: 'spot', prompt: 'This cron-run backup sometimes loses its error messages. Tap the line to blame.',
      code: { lang: 'sh', src: `
        # m h dom mon dow command
        30 2 * * * /home/sam/backup.sh
        0 * * * *  /home/sam/cleanup.sh >> /home/sam/clean.log 2>&1` },
      lines: [2],
      explain: 'The backup job has no redirection, so its output and errors are not saved anywhere you can read. The cleanup job appends both to a log file.' },

    { type: 'short', q: 'Which signal cannot be caught or ignored by a program? (name it)', accept: ['SIGKILL', 'KILL', 'kill -9', '9', 'SIGKILL 9'], hint: 'It is the one used with `kill -9`.',
      explain: '**SIGKILL** is handled by the kernel directly, so the program never gets a chance to clean up. Try SIGTERM first.' },

    { type: 'estimate', q: 'A server holds 5,000 simultaneous client connections, each using its own socket. About how many file descriptors does it need for them?', answer: 5000, unit: 'descriptors', tolerance: 2,
      explain: 'Each socket is one file descriptor, so 5,000 connections need at least 5,000, well above a common default limit of 1024.' },

    { type: 'match', prompt: 'Match each command to what it does.',
      pairs: [['tail -f app.log', 'Follow a log as it grows'], ['chmod +x run.sh', 'Allow a script to be executed'], ['systemctl enable myapi', 'Start the service at boot'], ['journalctl -u myapi', 'Read that service\'s logs'], ['echo $?', 'Show the last command\'s exit code']] },

    { type: 'mcq', q: 'Your service is under systemd with `Restart=on-failure`. It exits with code 0 after a clean SIGTERM shutdown. What does systemd do?',
      options: ['Nothing: exit code 0 means success, so it is not a failure', 'Restarts it, because any exit is a failure', 'Sends SIGKILL to be sure', 'Marks the server as broken'],
      answer: 0,
      why: [null, 'That would be `Restart=always`. `on-failure` only reacts to failures.', 'The process has already exited, so there is nothing left to kill.', 'A clean exit is exactly what you want.'],
      explain: 'Exit code 0 is success, so `on-failure` leaves it stopped. A crash (non-zero exit) would trigger a restart.' }
  ]
});

KS.sheet('os', {
  title: 'Operating Systems cheat sheet',
  sections: [
    { title: 'What the OS does', md: `| Idea | Meaning |
|---|---|
| Resource manager | Shares CPU, memory, disk and network between programs |
| Kernel | Privileged core with direct hardware access |
| User space | Where your programs run, with restricted power |
| System call | A program's request to the kernel (open file, listen on port) |
| Abstractions | Files, processes, devices hide the hardware mess |

Linux file names are case-sensitive; default macOS and Windows are not.` },

    { title: 'Processes & threads', md: `| | Process | Thread |
|---|---|---|
| Memory | Private | Shared with siblings |
| Start cost | Heavier | Lighter |
| Crash | Others usually survive | Can take the process down |

- Program = file on disk; process = it running, with a **PID**
- Scheduler gives each task short slices; a **context switch** swaps them (not free)
- Processes for isolation, threads for cheap sharing` },

    { title: 'Concurrency', md: `- **Concurrency**: many tasks in progress by interleaving. **Parallelism**: running at the same instant (needs several cores).
- **Race condition** = shared mutable data + unlucky timing. Fix: a **lock/mutex** around the read-modify-write.
- **Deadlock** = threads wait on each other's locks in a cycle. Fix: take locks in the **same order**.
- **Node.js**: one JavaScript thread plus an event loop and non-blocking I/O. Never block the loop with long synchronous work.` },

    { title: 'Memory', md: `| | Stack | Heap |
|---|---|---|
| Holds | Calls and locals | Longer-lived objects |
| Cleanup | Automatic | GC or manual |
| Failure | Stack overflow | Leak, out of memory |

- **Virtual memory**: each process gets a private address map
- Leaks happen with GC too: unbounded caches and growing lists
- RAM full: **swap** (slow), then the **OOM killer** ends a process` },

    { title: 'I/O & talking between processes', md: `- Disk and network are far slower than the CPU, so servers mostly wait
- **Blocking**: wait for the result. **Non-blocking**: carry on, be notified later
- **File descriptor**: numbered handle. 0 stdin, 1 stdout, 2 stderr. Sockets count too; \`ulimit -n\` shows the limit
- **Buffering** batches data but can lose it on a crash until flushed
- IPC: **pipes**, **sockets**, **signals**, **shared memory** (needs locks)
- Close what you open, on every code path` },

    { title: 'Terminal commands', md: `| Command | Does |
|---|---|
| \`pwd\`, \`ls -l\`, \`cd\` | Where am I, list, move |
| \`cat\`, \`less\`, \`tail -f\` | Print, scroll, follow a file |
| \`grep word file\` | Matching lines |
| \`chmod\`, \`chown\`, \`sudo\` | Permissions, owner, run as root |
| \`>\`, \`>>\` | Overwrite a file, append to a file |
| \`export X=1\`, \`env\` | Set and list variables |

The pipe (vertical bar) feeds one command's output into the next, e.g. \`grep ERROR log | wc -l\`.

Permissions: **rwx** for user, group, other (r=4, w=2, x=1). Avoid \`chmod 777\`.` },

    { title: 'Running services', md: `| Task | Command |
|---|---|
| Snapshot / live view | \`ps aux\`, \`top\` |
| Stop politely / force | \`kill PID\` (SIGTERM) / \`kill -9 PID\` (SIGKILL) |
| Run, start at boot | \`systemctl start\` / \`enable\` |
| Is it alive? | \`systemctl status name\` |
| Logs | \`journalctl -u name -f\` |
| Exit code | \`echo $?\` (0 = success) |
| Schedule | \`crontab -e\`: \`min hour dom mon dow cmd\` |
| Remote login | \`ssh user@host\` |

Use \`Restart=on-failure\` in the unit file. Cron has a minimal environment: use full paths.` }
  ]
});

