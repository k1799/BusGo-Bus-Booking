package com.busgo.busbooking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.busgo.busbooking.entity.Booking;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);

    List<Booking> findByBusId(Long busId);

    List<Booking> findByBusIdAndJourneyDate(Long busId, String journeyDate);

    long countByUserId(Long userId);

    // List<Booking> findByUserIdOrderByIdDesc(Long userId);
}
