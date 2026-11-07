package com.turnoya.turnoyabackend.controller;

import com.turnoya.turnoyabackend.dto.turno.ColaItemResponse;
import com.turnoya.turnoyabackend.dto.turno.TurnoResponse;
import com.turnoya.turnoyabackend.service.ColaService;
import com.turnoya.turnoyabackend.service.ColaStreamService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/v1/centros/{centroId}/especialidades/{especialidadId}/cola")
public class ColaController {

    private final ColaService colaService;
    private final ColaStreamService colaStreamService;

    public ColaController(ColaService colaService, ColaStreamService colaStreamService) {
        this.colaService = colaService;
        this.colaStreamService = colaStreamService;
    }

    /**
     * Cola en tiempo real (SSE). Como EventSource del navegador no permite
     * headers, el token JWT puede ir en el parámetro {@code token}.
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter suscribirse(@PathVariable("centroId") Long centroId,
            @PathVariable("especialidadId") Long especialidadId) {
        return colaStreamService.suscribir(centroId, especialidadId);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MEDICO', 'ADMINISTRADOR')")
    public ResponseEntity<List<ColaItemResponse>> verCola(@PathVariable("centroId") Long centroId,
            @PathVariable("especialidadId") Long especialidadId) {
        return ResponseEntity.ok(colaService.obtenerCola(centroId, especialidadId));
    }

    @PostMapping("/siguiente")
    @PreAuthorize("hasRole('MEDICO')")
    public ResponseEntity<TurnoResponse> llamarSiguiente(@PathVariable("centroId") Long centroId,
            @PathVariable("especialidadId") Long especialidadId) {
        return ResponseEntity.ok(colaService.llamarSiguiente(centroId, especialidadId));
    }
}