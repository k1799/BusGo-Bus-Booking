/*
=========================================================

BUSGO - LOGIN PAGE JAVASCRIPT

This file handles:

1. Login form submit
2. Frontend validation
3. Backend login API call
4. JWT token receive
5. User details store
6. Role based redirect

=========================================================
*/

// =========================================================
// CHECK EXISTING LOGIN
// =========================================================

const token = localStorage.getItem("token");

if (token) {

    // Already logged in
    // No need to show login page

    window.location.href = "index.html";

}

// =========================================================
// PASSWORD SHOW / HIDE
// =========================================================

const passwordInput =
    document.getElementById("password");

const passwordToggle =
    document.getElementById("passwordToggle");


passwordToggle.addEventListener(
    "click",
    function () {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            passwordToggle.textContent = "🙈";

            passwordToggle.setAttribute(
                "aria-label",
                "Hide password"
            );

        } else {

            passwordInput.type = "password";

            passwordToggle.textContent = "👁";

            passwordToggle.setAttribute(
                "aria-label",
                "Show password"
            );

        }

    }
);

// =========================================================
// LOGIN FORM
// 
const loginForm =
    document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    // Get values from login form
    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("loginMessage");

    // Clear previous message
    message.textContent = "";
    message.classList.remove("error", "success");


    // ================================================
    // 1. Basic validation
    // ================================================

    if (email === "" || password === "") {

        message.textContent =
            "Please enter email and password.";

        message.classList.add("error");

        return;
    }


    // ================================================
    // 2. Email validation
    // ================================================

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {

        message.textContent =
            "Please enter a valid email address.";

        message.classList.add("error");

        return;
    }


    // ================================================
    // 3. Login data
    // ================================================

    const loginData = {

        email: email,

        password: password
    };


    try {

        // ============================================
        // 4. Call Spring Boot login API
        // ============================================

        const response = await fetch(
            "http://localhost:8080/api/auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(loginData)
            }
        );


        // ============================================
        // 5. Get backend response
        // ============================================

        const data =
            await response.json();


        // ============================================
        // 6. Login failed
        // ============================================

        if (!response.ok) {

            message.textContent =
                data.message ||
                "Invalid email or password.";

            message.classList.add("error");

            return;
        }


        // ============================================
        // 7. Login successful
        // ============================================

        message.textContent =
            "Login successful!";

        message.classList.add("success");


        // ============================================
        // 8. Store JWT token
        // ============================================

        localStorage.setItem(
            "token",
            data.token
        );


        // ============================================
        // 9. Store user information
        // ============================================

        localStorage.setItem(
            "userId",
            data.id
        );

        localStorage.setItem(
            "userName",
            data.name
        );

        localStorage.setItem(
            "userEmail",
            data.email
        );

        localStorage.setItem(
            "userRole",
            data.role
        );

        // ================================================
        // 10. Role based redirect
        // ================================================

        setTimeout(function () {

            // Admin login
            // if (data.role === "ADMIN") {

            //     window.location.href =
            //         "admin/dashboard.html";

            //     return;
            // }



            // window.location.href = "index.html";



            // const urlParams =
            //     new URLSearchParams(window.location.search);

            // const redirect =
            //     urlParams.get("redirect");



            // if (redirect) {

            //     window.location.href = redirect;

            // } else {


            //     window.location.href = "index.html";

            // }

            // Customer login
            window.location.href = "index.html";

        }, 1000);


    } catch (error) {

        // ============================================
        // 11. Server connection error
        // ============================================

        message.textContent =
            "Unable to connect to the server.";

        message.classList.add("error");

        console.error(
            "Login error:",
            error
        );
    }
});