
/*
=========================================================
    BUSGO - BOOKING PAGE JAVASCRIPT

    This file handles:
    1. Selected bus and journey information
    2. Selected seats
    3. Creating one passenger form per seat
    4. Passenger form validation
    5. Sending booking data to backend
    6. Saving the booking response
    7. Redirecting to booking success page
=========================================================
*/


/*
=========================================================
    1. GET DATA FROM LOCAL STORAGE
=========================================================
*/

const token = localStorage.getItem("token");

const selectedBusId = localStorage.getItem("selectedBusId");

const selectedBusName = localStorage.getItem("selectedBusName");

const selectedBusNumber = localStorage.getItem("selectedBusNumber");

const journeyDate = localStorage.getItem("journeyDate");

const selectedBusSource =
    localStorage.getItem("selectedBusSource");

const selectedBusDestination =
    localStorage.getItem("selectedBusDestination");

const selectedBusDepartureTime =
    localStorage.getItem("selectedBusDeparture");

const selectedBusArrivalTime =
    localStorage.getItem("selectedBusArrival");


const selectedFare = Number(
    localStorage.getItem("selectedBusFare")
) || 0;


// Get selected seats from localStorage
const selectedSeats = JSON.parse(
    localStorage.getItem("selectedSeats") || "[]"
);


/*
=========================================================
    2. GET HTML ELEMENTS
=========================================================
*/

const bookingForm = document.getElementById("bookingForm");

const bookingMessage = document.getElementById("bookingMessage");

const passengerContainer = document.getElementById("passengerContainer");

const selectedSeatElement = document.getElementById("selectedSeat");

const passengerCountElement = document.getElementById("passengerCount");

const seatFareElement = document.getElementById("seatFare");

// const bookingFeeElement = document.getElementById("bookingFee");
const gstAmountElement = document.getElementById("gstAmount");

const totalAmountElement = document.getElementById("totalAmount");

// Display route
const busRouteElement =
    document.getElementById("busRoute");

if (busRouteElement) {
    busRouteElement.textContent =
        selectedBusSource + " → " + selectedBusDestination;
}

// Display departure time
const departureTimeElement =
    document.getElementById("departureTime");

if (departureTimeElement) {
    departureTimeElement.textContent =
        selectedBusDepartureTime || "-";
}

// Display arrival time
const arrivalTimeElement =
    document.getElementById("arrivalTime");

if (arrivalTimeElement) {
    arrivalTimeElement.textContent =
        selectedBusArrivalTime || "-";
}

const paymentOptions =
    document.querySelectorAll(
        'input[name="paymentMethod"]'
    );

const continueBookingButton =
    document.getElementById(
        "continueBookingButton"
    );

/*
=========================================================
    3. FORMAT JOURNEY DATE
=========================================================
*/

function formatJourneyDate(date) {

    if (!date) {
        return "Not Available";
    }

    const parts = date.split("-");

    const year = parts[0];
    const month = parts[1];
    const day = parts[2];

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

    return day + " " + monthNames[Number(month) - 1] + " " + year;
}


/*
=========================================================
    4. CHECK REQUIRED BOOKING INFORMATION
=========================================================
*/

if (!token) {

    window.location.href = "login.html";

}

if (!selectedBusId || !journeyDate) {

    alert("Bus or journey date is missing.");

    window.location.href = "buses.html";

}


// Check whether seats are selected
if (!Array.isArray(selectedSeats) || selectedSeats.length === 0) {

    alert("Please select at least one seat.");

    window.location.href = "bus-details.html";

}


// This project currently allows a maximum of 5 seats per booking
if (selectedSeats.length > 5) {

    alert("You can select a maximum of 5 seats.");

    window.location.href = "bus-details.html";

}


/*
=========================================================
    5. SORT SELECTED SEATS
=========================================================

    Example:
    S25, S2, S10

    After sorting:
    S2, S10, S25
=========================================================
*/

