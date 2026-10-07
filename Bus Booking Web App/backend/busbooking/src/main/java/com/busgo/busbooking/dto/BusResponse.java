package com.busgo.busbooking.dto;

import lombok.Data;

@Data 
public class BusResponse {
    private Long id;
    private String busNumber;
    private String busName;
    private String source;
    private String destination;
    private String departureTime;
    private String arrivalTime;
    private Double fare;
    private Integer totalSeats;
    private String status;
}
