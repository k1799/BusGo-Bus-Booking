
package com.busgo.busbooking.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.busgo.busbooking.dto.BookingRequest;
import com.busgo.busbooking.dto.BookingResponse;
import com.busgo.busbooking.dto.PassengerRequest;
import com.busgo.busbooking.dto.PassengerResponse;
import com.busgo.busbooking.entity.Booking;
import com.busgo.busbooking.entity.Bus;
import com.busgo.busbooking.entity.Passenger;
import com.busgo.busbooking.entity.Seat;
import com.busgo.busbooking.repository.BookingRepository;
import com.busgo.busbooking.repository.BusRepository;
import com.busgo.busbooking.repository.SeatRepository;

@Service
public class BookingService {

        @Autowired
        BookingRepository bookingRepository;

        @Autowired
        BusRepository busRepository;

        @Autowired
        SeatRepository seatRepository;

        /*
         * =========================================================
         * 1. CREATE BOOKING WITH MULTIPLE PASSENGERS
         * =========================================================
         */

        @Transactional
        public BookingResponse createBooking(
                        BookingRequest request,
                        Long userId) {

                // Check whether bus exists
                Bus bus = busRepository.findById(request.getBusId())
                                .orElseThrow(() -> new RuntimeException("Bus not found"));

                // Check passenger list
                List<PassengerRequest> passengerRequests = request.getPassengers();

                if (passengerRequests == null ||
                                passengerRequests.isEmpty()) {

                        throw new RuntimeException(
                                        "At least one passenger is required");
                }

                System.out.println("========== BOOKING DEBUG ==========");

                for (PassengerRequest passenger : passengerRequests) {
                        System.out.println("Seat: " + passenger.getSeatNumber());
                        System.out.println("Passenger Name: " + passenger.getName());
                }

                System.out.println("===================================");

                // Get all seats belonging to this bus once
                List<Seat> busSeats = seatRepository.findByBusId(bus.getId());

                List<Booking> dateBookings = bookingRepository.findByBusIdAndJourneyDate(
                                bus.getId(),
                                request.getJourneyDate());

                Set<String> bookedSeatNumbers = new HashSet<>();

                for (Booking existingBooking : dateBookings) {

                        if ("CANCELLED".equalsIgnoreCase(existingBooking.getStatus())) {
                                continue;
                        }

                        if (existingBooking.getSeatNumbers() != null) {

                                String[] seats = existingBooking.getSeatNumbers().split(",");

                                for (String seatNumber : seats) {
                                        bookedSeatNumbers.add(
                                                        seatNumber.trim().toUpperCase());
                                }
                        }
                }

                // Store selected seat numbers
                Set<String> selectedSeatNumbers = new HashSet<>();

                // Store matching seat entities
                List<Seat> selectedSeatEntities = new ArrayList<>();

                /*
                 * =====================================================
                 * 2. VALIDATE EACH PASSENGER AND SEAT
                 * =====================================================
                 */

                for (PassengerRequest passengerRequest : passengerRequests) {

                        String seatNumber = passengerRequest.getSeatNumber().trim();

                        // Prevent selecting the same seat twice
                        if (!selectedSeatNumbers.add(
                                        seatNumber.toUpperCase())) {

                                throw new RuntimeException(
                                                "Duplicate seat selected: " + seatNumber);
                        }

                        // Find seat in this bus
                        Seat seat = busSeats.stream()
                                        .filter(s -> s.getSeatNumber().equalsIgnoreCase(seatNumber))
                                        .findFirst()
                                        .orElseThrow(() -> new RuntimeException("Seat not found: " + seatNumber));

                        // Check seat availability
                        if (bookedSeatNumbers.contains(seatNumber.toUpperCase())) {
                                throw new RuntimeException(
                                                "Seat already booked for this journey date: " + seatNumber);
                        }

                        selectedSeatEntities.add(seat);
                }

                /*
                 * =====================================================
                 * 3. CALCULATE BOOKING AMOUNT
                 * =====================================================
                 */

                int seatCount = passengerRequests.size();

                double baseAmount = seatCount * bus.getFare();

                // BusGo booking GST = 5%
                double gstRate = 0.05;

                double gstAmount = baseAmount * gstRate;

                double totalAmount = baseAmount + gstAmount;
                /*
                 * =====================================================
                 * 4. CREATE BOOKING
                 * =====================================================
                 */

                Booking booking = new Booking();

                booking.setBookingId(
                                "BG" + System.currentTimeMillis());

                booking.setUserId(userId);

                booking.setBusId(bus.getId());

                booking.setJourneyDate(
                                request.getJourneyDate());

                booking.setCreatedAt(LocalDateTime.now());

                // Keep first passenger details in old fields
                // for compatibility with existing screens
                PassengerRequest firstPassenger = passengerRequests.get(0);

                booking.setPassengerName(
                                firstPassenger.getName());

                booking.setPassengerPhone(
                                firstPassenger.getPhone());

                booking.setPassengerEmail(
                                firstPassenger.getEmail());

                // Save all seat numbers as comma-separated text
                String seatNumbers = passengerRequests.stream()
                                .map(p -> p.getSeatNumber().trim())
                                .collect(Collectors.joining(","));

                booking.setSeatNumbers(seatNumbers);

                booking.setSeatCount(seatCount);

                booking.setBaseAmount(baseAmount);

                booking.setGstAmount(gstAmount);

                booking.setTotalAmount(totalAmount);

                booking.setStatus("CONFIRMED");

                booking.setPaymentMethod(request.getPaymentMethod());

                /*
                 * =====================================================
                 * 5. ADD PASSENGERS TO BOOKING
                 * =====================================================
                 */

                List<Passenger> passengers = new ArrayList<>();

                for (PassengerRequest passengerRequest : passengerRequests) {

                        Passenger passenger = new Passenger();

                        passenger.setBooking(booking);

                        passenger.setSeatNumber(
                                        passengerRequest.getSeatNumber().trim());

                        passenger.setName(
                                        passengerRequest.getName());

                        passenger.setAge(
                                        passengerRequest.getAge());

                        passenger.setGender(
                                        passengerRequest.getGender());

                        passenger.setPhone(
                                        passengerRequest.getPhone());

                        passenger.setEmail(
                                        passengerRequest.getEmail());

                        passengers.add(passenger);
                }

                booking.setPassengers(passengers);

                /*
                 * =====================================================
                 * 6. SAVE BOOKING AND PASSENGERS
                 * =====================================================
                 * 
                 * CascadeType.ALL in Booking.java
                 * saves passenger records with booking.
                 * =====================================================
                 */

                Booking savedBooking = bookingRepository.save(booking);

                /*
                 * =====================================================
                 * 7. MARK SELECTED SEATS AS BOOKED
                 * =====================================================
                 */

                for (Seat seat : selectedSeatEntities) {

                        seat.setStatus("BOOKED");

                        seatRepository.save(seat);
                }

                /*
                 * =====================================================
                 * 8. RETURN BOOKING RESPONSE
                 * =====================================================
                 */

                return convertToResponse(savedBooking);
        }

