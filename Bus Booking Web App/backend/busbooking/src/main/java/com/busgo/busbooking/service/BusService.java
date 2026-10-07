package com.busgo.busbooking.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.busgo.busbooking.dto.BusRequest;
import com.busgo.busbooking.dto.BusResponse;
import com.busgo.busbooking.entity.Bus;
import com.busgo.busbooking.repository.BusRepository;

import com.busgo.busbooking.entity.Seat;
import com.busgo.busbooking.repository.SeatRepository;

@Service
public class BusService {
    @Autowired
    BusRepository busRepository;

    @Autowired
    SeatRepository seatRepository;

    // public BusResponse addBus(BusRequest request) {

    // if (busRepository.count() >= 3) {

    // throw new RuntimeException(
    // "Maximum 3 buses are allowed");
    // }

    // if (busRepository.existsByBusNumber(request.getBusNumber())) {

    // throw new RuntimeException(
    // "Bus number already exists");
    // }

    // Bus bus = new Bus();

    // bus.setBusNumber(request.getBusNumber());
    // bus.setBusName(request.getBusName());
    // bus.setSource(request.getSource());
    // bus.setDestination(request.getDestination());
    // bus.setDepartureTime(request.getDepartureTime());
    // bus.setArrivalTime(request.getArrivalTime());
    // bus.setFare(request.getFare());
    // bus.setTotalSeats(request.getTotalSeats());
    // bus.setStatus(request.getStatus());

    // Bus savedBus = busRepository.save(bus);

    // return convertToResponse(savedBus);
    // }

    public BusResponse addBus(BusRequest request) {

        if (busRepository.count() >= 3) {

            throw new RuntimeException(
                    "Maximum 3 buses are allowed");
        }

        if (busRepository.existsByBusNumber(
                request.getBusNumber())) {

            throw new RuntimeException(
                    "Bus number already exists");
        }

        Bus bus = new Bus();

        bus.setBusNumber(request.getBusNumber());
        bus.setBusName(request.getBusName());
        bus.setSource(request.getSource());
        bus.setDestination(request.getDestination());
        bus.setDepartureTime(request.getDepartureTime());
        bus.setArrivalTime(request.getArrivalTime());
        bus.setFare(request.getFare());
        bus.setTotalSeats(request.getTotalSeats());
        bus.setStatus(request.getStatus());

        Bus savedBus = busRepository.save(bus);

        createSeats(
                savedBus.getId(),
                savedBus.getTotalSeats());

        return convertToResponse(savedBus);
    }

    public List<BusResponse> getAllBuses() {

        return busRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    private BusResponse convertToResponse(Bus bus) {

        BusResponse response = new BusResponse();

        response.setId(bus.getId());
        response.setBusNumber(bus.getBusNumber());
        response.setBusName(bus.getBusName());
        response.setSource(bus.getSource());
        response.setDestination(bus.getDestination());
        response.setDepartureTime(bus.getDepartureTime());
        response.setArrivalTime(bus.getArrivalTime());
        response.setFare(bus.getFare());
        response.setTotalSeats(bus.getTotalSeats());
        response.setStatus(bus.getStatus());

        return response;
    }

    public BusResponse getBusById(Long id) {

        Bus bus = busRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bus not found"));

        return convertToResponse(bus);
    }

    public BusResponse updateBus(
            Long id,
            BusRequest request) {

        Bus bus = busRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bus not found"));

        bus.setBusNumber(request.getBusNumber());
        bus.setBusName(request.getBusName());
        bus.setSource(request.getSource());
        bus.setDestination(request.getDestination());
        bus.setDepartureTime(request.getDepartureTime());
        bus.setArrivalTime(request.getArrivalTime());
        bus.setFare(request.getFare());
        bus.setTotalSeats(request.getTotalSeats());
        bus.setStatus(request.getStatus());

        Bus updatedBus = busRepository.save(bus);

        return convertToResponse(updatedBus);
    }

    // public String deleteBus(Long id) {

    // Bus bus = busRepository.findById(id)
    // .orElseThrow(() -> new RuntimeException("Bus not found"));

    // busRepository.delete(bus);

    // return "Bus deleted successfully";
    // }

    public String deleteBus(Long id) {

        Bus bus = busRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bus not found"));

        // Delete seats belonging to this bus
        seatRepository.deleteByBusId(bus.getId());

        // Delete bus
        busRepository.delete(bus);

        return "Bus and its seats deleted successfully";
    }

    public List<BusResponse> getAvailableBuses() {

        return busRepository.findAll()
                .stream()
                .filter(bus -> "ACTIVE".equalsIgnoreCase(
                        bus.getStatus()))
                .map(this::convertToResponse)
                .toList();
    }

    private void createSeats(
            Long busId,
            Integer totalSeats) {

        for (int i = 1; i <= totalSeats; i++) {

            Seat seat = new Seat();

            seat.setBusId(busId);

            seat.setSeatNumber("S" + i);

            seat.setStatus("AVAILABLE");

            seatRepository.save(seat);
        }
    }
}
