package com.turnoya.turnoyabackend.service.impl;

import com.turnoya.turnoyabackend.service.ColaStreamService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Guarda en memoria los suscriptores de cada cola. El evento solo dice "la
 * cola cambió": el cliente vuelve a pedir la cola por REST, así los permisos
 * y el formato de los datos siguen saliendo de un solo lugar.
 */
@Service
public class ColaStreamServiceImpl implements ColaStreamService {

    private static final Logger log = LoggerFactory.getLogger(ColaStreamServiceImpl.class);
    private static final long TIMEOUT_MS = 30 * 60 * 1000L;

    private final Map<String, List<SseEmitter>> suscriptores = new ConcurrentHashMap<>();

    @Override
    public SseEmitter suscribir(Long centroId, Long especialidadId) {
        String clave = clave(centroId, especialidadId);
        SseEmitter emitter = new SseEmitter(TIMEOUT_MS);
        suscriptores.computeIfAbsent(clave, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> quitar(clave, emitter));
        emitter.onTimeout(() -> quitar(clave, emitter));
        emitter.onError(error -> quitar(clave, emitter));

        enviar(clave, emitter, SseEmitter.event().name("conectado").data("ok"));
        return emitter;
    }

    @Override
    public void notificarCambio(Long centroId, Long especialidadId) {
        if (centroId == null || especialidadId == null) {
            return;
        }
        String clave = clave(centroId, especialidadId);
        List<SseEmitter> lista = suscriptores.getOrDefault(clave, List.of());
        log.debug("Avisando cambio de la cola {} a {} suscriptores", clave, lista.size());
        for (SseEmitter emitter : lista) {
            enviar(clave, emitter, SseEmitter.event().name("cola-actualizada").data(clave));
        }
    }

    /**
     * Comentario SSE cada 25 s para que proxies como Nginx no cierren la
     * conexión por inactividad.
     */
    @Scheduled(fixedRate = 25_000)
    public void enviarLatido() {
        suscriptores.forEach((clave, lista) ->
                lista.forEach(emitter -> enviar(clave, emitter, SseEmitter.event().comment("ping"))));
    }

    private void enviar(String clave, SseEmitter emitter, SseEmitter.SseEventBuilder evento) {
        try {
            emitter.send(evento);
        } catch (IOException | IllegalStateException ex) {
            quitar(clave, emitter);
        }
    }

    private void quitar(String clave, SseEmitter emitter) {
        List<SseEmitter> lista = suscriptores.get(clave);
        if (lista != null) {
            lista.remove(emitter);
        }
    }

    private String clave(Long centroId, Long especialidadId) {
        return centroId + "-" + especialidadId;
    }
}