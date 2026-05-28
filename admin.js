// Global Master Configuration State loaded safely via standard persistent properties
let currentMasterAdminPin = localStorage.getItem("fastgo_sys_admin_pin") || "9999";

// ================= ADMIN SECURITY CONTROLS =================
function verifyAdminAccess() {
    const enteredPin = document.getElementById("adminPinInput").value;
    const errorField = document.getElementById("authErrorMsg");

    if (enteredPin === currentMasterAdminPin) {
        // Authenticated correctly
        document.getElementById("adminAuthOverlay").style.display = "none";
        document.getElementById("adminMainContent").style.display = "flex";
        errorField.innerText = "";
        
        // Initialize dashboard dataset pipelines
        refreshAdminDashboardData();
    } else {
        errorField.innerText = "Access Denied: Invalid Security Passcode Matrix Exception.";
    }
}

function lockAdminPanel() {
    document.getElementById("adminPinInput").value = "";
    document.getElementById("adminAuthOverlay").style.display = "flex";
    document.getElementById("adminMainContent").style.display = "none";
}

// Switching Workspace Screen Layout views
function switchTab(tabId) {
    // Toggle active nav menu highlights
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');

    // Toggle real layout viewport sections
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.add('active');
    
    // Refresh targeted datasets pipelines dynamically
    refreshAdminDashboardData();
}

// ================= PIPELINE EXTRACTOR & DATA POPULATOR =================
function refreshAdminDashboardData() {
    let parsedUsers = [];
    let parsedRiders = [];
    let storageOperationalLogHTML = "";

    // Parse loop directly evaluating keys against local structural objects
    for (let i = 0; i < localStorage.length; i++) {
        let currentKey = localStorage.key(i);
        let rawDataValue = localStorage.getItem(currentKey);

        // Preview rendering inside recent logs view
        storageOperationalLogHTML += `
            <tr>
                <td><code>${currentKey}</code></td>
                <td>${rawDataValue.substring(0, 45)}...</td>
                <td><button class="delete-btn" onclick="destroyKeyDirect('${currentKey}')">Wipe Raw Key</button></td>
            </tr>
        `;

        try {
            let itemObject = JSON.parse(rawDataValue);

            // Categorize into data fields
            if (currentKey.startsWith("rider_") && itemObject.number) {
                parsedRiders.push(itemObject);
            } else if (!isNaN(currentKey) && currentKey.length === 10) {
                // User items use their pure 10-digit primary active phone string as keys
                parsedUsers.push({ number: currentKey, name: itemObject });
            }
        } catch (e) {
            // Ignore non-JSON system keys or internal strings
        }
    }

    // Set high level statistics metrics indicators
    document.getElementById("stat-total-users").innerText = parsedUsers.length;
    document.getElementById("stat-total-riders").innerText = parsedRiders.length;
    
    // Calculate total corporate wallet holdings
    let companyWalletObj = JSON.parse(localStorage.getItem("fastGoCompanyAccount")) || { balance: 0 };
    document.getElementById("stat-company-wallet").innerText = "₹" + (companyWalletObj.balance || 0);

    // Populate operational monitoring systems preview table
    document.getElementById("storageKeysLog").innerHTML = storageOperationalLogHTML || "<tr><td colspan='3'>No dynamic data tracks loaded currently.</td></tr>";

    // Bind clean tabular views elements
    renderUsersInterface(parsedUsers);
    renderRidersInterface(parsedRiders);
}