        /*
         * =========================================================
         * 9. GET BOOKINGS FOR LOGGED-IN CUSTOMER
         * =========================================================
         */

        @Transactional(readOnly = true)
        public List<BookingResponse> getMyBookings(Long userId) {

                return bookingRepository.findByUserId(userId)
                                .stream()
                                .map(this::convertToResponse)
                                .toList();

                // return bookingRepository.findAll(
                //                 org.springframework.data.domain.Sort.by(
                //                                 org.springframework.data.domain.Sort.Direction.DESC,
                //                                 "id"))
                //                 .stream()
                //                 .map(this::convertToResponse)
                //                 .toList();
        }

        /*
         * =========================================================
         * 10. CUSTOMER CANCEL BOOKING
         * =========================================================
         */

        @Transactional
        public BookingResponse cancelBooking(
                        Long bookingId,
                        Long userId) {

                // Find booking
                Booking booking = bookingRepository
                                .findById(bookingId)
                                .orElseThrow(() -> new RuntimeException("Booking not found"));

                // Check booking belongs to logged-in user
                if (!booking.getUserId().equals(userId)) {

                        throw new RuntimeException(
                                        "You cannot cancel this booking");
                }

                // Check booking status
                if ("CANCELLED".equalsIgnoreCase(
                                booking.getStatus())) {

                        throw new RuntimeException(
                                        "Booking is already cancelled");
                }

                // Release seats and update status
                releaseSeats(booking);

                booking.setStatus("CANCELLED");

                Booking updatedBooking = bookingRepository.save(booking);

                return convertToResponse(updatedBooking);
        }

        /*
         * =========================================================
         * 11. GET ALL BOOKINGS FOR ADMIN
         * =========================================================
         */

