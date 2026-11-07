package com.turnoya.turnoyabackend.service;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * Cola en tiempo real con Server-Sent Events: el frontend se suscribe a una
 * cola (centro + especialidad) y recibe un aviso cada vez que cambia.
 */
public interface ColaStreamService {

    SseEmitter suscribir(Long centroId, Long especialidadId);

    void notificarCambio(Long centroId, Long especialidadId);
}