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

    const rider={

        name:nameInput.value.trim(),
        number:numberInput.value.trim(),
        email:emailInput.value.trim(),
        vehicle:vehicle.value,
        plate:plateInput.value.trim().toUpperCase(),
        signupTime:new Date().toISOString()

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

    localStorage.setItem(
        "rider_"+rider.number,
        JSON.stringify(rider)
    );

    localStorage.setItem(
        "loggedInRider",
        JSON.stringify(rider)
    );

    alert("Signup Successful");

    location.href="loginrider.html";

});

});
