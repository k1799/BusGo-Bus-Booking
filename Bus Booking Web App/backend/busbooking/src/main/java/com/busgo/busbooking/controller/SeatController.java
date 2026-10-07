package com.busgo.busbooking.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.busgo.busbooking.dto.SeatResponse;
import com.busgo.busbooking.service.SeatService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/customer/buses")
public class SeatController {
    @Autowired
    SeatService seatService;

    @GetMapping("/{busId}/seats")
    public List<SeatResponse> getSeats(
            @PathVariable Long busId,
            @RequestParam String journeyDate) {

        return seatService.getSeatsByBusId(
                busId,
                journeyDate);
    }
}
