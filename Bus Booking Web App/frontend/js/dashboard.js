/*
=========================================================
BUSGO - ADMIN DASHBOARD JAVASCRIPT

This file handles:

1. Admin authentication check
2. Dashboard data loading from Spring Boot
3. Summary cards
4. Today's bus schedule
5. Recent bookings
6. Admin logout
=========================================================
*/


/* =========================================================
   1. CHECK ADMIN LOGIN
   ========================================================= */

/*
   Admin login successful ah iruntha:

   token
   userRole
   userName
   userEmail

   localStorage la irukkum.

   Token illa / ADMIN illa na
   Admin Login page-ku redirect pannuvom.
*/

const token = localStorage.getItem("token");
const userRole = localStorage.getItem("userRole");


if (!token || userRole !== "ADMIN") {

    window.location.href = "admin-login.html";

}


/* =========================================================
   2. GET HTML ELEMENTS
   ========================================================= */

const totalBuses =
    document.getElementById("totalBuses");

const totalBookings =
    document.getElementById("totalBookings");

const totalUsers =
    document.getElementById("totalUsers");

const todayBookings =
    document.getElementById("todayBookings");

const busScheduleList =
    document.getElementById("busScheduleList");

const recentBookings =
    document.getElementById("recentBookings");


/* =========================================================
   3. LOAD DASHBOARD DATA
   ========================================================= */

