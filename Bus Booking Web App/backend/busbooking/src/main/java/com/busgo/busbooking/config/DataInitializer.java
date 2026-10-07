package com.busgo.busbooking.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.busgo.busbooking.entity.User;
import com.busgo.busbooking.repository.UserRepository;

@Configuration 
public class DataInitializer {
    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner createAdmin() {

        return args -> {

            if (!userRepository.existsByEmail("admin@busgo.com")) {

                User admin = new User();

                admin.setName("BusGo Admin");
                admin.setEmail("admin@busgo.com");
                admin.setPhone("9999999999");

                admin.setPassword(
                        passwordEncoder.encode("Admin@123")
                );

                admin.setRole("ADMIN");
                admin.setStatus("ACTIVE");

                userRepository.save(admin);

                System.out.println(
                        "BusGo Admin created successfully"
                );
            }
        };
    }
}
