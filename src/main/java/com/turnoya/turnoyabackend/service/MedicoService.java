package com.turnoya.turnoyabackend.service;

import com.turnoya.turnoyabackend.dto.common.PageResponse;
import com.turnoya.turnoyabackend.dto.medico.MedicoCreateRequest;
import com.turnoya.turnoyabackend.dto.medico.MedicoResponse;

import java.util.List;

public interface MedicoService {

    MedicoResponse crear(MedicoCreateRequest request);

    PageResponse<MedicoResponse> listar(Long especialidadId, int page, int size);

    MedicoResponse obtenerPorId(Long id);

    MedicoResponse obtenerMiPerfil();
}