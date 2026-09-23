package com.kihon.kihon.model;

import jakarta.persistence.*;

@Entity
@Table(name = "grupos")
public class Grupo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre;

    @Column(nullable = false)
    private String descripcion;

    @Column(nullable = false)
    private Integer capacidad;

    @ManyToOne
    @JoinColumn(name = "sensei_id")
    private Usuario sensei;

    @ManyToOne
    @JoinColumn(name = "frecuencia_id")
    private FrecuenciaGrupo frecuencia;

    @Column(nullable = false)
    private String estado = "ACTIVO";

    public Grupo() {
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

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Integer getCapacidad() {
        return capacidad;
    }

    public void setCapacidad(Integer capacidad) {
        this.capacidad = capacidad;
    }

    public Usuario getSensei() {
        return sensei;
    }

    public void setSensei(Usuario sensei) {
        this.sensei = sensei;
    }

    public FrecuenciaGrupo getFrecuencia() {
        return frecuencia;
    }

    public void setFrecuencia(FrecuenciaGrupo frecuencia) {
        this.frecuencia = frecuencia;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}