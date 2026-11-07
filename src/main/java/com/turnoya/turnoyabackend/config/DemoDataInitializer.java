package com.turnoya.turnoyabackend.config;

import com.turnoya.turnoyabackend.entity.CentroSalud;
import com.turnoya.turnoyabackend.entity.Especialidad;
import com.turnoya.turnoyabackend.entity.EstadoTurno;
import com.turnoya.turnoyabackend.entity.NivelUrgencia;
import com.turnoya.turnoyabackend.entity.Paciente;
import com.turnoya.turnoyabackend.entity.PersonalSalud;
import com.turnoya.turnoyabackend.entity.RolUsuario;
import com.turnoya.turnoyabackend.entity.Triage;
import com.turnoya.turnoyabackend.entity.Turno;
import com.turnoya.turnoyabackend.entity.Usuario;
import com.turnoya.turnoyabackend.repository.CentroSaludRepository;
import com.turnoya.turnoyabackend.repository.EspecialidadRepository;
import com.turnoya.turnoyabackend.repository.PacienteRepository;
import com.turnoya.turnoyabackend.repository.PersonalSaludRepository;
import com.turnoya.turnoyabackend.repository.TurnoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;

/**
 * Carga datos de demostración (centros en Lima, un médico, pacientes y una
 * cola con turnos en espera) para la presentación. Solo corre si
 * {@code app.demo.enabled=true} y todavía no hay centros registrados.
 */
