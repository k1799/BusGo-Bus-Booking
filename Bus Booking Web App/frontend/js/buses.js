// =====================================================
// 1. GET REQUIRED HTML ELEMENTS
// =====================================================

const busesContainer = document.getElementById("busesContainer");

const searchFrom = document.getElementById("searchFrom");
const searchTo = document.getElementById("searchTo");
const searchDate = document.getElementById("searchDate");

const searchSummary = document.getElementById("searchSummary");
// =====================================================
// 2. GET JWT TOKEN
// =====================================================

const token = localStorage.getItem("token");


// =====================================================
// 3. CHECK LOGIN
// =====================================================

if (!token) {

    window.location.href = "login.html";

}


// =====================================================
// 4. GET SEARCH DETAILS FROM URL
// =====================================================
//
// index.html sends:
//
// buses.html?from=Madurai&to=Chennai&journeyDate=2026-09-28
//
// We read those values here.
// =====================================================

const urlParams = new URLSearchParams(window.location.search);

const from = urlParams.get("from");
const to = urlParams.get("to");
const journeyDate = urlParams.get("journeyDate");


// =====================================================
// 5. CHECK WHETHER SEARCH DETAILS EXIST
// =====================================================

if (!from || !to || !journeyDate) {

    //old
    // alert("Please search for a journey first.");

    // window.location.href = "index.html";


    // No search details were provided.
    // Do not redirect to Home.
    // The Buses page can still open normally.

    searchFrom.textContent = "All Routes";
    searchTo.textContent = "All Routes";
    searchDate.textContent = "Select a journey to filter buses";


}


// =====================================================
// 6. FORMAT DATE FOR DISPLAY
// =====================================================
//
// URL date:
// 2026-09-28
//
// Display:
// 28 September 2026
// =====================================================

function formatDate(dateString) {

    const parts = dateString.split("-");

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });

}


// =====================================================
// 7. DISPLAY SEARCH DETAILS
// =====================================================

//old
// searchFrom.textContent = from;

// searchTo.textContent = to;

// searchDate.textContent = formatDate(journeyDate);

// =====================================================
// 7. DISPLAY SEARCH DETAILS
// =====================================================

if (from && to && journeyDate) {

    // Customer came from Home search

    searchSummary.style.display = "block";

    searchFrom.textContent = from;

    searchTo.textContent = to;

    searchDate.textContent = formatDate(journeyDate);

} else {

    // Customer came from Navbar

    // searchFrom.textContent = "All Routes";

    // searchTo.textContent = "All Routes";

    // searchDate.textContent = "All Dates";

    searchSummary.style.display = "none";

}

// =====================================================
// 8. LOAD BUSES FROM BACKEND
// =====================================================

async function loadBuses() {

    try {

        const response = await fetch(
            "http://localhost:8080/api/customer/buses",
            {
                method: "GET",

                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );


        // =================================================
        // 9. CHECK RESPONSE
        // =================================================

        if (!response.ok) {

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem("token");

                window.location.href = "login.html";

                return;
            }

            throw new Error("Unable to load buses");

        }


        // =================================================
        // 10. GET BUS DATA
        // =================================================

        const buses = await response.json();


        // =================================================
        // 11. FILTER BUSES BASED ON SEARCH DETAILS
        // =================================================

        // If customer came from Home search,
        // filter buses using From + To + Journey Date.
        //
        // If customer came from another page using
        // the Buses navbar link,
        // there may be no search details.
        // In that case, show all buses normally.

        let filteredBuses = buses;


        // =================================================
        // SEARCH DETAILS AVAILABLE
        // =================================================

        if (from && to && journeyDate) {

            filteredBuses = buses.filter(function (bus) {

                // Check route
                const routeMatch =
                    bus.source.toLowerCase() === from.toLowerCase() &&
                    bus.destination.toLowerCase() === to.toLowerCase();

                if (!routeMatch) {
                    return false;
                }


                // Get today's date
                const today = new Date();

                const todayYear = today.getFullYear();

                const todayMonth =
                    String(today.getMonth() + 1).padStart(2, "0");

                const todayDay =
                    String(today.getDate()).padStart(2, "0");


                const todayDate =
                    `${todayYear}-${todayMonth}-${todayDay}`;


                // Future date
                if (journeyDate > todayDate) {

                    return true;

                }


                // Today - check actual bus departure time
                if (journeyDate === todayDate) {

                    const currentTime =
                        String(today.getHours()).padStart(2, "0") +
                        ":" +
                        String(today.getMinutes()).padStart(2, "0");


                    const departureTime =
                        bus.departureTime.substring(0, 5);


                    return departureTime > currentTime;

                }


                // Past date
                return false;

            });

        }

        // =================================================
        // 12. GET AVAILABLE SEATS FOR EACH BUS
        // =================================================

        if (journeyDate) {

            const busesWithAvailability = await Promise.all(
                filteredBuses.map(async function (bus) {

                    const response = await fetch(
                        "http://localhost:8080/api/customer/buses/"
                        + bus.id
                        + "/seats?journeyDate="
                        + encodeURIComponent(journeyDate),
                        {
                            method: "GET",
                            headers: {
                                "Authorization": "Bearer " + token
                            }
                        }
                    );

                    if (!response.ok) {
                        throw new Error(
                            "Unable to load seats for " + bus.busName
                        );
                    }

                    const seats = await response.json();

                    const availableSeats = seats.filter(function (seat) {
                        return seat.status === "AVAILABLE";
                    }).length;

                    return {
                        ...bus,
                        availableSeats: availableSeats
                    };
                })
            );

            displayBuses(busesWithAvailability);

        } else {

            displayBuses(
                filteredBuses.map(function (bus) {
                    return {
                        ...bus,
                        availableSeats: bus.totalSeats
                    };
                })
            );

        }

    } catch (error) {

        console.error("Bus loading error:", error);

        busesContainer.innerHTML = `
            <div class="no-buses">
                <h3>Unable to Load Buses</h3>

                <p>
                    Please try again later.
                </p>
            </div>
        `;

    }

}


