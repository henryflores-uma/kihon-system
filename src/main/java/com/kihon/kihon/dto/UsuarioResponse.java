package com.kihon.kihon.dto;

public class UsuarioResponse {

    private Long id;
    private String username;
    private String nombre;
    private String apellido;
    private String correo;
    private String rol;

    public UsuarioResponse() {
    }

    public UsuarioResponse(
            Long id,
            String username,
            String nombre,
            String apellido,
            String correo,
            String rol) {

        this.id = id;
        this.username = username;
        this.nombre = nombre;
        this.apellido = apellido;
        this.correo = correo;
        this.rol = rol;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getNombre() {
        return nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public String getCorreo() {
        return correo;
    }

    public String getRol() {
        return rol;
    }
}