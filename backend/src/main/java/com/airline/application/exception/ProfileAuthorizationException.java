package com.airline.application.exception;

import lombok.Getter;

@Getter
public class ProfileAuthorizationException extends RuntimeException {
    private final String code;

    public ProfileAuthorizationException(String code, String message) {
        super(message);
        this.code = code;
    }
}
