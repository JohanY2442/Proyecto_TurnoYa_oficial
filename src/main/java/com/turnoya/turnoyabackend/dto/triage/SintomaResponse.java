package com.turnoya.turnoyabackend.dto.triage;

public record SintomaResponse(
        String codigo,
        String etiqueta,
        int gravedad
) {
}
