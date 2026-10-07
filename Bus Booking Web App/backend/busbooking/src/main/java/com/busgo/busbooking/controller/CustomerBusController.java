package com.busgo.busbooking.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.busgo.busbooking.dto.BusResponse;
import com.busgo.busbooking.service.BusService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/customer/buses")
public class CustomerBusController {
     @Autowired
    BusService busService;

    @GetMapping
    public List<BusResponse> getAvailableBuses() {

        return busService.getAvailableBuses();
    }
}
