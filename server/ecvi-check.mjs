import { diagnoseEcvi } from '../dist/server/index.js';

try {
  const args = process.argv.slice(2);
  const report = await diagnoseEcvi(process.env, args.filter(arg => arg !== '--external'), args.includes('--external'));
  console.log(JSON.stringify(report, null, 2));
  if (report.status !== 'connected') process.exitCode = 1;
} catch {
  console.error('ECVI: invalid_configuration');
  process.exitCode = 1;
}
