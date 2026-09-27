package com.kihon.kihon.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "evidencias_asistencia")
public class EvidenciaAsistencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "justificacion_id", nullable = false)
    private JustificacionAsistencia justificacion;

    @Column(name = "nombre_archivo", nullable = false)
    private String nombreArchivo;

    @Column(name = "tipo_mime", nullable = false)
    private String tipoMime;

    @Column(name = "ruta_archivo", nullable = false)
    private String rutaArchivo;

    @Column(name = "fecha_subida", nullable = false)
    private LocalDateTime fechaSubida;

    public EvidenciaAsistencia() {
    }

    public Long getId() {
        return id;
    }

    public JustificacionAsistencia getJustificacion() {
        return justificacion;
    }

    public void setJustificacion(JustificacionAsistencia justificacion) {
        this.justificacion = justificacion;
    }

    public String getNombreArchivo() {
        return nombreArchivo;
    }

    public void setNombreArchivo(String nombreArchivo) {
        this.nombreArchivo = nombreArchivo;
    }

    public String getTipoMime() {
        return tipoMime;
    }

    public void setTipoMime(String tipoMime) {
        this.tipoMime = tipoMime;
    }

    public String getRutaArchivo() {
        return rutaArchivo;
    }

    public void setRutaArchivo(String rutaArchivo) {
        this.rutaArchivo = rutaArchivo;
    }

    public LocalDateTime getFechaSubida() {
        return fechaSubida;
    }

    public void setFechaSubida(LocalDateTime fechaSubida) {
        this.fechaSubida = fechaSubida;
    }
}