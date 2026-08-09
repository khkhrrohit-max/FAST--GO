// ======================================================
// FAST GO RIDER PAGE
// NO SUPABASE VERSION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {


        // ==================================================
        // ELEMENTS
        // ==================================================

        const statusText =
            document.getElementById(
                "status"
            );


        const toggleStatusBtn =
            document.getElementById(
                "toggleStatusBtn"
            );


        const rideRequestCard =
            document.getElementById(
                "rideRequestCard"
            );


        const noRideMessage =
            document.getElementById(
                "noRideMessage"
            );


        const activeRideCard =
            document.getElementById(
                "activeRideCard"
            );


        const acceptBtn =
            document.getElementById(
                "acceptBtn"
            );


        const rejectBtn =
            document.getElementById(
                "rejectBtn"
            );


        const completeRideBtn =
            document.getElementById(
                "completeRideBtn"
            );


        const walletBalance =
            document.getElementById(
                "walletBalance"
            );


        // ==================================================
        // RIDER LOGIN
        // ==================================================

        let loggedInRider = null;


        try {

            loggedInRider =
                JSON.parse(
                    localStorage.getItem(
                        "loggedInRider"
                    )
                );

        } catch (error) {

            loggedInRider = null;
        }


        if (!loggedInRider) {

            alert(
                "Please login as rider first."
            );

            window.location.href =
                "loginrider.html";

            return;
        }


        // ==================================================
        // RIDER DATA
        // ==================================================

        const riderPhone =
            loggedInRider.number ||
            loggedInRider.phone;


        const riderName =
            loggedInRider.name ||
            "Rider";


        const riderVehicle =
            loggedInRider.vehicle ||
            "Bike";


        const riderPlate =
            loggedInRider.plate ||
            "";


        if (!riderPhone) {

            alert(
                "Rider mobile number not found."
            );

            return;
        }


        // ==================================================
        // STORAGE KEYS
        // ==================================================

        const activeRiderKey =
            "activeRider_" +
            riderPhone;


        const requestKey =
            "rideRequest_" +
            riderPhone;


        const walletKey =
            "riderWallet_" +
            riderPhone;


        const companyKey =
            "fastGoCompanyAccount";


        // ==================================================
        // WALLET
        // ==================================================

        let wallet =
            getStorageObject(
                walletKey
            );


        if (!wallet) {

            wallet = {
                balance: 0
            };


            saveStorageObject(
                walletKey,
                wallet
            );
        }


        let company =
            getStorageObject(
                companyKey
            );


        if (!company) {

            company = {
                balance: 0
            };


            saveStorageObject(
                companyKey,
                company
            );
        }


        updateWalletDisplay();


        // ==================================================
        // MAP
        // ==================================================

        const map =
            L.map(
                "mapContainer"
            ).setView(
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


        let riderMarker = null;

        let pickupMarker = null;

        let dropMarker = null;

        let routingControl = null;

        let watchId = null;


        // ==================================================
        // ACTIVE RIDE
        // ==================================================

        let currentRide =
            getStorageObject(
                requestKey
            );


        // ==================================================
        // HELPER FUNCTIONS
        // ==================================================

        function getStorageObject(
            key
        ) {

            try {

                return JSON.parse(
                    localStorage.getItem(
                        key
                    )
                );

            } catch (error) {

                return null;
            }
        }


        function saveStorageObject(
            key,
            value
        ) {

            localStorage.setItem(
                key,
                JSON.stringify(
                    value
                )
            );
        }


        // ==================================================
        // WALLET DISPLAY
        // ==================================================

        function updateWalletDisplay() {

            wallet =
                getStorageObject(
                    walletKey
                ) || {
                    balance: 0
                };


            walletBalance.textContent =
                Number(
                    wallet.balance
                ).toFixed(2);
        }


        // ==================================================
        // WALLET LIMIT
        // ==================================================

        function walletAllowed() {

            wallet =
                getStorageObject(
                    walletKey
                ) || {
                    balance: 0
                };


            if (
                wallet.balance <= -500
            ) {

                alert(
                    "⚠ Wallet limit -₹500 reached. Please recharge."
                );

                return false;
            }


            return true;
        }


        // ==================================================
        // ONLINE / OFFLINE
        // ==================================================

        toggleStatusBtn.addEventListener(
            "click",
            function () {

                const currentlyOnline =
                    statusText.textContent.trim()
                    ===
                    "Online";


                if (
                    currentlyOnline
                ) {

                    goOffline();

                } else {

                    goOnline();
                }
            }
        );


        // ==================================================
        // GO ONLINE
        // ==================================================

        function goOnline() {

            if (
                !navigator.geolocation
            ) {

                alert(
                    "Your browser does not support GPS location."
                );

                return;
            }


            statusText.textContent =
                "Getting location...";


            navigator.geolocation.getCurrentPosition(

                function (position) {

                    statusText.textContent =
                        "Online";


                    statusText.style.color =
                        "green";


                    toggleStatusBtn.textContent =
                        "Go Offline";


                    updateRiderLocation(
                        position
                    );


                    watchId =
                        navigator.geolocation.watchPosition(

                            function (newPosition) {

                                updateRiderLocation(
                                    newPosition
                                );
                            },

                            function (error) {

                                console.error(
                                    "GPS error:",
                                    error
                                );
                            },

                            {

                                enableHighAccuracy:
                                    true,

                                maximumAge:
                                    2000,

                                timeout:
                                    10000

                            }
                        );
                },


                function (error) {

                    console.error(
                        error
                    );


                    statusText.textContent =
                        "Offline";


                    alert(
                        "Location permission is required to go online."
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


        // ==================================================
        // UPDATE RIDER LOCATION
        // ==================================================

        function updateRiderLocation(
            position
        ) {

            const lat =
                position.coords.latitude;


            const lng =
                position.coords.longitude;


            if (!riderMarker) {

                riderMarker =
                    L.marker(
                        [lat, lng]
                    )
                    .addTo(map)
                    .bindPopup(
                        "🚗 You are here"
                    );

            } else {

                riderMarker.setLatLng(
                    [lat, lng]
                );
            }


            map.setView(
                [lat, lng],
                15
            );


            const riderData = {

                phone:
                    riderPhone,

                name:
                    riderName,

                vehicle:
                    riderVehicle,

                plate:
                    riderPlate,

                lat:
                    lat,

                lng:
                    lng,

                online:
                    true,

                updatedAt:
                    Date.now()
            };


            saveStorageObject(
                activeRiderKey,
                riderData
            );
        }


        // ==================================================
        // GO OFFLINE
        // ==================================================

        function goOffline() {

            if (
                watchId !== null
            ) {

                navigator.geolocation.clearWatch(
                    watchId
                );

                watchId =
                    null;
            }


            localStorage.removeItem(
                activeRiderKey
            );


            statusText.textContent =
                "Offline";


            statusText.style.color =
                "red";


            toggleStatusBtn.textContent =
                "Go Online";


            if (riderMarker) {

                map.removeLayer(
                    riderMarker
                );

                riderMarker =
                    null;
            }
        }


        // ==================================================
        // CHECK REQUEST
        // ==================================================

        function checkRideRequest() {

            const request =
                getStorageObject(
                    requestKey
                );


            if (!request) {

                if (
                    !currentRide ||
                    currentRide.status !==
                    "accepted"
                ) {

                    showNoRequest();
                }

                return;
            }


            if (
                request.status ===
                "pending"
            ) {

                currentRide =
                    request;


                showRideRequest(
                    request
                );

                return;
            }


            if (
                request.status ===
                "accepted"
            ) {

                currentRide =
                    request;


                showActiveRide(
                    request
                );

                return;
            }


            if (
                request.status ===
                "completed"
            ) {

                showNoRequest();

                return;
            }


            if (
                request.status ===
                "rejected"
            ) {

                showNoRequest();
            }
        }


        // ==================================================
        // SHOW NO REQUEST
        // ==================================================

        function showNoRequest() {

            rideRequestCard.style.display =
                "none";


            noRideMessage.style.display =
                "block";
        }


        // ==================================================
        // SHOW REQUEST
        // ==================================================

        function showRideRequest(
            request
        ) {

            if (
                !walletAllowed()
            ) {

                return;
            }


            noRideMessage.style.display =
                "none";


            rideRequestCard.style.display =
                "block";


            activeRideCard.style.display =
                "none";


            document.getElementById(
                "requestUserName"
            ).textContent =
                request.userName ||
                "User";


            document.getElementById(
                "requestUserPhone"
            ).textContent =
                request.userPhone ||
                "";


            document.getElementById(
                "requestPickup"
            ).textContent =
                request.pickup ||
                "";


            document.getElementById(
                "requestDrop"
            ).textContent =
                request.drop ||
                "";


            document.getElementById(
                "requestVehicle"
            ).textContent =
                request.vehicle ||
                "";


            document.getElementById(
                "requestFare"
            ).textContent =
                request.fare ||
                0;


            document.getElementById(
                "requestDistance"
            ).textContent =
                request.distance ||
                0;


            showRequestOnMap(
                request
            );
        }


        // ==================================================
        // SHOW REQUEST ON MAP
        // ==================================================

        function showRequestOnMap(
            request
        ) {

            if (
                typeof request.pickupLat !==
                "number"
            ) {

                return;
            }


            if (
                pickupMarker
            ) {

                map.removeLayer(
                    pickupMarker
                );
            }


            if (
                dropMarker
            ) {

                map.removeLayer(
                    dropMarker
                );
            }


            pickupMarker =
                L.marker(
                    [
                        request.pickupLat,
                        request.pickupLng
                    ]
                )
                .addTo(map)
                .bindPopup(
                    "📍 Passenger Pickup"
                );


            if (
                typeof request.dropLat ===
                "number"
            ) {

                dropMarker =
                    L.marker(
                        [
                            request.dropLat,
                            request.dropLng
                        ]
                    )
                    .addTo(map)
                    .bindPopup(
                        "🏁 Destination"
                    );
            }


            map.setView(
                [
                    request.pickupLat,
                    request.pickupLng
                ],
                14
            );
        }


        // ==================================================
        // ACCEPT RIDE
        // ==================================================

        acceptBtn.addEventListener(
            "click",
            function () {

                if (
                    !walletAllowed()
                ) {

                    return;
                }


                const request =
                    getStorageObject(
                        requestKey
                    );


                if (
                    !request ||
                    request.status !==
                    "pending"
                ) {

                    alert(
                        "This ride request is no longer available."
                    );

                    return;
                }


                request.status =
                    "accepted";


                request.riderPhone =
                    riderPhone;


                request.riderName =
                    riderName;


                request.riderVehicle =
                    riderVehicle;


                request.riderPlate =
                    riderPlate;


                saveStorageObject(
                    requestKey,
                    request
                );


                saveStorageObject(
                    "activeUserRide",
                    request
                );


                currentRide =
                    request;


                showActiveRide(
                    request
                );


                alert(
                    "Ride Accepted 🚕"
                );
            }
        );


        // ==================================================
        // REJECT RIDE
        // ==================================================

        rejectBtn.addEventListener(
            "click",
            function () {

                const request =
                    getStorageObject(
                        requestKey
                    );


                if (
                    !request
                ) {

                    return;
                }


                request.status =
                    "rejected";


                saveStorageObject(
                    requestKey,
                    request
                );


                /*
                 * Also update the user's
                 * active ride.
                 */

                saveStorageObject(
                    "activeUserRide",
                    request
                );


                currentRide =
                    null;


                rideRequestCard.style.display =
                    "none";


                noRideMessage.style.display =
                    "block";


                alert(
                    "Ride Rejected ❌"
                );
            }
        );


        // ==================================================
        // SHOW ACTIVE RIDE
        // ==================================================

        function showActiveRide(
            request
        ) {

            rideRequestCard.style.display =
                "none";


            noRideMessage.style.display =
                "none";


            activeRideCard.style.display =
                "block";


            document.getElementById(
                "activeUserName"
            ).textContent =
                request.userName ||
                "User";


            document.getElementById(
                "activeUserPhone"
            ).textContent =
                request.userPhone ||
                "";


            document.getElementById(
                "activePickup"
            ).textContent =
                request.pickup ||
                "";


            document.getElementById(
                "activeDrop"
            ).textContent =
                request.drop ||
                "";


            document.getElementById(
                "activeFare"
            ).textContent =
                request.fare ||
                0;


            document.getElementById(
                "activeRideStatus"
            ).textContent =
                "Accepted ✅";


            showRequestOnMap(
                request
            );


            drawActiveRoute(
                request
            );
        }


        // ==================================================
        // ACTIVE ROUTE
        // ==================================================

        function drawActiveRoute(
            request
        ) {

            if (
                !request.pickupLat ||
                !request.dropLat
            ) {

                return;
            }


            if (
                routingControl
            ) {

                map.removeControl(
                    routingControl
                );

                routingControl =
                    null;
            }


            const riderPosition =
                riderMarker
                    ? riderMarker.getLatLng()
                    : L.latLng(
                        request.pickupLat,
                        request.pickupLng
                    );


            routingControl =
                L.Routing.control({

                    waypoints: [

                        riderPosition,

                        L.latLng(
                            request.pickupLat,
                            request.pickupLng
                        ),

                        L.latLng(
                            request.dropLat,
                            request.dropLng
                        )

                    ],

                    routeWhileDragging:
                        false,

                    addWaypoints:
                        false,

                    draggableWaypoints:
                        false,

                    createMarker:
                        function () {

                            return null;
                        }

                }).addTo(map);
        }


        // ==================================================
        // COMPLETE RIDE
        // ==================================================

        completeRideBtn.addEventListener(
            "click",
            function () {

                const request =
                    getStorageObject(
                        requestKey
                    );


                if (
                    !request ||
                    request.status !==
                    "accepted"
                ) {

                    alert(
                        "No active ride found."
                    );

                    return;
                }


                const fare =
                    Number(
                        request.fare
                    ) || 0;


                const commission =
                    fare * 0.25;


                wallet =
                    getStorageObject(
                        walletKey
                    ) || {
                        balance: 0
                    };


                /*
                 * Cash/normal demo:
                 * rider pays 25% commission.
                 */

                if (
                    wallet.balance -
                    commission <
                    -500
                ) {

                    alert(
                        "⚠ Wallet limit -₹500 reached."
                    );

                    return;
                }


                wallet.balance -=
                    commission;


                company =
                    getStorageObject(
                        companyKey
                    ) || {
                        balance: 0
                    };


                company.balance +=
                    commission;


                saveStorageObject(
                    walletKey,
                    wallet
                );


                saveStorageObject(
                    companyKey,
                    company
                );


                request.status =
                    "completed";


                request.completedAt =
                    new Date().toISOString();


                saveStorageObject(
                    requestKey,
                    request
                );


                saveStorageObject(
                    "activeUserRide",
                    request
                );


                currentRide =
                    null;


                updateWalletDisplay();


                if (
                    routingControl
                ) {

                    map.removeControl(
                        routingControl
                    );

                    routingControl =
                        null;
                }


                if (
                    pickupMarker
                ) {

                    map.removeLayer(
                        pickupMarker
                    );

                    pickupMarker =
                        null;
                }


                if (
                    dropMarker
                ) {

                    map.removeLayer(
                        dropMarker
                    );

                    dropMarker =
                        null;
                }


                activeRideCard.style.display =
                    "none";


                noRideMessage.style.display =
                    "block";


                alert(
                    "Ride Completed ✅\n" +
                    "Commission: ₹" +
                    commission.toFixed(2)
                );
            }
        );


        // ==================================================
        // INITIAL RIDE CHECK
        // ==================================================

        checkRideRequest();


        // ==================================================
        // CHECK NEW REQUEST EVERY SECOND
        // ==================================================

        setInterval(
            function () {

                checkRideRequest();

            },
            1000
        );


        // ==================================================
        // INITIAL RIDER STATUS
        // ==================================================

        const savedRider =
            getStorageObject(
                activeRiderKey
            );


        if (
            savedRider &&
            savedRider.online === true
        ) {

            /*
             * Do not automatically start GPS.
             * Browser permission should be
             * triggered by button click.
             */

            statusText.textContent =
                "Offline";

            toggleStatusBtn.textContent =
                "Go Online";
        }

    }
);