const sortedSeats = [...selectedSeats].sort((a, b) => {

    return Number(a.replace("S", "")) -
        Number(b.replace("S", ""));

});


/*
=========================================================
    6. DISPLAY BUS AND JOURNEY INFORMATION
=========================================================
*/

document.getElementById("busName").textContent =
    selectedBusName || "Bus Name";

document.getElementById("busNumber").textContent =
    selectedBusNumber || "-";

document.getElementById("journeyDate").textContent =
    formatJourneyDate(journeyDate);


// These values are optional display values.
// They will show "-" if they were not saved in localStorage.
document.getElementById("busRoute").textContent =
    (localStorage.getItem("selectedBusSource") || "-") +
    " → " +
    (localStorage.getItem("selectedBusDestination") || "-");

document.getElementById("departureTime").textContent =
    selectedBusDepartureTime || "-";

document.getElementById("arrivalTime").textContent =
    selectedBusArrivalTime || "-";

/*
=========================================================
    7. DISPLAY SELECTED SEATS
=========================================================
*/

selectedSeatElement.textContent = sortedSeats.join(", ");

passengerCountElement.textContent = sortedSeats.length;


/*
=========================================================
    8. CALCULATE BOOKING AMOUNT
=========================================================
*/
const totalSeatFare = sortedSeats.length * selectedFare;

// GST = 5%
const gstRate = 0.05;

const gstAmount = totalSeatFare * gstRate;

const totalAmount = totalSeatFare + gstAmount;


// Display calculated amounts
seatFareElement.textContent =
    "₹" + totalSeatFare.toFixed(2);

gstAmountElement.textContent =
    "₹" + gstAmount.toFixed(2);

totalAmountElement.textContent =
    "₹" + totalAmount.toFixed(2);


/*
=========================================================
    9. CREATE ONE PASSENGER FORM PER SELECTED SEAT
=========================================================
*/

function createPassengerForms() {

    // Clear any existing forms
    passengerContainer.innerHTML = "";


    // Create one form card for each selected seat
    sortedSeats.forEach(function (seatNumber, index) {

        const passengerCard = document.createElement("div");

        passengerCard.className = "passenger-details";


        // Passenger card heading
        const heading = document.createElement("h3");

        heading.textContent =
            "Passenger " + (index + 1) + " - Seat " + seatNumber;

        passengerCard.appendChild(heading);


        // Passenger name
        passengerCard.innerHTML += `
            <div class="form-group">
                <label for="passengerName${index}">Passenger Name</label>
                <input
                    type="text"
                    id="passengerName${index}"
                    class="passenger-name"
                    placeholder="Enter passenger name"
                    required
                    minlength="3">
            </div>

            <div class="form-row">

                <div class="form-group">
                    <label for="passengerAge${index}">Age</label>
                    <input
                        type="number"
                        id="passengerAge${index}"
                        class="passenger-age"
                        placeholder="Enter age"
                        min="1"
                        max="120"
                        step="1"
                        required>
                </div>

                <div class="form-group">
                    <label for="passengerGender${index}">Gender</label>
                    <select
                        id="passengerGender${index}"
                        class="passenger-gender"
                        required>

                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>

                    </select>
                </div>

            </div>

            <div class="form-group">
                <label for="passengerPhone${index}">Phone Number</label>
                <input
                    type="tel"
                    id="passengerPhone${index}"
                    class="passenger-phone"
                    placeholder="Enter phone number"
                    maxlength="10"
                    required>
            </div>

            <div class="form-group">
                <label for="passengerEmail${index}">Email</label>
                <input
                    type="email"
                    id="passengerEmail${index}"
                    class="passenger-email"
                    placeholder="Enter email address"
                    required>
            </div>
        `;


        // Store this seat number on its passenger form card
        passengerCard.dataset.seatNumber = seatNumber;


        // Add passenger card to the page
        passengerContainer.appendChild(passengerCard);

    });

}


// Call the function to create the passenger forms
createPassengerForms();


/*
=========================================================
    10. SHOW BOOKING MESSAGE
=========================================================
*/

