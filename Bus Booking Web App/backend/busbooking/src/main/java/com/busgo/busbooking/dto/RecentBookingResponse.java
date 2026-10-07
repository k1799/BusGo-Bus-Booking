package com.busgo.busbooking.dto;

import lombok.Data;

@Data
public class RecentBookingResponse {
    private String bookingId;

    private String passengerName;

    private String busName;

    private Double totalAmount;
}
