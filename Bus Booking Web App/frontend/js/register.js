/*
=========================================================

BUSGO - REGISTER PAGE JAVASCRIPT

This file handles:

1. Registration form submit
2. Frontend validation
3. Backend registration API call
4. Success / error message
5. Redirect to login page

=========================================================
*/

// =====================================================
// PASSWORD SHOW / HIDE
// =====================================================

// Password
const passwordInput =
    document.getElementById("password");

const passwordToggle =
    document.getElementById("passwordToggle");

passwordToggle.addEventListener("click", function () {

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

});


// Confirm Password
const confirmPasswordInput =
    document.getElementById("confirmPassword");

const confirmPasswordToggle =
    document.getElementById("confirmPasswordToggle");

confirmPasswordToggle.addEventListener("click", function () {

    if (confirmPasswordInput.type === "password") {

        confirmPasswordInput.type = "text";
        confirmPasswordToggle.textContent = "🙈";

        confirmPasswordToggle.setAttribute(
            "aria-label",
            "Hide password"
        );

    } else {

        confirmPasswordInput.type = "password";
        confirmPasswordToggle.textContent = "👁";

        confirmPasswordToggle.setAttribute(
            "aria-label",
            "Show password"
        );

    }

});

/*
=========================================================
1. GET REGISTER FORM
=========================================================
*/

const registerForm =
    document.getElementById("registerForm");


/*
=========================================================
2. FORM SUBMIT EVENT
=========================================================
*/

registerForm.addEventListener("submit", async function (event) {

    // Stop browser from refreshing the page
    event.preventDefault();


    /*
    =====================================================
    3. GET FORM VALUES
    =====================================================
    */

    const fullName =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const phone =
        document.getElementById("phone").value.trim();

    const password =
        document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;


    /*
    =====================================================
    4. GET MESSAGE AREA
    =====================================================
    */

    const message =
        document.getElementById("registerMessage");


    // Clear previous message
    message.textContent = "";

    // Remove old classes
    message.classList.remove("error", "success");


    /*
    =====================================================
    5. CHECK EMPTY FIELDS
    =====================================================
    */

    if (
        fullName === "" ||
        email === "" ||
        phone === "" ||
        password === "" ||
        confirmPassword === ""
    ) {

        message.textContent =
            "Please fill all the fields.";

        message.classList.add("error");

        return;
    }


    /*
    =====================================================
    6. CHECK NAME
    =====================================================
    */

    if (fullName.length < 3) {

        message.textContent =
            "Name must contain at least 3 characters.";

        message.classList.add("error");

        return;
    }


    /*
    =====================================================
    7. CHECK EMAIL
    =====================================================
    */

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {

        message.textContent =
            "Please enter a valid email address.";

        message.classList.add("error");

        return;
    }


    /*
    =====================================================
    8. CHECK PHONE NUMBER
    =====================================================
    */

    const phonePattern =
        /^[0-9]{10}$/;

    if (!phonePattern.test(phone)) {

        message.textContent =
            "Phone number must contain exactly 10 digits.";

        message.classList.add("error");

        return;
    }


    /*
    =====================================================
    9. CHECK PASSWORD LENGTH
    =====================================================
    */

    if (password.length < 6) {

        message.textContent =
            "Password must contain at least 6 characters.";

        message.classList.add("error");

        return;
    }


    /*
    =====================================================
    10. CHECK PASSWORD MATCH
    =====================================================
    */

    if (password !== confirmPassword) {

        message.textContent =
            "Password and confirm password do not match.";

        message.classList.add("error");

        return;
    }


    /*
    =====================================================
    11. PREPARE DATA FOR BACKEND
    =====================================================

    Frontend field names
            ↓
    Backend RegisterRequest fields

    name
    email
    phone
    password

    =====================================================
    */

    const registerData = {

        name: fullName,

        email: email,

        phone: phone,

        password: password
    };


    /*
    =====================================================
    12. SEND DATA TO SPRING BOOT
    =====================================================
    */

    try {

        const response = await fetch(
            "http://localhost:8080/api/auth/register",
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(registerData)
            }
        );


        /*
        =================================================
        13. GET BACKEND RESPONSE
        =================================================
        */

        const data =
            await response.json();


        /*
        =================================================
        14. CHECK RESPONSE
        =================================================
        */

        if (!response.ok) {

            message.textContent =
                data.message ||
                "Registration failed.";

            message.classList.add("error");

            return;
        }


        /*
        =================================================
        15. REGISTRATION SUCCESS
        =================================================
        */

        message.textContent =
            "Registration successful! You can now login.";

        message.classList.add("success");


        /*
        =================================================
        16. CLEAR FORM
        =================================================
        */

        registerForm.reset();


        /*
        =================================================
        17. GO TO LOGIN PAGE
        =================================================

        Wait for 1.5 seconds so the user can
        see the success message.

        =================================================
        */

        setTimeout(function () {

            window.location.href = "login.html";

        }, 1500);


    } catch (error) {

        /*
        =================================================
        18. BACKEND CONNECTION ERROR
        =================================================
        */

        message.textContent =
            "Unable to connect to the server.";

        message.classList.add("error");

        console.error(
            "Registration error:",
            error
        );
    }

});

