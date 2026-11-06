package com.turnoya.turnoyabackend.service;

import com.turnoya.turnoyabackend.entity.NivelUrgencia;
import com.turnoya.turnoyabackend.entity.Usuario;
import com.turnoya.turnoyabackend.event.TurnoEvent;

/**
 * Servicio responsable de enviar los correos de TurnoYa usando plantillas
 * HTML y de registrar cada envío exitoso en {@code Notificacion}.
 */
public interface EmailService {

    /**
     * Notifica al paciente la creación o el cambio de estado de su turno.
     *
     * @throws com.turnoya.turnoyabackend.exception.NotificationFailedException si el envío falla
     */
    void enviarNotificacionTurno(Usuario paciente, TurnoEvent evento);

    /**
     * Da la bienvenida a un usuario recién registrado.
     */
    void enviarBienvenida(Usuario usuario);

    /**
     * Informa al paciente el nivel de urgencia calculado y su posición en la cola.
     */
    void enviarResultadoTriage(Usuario paciente, NivelUrgencia nivelUrgencia, int posicionEnCola);
}