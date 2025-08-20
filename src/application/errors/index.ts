export class InvalidOwnerIdError extends Error {
  code = "INVALID_OWNER_ID"

  constructor() {
    super("Invalid ownerId")
  }
}
