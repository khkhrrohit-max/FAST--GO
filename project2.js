document.addEventListener("DOMContentLoaded", function () {

    const pickupSelect = document.getElementById("pickup");
    const dropSelect = document.getElementById("drop");
    const chooseBtn = document.getElementById("chooseLocationBtn");
    const searchBtn = document.getElementById("searchRideBtn");
    const vehicleSelect = document.getElementById("vehicle");
    const rideStatus = document.getElementById("rideStatus");
    const rideDetails = document.getElementById("rideDetails");
    const vehicleList = document.getElementById("vehicleList");
    const pickupInput = document.getElementById("pickup");
const dropInput = document.getElementById("drop");

const pickupBox = document.getElementById("pickupSuggestions");
const dropBox = document.getElementById("dropSuggestions");

pickupInput.addEventListener("input", () => {
    searchPlaces(pickupInput.value, pickupBox, pickupInput);
});

dropInput.addEventListener("input", () => {
    searchPlaces(dropInput.value, dropBox, dropInput);
});

    let map, routingControl;
    let riderMarkers = {};
    let nearestRider = null;


   

    // ✅ NEW: GET REAL COORDINATES
 async function searchPlaces(query, container, inputBox) {

    if (query.length < 3) {
        container.innerHTML = "";
        return;
    }

    try {
       const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=10&countrycodes=in&q=${query}`;

        const res = await fetch(url, {
            headers: {
                "User-Agent": "FastGoApp/1.0"
            }
        });

        const data = await res.json();

        console.log("DATA:", data); // 🔥 debug

        container.innerHTML = "";

        if (!data || data.length === 0) {
            container.innerHTML = "<div>No results</div>";
            return;
        }

        data.slice(0, 5).forEach(place => {

            const div = document.createElement("div");
        div.innerText = place.display_name.split(",").slice(0, 4).join(",");
            div.onclick = () => {
                inputBox.value = place.display_name;
                container.innerHTML = "";
            };

            container.appendChild(div);
        });

    } catch (err) {
        console.log("Search error:", err);
    }
}

    // ================= MAP INIT =================
    map = L.map('map').setView([24.8170, 93.9368], 9);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: "© OpenStreetMap"
    }).addTo(map);

    // ================= AUTO LOCATION =================
if (chooseBtn) {
  chooseBtn.addEventListener("click", function () {

    rideStatus.innerHTML = "📍 Fetching your location...";

    navigator.geolocation.getCurrentPosition(
        async function (pos) {

            const userLat = pos.coords.latitude;
            const userLng = pos.coords.longitude;

            window.userLiveLat = userLat;
            window.userLiveLng = userLng;

            // ✅ Instantly show coordinates (fast UX like Uber)
            pickupSelect.value = `${userLat.toFixed(5)}, ${userLng.toFixed(5)}`;

            map.setView([userLat, userLng], 16, { animate: true });

            if (window.userMarker) map.removeLayer(window.userMarker);

            window.userMarker = L.marker([userLat, userLng])
                .addTo(map)
                .bindPopup("📍 You are here")
                .openPopup();

            // ✅ Background address fetch (no delay)
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLat}&lon=${userLng}`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.display_name) {
                        pickupSelect.value = data.display_name;
                    }
                });

            rideStatus.innerHTML = "✅ Pickup location set";

        },
        function () {
            rideStatus.innerHTML = "❌ Location permission denied";
        },
        {
            enableHighAccuracy: true,
            timeout: 5000
        }
    );
});
}

    // ================= SEARCH RIDE =================
    async function getCoordinates(place) {
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${place}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data || data.length === 0) {
            alert("Location not found");
            return null;
        }

        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];

    } catch (err) {
        console.log("Geo Error:", err);
        return null;
    }
}
    searchBtn.addEventListener("click", async function () {


        const pickup = pickupSelect.value;
        const drop = dropSelect.value;
        const vehicle = vehicleSelect.value;

        if (!pickup || !drop) {
            rideStatus.innerHTML = "Please enter pickup and drop.";
            return;
        }

        if (pickup === drop) {
            rideStatus.innerHTML = "Pickup & Drop cannot be same.";
            return;
        }

        const pickupCoords = await getCoordinates(pickup);
        const dropCoords = await getCoordinates(drop);

        if (!pickupCoords || !dropCoords) return;

        const [pickupLat, pickupLng] = pickupCoords;
        const [dropLat, dropLng] = dropCoords;

        if (routingControl) map.removeControl(routingControl);

       routingControl = L.Routing.control({
    waypoints: [
        L.latLng(pickupLat, pickupLng),
        L.latLng(dropLat, dropLng)
    ],
    routeWhileDragging: false,
    addWaypoints: false,
    show: false,
    lineOptions: {
        styles: [{ color: "#000", weight: 5 }]
    }
}).addTo(map);

        routingControl.on('routesfound', function (e) {

            const route = e.routes[0];
        const distance = (route.summary.totalDistance / 1000).toFixed(2);

// ✅ LIVE TIME ESTIMATE (NEW 🔥)
const speed = vehicle === "Bike" ? 40 :
              vehicle === "Auto" ? 30 : 35;

const time = (distance / speed * 60).toFixed(0); // minutes
let perKm = vehicle === "Bike" ? 10 :
            vehicle === "Auto" ? 13 : 19;

            const fare = Math.round(distance * perKm);
window.currentFare = fare;
     rideDetails.innerHTML = `
<div style="
    background:#ff6347;
    padding:15px;
    border-radius:12px;
    box-shadow:0 4px 15px rgba(162, 40, 40, 0.15);
    max-width:300px;
">
    🚗 Distance: <b>${distance} KM</b><br><br>
    ⏱ ETA: <b>${time} min</b><br><br>
    💰 Fare: <b>₹${fare}</b><br><br>

    <button id="bookRideBtn" style="
        width:100%;
        background:#000;
        color:#fff;
        padding:12px;
        border:none;
        border-radius:10px;
        font-size:16px;
        cursor:pointer;
    ">
        Book Ride 🚖
    </button>
</div>
`;
        });

        map.fitBounds([
            [pickupLat, pickupLng],
            [dropLat, dropLng]
        ]);

        showAllActiveRiders(vehicle, pickupLat, pickupLng);
    });

    // ================= BOOK RIDE =================
    document.addEventListener("click", async function (e) {
console.log("Clicked:", e.target.id);
       if (e.target.id === "bookRideBtn") {

    if (!nearestRider) {
        alert("No rider available!");
        return;
    }

    const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedUser) {
        alert("User not logged in!");
        return;
    }

    const pickup = pickupSelect.value;
    const drop = dropSelect.value;

 

 const pickupCoords = await getCoordinates(pickup);
const dropCoords = await getCoordinates(drop);

    if (!pickupCoords || !dropCoords) return;

    const [pickupLat, pickupLng] = pickupCoords;
const [dropLat, dropLng] = dropCoords;

   // ✅ SAVE CURRENT RIDE
  localStorage.setItem("currentRide_" + loggedUser.number, JSON.stringify({
    pickup,
    drop,
    pickupLat,
    pickupLng,
    dropLat,
    dropLng,
fare: window.currentFare || 0,
    status: "ongoing"
}));
    const request = {
        userName: loggedUser.name,
        userPhone: loggedUser.number,
        pickup,
        drop,
        pickupLat,
        pickupLng,
        dropLat,
        dropLng,
        fare: document.querySelector("#rideDetails").innerText.match(/\d+$/)?.[0] || 0,
        payment: "cash",
        time: new Date().toLocaleTimeString(),
        status: "pending"
    };

    localStorage.setItem(
        "rideRequest_" + nearestRider.phone,
        JSON.stringify(request)
    );

    localStorage.setItem("currentBookedRider", nearestRider.phone);

    rideStatus.innerHTML = "Ride Request Sent To " + nearestRider.name + " 🚀";
    alert("Ride Request Sent 🚖");
}
    });

    // ================= SHOW ALL ACTIVE RIDERS =================
    function showAllActiveRiders(vehicleType, userLat, userLng) {
    

        vehicleList.innerHTML = "";

        Object.values(riderMarkers).forEach(marker => map.removeLayer(marker));
        riderMarkers = {};

        let riders = [];

        for (let i = 0; i < localStorage.length; i++) {

            const key = localStorage.key(i);
            if (!key.startsWith("activeRider_")) continue;

            const activeRider = JSON.parse(localStorage.getItem(key));

            if (!activeRider.online) continue;
            if (activeRider.vehicle !== vehicleType) continue;

            const distance = getDistance(
                userLat,
                userLng,
                activeRider.lat,
                activeRider.lng
            );

            const riderNumber = key.replace("activeRider_", "").trim();

            riders.push({
                ...activeRider,
                phone: activeRider.phone || riderNumber,
                distance
            });
        }

        riders.sort((a, b) => a.distance - b.distance);
        nearestRider = riders[0];

        if (riders.length === 0) {
            vehicleList.innerHTML = "<p>No active riders found.</p>";
            return;
        }

        rideStatus.innerHTML = "Active Riders Found 🚖";

        riders.forEach(rider => {
                const liveDistance = getDistance(
    window.userLiveLat || userLat,
    window.userLiveLng || userLng,
    rider.lat,
    rider.lng
);

            const marker = L.marker([rider.lat, rider.lng])
                .addTo(map)
                .bindPopup(`
                    <b>${rider.name}</b><br>
                    ${rider.vehicle}<br>
                    ${rider.plate}<br>
                    ${rider.phone}
                `);

            riderMarkers[rider.phone] = marker;

            const box = document.createElement("div");
            box.className = "rider-box";

            box.innerHTML = `
                <div style="display:flex; gap:15px;">
                    <img src="${rider.image}" width="90" style="border-radius:10px;">
                    <div>
                        <h3>${rider.name}</h3>
                        <p><strong>Phone:</strong> ${rider.phone}</p>
                        <p><strong>Vehicle:</strong> ${rider.vehicle}</p>
                        <p><strong>Plate:</strong> ${rider.plate}</p>
                       <p><strong>Distance:</strong> ${liveDistance.toFixed(2)} KM</p>
                        <p><strong>Status:</strong> 🟢 Online</p>
                    </div>
                </div>
            `;

            vehicleList.appendChild(box);
        });
    }

    function getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    setInterval(() => {

    const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedUser) return;

    const ride = JSON.parse(localStorage.getItem("currentRide_" + loggedUser.number));
    if (!ride) return;

    navigator.geolocation.getCurrentPosition(pos => {

        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        const distance = getDistance(
            userLat,
            userLng,
            ride.dropLat,
            ride.dropLng
        );

        console.log("Distance to destination:", distance);

        // ✅ AUTO COMPLETE (within 0.1 km = 100m)
        if (distance < 0.1) {
            completeRide(loggedUser.number);
        }

    });

}, 5000); // every 5 sec

});
function completeRide(userNumber) {

    const currentRide = JSON.parse(localStorage.getItem("currentRide_" + userNumber));
    if (!currentRide) return;

    let history = JSON.parse(localStorage.getItem("rides_" + userNumber)) || [];

    history.push({
        pickup: currentRide.pickup,
        drop: currentRide.drop,
        fare: currentRide.fare,
        time: new Date().toLocaleString()
    });

    localStorage.setItem("rides_" + userNumber, JSON.stringify(history));
    localStorage.removeItem("currentRide_" + userNumber);

    document.getElementById("rideStatus").innerHTML = "✅ Ride Completed";

    alert("Ride Completed 🎉");
}