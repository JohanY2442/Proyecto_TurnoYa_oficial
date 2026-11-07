package com.turnoya.turnoyabackend.service;

import com.turnoya.turnoyabackend.dto.estadistica.EstadisticasCentroResponse;

import java.time.LocalDate;

public interface EstadisticaService {

    EstadisticasCentroResponse obtenerDelDia(Long centroId, LocalDate fecha);
}