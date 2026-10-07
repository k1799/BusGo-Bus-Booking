package com.busgo.busbooking.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.busgo.busbooking.entity.Passenger;

@Repository 
public interface  PassengerRepository extends JpaRepository<Passenger, Long> {

}
