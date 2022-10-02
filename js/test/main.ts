import {
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from '@solana/web3.js';
import {
  getHashedName,
  createNameRegistry,
  updateNameRegistryData,
  getNameAccountKey,
  NameRegistryState,
} from '../src';
import { getConnection, newAccountWithLamports } from './common';

const solClass = Keypair.generate();
const rootOwnerKey = Keypair.generate();
const rootDomain = '.sol';

const subOwnerKey = Keypair.generate();
const subDomain = 'yun';

function assert(condition: boolean, message?: string) {
  if (!condition) {
    console.log(Error().stack + ':token-test.js');
    throw message || 'Assertion failed';
  }
}

async function main() {
  const connection = await getConnection();

  const payer = await newAccountWithLamports(connection, 1000000000);
  const space = 1_000;

  const lamports = await connection.getMinimumBalanceForRentExemption(
    space + NameRegistryState.HEADER_LEN,
    'processed'
  );

  // create root domain registry
  {
    const rootRegistryCreationInstruction = await createNameRegistry(
      connection,
      rootDomain,
      space,
      payer.publicKey,
      rootOwnerKey.publicKey,
      lamports,
      solClass.publicKey
    );

    const transaction = new Transaction().add(rootRegistryCreationInstruction);
    await sendAndConfirmTransaction(connection, transaction, [payer, solClass]);
  }

  const hashedRootName = await getHashedName(rootDomain);
  const rootNameAccountKey = await getNameAccountKey(
    hashedRootName,
    solClass.publicKey
  );

  // check the registered root name account
  {
    const rootNameEntry = await NameRegistryState.retrieve(
      connection,
      rootNameAccountKey
    );

    assert(rootNameEntry.owner.equals(rootOwnerKey.publicKey), 'check owner');
    assert(
      rootNameEntry.parentName.equals(PublicKey.default),
      'check parent name'
    );
    assert(rootNameEntry.class.equals(solClass.publicKey), 'check class');
    assert(
      Buffer.compare(rootNameEntry.data as Buffer, Buffer.alloc(space, 0)) == 0,
      'should be empty'
    );
  }

  // create sub domain registry
  {
    const rootRegistryCreationInstruction = await createNameRegistry(
      connection,
      subDomain,
      space,
      payer.publicKey,
      subOwnerKey.publicKey,
      lamports,
      solClass.publicKey,
      rootNameAccountKey
    );

    const transaction = new Transaction().add(rootRegistryCreationInstruction);
    await sendAndConfirmTransaction(connection, transaction, [
      payer,
      solClass,
      rootOwnerKey,
    ]);
  }

  const subName = await getHashedName(subDomain);
  const subNameAccountKey = await getNameAccountKey(
    subName,
    solClass.publicKey,
    rootNameAccountKey
  );

  // check the registered sub name account
  {
    const subNameEntry = await NameRegistryState.retrieve(
      connection,
      subNameAccountKey
    );

    assert(subNameEntry.owner.equals(subOwnerKey.publicKey), 'check owner');
    assert(
      subNameEntry.parentName.equals(rootNameAccountKey),
      'check parent name'
    );
    assert(subNameEntry.class.equals(solClass.publicKey), 'check class');
    assert(
      Buffer.compare(subNameEntry.data as Buffer, Buffer.alloc(space, 0)) == 0,
      'should be empty'
    );
  }

  // update my domain data
  {
    const updateRegistryDataInstruction = await updateNameRegistryData(
      connection,
      subDomain,
      0,
      Buffer.from('test data'),
      solClass.publicKey,
      rootNameAccountKey
    );

    const transaction = new Transaction().add(updateRegistryDataInstruction);
    await sendAndConfirmTransaction(connection, transaction, [payer, solClass]);
  }

  // check the registered sub name account data
  {
    const subNameEntry = await NameRegistryState.retrieve(
      connection,
      subNameAccountKey
    );

    const dataBuffer = Buffer.alloc(space, 0);
    Buffer.from('test data').copy(dataBuffer);
    assert(
      Buffer.compare(subNameEntry.data as Buffer, dataBuffer) == 0,
      'should be empty'
    );
  }
}

main();
