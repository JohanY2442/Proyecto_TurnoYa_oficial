package com.turnoya.turnoyabackend.event;

import com.turnoya.turnoyabackend.entity.Turno;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * Arma el {@link TurnoEvent} a partir de un turno y lo publica.
 */
@Component
public class TurnoEventPublisher {

    private final ApplicationEventPublisher eventPublisher;

    public TurnoEventPublisher(ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    public void publicar(Turno turno, TipoEventoTurno tipoEvento) {
        eventPublisher.publishEvent(new TurnoEvent(
                turno.getId(),
                turno.getPaciente().getUsuario().getId(),
                String.format("T-%05d", turno.getId()),
                turno.getEspecialidad().getNombre(),
                turno.getCentroSalud().getNombre(),
                turno.getFechaHora(),
                turno.getEstado().name(),
                tipoEvento,
                turno.getCentroSalud().getId(),
                turno.getEspecialidad().getId()
        ));
    }
}
