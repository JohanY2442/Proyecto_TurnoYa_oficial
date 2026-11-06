package com.turnoya.turnoyabackend.mapper;

import com.turnoya.turnoyabackend.dto.centro.CentroCercanoResponse;
import com.turnoya.turnoyabackend.dto.centro.CentroSaludRequest;
import com.turnoya.turnoyabackend.dto.centro.CentroSaludResponse;
import com.turnoya.turnoyabackend.entity.CentroSalud;
import org.springframework.stereotype.Component;

@Component
public class CentroSaludMapper {

    private final EspecialidadMapper especialidadMapper;

    public CentroSaludMapper(EspecialidadMapper especialidadMapper) {
        this.especialidadMapper = especialidadMapper;
    }

    public CentroSalud toEntity(CentroSaludRequest request) {
        CentroSalud centro = new CentroSalud();
        updateEntity(centro, request);
        return centro;
    }

    public void updateEntity(CentroSalud centro, CentroSaludRequest request) {
        centro.setNombre(request.nombre());
        centro.setDireccion(request.direccion());
        centro.setLatitud(request.latitud());
        centro.setLongitud(request.longitud());
        centro.setCapacidadDiaria(request.capacidadDiaria());
    }

    public CentroSaludResponse toResponse(CentroSalud centro) {
        return new CentroSaludResponse(
                centro.getId(),
                centro.getNombre(),
                centro.getDireccion(),
                centro.getLatitud(),
                centro.getLongitud(),
                centro.getCapacidadDiaria(),
                especialidadMapper.toResponseList(centro.getEspecialidades())
        );
    }

    public CentroCercanoResponse toCercanoResponse(CentroSalud centro, double distanciaKm) {
        double redondeada = Math.round(distanciaKm * 100.0) / 100.0;
        return new CentroCercanoResponse(centro.getId(), centro.getNombre(), centro.getDireccion(),
                centro.getLatitud(), centro.getLongitud(), redondeada);
    }
}