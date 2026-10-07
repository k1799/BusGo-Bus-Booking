/*
=========================================================
BUSGO - MY BOOKINGS PAGE JAVASCRIPT

This file handles:

1. Get logged-in user's bookings from backend
2. Display upcoming booking
3. Display booking history
4. View ticket
5. Cancel booking
6. Handle no-booking message

Backend APIs:

GET
/api/customer/bookings

PUT
/api/customer/bookings/{bookingId}/cancel
=========================================================
*/


/*
=========================================================
1. GET LOGIN TOKEN
=========================================================
*/

const token =
    localStorage.getItem("token");


/*
=========================================================
2. CHECK LOGIN
=========================================================
*/

if (!token) {

    alert("Please login first.");

    window.location.href =
        "login.html";
}


/*
=========================================================
3. GET HTML ELEMENTS
=========================================================
*/

const bookingHistoryBody =
    document.getElementById(
        "bookingHistoryBody"
    );

const noBookingMessage =
    document.getElementById(
        "noBookingMessage"
    );


/*
=========================================================
4. LOAD MY BOOKINGS
=========================================================
*/

loadMyBookings();


async function loadMyBookings() {
    try {
        const response = await fetch(
            "http://localhost:8080/api/customer/bookings",
            {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert("Session expired. Please login again.");
                localStorage.clear();
                window.location.href = "login.html";
                return;
            }

            throw new Error("Failed to load bookings");
        }

        const bookings = await response.json();

        console.log("MY BOOKINGS API RESPONSE:", bookings);
        console.log("LAST BOOKING:", bookings[bookings.length - 1]);
        if (bookings.length === 0) {
            showNoBookings();
            return;
        }




        // Compare journey date + departure time with current time
        const now = new Date();

        function isUpcoming(booking) {
            if (
                booking.status !== "CONFIRMED" ||
                !booking.journeyDate ||
                !booking.departureTime
            ) {
                return false;
            }

            const dateTime = new Date(
                booking.journeyDate + "T" +
                booking.departureTime.substring(0, 5) +
                ":00"
            );

            return dateTime > now;
        }

        const upcomingBookings = bookings
            .filter(isUpcoming)
            .sort(function (a, b) {
                const dateA = new Date(
                    a.journeyDate + "T" +
                    a.departureTime.substring(0, 5) + ":00"
                );

                const dateB = new Date(
                    b.journeyDate + "T" +
                    b.departureTime.substring(0, 5) + ":00"
                );

                return dateA - dateB || b.id - a.id;
            });

        const historyBookings = bookings.filter(function (booking) {
            return !isUpcoming(booking);
            //     return !isUpcoming(booking) ||
            //    booking.id !== upcomingBookings[0]?.id;
        });

        // Show the nearest upcoming journey
        if (upcomingBookings.length > 0) {

            const upcomingSection = document.querySelector(".upcoming-booking");

            if (upcomingSection) {
                upcomingSection.style.display = "block";
            }

            displayUpcomingBookings(upcomingBookings);

        } else {

            const upcomingSection = document.querySelector(".upcoming-booking");

            if (upcomingSection) {
                upcomingSection.style.display = "none";
            }
        }

        // Past, cancelled and departed bookings go to history
        displayBookingHistory(historyBookings);

        const bookingHistory = document.querySelector(
            ".booking-history"
        );

        if (bookingHistory) {
            bookingHistory.style.display =
                historyBookings.length > 0 ? "block" : "none";
        }

        if (noBookingMessage) {
            noBookingMessage.style.display = "none";
        }

    } catch (error) {
        console.error("Error loading bookings:", error);
        alert("Unable to load bookings.");
    }
}


/*
=========================================================
FORMAT JOURNEY DATE
=========================================================
*/

function formatJourneyDate(date) {

    if (!date) {

        return "Not Available";

    }

    const parts =
        date.split("-");

    const year =
        parts[0];

    const month =
        parts[1];

    const day =
        parts[2];

    const monthNames = [

        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"

    ];

    return day + " "
        + monthNames[Number(month) - 1]
        + " " + year;
}

/*
=========================================================
DISPLAY BUS DETAILS
=========================================================
*/