        @Transactional(readOnly = true)
        public List<BookingResponse> getAllBookings() {

                return bookingRepository.findAll()
                                .stream()
                                .map(this::convertToResponse)
                                .toList();
        }

        /*
         * =========================================================
         * 12. CONVERT BOOKING ENTITY TO RESPONSE
         * =========================================================
         */

        private BookingResponse convertToResponse(
                        Booking booking) {

                BookingResponse response = new BookingResponse();

                response.setId(booking.getId());

                response.setBookingId(
                                booking.getBookingId());

                response.setUserId(
                                booking.getUserId());

                response.setBusId(
                                booking.getBusId());

                // Get bus information
                busRepository.findById(
                                booking.getBusId()).ifPresent(bus -> {

                                        response.setBusName(
                                                        bus.getBusName());

                                        response.setBusNumber(
                                                        bus.getBusNumber());

                                        response.setSource(
                                                        bus.getSource());

                                        response.setDestination(
                                                        bus.getDestination());

                                        response.setDepartureTime(
                                                        bus.getDepartureTime());

                                        response.setArrivalTime(
                                                        bus.getArrivalTime());

                                        response.setBusFare(
                                                        bus.getFare());
                                });

                response.setJourneyDate(
                                booking.getJourneyDate());

                response.setCreatedAt(booking.getCreatedAt());

                // Retain old single-passenger fields
                response.setPassengerName(
                                booking.getPassengerName());

                response.setPassengerPhone(
                                booking.getPassengerPhone());

                response.setPassengerEmail(
                                booking.getPassengerEmail());

                response.setSeatNumbers(
                                booking.getSeatNumbers());

                response.setSeatCount(
                                booking.getSeatCount());

                response.setBaseAmount(booking.getBaseAmount());

                response.setGstAmount(booking.getGstAmount());

                response.setTotalAmount(
                                booking.getTotalAmount());

                response.setStatus(
                                booking.getStatus());

                response.setPaymentMethod(
                                booking.getPaymentMethod());

                /*
                 * Convert every passenger entity
                 * into PassengerResponse
                 */

                List<PassengerResponse> passengerResponses = booking.getPassengers()
                                .stream()
                                .map(passenger -> {

                                        PassengerResponse passengerResponse = new PassengerResponse();

                                        passengerResponse.setId(
                                                        passenger.getId());

                                        passengerResponse.setSeatNumber(
                                                        passenger.getSeatNumber());

                                        passengerResponse.setName(
                                                        passenger.getName());

                                        passengerResponse.setAge(
                                                        passenger.getAge());

                                        passengerResponse.setGender(
                                                        passenger.getGender());

                                        passengerResponse.setPhone(
                                                        passenger.getPhone());

                                        passengerResponse.setEmail(
                                                        passenger.getEmail());

                                        return passengerResponse;
                                })
                                .toList();

                response.setPassengers(passengerResponses);

                return response;
        }

        /*
         * =========================================================
         * 13. RELEASE SEATS
         * =========================================================
         * 
         * Used by customer and admin cancellation.
         * =========================================================
         */

        private void releaseSeats(Booking booking) {

                List<Seat> seats = seatRepository.findByBusId(
                                booking.getBusId());

                String[] bookedSeats = booking.getSeatNumbers().split(",");

                for (String seatNumber : bookedSeats) {

                        for (Seat seat : seats) {

                                if (seat.getSeatNumber()
                                                .equalsIgnoreCase(
                                                                seatNumber.trim())) {

                                        seat.setStatus("AVAILABLE");

                                        seatRepository.save(seat);

                                        break;
                                }
                        }
                }
        }

        /*
         * =========================================================
         * 14. ADMIN CANCEL BOOKING
         * =========================================================
         */

        @Transactional
        public BookingResponse cancelBookingByAdmin(
                        Long bookingId) {

                // Find booking
                Booking booking = bookingRepository
                                .findById(bookingId)
                                .orElseThrow(() -> new RuntimeException("Booking not found"));

                // Check current status
                if ("CANCELLED".equalsIgnoreCase(
                                booking.getStatus())) {

                        throw new RuntimeException(
                                        "Booking is already cancelled");
                }

                // Release seats
                releaseSeats(booking);

                // Update booking status
                booking.setStatus("CANCELLED");

                Booking updatedBooking = bookingRepository.save(booking);

                return convertToResponse(updatedBooking);
        }
}