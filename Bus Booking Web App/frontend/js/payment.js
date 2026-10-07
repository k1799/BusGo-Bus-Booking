// =====================================================
// 1. GET DATA FROM LOCAL STORAGE
// =====================================================

const selectedBusName =
    localStorage.getItem("selectedBusName");

const selectedBusSource =
    localStorage.getItem("selectedBusSource");

const selectedBusDestination =
    localStorage.getItem("selectedBusDestination");

const journeyDate =
    localStorage.getItem("journeyDate");

const selectedBusFare =
    Number(localStorage.getItem("selectedBusFare")) || 0;

const selectedSeats =
    JSON.parse(
        localStorage.getItem("selectedSeats") || "[]"
    );

const selectedPaymentMethod =
    localStorage.getItem("selectedPaymentMethod");


// =====================================================
// 2. GET HTML ELEMENTS
// =====================================================

const busNameElement =
    document.getElementById("busName");

const routeElement =
    document.getElementById("route");

const journeyDateElement =
    document.getElementById("journeyDate");

const selectedSeatsElement =
    document.getElementById("selectedSeats");

const seatFareElement =
    document.getElementById("seatFare");

const gstAmountElement =
    document.getElementById("gstAmount");

const totalAmountElement =
    document.getElementById("totalAmount");

const paymentMethodElement =
    document.getElementById("paymentMethod");

const payButton =
    document.getElementById("payButton");

const backToBookingButton =
    document.getElementById("backToBookingButton");

const paymentMessage =
    document.getElementById("paymentMessage");


// =====================================================
// 3. CHECK REQUIRED DATA
// =====================================================

if (
    !selectedBusName ||
    !journeyDate ||
    selectedSeats.length === 0
) {

    alert(
        "Booking information is missing. Please start the booking again."
    );

    window.location.href =
        "buses.html";
}


// =====================================================
// 4. DISPLAY BUS DETAILS
// =====================================================

if (busNameElement) {

    busNameElement.textContent =
        selectedBusName || "--";
}


// =====================================================
// 5. DISPLAY ROUTE
// =====================================================

if (routeElement) {

    routeElement.textContent =
        (selectedBusSource || "--")
        + " → "
        + (selectedBusDestination || "--");
}


// =====================================================
// 6. DISPLAY JOURNEY DATE
// =====================================================

if (journeyDateElement) {

    journeyDateElement.textContent =
        journeyDate || "--";
}


// =====================================================
// 7. DISPLAY SELECTED SEATS
// =====================================================

if (selectedSeatsElement) {

    const sortedSeats =
        [...selectedSeats].sort(
            (a, b) => a - b
        );

    selectedSeatsElement.textContent =
        sortedSeats.join(", ");
}


// =====================================================
// 8. CALCULATE PAYMENT
// =====================================================

const seatCount =
    selectedSeats.length;


const seatFare =
    seatCount * selectedBusFare;


// GST = 5%

const gstRate =
    0.05;


const gstAmount =
    seatFare * gstRate;


const totalAmount =
    seatFare + gstAmount;


// =====================================================
// 9. DISPLAY PAYMENT AMOUNTS
// =====================================================

if (seatFareElement) {

    seatFareElement.textContent =
        "₹" + seatFare.toFixed(2);
}


if (gstAmountElement) {

    gstAmountElement.textContent =
        "₹" + gstAmount.toFixed(2);
}


if (totalAmountElement) {

    totalAmountElement.textContent =
        "₹" + totalAmount.toFixed(2);
}


// =====================================================
// 10. DISPLAY PAYMENT METHOD
// =====================================================

let paymentMethodText =
    "--";


if (selectedPaymentMethod === "GOOGLE_PAY") {

    paymentMethodText =
        "Google Pay";

} else if (selectedPaymentMethod === "PHONEPE") {

    paymentMethodText =
        "PhonePe";

} else if (selectedPaymentMethod === "UPI") {

    paymentMethodText =
        "UPI";
}


if (paymentMethodElement) {

    paymentMethodElement.textContent =
        paymentMethodText;
}


// =====================================================
// 11. UPDATE PAY BUTTON
// =====================================================

if (payButton) {

    payButton.textContent =
        "Pay ₹" + totalAmount.toFixed(2);
}


// =====================================================
// 12. BACK TO BOOKING
// =====================================================

if (backToBookingButton) {

    backToBookingButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "booking.html";

        }
    );
}


// =====================================================
// 13. PAY BUTTON
// =====================================================

if (payButton) {

    payButton.addEventListener(
        "click",
        function () {

            // Disable button
            payButton.disabled = true;

            payButton.textContent =
                "Processing Payment...";


            // Show processing message
            if (paymentMessage) {

                paymentMessage.textContent =
                    "Processing your demo payment...";

            }


            // =================================================
            // DEMO PAYMENT DELAY
            // =================================================

            setTimeout(
                function () {

                    // Save payment information
                    localStorage.setItem(
                        "paymentStatus",
                        "SUCCESS"
                    );

                    localStorage.setItem(
                        "paymentMethod",
                        paymentMethodText
                    );

                    localStorage.setItem(
                        "paymentAmount",
                        totalAmount.toFixed(2)
                    );


                    // Redirect to booking confirmation flow
                    window.location.href =
                        "booking-confirmation.html";

                },
                2000
            );

        }
    );
}