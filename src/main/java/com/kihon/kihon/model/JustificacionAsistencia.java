package com.kihon.kihon.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "justificaciones_asistencia", uniqueConstraints = {
        @UniqueConstraint(name = "uq_justificacion_asistencia", columnNames = "asistencia_id")
})
public class JustificacionAsistencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "asistencia_id", nullable = false, unique = true)
    private Asistencia asistencia;

    @ManyToOne
    @JoinColumn(name = "motivo_id", nullable = false)
    private MotivoJustificacion motivo;

    @Column
    private String descripcion;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    @ManyToOne
    @JoinColumn(name = "registrado_por", nullable = false)
    private Usuario registradoPor;

    public JustificacionAsistencia() {
    }

    public Long getId() {
        return id;
    }

    public Asistencia getAsistencia() {
        return asistencia;
    }

    public void setAsistencia(Asistencia asistencia) {
        this.asistencia = asistencia;
    }

    public MotivoJustificacion getMotivo() {
        return motivo;
    }

    public void setMotivo(MotivoJustificacion motivo) {
        this.motivo = motivo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    public Usuario getRegistradoPor() {
        return registradoPor;
    }

    public void setRegistradoPor(Usuario registradoPor) {
        this.registradoPor = registradoPor;
    }
}