/*
=========================================================
5. DISPLAY CURRENT / LATEST BOOKING
=========================================================
*/
function displayUpcomingBookings(bookings) {

    const container = document.getElementById("upcomingBookingsContainer");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    bookings.forEach(function (booking) {

        const card = document.createElement("article");

        card.className = "booking-card";

        card.innerHTML = `
            <div class="booking-card-header">

                <div>
                    <p class="booking-id">Booking ID</p>
                    <h3>${booking.bookingId}</h3>
                </div>

                <div>
                    <p class="booking-id">Booking Status</p>
                    <strong class="booking-status confirmed">
                        ${booking.status}
                    </strong>
                </div>

            </div>


            <div class="booking-details">

                <div class="booking-detail">
                    <span>Bus</span>
                    <strong>${booking.busName}</strong>
                    <span>${booking.busNumber}</span>
                </div>


                <div class="booking-detail">

                    <span>Route</span>

                    <div class="booking-route">

                        <strong>${booking.source}</strong>

                        <span class="arrow">→</span>

                        <strong>${booking.destination}</strong>

                    </div>

                </div>


                <div class="booking-detail">
                    <span>Departure</span>
                    <strong>${booking.departureTime}</strong>
                </div>


                <div class="booking-detail">
                    <span>Arrival</span>
                    <strong>${booking.arrivalTime}</strong>
                </div>

            </div>


            <div class="booking-details">

                <div class="booking-detail">
                    <span>Passenger</span>
                    <strong>${booking.passengerName}</strong>
                </div>


                <div class="booking-detail">
                    <span>Seat</span>
                    <strong>${booking.seatNumbers}</strong>
                </div>


                <div class="booking-detail">
                    <span>Journey Date</span>
                    <strong>${booking.journeyDate}</strong>
                </div>


                <div class="booking-detail">
                    <span>Payment</span>
                    <strong>${booking.paymentMethod}</strong>
                </div>

            </div>


            <div class="booking-amount">

                <span>Total Amount</span>

                <strong>
                    ₹${Number(booking.totalAmount).toFixed(2)}
                </strong>

            </div>


            <div class="booking-actions">

                <button
                    type="button"
                    class="view-ticket-button">
                    View Ticket
                </button>


                <button
                    type="button"
                    class="cancel-booking-button">
                    Cancel Booking
                </button>

            </div>
        `;


        // View Ticket
        const viewTicketButton =
            card.querySelector(".view-ticket-button");

        viewTicketButton.addEventListener("click", function () {

            localStorage.setItem(
                "selectedBookingId",
                booking.bookingId
            );

            localStorage.setItem(
                "bookingData",
                JSON.stringify(booking)
            );

            window.location.href = "booking-success.html";
        });


        // Cancel Booking
        const cancelBookingButton =
            card.querySelector(".cancel-booking-button");

        cancelBookingButton.addEventListener("click", function () {

            cancelBooking(
                booking.bookingId,
                cancelBookingButton
            );
        });


        container.appendChild(card);

    });
}



/*
=========================================================
6. DISPLAY BOOKING HISTORY
=========================================================
*/

function displayBookingHistory(
    bookings
) {

    if (!bookingHistoryBody) {

        return;

    }


    /*
    -----------------------------------------------------
    Clear old hardcoded rows
    -----------------------------------------------------
    */

    bookingHistoryBody.innerHTML =
        "";


    /*
    -----------------------------------------------------
    Create rows
    -----------------------------------------------------
    */

    bookings.forEach(
        function (booking) {

            const row =
                document.createElement("tr");


            /*
            -------------------------------------------------
            Bus
            -------------------------------------------------
            */

            const busCell =
                document.createElement("td");


            busCell.innerHTML =
                "<strong>" +
                (booking.busName || "Bus") +
                "</strong>";


            /*
            -------------------------------------------------
            Route
            -------------------------------------------------
            */

            const routeCell =
                document.createElement("td");
            routeCell.textContent =
                (booking.source || "Unknown")
                + " → "
                + (booking.destination || "Unknown");

            /*
            -------------------------------------------------
            Passenger
            -------------------------------------------------
            */

            const passengerCell =
                document.createElement("td");

            if (
                booking.passengers &&
                booking.passengers.length > 0
            ) {

                passengerCell.textContent =
                    booking.passengers
                        .map(function (passenger) {
                            return passenger.name;
                        })
                        .join(", ");

            } else {

                passengerCell.textContent =
                    booking.passengerName || "Not Available";
            }


            /*
            -------------------------------------------------
            Journey Date
            -------------------------------------------------
            */

            const dateCell =
                document.createElement("td");

            dateCell.textContent =
                formatJourneyDate(
                    booking.journeyDate
                );


            /*
            -------------------------------------------------
            Seat
            -------------------------------------------------
            */

            const seatCell =
                document.createElement("td");

            seatCell.textContent =
                booking.seatNumbers;


            /*
            -------------------------------------------------
            Booking ID
            -------------------------------------------------
            */

            const bookingIdCell =
                document.createElement("td");

            bookingIdCell.textContent =
                booking.bookingId;


            /*
            -------------------------------------------------
            Status
            -------------------------------------------------
            */

            const statusCell =
                document.createElement("td");

            const status =
                document.createElement("span");


            status.classList.add(
                "booking-status"
            );


            if (
                booking.status === "CONFIRMED"
            ) {

                status.classList.add(
                    "confirmed"
                );

            }


            if (
                booking.status === "CANCELLED"
            ) {

                status.classList.add(
                    "cancelled"
                );

            }


            status.textContent =
                booking.status;


            statusCell.appendChild(
                status
            );


            /*
            -------------------------------------------------
            Action
            -------------------------------------------------
            */

            const actionCell =
                document.createElement("td");


            const viewButton =
                document.createElement("button");


            viewButton.type =
                "button";

            viewButton.className =
                "view-ticket-button";

            viewButton.textContent =
                "View Ticket";


            viewButton.addEventListener(
                "click",
                function () {

                    localStorage.setItem(
                        "bookingData",
                        JSON.stringify(booking)
                    );

                    window.location.href =
                        "booking-success.html";

                }
            );


            actionCell.appendChild(
                viewButton
            );


            /*
            -------------------------------------------------
            Add cells to row
            -------------------------------------------------
            */

            row.appendChild(
                busCell
            );

            row.appendChild(
                routeCell
            );

            row.appendChild(
                passengerCell
            );


            row.appendChild(
                dateCell
            );

            row.appendChild(
                seatCell
            );

            row.appendChild(
                bookingIdCell
            );

            row.appendChild(
                statusCell
            );

            row.appendChild(
                actionCell
            );


            /*
            -------------------------------------------------
            Add row to table
            -------------------------------------------------
            */

            bookingHistoryBody.appendChild(
                row
            );

        }
    );

}


