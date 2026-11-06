package com.turnoya.turnoyabackend.service;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;


public interface ColaStreamService {

    SseEmitter suscribir(Long centroId, Long especialidadId);

    void notificarCambio(Long centroId, Long especialidadId);
}