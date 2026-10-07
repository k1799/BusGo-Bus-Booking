package com.busgo.busbooking.dto;

import java.util.List;

import lombok.Data;

@Data 
public class DashboardResponse {
     // Summary card values
    private Long totalBuses;

    private Long totalBookings;

    private Long totalUsers;

    private Long todayBookings;

    // Today's bus schedule
    private List<BusScheduleResponse> busSchedules;

    // Recent bookings
    private List<RecentBookingResponse> recentBookings;
}
