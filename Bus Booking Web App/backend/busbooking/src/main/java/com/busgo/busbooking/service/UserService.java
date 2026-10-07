package com.busgo.busbooking.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.busgo.busbooking.dto.AdminUserResponse;
import com.busgo.busbooking.dto.LoginRequest;
import com.busgo.busbooking.dto.LoginResponse;
import com.busgo.busbooking.dto.RegisterRequest;
import com.busgo.busbooking.entity.Booking;
import com.busgo.busbooking.entity.User;
import com.busgo.busbooking.repository.BookingRepository;
import com.busgo.busbooking.repository.UserRepository;
import com.busgo.busbooking.dto.RegisterResponse;

import com.busgo.busbooking.security.JwtService;

@Service
public class UserService {
    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    JwtService jwtService;

    @Autowired
    BookingRepository bookingRepository;

    public RegisterResponse registerUser(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());

        // Password encryption
        user.setPassword(
                passwordEncoder.encode(request.getPassword()));

        // Default values
        user.setRole("CUSTOMER");
        user.setStatus("ACTIVE");

        User savedUser = userRepository.save(user);

        RegisterResponse response = new RegisterResponse();

        response.setId(savedUser.getId());
        response.setName(savedUser.getName());
        response.setEmail(savedUser.getEmail());
        response.setPhone(savedUser.getPhone());
        response.setRole(savedUser.getRole());
        response.setStatus(savedUser.getStatus());

        return response;
    }

    public LoginResponse loginUser(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        boolean passwordMatch = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword());

        if (!passwordMatch) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole());

        LoginResponse response = new LoginResponse();

        response.setMessage("Login successful");
        response.setToken(token);
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());

        return response;
    }

    public Long getUserIdByEmail(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user.getId();
    }

    // public List<RegisterResponse> getAllUsers() {

    // return userRepository.findAll()
    // .stream()
    // .map(user -> {

    // RegisterResponse response = new RegisterResponse();

    // response.setId(user.getId());
    // response.setName(user.getName());
    // response.setEmail(user.getEmail());
    // response.setPhone(user.getPhone());
    // response.setRole(user.getRole());
    // response.setStatus(user.getStatus());

    // return response;
    // })
    // .toList();
    // }

    public List<AdminUserResponse> getAllUsers() {

        return userRepository.findByRole("CUSTOMER")
                .stream()
                .map(this::convertToAdminUserResponse)
                .toList();
    }

    public AdminUserResponse getUserById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"CUSTOMER".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("Customer not found");
        }

        return convertToAdminUserResponse(user);
    }

    public AdminUserResponse blockUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"CUSTOMER".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("Customer account cannot be blocked");
        }

        user.setStatus("BLOCKED");

        User updatedUser = userRepository.save(user);

        return convertToAdminUserResponse(updatedUser);
    }

    public AdminUserResponse activateUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"CUSTOMER".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("Customer account not found");
        }

        user.setStatus("ACTIVE");

        User updatedUser = userRepository.save(user);

        return convertToAdminUserResponse(updatedUser);
    }

    private AdminUserResponse convertToAdminUserResponse(User user) {

        AdminUserResponse response = new AdminUserResponse();

        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole());
        response.setStatus(user.getStatus());
        response.setRegisteredAt(user.getRegisteredAt());

        List<Booking> bookings = bookingRepository.findByUserId(user.getId());

        int total = bookings.size();
        int cancelled = 0;
        int upcoming = 0;
        int completed = 0;

        LocalDate today = LocalDate.now();

        for (Booking booking : bookings) {

            if ("CANCELLED".equalsIgnoreCase(
                    booking.getStatus())) {

                cancelled++;

                continue;
            }

            try {

                LocalDate journeyDate = LocalDate.parse(
                        booking.getJourneyDate());

                if (!journeyDate.isBefore(today)) {

                    upcoming++;

                } else {

                    completed++;
                }

            } catch (Exception e) {

                // Invalid/missing journey date
                // count is not classified
            }
        }

        response.setTotalBookings(total);
        response.setUpcomingBookings(upcoming);
        response.setCompletedBookings(completed);
        response.setCancelledBookings(cancelled);

        return response;
    }
}