function showBookingMessage(message, type) {

    bookingMessage.textContent = message;

    bookingMessage.classList.remove("error", "success");

    bookingMessage.classList.add(type);
}


/*
=========================================================
    11. FORM SUBMIT
=========================================================
*/

bookingForm.addEventListener("submit", async function (event) {

    // Stop browser page refresh
    event.preventDefault();


    // Clear previous message
    bookingMessage.textContent = "";

    bookingMessage.classList.remove("error", "success");

    // =====================================================
    // PAYMENT METHOD VALIDATION
    // =====================================================

    const selectedPayment =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );


    if (!selectedPayment) {

        showBookingMessage(
            "Please select a payment method.",
            "error"
        );

        return;
    }


    const paymentMethod =
        selectedPayment.value;

    /*
    =====================================================
        12. GET ALL PASSENGER DETAILS
    =====================================================
    */

    const passengerCards = document.querySelectorAll(
        ".passenger-details"
    );

    const passengers = [];


    for (const card of passengerCards) {

        const seatNumber = card.dataset.seatNumber;

        const name = card.querySelector(
            ".passenger-name"
        ).value.trim();

        const age = Number(
            card.querySelector(".passenger-age").value
        );

        const gender = card.querySelector(
            ".passenger-gender"
        ).value;

        const phone = card.querySelector(
            ".passenger-phone"
        ).value.trim();

        const email = card.querySelector(
            ".passenger-email"
        ).value.trim();


        /*
        =================================================
            13. VALIDATE PASSENGER NAME
        =================================================
        */

        if (name.length < 3) {

            showBookingMessage(
                "Please enter a valid name for seat " + seatNumber + ".",
                "error"
            );

            return;
        }


        /*
        =================================================
            14. VALIDATE AGE
        =================================================
        */

        if (
            !Number.isInteger(age) ||
            age < 1 ||
            age > 120
        ) {

            showBookingMessage(
                "Please enter a valid age for seat " + seatNumber + ".",
                "error"
            );

            return;
        }


        /*
        =================================================
            15. VALIDATE GENDER
        =================================================
        */

        if (!gender) {

            showBookingMessage(
                "Please select gender for seat " + seatNumber + ".",
                "error"
            );

            return;
        }


        /*
        =================================================
            16. VALIDATE PHONE NUMBER
        =================================================
        */

        const phonePattern = /^[0-9]{10}$/;

        if (!phonePattern.test(phone)) {

            showBookingMessage(
                "Enter a valid 10-digit phone number for seat " + seatNumber + ".",
                "error"
            );

            return;
        }


        /*
        =================================================
            17. VALIDATE EMAIL
        =================================================
        */

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            showBookingMessage(
                "Enter a valid email address for seat " + seatNumber + ".",
                "error"
            );

            return;
        }


        /*
        =================================================
            18. ADD PASSENGER TO ARRAY
        =================================================
        */

        passengers.push({

            seatNumber: seatNumber,

            name: name,

            age: age,

            gender: gender,

            phone: phone,

            email: email

        });

    }

    /*
    =====================================================
    
        19. SAVE PASSENGER DETAILS FOR PAYMENT FLOW
    
    =====================================================
    */

    // Save passenger details temporarily
    // Booking will be created only after payment confirmation

    localStorage.setItem(
        "bookingPassengers",
        JSON.stringify(passengers)
    );


    // =====================================================
    // SAVE SELECTED PAYMENT METHOD
    // =====================================================

    localStorage.setItem(
        "selectedPaymentMethod",
        paymentMethod
    );


    // =====================================================
    // REMOVE OLD PAYMENT DATA
    // =====================================================

    localStorage.removeItem(
        "paymentStatus"
    );

    localStorage.removeItem(
        "paymentMethod"
    );

    localStorage.removeItem(
        "paymentAmount"
    );


    // =====================================================
    // 20. GO TO PAYMENT PAGE
    // =====================================================

    window.location.href =
        "payment.html";


});

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