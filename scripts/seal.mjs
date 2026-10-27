import { spawnSync } from 'node:child_process';
import readline from 'node:readline';

// Builds the site and seals protected pages. Prompts for the passcode so it never lands in shell history.
let passcode = process.env.SEAL_PASSCODE;
if (!passcode) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  rl._writeToOutput = (s) => { if (s.includes('Passcode')) process.stdout.write(s); };
  passcode = await new Promise((res) => rl.question('Passcode: ', (a) => { rl.close(); process.stdout.write('\n'); res(a); }));
}
if (!passcode) { console.error('No passcode given.'); process.exit(1); }
const r = spawnSync('npx', ['astro', 'build'], { stdio: 'inherit', env: { ...process.env, SEAL_PASSCODE: passcode } });
process.exit(r.status ?? 1);
