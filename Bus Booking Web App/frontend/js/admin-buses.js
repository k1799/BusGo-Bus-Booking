/*
=========================================================
BUSGO - ADMIN BUSES JAVASCRIPT

This file handles:

1. Admin authentication
2. Load buses from backend
3. Display buses
4. Add bus
5. Edit bus
6. Disable bus
7. Activate bus
8. Form validation
9. Form messages
10. Logout
=========================================================
*/


/* =========================================================
   1. CHECK ADMIN LOGIN
   ========================================================= */

const token =
    localStorage.getItem("token");

const userRole =
    localStorage.getItem("userRole");


if (!token || userRole !== "ADMIN") {

    window.location.href =
        "admin-login.html";

}


/* =========================================================
   2. GET HTML ELEMENTS
   ========================================================= */

const addBusButton =
    document.getElementById("addBusButton");

const busFormSection =
    document.getElementById("busFormSection");

const busForm =
    document.getElementById("busForm");

const busFormTitle =
    document.getElementById("busFormTitle");

const busFormMessage =
    document.getElementById("busFormMessage");

const cancelBusButton =
    document.getElementById("cancelBusButton");

const cancelBusButtonBottom =
    document.getElementById(
        "cancelBusButtonBottom"
    );

const busTableBody =
    document.getElementById(
        "busTableBody"
    );

const totalBuses =
    document.getElementById(
        "totalBuses"
    );

const activeBuses =
    document.getElementById(
        "activeBuses"
    );

const disabledBuses =
    document.getElementById(
        "disabledBuses"
    );


/*
   This variable stores the ID
   when editing a bus.

   null = Add mode
   number = Edit mode
*/

let editingBusId = null;


/* =========================================================
   3. LOAD BUSES
   ========================================================= */

async function loadBuses() {

    try {

        const response =
            await fetch(
                "http://localhost:8080/api/admin/buses",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        /* =============================================
           AUTHORIZATION ERROR
           ============================================= */

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            logoutAdmin();

            return;

        }


        if (!response.ok) {

            throw new Error(
                "Failed to load buses"
            );

        }


        const buses =
            await response.json();


        console.log(
            "Buses:",
            buses
        );


        displayBuses(buses);


    } catch (error) {

        console.error(
            "Load buses error:",
            error
        );


        busTableBody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    style="text-align:center;">
                    Unable to load buses.
                </td>
            </tr>
        `;

    }

}


/* =========================================================
   4. DISPLAY BUSES
   ========================================================= */

function displayBuses(buses) {

    /*
       Clear old table data.
    */

    busTableBody.innerHTML = "";


    /*
       Update summary cards.
    */

    updateBusSummary(buses);


    /*
       No buses.
    */

    if (
        !buses ||
        buses.length === 0
    ) {

        busTableBody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    style="text-align:center;">
                    No buses available.
                </td>
            </tr>
        `;

        return;

    }


    /*
       Create table row
       for every bus.
    */

    buses.forEach(
        function (bus) {

            const row =
                document.createElement("tr");


            /*
               Status UI
            */

            const isActive =
                bus.status === "ACTIVE";


            const statusClass =
                isActive
                    ? "active"
                    : "disabled";


            const statusText =
                isActive
                    ? "Active"
                    : "Disabled";


            /*
               Action button
            */

            const actionButtonClass =
                isActive
                    ? "bus-disable-button"
                    : "bus-activate-button";


            const actionButtonText =
                isActive
                    ? "Disable"
                    : "Activate";


            row.innerHTML = `

                <!-- Bus -->

                <td class="bus-name-cell">

                    <strong>
                        ${bus.busName}
                    </strong>

                    <span>
                        ${bus.busNumber}
                    </span>

                </td>


                <!-- Route -->

                <td>

                    <div class="bus-route-cell">

                        <span>
                            ${bus.source}
                        </span>

                        <span class="arrow">
                            →
                        </span>

                        <span>
                            ${bus.destination}
                        </span>

                    </div>

                </td>


                <!-- Departure -->

                <td>
                    ${formatTime(bus.departureTime)}
                </td>


                <!-- Arrival -->

                <td>
                    ${formatTime(bus.arrivalTime)}
                </td>


                <!-- Seats -->

                <td>
                    ${bus.totalSeats}
                </td>


                <!-- Fare -->

                <td class="bus-fare-cell">
                    ₹${bus.fare}
                </td>


                <!-- Status -->

                <td>

                    <span
                        class="admin-status ${statusClass}">

                        ${statusText}

                    </span>

                </td>


                <!-- Actions -->

                <td>

                    <div class="bus-actions">

                        <button
                            type="button"
                            class="bus-edit-button"
                            data-bus-id="${bus.id}">

                            Edit

                        </button>


                        <button
                            type="button"
                            class="${actionButtonClass}"
                            data-bus-id="${bus.id}">

                            ${actionButtonText}

                        </button>

                    </div>

                </td>

            `;


            busTableBody.appendChild(row);

        }
    );


    /*
       Add click events after
       rows are created.
    */

    attachBusButtonEvents();

}


