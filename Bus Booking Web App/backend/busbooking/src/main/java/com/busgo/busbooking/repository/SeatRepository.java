package com.busgo.busbooking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.busgo.busbooking.entity.Seat;

@Repository 
public interface  SeatRepository extends JpaRepository<Seat, Long> {
     List<Seat> findByBusId(Long busId);
      void deleteByBusId(Long busId);
}