// =====================================================
// 13. DISPLAY BUS CARDS
// =====================================================

function displayBuses(buses) {

    // Clear old content
    busesContainer.innerHTML = "";


    // =================================================
    // NO MATCHING BUS
    // =================================================

    if (buses.length === 0) {

        busesContainer.innerHTML = `
            <div class="no-buses">

                <h3>No Buses Available</h3>

                <p>
                    No buses are available for the selected route.
                </p>

            </div>
        `;

        return;
    }


    // =================================================
    // DISPLAY EACH BUS
    // =================================================

    buses.forEach(function (bus) {

        // Create bus card
        const busCard = document.createElement("article");

        busCard.className = "bus-card";


        // =================================================
        // BUS CARD HTML
        // =================================================

        busCard.innerHTML = `

            <div class="bus-header">

                <h2>${bus.busName}</h2>

                <span class="bus-number">
                    ${bus.busNumber}
                </span>

            </div>


            <div class="bus-info">

                <!-- Route -->
                <div class="bus-info-item">

                    <span>Route</span>

                    <div class="bus-route">

                        <span>${bus.source}</span>

                        <span class="arrow">→</span>

                        <span>${bus.destination}</span>

                    </div>

                </div>


                <!-- Time -->
                <div class="bus-info-item">

                    <span>Departure / Arrival</span>

                    <div class="bus-time">

                        <strong>${bus.departureTime}</strong>

                        <span>Departure</span>

                        <strong>${bus.arrivalTime}</strong>

                        <span>Arrival</span>

                    </div>

                </div>


                <!-- Seats -->
                <div class="bus-info-item">

                    <span>Available Seats</span>

                    <div class="seat-info">

                        <strong>
                            ${bus.availableSeats} Seats
                        </strong>

                        <span>
                            Seats Available
                        </span>

                    </div>

                </div>


                <!-- Fare -->
                <div class="bus-info-item">

                    <span>Fare</span>

                    <div class="bus-fare">

                        <strong>
                            ₹${bus.fare}
                        </strong>

                        <span>
                            Per Seat
                        </span>

                    </div>

                </div>

            </div>


            <!-- Bus footer -->
            <div class="bus-footer">

                <span>
                    Select your seat to continue
                </span>

                <button
                    class="view-seats-button"
                    data-id="${bus.id}">
                    View Seats
                </button>

            </div>

        `;


        // Add card to page
        busesContainer.appendChild(busCard);


        // =================================================
        // VIEW SEATS BUTTON
        // =================================================

        const viewButton =
            busCard.querySelector(".view-seats-button");

        viewButton.addEventListener("click", function () {

            // Check whether user is logged in
            if (!token) {

                // Save selected journey details
                localStorage.setItem(
                    "journeyDate",
                    journeyDate
                );

                localStorage.setItem(
                    "selectedBusId",
                    bus.id
                );

                localStorage.setItem(
                    "selectedBusName",
                    bus.busName
                );

                localStorage.setItem(
                    "selectedBusNumber",
                    bus.busNumber
                );

                localStorage.setItem(
                    "selectedBusFare",
                    bus.fare
                );

                localStorage.setItem("selectedBusSource", bus.source);
                localStorage.setItem("selectedBusDestination", bus.destination);
                localStorage.setItem("selectedBusDeparture", bus.departureTime);
                localStorage.setItem("selectedBusArrival", bus.arrivalTime);

                // Save journey date selected by customer
                localStorage.setItem("journeyDate", journeyDate);
                // Send user to login page
                // After login, we can return to bus details
                window.location.href =
                    "login.html?redirect=bus-details.html";

                return;
            }


            // User is already logged in
            localStorage.setItem(
                "journeyDate",
                journeyDate
            );

            localStorage.setItem(
                "selectedBusId",
                bus.id
            );

            localStorage.setItem(
                "selectedBusName",
                bus.busName
            );

            localStorage.setItem(
                "selectedBusNumber",
                bus.busNumber
            );

            localStorage.setItem(
                "selectedBusFare",
                bus.fare
            );

            localStorage.setItem(
                "selectedBusSource",
                bus.source
            );

            localStorage.setItem(
                "selectedBusDestination",
                bus.destination
            );

            localStorage.setItem(
                "selectedBusDeparture",
                bus.departureTime
            );

            localStorage.setItem(
                "selectedBusArrival",
                bus.arrivalTime
            );

            // Go directly to seat selection
            window.location.href = "bus-details.html";

        });


    });

}


// =====================================================
// 14. START BUS LOADING
// =====================================================

loadBuses();

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