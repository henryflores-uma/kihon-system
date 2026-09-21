package com.kihon.kihon.controller;

import com.kihon.kihon.service.SupabaseStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/test/storage")
public class StorageTestController {

    private final SupabaseStorageService storageService;

    public StorageTestController(
            SupabaseStorageService storageService) {

        this.storageService = storageService;
    }

    @GetMapping("/url")
    public ResponseEntity<?> generarUrl(
            @RequestParam String ruta) {

        try {

            String url = storageService.generarUrlFirmada(
                    ruta,
                    300);

            return ResponseEntity.ok(
                    Map.of(
                            "ruta",
                            ruta,
                            "url",
                            url));

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            Map.of(
                                    "error",
                                    e.getMessage()));
        }
    }
}