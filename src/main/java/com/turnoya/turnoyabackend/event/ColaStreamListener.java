package com.turnoya.turnoyabackend.event;

import com.turnoya.turnoyabackend.config.AsyncConfig;
import com.turnoya.turnoyabackend.service.ColaStreamService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Cuando una cola cambia (triage nuevo, médico llama al siguiente, turno
 * cancelado o con nuevo estado) avisa a los clientes suscritos por SSE.
 * Corre después del commit para que el cliente lea la cola ya actualizada.
 */
@Component
public class ColaStreamListener {

    private final ColaStreamService colaStreamService;

    public ColaStreamListener(ColaStreamService colaStreamService) {
        this.colaStreamService = colaStreamService;
    }

    @Async(AsyncConfig.TASK_EXECUTOR_BEAN)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onTurnoEvent(TurnoEvent evento) {
        colaStreamService.notificarCambio(evento.getCentroId(), evento.getEspecialidadId());
    }

    @Async(AsyncConfig.TASK_EXECUTOR_BEAN)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onTriageRegistrado(TriageRegistradoEvent evento) {
        colaStreamService.notificarCambio(evento.getCentroId(), evento.getEspecialidadId());
    }
}