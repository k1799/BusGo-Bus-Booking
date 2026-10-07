package com.busgo.busbooking.dto;

import lombok.Data;

@Data
public class PassengerResponse {
    private Long id;

    private String seatNumber;

    private String name;

    private Integer age;

    private String gender;

    private String phone;

    private String email;
}