/* =========================================================
   5. UPDATE BUS SUMMARY
   ========================================================= */

function updateBusSummary(buses) {

    const total =
        buses.length;


    const active =
        buses.filter(
            function (bus) {

                return bus.status === "ACTIVE";

            }
        ).length;


    const disabled =
        buses.filter(
            function (bus) {

                return bus.status === "DISABLED";

            }
        ).length;


    totalBuses.textContent =
        total;

    activeBuses.textContent =
        active;

    disabledBuses.textContent =
        disabled;

}


/* =========================================================
   6. FORMAT TIME
   ========================================================= */

/*
   Backend stores:

   08:00 AM

   or

   08:00

   We support both.
*/

function formatTime(time) {

    if (!time) {

        return "";

        
    }

     return time.substring(0, 5);

    /*
       Already 12-hour format.
    */

    if (
        time.includes("AM") ||
        time.includes("PM")
    ) {

        return time;

    }


    /*
       Convert 24-hour time
       to 12-hour time.
    */

    const parts =
        time.split(":");


    if (parts.length < 2) {

        return time;

    }


    let hours =
        Number(parts[0]);

    const minutes =
        parts[1];


    const period =
        hours >= 12
            ? "PM"
            : "AM";


    if (hours === 0) {

        hours = 12;

    } else if (hours > 12) {

        hours -= 12;

    }


    return (
        String(hours).padStart(2, "0")
        + ":"
        + minutes
        + " "
        + period
    );


}


/* =========================================================
   7. SHOW ADD BUS FORM
   ========================================================= */

addBusButton.addEventListener(
    "click",
    function () {

        editingBusId = null;


        busFormTitle.textContent =
            "Add New Bus";


        busForm.reset();


        document.getElementById(
            "totalSeats"
        ).value = 40;


        document.getElementById(
            "busStatus"
        ).value = "ACTIVE";


        clearFormMessage();


        busFormSection.classList.add(
            "show"
        );

    }
);


/* =========================================================
   8. CLOSE FORM
   ========================================================= */

function closeBusForm() {

    busFormSection.classList.remove(
        "show"
    );

    editingBusId = null;

    clearFormMessage();

}


cancelBusButton.addEventListener(
    "click",
    closeBusForm
);


cancelBusButtonBottom.addEventListener(
    "click",
    closeBusForm
);


/* =========================================================
   9. CLEAR FORM MESSAGE
   ========================================================= */

function clearFormMessage() {

    busFormMessage.textContent = "";

    busFormMessage.classList.remove(
        "error",
        "success"
    );

}


/* =========================================================
   10. EDIT BUS
   ========================================================= */

async function editBus(id) {

    try {

        const response =
            await fetch(
                "http://localhost:8080/api/admin/buses/"
                + id,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            logoutAdmin();

            return;

        }


        if (!response.ok) {

            throw new Error(
                "Bus not found"
            );

        }


        const bus =
            await response.json();


        /*
           Store ID.
        */

        editingBusId =
            bus.id;


        /*
           Change heading.
        */

        busFormTitle.textContent =
            "Edit Bus";


        /*
           Fill form.
        */

        document.getElementById(
            "busName"
        ).value =
            bus.busName;


        document.getElementById(
            "busNumber"
        ).value =
            bus.busNumber;


        document.getElementById(
            "fromLocation"
        ).value =
            bus.source;


        document.getElementById(
            "toLocation"
        ).value =
            bus.destination;


        document.getElementById(
            "departureTime"
        ).value =
            convertToInputTime(
                bus.departureTime
            );


        document.getElementById(
            "arrivalTime"
        ).value =
            convertToInputTime(
                bus.arrivalTime
            );


        document.getElementById(
            "totalSeats"
        ).value =
            bus.totalSeats;


        document.getElementById(
            "fare"
        ).value =
            bus.fare;


        document.getElementById(
            "busStatus"
        ).value =
            bus.status;


        clearFormMessage();


        busFormSection.classList.add(
            "show"
        );


        /*
           Scroll to form.
        */

        busFormSection.scrollIntoView({
            behavior: "smooth"
        });


    } catch (error) {

        console.error(
            "Edit bus error:",
            error
        );

        alert(
            "Unable to load bus details."
        );

    }

}


