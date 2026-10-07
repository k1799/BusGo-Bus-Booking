/*
=========================================================
BUSGO - ADMIN BOOKINGS
=========================================================
*/

const API_URL =
    "http://localhost:8080";

let allBookings = [];
let allBuses = [];

let selectedBooking = null;


/* =========================================================
   1. GET TOKEN
   ========================================================= */

function getToken() {

    return localStorage.getItem("token");
}


/* =========================================================
   2. CHECK ADMIN LOGIN
   ========================================================= */

function checkAdminLogin() {

    const token =
        localStorage.getItem("token");

    const role =
        localStorage.getItem("userRole");

    if (!token || role !== "ADMIN") {

        window.location.href =
            "admin-login.html";

        return false;
    }

    return true;
}


/* =========================================================
   3. API REQUEST
   ========================================================= */

async function apiRequest(
    url,
    options = {}
) {

    const token = getToken();

    const headers = {

        "Content-Type":
            "application/json",

        ...(options.headers || {})

    };

    if (token) {

        headers.Authorization =
            "Bearer " + token;
    }

    const response =
        await fetch(
            API_URL + url,
            {
                ...options,
                headers: headers
            }
        );


    /*
     * Unauthorized / Forbidden
     */
    if (
        response.status === 401 ||
        response.status === 403
    ) {

        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");

        window.location.href =
            "admin-login.html";

        throw new Error(
            "Admin session expired"
        );
    }


    if (!response.ok) {

        const errorText =
            await response.text();

        let errorMessage =
            "Request failed";

        try {

            const errorData =
                JSON.parse(errorText);

            if (errorData.message) {

                errorMessage =
                    errorData.message;
            }

        } catch (error) {

            if (errorText) {

                errorMessage =
                    errorText;
            }
        }

        throw new Error(
            errorMessage
        );
    }


    return response.json();
}


/* =========================================================
   4. LOAD BOOKINGS
   ========================================================= */

async function loadBookings() {

    try {

        allBookings =
            await apiRequest(
                "/api/admin/bookings"
            );

        updateSummary();

        renderBookings();

        populateBusFilter();

    } catch (error) {

        console.error(
            "Booking load error:",
            error
        );

        alert(
            "Unable to load bookings."
        );
    }
}


/* =========================================================
   5. LOAD BUSES
   ========================================================= */

async function loadBuses() {

    try {

        allBuses =
            await apiRequest(
                "/api/admin/buses"
            );

        populateBusFilter();

    } catch (error) {

        console.error(
            "Bus load error:",
            error
        );
    }
}


/* =========================================================
   6. UPDATE SUMMARY
   ========================================================= */

function updateSummary() {

    const total =
        allBookings.length;

    const confirmed =
        allBookings.filter(
            booking =>
                booking.status ===
                "CONFIRMED"
        ).length;



    const cancelled =
        allBookings.filter(
            booking =>
                booking.status ===
                "CANCELLED"
        ).length;

    /*
* Total booking value
*/
    const bookingValue =
        allBookings.reduce(
            function (total, booking) {

                return total  +
                    Number(
                        booking.totalAmount || 0
                    );

            },
            0
        );


    /*
     * Confirmed booking value
     */
    const confirmedValue =
        allBookings
            .filter(
                booking =>
                    booking.status ===
                    "CONFIRMED"
            )
            .reduce(
                function (total, booking) {

                    return total +
                        Number(
                            booking.totalAmount || 0
                        );

                },
                0
            );


    /*
     * Cancelled booking value
     */
    const cancelledValue =
        allBookings
            .filter(
                booking =>
                    booking.status ===
                    "CANCELLED"
            )
            .reduce(
                function (total, booking) {

                    return total +
                        Number(
                            booking.totalAmount || 0
                        );

                },
                0
            );


    /*
     * Net revenue
     *
     * Confirmed amount
     * minus
     * cancelled amount
     */
    const netRevenue =
        confirmedValue;

    document.getElementById(
        "totalBookings"
    ).textContent = total;


    document.getElementById(
        "confirmedBookings"
    ).textContent = confirmed;

    document.getElementById(
        "cancelledBookings"
    ).textContent = cancelled;

    /*
    * Financial cards
    */
    document.getElementById(
        "bookingValue"
    ).textContent =
        "₹" +
        bookingValue.toLocaleString("en-IN");


    document.getElementById(
        "confirmedValue"
    ).textContent =
        "₹" +
        confirmedValue.toLocaleString("en-IN");


    document.getElementById(
        "cancelledValue"
    ).textContent =
        "₹" +
        cancelledValue.toLocaleString("en-IN");


    // document.getElementById(
    //     "netRevenue"
    // ).textContent =
    //     "₹" +
    //     netRevenue.toLocaleString("en-IN");
}


