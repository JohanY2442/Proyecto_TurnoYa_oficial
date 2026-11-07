package com.turnoya.turnoyabackend.dto.turno;

import com.turnoya.turnoyabackend.entity.NivelUrgencia;

public record PosicionColaResponse(
        Long turnoId,
        int posicion,
        int personasAdelante,
        NivelUrgencia nivelUrgencia
) {
}