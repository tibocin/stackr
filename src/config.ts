import { config as loadEnv } from 'dotenv';
loadEnv();

export const cfg = {
  port: parseInt(process.env['PORT'] || '3021', 10),
  env: process.env['STACKR_ENV'] || 'dev',
  dbUrl: process.env['DATABASE_URL'] || './data/stackr.db',
  rpc: {
    url: process.env['BITCOIN_NODE_RPC_URL'] || '',
    user: process.env['BITCOIN_NODE_RPC_USER'] || '',
    pass: process.env['BITCOIN_NODE_RPC_PASS'] || '',
  },
  xpub: process.env['XPUB'] || '',
};