async function loadDashboardData() {

    try {

        /*
           Send JWT token to backend.

           Backend:
           GET /api/admin/dashboard

           SecurityConfig:
           /api/admin/** → ADMIN only
        */

        const response =
            await fetch(
                "http://localhost:8080/api/admin/dashboard",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        /* =================================================
           4. CHECK AUTHORIZATION
           ================================================= */

        /*
           401 / 403 means token problem
           or user is not allowed.
        */

        if (response.status === 401 ||
            response.status === 403) {

            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("userName");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userRole");

            window.location.href =
                "admin-login.html";

            return;
        }


        /* =================================================
           5. CHECK OTHER SERVER ERROR
           ================================================= */

        if (!response.ok) {

            throw new Error(
                "Failed to load dashboard data"
            );

        }


        /* =================================================
           6. CONVERT RESPONSE TO JSON
           ================================================= */

        const data =
            await response.json();


        console.log(
            "Dashboard Data:",
            data
        );


        /* =================================================
           7. UPDATE SUMMARY CARDS
           ================================================= */

        totalBuses.textContent =
            data.totalBuses;

        totalBookings.textContent =
            data.totalBookings;

        totalUsers.textContent =
            data.totalUsers;

        todayBookings.textContent =
            data.todayBookings;


        /* =================================================
           8. DISPLAY BUS SCHEDULE
           ================================================= */

        displayBusSchedules(
            data.busSchedules
        );


        /* =================================================
           9. DISPLAY RECENT BOOKINGS
           ================================================= */

        displayRecentBookings(
            data.recentBookings
        );


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        /*
           If backend is not running
           or connection problem.
        */

        busScheduleList.innerHTML = `
            <div class="dashboard-empty">
                Unable to load bus schedule.
            </div>
        `;


        recentBookings.innerHTML = `
            <div class="dashboard-empty">
                Unable to load recent bookings.
            </div>

            <a
                href="bookings.html"
                class="view-all-link">
                View All Bookings
            </a>
        `;

    }

}


/* =========================================================
   10. DISPLAY BUS SCHEDULES
   ========================================================= */

function displayBusSchedules(
    busSchedules
) {

    /*
       Remove old content first.
    */

    busScheduleList.innerHTML = "";


    /*
       If no buses are available.
    */

    if (!busSchedules ||
        busSchedules.length === 0) {

        busScheduleList.innerHTML = `
            <div class="dashboard-empty">
                No buses available for today.
            </div>
        `;

        return;
    }


    /*
       Create one UI block
       for every bus.
    */

    busSchedules.forEach(
        function (bus) {

            const busItem =
                document.createElement("div");

            busItem.className =
                "bus-schedule-item";


            /*
               Prevent percentage from
               going above 100.
            */

            const occupancy =
                Math.min(
                    bus.occupancyPercentage,
                    100
                );


            busItem.innerHTML = `

                <!-- Bus information -->

                <div class="schedule-bus-info">

                    <strong>
                        ${bus.busName}
                    </strong>

                    <span>
                        ${bus.busNumber}
                    </span>

                    <span>
                        ${bus.route}
                    </span>

                </div>



               <!-- Departure and Arrival time -->

                <div class="schedule-time">

                    <strong>
                        ${bus.departureTime}
                    </strong>

                    <span>
                        Departure
                    </span>

                    <strong>
                        ${bus.arrivalTime}
                    </strong>

                    <span>
                        Arrival
                    </span>

                </div>

                <!-- Seat occupancy -->

                <div class="seat-occupancy">

                    <strong>
                        ${bus.bookedSeats}/${bus.totalSeats}
                    </strong>

                    <span>
                        Seats Booked
                    </span>

                    <div class="occupancy-bar">

                        <div
                            class="occupancy-progress"
                            style="width: ${occupancy}%;">
                        </div>

                    </div>

                </div>

            `;


            busScheduleList.appendChild(
                busItem
            );

        }
    );

}


/* =========================================================
   11. DISPLAY RECENT BOOKINGS
   ========================================================= */

function displayRecentBookings(
    bookings
) {

    /*
       Remove old content.
    */

    recentBookings.innerHTML = "";


    /*
       If no bookings exist.
    */

    if (!bookings ||
        bookings.length === 0) {

        recentBookings.innerHTML = `
            <div class="dashboard-empty">
                No recent bookings found.
            </div>
        `;

        addViewAllBookingsLink();

        return;
    }


    /*
       Display each recent booking.
    */

    bookings.forEach(
        function (booking) {

            const bookingItem =
                document.createElement("div");

            bookingItem.className =
                "recent-booking-item";


            bookingItem.innerHTML = `

                <!-- Booking information -->

                <div class="recent-booking-info">

                    <strong>
                        ${booking.passengerName}
                    </strong>

                    <span>
                        ${booking.bookingId}
                    </span>

                    <span>
                        ${booking.busName}
                    </span>

                </div>


                <!-- Booking amount -->

                <div class="recent-booking-amount">

                    ₹${booking.totalAmount}

                </div>

            `;


            recentBookings.appendChild(
                bookingItem
            );

        }
    );


    /*
       View All Bookings link
       should remain at bottom.
    */

    addViewAllBookingsLink();

}


/* =========================================================
   12. VIEW ALL BOOKINGS LINK
   ========================================================= */

function addViewAllBookingsLink() {

    const viewAllLink =
        document.createElement("a");

    viewAllLink.href =
        "bookings.html";

    viewAllLink.className =
        "view-all-link";

    viewAllLink.textContent =
        "View All Bookings";


    recentBookings.appendChild(
        viewAllLink
    );

}


/* =========================================================
   13. LOGOUT
   ========================================================= */

const logoutLink =
    document.querySelector(
        ".admin-nav a.logout"
    );


if (logoutLink) {

    logoutLink.addEventListener(
        "click",
        function (event) {

            /*
               Stop normal navigation.
            */

            event.preventDefault();


            const logoutConfirm =
                confirm(
                    "Are you sure you want to logout?"
                );


            /*
               Cancel → stay on dashboard.
            */

            if (!logoutConfirm) {

                return;

            }


            /*
               Remove all login information.
            */

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "userId"
            );

            localStorage.removeItem(
                "userName"
            );

            localStorage.removeItem(
                "userEmail"
            );

            localStorage.removeItem(
                "userRole"
            );


            /*
               Go to admin login.
            */

            window.location.href =
                "admin-login.html";

        }
    );

}


/* =========================================================
   14. LOAD DASHBOARD
   ========================================================= */

/*
   Page open aana immediately
   backend dashboard API call pannum.
*/

loadDashboardData();