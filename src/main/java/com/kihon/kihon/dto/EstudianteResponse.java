package com.kihon.kihon.dto;

import java.time.LocalDate;

public class EstudianteResponse {

    private Long id;
    private String nombre;
    private String apellido;
    private String tipoDocumento;
    private String documento;
    private String telefono;
    private String correo;
    private LocalDate fechaNacimiento;
    private String direccion;
    private String foto;
    private String estado;

    public EstudianteResponse() {
    }

    public EstudianteResponse(
            Long id,
            String nombre,
            String apellido,
            String tipoDocumento,
            String documento,
            String telefono,
            String correo,
            LocalDate fechaNacimiento,
            String direccion,
            String foto,
            String estado) {

        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.tipoDocumento = tipoDocumento;
        this.documento = documento;
        this.telefono = telefono;
        this.correo = correo;
        this.fechaNacimiento = fechaNacimiento;
        this.direccion = direccion;
        this.foto = foto;
        this.estado = estado;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public String getTipoDocumento() {
        return tipoDocumento;
    }

    public String getDocumento() {
        return documento;
    }

    public String getTelefono() {
        return telefono;
    }

    public String getCorreo() {
        return correo;
    }

    public LocalDate getFechaNacimiento() {
        return fechaNacimiento;
    }

    public String getDireccion() {
        return direccion;
    }

    public String getFoto() {
        return foto;
    }

    public String getEstado() {
        return estado;
    }
}