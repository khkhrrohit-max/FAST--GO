```javascript
// ======================================================
// FAST GO - INDEX PAGE JS
// User + Rider + Admin Button Control
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

    // ================================
    // GET ELEMENTS
    // ================================

    const agreeCheck = document.getElementById("agreeCheck");

    const userBtn = document.getElementById("userBtn");

    const riderBtn = document.getElementById("riderBtn");

    const adminBtn = document.getElementById("adminBtn");


    // ================================
    // CHECK AGREEMENT
    // ================================

    function checkAgreement(event) {

        if (!agreeCheck.checked) {

            event.preventDefault();

            alert(
                "Please agree to the Terms and Conditions, Privacy Policy and platform rules first."
            );

            return false;
        }

        return true;
    }


    // ================================
    // USER BUTTON
    // ================================

    userBtn.addEventListener("click", function (event) {

        if (!checkAgreement(event)) {
            return;
        }

        window.location.href = "project2.html";

    });


    // ================================
    // RIDER BUTTON
    // ================================

    riderBtn.addEventListener("click", function (event) {

        if (!checkAgreement(event)) {
            return;
        }

        window.location.href = "riderpage.html";

    });


    // ================================
    // ADMIN BUTTON
    // ================================

    adminBtn.addEventListener("click", function (event) {

        if (!checkAgreement(event)) {
            return;
        }

        window.location.href = "admin.html";

    });

});
```
