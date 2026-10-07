package com.busgo.busbooking.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Table(name = "bookings")
@Data
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String bookingId;

    private Long userId;

    private Long busId;

    private String journeyDate;

    private LocalDateTime createdAt;
    
    /*
     * Existing fields are retained for now
     * to avoid losing compatibility with
     * existing booking data and screens.
     */
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
    
    /*
     * One booking can have many passengers.
     * Passenger records are saved along with
     * the booking.
     */
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Passenger> passengers = new ArrayList<>();
}
