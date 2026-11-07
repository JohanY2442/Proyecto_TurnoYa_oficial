package com.turnoya.turnoyabackend.repository;
import com.turnoya.turnoyabackend.entity.CentroSalud;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CentroSaludRepository extends JpaRepository<CentroSalud, Long> {

    List<CentroSalud> findByEspecialidadesId(Long especialidadId);

    Page<CentroSalud> findByNombreContainingIgnoreCase(String nombre, Pageable pageable);

    Page<CentroSalud> findByEspecialidadesIdAndNombreContainingIgnoreCase(Long especialidadId, String nombre,
            Pageable pageable);
}
