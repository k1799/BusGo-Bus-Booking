package com.busgo.busbooking.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.busgo.busbooking.dto.AdminUserResponse;
import com.busgo.busbooking.dto.RegisterResponse;
import com.busgo.busbooking.service.UserService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/admin/users")
public class AdminUserController {
    @Autowired
    UserService userService;

    // Get all customer users
    @GetMapping
    public List<AdminUserResponse> getAllUsers() {

        return userService.getAllUsers();
    }

    // Get one customer
    @GetMapping("/{id}")
    public AdminUserResponse getUserById(
            @PathVariable Long id) {

        return userService.getUserById(id);
    }

    // Block customer
    @PutMapping("/{id}/block")
    public AdminUserResponse blockUser(
            @PathVariable Long id) {

        return userService.blockUser(id);
    }

    // Activate customer
    @PutMapping("/{id}/activate")
    public AdminUserResponse activateUser(
            @PathVariable Long id) {

        return userService.activateUser(id);
    }
}
