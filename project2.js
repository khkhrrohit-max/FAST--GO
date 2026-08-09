// ======================================================
// FAST GO - USER BOOKING SYSTEM
// NO SUPABASE VERSION
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

    // ==================================================
    // ELEMENTS
    // ==================================================

    const pickupInput =
        document.getElementById("pickup");

    const dropInput =
        document.getElementById("drop");

    const pickupSuggestions =
        document.getElementById("pickupSuggestions");

    const dropSuggestions =
        document.getElementById("dropSuggestions");

    const chooseLocationBtn =
        document.getElementById("chooseLocationBtn");

    const searchRideBtn =
        document.getElementById("searchRideBtn");

    const vehicleSelect =
        document.getElementById("vehicle");

    const rideStatus =
        document.getElementById("rideStatus");

    const rideDetails =
        document.getElementById("rideDetails");

    const vehicleList =
        document.getElementById("vehicleList");

    const riderInfoCard =
        document.getElementById("riderInfoCard");


    // ==================================================
    // USER LOGIN
    // ==================================================

    let loggedInUser = null;

    try {

        loggedInUser =
            JSON.parse(
                localStorage.getItem("loggedInUser")
            );

    } catch (error) {

        loggedInUser = null;
    }


    if (!loggedInUser) {

        alert("Please login first.");

        window.location.href =
            "login.html";

        return;
    }
    // ==================================================
// RESET OLD PENDING RIDE AFTER PAGE REFRESH
// ==================================================

function resetOldPendingRide() {

    const savedRide = localStorage.getItem("activeUserRide");

    if (!savedRide) {
        return;
    }

    try {

        const ride = JSON.parse(savedRide);

        // If the previous ride was only pending,
        // remove it when user opens/refreshes booking page.
        if (ride && ride.status === "pending") {

            if (ride.riderPhone) {

                localStorage.removeItem(
                    "rideRequest_" + ride.riderPhone
                );
            }

            localStorage.removeItem("activeUserRide");

        }

    } catch (error) {

        console.error(
            "Invalid old ride data:",
            error
        );

        localStorage.removeItem("activeUserRide");
    }
}

