package com.busgo.busbooking.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.busgo.busbooking.dto.DashboardResponse;
import com.busgo.busbooking.service.DashboardService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/admin/dashboard")
public class DashboardController {
    @Autowired
    DashboardService dashboardService;

    @GetMapping
    public DashboardResponse getDashboardData() {

        return dashboardService.getDashboardData();
    }
}
