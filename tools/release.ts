import { execa } from 'execa';

await execa('yarn', ['dlx', '@goatjs/dbz publish']);
