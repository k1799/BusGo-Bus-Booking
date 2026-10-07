package com.busgo.busbooking.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data 
public class AdminUserResponse {
     private Long id;

    private String name;

    private String email;

    private String phone;

    private String role;

    private String status;

    private LocalDateTime registeredAt;

    private Integer totalBookings;

    private Integer upcomingBookings;

    private Integer completedBookings;

    private Integer cancelledBookings;
}
