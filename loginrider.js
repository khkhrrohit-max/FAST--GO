import emailjs from "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm";

emailjs.init({
    publicKey: "oJsKfBhacylKGQmXb"
});

document.addEventListener("DOMContentLoaded", () => {

    let generatedOTP = "";
    let otpVerified = false;
    let otpExpireTime = 0;

    const numberInput = document.getElementById("loginNumber");
    const emailInput = document.getElementById("loginEmail");
    const otpInput = document.getElementById("loginOtp");

    const getOtpBtn = document.getElementById("getOtpBtn");
    const verifyOtpBtn = document.getElementById("verifyOtpBtn");
    const loginBtn = document.getElementById("loginBtn");

    function isValidIndianNumber(number) {
        return /^[6-9]\d{9}$/.test(number);
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async function sendOTP(email, otp) {

        await emailjs.send(
            "service_dti5zdd",
            "template_omw4uus",
            {
                to_email: email,
                otp: otp
            }
        );

    }

    let timer;

    function startTimer() {

        let timeLeft = 60;

        getOtpBtn.disabled = true;

        getOtpBtn.innerText = "Resend in 60s";

        clearInterval(timer);

        timer = setInterval(() => {

            timeLeft--;

            getOtpBtn.innerText = "Resend in " + timeLeft + "s";

            if (timeLeft <= 0) {

                clearInterval(timer);

                getOtpBtn.disabled = false;

                getOtpBtn.innerText = "GET OTP";

            }

        }, 1000);

    }

    // ================= GET OTP =================

    getOtpBtn.addEventListener("click", async () => {

        const number = numberInput.value.trim();
        const email = emailInput.value.trim();

        if (!isValidIndianNumber(number)) {

            alert("Enter valid mobile number");

            return;

        }

        if (!isValidEmail(email)) {

            alert("Enter valid email");

            return;

        }
console.log("Login Number:", number);
console.log("Searching Key:", "rider_" + number);
console.log("Stored Data:", localStorage.getItem("rider_" + number));
        const rider = JSON.parse(localStorage.getItem("rider_" + number));

        if (!rider) {

            alert("Rider not registered");

            return;

        }

        if (rider.email !== email) {

            alert("Email does not match");

            return;

        }

        generatedOTP = generateOTP();

        otpExpireTime = Date.now() + 300000;

        try {

            await sendOTP(email, generatedOTP);

            startTimer();

            alert("OTP Sent Successfully");

        } catch (err) {

            alert(err.text || err.message || JSON.stringify(err));

        }

    });

    // ================= VERIFY OTP =================

    verifyOtpBtn.addEventListener("click", () => {

        const otp = otpInput.value.trim();

        if (otp === "") {

            alert("Enter OTP");

            return;

        }

        if (Date.now() > otpExpireTime) {

            alert("OTP Expired");

            return;

        }

        if (otp !== generatedOTP) {

            alert("Wrong OTP");

            return;

        }

        otpVerified = true;

        verifyOtpBtn.disabled = true;

        verifyOtpBtn.innerText = "Verified ✅";

        alert("OTP Verified Successfully");

    });

    // ================= LOGIN =================

    loginBtn.addEventListener("click", () => {

        if (!otpVerified) {

            alert("Please Verify OTP First");

            return;

        }

        const number = numberInput.value.trim();

        const rider = JSON.parse(localStorage.getItem("rider_" + number));

        if (!rider) {

            alert("Rider Not Found");

            return;

        }

        localStorage.setItem(
            "loggedInRider",
            JSON.stringify(rider)
        );

        alert("Login Successful");

        window.location.href = "riderpage.html";

    });

});