/* =========================================================
   11. ATTACH EDIT / DISABLE BUTTON EVENTS
   ========================================================= */

function attachBusButtonEvents() {

    const editButtons =
        document.querySelectorAll(
            ".bus-edit-button"
        );


    editButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const id =
                        button.dataset.busId;

                    editBus(id);

                }
            );

        }
    );


    const actionButtons =
        document.querySelectorAll(
            ".bus-disable-button, .bus-activate-button"
        );


    actionButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const id =
                        button.dataset.busId;


                    if (
                        button.classList.contains(
                            "bus-disable-button"
                        )
                    ) {

                        changeBusStatus(
                            id,
                            "DISABLED"
                        );

                    } else {

                        changeBusStatus(
                            id,
                            "ACTIVE"
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   12. CHANGE BUS STATUS
   ========================================================= */

async function changeBusStatus(
    id,
    newStatus
) {

    const confirmMessage =
        newStatus === "DISABLED"
            ? "Are you sure you want to disable this bus?"
            : "Do you want to activate this bus?";


    if (!confirm(confirmMessage)) {

        return;

    }


    try {

        /*
           First get current bus details.
        */

        const getResponse =
            await fetch(
                "http://localhost:8080/api/admin/buses/"
                + id,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        if (!getResponse.ok) {

            throw new Error(
                "Unable to get bus"
            );

        }


        const bus =
            await getResponse.json();


        /*
           PUT same bus details
           with new status.
        */

        const response =
            await fetch(
                "http://localhost:8080/api/admin/buses/"
                + id,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token
                    },

                    body: JSON.stringify({

                        busNumber:
                            bus.busNumber,

                        busName:
                            bus.busName,

                        source:
                            bus.source,

                        destination:
                            bus.destination,

                        departureTime:
                            bus.departureTime,

                        arrivalTime:
                            bus.arrivalTime,

                        fare:
                            bus.fare,

                        totalSeats:
                            bus.totalSeats,

                        status:
                            newStatus

                    })

                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            logoutAdmin();

            return;

        }


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                "Unable to update bus status"
            );

        }


        /*
           Reload latest data.
        */

        await loadBuses();


    } catch (error) {

        console.error(
            "Change status error:",
            error
        );


        alert(
            "Unable to change bus status."
        );

    }

}


/* =========================================================
   13. SAVE BUS
   ========================================================= */

busForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        clearFormMessage();


        /*
           Get values.
        */

        const busName =
            document.getElementById(
                "busName"
            ).value.trim();


        const busNumber =
            document.getElementById(
                "busNumber"
            ).value.trim();


        const fromLocation =
            document.getElementById(
                "fromLocation"
            ).value.trim();


        const toLocation =
            document.getElementById(
                "toLocation"
            ).value.trim();


        const departureTime =
            document.getElementById(
                "departureTime"
            ).value;


        const arrivalTime =
            document.getElementById(
                "arrivalTime"
            ).value;


        const totalSeats =
            Number(
                document.getElementById(
                    "totalSeats"
                ).value
            );


        const fare =
            Number(
                document.getElementById(
                    "fare"
                ).value
            );


        const busStatus =
            document.getElementById(
                "busStatus"
            ).value;


        /* =================================================
           VALIDATION
           ================================================= */

        if (
            busName === "" ||
            busNumber === "" ||
            fromLocation === "" ||
            toLocation === "" ||
            departureTime === "" ||
            arrivalTime === ""
        ) {

            showFormError(
                "Please fill all bus details."
            );

            return;

        }


        if (
            fromLocation.toLowerCase() ===
            toLocation.toLowerCase()
        ) {

            showFormError(
                "From and To locations must be different."
            );

            return;

        }


        if (totalSeats <= 0) {

            showFormError(
                "Total seats must be greater than 0."
            );

            return;

        }


        if (fare <= 0) {

            showFormError(
                "Fare must be greater than 0."
            );

            return;

        }


        /* =================================================
           REQUEST BODY
           ================================================= */

        const busData = {

            busNumber:
                busNumber,

            busName:
                busName,

            source:
                fromLocation,

            destination:
                toLocation,

            departureTime:
                departureTime,

            arrivalTime:
                arrivalTime,

            fare:
                fare,

            totalSeats:
                totalSeats,

            status:
                busStatus

        };


        try {

            let url =
                "http://localhost:8080/api/admin/buses";


            let method =
                "POST";


            /*
               If editing:
               PUT /api/admin/buses/{id}
            */

            if (editingBusId !== null) {

                url =
                    "http://localhost:8080/api/admin/buses/"
                    + editingBusId;

                method =
                    "PUT";

            }


            const response =
                await fetch(
                    url,
                    {
                        method: method,

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                "Bearer " + token

                        },

                        body:
                            JSON.stringify(
                                busData
                            )

                    }
                );


            /* =================================================
               AUTH ERROR
               ================================================= */

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                logoutAdmin();

                return;

            }


            /*
               Read backend response.
            */

            const responseText =
                await response.text();


            if (!response.ok) {

                throw new Error(
                    responseText ||
                    "Unable to save bus"
                );

            }


            /* =================================================
               SUCCESS
               ================================================= */

            showFormSuccess(
                editingBusId === null
                    ? "Bus added successfully."
                    : "Bus updated successfully."
            );


            /*
               Reload bus table.
            */

            await loadBuses();


            /*
               Close form after short delay.
            */

            setTimeout(
                function () {

                    closeBusForm();

                },
                700
            );


        } catch (error) {

            console.error(
                "Save bus error:",
                error
            );


            /*
               Backend RuntimeException
               message may come here.
            */

            showFormError(
                error.message ||
                "Unable to save bus."
            );

        }

    }
);


/* =========================================================
   14. FORM ERROR
   ========================================================= */

function showFormError(message) {

    busFormMessage.textContent =
        message;

    busFormMessage.classList.remove(
        "success"
    );

    busFormMessage.classList.add(
        "error"
    );

}


/* =========================================================
   15. FORM SUCCESS
   ========================================================= */

function showFormSuccess(message) {

    busFormMessage.textContent =
        message;

    busFormMessage.classList.remove(
        "error"
    );

    busFormMessage.classList.add(
        "success"
    );

}


/* =========================================================
   16. CONVERT TIME
   ========================================================= */

function convertToInputTime(timeText) {

    if (!timeText) {

        return "";

    }


    /*
       Backend may return:

       08:00

       or

       08:00 AM
    */

    if (
        !timeText.includes("AM") &&
        !timeText.includes("PM")
    ) {

        return timeText;

    }


    const parts =
        timeText.trim().split(" ");


    if (parts.length !== 2) {

        return "";

    }


    const time =
        parts[0];

    const period =
        parts[1].toUpperCase();


    const timeParts =
        time.split(":");


    if (timeParts.length !== 2) {

        return "";

    }


    let hours =
        Number(timeParts[0]);


    const minutes =
        timeParts[1];


    if (
        period === "PM" &&
        hours !== 12
    ) {

        hours += 12;

    }


    if (
        period === "AM" &&
        hours === 12
    ) {

        hours = 0;

    }


    return (
        String(hours).padStart(2, "0")
        + ":"
        + minutes
    );

}


/* =========================================================
   17. LOGOUT
   ========================================================= */

function logoutAdmin() {

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


/* =========================================================
   18. LOGOUT BUTTON
   ========================================================= */

const logoutLink =
    document.querySelector(
        ".admin-nav a.logout"
    );


if (logoutLink) {

    logoutLink.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmLogout) {

                return;

            }


            logoutAdmin();

        }
    );

}


/* =========================================================
   19. LOAD DATA WHEN PAGE OPENS
   ========================================================= */

loadBuses();