/*
=========================================================
7. CANCEL BOOKING
=========================================================
*/

async function cancelBooking(
    bookingId
) {

    const confirmCancel =
        confirm(
            "Are you sure you want to cancel this booking?"
        );


    if (!confirmCancel) {

        return;

    }


    try {

        /*
        -------------------------------------------------
        Call backend cancel API
        -------------------------------------------------
        */

        const response =
            await fetch(
                "http://localhost:8080/api/customer/bookings/"
                + bookingId
                + "/cancel",
                {
                    method: "PUT",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        /*
        -------------------------------------------------
        Check response
        -------------------------------------------------
        */

        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                "Unable to cancel booking"
            );

        }


        /*
        -------------------------------------------------
        Get updated booking
        -------------------------------------------------
        */

        const updatedBooking =
            await response.json();


        /*
        -------------------------------------------------
        Store updated booking
        -------------------------------------------------
        */

        localStorage.setItem(
            "bookingData",
            JSON.stringify(updatedBooking)
        );


        /*
        -------------------------------------------------
        Success message
        -------------------------------------------------
        */

        alert(
            "Booking cancelled successfully."
        );


        /*
        -------------------------------------------------
        Reload bookings
        -------------------------------------------------
        */

        loadMyBookings();


    } catch (error) {

        console.error(
            "Cancel booking error:",
            error
        );

        alert(
            "Unable to cancel booking."
        );

    }

}


/*
=========================================================
8. SHOW NO BOOKINGS
=========================================================
*/

function showNoBookings() {

    /*
    Hide booking card
    */

    const upcomingBooking =
        document.querySelector(
            ".upcoming-booking"
        );

    if (upcomingBooking) {

        upcomingBooking.style.display =
            "none";

    }


    /*
    Hide history
    */

    const bookingHistory =
        document.querySelector(
            ".booking-history"
        );

    if (bookingHistory) {

        bookingHistory.style.display =
            "none";

    }


    /*
    Show no booking message
    */

    if (noBookingMessage) {

        noBookingMessage.style.display =
            "block";

    }

}

const logoutLink = document.getElementById("logoutLink");

if (logoutLink) {

    logoutLink.addEventListener("click", function (event) {

        event.preventDefault();

        // Remove JWT token
        localStorage.removeItem("token");

        // Remove user information
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");

        // Remove selected bus / journey information
        localStorage.removeItem("journeyDate");
        localStorage.removeItem("selectedBusId");
        localStorage.removeItem("selectedBusName");
        localStorage.removeItem("selectedBusNumber");
        localStorage.removeItem("selectedBusFare");
        localStorage.removeItem("selectedBusSource");
        localStorage.removeItem("selectedBusDestination");
        localStorage.removeItem("selectedBusDeparture");
        localStorage.removeItem("selectedBusArrival");

        // Go back to login
        window.location.href = "login.html";

    });

}