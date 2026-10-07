package com.busgo.busbooking.dto;

import lombok.Data;

@Data
public class SeatResponse {
   private Long id;

    private Long busId;

    private String seatNumber;

    private String status; 
}
