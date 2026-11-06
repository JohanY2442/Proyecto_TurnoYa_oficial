package com.turnoya.turnoyabackend.service.impl;

import com.turnoya.turnoyabackend.dto.estadistica.EstadisticasCentroResponse;
import com.turnoya.turnoyabackend.entity.CentroSalud;
import com.turnoya.turnoyabackend.entity.EstadoTurno;
import com.turnoya.turnoyabackend.entity.NivelUrgencia;
import com.turnoya.turnoyabackend.entity.Turno;
import com.turnoya.turnoyabackend.exception.ResourceNotFoundException;
import com.turnoya.turnoyabackend.repository.CentroSaludRepository;
import com.turnoya.turnoyabackend.repository.TurnoRepository;
import com.turnoya.turnoyabackend.service.EstadisticaService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * Calcula el resumen diario de un centro (panel de estadísticas de la propuesta).
 */
@Service
@Transactional(readOnly = true)
public class EstadisticaServiceImpl implements EstadisticaService {

    private final TurnoRepository turnoRepository;
    private final CentroSaludRepository centroSaludRepository;
    private final int minutosPorAtencion;

    public EstadisticaServiceImpl(TurnoRepository turnoRepository,
            CentroSaludRepository centroSaludRepository,
            @Value("${app.cola.minutos-por-atencion:15}") int minutosPorAtencion) {
        this.turnoRepository = turnoRepository;
        this.centroSaludRepository = centroSaludRepository;
        this.minutosPorAtencion = minutosPorAtencion;
    }

    @Override
    public EstadisticasCentroResponse obtenerDelDia(Long centroId, LocalDate fecha) {
        CentroSalud centro = centroSaludRepository.findById(centroId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el centro de salud con id " + centroId));

        LocalDateTime inicio = fecha.atStartOfDay();
        LocalDateTime fin = inicio.plusDays(1).minusNanos(1);
        List<Turno> turnos = turnoRepository.buscarDelDia(centroId, inicio, fin);

        Map<String, Long> porEstado = contarPorEstado(turnos);
        long activos = turnos.size() - porEstado.get(EstadoTurno.CANCELADO.name());
        long enEspera = porEstado.get(EstadoTurno.EN_ESPERA.name());

        return new EstadisticasCentroResponse(
                centro.getId(),
                centro.getNombre(),
                fecha,
                centro.getCapacidadDiaria(),
                turnos.size(),
                Math.max(centro.getCapacidadDiaria() - activos, 0),
                enEspera,
                calcularEsperaPromedio(turnos),
                porEstado,
                contarPorUrgencia(turnos),
                contarPorEspecialidad(turnos)
        );
    }

    private Map<String, Long> contarPorEstado(List<Turno> turnos) {
        Map<String, Long> conteo = new LinkedHashMap<>();
        for (EstadoTurno estado : EstadoTurno.values()) {
            conteo.put(estado.name(), 0L);
        }
        turnos.forEach(t -> conteo.merge(t.getEstado().name(), 1L, Long::sum));
        return conteo;
    }

    private Map<String, Long> contarPorUrgencia(List<Turno> turnos) {
        Map<String, Long> conteo = new LinkedHashMap<>();
        for (NivelUrgencia nivel : NivelUrgencia.values()) {
            conteo.put(nivel.name(), 0L);
        }
        turnos.stream()
                .filter(t -> t.getTriage() != null)
                .forEach(t -> conteo.merge(t.getTriage().getNivelUrgencia().name(), 1L, Long::sum));
        return conteo;
    }

    private Map<String, Long> contarPorEspecialidad(List<Turno> turnos) {
        Map<String, Long> conteo = new TreeMap<>();
        turnos.stream()
                .filter(t -> t.getEstado() != EstadoTurno.CANCELADO)
                .forEach(t -> conteo.merge(t.getEspecialidad().getNombre(), 1L, Long::sum));
        return conteo;
    }

    /**
     * Espera estimada promedio de quienes están en cola: en una cola de n
     * personas, la persona i espera i atenciones, así que el promedio es
     * (n - 1) / 2 atenciones. Se pondera por el tamaño de cada cola (especialidad).
     */
    private int calcularEsperaPromedio(List<Turno> turnos) {
        Map<Long, Long> enEsperaPorEspecialidad = new LinkedHashMap<>();
        turnos.stream()
                .filter(t -> t.getEstado() == EstadoTurno.EN_ESPERA)
                .forEach(t -> enEsperaPorEspecialidad.merge(t.getEspecialidad().getId(), 1L, Long::sum));

        long totalPersonas = 0;
        double totalMinutos = 0;
        for (long n : enEsperaPorEspecialidad.values()) {
            totalPersonas += n;
            totalMinutos += n * ((n - 1) / 2.0) * minutosPorAtencion;
        }
        return totalPersonas == 0 ? 0 : (int) Math.round(totalMinutos / totalPersonas);
    }
}