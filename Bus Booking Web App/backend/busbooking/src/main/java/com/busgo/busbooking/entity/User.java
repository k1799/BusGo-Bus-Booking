package com.busgo.busbooking.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String email;

    private String phone;

    private String password;

    private String role;

    private String status;

    private LocalDateTime registeredAt;

    // New user create ஆகும்போது
    // current date/time automatically save ஆகும்
    @PrePersist
    public void setRegistrationDate() {

        if (registeredAt == null) {
            registeredAt = LocalDateTime.now();
        }
    }
}
