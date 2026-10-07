package com.busgo.busbooking.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.busgo.busbooking.dto.BusRequest;
import com.busgo.busbooking.dto.BusResponse;
import com.busgo.busbooking.service.BusService;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/admin/buses")
public class BusController {
    @Autowired
    BusService busService;

    @PostMapping
    public BusResponse addBus(
            @Valid @RequestBody BusRequest request) {

        return busService.addBus(request);
    }

    @GetMapping
    public List<BusResponse> getAllBuses() {

        return busService.getAllBuses();
    }

    @GetMapping("/{id}")
    public BusResponse getBusById(
            @PathVariable Long id) {

        return busService.getBusById(id);
    }

    @PutMapping("/{id}")
    public BusResponse updateBus(
            @PathVariable Long id,
            @Valid @RequestBody BusRequest request) {

        return busService.updateBus(id, request);
    }

    @DeleteMapping("/{id}")
    public String deleteBus(
            @PathVariable Long id) {

        return busService.deleteBus(id);
    }
}
