package com.turnoya.turnoyabackend.controller;

import com.turnoya.turnoyabackend.dto.centro.CentroCercanoResponse;
import com.turnoya.turnoyabackend.dto.centro.CentroSaludRequest;
import com.turnoya.turnoyabackend.dto.centro.CentroSaludResponse;
import com.turnoya.turnoyabackend.dto.common.PageResponse;
import com.turnoya.turnoyabackend.dto.estadistica.EstadisticasCentroResponse;
import com.turnoya.turnoyabackend.service.CentroSaludService;
import com.turnoya.turnoyabackend.service.EstadisticaService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/centros")
public class CentroSaludController {

    private final CentroSaludService centroSaludService;
    private final EstadisticaService estadisticaService;

    public CentroSaludController(CentroSaludService centroSaludService, EstadisticaService estadisticaService) {
        this.centroSaludService = centroSaludService;
        this.estadisticaService = estadisticaService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<CentroSaludResponse>> listar(
            @RequestParam(name = "especialidadId", required = false) Long especialidadId,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(centroSaludService.listar(especialidadId, search, page, size));
    }

    @GetMapping("/{id}/estadisticas")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'MEDICO')")
    public ResponseEntity<EstadisticasCentroResponse> obtenerEstadisticas(
            @PathVariable("id") Long id,
            @RequestParam(name = "fecha", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(estadisticaService.obtenerDelDia(id, fecha != null ? fecha : LocalDate.now()));
    }

    @GetMapping("/cercanos")
    public ResponseEntity<List<CentroCercanoResponse>> buscarCercanos(
            @RequestParam("latitud") double latitud,
            @RequestParam("longitud") double longitud,
            @RequestParam(name = "especialidadId", required = false) Long especialidadId,
            @RequestParam(name = "radioKm", defaultValue = "10") double radioKm) {
        return ResponseEntity.ok(centroSaludService.buscarCercanos(latitud, longitud, especialidadId, radioKm));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CentroSaludResponse> obtenerPorId(@PathVariable("id") Long id) {
        return ResponseEntity.ok(centroSaludService.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<CentroSaludResponse> crear(@Valid @RequestBody CentroSaludRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(centroSaludService.crear(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<CentroSaludResponse> actualizar(@PathVariable("id") Long id,
            @Valid @RequestBody CentroSaludRequest request) {
        return ResponseEntity.ok(centroSaludService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminar(@PathVariable("id") Long id) {
        centroSaludService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/especialidades/{especialidadId}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<CentroSaludResponse> agregarEspecialidad(@PathVariable("id") Long id,
            @PathVariable("especialidadId") Long especialidadId) {
        return ResponseEntity.ok(centroSaludService.agregarEspecialidad(id, especialidadId));
    }
}