/* =========================================================
   7. POPULATE BUS FILTER
   ========================================================= */

function populateBusFilter() {

    const select =
        document.getElementById(
            "busFilter"
        );

    if (!select) {
        return;
    }


    select.innerHTML =
        '<option value="all">All Buses</option>';


    allBuses.forEach(
        function (bus) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                bus.id;

            option.textContent =
                bus.busName;

            select.appendChild(
                option
            );
        }
    );
}


/* =========================================================
   8. GET BUS NAME
   ========================================================= */

function getBusById(busId) {

    return allBuses.find(
        bus =>
            Number(bus.id) ===
            Number(busId)
    );
}


/* =========================================================
   9. FORMAT DATE
   ========================================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const parts =
        dateString.split("-");

    if (parts.length !== 3) {
        return dateString;
    }

    const year =
        parts[0];

    const month =
        Number(parts[1]);

    const day =
        parts[2];


    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];


    return (
        day +
        " " +
        months[month - 1] +
        " " +
        year
    );
}

function formatDateTime(dateTime) {

    if (!dateTime) {
        return "Not Available";
    }

    const date = new Date(dateTime);

    if (isNaN(date.getTime())) {
        return "Not Available";
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
}

function isJourneyPassed(booking) {

    if (
        !booking.journeyDate ||
        !booking.departureTime
    ) {
        return false;
    }

    const journeyDateTime =
        new Date(
            booking.journeyDate +
            "T" +
            booking.departureTime
        );

    if (isNaN(journeyDateTime.getTime())) {
        return false;
    }

    return new Date() >= journeyDateTime;
}

/* =========================================================
   10. RENDER BOOKINGS
   ========================================================= */

function renderBookings() {

    const tableBody =
        document.getElementById(
            "bookingTableBody"
        );

    if (!tableBody) {
        return;
    }


    const searchValue =
        document.getElementById(
            "bookingSearch"
        ).value
            .trim()
            .toLowerCase();


    const busValue =
        document.getElementById(
            "busFilter"
        ).value;


    const statusValue =
        document.getElementById(
            "statusFilter"
        ).value
            .toUpperCase();


    const dateValue =
        document.getElementById(
            "bookingDate"
        ).value;


    const urlParams =
        new URLSearchParams(
            window.location.search
        );

    const todayFilter =
        urlParams.get("filter") === "today";

    tableBody.innerHTML = "";


    let visibleCount = 0;


    allBookings.forEach(
        function (booking) {

            const bus =
                getBusById(
                    booking.busId
                );


            const busName =
                booking.busName ||
                (bus
                    ? bus.busName
                    : "Unknown Bus");


            const source =
                booking.source ||
                (bus
                    ? bus.source
                    : "");


            const destination =
                booking.destination ||
                (bus
                    ? bus.destination
                    : "");


            /*
             * Search
             */
            const searchText = (
                booking.bookingId +
                " " +
                booking.passengerName +
                " " +
                busName
            ).toLowerCase();


            const matchesSearch =
                searchValue === "" ||
                searchText.includes(
                    searchValue
                );


            /*
             * Bus filter
             */
            const matchesBus =
                busValue === "all" ||
                Number(busValue) ===
                Number(booking.busId);


            /*
             * Status filter
             */
            const matchesStatus =
                statusValue === "ALL" ||
                booking.status ===
                statusValue;


            /*
             * Date filter
             */
            // const matchesDate =
            //     dateValue === "" ||
            //     booking.journeyDate ===
            //     dateValue;

            const matchesDate =
                todayFilter
                    ? (
                        booking.createdAt &&
                        new Date(
                            booking.createdAt
                        ).toLocaleDateString("en-CA") ===
                        new Date().toLocaleDateString("en-CA")
                    )
                    : (
                        dateValue === "" ||
                        booking.journeyDate ===
                        dateValue
                    );

            if (
                !matchesSearch ||
                !matchesBus ||
                !matchesStatus ||
                !matchesDate
            ) {

                return;
            }


            visibleCount++;


            const row =
                document.createElement(
                    "tr"
                );


            const statusClass =
                booking.status
                    .toLowerCase();

            const journeyPassed = isJourneyPassed(booking);

            const cancelButton =
                booking.status === "CANCELLED"
                    ? ""
                    : `
            <button
                type="button"
                class="booking-cancel-button"
                data-id="${booking.id}"
                ${journeyPassed ? "disabled" : ""}>
                Cancel
            </button>
          `;


            row.innerHTML = `

                <td class="booking-id-cell">
                    ${booking.bookingId}
                </td>


                <td class="passenger-name-cell">

                    <strong>
                        ${booking.passengerName}
                    </strong>

                    <span>
                        Customer
                    </span>

                </td>


                <td class="booking-bus-cell">
                    ${busName}
                </td>


                <td>

                    <div class="booking-route-cell">

                        <span>
                            ${source}
                        </span>

                        <span class="arrow">
                            →
                        </span>

                        <span>
                            ${destination}
                        </span>

                    </div>

                </td>


                <td class="booking-date-cell">
                    ${formatDate(
                booking.journeyDate
            )}
                </td>


                <td>
                    ${booking.seatNumbers}
                </td>


                <td class="booking-amount-cell">
                    ₹${booking.totalAmount}
                </td>


                <td>

                    <span class="status ${statusClass}">
                        ${booking.status}
                    </span>

                </td>


                <td>

                    <div class="booking-actions">

                        <button
                            type="button"
                            class="booking-view-button"
                            data-id="${booking.id}">
                            View
                        </button>

                        ${cancelButton}

                    </div>

                </td>

            `;


            tableBody.appendChild(
                row
            );
        }
    );


    const noBookings =
        document.getElementById(
            "noBookings"
        );


    if (noBookings) {

        if (visibleCount === 0) {

            noBookings.classList.add(
                "show"
            );

        } else {

            noBookings.classList.remove(
                "show"
            );
        }
    }
}


