package com.damjan.scheduler_mycelium.exception;

public class BusinessNotFoundException extends ResourceNotFoundException {
    public BusinessNotFoundException(String message) {
        super(message);
    }
}
