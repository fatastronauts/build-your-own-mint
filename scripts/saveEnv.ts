import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { parse, DotenvParseOutput } from 'dotenv';

const envPath = resolve(__dirname, '../.env');

export default function(vars: { [index: string]: string }) {
  let current: DotenvParseOutput;
  try {
    current = parse(readFileSync(envPath));
  } catch (e) {
    current = {};
  }
  Object.assign(current, vars);
  const serialized = Object.keys(current)
    .map(key => `${key}=${current[key]}`)
    .join(`\n`);
  writeFileSync(envPath, serialized);
}
