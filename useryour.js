const user = JSON.parse(localStorage.getItem("loggedInUser"));

// Redirect if not logged in
if (!user) {
    window.location.href = "login.html";
}

// Show Profile
document.getElementById("userName").innerText = "Name: " + user.name;
document.getElementById("userNumber").innerText = "Mobile: +91 " + user.number;

// Load ride history
let rides = JSON.parse(localStorage.getItem("rides_" + user.number)) || [];

function displayRides() {
    const historyDiv = document.getElementById("rideHistory");
    historyDiv.innerHTML = "";

    if (rides.length === 0) {
        historyDiv.innerHTML = "<p class='no-ride'>No rides completed yet.</p>";
        return;
    }

    rides.forEach((ride, index) => {
        const div = document.createElement("div");
        div.className = "ride-item";
        div.innerHTML = `
            <strong>Ride ${index + 1}</strong><br>
            From: ${ride.pickup} <br>
            To: ${ride.drop} <br>
            Fare: ₹${ride.fare} <br>
            Status: ✅ Completed
        `;
        historyDiv.appendChild(div);
    });
}

displayRides();

// Logout
function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}

// Delete Account
function deleteAccount() {
    if (confirm("Delete account permanently?")) {
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("rides_" + user.number);
        window.location.href = "login.html";
    }
}