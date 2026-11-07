package com.turnoya.turnoyabackend.service;

import com.turnoya.turnoyabackend.dto.common.PageResponse;
import com.turnoya.turnoyabackend.dto.paciente.PacienteResponse;
import com.turnoya.turnoyabackend.dto.paciente.PacienteUpdateRequest;

import java.util.List;

public interface PacienteService {

    PacienteResponse obtenerMiPerfil();

    PacienteResponse actualizarMiPerfil(PacienteUpdateRequest request);

    PageResponse<PacienteResponse> listar(int page, int size);

    PacienteResponse obtenerPorId(Long id);
}