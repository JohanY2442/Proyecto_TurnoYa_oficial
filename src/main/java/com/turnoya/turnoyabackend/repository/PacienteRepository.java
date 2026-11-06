package com.turnoya.turnoyabackend.repository;
import com.turnoya.turnoyabackend.entity.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PacienteRepository extends JpaRepository<Paciente, Long> {

    Optional<Paciente> findByUsuarioEmail(String email);

    boolean existsByDni(String dni);
}