package com.busgo.busbooking.dto;

import java.util.List;

import jakarta.validation.Valid;
// import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
// import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class BookingRequest {
    // @NotNull(message = "Bus ID is required")
    // @Positive(message = "Bus ID must be greater than 0")
    // private Long busId;

    // @NotBlank(message = "Passenger name is required")
    // private String passengerName;

    // @NotBlank(message = "Passenger phone is required")
    // @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must contain 10
    // digits")
    // private String passengerPhone;

    // @NotBlank(message = "Passenger email is required")
    // @Email(message = "Enter a valid email")
    // private String passengerEmail;

    // @NotBlank(message = "Seat numbers are required")
    // private String seatNumbers;

    // @NotBlank(message = "Journey date is required")
    // private String journeyDate;

    // ithu ethuku na sear 1 or 5 kula ethana seat select panagalo atha vachu
    // passenger details vangurathu
    @NotNull(message = "Bus ID is required")
    @Positive(message = "Bus ID must be greater than 0")
    private Long busId;

    @NotBlank(message = "Journey date is required")
    private String journeyDate;

    @NotEmpty(message = "At least one passenger is required")
    @Valid
    private List<PassengerRequest> passengers;

    private String paymentMethod;
}
