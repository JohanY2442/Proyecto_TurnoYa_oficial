package com.turnoya.turnoyabackend.dto.estadistica;

import java.time.LocalDate;
import java.util.Map;

/**
 * Resumen de un día de atención en un centro, para el dashboard del
 * administrador (panel de estadísticas de la propuesta).
 */
public record EstadisticasCentroResponse(
        Long centroId,
        String centro,
        LocalDate fecha,
        int capacidadDiaria,
        long totalTurnos,
        long cuposDisponibles,
        long enEspera,
        int esperaEstimadaPromedioMin,
        Map<String, Long> porEstado,
        Map<String, Long> porUrgencia,
        Map<String, Long> porEspecialidad
) {
}