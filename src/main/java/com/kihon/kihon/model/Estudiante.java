package com.kihon.kihon.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "estudiantes")
public class Estudiante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * =========================================================
     * PERSONA
     * =========================================================
     *
     * Los datos personales pertenecen a Persona.
     */

    @OneToOne
    @JoinColumn(name = "persona_id", nullable = false, unique = true)
    private Persona persona;

    /*
     * =========================================================
     * DATOS ACADÉMICOS
     * =========================================================
     */

    @ManyToOne
    @JoinColumn(name = "cinturon_id", nullable = false)
    private Cinturon cinturon;

    /*
     * =========================================================
     * DATOS DEL ESTUDIANTE
     * =========================================================
     */

    @Column(name = "fecha_inscripcion", nullable = false)
    private LocalDateTime fechaInscripcion;

    @Column(name = "fecha_activacion")
    private LocalDateTime fechaActivacion;

    @Column(nullable = false)
    private String estado = "ACTIVO";

    /*
     * =========================================================
     * CONSTRUCTOR
     * =========================================================
     */

    public Estudiante() {
    }

    /*
     * =========================================================
     * GETTERS / SETTERS
     * =========================================================
     */

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Persona getPersona() {
        return persona;
    }

    public void setPersona(Persona persona) {
        this.persona = persona;
    }

    public Cinturon getCinturon() {
        return cinturon;
    }

    public void setCinturon(Cinturon cinturon) {
        this.cinturon = cinturon;
    }

    public LocalDateTime getFechaInscripcion() {
        return fechaInscripcion;
    }

    public void setFechaInscripcion(LocalDateTime fechaInscripcion) {
        this.fechaInscripcion = fechaInscripcion;
    }

    public LocalDateTime getFechaActivacion() {
        return fechaActivacion;
    }

    public void setFechaActivacion(LocalDateTime fechaActivacion) {
        this.fechaActivacion = fechaActivacion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    /*
     * =========================================================
     * PRE-PERSIST
     * =========================================================
     */

    @PrePersist
    protected void alCrear() {

        if (fechaInscripcion == null) {
            fechaInscripcion = LocalDateTime.now();
        }

        if (estado == null) {
            estado = "ACTIVO";
        }

        if (fechaActivacion == null
                && "ACTIVO".equalsIgnoreCase(estado)) {

            fechaActivacion = LocalDateTime.now();
        }
    }
}