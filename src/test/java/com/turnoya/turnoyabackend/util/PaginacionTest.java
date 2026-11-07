package com.turnoya.turnoyabackend.util;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import static org.junit.jupiter.api.Assertions.assertEquals;

class PaginacionTest {
    @Test
    void acotaPaginaNegativaYTamanioExcesivo() {
        PageRequest request = Paginacion.crear(-3, 5000, Sort.unsorted());

        assertEquals(0, request.getPageNumber());
        assertEquals(Paginacion.TAMANIO_MAXIMO, request.getPageSize());
    }

    @Test
    void tamanioMinimoEsUno() {
        PageRequest request = Paginacion.crear(2, 0, Sort.unsorted());

        assertEquals(2, request.getPageNumber());
        assertEquals(1, request.getPageSize());
    }
}