@Component
@Order(2)
public class DemoDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataInitializer.class);

    private final CentroSaludRepository centroSaludRepository;
    private final EspecialidadRepository especialidadRepository;
    private final PersonalSaludRepository personalSaludRepository;
    private final PacienteRepository pacienteRepository;
    private final TurnoRepository turnoRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean habilitado;

    public DemoDataInitializer(CentroSaludRepository centroSaludRepository,
            EspecialidadRepository especialidadRepository,
            PersonalSaludRepository personalSaludRepository,
            PacienteRepository pacienteRepository,
            TurnoRepository turnoRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.demo.enabled:false}") boolean habilitado) {
        this.centroSaludRepository = centroSaludRepository;
        this.especialidadRepository = especialidadRepository;
        this.personalSaludRepository = personalSaludRepository;
        this.pacienteRepository = pacienteRepository;
        this.turnoRepository = turnoRepository;
        this.passwordEncoder = passwordEncoder;
        this.habilitado = habilitado;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!habilitado || centroSaludRepository.count() > 0) {
            return;
        }
        List<Especialidad> especialidades = especialidadRepository.findAll();
        if (especialidades.isEmpty()) {
            return;
        }

        List<CentroSalud> centros = crearCentros(especialidades);
        crearMedico(especialidades);
        Paciente demo = crearPaciente("Paciente Demo", "paciente@turnoya.com", "Paciente123", "912345670", "70000001");
        crearColaDeEjemplo(centros.get(0), especialidades.get(0));
        crearHistorial(demo, centros.get(1), especialidades);

        log.info("Datos de demostración cargados (médico: medico@turnoya.com, paciente: paciente@turnoya.com)");
    }

    private List<CentroSalud> crearCentros(List<Especialidad> especialidades) {
        List<CentroSalud> centros = List.of(
                centro("Centro de Salud Barranco", "Av. Grau 450, Barranco", -12.1475, -77.0206, 60),
                centro("Centro de Salud Miraflores", "Av. Larco 1150, Miraflores", -12.1260, -77.0300, 80),
                centro("Posta Médica Surquillo", "Jr. Narciso de la Colina 220, Surquillo", -12.1135, -77.0125, 40),
                centro("Centro de Salud San Isidro", "Av. Petit Thouars 3200, San Isidro", -12.0975, -77.0350, 70),
                centro("Centro de Salud Chorrillos", "Av. Huaylas 1750, Chorrillos", -12.1700, -77.0150, 50)
        );
        centros.forEach(c -> c.setEspecialidades(new HashSet<>(especialidades)));
        return centroSaludRepository.saveAll(centros);
    }

    private CentroSalud centro(String nombre, String direccion, double lat, double lon, int capacidad) {
        return CentroSalud.builder()
                .nombre(nombre)
                .direccion(direccion)
                .latitud(lat)
                .longitud(lon)
                .capacidadDiaria(capacidad)
                .build();
    }

    private void crearMedico(List<Especialidad> especialidades) {
        Usuario usuario = Usuario.builder()
                .nombre("Dra. Ana Torres")
                .email("medico@turnoya.com")
                .passwordHash(passwordEncoder.encode("Medico12345"))
                .telefono("987654321")
                .rol(RolUsuario.MEDICO)
                .build();
        personalSaludRepository.save(PersonalSalud.builder()
                .usuario(usuario)
                .colegiatura("CMP-45821")
                .especialidades(new HashSet<>(especialidades))
                .build());
    }

    private Paciente crearPaciente(String nombre, String email, String password, String telefono, String dni) {
        Usuario usuario = Usuario.builder()
                .nombre(nombre)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .telefono(telefono)
                .rol(RolUsuario.PACIENTE)
                .build();
        return pacienteRepository.save(Paciente.builder()
                .usuario(usuario)
                .dni(dni)
                .fechaNacimiento(LocalDate.of(1998, 5, 14))
                .build());
    }

    /**
     * Cuatro pacientes ya en la sala de espera, con distinta urgencia, para que
     * el médico vea la cola ordenada apenas inicie sesión.
     */
    private void crearColaDeEjemplo(CentroSalud centro, Especialidad especialidad) {
        Object[][] datos = {
                {"Luis Ramírez", "70000011", NivelUrgencia.BAJO, "TOS,DOLOR_GARGANTA", 40},
                {"María Quispe", "70000012", NivelUrgencia.ALTO, "FIEBRE_ALTA,DOLOR_INTENSO", 30},
                {"Jorge Mendoza", "70000013", NivelUrgencia.MEDIO, "VOMITOS,MAREOS", 20},
                {"Carla Huamán", "70000014", NivelUrgencia.CRITICO, "DOLOR_PECHO,DIFICULTAD_RESPIRAR", 10},
        };
        int i = 1;
        for (Object[] fila : datos) {
            Paciente paciente = crearPaciente((String) fila[0], "demo" + i + "@turnoya.com", "Paciente123",
                    "91234567" + i, (String) fila[1]);
            NivelUrgencia nivel = (NivelUrgencia) fila[2];
            Turno turno = Turno.builder()
                    .paciente(paciente)
                    .centroSalud(centro)
                    .especialidad(especialidad)
                    .fechaHora(LocalDateTime.now().minusMinutes((Integer) fila[4]))
                    .estado(EstadoTurno.EN_ESPERA)
                    .prioridad(nivel.getPrioridad())
                    .build();
            turno.setTriage(Triage.builder()
                    .turno(turno)
                    .sintomas((String) fila[3])
                    .nivelUrgencia(nivel)
                    .build());
            turnoRepository.save(turno);
            i++;
        }
    }

    /**
     * Turnos pasados del paciente demo para que su historial y la paginación
     * tengan contenido.
     */
    private void crearHistorial(Paciente paciente, CentroSalud centro, List<Especialidad> especialidades) {
        for (int i = 1; i <= 12; i++) {
            Especialidad especialidad = especialidades.get(i % especialidades.size());
            turnoRepository.save(Turno.builder()
                    .paciente(paciente)
                    .centroSalud(centro)
                    .especialidad(especialidad)
                    .fechaHora(LocalDateTime.now().minusDays(i * 7L))
                    .estado(i % 4 == 0 ? EstadoTurno.CANCELADO : EstadoTurno.ATENDIDO)
                    .prioridad(0)
                    .build());
        }
    }
}
