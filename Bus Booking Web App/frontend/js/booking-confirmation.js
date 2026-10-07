// =====================================================
// 1. GET REQUIRED DATA FROM LOCAL STORAGE
// =====================================================

const token =
    localStorage.getItem("token");

const selectedBusId =
    localStorage.getItem("selectedBusId");

const selectedBusName =
    localStorage.getItem("selectedBusName");

const selectedBusSource =
    localStorage.getItem("selectedBusSource");

const selectedBusDestination =
    localStorage.getItem("selectedBusDestination");

const journeyDate =
    localStorage.getItem("journeyDate");

const selectedSeats =
    JSON.parse(
        localStorage.getItem("selectedSeats") || "[]"
    );

const bookingPassengers =
    JSON.parse(
        localStorage.getItem("bookingPassengers") || "[]"
    );

const paymentStatus =
    localStorage.getItem("paymentStatus");

const paymentMethod =
    localStorage.getItem("paymentMethod");

const paymentAmount =
    localStorage.getItem("paymentAmount");


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

const paymentMethodElement =
    document.getElementById("paymentMethod");

const paymentAmountElement =
    document.getElementById("paymentAmount");

const confirmBookingButton =
    document.getElementById(
        "confirmBookingButton"
    );

const backToPaymentButton =
    document.getElementById(
        "backToPaymentButton"
    );

const confirmationMessage =
    document.getElementById(
        "confirmationMessage"
    );


// =====================================================
// 3. CHECK PAYMENT STATUS
// =====================================================

if (paymentStatus !== "SUCCESS") {

    alert(
        "Payment is not completed. Please complete payment first."
    );

    window.location.href =
        "payment.html";
}


// =====================================================
// 4. CHECK LOGIN TOKEN
// =====================================================

if (!token) {

    alert(
        "Please login to continue."
    );

    window.location.href =
        "login.html";
}


// =====================================================
// 5. DISPLAY BUS NAME
// =====================================================

if (busNameElement) {

    busNameElement.textContent =
        selectedBusName || "--";
}


// =====================================================
// 6. DISPLAY ROUTE
// =====================================================

if (routeElement) {

    routeElement.textContent =
        (selectedBusSource || "--")
        + " → "
        + (selectedBusDestination || "--");
}


// =====================================================
// 7. DISPLAY JOURNEY DATE
// =====================================================

if (journeyDateElement) {

    journeyDateElement.textContent =
        journeyDate || "--";
}


// =====================================================
// 8. DISPLAY SELECTED SEATS
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
// 9. DISPLAY PAYMENT METHOD
// =====================================================

if (paymentMethodElement) {

    paymentMethodElement.textContent =
        paymentMethod || "--";
}


// =====================================================
// 10. DISPLAY PAYMENT AMOUNT
// =====================================================

if (paymentAmountElement) {

    paymentAmountElement.textContent =
        "₹" +
        (Number(paymentAmount) || 0)
            .toFixed(2);
}


// =====================================================
// 11. BACK TO PAYMENT
// =====================================================

if (backToPaymentButton) {

    backToPaymentButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "payment.html";

        }
    );
}

console.log("Confirm button:", confirmBookingButton);
console.log("Booking confirmation JS loaded");
// =====================================================
// 12. CONFIRM BOOKING
// =====================================================

if (confirmBookingButton) {

    confirmBookingButton.addEventListener(
        "click",
        async function () {
console.log("Confirm Booking button clicked");
            // Disable button
            confirmBookingButton.disabled =
                true;

            confirmBookingButton.textContent =
                "Confirming Booking...";


            if (confirmationMessage) {

                confirmationMessage.textContent =
                    "Creating your booking...";

            }


            // =================================================
            // 13. CREATE BOOKING REQUEST
            // =================================================

            const bookingRequest = {

                busId:
                    Number(selectedBusId),

                journeyDate:
                    journeyDate,

                passengers:
                    bookingPassengers,
                paymentMethod: paymentMethod

            };


            try {

                // =================================================
                // 14. SEND BOOKING TO BACKEND
                // =================================================

                const response =
                    await fetch(
                        "http://localhost:8080/api/customer/bookings",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    "Bearer " + token
                            },

                            body:
                                JSON.stringify(
                                    bookingRequest
                                )
                        }
                    );


                // =================================================
                // 15. CHECK RESPONSE
                // =================================================

                if (!response.ok) {

                    const errorText =
                        await response.text();

                    throw new Error(
                        errorText ||
                        "Booking failed."
                    );
                }


                // =================================================
                // 16. GET BOOKING RESPONSE
                // =================================================

                const bookingData =
                    await response.json();


                // =================================================
                // 17. SAVE BOOKING DATA
                // =================================================

                localStorage.setItem(
                    "bookingData",
                    JSON.stringify(
                        bookingData
                    )
                );


                localStorage.setItem(
                    "selectedBookingId",
                    bookingData.bookingId
                );


                // =================================================
                // 18. CLEAR PAYMENT STATUS
                // =================================================

                localStorage.removeItem(
                    "paymentStatus"
                );

                localStorage.removeItem(
                    "paymentMethod"
                );

                localStorage.removeItem(
                    "paymentAmount"
                );


                // =================================================
                // 19. GO TO BOOKING SUCCESS
                // =================================================

                window.location.href =
                    "booking-success.html";

            } catch (error) {

                console.error(
                    "Booking Error:",
                    error
                );


                if (confirmationMessage) {

                    confirmationMessage.textContent =
                        "Unable to confirm booking. Please try again.";

                    confirmationMessage.style.color =
                        "#dc2626";
                }


                // Enable button again
                confirmBookingButton.disabled =
                    false;

                confirmBookingButton.textContent =
                    "Confirm Booking";
            }

        }
    );
}