// Jalankan MongoDB, server dan client sekaligus: `npm run dev` dari folder root
const { spawn } = require('node:child_process');
const { existsSync } = require('node:fs');

// MongoDB portable di D: (C: penuh). Kalau tidak ada, server memakai MONGO_URI apa adanya (mis. Atlas)
const MONGOD = 'D:/mongodb/mongod.exe';
const cmds = [['npm run dev', `${__dirname}/server`], ['npm run dev', `${__dirname}/client`]];
if (existsSync(MONGOD)) cmds.unshift([`"${MONGOD}" --dbpath D:/mongodb/data --bind_ip 127.0.0.1 --quiet`, __dirname]);

const procs = cmds.map(([cmd, cwd]) => spawn(cmd, { cwd, stdio: 'inherit', shell: true }));
// Kalau salah satu mati, matikan yang lain juga
for (const p of procs) p.on('exit', (code) => { procs.forEach((x) => x.kill()); process.exit(code ?? 0); });
