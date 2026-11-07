package com.turnoya.turnoyabackend.service;

import com.turnoya.turnoyabackend.dto.common.PageResponse;
import com.turnoya.turnoyabackend.dto.turno.TurnoCreateRequest;
import com.turnoya.turnoyabackend.dto.turno.TurnoEstadoUpdateRequest;
import com.turnoya.turnoyabackend.dto.turno.TurnoResponse;
import com.turnoya.turnoyabackend.entity.EstadoTurno;

import java.util.List;

public interface TurnoService {

    TurnoResponse reservar(TurnoCreateRequest request);

    PageResponse<TurnoResponse> listarMisTurnos(EstadoTurno estado, int page, int size);

    List<TurnoResponse> listarEnAtencionDelMedico();

    TurnoResponse obtenerPorId(Long id);

    TurnoResponse cancelar(Long id);

    TurnoResponse cambiarEstado(Long id, TurnoEstadoUpdateRequest request);
}