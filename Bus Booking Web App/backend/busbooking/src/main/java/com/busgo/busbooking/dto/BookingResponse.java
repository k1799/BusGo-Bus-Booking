package com.busgo.busbooking.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class BookingResponse {
    private Long id;

    private String bookingId;

    private Long userId;

    private Long busId;

    private String busName;

    private String busNumber;

    private String source;

    private String destination;

    private String departureTime;

    private String arrivalTime;

    private Double busFare;

    private String journeyDate;

    private LocalDateTime createdAt;

    private String passengerName;

    private String passengerPhone;

    private String passengerEmail;

    private String seatNumbers;

    private Integer seatCount;

    private Double baseAmount;

    private Double gstAmount;

    private Double totalAmount;

    private String status;

    private String paymentMethod;

    // New: all passengers in this booking
    private List<PassengerResponse> passengers;
}
