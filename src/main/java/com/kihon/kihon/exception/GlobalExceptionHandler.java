package com.kihon.kihon.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /*
     * =========================================================
     * RECURSO NO ENCONTRADO
     * =========================================================
     */

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<Map<String, String>> manejarRecursoNoEncontrado(
            RecursoNoEncontradoException exception) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of(
                        "mensaje",
                        exception.getMessage()));
    }

    /*
     * =========================================================
     * DATO DUPLICADO
     * =========================================================
     */

    @ExceptionHandler(DatoDuplicadoException.class)
    public ResponseEntity<Map<String, String>> manejarDatoDuplicado(
            DatoDuplicadoException exception) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "mensaje",
                        exception.getMessage()));
    }

    /*
     * =========================================================
     * VALIDACIÓN DE NEGOCIO
     * =========================================================
     */

    @ExceptionHandler(ValidacionException.class)
    public ResponseEntity<Map<String, String>> manejarValidacion(
            ValidacionException exception) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "mensaje",
                        exception.getMessage()));
    }

    /*
     * =========================================================
     * EXCEPCIONES NO CONTROLADAS
     * =========================================================
     */

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> manejarRuntimeException(
            RuntimeException exception) {

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "mensaje",
                        "Ocurrió un error interno en el servidor."));
    }
}