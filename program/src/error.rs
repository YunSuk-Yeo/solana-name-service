//! Program error
//! 
use {
    num_derive::FromPrimitive,
    solana_program::{decode_error::DecodeError, program_error::ProgramError},
    thiserror::Error,
};

/// NameServiceError defines name service specific errors
#[derive(Clone, Debug, Eq, Error, FromPrimitive, PartialEq)]
pub enum NameServiceError {
    /// out of space error
    #[error("Out of space")]
    OutOfSpace,
}

/// Error wrapper
pub type NameServiceResult = Result<(), NameServiceError>;

impl From<NameServiceError> for ProgramError {
    fn from(e: NameServiceError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

impl<T> DecodeError<T> for NameServiceError {
    fn type_of() -> &'static str {
        "NameServiceError"
    }
}
