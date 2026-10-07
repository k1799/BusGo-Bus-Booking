/*
=========================================================
BUSGO - ADMIN USERS JAVASCRIPT

This file handles:

1. Load users from backend
2. Search users
3. Status filter
4. User summary
5. View user details
6. Block user
7. Activate user
8. Admin JWT authentication
=========================================================
*/


/* =========================================================
   1. API URL
   ========================================================= */

const API_URL =
    "http://localhost:8080/api/admin/users";


/* =========================================================
   2. GET ELEMENTS
   ========================================================= */

const userSearch =
    document.getElementById("userSearch");

const userStatusFilter =
    document.getElementById("userStatusFilter");

const userTableBody =
    document.getElementById("userTableBody");

const userDetailsSection =
    document.getElementById("userDetails");

const closeUserDetails =
    document.getElementById("closeUserDetails");

const noUsers =
    document.getElementById("noUsers");


/* =========================================================
   3. SUMMARY ELEMENTS
   ========================================================= */

const totalUsers =
    document.getElementById("totalUsers");

const activeUsers =
    document.getElementById("activeUsers");

const blockedUsers =
    document.getElementById("blockedUsers");

// const newUsers =
//     document.getElementById("newUsers");


/* =========================================================
   4. USER DATA
   ========================================================= */

let users = [];


/* =========================================================
   5. CHECK ADMIN LOGIN
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
   6. API REQUEST FUNCTION
   ========================================================= */

async function apiRequest(
    url,
    options = {}
) {

    const response =
        await fetch(
            url,
            {
                ...options,

                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " + token,

                    ...(options.headers || {})
                }
            }
        );


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


    if (!response.ok) {

        let errorMessage =
            "Request failed";

        try {

            const errorData =
                await response.json();

            errorMessage =
                errorData.message ||
                errorMessage;

        } catch (error) {
        }

        throw new Error(errorMessage);
    }


    return response.json();
}


/* =========================================================
   7. LOAD USERS
   ========================================================= */

async function loadUsers() {

    try {

        users =
            await apiRequest(API_URL);


        updateSummary();

        displayUsers(users);

    } catch (error) {

        console.error(
            "User load error:",
            error
        );

        alert(
            "Unable to load users."
        );
    }
}


/* =========================================================
   8. UPDATE SUMMARY
   ========================================================= */

function updateSummary() {

    const total =
        users.length;


    const active =
        users.filter(function (user) {

            return user.status &&
                user.status.toUpperCase() ===
                "ACTIVE";

        }).length;


    const blocked =
        users.filter(function (user) {

            return user.status &&
                user.status.toUpperCase() ===
                "BLOCKED";

        }).length;


    // const today =
    //     new Date();

    // const currentMonth =
    //     today.getMonth();

    // const currentYear =
    //     today.getFullYear();


    // const newUserCount =
    //     users.filter(function (user) {

    //         if (!user.registeredAt) {
    //             return false;
    //         }

    //         const date =
    //             new Date(user.registeredAt);

    //         return date.getMonth() ===
    //                 currentMonth &&
    //             date.getFullYear() ===
    //                 currentYear;

    //     }).length;


    totalUsers.textContent =
        total;

    activeUsers.textContent =
        active;

    blockedUsers.textContent =
        blocked;

    // newUsers.textContent =
    //     newUserCount;
}


/* =========================================================
   9. DISPLAY USERS
   ========================================================= */

function displayUsers(userList) {

    userTableBody.innerHTML = "";


    if (!userList ||
        userList.length === 0) {

        noUsers.classList.add("show");

        return;
    }


    noUsers.classList.remove("show");


    userList.forEach(function (user) {

        const row =
            document.createElement("tr");


        const status =
            user.status
                ? user.status.toUpperCase()
                : "";


        const statusClass =
            status === "ACTIVE"
                ? "active"
                : "blocked";


        const actionButton =
            status === "ACTIVE"

                ? `
                    <button
                        type="button"
                        class="user-block-button"
                        onclick="changeUserStatus(
                            ${user.id},
                            'blocked'
                        )"
                    >
                        Block
                    </button>
                  `

                : `
                    <button
                        type="button"
                        class="user-activate-button"
                        onclick="changeUserStatus(
                            ${user.id},
                            'active'
                        )"
                    >
                        Activate
                    </button>
                  `;


        row.innerHTML = `

            <td class="user-id-cell">
                ${user.id}
            </td>

            <td class="user-name-cell">
                <strong>
                    ${user.name || "-"}
                </strong>
            </td>

            <td class="user-email-cell">
                ${user.email || "-"}
            </td>

            <td class="user-phone-cell">
                ${user.phone || "-"}
            </td>

            <td>
                ${formatDate(user.registeredAt)}
            </td>

            <td class="user-booking-count">
                ${user.totalBookings || 0}
            </td>

            <td>

                <span class="status ${statusClass}">
                    ${status}
                </span>

            </td>

            <td>

                <div class="user-actions">

                    <button
                        type="button"
                        class="user-view-button"
                        onclick="viewUser(${user.id})"
                    >
                        View
                    </button>

                    ${actionButton}

                </div>

            </td>
        `;


        userTableBody.appendChild(row);

    });
}


