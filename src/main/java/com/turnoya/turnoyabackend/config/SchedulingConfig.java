package com.turnoya.turnoyabackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Habilita tareas programadas (latido de las conexiones SSE de la cola).
 */
@Configuration
@EnableScheduling
public class SchedulingConfig {
}