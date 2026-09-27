package com.kihon.kihon.model;

import jakarta.persistence.*;

@Entity
@Table(name = "apoderados")
public class Apoderado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * =========================================================
     * PERSONA
     * =========================================================
     *
     * Todos los datos personales pertenecen a Persona.
     */

    @OneToOne
    @JoinColumn(name = "persona_id", nullable = false, unique = true)
    private Persona persona;

    /*
     * =========================================================
     * CONSTRUCTOR
     * =========================================================
     */

    public Apoderado() {
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
}