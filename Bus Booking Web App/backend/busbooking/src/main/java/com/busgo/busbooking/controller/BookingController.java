package com.busgo.busbooking.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.busgo.busbooking.dto.BookingRequest;
import com.busgo.busbooking.dto.BookingResponse;
import com.busgo.busbooking.service.BookingService;
import com.busgo.busbooking.service.UserService;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/customer/bookings")
public class BookingController {
    @Autowired
    BookingService bookingService;

    @Autowired
    UserService userService;

    @PostMapping
    public BookingResponse createBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication authentication) {

        // Get logged-in user's email from JWT
        String email = authentication.getName();

        // Get user ID from database
        Long userId = userService.getUserIdByEmail(email);

        // Create booking
        return bookingService.createBooking(
                request,
                userId);
    }

    @GetMapping
    public List<BookingResponse> getMyBookings(
            Authentication authentication) {

        // Get logged-in user's email from JWT
        String email = authentication.getName();

        // Get user ID from database
        Long userId = userService.getUserIdByEmail(email);

        // Get only this user's bookings
        return bookingService.getMyBookings(userId);
    }

    @PutMapping("/{bookingId}/cancel")
    public BookingResponse cancelBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {

        // Get logged-in user's email
        String email = authentication.getName();

        // Get user ID
        Long userId = userService.getUserIdByEmail(email);

        // Cancel booking
        return bookingService.cancelBooking(
                bookingId,
                userId);
    }
}