/* =========================================================
   11. VIEW BOOKING
   ========================================================= */

function viewBooking(id) {

    const booking =
        allBookings.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!booking) {
        return;
    }


    selectedBooking =
        booking;

    console.log("Selected Booking:", booking);
    console.log("GST Amount:", booking.gstAmount);
    console.log("Total Amount:", booking.totalAmount);

    const bus =
        getBusById(
            booking.busId
        );


    const busName =
        booking.busName ||
        (bus
            ? bus.busName
            : "-");


    const source =
        booking.source ||
        (bus
            ? bus.source
            : "");


    const destination =
        booking.destination ||
        (bus
            ? bus.destination
            : "");


    const busFare =
        booking.busFare ||
        (bus
            ? bus.fare
            : 0);


    document.getElementById(
        "detailBookingId"
    ).textContent =
        booking.bookingId;


    document.getElementById(
        "detailStatus"
    ).textContent =
        booking.status;


    // Display all passengers
    const passengerList =
        document.getElementById(
            "passengerList"
        );

    if (passengerList) {

        passengerList.innerHTML = "";

        if (
            booking.passengers &&
            booking.passengers.length > 0
        ) {

            booking.passengers.forEach(
                (passenger, index) => {

                    const passengerDiv =
                        document.createElement(
                            "div"
                        );

                    passengerDiv.className =
                        "admin-passenger-item";

                    passengerDiv.innerHTML = `
                    <strong>
                        Passenger ${index + 1}
                    </strong>

                    <div>
                        Name: ${passenger.name || "-"}
                    </div>

                    <div>
                        Age: ${passenger.age || "-"}
                    </div>

                    <div>
                        Gender: ${passenger.gender || "-"}
                    </div>

                    <div>
                        Phone: ${passenger.phone || "-"}
                    </div>

                    <div>
                        Email: ${passenger.email || "-"}
                    </div>

                    <div>
                        Seat: ${passenger.seatNumber || "-"}
                    </div>
                `;

                    passengerList.appendChild(
                        passengerDiv
                    );
                }
            );

        } else {

            passengerList.innerHTML =
                "<p>No passenger details available.</p>";
        }
    }

    document.getElementById(
        "detailBus"
    ).textContent =
        busName;


    document.getElementById(
        "detailRoute"
    ).textContent =
        source +
        " → " +
        destination;


    document.getElementById(
        "detailSeat"
    ).textContent =
        booking.seatNumbers;


    // Booking Date
    document.getElementById(
        "detailBookingDate"
    ).textContent =
        booking.createdAt
            ? formatDateTime(booking.createdAt)
            : "Not Available";

    // Journey Date
    document.getElementById(
        "detailDate"
    ).textContent =
        booking.journeyDate
            ? formatDate(booking.journeyDate)
            : "Not Available";


    document.getElementById(
        "detailSeatFare"
    ).textContent =
        "₹" +
        busFare +
        " × " +
        booking.seatCount;


    const gstElement =
        document.getElementById("detailGst");

    if (gstElement) {

        const gstAmount =
            booking.gstAmount;

        gstElement.textContent =
            gstAmount === null ||
                gstAmount === undefined
                ? "Not Available"
                : "₹" + Number(gstAmount).toFixed(2);
    }



    document.getElementById(
        "detailAmount"
    ).textContent =
        "₹" +
        Number(
            booking.totalAmount || 0
        ).toFixed(2);


    document.getElementById(
        "detailPayment"
    ).textContent =
        booking.status ===
        "Not Available";


    const details =
        document.getElementById(
            "bookingDetails"
        );


    details.classList.add(
        "show"
    );


    details.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================================
   12. CANCEL BOOKING
   ========================================================= */

