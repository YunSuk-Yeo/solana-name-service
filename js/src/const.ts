import { PublicKey } from '@solana/web3.js';

export const HASH_PREFIX = 'SPL Name Service';
export const NAME_PROGRAM_ID = new PublicKey(
    process.env.NAME_PROGRAM_ID ||
    'namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX'
);

