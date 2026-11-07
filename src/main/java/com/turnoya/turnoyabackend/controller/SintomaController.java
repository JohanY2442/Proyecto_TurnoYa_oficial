package com.turnoya.turnoyabackend.controller;

import com.turnoya.turnoyabackend.dto.triage.SintomaResponse;
import com.turnoya.turnoyabackend.service.TriageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Catálogo de síntomas del triage, para que el frontend no tenga la lista
 * escrita a mano.
 */
@RestController
@RequestMapping("/api/v1/triage/sintomas")
public class SintomaController {

    private final TriageService triageService;

    public SintomaController(TriageService triageService) {
        this.triageService = triageService;
    }

    @GetMapping
    public ResponseEntity<List<SintomaResponse>> listar() {
        return ResponseEntity.ok(triageService.listarSintomas());
    }
}
