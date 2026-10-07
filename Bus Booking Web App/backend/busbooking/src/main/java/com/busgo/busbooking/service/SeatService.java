package com.busgo.busbooking.service;

import java.util.HashSet;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.busgo.busbooking.dto.SeatResponse;
import com.busgo.busbooking.entity.Booking;
import com.busgo.busbooking.entity.Seat;
import com.busgo.busbooking.repository.BookingRepository;
import com.busgo.busbooking.repository.SeatRepository;



import java.util.Set;

@Service
public class SeatService {
    @Autowired
    SeatRepository seatRepository;

    @Autowired
    BookingRepository bookingRepository;

   public List<SeatResponse> getSeatsByBusId(Long busId, String journeyDate) {

        // 1. Get all 40 seats of the bus
        List<Seat> seats = seatRepository.findByBusId(busId);

        // 2. Get bookings only for this bus + journey date
        List<Booking> bookings =
                bookingRepository.findByBusIdAndJourneyDate(busId, journeyDate);

        // 3. Store booked seat numbers
        Set<String> bookedSeatNumbers = new HashSet<>();

        for (Booking booking : bookings) {

            // Cancelled booking should NOT block the seat
            if ("CANCELLED".equalsIgnoreCase(booking.getStatus())) {
                continue;
            }

            if (booking.getSeatNumbers() != null) {

                String[] seatNumbers =
                        booking.getSeatNumbers().split(",");

                for (String seatNumber : seatNumbers) {
                    bookedSeatNumbers.add(
                            seatNumber.trim().toUpperCase()
                    );
                }
            }
        }

        // 4. Convert seats to response
        return seats.stream()
                .map(seat -> convertToResponse(
                        seat,
                        bookedSeatNumbers
                ))
                .toList();
    }


    private SeatResponse convertToResponse(
            Seat seat,
            Set<String> bookedSeatNumbers) {

        SeatResponse response = new SeatResponse();

        response.setId(seat.getId());
        response.setBusId(seat.getBusId());
        response.setSeatNumber(seat.getSeatNumber());

        // Seat availability is now based on journey date
        if (bookedSeatNumbers.contains(
                seat.getSeatNumber().trim().toUpperCase())) {

            response.setStatus("BOOKED");

        } else {

            response.setStatus("AVAILABLE");
        }

        return response;
    }
}
