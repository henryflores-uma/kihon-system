package com.kihon.kihon.dto;

public class PerfilResponse {

    private Long id;
    private String username;
    private String nombre;
    private String apellido;
    private String tipoDocumento;
    private String numeroDocumento;
    private String telefono;
    private String fechaNacimiento;
    private String genero;
    private String correo;
    private String rol;
    private String estado;
    private String foto;
    private String fechaRegistro;

    public PerfilResponse() {
    }

    public PerfilResponse(
            Long id,
            String username,
            String nombre,
            String apellido,
            String tipoDocumento,
            String numeroDocumento,
            String telefono,
            String fechaNacimiento,
            String genero,
            String correo,
            String rol,
            String estado,
            String foto,
            String fechaRegistro) {

        this.id = id;
        this.username = username;
        this.nombre = nombre;
        this.apellido = apellido;
        this.tipoDocumento = tipoDocumento;
        this.numeroDocumento = numeroDocumento;
        this.telefono = telefono;
        this.fechaNacimiento = fechaNacimiento;
        this.genero = genero;
        this.correo = correo;
        this.rol = rol;
        this.estado = estado;
        this.foto = foto;
        this.fechaRegistro = fechaRegistro;
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

    public String getTipoDocumento() {
        return tipoDocumento;
    }

    public String getNumeroDocumento() {
        return numeroDocumento;
    }

    public String getTelefono() {
        return telefono;
    }

    public String getFechaNacimiento() {
        return fechaNacimiento;
    }

    public String getGenero() {
        return genero;
    }

    public String getCorreo() {
        return correo;
    }

    public String getRol() {
        return rol;
    }

    public String getEstado() {
        return estado;
    }

    public String getFoto() {
        return foto;
    }

    public String getFechaRegistro() {
        return fechaRegistro;
    }
}