package com.kihon.kihon.controller;

import com.kihon.kihon.dto.SenseiDashboardResponse;
import com.kihon.kihon.service.SenseiDashboardService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sensei")
public class SenseiController {

    private final SenseiDashboardService senseiDashboardService;

    public SenseiController(
            SenseiDashboardService senseiDashboardService) {

        this.senseiDashboardService = senseiDashboardService;
    }

    /*
     * =========================================================
     * DASHBOARD
     * =========================================================
     */

    @GetMapping("/dashboard")
    public ResponseEntity<SenseiDashboardResponse> obtenerDashboard(
            Authentication authentication) {

        SenseiDashboardResponse response = senseiDashboardService.obtenerDashboard(
                authentication.getName());

        return ResponseEntity.ok(response);
    }
}