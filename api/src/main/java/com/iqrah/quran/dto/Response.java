package com.iqrah.quran.dto;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Response<T> {

    private boolean success;
    private int status;
    private String message;
    private T data;

    @Builder.Default
    private Instant timestamp = Instant.now();

    // optional (useful for validation errors)
    private List<String> errors;

    // ===== SUCCESS =====
    public static <T> Response<T> ok(String message, T data) {
        return Response.<T>builder()
                .success(true)
                .status(200)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> Response<T> ok(T data) {
        return ok("Success", data);
    }

    public static Response<Void> okMessage(String message) {
        return ok(message, null);
    }

    // ===== ERROR =====
    public static <T> Response<T> fail(int status, String message) {
        return Response.<T>builder()
                .success(false)
                .status(status)
                .message(message)
                .data(null)
                .build();
    }

    public static <T> Response<T> fail(int status, String message, T data) {
        return Response.<T>builder()
                .success(false)
                .status(status)
                .message(message)
                .data(data)
                .build();
    }

    public static Response<Void> fail(int status, String message, List<String> errors) {
        return Response.<Void>builder()
                .success(false)
                .status(status)
                .message(message)
                .errors(errors)
                .build();
    }
}
