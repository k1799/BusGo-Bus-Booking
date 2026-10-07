package com.busgo.busbooking.dto;

import lombok.Data;

@Data 
public class RegisterResponse {
     private Long id;

    private String name;

    private String email;

    private String phone;

    private String role;

    private String status;
}