resetOldPendingRide();


    // ==================================================
    // MAP
    // ==================================================

    const map =
        L.map("map").setView(
            [23.8315, 91.2868],
            6
        );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                "© OpenStreetMap contributors",

            maxZoom: 19
        }
    ).addTo(map);


    // ==================================================
    // MAP VARIABLES
    // ==================================================

    let pickupMarker = null;

    let dropMarker = null;

    let riderMarker = null;

    let routingControl = null;

    let pickupLocation = null;

    let dropLocation = null;

    let currentDistance = 0;

    let currentFare = 0;

    let riderLocationTimer = null;


    // ==================================================
    // LOCATION SEARCH
    // ==================================================

    let pickupTimer = null;

    let dropTimer = null;


    async function searchLocation(
        query,
        suggestionBox,
        inputElement,
        locationType
    ) {

        query = query.trim();


        if (query.length < 2) {

            suggestionBox.innerHTML = "";

            return;
        }


        suggestionBox.innerHTML =
            '<div class="suggestion-loading">' +
            'Searching locations...' +
            '</div>';


        try {

            const url =
                "https://nominatim.openstreetmap.org/search?" +
                new URLSearchParams({

                    q: query,

                    format: "json",

                    addressdetails: "1",

                    limit: "10",

                    countrycodes: "in",

                    "accept-language": "en"

                });


            const response =
                await fetch(url);


            if (!response.ok) {

                throw new Error(
                    "Location search failed"
                );
            }


            const results =
                await response.json();


            suggestionBox.innerHTML = "";


            if (
                !results ||
                results.length === 0
            ) {

                suggestionBox.innerHTML =
                    '<div class="no-result">' +
                    'No location found. Try the full name, nearby city, or district.' +
                    '</div>';

                return;
            }


            results.forEach(function (place) {

                const item =
                    document.createElement("div");


                item.className =
                    "suggestion-item";


                item.textContent =
                    place.display_name;


                item.addEventListener(
                    "click",
                    function () {

                        const lat =
                            parseFloat(place.lat);

                        const lng =
                            parseFloat(place.lon);


                        const location = {

                            lat: lat,

                            lng: lng,

                            name:
                                place.display_name

                        };


                        inputElement.value =
                            place.display_name;


                        suggestionBox.innerHTML =
                            "";


                        if (
                            locationType ===
                            "pickup"
                        ) {

                            pickupLocation =
                                location;


                            setPickupMarker(
                                lat,
                                lng,
                                place.display_name
                            );

                        } else {

                            dropLocation =
                                location;


                            setDropMarker(
                                lat,
                                lng,
                                place.display_name
                            );
                        }


                        map.setView(
                            [lat, lng],
                            15
                        );


                        drawRouteIfReady();
                    }
                );


                suggestionBox.appendChild(
                    item
                );

            });

        } catch (error) {

            console.error(
                "Location Error:",
                error
            );


            suggestionBox.innerHTML =
                '<div class="no-result">' +
                'Location service unavailable. Check your internet connection and try again.' +
                '</div>';
        }
    }


    // ==================================================
    // PICKUP SEARCH
    // ==================================================

    pickupInput.addEventListener(
        "input",
        function () {

            clearTimeout(
                pickupTimer
            );


            const query =
                pickupInput.value.trim();


            /*
             * If user changes the selected
             * location manually, remove
             * the old coordinates.
             */

            pickupLocation = null;


            pickupTimer =
                setTimeout(
                    function () {

                        searchLocation(
                            query,
                            pickupSuggestions,
                            pickupInput,
                            "pickup"
                        );

                    },
                    400
                );
        }
    );


    // ==================================================
    // DROP SEARCH
    // ==================================================

    dropInput.addEventListener(
        "input",
        function () {

            clearTimeout(
                dropTimer
            );


            const query =
                dropInput.value.trim();


            dropLocation = null;


            dropTimer =
                setTimeout(
                    function () {

                        searchLocation(
                            query,
                            dropSuggestions,
                            dropInput,
                            "drop"
                        );

                    },
                    400
                );
        }
    );


    // ==================================================
    // CLOSE SUGGESTIONS
    // ==================================================

    document.addEventListener(
        "click",
        function (event) {

            if (
                !pickupInput.contains(
                    event.target
                ) &&
                !pickupSuggestions.contains(
                    event.target
                )
            ) {

                pickupSuggestions.innerHTML =
                    "";
            }


            if (
                !dropInput.contains(
                    event.target
                ) &&
                !dropSuggestions.contains(
                    event.target
                )
            ) {

                dropSuggestions.innerHTML =
                    "";
            }
        }
    );


    // ==================================================
    // PICKUP MARKER
    // ==================================================

    function setPickupMarker(
        lat,
        lng,
        name
    ) {

        if (pickupMarker) {

            pickupMarker.setLatLng(
                [lat, lng]
            );

        } else {

            pickupMarker =
                L.marker(
                    [lat, lng]
                ).addTo(map);
        }


        pickupMarker.bindPopup(
            "<b>Pickup</b><br>" +
            name
        );
    }


    // ==================================================
    // DROP MARKER
    // ==================================================

    function setDropMarker(
        lat,
        lng,
        name
    ) {

        if (dropMarker) {

            dropMarker.setLatLng(
                [lat, lng]
            );

        } else {

            dropMarker =
                L.marker(
                    [lat, lng]
                ).addTo(map);
        }


        dropMarker.bindPopup(
            "<b>Destination</b><br>" +
            name
        );
    }


    // ==================================================
    // DRAW ROUTE
    // ==================================================

    function drawRouteIfReady() {

        if (
            !pickupLocation ||
            !dropLocation
        ) {

            return;
        }


        if (routingControl) {

            map.removeControl(
                routingControl
            );

            routingControl =
                null;
        }


        routingControl =
            L.Routing.control({

                waypoints: [

                    L.latLng(
                        pickupLocation.lat,
                        pickupLocation.lng
                    ),

                    L.latLng(
                        dropLocation.lat,
                        dropLocation.lng
                    )

                ],

                routeWhileDragging:
                    false,

                addWaypoints:
                    false,

                draggableWaypoints:
                    false,

                fitSelectedRoutes:
                    true,

                showAlternatives:
                    false,

                createMarker:
                    function () {

                        return null;
                    }

            }).addTo(map);


        routingControl.on(
            "routesfound",
            function (event) {

                const route =
                    event.routes[0];


                currentDistance =
                    route.summary.totalDistance /
                    1000;


                const duration =
                    route.summary.totalTime /
                    60;


                calculateFare();


                rideDetails.innerHTML =
                    "";


                const distanceText =
                    document.createElement(
                        "p"
                    );


                distanceText.innerHTML =
                    "<strong>Distance:</strong> " +
                    currentDistance.toFixed(2) +
                    " KM";


                const timeText =
                    document.createElement(
                        "p"
                    );


                timeText.innerHTML =
                    "<strong>Estimated Time:</strong> " +
                    Math.ceil(duration) +
                    " minutes";


                const vehicleText =
                    document.createElement(
                        "p"
                    );


                vehicleText.innerHTML =
                    "<strong>Vehicle:</strong> " +
                    vehicleSelect.value;


                const fareText =
                    document.createElement(
                        "p"
                    );


                fareText.innerHTML =
                    "<strong>Estimated Fare:</strong> ₹" +
                    currentFare;


                rideDetails.appendChild(
                    distanceText
                );


                rideDetails.appendChild(
                    timeText
                );


                rideDetails.appendChild(
                    vehicleText
                );


                rideDetails.appendChild(
                    fareText
                );
            }
        );
    }


    // ==================================================
    // FARE
    // ==================================================

    function calculateFare() {

        if (
            currentDistance <= 0
        ) {

            return;
        }


        let rate;


        if (
            vehicleSelect.value ===
            "Bike"
        ) {

            rate = 10;

        } else if (
            vehicleSelect.value ===
            "Auto"
        ) {

            rate = 13;

        } else {

            rate = 19;
        }


        currentFare =
            Math.max(
                30,
                Math.round(
                    currentDistance *
                    rate
                )
            );


        updateRideDetails();
    }


    function updateRideDetails() {

        if (
            currentDistance <= 0
        ) {

            return;
        }


        rideDetails.innerHTML =
            "<p><strong>Distance:</strong> " +
            currentDistance.toFixed(2) +
            " KM</p>" +

            "<p><strong>Vehicle:</strong> " +
            vehicleSelect.value +
            "</p>" +

            "<p><strong>Estimated Fare:</strong> ₹" +
            currentFare +
            "</p>";
    }


    // ==================================================
    // VEHICLE CHANGE
    // ==================================================

    vehicleSelect.addEventListener(
        "change",
        function () {

            if (
                currentDistance > 0
            ) {

                calculateFare();
            }

            if (
                pickupLocation
            ) {

                showNearbyRiders();
            }
        }
    );


    // ==================================================
    // LIVE LOCATION
    // ==================================================

    chooseLocationBtn.addEventListener(
        "click",
        function () {

            if (
                !navigator.geolocation
            ) {

                alert(
                    "Your browser does not support location."
                );

                return;
            }


            chooseLocationBtn.disabled =
                true;


            chooseLocationBtn.textContent =
                "Getting location...";


            navigator.geolocation.getCurrentPosition(

                function (position) {

                    const lat =
                        position.coords.latitude;

                    const lng =
                        position.coords.longitude;


                    pickupLocation = {

                        lat: lat,

                        lng: lng,

                        name:
                            "My Live Location"

                    };


                    pickupInput.value =
                        "My Live Location";


                    setPickupMarker(
                        lat,
                        lng,
                        "Your Live Location"
                    );


                    map.setView(
                        [lat, lng],
                        16
                    );


                    chooseLocationBtn.disabled =
                        false;


                    chooseLocationBtn.textContent =
                        "📍 Use Live Location";


                    showNearbyRiders();


                    drawRouteIfReady();

                },


                function (error) {

                    console.error(
                        error
                    );


                    chooseLocationBtn.disabled =
                        false;


                    chooseLocationBtn.textContent =
                        "📍 Use Live Location";


                    alert(
                        "Unable to get your location. Please allow location permission."
                    );
                },


                {

                    enableHighAccuracy:
                        true,

                    timeout:
                        15000,

                    maximumAge:
                        0

                }
            );
        }
    );


    // ==================================================
    // GET ACTIVE RIDERS
    // ==================================================

    function getActiveRiders() {

        const riders = [];


        for (
            let i = 0;
            i < localStorage.length;
            i++
        ) {

            const key =
                localStorage.key(i);


            if (
                key &&
                key.startsWith(
                    "activeRider_"
                )
            ) {

                try {

                    const rider =
                        JSON.parse(
                            localStorage.getItem(
                                key
                            )
                        );


                    if (
                        rider &&
                        rider.online === true &&
                        typeof rider.lat ===
                        "number" &&
                        typeof rider.lng ===
                        "number"
                    ) {

                        riders.push(
                            rider
                        );
                    }

                } catch (error) {

                    console.error(
                        "Invalid rider:",
                        error
                    );
                }
            }
        }


        return riders;
    }


    // ==================================================
    // DISTANCE
    // ==================================================

    function distanceBetween(
        lat1,
        lon1,
        lat2,
        lon2
    ) {

        const R = 6371;


        const dLat =
            (lat2 - lat1) *
            Math.PI / 180;


        const dLon =
            (lon2 - lon1) *
            Math.PI / 180;


        const a =
            Math.sin(
                dLat / 2
            ) ** 2 +

            Math.cos(
                lat1 *
                Math.PI / 180
            ) *

            Math.cos(
                lat2 *
                Math.PI / 180
            ) *

            Math.sin(
                dLon / 2
            ) ** 2;


        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );


        return R * c;
    }


    // ==================================================
    // SHOW NEARBY RIDERS
    // ==================================================

    function showNearbyRiders() {

        vehicleList.innerHTML =
            "";


        if (
            !pickupLocation
        ) {

            return [];
        }


        const selectedVehicle =
            vehicleSelect.value;


        let riders =
            getActiveRiders()
            .filter(
                function (rider) {

                    return (
                        rider.vehicle &&
                        rider.vehicle.toLowerCase() ===
                        selectedVehicle.toLowerCase()
                    );
                }
            );


        riders =
            riders.map(
                function (rider) {

                    return {

                        ...rider,

                        distance:
                            distanceBetween(
                                pickupLocation.lat,
                                pickupLocation.lng,
                                rider.lat,
                                rider.lng
                            )
                    };
                }
            );


        riders.sort(
            function (a, b) {

                return (
                    a.distance -
                    b.distance
                );
            }
        );


        if (
            riders.length === 0
        ) {

            const message =
                document.createElement(
                    "p"
                );


            message.textContent =
                "No " +
                selectedVehicle +
                " rider is currently online.";


            vehicleList.appendChild(
                message
            );


            return [];
        }


        riders.forEach(rider => {

    const card = document.createElement("div");

    card.className = "ride-card-user";

    card.innerHTML = `
        <h3>🚕 ${rider.name || "Rider"}</h3>

        <p>
            <strong>Vehicle:</strong>
            ${rider.vehicle || "Not available"}
        </p>

        <p>
            <strong>Plate:</strong>
            ${rider.plate || "Not available"}
        </p>

        <p>
            <strong>Mobile:</strong>
            ${rider.phone || "Not available"}
        </p>

        <p>
            <strong>Distance:</strong>
            ${rider.distance.toFixed(2)} KM
        </p>

        <p>
            <span class="online-status">
                🟢 Online
            </span>
        </p>
    `;

    vehicleList.appendChild(card);
});

        return riders;
    }


    // ==================================================
    // REQUEST RIDE
    // ==================================================

    searchRideBtn.addEventListener(
        "click",
        function () {

            if (
                !pickupLocation
            ) {

                alert(
                    "Please select your pickup location from the suggestions."
                );

                return;
            }


            if (
                !dropLocation
            ) {

                alert(
                    "Please select your destination from the suggestions."
                );

                return;
            }


            if (
                currentFare <= 0
            ) {

                alert(
                    "Please wait for the route calculation."
                );

                return;
            }


            const riders =
                showNearbyRiders();


            if (
                riders.length === 0
            ) {

                alert(
                    "No online rider is available for this vehicle."
                );

                return;
            }


            const rider =
                riders[0];


            const rideId =
                "ride_" +
                Date.now();


            const rideRequest = {

                id:
                    rideId,

                userName:
                    loggedInUser.name ||
                    "User",

                userPhone:
                    loggedInUser.number ||
                    loggedInUser.phone ||
                    "",

                userEmail:
                    loggedInUser.email ||
                    "",

                pickup:
                    pickupLocation.name,

                drop:
                    dropLocation.name,

                pickupLat:
                    pickupLocation.lat,

                pickupLng:
                    pickupLocation.lng,

                dropLat:
                    dropLocation.lat,

                dropLng:
                    dropLocation.lng,

                vehicle:
                    vehicleSelect.value,

                fare:
                    currentFare,

                distance:
                    Number(
                        currentDistance.toFixed(2)
                    ),

                riderPhone:
                    rider.phone,

                riderName:
                    rider.name,

                riderVehicle:
                    rider.vehicle,

                riderPlate:
                    rider.plate,

                status:
                    "pending",

                createdAt:
                    new Date().toISOString()
            };


            // SEND TO RIDER

            localStorage.setItem(
                "rideRequest_" +
                rider.phone,

                JSON.stringify(
                    rideRequest
                )
            );


            // SAVE USER RIDE

            localStorage.setItem(
                "activeUserRide",

                JSON.stringify(
                    rideRequest
                )
            );


            rideStatus.textContent =
                "🚕 Ride request sent to " +
                rider.name +
                ". Waiting for acceptance...";


            searchRideBtn.disabled =
                true;


            searchRideBtn.textContent =
                "Ride Requested";


            startRideStatusListener();
        }
    );


    // ==================================================
    // RIDE STATUS LISTENER
    // ==================================================

    let rideStatusTimer = null;


    function startRideStatusListener() {

        if (
            rideStatusTimer
        ) {

            clearInterval(
                rideStatusTimer
            );
        }


        rideStatusTimer =
            setInterval(
                function () {

                    const ride =
                        getActiveRide();


                    if (!ride) {

                        return;
                    }


                    if (
                        ride.status ===
                        "accepted"
                    ) {

                        clearInterval(
                            rideStatusTimer
                        );


                        showAcceptedRider(
                            ride
                        );
                    }


                    if (
                        ride.status ===
                        "rejected"
                    ) {

                        clearInterval(
                            rideStatusTimer
                        );


                        rideStatus.textContent =
                            "❌ Rider rejected the request.";


                        searchRideBtn.disabled =
                            false;


                        searchRideBtn.textContent =
                            "Request Ride";
                    }


                    if (
                        ride.status ===
                        "completed"
                    ) {

                        clearInterval(
                            rideStatusTimer
                        );


                        rideStatus.textContent =
                            "✅ Ride Completed";

                        searchRideBtn.disabled =
                            false;

                        searchRideBtn.textContent =
                            "Request Ride";
                    }

                },
                1000
            );
    }


    // ==================================================
    // GET ACTIVE RIDE
    // ==================================================

    function getActiveRide() {

        try {

            return JSON.parse(
                localStorage.getItem(
                    "activeUserRide"
                )
            );

        } catch (error) {

            return null;
        }
    }


    // ==================================================
    // SHOW ACCEPTED RIDER
    // ==================================================

    function showAcceptedRider(
        ride
    ) {

        riderInfoCard.style.display =
            "block";


        document.getElementById(
            "acceptedRiderName"
        ).textContent =
            ride.riderName ||
            "Rider";


        document.getElementById(
            "acceptedRiderPhone"
        ).textContent =
            ride.riderPhone ||
            "";


        document.getElementById(
            "acceptedRiderVehicle"
        ).textContent =
            ride.riderVehicle ||
            ride.vehicle ||
            "";


        document.getElementById(
            "acceptedRiderPlate"
        ).textContent =
            ride.riderPlate ||
            "";


        document.getElementById(
            "acceptedRiderStatus"
        ).textContent =
            "Ride Accepted ✅";


        rideStatus.textContent =
            "🎉 Your rider has accepted the ride. Rider is coming to your pickup location.";


        searchRideBtn.disabled =
            false;


        searchRideBtn.textContent =
            "Request Ride";


        startRiderLocationTracking(
            ride.riderPhone
        );
    }


    // ==================================================
    // RIDER LIVE LOCATION
    // ==================================================

    function startRiderLocationTracking(
        riderPhone
    ) {

        if (
            riderLocationTimer
        ) {

            clearInterval(
                riderLocationTimer
            );
        }


        riderLocationTimer =
            setInterval(
                function () {

                    try {

                        const rider =
                            JSON.parse(
                                localStorage.getItem(
                                    "activeRider_" +
                                    riderPhone
                                )
                            );


                        if (
                            !rider ||
                            rider.online !== true
                        ) {

                            return;
                        }


                        if (
                            typeof rider.lat !==
                            "number" ||
                            typeof rider.lng !==
                            "number"
                        ) {

                            return;
                        }


                        if (
                            !riderMarker
                        ) {

                            riderMarker =
                                L.marker(
                                    [
                                        rider.lat,
                                        rider.lng
                                    ]
                                )
                                .addTo(map)
                                .bindPopup(
                                    "🚗 Your Rider"
                                );

                        } else {

                            riderMarker.setLatLng(
                                [
                                    rider.lat,
                                    rider.lng
                                ]
                            );
                        }


                    } catch (error) {

                        console.error(
                            "Rider location error:",
                            error
                        );
                    }

                },
                1000
            );
    }


    // ==================================================
    // EXISTING RIDE
    // ==================================================

    const existingRide =
        getActiveRide();


    if (
        existingRide
    ) {

        if (
            existingRide.status ===
            "accepted"
        ) {

            showAcceptedRider(
                existingRide
            );

        } else if (
            existingRide.status ===
            "pending"
        ) {

            rideStatus.textContent =
                "🚕 Your ride request is still waiting for rider acceptance.";

            searchRideBtn.disabled =
                true;

            searchRideBtn.textContent =
                "Ride Requested";

            startRideStatusListener();
        }
    }


    // ==================================================
    // REFRESH RIDER LIST
    // ==================================================

    setInterval(
        function () {

            if (
                pickupLocation
            ) {

                showNearbyRiders();
            }

        },
        3000
    );

});
