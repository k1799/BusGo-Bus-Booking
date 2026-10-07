package com.busgo.busbooking.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.busgo.busbooking.dto.BusScheduleResponse;
import com.busgo.busbooking.dto.DashboardResponse;
import com.busgo.busbooking.dto.RecentBookingResponse;
import com.busgo.busbooking.entity.Booking;
import com.busgo.busbooking.entity.Bus;
import com.busgo.busbooking.repository.BookingRepository;
import com.busgo.busbooking.repository.BusRepository;
import com.busgo.busbooking.repository.UserRepository;

@Service
public class DashboardService {

        @Autowired
        BusRepository busRepository;

        @Autowired
        BookingRepository bookingRepository;

        @Autowired
        UserRepository userRepository;

        public DashboardResponse getDashboardData() {

                // Get all buses
                List<Bus> buses = busRepository.findAll();

                // Get all bookings
                List<Booking> bookings = bookingRepository.findAll();

                // Create dashboard response
                DashboardResponse response = new DashboardResponse();

                // =========================================
                // SUMMARY CARDS
                // =========================================

                response.setTotalBuses(
                                busRepository.count());

                response.setTotalBookings(
                                bookingRepository.count());

                response.setTotalUsers(
                                userRepository.count());

                // =========================================
                // TODAY'S BOOKINGS
                // =========================================

                // String today =
                // LocalDate.now().toString();

                // long todayBookingCount =
                // bookings.stream()
                // .filter(booking ->
                // today.equals(
                // booking.getJourneyDate()
                // )
                // )
                // .filter(booking ->
                // "CONFIRMED".equalsIgnoreCase(
                // booking.getStatus()
                // )
                // )
                // .count();

                String today = LocalDate.now().toString();

                LocalDate todayDate = LocalDate.now();

                long todayBookingCount = bookings.stream()
                                .filter(booking -> booking.getCreatedAt() != null)
                                .filter(booking -> todayDate.equals(
                                                booking.getCreatedAt().toLocalDate()))
                                .filter(booking -> "CONFIRMED".equalsIgnoreCase(
                                                booking.getStatus()))
                                .count();

                response.setTodayBookings(
                                todayBookingCount);

                // =========================================
                // BUS SCHEDULE
                // =========================================

                List<BusScheduleResponse> busSchedules = new ArrayList<>();

                for (Bus bus : buses) {

                        BusScheduleResponse schedule = new BusScheduleResponse();

                        schedule.setBusName(
                                        bus.getBusName());

                        schedule.setBusNumber(
                                        bus.getBusNumber());

                        schedule.setRoute(
                                        bus.getSource()
                                                        + " → "
                                                        + bus.getDestination());

                        schedule.setDepartureTime(
                                        bus.getDepartureTime());

                        schedule.setArrivalTime(
                                        bus.getArrivalTime());

                        schedule.setTotalSeats(
                                        bus.getTotalSeats());

                        // Count today's confirmed booked seats
                        int bookedSeats = bookings.stream()
                                        .filter(booking -> booking.getBusId()
                                                        .equals(bus.getId()))
                                        .filter(booking -> today.equals(
                                                        booking.getJourneyDate()))
                                        .filter(booking -> "CONFIRMED".equalsIgnoreCase(
                                                        booking.getStatus()))
                                        .mapToInt(
                                                        Booking::getSeatCount)
                                        .sum();

                        schedule.setBookedSeats(
                                        bookedSeats);

                        // Calculate occupancy percentage
                        int occupancyPercentage = 0;

                        if (bus.getTotalSeats() != null &&
                                        bus.getTotalSeats() > 0) {

                                occupancyPercentage = (bookedSeats * 100)
                                                / bus.getTotalSeats();
                        }

                        schedule.setOccupancyPercentage(
                                        occupancyPercentage);

                        busSchedules.add(schedule);
                }

                response.setBusSchedules(
                                busSchedules);

                // =========================================
                // RECENT BOOKINGS
                // =========================================

                List<RecentBookingResponse> recentBookings = new ArrayList<>();

                bookings.stream()
                                .sorted(
                                                Comparator.comparing(
                                                                Booking::getId).reversed())
                                .limit(5)
                                .forEach(booking -> {

                                        RecentBookingResponse recent = new RecentBookingResponse();

                                        recent.setBookingId(
                                                        booking.getBookingId());

                                        recent.setPassengerName(
                                                        booking.getPassengerName());

                                        // Find bus name
                                        buses.stream()
                                                        .filter(bus -> bus.getId()
                                                                        .equals(
                                                                                        booking.getBusId()))
                                                        .findFirst()
                                                        .ifPresent(bus -> recent.setBusName(
                                                                        bus.getBusName()));

                                        recent.setTotalAmount(
                                                        booking.getTotalAmount());

                                        recentBookings.add(
                                                        recent);
                                });

                response.setRecentBookings(
                                recentBookings);

                return response;
        }
}
