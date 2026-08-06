// ================= LOGIN CHECK =================

const rider = JSON.parse(localStorage.getItem("loggedInRider"));

if (!rider) {
    alert("Please login first.");
    window.location.href = "loginrider.html";
    throw new Error("User not logged in");
}

const loggedInNumber = rider.number;

// ================= PROFILE =================

document.getElementById("name").textContent = rider.name;
document.getElementById("mobile").textContent = rider.number;
document.getElementById("vehicle").textContent = rider.vehicle;
document.getElementById("plate").textContent = rider.plate;

// ================= PROFILE IMAGE =================

const profileImage = document.getElementById("profileImage");
const uploadImage = document.getElementById("uploadImage");

const imageKey = "profileImage_" + loggedInNumber;

const savedImage = localStorage.getItem(imageKey);

if (savedImage) {
    profileImage.src = savedImage;
}

uploadImage.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {

        profileImage.src = e.target.result;

        localStorage.setItem(imageKey, e.target.result);

    };

    reader.readAsDataURL(file);

});

// ================= STATS =================

const statsKey = "stats_" + loggedInNumber;

let stats = JSON.parse(localStorage.getItem(statsKey));

if (!stats) {

    stats = {

        accepted: 0,
        declined: 0,
        completed: 0,
        earnings: 0,
        history: []

    };

}

function saveStats() {

    localStorage.setItem(statsKey, JSON.stringify(stats));

}

function updateStats() {

    document.getElementById("accepted").textContent = stats.accepted;
    document.getElementById("declined").textContent = stats.declined;
    document.getElementById("completed").textContent = stats.completed;
    document.getElementById("earnings").textContent = stats.earnings;

    saveStats();

}

// ================= HISTORY =================

function loadHistory() {

    const table = document.getElementById("historyTable");

    table.innerHTML = "";

    if (stats.history.length === 0) {

        table.innerHTML =
        `<tr>
            <td colspan="4">No rides yet.</td>
        </tr>`;

        return;
    }

    stats.history.forEach(ride => {

        table.innerHTML += `
            <tr>
                <td>${ride.from}</td>
                <td>${ride.to}</td>
                <td>₹${ride.fare}</td>
                <td>${ride.status}</td>
            </tr>
        `;

    });

}

// ================= CHECK COMPLETED RIDES =================

function checkCompletedRide() {

    const requestKey = "rideRequest_" + loggedInNumber;

    const rideRequest = JSON.parse(localStorage.getItem(requestKey));

    if (!rideRequest) return;

    if (rideRequest.status !== "completed") return;

    if (rideRequest.savedToHistory) return;

    stats.accepted++;
    stats.completed++;
    stats.earnings += Number(rideRequest.fare);

    stats.history.push({

        from: rideRequest.pickup,
        to: rideRequest.drop,
        fare: rideRequest.fare,
        status: "Completed"

    });

    rideRequest.savedToHistory = true;

    localStorage.setItem(requestKey, JSON.stringify(rideRequest));

    updateStats();

    loadHistory();

}

setInterval(checkCompletedRide, 2000);

// ================= INITIAL LOAD =================

updateStats();

loadHistory();

// ================= LOGOUT =================

document.getElementById("logoutBtn").addEventListener("click", () => {

    localStorage.removeItem("loggedInRider");

    alert("Logged Out Successfully");

    window.location.href = "loginrider.html";

});
