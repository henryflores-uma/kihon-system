
package com.kihon.kihon.dto;

public class EstudianteDashboardResponse {

    private String nombre;
    private String apellido;
    private String foto;
    private String cinturon;
    private String estado;

    public EstudianteDashboardResponse(
            String nombre,
            String apellido,
            String foto,
            String cinturon,
            String estado) {

        this.nombre = nombre;
        this.apellido = apellido;
        this.foto = foto;
        this.cinturon = cinturon;
        this.estado = estado;
    }

    public String getNombre() {
        return nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public String getFoto() {
        return foto;
    }

    public String getCinturon() {
        return cinturon;
    }

    public String getEstado() {
        return estado;
    }
}
