import { execa } from 'execa';

// run it manually if fail
await execa('yarn', ['dlx', '@goatjs/dbz publish']);
