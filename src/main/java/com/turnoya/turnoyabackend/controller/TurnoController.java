package com.turnoya.turnoyabackend.controller;

import com.turnoya.turnoyabackend.dto.common.PageResponse;
import com.turnoya.turnoyabackend.dto.turno.PosicionColaResponse;
import com.turnoya.turnoyabackend.dto.turno.TurnoCreateRequest;
import com.turnoya.turnoyabackend.dto.turno.TurnoEstadoUpdateRequest;
import com.turnoya.turnoyabackend.dto.turno.TurnoResponse;
import com.turnoya.turnoyabackend.entity.EstadoTurno;
import com.turnoya.turnoyabackend.service.ColaService;
import com.turnoya.turnoyabackend.service.TurnoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/turnos")
public class TurnoController {

    private final TurnoService turnoService;
    private final ColaService colaService;

    public TurnoController(TurnoService turnoService, ColaService colaService) {
        this.turnoService = turnoService;
        this.colaService = colaService;
    }

    @PostMapping
    @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<TurnoResponse> reservar(@Valid @RequestBody TurnoCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(turnoService.reservar(request));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<PageResponse<TurnoResponse>> listarMisTurnos(
            @RequestParam(name = "estado", required = false) EstadoTurno estado,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(turnoService.listarMisTurnos(estado, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TurnoResponse> obtenerPorId(@PathVariable("id") Long id) {
        return ResponseEntity.ok(turnoService.obtenerPorId(id));
    }

    @GetMapping("/{id}/posicion")
    @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<PosicionColaResponse> obtenerPosicion(@PathVariable("id") Long id) {
        return ResponseEntity.ok(colaService.obtenerPosicion(id));
    }

    @PatchMapping("/{id}/cancelar")
    @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<TurnoResponse> cancelar(@PathVariable("id") Long id) {
        return ResponseEntity.ok(turnoService.cancelar(id));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('MEDICO', 'ADMINISTRADOR')")
    public ResponseEntity<TurnoResponse> cambiarEstado(@PathVariable("id") Long id,
            @Valid @RequestBody TurnoEstadoUpdateRequest request) {
        return ResponseEntity.ok(turnoService.cambiarEstado(id, request));
    }
}