// Render dynamic customer dataset listings controls
function renderUsersInterface(usersArray) {
    const tbody = document.getElementById("usersTableBody");
    tbody.innerHTML = "";

    usersArray.forEach(user => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${user.number}</strong></td>
                <td>${user.name}</td>
                <td><span style="color: #00ff99;"><i class="fa-solid fa-circle-check"></i> Standard Registered</span></td>
                <td>
                    <button class="delete-btn" onclick="removeUserLive('${user.number}')"><i class="fa-solid fa-user-minus"></i> Expel User</button>
                </td>
            </tr>
        `;
    });

    if(usersArray.length === 0) {
        tbody.innerHTML = "<tr><td colspan='4'>No users registered on system instance currently.</td></tr>";
    }
}

// Render vehicle operations driver telemetry panel elements
function renderRidersInterface(ridersArray) {
    const tbody = document.getElementById("ridersTableBody");
    tbody.innerHTML = "";

    ridersArray.forEach(rider => {
        // Read targeted rider's dedicated balance sub-key matchers logic parameters safely
        let riderWalletObj = JSON.parse(localStorage.getItem("riderWallet_" + rider.number)) || { balance: 0 };
        let balanceValue = riderWalletObj.balance || 0;

        tbody.innerHTML += `
            <tr>
                <td><strong>${rider.number}</strong></td>
                <td>${rider.name}</td>
                <td><span class="vehicle-pill">${rider.vehicle}</span></td>
                <td><code>${rider.plate}</code></td>
                <td style="color: ${balanceValue >= 0 ? '#00ff99':'#ef4444'}">₹${balanceValue}</td>
                <td>
                    <input type="number" id="amtUpdate_${rider.number}" class="wallet-input" placeholder="± ₹">
                    <button class="edit-btn" onclick="modifyRiderBalanceLive('${rider.number}', 1)">Add</button>
                    <button class="delete-btn" onclick="modifyRiderBalanceLive('${rider.number}', -1)">Deduct</button>
                </td>
                <td>
                    <button class="delete-btn" onclick="removeRiderLive('${rider.number}')"><i class="fa-solid fa-trash"></i> Drop</button>
                </td>
            </tr>
        `;
    });

    if(ridersArray.length === 0) {
        tbody.innerHTML = "<tr><td colspan='7'>No active driver accounts found in internal databases.</td></tr>";
    }
}

// ================= LIVE MODIFICATION MOTORS =================

// Wipe arbitrary string targets or custom data contexts straight from key definitions
function destroyKeyDirect(targetKey) {
    if (confirm(`Warning: You are clearing key [${targetKey}] directly from local engine configurations. Proceed?`)) {
        localStorage.removeItem(targetKey);
        refreshAdminDashboardData();
    }
}

// Manual additions mapping pipeline logic validation engines parameters safely
function promptAddUser() {
    const name = prompt("Enter User's Registered Full Name:");
    if (!name) return;
    const phone = prompt("Enter 10-digit Indian Mobile Number:");
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
        alert("Action Cancelled: Mobile criteria mismatch failed execution parameters.");
        return;
    }

    // Save exactly matching user.js pattern parameters mapping values arrays strings inside memory allocations
    localStorage.setItem(phone, JSON.stringify(name));
    alert("System Status update: New user records written to production variables.");
    refreshAdminDashboardData();
}

function removeUserLive(phoneKey) {
    if (confirm(`Confirm permanent removal of User instance data tied to profile key: ${phoneKey}?`)) {
        localStorage.removeItem(phoneKey);
        refreshAdminDashboardData();
    }
}

function removeRiderLive(riderPhone) {
    if (confirm(`Confirm permanent erasure of Rider account maps linked to phone sequence: ${riderPhone}?`)) {
        localStorage.removeItem("rider_" + riderPhone);
        localStorage.removeItem("riderWallet_" + riderPhone);
        refreshAdminDashboardData();
    }
}

// Safely updates driver wallets without causing database or loop errors
function modifyRiderBalanceLive(riderPhone, multiplier) {
    const inputAmount = document.getElementById(`amtUpdate_${riderPhone}`).value;
    if (!inputAmount || isNaN(inputAmount) || parseFloat(inputAmount) <= 0) {
        alert("Input error: Amount must be a positive number.");
        return;
    }

    let changeValue = parseFloat(inputAmount) * multiplier;
    let walletKey = "riderWallet_" + riderPhone;
    let currentWallet = JSON.parse(localStorage.getItem(walletKey)) || { balance: 0 };
    
    currentWallet.balance = (currentWallet.balance || 0) + changeValue;
    localStorage.setItem(walletKey, JSON.stringify(currentWallet));
    
    alert(`Wallet balance successfully updated by ₹${changeValue}.`);
    refreshAdminDashboardData();
}

// Commit System Variable Settings updates globally across platform
function saveSystemConfigurations() {
    const systemNotice = document.getElementById("cfgSystemNotice").value;
    const explicitMasterPin = document.getElementById("cfgAdminPin").value;

    if (systemNotice) {
        localStorage.setItem("fastgo_global_alert_notice", systemNotice);
    }
    
    if (explicitMasterPin && explicitMasterPin.trim().length >= 4) {
        currentMasterAdminPin = explicitMasterPin.trim();
        localStorage.setItem("fastgo_sys_admin_pin", currentMasterAdminPin);
    }

    alert("Production system metrics committed upstream successfully. Application adjustments will reflect on the live frontend immediately.");
}

// Initialize runtime settings bindings cleanly upon document lifecycle readiness states
window.onload = function() {
    document.getElementById("cfgAdminPin").value = currentMasterAdminPin;
    let savedNotice = localStorage.getItem("fastgo_global_alert_notice");
    if (savedNotice) document.getElementById("cfgSystemNotice").value = savedNotice;
};