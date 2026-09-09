package com.kihon.kihon.dto;

public class EstudianteResponse {

    private Long id;
    private String nombre;
    private String apellido;
    private String documento;
    private String telefono;
    private String correo;
    private String estado;

    public EstudianteResponse() {
    }

    public EstudianteResponse(
            Long id,
            String nombre,
            String apellido,
            String documento,
            String telefono,
            String correo,
            String estado) {

        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.documento = documento;
        this.telefono = telefono;
        this.correo = correo;
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

    public String getDocumento() {
        return documento;
    }

    public String getTelefono() {
        return telefono;
    }

    public String getCorreo() {
        return correo;
    }

    public String getEstado() {
        return estado;
    }
}