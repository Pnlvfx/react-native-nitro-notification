import { execa } from 'execa';

// yarn dlx @goatjs/dbz login
// run it manually if fail
await execa('yarn', ['dlx', '@goatjs/dbz publish']);
