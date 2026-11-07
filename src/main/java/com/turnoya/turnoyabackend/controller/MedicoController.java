package com.turnoya.turnoyabackend.controller;

import com.turnoya.turnoyabackend.dto.common.PageResponse;
import com.turnoya.turnoyabackend.dto.medico.MedicoCreateRequest;
import com.turnoya.turnoyabackend.dto.medico.MedicoResponse;
import com.turnoya.turnoyabackend.dto.turno.TurnoResponse;
import com.turnoya.turnoyabackend.service.TurnoService;
import com.turnoya.turnoyabackend.service.MedicoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/medicos")
public class MedicoController {

    private final MedicoService medicoService;
    private final TurnoService turnoService;

    public MedicoController(MedicoService medicoService, TurnoService turnoService) {
        this.medicoService = medicoService;
        this.turnoService = turnoService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('MEDICO')")
    public ResponseEntity<MedicoResponse> obtenerMiPerfil() {
        return ResponseEntity.ok(medicoService.obtenerMiPerfil());
    }

    @GetMapping("/me/en-atencion")
    @PreAuthorize("hasRole('MEDICO')")
    public ResponseEntity<List<TurnoResponse>> listarEnAtencion() {
        return ResponseEntity.ok(turnoService.listarEnAtencionDelMedico());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<MedicoResponse> crear(@Valid @RequestBody MedicoCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medicoService.crear(request));
    }

    @GetMapping
    public ResponseEntity<PageResponse<MedicoResponse>> listar(
            @RequestParam(name = "especialidadId", required = false) Long especialidadId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(medicoService.listar(especialidadId, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicoResponse> obtenerPorId(@PathVariable("id") Long id) {
        return ResponseEntity.ok(medicoService.obtenerPorId(id));
    }
}