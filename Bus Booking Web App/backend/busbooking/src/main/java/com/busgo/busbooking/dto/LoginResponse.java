package com.busgo.busbooking.dto;

import lombok.Data;

@Data 
public class LoginResponse {
    private String message;

    private String token;
    
    private Long id;

    private String name;

    private String email;

    private String role;
}
