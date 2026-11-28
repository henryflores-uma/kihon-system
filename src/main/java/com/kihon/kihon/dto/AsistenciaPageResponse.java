package com.kihon.kihon.dto;

import java.util.List;

public class AsistenciaPageResponse {

    private List<AsistenciaResponse> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;
    private ResumenAsistencia resumen;

    public AsistenciaPageResponse(
            List<AsistenciaResponse> content,
            int page,
            int size,
            long totalElements,
            int totalPages,
            boolean first,
            boolean last,
            ResumenAsistencia resumen) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.first = first;
        this.last = last;
        this.resumen = resumen;
    }

    public List<AsistenciaResponse> getContent() {
        return content;
    }

    public int getPage() {
        return page;
    }

    public int getSize() {
        return size;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public boolean isFirst() {
        return first;
    }

    public boolean isLast() {
        return last;
    }

    public ResumenAsistencia getResumen() {
        return resumen;
    }

    public static class ResumenAsistencia {
        private long total;
        private long presentes;
        private long tardanzas;
        private long ausencias;
        private long justificados;

        public ResumenAsistencia(
                long total,
                long presentes,
                long tardanzas,
                long ausencias,
                long justificados) {
            this.total = total;
            this.presentes = presentes;
            this.tardanzas = tardanzas;
            this.ausencias = ausencias;
            this.justificados = justificados;
        }

        public long getTotal() {
            return total;
        }

        public long getPresentes() {
            return presentes;
        }

        public long getTardanzas() {
            return tardanzas;
        }

        public long getAusencias() {
            return ausencias;
        }

        public long getJustificados() {
            return justificados;
        }
    }
}