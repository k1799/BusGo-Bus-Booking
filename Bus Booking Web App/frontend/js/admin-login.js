/*
=========================================================
BUSGO - ADMIN LOGIN JAVASCRIPT

This file handles:

1. Admin login form submit
2. Email validation
3. Password validation
4. Backend login API call
5. JWT token storage
6. ADMIN role verification
7. Redirect to admin dashboard
=========================================================
*/


/*
=========================================================
1. GET ADMIN LOGIN FORM
=========================================================
*/

const adminLoginForm =
    document.getElementById(
        "adminLoginForm"
    );


/*
=========================================================
2. FORM SUBMIT EVENT
=========================================================
*/

adminLoginForm.addEventListener(
    "submit",
    async function (event) {

        /*
        Stop browser refresh
        */

        event.preventDefault();


        /*
        =================================================
        3. GET FORM VALUES
        =================================================
        */

        const email =
            document.getElementById(
                "email"
            ).value.trim();

        const password =
            document.getElementById(
                "password"
            ).value;


        /*
        =================================================
        4. GET MESSAGE AREA
        =================================================
        */

        const message =
            document.getElementById(
                "adminLoginMessage"
            );


        /*
        =================================================
        5. CLEAR OLD MESSAGE
        =================================================
        */

        message.textContent = "";

        message.classList.remove(
            "error",
            "success"
        );


        /*
        =================================================
        6. CHECK EMPTY FIELDS
        =================================================
        */

        if (
            email === "" ||
            password === ""
        ) {

            message.textContent =
                "Please enter email and password.";

            message.classList.add(
                "error"
            );

            return;
        }


        /*
        =================================================
        7. EMAIL FORMAT CHECK
        =================================================
        */

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!emailPattern.test(email)) {

            message.textContent =
                "Please enter a valid email address.";

            message.classList.add(
                "error"
            );

            return;
        }


        /*
        =================================================
        8. PASSWORD LENGTH CHECK
        =================================================
        */

        if (password.length < 6) {

            message.textContent =
                "Password must contain at least 6 characters.";

            message.classList.add(
                "error"
            );

            return;
        }


        /*
        =================================================
        9. CALL BACKEND LOGIN API
        =================================================
        */

        try {

            const response =
                await fetch(
                    "http://localhost:8080/api/auth/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            email: email,

                            password: password

                        })
                    }
                );


            /*
            =================================================
            10. CHECK BACKEND RESPONSE
            =================================================
            */

            if (!response.ok) {

                const errorText =
                    await response.text();

                throw new Error(
                    errorText ||
                    "Invalid admin login details."
                );
            }


            /*
            =================================================
            11. GET LOGIN RESPONSE
            =================================================
            */

            const data =
                await response.json();


            /*
            =================================================
            12. CHECK ADMIN ROLE
            =================================================
            */

            if (data.role !== "ADMIN") {

                message.textContent =
                    "Access denied. Admin account required.";

                message.classList.add(
                    "error"
                );

                return;
            }


            /*
            =================================================
            13. STORE JWT TOKEN
            =================================================
            */

            localStorage.setItem(
                "token",
                data.token
            );


            /*
            =================================================
            14. STORE ADMIN DETAILS
            =================================================
            */

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


            /*
            =================================================
            15. SUCCESS MESSAGE
            =================================================
            */

            message.textContent =
                "Admin login successful.";

            message.classList.add(
                "success"
            );


            /*
            =================================================
            16. GO TO ADMIN DASHBOARD
            =================================================
            */

            setTimeout(function () {

                window.location.href =
                    "dashboard.html";

            }, 500);


        } catch (error) {

            console.error(
                "Admin login error:",
                error
            );


            /*
            Show error
            */

            message.textContent =
                "Invalid admin email or password.";

            message.classList.add(
                "error"
            );

        }

    }
);



/*
=========================================================
16. ADMIN PASSWORD SHOW / HIDE
=========================================================
*/

const toggleAdminPassword =
    document.getElementById(
        "toggleAdminPassword"
    );

const adminPasswordInput =
    document.getElementById(
        "password"
    );

if (
    toggleAdminPassword &&
    adminPasswordInput
) {

    toggleAdminPassword.addEventListener(
        "click",
        function () {

            if (
                adminPasswordInput.type ===
                "password"
            ) {

                adminPasswordInput.type =
                    "text";

                toggleAdminPassword.textContent =
                    "🙈";

                toggleAdminPassword.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

                adminPasswordInput.type =
                    "password";

                toggleAdminPassword.textContent =
                    "👁️";

                toggleAdminPassword.setAttribute(
                    "aria-label",
                    "Show password"
                );

            }

        }
    );

}