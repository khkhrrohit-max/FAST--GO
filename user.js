import emailjs from "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm";



emailjs.init({
    publicKey: "oJsKfBhacylKGQmXb"
});



let generatedOTP = "";
let otpExpireTime = 0;
let otpVerified = false;

function isValidIndianNumber(number){
    return /^[6-9]\d{9}$/.test(number);
}

function isValidEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateOTP(){
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTP(email, otp){

    alert("Sending OTP...");

    const response = await emailjs.send(
        "service_dti5zdd",
        "template_omw4uus",
        {
            to_email: email,
            otp: otp
        }
    );

    
    return response;
}

/* ===========================
        SIGNUP
=========================== */

const signupBtn = document.getElementById("signupGetOtp");

if(signupBtn){

    

    signupBtn.addEventListener("click", async ()=>{

       

        const name=document.getElementById("signupName").value.trim();
        const number=document.getElementById("signupNumber").value.trim();
        const email=document.getElementById("signupEmail").value.trim();

        if(name==""){
            alert("Enter Name");
            return;
        }

        if(!isValidIndianNumber(number)){
            alert("Invalid Mobile");
            return;
        }

        if(!isValidEmail(email)){
            alert("Invalid Email");
            return;
        }

      if(localStorage.getItem("user_" + number)){
            alert("Already Registered");
            return;
        }

        generatedOTP=generateOTP();

        otpExpireTime=Date.now()+300000;

        try{

            await sendOTP(email,generatedOTP);

            alert("OTP Sent");

        }
        catch(err){

            alert(err.text || err.message || JSON.stringify(err));

        }

    });

    document.getElementById("signupVerify").addEventListener("click",()=>{

        const otp=document.getElementById("signupOtp").value.trim();

        if(otp==""){
            alert("Enter OTP");
            return;
        }

        if(Date.now()>otpExpireTime){
            alert("OTP Expired");
            return;
        }

        if(otp!=generatedOTP){
            alert("Wrong OTP");
            return;
        }

        otpVerified=true;

        const user={

            name:document.getElementById("signupName").value.trim(),
            number:document.getElementById("signupNumber").value.trim(),
            email:document.getElementById("signupEmail").value.trim()

        };

localStorage.setItem("user_" + user.number, JSON.stringify(user));

        alert("Signup Successful");

        location.href="login.html";

    });

}

/* ===========================
        LOGIN
=========================== */

const loginBtn=document.getElementById("loginGetOtp");

if(loginBtn){

    

    loginBtn.addEventListener("click",async()=>{

        const number=document.getElementById("loginNumber").value.trim();
        const email=document.getElementById("loginEmail").value.trim();

        if(!isValidIndianNumber(number)){
            alert("Invalid Mobile");
            return;
        }

        if(!isValidEmail(email)){
            alert("Invalid Email");
            return;
        }

        const user = JSON.parse(localStorage.getItem("user_" + number));

        if(!user){
            alert("User Not Registered");
            return;
        }

        if(user.email!=email){
            alert("Wrong Email");
            return;
        }

        generatedOTP=generateOTP();

        otpExpireTime=Date.now()+300000;

        try{

            await sendOTP(email,generatedOTP);

            alert("OTP Sent");

        }catch(err){

            alert(err.text || err.message || JSON.stringify(err));

        }

    });

    document.getElementById("loginVerify").addEventListener("click",()=>{

        const otp=document.getElementById("loginOtp").value.trim();

        if(otp!=generatedOTP){

            alert("Wrong OTP");
            return;

        }

        otpVerified=true;

        alert("OTP Verified");

    });

    document.getElementById("loginBtn").addEventListener("click",()=>{

        if(!otpVerified){

            alert("Verify OTP First");
            return;

        }

        const number = document.getElementById("loginNumber").value.trim();

const user = JSON.parse(localStorage.getItem("user_" + number));

localStorage.setItem(
    "loggedInUser",
    JSON.stringify(user)
);

alert("Login Successful");

location.href = "useryour.html";

    });

}
