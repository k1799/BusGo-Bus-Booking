/*
=========================================================
BUSGO - BOOKING SUCCESS PAGE JAVASCRIPT

This file handles:

1. Reading backend booking response
2. Displaying booking ID
3. Displaying passenger details
4. Displaying selected seats
5. Displaying bus details
6. Displaying final amount
7. Displaying booking status
8. Printing ticket
=========================================================
*/

/*
=========================================================
1.1. CHECK LOGIN
=========================================================
*/

const token = localStorage.getItem("token");

if (!token) {

    // Customer is not logged in
    window.location.href = "login.html";

}

/*
=========================================================
1.2. GET BOOKING DATA
=========================================================
*/

const bookingData =
    JSON.parse(
        localStorage.getItem("bookingData")
    );



// Convert YYYY-MM-DD into readable date
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

    return day + " "
        + monthNames[Number(month) - 1]
        + " " + year;
}


/*
=========================================================
2. GET SELECTED BUS DATA
=========================================================
*/

const selectedBusName =
    bookingData?.busName;

const selectedBusNumber =
    bookingData?.busNumber;

const selectedBusSource =
    bookingData?.source;

const selectedBusDestination =
    bookingData?.destination;

const selectedBusDeparture =
    bookingData?.departureTime;

const selectedBusArrival =
    bookingData?.arrivalTime;

/*
=========================================================
3. CHECK BOOKING DATA
=========================================================
*/

if (!bookingData) {

    alert(
        "Booking information not found."
    );

    window.location.href =
        "buses.html";
}


/*
=========================================================
4. DISPLAY BOOKING INFORMATION
=========================================================
*/

if (bookingData) {


    /*
    -----------------------------------------------------
    Booking ID
    -----------------------------------------------------
    */

    const bookingIdElement =
        document.getElementById(
            "bookingId"
        );

    if (bookingIdElement) {

        bookingIdElement.textContent =
            bookingData.bookingId;
    }


    /*
    -----------------------------------------------------
    Passenger Name
    -----------------------------------------------------
    */

    const passengerNameElement =
        document.getElementById(
            "passengerName"
        );

    if (passengerNameElement) {

        passengerNameElement.textContent =
            bookingData.passengerName;
    }


    /*
    -----------------------------------------------------
    Selected Seats
    -----------------------------------------------------
    */

    const seatNumberElement =
        document.getElementById(
            "seatNumber"
        );

    if (seatNumberElement) {

        seatNumberElement.textContent =
            bookingData.seatNumbers;
    }


    /*
    -----------------------------------------------------
    Bus Name
    -----------------------------------------------------
    */

    const busNameElement =
        document.getElementById(
            "busName"
        );

    if (
        busNameElement &&
        selectedBusName
    ) {

        busNameElement.textContent =
            selectedBusName;
    }


    /*
    -----------------------------------------------------
    Bus Number
    -----------------------------------------------------
    */

    const busNumberElement =
        document.getElementById(
            "busNumber"
        );

    if (
        busNumberElement &&
        selectedBusNumber
    ) {

        busNumberElement.textContent =
            selectedBusNumber;
    }


    /*
    -----------------------------------------------------
    Seat Fare

    Backend total amount is final.

    We can calculate seat fare here only
    for display using the selected bus fare
    and seat count.

    This is NOT used for booking calculation.
    -----------------------------------------------------
    */

    // =====================================================
    // PAYMENT DETAILS
    // =====================================================

    // Backend amount values
    const seatFare =
        Number(bookingData.baseAmount) || 0;

    const gstAmount =
        Number(bookingData.gstAmount) || 0;

    const totalAmount =
        Number(bookingData.totalAmount) || 0;


    // Get HTML elements
    const seatFareElement =
        document.getElementById("seatFare");

    const gstAmountElement =
        document.getElementById("gstAmount");

    const totalAmountElement =
        document.getElementById("totalAmount");


    // Display Seat Fare
    if (seatFareElement) {

        seatFareElement.textContent =
            "₹" + seatFare.toFixed(2);

    }


    // Display GST
    if (gstAmountElement) {

        gstAmountElement.textContent =
            "₹" + gstAmount.toFixed(2);

    }


    // Display Total
    if (totalAmountElement) {

        totalAmountElement.textContent =
            "₹" + totalAmount.toFixed(2);

    }



    /*
    -----------------------------------------------------
    Payment Status

    This project currently does NOT have
    a real payment gateway.

    So don't show "Paid".

    Show booking status instead.
    -----------------------------------------------------
    */

    const paymentStatusElement =
        document.querySelector(
            ".payment-paid"
        );

    if (paymentStatusElement) {

        paymentStatusElement.textContent =
            bookingData.status;
    }

    // =====================================================
    // JOURNEY DETAILS
    // =====================================================

    const fromLocationElement =
        document.getElementById("fromLocation");

    const toLocationElement =
        document.getElementById("toLocation");

    const departureTimeElement =
        document.getElementById("departureTime");

    const arrivalTimeElement =
        document.getElementById("arrivalTime");


    // From
    if (fromLocationElement) {
        fromLocationElement.textContent =
            selectedBusSource || "--";
    }


    // To
    if (toLocationElement) {
        toLocationElement.textContent =
            selectedBusDestination || "--";
    }


    // Departure
    if (departureTimeElement) {
        departureTimeElement.textContent =
            selectedBusDeparture || "--";
    }


    // Arrival
    if (arrivalTimeElement) {
        arrivalTimeElement.textContent =
            selectedBusArrival || "--";
    }
    /*
    -----------------------------------------------------
     Journey Date
    -----------------------------------------------------
    */

    const journeyDateElement =
        document.getElementById(
            "journeyDate"
        );

    const ticketJourneyDateElement =
        document.getElementById("ticketJourneyDate");

    if (journeyDateElement) {

        journeyDateElement.textContent =
            formatJourneyDate(
                bookingData.journeyDate
            );
    }

    if (ticketJourneyDateElement) {
        ticketJourneyDateElement.textContent =
            formatJourneyDate(bookingData.journeyDate);
    }
}



