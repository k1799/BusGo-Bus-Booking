/*
=========================================================
BUSGO - BUS DETAILS PAGE JAVASCRIPT
...
*/
/*
=========================================================
BUSGO - BUS DETAILS PAGE JAVASCRIPT

This file handles:

1. Selected bus information
2. Get seats from backend
3. Create proper 2 + aisle + 2 bus layout
4. Available / booked seat status
5. Seat selection
6. Seat deselection
7. Maximum 5 seat selection
8. Fare calculation
9. Continue Booking

=========================================================
*/


// =======================================================
// 1. GET PAGE ELEMENTS
// =======================================================

// const busNameElement =
//     document.querySelector(".bus-details-card h2");

// const busNumberElement =
//     document.querySelector(".bus-details-number");

const selectedSeatElement =
    document.getElementById("selectedSeat");

const seatFareElement =
    document.getElementById("seatFare");

const continueButton =
    document.getElementById("continueButton");

const seatsContainer =
    document.querySelector(".seat-layout");

const busNameElement =
    document.getElementById("busName");

const busNumberElement =
    document.getElementById("busNumber");

const busRouteElement =
    document.getElementById("busRoute");

const departureTimeElement =
    document.getElementById("departureTime");

const arrivalTimeElement =
    document.getElementById("arrivalTime");

const busFareElement =
    document.getElementById("busFare");

const journeyDateElement =
    document.getElementById("journeyDate");


// =======================================================
// 2. GET SELECTED BUS INFORMATION
// =======================================================

const selectedBusId =
    localStorage.getItem("selectedBusId");

const selectedBusName =
    localStorage.getItem("selectedBusName");

const selectedBusNumber =
    localStorage.getItem("selectedBusNumber");

const selectedBusFare =
    Number(
        localStorage.getItem("selectedBusFare")
    );
const selectedBusSource =
    localStorage.getItem("selectedBusSource");

const selectedBusDestination =
    localStorage.getItem("selectedBusDestination");

const selectedBusDeparture =
    localStorage.getItem("selectedBusDeparture");

const selectedBusArrival =
    localStorage.getItem("selectedBusArrival");

const journeyDate =
    localStorage.getItem("journeyDate");

const selectedJourneyDate = localStorage.getItem("journeyDate");

// =======================================================
// 3. GET JWT TOKEN
// =======================================================

const token =
    localStorage.getItem("token");


// =======================================================
// 4. CHECK LOGIN
// =======================================================

if (!token) {

    window.location.href =
        "login.html";
}


// =======================================================
// 5. CHECK SELECTED BUS
// =======================================================

if (!selectedBusId) {

    alert(
        "Please select a bus first."
    );

    window.location.href =
        "buses.html";
}


// =======================================================
// 6. DISPLAY SELECTED BUS
// =======================================================

// if (selectedBusName) {

//     busNameElement.textContent =
//         selectedBusName;
// }


// if (selectedBusNumber) {

//     busNumberElement.textContent =
//         "Bus Number: " +
//         selectedBusNumber;
// }


// Display bus name
if (selectedBusName) {

    busNameElement.textContent =
        selectedBusName;
}


// Display bus number
if (selectedBusNumber) {

    busNumberElement.textContent =
        "Bus Number: " +
        selectedBusNumber;
}


// Display route
if (
    selectedBusSource &&
    selectedBusDestination
) {

    busRouteElement.textContent =
        selectedBusSource +
        " → " +
        selectedBusDestination;
}


// Display departure
if (selectedBusDeparture) {

    departureTimeElement.textContent =
        selectedBusDeparture;
}


// Display arrival
if (selectedBusArrival) {

    arrivalTimeElement.textContent =
        selectedBusArrival;
}


// Display fare
if (selectedBusFare) {

    busFareElement.textContent =
        "₹" +
        selectedBusFare +
        " / Seat";
}


// Display journey date
if (journeyDate) {

    const parts =
        journeyDate.split("-");

    const date = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );

    journeyDateElement.textContent =
        date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );
}