async function cancelBooking(id) {

    const booking =
        allBookings.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!booking) {
        return;
    }


    const confirmCancel =
        confirm(
            "Are you sure you want to cancel " +
            booking.bookingId +
            "?"
        );


    if (!confirmCancel) {
        return;
    }


    try {

        await apiRequest(
            "/api/admin/bookings/" +
            id +
            "/cancel",
            {
                method: "PUT"
            }
        );


        alert(
            "Booking cancelled successfully."
        );


        /*
         * Reload fresh data
         */
        await loadBookings();


        /*
         * Close details
         */
        document.getElementById(
            "bookingDetails"
        ).classList.remove(
            "show"
        );




    } catch (error) {

        console.error(
            "Cancel booking error:",
            error
        );


        alert(
            error.message ||
            "Unable to cancel booking."
        );
    }
}


/* =========================================================
   13. TABLE BUTTON EVENTS
   ========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const viewButton =
            event.target.closest(
                ".booking-view-button"
            );


        if (viewButton) {

            const id =
                viewButton.dataset.id;
            console.log("View button clicked. ID:", id);
            viewBooking(id);

            return;
        }


        const cancelButton =
            event.target.closest(
                ".booking-cancel-button"
            );


        if (cancelButton) {

            const id =
                cancelButton.dataset.id;

            cancelBooking(id);

            return;
        }
    }
);


/* =========================================================
   14. FILTER EVENTS
   ========================================================= */

document.getElementById(
    "bookingSearch"
).addEventListener(
    "input",
    renderBookings
);


document.getElementById(
    "busFilter"
).addEventListener(
    "change",
    renderBookings
);


document.getElementById(
    "statusFilter"
).addEventListener(
    "change",
    renderBookings
);


document.getElementById(
    "bookingDate"
).addEventListener(
    "change",
    renderBookings
);

document
    .getElementById("sendDriverBtn")
    .addEventListener(
        "click",
        sendBookingToDriver
    );

/* =========================================================
   15. CLOSE DETAILS
   ========================================================= */

document.getElementById(
    "closeBookingDetails"
).addEventListener(
    "click",
    function () {

        document.getElementById(
            "bookingDetails"
        ).classList.remove(
            "show"
        );
    }
);


/* =========================================================
   16. LOGOUT
   ========================================================= */

document.querySelector(
    ".logout"
).addEventListener(
    "click",
    function (event) {

        event.preventDefault();

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

        window.location.href =
            "admin-login.html";
    }
);


/* =========================================================
   17. PAGE LOAD
   ========================================================= */

async function initializePage() {

    if (!checkAdminLogin()) {
        return;
    }

    await loadBuses();

    await loadBookings();
}


initializePage();



function sendBookingToDriver() {

    if (!selectedBooking) {
        alert("Please select a booking first.");
        return;
    }

    const driverPhone =
        prompt("Enter driver's WhatsApp number:");

    if (!driverPhone) {
        return;
    }

    const bus =
        getBusById(selectedBooking.busId);

    if (!bus) {
        alert("Bus details not found.");
        return;
    }

    const passengerNames =
        selectedBooking.passengers &&
            selectedBooking.passengers.length > 0
            ? selectedBooking.passengers
                .map(passenger => passenger.name)
                .join(", ")
            : selectedBooking.passengerName || "N/A";

    const message =
        "BusGo Booking Details\n\n" +
        "Booking ID: " +
        selectedBooking.bookingId + "\n" +
        "Passenger: " +
        passengerNames + "\n" +
        "Bus: " +
        bus.busName + "\n" +
        "Route: " +
        bus.source + " → " +
        bus.destination + "\n" +
        "Journey Date: " +
        selectedBooking.journeyDate + "\n" +
        "Seat: " +
        selectedBooking.seatNumbers + "\n" +
        "Departure: " +
        bus.departureTime + "\n\n" +
        "Please check the booking details.";

    const whatsappUrl =
        "https://wa.me/" +
        driverPhone.replace(/\D/g, "") +
        "?text=" +
        encodeURIComponent(message);

    window.open(
        whatsappUrl
        // "_blank"
    );
}