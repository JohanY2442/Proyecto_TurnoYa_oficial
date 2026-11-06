package com.turnoya.turnoyabackend.util;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

public final class Paginacion {

    public static final int TAMANIO_MAXIMO = 100;

    private Paginacion() {
    }

    public static PageRequest crear(int page, int size, Sort sort) {
        int pagina = Math.max(page, 0);
        int tamanio = Math.min(Math.max(size, 1), TAMANIO_MAXIMO);
        return PageRequest.of(pagina, tamanio, sort);
    }
}
