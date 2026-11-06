package com.turnoya.turnoyabackend.repository;
import com.turnoya.turnoyabackend.entity.Triage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TriageRepository extends JpaRepository<Triage, Long> {

    Optional<Triage> findByTurnoId(Long turnoId);

    boolean existsByTurnoId(Long turnoId);
}