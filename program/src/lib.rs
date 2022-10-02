//! An Name Service program for the Solana blockchain
#![deny(missing_docs)]

#[cfg(not(feature = "no-entrypoint"))]
mod entrypoint;

pub mod state;
pub mod instruction;
pub mod processor;
pub mod error;

// Export current sdk types for downstream users building with a different sdk version
pub use solana_program;

solana_program::declare_id!("namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX");
