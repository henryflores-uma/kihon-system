package com.kihon.kihon.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
public class Usuario {

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
     * AUTENTICACIÓN
     * =========================================================
     */

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    /*
     * =========================================================
     * ESTADO
     * =========================================================
     *
     * PENDIENTE
     * ACTIVO
     * INACTIVO
     */

    @Column(nullable = false)
    private String estado = "PENDIENTE";

    /*
     * =========================================================
     * DATOS DEL SISTEMA
     * =========================================================
     */

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    @ManyToOne
    @JoinColumn(name = "rol_id", nullable = false)
    private Rol rol;

    /*
     * =========================================================
     * CONSTRUCTOR
     * =========================================================
     */

    public Usuario() {
    }

    /*
     * =========================================================
     * ID
     * =========================================================
     */

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    /*
     * =========================================================
     * PERSONA
     * =========================================================
     */

    public Persona getPersona() {
        return persona;
    }

    public void setPersona(Persona persona) {
        this.persona = persona;
    }

    /*
     * =========================================================
     * USERNAME
     * =========================================================
     */

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    /*
     * =========================================================
     * PASSWORD
     * =========================================================
     */

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    /*
     * =========================================================
     * ESTADO
     * =========================================================
     */

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    /*
     * =========================================================
     * FECHA DE REGISTRO
     * =========================================================
     */

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    /*
     * =========================================================
     * ROL
     * =========================================================
     */

    public Rol getRol() {
        return rol;
    }

    public void setRol(Rol rol) {
        this.rol = rol;
    }

    /*
     * =========================================================
     * PRE-PERSIST
     * =========================================================
     */

    @PrePersist
    protected void alCrear() {

        if (fechaRegistro == null) {
            fechaRegistro = LocalDateTime.now();
        }

        if (estado == null) {
            estado = "PENDIENTE";
        }
    }
}