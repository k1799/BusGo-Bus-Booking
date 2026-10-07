package com.busgo.busbooking.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.busgo.busbooking.dto.BookingResponse;
import com.busgo.busbooking.service.BookingService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/admin/bookings")
public class AdminBookingController {
    @Autowired
    BookingService bookingService;

    /*
     * Get all bookings
     */
    @GetMapping
    public List<BookingResponse> getAllBookings() {

        return bookingService.getAllBookings();
    }

    /*
     * Admin cancel booking
     */
    @PutMapping("/{id}/cancel")
    public BookingResponse cancelBooking(
            @PathVariable Long id) {

        return bookingService
                .cancelBookingByAdmin(id);
    }
}
