package com.kihon.kihon.model;

import jakarta.persistence.*;

@Entity
@Table(name = "motivos_justificacion", uniqueConstraints = {
        @UniqueConstraint(name = "uq_motivo_justificacion_nombre", columnNames = "nombre")
})
public class MotivoJustificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre;

    public MotivoJustificacion() {
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}