package com.turnoya.turnoyabackend.service;

import com.turnoya.turnoyabackend.dto.triage.SintomaResponse;
import com.turnoya.turnoyabackend.dto.triage.TriageRequest;
import com.turnoya.turnoyabackend.dto.triage.TriageResponse;

import java.util.List;

public interface TriageService {

    TriageResponse registrar(Long turnoId, TriageRequest request);

    TriageResponse obtenerPorTurno(Long turnoId);

    List<SintomaResponse> listarSintomas();

}
