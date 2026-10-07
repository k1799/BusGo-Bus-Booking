package com.busgo.busbooking.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
public class TestController {
    @GetMapping("/api/customer/test")
    public String customerTest() {

        return "Customer API access successful";
    }

    @GetMapping("/api/admin/test")
    public String adminTest() {

        return "Admin API access successful";
    }
}
