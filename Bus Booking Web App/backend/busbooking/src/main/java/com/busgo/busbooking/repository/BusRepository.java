package com.busgo.busbooking.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.busgo.busbooking.entity.Bus;

@Repository 
public interface BusRepository extends JpaRepository<Bus, Long> {
    Optional<Bus> findByBusNumber(String busNumber);

    boolean existsByBusNumber(String busNumber);
}
