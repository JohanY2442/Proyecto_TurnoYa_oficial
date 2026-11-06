package com.turnoya.turnoyabackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class TurnoyaBackendApplication {

    public static void main(String[] args) {
        // Las fechas de los turnos son hora local de Lima. Sin esto, en un servidor
        // en UTC (como EC2) un turno para "hoy 10:00" se validaría como pasado.
        TimeZone.setDefault(TimeZone.getTimeZone(System.getenv().getOrDefault("APP_TIMEZONE", "America/Lima")));
        SpringApplication.run(TurnoyaBackendApplication.class, args);
    }

}