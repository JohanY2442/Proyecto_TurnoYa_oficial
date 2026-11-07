package com.turnoya.turnoyabackend.event;

import java.time.LocalDateTime;

/**
 * Evento de dominio que representa la creación o el cambio de estado de un
 * {@code Turno}.
 * <p>
 * <b>Cómo lo usan los demás módulos:</b> cuando el servicio de turnos (módulo
 * de Backend & Database / Async del equipo) crea o actualiza un turno, debe
 * publicar este evento así:
 * <pre>{@code
 * eventPublisher.publishEvent(new TurnoEvent(
 *         turno.getId(),
 *         turno.getPaciente().getUsuario().getId(),
 *         String.valueOf(turno.getId()),      // o el código de turno que definan
 *         turno.getEspecialidad().getNombre(),
 *         turno.getEstablecimiento().getNombre(),
 *         turno.getFechaHora(),
 *         turno.getEstado().name(),
 *         TipoEventoTurno.CREACION
 * ));
 * }</pre>
 * A propósito NO viaja la entidad JPA {@code Turno} completa dentro del evento:
 * como el listener se ejecuta de forma asíncrona (en otro hilo, fuera de la
 * transacción original), acceder a relaciones lazy de una entidad ya
 * "despegada" del contexto de persistencia lanzaría
 * {@code LazyInitializationException}. Por eso el evento viaja con datos ya
 * resueltos (tipos simples), que es la práctica recomendada para eventos
 * asíncronos con JPA.
 */
public class TurnoEvent {

    private final Long turnoId;
    private final Long usuarioId;
    private final String numeroTurno;
    private final String especialidad;
    private final String establecimiento;
    private final LocalDateTime fechaHora;
    private final String estado;
    private final TipoEventoTurno tipoEvento;
    private final Long centroId;
    private final Long especialidadId;

    public TurnoEvent(Long turnoId, Long usuarioId, String numeroTurno, String especialidad,
            String establecimiento, LocalDateTime fechaHora, String estado,
            TipoEventoTurno tipoEvento) {
        this(turnoId, usuarioId, numeroTurno, especialidad, establecimiento, fechaHora, estado, tipoEvento,
                null, null);
    }

    /**
     * Incluye los ids del centro y la especialidad para que la cola en tiempo
     * real sepa a qué suscriptores avisar.
     */
    public TurnoEvent(Long turnoId, Long usuarioId, String numeroTurno, String especialidad,
            String establecimiento, LocalDateTime fechaHora, String estado,
            TipoEventoTurno tipoEvento, Long centroId, Long especialidadId) {
        this.turnoId = turnoId;
        this.usuarioId = usuarioId;
        this.numeroTurno = numeroTurno;
        this.especialidad = especialidad;
        this.establecimiento = establecimiento;
        this.fechaHora = fechaHora;
        this.estado = estado;
        this.tipoEvento = tipoEvento;
        this.centroId = centroId;
        this.especialidadId = especialidadId;
    }

    public Long getCentroId() {
        return centroId;
    }

    public Long getEspecialidadId() {
        return especialidadId;
    }

    public Long getTurnoId() {
        return turnoId;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public String getNumeroTurno() {
        return numeroTurno;
    }

    public String getEspecialidad() {
        return especialidad;
    }

    public String getEstablecimiento() {
        return establecimiento;
    }

    public LocalDateTime getFechaHora() {
        return fechaHora;
    }

    public String getEstado() {
        return estado;
    }

    public TipoEventoTurno getTipoEvento() {
        return tipoEvento;
    }
}