// =======================================================
// 7. BUS FARE
// =======================================================

const seatFare =
    selectedBusFare || 0;


// =======================================================
// 8. MAXIMUM SEAT LIMIT
// =======================================================

// const maximumSeats = 5;


// =======================================================
// 9. SELECTED SEATS ARRAY
// =======================================================

let selectedSeats = [];


// =======================================================
// 10. LOAD SEATS FROM BACKEND
// =======================================================

async function loadSeats() {

    try {

        const response = await fetch(
            "http://localhost:8080/api/customer/buses/"
            + selectedBusId
            + "/seats?journeyDate="
            + encodeURIComponent(selectedJourneyDate),
            {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        // ==================================================
        // Check response
        // ==================================================

        if (!response.ok) {

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem(
                    "token"
                );

                window.location.href =
                    "login.html";

                return;
            }

            throw new Error(
                "Unable to load seats"
            );
        }


        // ==================================================
        // Convert response to JSON
        // ==================================================

        const seats =
            await response.json();


        // ==================================================
        // Display seats
        // ==================================================

        displaySeats(seats);

    }

    catch (error) {

        console.error(
            "Seat loading error:",
            error
        );

        seatsContainer.innerHTML = `

            <p>
                Unable to load seats.
                Please try again.
            </p>

        `;
    }
}


// =======================================================
// 11. DISPLAY SEATS
// =======================================================

function displaySeats(seats) {

    // Clear old HTML seats

    seatsContainer.innerHTML = "";


    /*
    =====================================================
    BACKEND SEATS COME LIKE:

    S1
    S2
    S3
    S4
    S5
    S6
    ...

    We need:

    S1  S2     S3  S4
    S5  S6     S7  S8
    S9  S10    S11 S12

    Therefore every 4 seats become one row.
    =====================================================
    */


    // Seat number order:
    // S1, S2, S3, S4, S5 ... S40
    seats.sort(function (a, b) {

        const numberA =
            parseInt(a.seatNumber.substring(1));

        const numberB =
            parseInt(b.seatNumber.substring(1));

        return numberA - numberB;
    });


    for (
        let i = 0;
        i < seats.length;
        i += 4
    ) {


        // =================================================
        // Create one row
        // =================================================

        const seatRow =
            document.createElement("div");

        seatRow.className =
            "seat-row";


        // =================================================
        // Get maximum 4 seats for this row
        // =================================================

        const rowSeats =
            seats.slice(
                i,
                i + 4
            );


        // =================================================
        // Create 4 seats
        // =================================================

        rowSeats.forEach(
            function (seat) {


                // =========================================
                // Create seat button
                // =========================================

                const seatElement =
                    document.createElement("button");


                // =========================================
                // Button type
                // =========================================

                seatElement.type =
                    "button";


                // =========================================
                // Seat number
                // =========================================

                seatElement.textContent =
                    seat.seatNumber;


                // =========================================
                // Common seat class
                // =========================================

                seatElement.classList.add(
                    "seat"
                );


                // =========================================
                // Seat data
                // =========================================

                seatElement.setAttribute(
                    "data-seat",
                    seat.seatNumber
                );


                // =========================================
                // AVAILABLE
                // =========================================

                if (
                    seat.status.toUpperCase() ===
                    "AVAILABLE"
                ) {

                    seatElement.classList.add(
                        "available"
                    );


                    seatElement.addEventListener(
                        "click",
                        function () {

                            selectSeat(
                                seatElement,
                                seat.seatNumber
                            );

                        }
                    );

                }


                // =========================================
                // BOOKED
                // =========================================

                else {

                    seatElement.classList.add(
                        "booked"
                    );

                    seatElement.disabled =
                        true;

                }


                // =========================================
                // Add seat to row
                // =========================================

                seatRow.appendChild(
                    seatElement
                );

            }
        );


        // =================================================
        // Add aisle after second seat
        // =================================================

        if (rowSeats.length === 4) {

            const firstSeat =
                seatRow.children[0];

            const secondSeat =
                seatRow.children[1];

            const thirdSeat =
                seatRow.children[2];

            const fourthSeat =
                seatRow.children[3];


            // Remove all four temporarily

            seatRow.innerHTML = "";


            // Add first two seats

            seatRow.appendChild(
                firstSeat
            );

            seatRow.appendChild(
                secondSeat
            );


            // Add aisle

            const aisle =
                document.createElement("span");

            aisle.className =
                "aisle";

            seatRow.appendChild(
                aisle
            );


            // Add last two seats

            seatRow.appendChild(
                thirdSeat
            );

            seatRow.appendChild(
                fourthSeat
            );
        }


        // =================================================
        // Add row to seat layout
        // =================================================

        seatsContainer.appendChild(
            seatRow
        );

    }
}


// =======================================================
// 12. SELECT / DESELECT SEAT
// =======================================================

function selectSeat(
    seatElement,
    seatNumber
) {


    // ==================================================
    // Already selected
    // ==================================================

    if (
        seatElement.classList.contains(
            "selected"
        )
    ) {

        seatElement.classList.remove(
            "selected"
        );


        selectedSeats =
            selectedSeats.filter(
                function (seat) {

                    return seat !==
                        seatNumber;

                }
            );


        updateBookingSummary();

        return;
    }


    // ==================================================
    // Maximum 5 seats
    // ==================================================

    // if (
    //     selectedSeats.length >=
    //     maximumSeats
    // ) {

    //     alert(
    //         "You can select maximum 5 seats."
    //     );

    //     return;
    // }


    // ==================================================
    // Select seat
    // ==================================================

    seatElement.classList.add(
        "selected"
    );


    selectedSeats.push(
        seatNumber
    );


    updateBookingSummary();
}


// =======================================================
// 13. UPDATE BOOKING SUMMARY
// =======================================================

function updateBookingSummary() {


    // ==================================================
    // Selected seats
    // ==================================================

    if (
        selectedSeats.length === 0
    ) {

        selectedSeatElement.textContent =
            "None";

    } else {

        selectedSeatElement.textContent =
            selectedSeats.join(", ");

    }


    // ==================================================
    // Calculate total fare
    // ==================================================

    const totalFare =
        selectedSeats.length *
        seatFare;


    // ==================================================
    // Display total fare
    // ==================================================

    seatFareElement.textContent =
        "₹" + totalFare;


    // ==================================================
    // Enable / disable continue button
    // ==================================================

    if (
        selectedSeats.length > 0
    ) {

        continueButton.disabled =
            false;

    } else {

        continueButton.disabled =
            true;

    }
}


// =======================================================
// 14. CONTINUE BOOKING
// =======================================================

continueButton.addEventListener(
    "click",
    function () {


        // ==================================================
        // Check seat selection
        // ==================================================

        if (
            selectedSeats.length === 0
        ) {

            alert(
                "Please select at least one seat."
            );

            return;
        }


        // ==================================================
        // Store selected seats
        // ==================================================

        localStorage.setItem(
            "selectedSeats",
            JSON.stringify(
                selectedSeats
            )
        );


        // ==================================================
        // Store seat count
        // ==================================================

        localStorage.setItem(
            "selectedSeatCount",
            selectedSeats.length
        );


        // ==================================================
        // Calculate total fare
        // ==================================================

        const totalFare =
            selectedSeats.length *
            seatFare;


        // ==================================================
        // Store total fare
        // ==================================================

        localStorage.setItem(
            "selectedFare",
            totalFare
        );


        // ==================================================
        // Go to booking page
        // ==================================================

        window.location.href =
            "booking.html";

    }
);


// =======================================================
// 15. INITIAL SUMMARY
// =======================================================

updateBookingSummary();


// =======================================================
// 16. LOAD BACKEND SEATS
// =======================================================

loadSeats();

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