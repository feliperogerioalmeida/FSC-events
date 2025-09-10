export enum ErrorCode {
  INVALID_PARAMETER = "INVALID_PARAMETER",
  EVENT_ALREADY_EXISTS = "EVENT_ALREADY_EXISTS",
  NOT_FOUND = "NOT_FOUND",
}

export class InvalidParameterError extends Error {
  code = ErrorCode.INVALID_PARAMETER

  constructor(parameter: string) {
    super(`Invalid Parameter: ${parameter}`)
  }
}

export class EventAlreadyExistsError extends Error {
  code = ErrorCode.EVENT_ALREADY_EXISTS
  constructor() {
    super("Event already exists")
  }
}

export class NotFoundError extends Error {
  code = ErrorCode.NOT_FOUND

  constructor(message: string) {
    super(message)
  }
}
