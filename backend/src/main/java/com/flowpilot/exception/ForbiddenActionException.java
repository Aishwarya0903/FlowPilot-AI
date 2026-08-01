package com.flowpilot.exception;

/** Thrown when an authenticated user attempts an action they are not authorized to perform. */
public class ForbiddenActionException extends RuntimeException {
    public ForbiddenActionException(String message) {
        super(message);
    }
}