/* =========================================================
   10. FORMAT DATE
   ========================================================= */

function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {
        return "-";
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================================================
   11. FILTER USERS
   ========================================================= */

function filterUsers() {

    const searchValue =
        userSearch.value
            .trim()
            .toLowerCase();


    const selectedStatus =
        userStatusFilter.value
            .toUpperCase();


    const filteredUsers =
        users.filter(function (user) {

            const text =
                (
                    user.name +
                    " " +
                    user.email +
                    " " +
                    user.phone
                ).toLowerCase();


            const searchMatch =
                searchValue === "" ||
                text.includes(searchValue);


            const statusMatch =
                selectedStatus === "ALL" ||
                user.status.toUpperCase() ===
                    selectedStatus;


            return searchMatch &&
                   statusMatch;
        });


    displayUsers(filteredUsers);
}


/* =========================================================
   12. VIEW USER
   ========================================================= */

async function viewUser(userId) {

    try {

        const user =
            await apiRequest(
                API_URL + "/" + userId
            );


        document.getElementById(
            "detailUserId"
        ).textContent =
            user.id;


        document.getElementById(
            "detailUserName"
        ).textContent =
            user.name || "-";


        document.getElementById(
            "detailUserEmail"
        ).textContent =
            user.email || "-";


        document.getElementById(
            "detailUserPhone"
        ).textContent =
            user.phone || "-";


        document.getElementById(
            "detailRegisteredDate"
        ).textContent =
            formatDate(
                user.registeredAt
            );


        document.getElementById(
            "detailUserStatus"
        ).textContent =
            user.status || "-";


        document.getElementById(
            "detailBookingCount"
        ).textContent =
            user.totalBookings || 0;


        document.getElementById(
            "detailUpcomingBookings"
        ).textContent =
            user.upcomingBookings || 0;


        document.getElementById(
            "detailCompletedBookings"
        ).textContent =
            user.completedBookings || 0;


        document.getElementById(
            "detailCancelledBookings"
        ).textContent =
            user.cancelledBookings || 0;


        localStorage.setItem(
            "adminSelectedUserId",
            user.id
        );


        userDetailsSection.classList.add(
            "show"
        );


        userDetailsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


    } catch (error) {

        console.error(
            "User details error:",
            error
        );

        alert(
            "Unable to load user details."
        );
    }
}


/* =========================================================
   13. BLOCK / ACTIVATE USER
   ========================================================= */

async function changeUserStatus(
    userId,
    newStatus
) {

    const action =
        newStatus === "blocked"
            ? "block"
            : "activate";


    const message =
        newStatus === "blocked"

            ? "Are you sure you want to block this user?"

            : "Do you want to activate this user?";


    const confirmed =
        confirm(message);


    if (!confirmed) {
        return;
    }


    try {

        const updatedUser =
            await apiRequest(
                API_URL +
                "/" +
                userId +
                "/" +
                action,
                {
                    method: "PUT"
                }
            );


        /* ================================================
           UPDATE LOCAL USER
           ================================================ */

        const index =
            users.findIndex(function (user) {

                return user.id === userId;

            });


        if (index !== -1) {

            users[index] =
                updatedUser;

        }


        updateSummary();

        filterUsers();


        alert(
            newStatus === "blocked"

                ? "User blocked successfully."

                : "User activated successfully."
        );


    } catch (error) {

        console.error(
            "User status error:",
            error
        );

        alert(
            error.message ||
            "Unable to change user status."
        );
    }
}


/* =========================================================
   14. CLOSE DETAILS
   ========================================================= */

if (closeUserDetails) {

    closeUserDetails.addEventListener(
        "click",
        function () {

            userDetailsSection.classList.remove(
                "show"
            );

        }
    );
}


/* =========================================================
   15. SEARCH EVENT
   ========================================================= */

userSearch.addEventListener(
    "input",
    filterUsers
);


/* =========================================================
   16. STATUS FILTER EVENT
   ========================================================= */

userStatusFilter.addEventListener(
    "change",
    filterUsers
);


/* =========================================================
   17. INITIAL LOAD
   ========================================================= */

loadUsers();