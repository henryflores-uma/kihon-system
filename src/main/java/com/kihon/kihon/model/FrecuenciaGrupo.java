package com.kihon.kihon.model;

import jakarta.persistence.*;

@Entity
@Table(name = "frecuencias_grupo")
public class FrecuenciaGrupo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre;

    @Column(name = "frecuencia_semanal", nullable = false, unique = true)
    private Integer frecuenciaSemanal;

    public FrecuenciaGrupo() {
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

    public Integer getFrecuenciaSemanal() {
        return frecuenciaSemanal;
    }

    public void setFrecuenciaSemanal(Integer frecuenciaSemanal) {
        this.frecuenciaSemanal = frecuenciaSemanal;
    }
}