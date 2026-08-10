import emailjs from "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm";

emailjs.init({
    publicKey: "oJsKfBhacylKGQmXb"
});

document.addEventListener("DOMContentLoaded", () => {

    
let generatedOTP = "";
let otpVerified = false;
let otpExpireTime = 0;

let timer;
let timeLeft = 60;
// ======================================================
// FAST GO RIDER ID
// ======================================================

function generateRiderID() {

    const randomNumber =
        Math.floor(100000 + Math.random() * 900000);

    return "FG-R-" + randomNumber;
}


// ======================================================
// CREATE FAST GO RIDER CARD PDF
// ======================================================

async function downloadRiderCard(rider) {

    const { jsPDF } = window.jspdf;

    const doc =
        new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "A4"
        });


    // ===============================
    // CARD POSITION
    // ===============================

    const x = 25;
    const y = 45;
    const width = 160;
    const height = 105;


    // ===============================
    // CARD BACKGROUND
    // ===============================

    doc.setFillColor(245, 247, 250);

    doc.roundedRect(
        x,
        y,
        width,
        height,
        8,
        8,
        "F"
    );


    // ===============================
    // ORANGE HEADER
    // ===============================

    doc.setFillColor(255, 106, 0);

    doc.roundedRect(
        x,
        y,
        width,
        30,
        8,
        8,
        "F"
    );

    // Cover lower rounded corners of header
    doc.rect(
        x,
        y + 20,
        width,
        10,
        "F"
    );


    // ===============================
    // FAST GO LOGO
    // ===============================

    try {

        const logo =
            await loadImage(
                "fast go 2.jpeg"
            );

        doc.addImage(
            logo,
            "JPEG",
            x + 8,
            y + 5,
            20,
            20
        );

    } catch (error) {

        console.log(
            "Logo could not be loaded:",
            error
        );
    }


    // ===============================
    // FAST GO TITLE
    // ===============================

    doc.setTextColor(
        255,
        255,
        255
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(22);

    doc.text(
        "FAST GO",
        x + 35,
        y + 14
    );


    doc.setFontSize(9);

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.text(
        "RIDER IDENTIFICATION CARD",
        x + 35,
        y + 21
    );


    // ===============================
    // RIDER DETAILS
    // ===============================

    doc.setTextColor(
        40,
        40,
        40
    );


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(11);

    doc.text(
        "RIDER DETAILS",
        x + 10,
        y + 42
    );


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(10);


    // Name

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        "Name:",
        x + 10,
        y + 52
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.text(
        rider.name,
        x + 40,
        y + 52
    );


    // Email

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        "Email:",
        x + 10,
        y + 62
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.text(
        rider.email,
        x + 40,
        y + 62
    );


    // Mobile

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        "Mobile:",
        x + 10,
        y + 72
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.text(
        rider.number,
        x + 40,
        y + 72
    );


    // Rider ID

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        "Rider ID:",
        x + 10,
        y + 82
    );


    doc.setTextColor(
        255,
        106,
        0
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        rider.riderId,
        x + 40,
        y + 82
    );


    // ===============================
    // VERIFICATION TEXT
    // ===============================

    doc.setTextColor(
        80,
        80,
        80
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(8);

    doc.text(
        "This card confirms FAST GO rider registration.",
        x + 10,
        y + 93
    );


    // ===============================
    // FOOTER
    // ===============================

    doc.setDrawColor(
        220,
        220,
        220
    );

    doc.line(
        x + 10,
        y + 98,
        x + width - 10,
        y + 98
    );


    doc.setTextColor(
        50,
        50,
        50
    );

    doc.setFontSize(8);

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        "FAST GO",
        x + 10,
        y + 104
    );


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.text(
        "Rohit Khokhar • Founder",
        x + 45,
        y + 104
    );

    doc.text(
        "khkhrrohit@gmail.com",
        x + 105,
        y + 104
    );


    // ===============================
    // PAGE TITLE
    // ===============================

    doc.setTextColor(
        255,
        106,
        0
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(24);

    doc.text(
        "FAST GO",
        105,
        25,
        {
            align: "center"
        }
    );


    doc.setTextColor(
        80,
        80,
        80
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(11);

    doc.text(
        "Official Rider Registration Card",
        105,
        32,
        {
            align: "center"
        }
    );


    // ===============================
    // DOWNLOAD
    // ===============================

    doc.save(
        "FAST_GO_Rider_Card_" +
        rider.riderId +
        ".pdf"
    );
}


// ======================================================
// LOAD LOGO
// ======================================================

function loadImage(src) {

    return new Promise(
        (resolve, reject) => {

            const img =
                new Image();

            img.onload =
                function () {

                    const canvas =
                        document.createElement(
                            "canvas"
                        );

                    canvas.width =
                        img.width;

                    canvas.height =
                        img.height;


                    const ctx =
                        canvas.getContext(
                            "2d"
                        );


                    ctx.drawImage(
                        img,
                        0,
                        0
                    );


                    resolve(
                        canvas.toDataURL(
                            "image/jpeg"
                        )
                    );
                };


            img.onerror =
                reject;


            img.src = src;
        }
    );
}

// ================= FUNCTIONS =================

function isValidIndianNumber(number){
    return /^[6-9]\d{9}$/.test(number);
}

function isValidEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPlate(plate){
    return /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/.test(plate);
}

function generateOTP(){
    return Math.floor(100000 + Math.random()*900000).toString();
}

async function sendOTP(email,otp){

    await emailjs.send(
        "service_dti5zdd",
        "template_omw4uus",
        {
            to_email: email,
            otp: otp
        }
    );

}

// ================= INPUTS =================

const inputs=document.querySelectorAll("input");
const buttons=document.querySelectorAll("button");

const vehicle=document.getElementById("vehicleType");
const checkbox=document.querySelector("input[type='checkbox']");

const nameInput = document.getElementById("riderName");
const numberInput = document.getElementById("riderNumber");
const emailInput = document.getElementById("riderEmail");
const otpInput = document.getElementById("riderOtp");
const plateInput = document.getElementById("plateNumber");
const getOtpBtn=document.getElementById("getOtpBtn");
const verifyOtpBtn=document.getElementById("verifyOtpBtn");
const verifyPlateBtn=document.getElementById("verifyPlateBtn");
const submitBtn=document.getElementById("submitBtn");

const yourIdBtn=buttons[5];
const dlBtn=buttons[6];
const rcBtn=buttons[7];
const docBtn=buttons[8];

// ================= TIMER =================

function startTimer(){

    clearInterval(timer);

    timeLeft=60;

    getOtpBtn.disabled=true;

    getOtpBtn.innerText="Resend in 60s";

    timer=setInterval(()=>{

        timeLeft--;

        getOtpBtn.innerText="Resend in "+timeLeft+"s";

        if(timeLeft<=0){

            clearInterval(timer);

            getOtpBtn.disabled=false;

            getOtpBtn.innerText="GET OTP";

        }

    },1000);

}

// ================= GET OTP =================

getOtpBtn.addEventListener("click",async()=>{

    const name=nameInput.value.trim();
    const number=numberInput.value.trim();
    const email=emailInput.value.trim();

    if(name==""){
        alert("Enter Name");
        return;
    }

    if(!isValidIndianNumber(number)){
        alert("Invalid Mobile Number");
        return;
    }

    if(!isValidEmail(email)){
        alert("Invalid Email");
        return;
    }

    if(localStorage.getItem("rider_"+number)){
        alert("Already Registered");
        return;
    }

    generatedOTP=generateOTP();

    otpExpireTime=Date.now()+300000;

    try{

        await sendOTP(email,generatedOTP);

        startTimer();

        alert("OTP Sent Successfully");

    }catch(err){

        alert(err.text || err.message || JSON.stringify(err));

    }

});

// ================= VERIFY OTP =================

verifyOtpBtn.addEventListener("click",()=>{

    const otp=otpInput.value.trim();

    if(otp==""){
        alert("Enter OTP");
        return;
    }

    if(Date.now()>otpExpireTime){
        alert("OTP Expired");
        return;
    }

    if(otp!==generatedOTP){
        alert("Wrong OTP");
        return;
    }

    otpVerified=true;

    verifyOtpBtn.innerText="Verified ✅";

    verifyOtpBtn.disabled=true;

    alert("OTP Verified");

});

// ================= VERIFY PLATE =================

verifyPlateBtn.addEventListener("click",()=>{

    const plate=plateInput.value.trim().toUpperCase();

    if(!isValidPlate(plate)){

        alert("Invalid Plate Number");

        return;

    }

    alert("Plate Verified");

});

// ================= FILE VERIFY =================

[yourIdBtn,dlBtn,rcBtn,docBtn].forEach(btn=>{

    btn.addEventListener("click",()=>{

        const parent=btn.parentElement;

        const file=parent.querySelector("input[type='file']");

        if(file.files.length==0){

            alert("Select File");

            return;

        }

        btn.disabled=true;

        btn.innerText="Verified ✅";

    });

});

// ================= SUBMIT =================

submitBtn.addEventListener("click",async(e)=>{

    e.preventDefault();

    const rider = {

    name: nameInput.value.trim(),

    number: numberInput.value.trim(),

    email: emailInput.value.trim(),

    vehicle: vehicle.value,

    plate: plateInput.value.trim().toUpperCase(),

    riderId: generateRiderID(),

    signupTime: new Date().toISOString()

};

    if(rider.name=="" || rider.number=="" || rider.email=="" || rider.plate==""){

        alert("Fill All Fields");

        return;

    }

    if(!otpVerified){

        alert("Verify OTP First");

        return;

    }

    if(!checkbox.checked){

        alert("Accept Terms");

        return;

    }

    try{

        await emailjs.send(
            "service_dti5zdd",
            "template_0dq57aq",
            {
                rider_name:rider.name,
                rider_number:rider.number,
                rider_vehicle:rider.vehicle,
                rider_plate:rider.plate,
                to_email:"khkhrrohit@gmail.com"
            }
        );

    }catch(err){

        console.log(err);

    }

    // ==================================================
// SAVE RIDER ACCOUNT
// ==================================================

localStorage.setItem(
    "rider_" + rider.number,
    JSON.stringify(rider)
);


localStorage.setItem(
    "loggedInRider",
    JSON.stringify(rider)
);


// ==================================================
// DOWNLOAD RIDER CARD
// ==================================================

try {

    await downloadRiderCard(rider);

} catch (error) {

    console.error(
        "Rider card generation failed:",
        error
    );

    alert(
        "Registration successful, but Rider Card could not be generated."
    );
}


// ==================================================
// SUCCESS
// ==================================================

alert(
    "FAST GO Rider Registration Successful! 🎉\n\n" +
    "Your Rider ID: " +
    rider.riderId +
    "\n\nYour Rider Card PDF has been downloaded."
);


location.href =
    "loginrider.html";

});

});
