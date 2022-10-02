import { PublicKey, TransactionInstruction, AccountMeta } from '@solana/web3.js';
import { Numberu32, Numberu64 } from './utils';

export function createInstruction(
    nameProgramId: PublicKey,
    systemProgramId: PublicKey,
    nameAccountKey: PublicKey,
    nameOwnerKey: PublicKey,
    payerKey: PublicKey,
    hashedName: Buffer,
    lamports: Numberu64,
    space: Numberu32,
    nameClassKey?: PublicKey,
    nameParent?: PublicKey,
    nameParentOwner?: PublicKey,
): TransactionInstruction {

    const buffers = [
        Buffer.from(Int8Array.from([0])),
        new Numberu32(hashedName.length).toBuffer(),
        hashedName,
        lamports.toBuffer(),
        space.toBuffer(),
    ];

    const data = Buffer.concat(buffers);
    const keys: Array<AccountMeta> = [
        {
            pubkey: systemProgramId,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: payerKey,
            isSigner: true,
            isWritable: true,
        },
        {
            pubkey: nameAccountKey, // must be program address
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: nameOwnerKey,
            isSigner: false,
            isWritable: false,
        },
    ];

    if (nameClassKey) {
        keys.push(
            {
                pubkey: nameClassKey,
                isSigner: true,
                isWritable: false,
            },
        );
    } else {
        keys.push(
            {
                pubkey: new PublicKey(Buffer.alloc(32)),
                isSigner: false,
                isWritable: false,
            },
        )
    }

    if (nameParent && nameParentOwner) {
        keys.push(
            {
                pubkey: nameParent,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: nameParentOwner,
                isSigner: true,
                isWritable: false,
            },
        );
    } else {
        keys.push(
            {
                pubkey: new PublicKey(Buffer.alloc(32)),
                isSigner: false,
                isWritable: false,
            },
        );
    }

    return new TransactionInstruction(
        {
            data,
            keys,
            programId: nameProgramId,
        },
    );
}

export function updateInstruction(
    nameProgramId: PublicKey,
    nameAccountKey: PublicKey,
    offset: Numberu32,
    inputData: Buffer,
    nameUpdateSigner: PublicKey,
    parentNameKey?: PublicKey
): TransactionInstruction {
    const buffers = [
        Buffer.from(Int8Array.from([1])),
        offset.toBuffer(),
        new Numberu32(inputData.length).toBuffer(),
        inputData,
    ];

    const data = Buffer.concat(buffers);
    const keys: Array<AccountMeta> = [
        {
            pubkey: nameAccountKey, // must be program address
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: nameUpdateSigner,
            isSigner: true,
            isWritable: false,
        },
    ];

    // parent name should be given if the signer key is parent owner key
    if (parentNameKey) {
        keys.push({
            pubkey: parentNameKey,
            isSigner: false,
            isWritable: false,
        });
    }

    return new TransactionInstruction({
        data,
        keys,
        programId: nameProgramId,
    });
}

export function transferInstruction(
    nameProgramId: PublicKey,
    nameAccountKey: PublicKey,
    newOwnerKey: PublicKey,
    currentNameOwnerKey: PublicKey,
    nameClassKey?: PublicKey,
    nameParentKey?: PublicKey,
): TransactionInstruction {
    const buffers = [Buffer.from(Int8Array.from([2])), newOwnerKey.toBuffer()];
    const data = Buffer.concat(buffers);

    const keys: Array<AccountMeta> = [
        {
            pubkey: nameAccountKey,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: currentNameOwnerKey,
            isSigner: true,
            isWritable: false,
        },
    ];

    if (nameClassKey) {
        keys.push({
            pubkey: nameClassKey,
            isSigner: true,
            isWritable: false,
        });
    }

    // if name owner is parent owner,
    // then parent keys should be given with class key as signer
    if (nameParentKey) {
        keys.push({
            pubkey: nameParentKey,
            isSigner: false,
            isWritable: false,
        })
    }

    return new TransactionInstruction({
        data,
        keys,
        programId: nameProgramId,
    })
}

export function deleteInstruction(
    nameProgramId: PublicKey,
    nameAccountKey: PublicKey,
    refundTargetKey: PublicKey,
    nameOwnerKey: PublicKey,
): TransactionInstruction {
    const buffers = [Buffer.from(Int8Array.from([3]))];
    const data = Buffer.concat(buffers);

    const keys: Array<AccountMeta> = [
        {
            pubkey: nameAccountKey,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: nameOwnerKey,
            isSigner: true,
            isWritable: false,
        },
        {
            pubkey: refundTargetKey,
            isSigner: false,
            isWritable: true,
        },
    ];

    return new TransactionInstruction({
        data,
        keys,
        programId: nameProgramId,
    });
}