// =====================================================
// DOWNLOAD TICKET AS PDF
// =====================================================

const printTicketButton =
    document.getElementById("printTicketButton");

if (printTicketButton) {

    printTicketButton.addEventListener("click", async function () {

        const ticketPdfContent =
            document.getElementById("ticketPdfContent");

        if (!ticketPdfContent) {
            alert("Ticket information not found.");
            return;
        }

        const bookingId =
            bookingData && bookingData.bookingId
                ? bookingData.bookingId
                : "BusGo-Ticket";

        // PDF-only layout
        ticketPdfContent.style.width = "694px";
        ticketPdfContent.style.maxWidth = "694px";
        ticketPdfContent.style.margin = "0 auto";
        ticketPdfContent.style.background = "#ffffff";
        ticketPdfContent.style.padding = "20px";
        ticketPdfContent.style.boxSizing = "border-box";

        const pdfOptions = {
            margin: 8,

            filename:
                "BusGo_Ticket_" +
                bookingId +
                ".pdf",

            image: {
                type: "jpeg",
                quality: 1
            },

            html2canvas: {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
                scrollX: 0,
                scrollY: 0
            },

            jsPDF: {
                unit: "mm",
                format: "a4",
                orientation: "portrait"
            },

            pagebreak: {
                mode: ["avoid-all"]
            }
        };

        try {

            await html2pdf()
                .set(pdfOptions)
                .from(ticketPdfContent)
                .save();

        } catch (error) {

            console.error("PDF Error:", error);

            alert(
                "Unable to download ticket PDF. Please try again."
            );

        } finally {

            // Restore normal website layout
            ticketPdfContent.style.width = "";
            ticketPdfContent.style.maxWidth = "";
            ticketPdfContent.style.margin = "";
            ticketPdfContent.style.background = "";
            ticketPdfContent.style.padding = "";
            ticketPdfContent.style.boxSizing = "";
        }
    });
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