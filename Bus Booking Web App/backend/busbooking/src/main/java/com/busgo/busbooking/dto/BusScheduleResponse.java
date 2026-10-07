package com.busgo.busbooking.dto;

import lombok.Data;

@Data
public class BusScheduleResponse {
    private String busName;

    private String busNumber;

    private String route;

    private String departureTime;

    private String arrivalTime;
    
    private Integer bookedSeats;

    private Integer totalSeats;

    private Integer occupancyPercentage;
}
