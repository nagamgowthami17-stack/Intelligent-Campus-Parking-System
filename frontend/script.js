
// ==========================================
// INTELLIGENT CAMPUS PARKING SYSTEM
// ==========================================

// DOM ELEMENTS
const vehicleList = document.getElementById("vehicleList");
const capacityInput = document.getElementById("capacity");
const errorMessage = document.getElementById("errorMessage");

const algorithmTitle = document.getElementById("algorithmTitle");
const algorithmDescription = document.getElementById("algorithmDescription");
const timeComplexity = document.getElementById("timeComplexity");
const spaceComplexity = document.getElementById("spaceComplexity");
const stepsList = document.getElementById("stepsList");
const resultTable = document.getElementById("resultTable");

let algorithmResults = {};
let displayedVehicles = [];
let currentAlgorithm = "brute";

// ==========================================
// ALGORITHM INFORMATION
// ==========================================

const algorithmInfo = {
    brute: {
        title: "Brute Force Algorithm",
        description: "Checks every possible combination of vehicles to find the maximum number that can fit.",
        time: "O(2^n)",
        space: "O(n)",
        steps: [
            "Start with an empty vehicle selection.",
            "Consider every possible combination.",
            "Calculate the total parking space required.",
            "Reject combinations exceeding capacity.",
            "Choose the valid combination with the maximum vehicles."
        ]
    },

    backtracking: {
        title: "Backtracking Algorithm",
        description: "Explores possible vehicle selections and abandons choices that cannot improve the current result.",
        time: "O(2^n)",
        space: "O(n)",
        steps: [
            "Start with the first vehicle.",
            "Try selecting the vehicle if it fits.",
            "Explore the remaining vehicles.",
            "Backtrack when a selection cannot fit.",
            "Remember the selection with the maximum vehicle count."
        ]
    },

    greedy: {
        title: "Greedy Algorithm",
        description: "Selects vehicles in ascending order of their required parking space.",
        time: "O(n log n)",
        space: "O(n)",
        steps: [
            "Sort vehicles by required parking space.",
            "Start with zero space used.",
            "Select the smallest vehicle that fits.",
            "Continue checking the remaining vehicles.",
            "Display the selected vehicles."
        ]
    },

    dp: {
        title: "Dynamic Programming",
        description: "Uses a DP table to calculate the maximum number of vehicles that can fit.",
        time: "O(n × C)",
        space: "O(n × C)",
        steps: [
            "Create a DP table using vehicles and parking capacity.",
            "Initialize the table with zero.",
            "Consider selecting or skipping each vehicle.",
            "Store the maximum vehicle count for each capacity.",
            "Trace back through the table to identify selected vehicles."
        ]
    }
};

// ==========================================
// ADD VEHICLE
// ==========================================

function addVehicle(id = "", type = "Car", space = "") {

    if (vehicleList.children.length >= 20) {
        errorMessage.textContent = "Maximum 20 vehicles are allowed.";
        return;
    }

    const row = document.createElement("div");
    row.className = "vehicle-row";

    const idDiv = document.createElement("div");
    const idLabel = document.createElement("label");
    idLabel.textContent = "Vehicle ID";

    const idInput = document.createElement("input");
    idInput.type = "number";
    idInput.className = "vehicle-id";
    idInput.min = "1";
    idInput.placeholder = "Enter ID";
    idInput.value = id;

    idDiv.append(idLabel, idInput);

    const typeDiv = document.createElement("div");
    const typeLabel = document.createElement("label");
    typeLabel.textContent = "Vehicle Type";

    const typeSelect = document.createElement("select");
    typeSelect.className = "vehicle-type";

    ["Car", "Bike"].forEach(vehicleType => {
        const option = document.createElement("option");
        option.value = vehicleType;
        option.textContent = vehicleType;
        typeSelect.appendChild(option);
    });

    typeSelect.value = type;
    typeDiv.append(typeLabel, typeSelect);

    const spaceDiv = document.createElement("div");
    const spaceLabel = document.createElement("label");
    spaceLabel.textContent = "Required Space";

    const spaceInput = document.createElement("input");
    spaceInput.type = "number";
    spaceInput.className = "vehicle-space";
    spaceInput.min = "1";
    spaceInput.placeholder = "Enter space";
    spaceInput.value = space;

    spaceDiv.append(spaceLabel, spaceInput);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-btn";
    removeButton.textContent = "Remove";

    removeButton.addEventListener("click", () => {
        row.remove();
        errorMessage.textContent = "";
    });

    row.append(idDiv, typeDiv, spaceDiv, removeButton);
    vehicleList.appendChild(row);
}

// ==========================================
// INITIAL SAMPLE VEHICLES
// ==========================================

addVehicle(101, "Car", 4);
addVehicle(102, "Bike", 3);
addVehicle(103, "Car", 5);

// ==========================================
// ADD VEHICLE BUTTON
// ==========================================

document.getElementById("addVehicle").addEventListener("click", () => {
    addVehicle();
});

// ==========================================
// GET AND VALIDATE INPUT
// ==========================================

function getVehicleData() {

    const capacity = Number(capacityInput.value);

    if (!Number.isInteger(capacity) || capacity <= 0 || capacity > 10000) {
        throw new Error("Enter a valid parking capacity between 1 and 10000.");
    }

    const rows = document.querySelectorAll(".vehicle-row");

    if (rows.length === 0) {
        throw new Error("Please enter at least one vehicle.");
    }

    if (rows.length > 20) {
        throw new Error("Maximum 20 vehicles are allowed.");
    }

    const vehicles = [];
    const ids = new Set();

    rows.forEach((row, index) => {

        const id = Number(row.querySelector(".vehicle-id").value);
        const type = row.querySelector(".vehicle-type").value;
        const space = Number(row.querySelector(".vehicle-space").value);

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error(`Enter a valid ID for vehicle ${index + 1}.`);
        }

        if (!Number.isInteger(space) || space <= 0) {
            throw new Error(`Enter valid space for vehicle ${index + 1}.`);
        }

        if (ids.has(id)) {
            throw new Error(`Vehicle ID ${id} is duplicated.`);
        }

        ids.add(id);

        vehicles.push({ id, type, space });
    });

    return { capacity, vehicles };
}

// ==========================================
// CREATE RESULT
// ==========================================

function createResult(vehicles, capacity, selected) {

    const chosen = [];
    let usedSpace = 0;

    for (let i = 0; i < vehicles.length; i++) {
        if (selected[i]) {
            chosen.push(vehicles[i]);
            usedSpace += vehicles[i].space;
        }
    }

    return {
        selected,
        chosen,
        count: chosen.length,
        usedSpace,
        remaining: capacity - usedSpace
    };
}

// ==========================================
// 1. BRUTE FORCE
// ==========================================

function bruteForce(vehicles, capacity) {

    let bestCount = 0;
    let bestSelected = new Array(vehicles.length).fill(false);

    function solve(index, usedSpace, count, selected) {

        if (index === vehicles.length) {
            if (count > bestCount) {
                bestCount = count;
                bestSelected = [...selected];
            }
            return;
        }

        selected[index] = false;
        solve(index + 1, usedSpace, count, selected);

        if (usedSpace + vehicles[index].space <= capacity) {
            selected[index] = true;

            solve(
                index + 1,
                usedSpace + vehicles[index].space,
                count + 1,
                selected
            );
        }

        selected[index] = false;
    }

    solve(0, 0, 0, new Array(vehicles.length).fill(false));

    return createResult(vehicles, capacity, bestSelected);
}

// ==========================================
// 2. BACKTRACKING
// ==========================================

function backtracking(vehicles, capacity) {

    let bestCount = 0;
    let bestSelected = new Array(vehicles.length).fill(false);

    function solve(index, usedSpace, count, selected) {

        if (index === vehicles.length) {
            if (count > bestCount) {
                bestCount = count;
                bestSelected = [...selected];
            }
            return;
        }

        if (count + (vehicles.length - index) <= bestCount) {
            return;
        }

        if (usedSpace + vehicles[index].space <= capacity) {
            selected[index] = true;

            solve(
                index + 1,
                usedSpace + vehicles[index].space,
                count + 1,
                selected
            );
        }

        selected[index] = false;
        solve(index + 1, usedSpace, count, selected);
    }

    solve(0, 0, 0, new Array(vehicles.length).fill(false));

    return createResult(vehicles, capacity, bestSelected);
}

// ==========================================
// 3. GREEDY
// ==========================================

function greedy(vehicles, capacity) {

    const sorted = vehicles
        .map((vehicle, index) => ({
            ...vehicle,
            originalIndex: index
        }))
        .sort((a, b) =>
            a.space - b.space || a.originalIndex - b.originalIndex
        );

    const selected = new Array(vehicles.length).fill(false);
    let usedSpace = 0;

    for (const vehicle of sorted) {

        if (usedSpace + vehicle.space <= capacity) {
            usedSpace += vehicle.space;
            selected[vehicle.originalIndex] = true;
        }
    }

    return createResult(vehicles, capacity, selected);
}

// ==========================================
// 4. DYNAMIC PROGRAMMING
// ==========================================

function dynamicProgramming(vehicles, capacity) {

    const n = vehicles.length;

    const dp = Array.from(
        { length: n + 1 },
        () => new Array(capacity + 1).fill(0)
    );

    for (let i = 1; i <= n; i++) {

        for (let w = 0; w <= capacity; w++) {

            dp[i][w] = dp[i - 1][w];

            if (vehicles[i - 1].space <= w) {

                const include =
                    1 + dp[i - 1][w - vehicles[i - 1].space];

                dp[i][w] = Math.max(dp[i][w], include);
            }
        }
    }

    const selected = new Array(n).fill(false);
    let w = capacity;

    for (let i = n; i > 0; i--) {

        if (dp[i][w] !== dp[i - 1][w]) {
            selected[i - 1] = true;
            w -= vehicles[i - 1].space;
        }
    }

    return createResult(vehicles, capacity, selected);
}

// ==========================================
// DISPLAY ALGORITHM INFORMATION
// ==========================================

function showResult(algorithm) {

    currentAlgorithm = algorithm;

    const info = algorithmInfo[algorithm];

    if (!info) return;

    algorithmTitle.textContent = info.title;
    algorithmDescription.textContent = info.description;
    timeComplexity.textContent = info.time;
    spaceComplexity.textContent = info.space;

    stepsList.innerHTML = "";

    info.steps.forEach(step => {
        const li = document.createElement("li");
        li.textContent = step;
        stepsList.appendChild(li);
    });

    // Highlight clicked algorithm tab

    document.querySelectorAll(".tab").forEach(tab => {
        tab.classList.toggle(
            "active",
            tab.dataset.algorithm === algorithm
        );
    });

    // Display results if algorithms have been executed

    const result = algorithmResults[algorithm];

    if (!result) {
        document.getElementById("vehicleCount").textContent = "—";
        document.getElementById("spaceUsed").textContent = "—";
        document.getElementById("remainingSpace").textContent = "—";

        resultTable.innerHTML = `
            <tr>
                <td colspan="4">Click Run All Algorithms to calculate allocation results.</td>
            </tr>
        `;

        return;
    }

    document.getElementById("vehicleCount").textContent = result.count;
    document.getElementById("spaceUsed").textContent = result.usedSpace;
    document.getElementById("remainingSpace").textContent = result.remaining;

    resultTable.innerHTML = "";

    displayedVehicles.forEach((vehicle, index) => {

        const row = document.createElement("tr");

        const values = [
            vehicle.id,
            vehicle.type,
            vehicle.space,
            result.selected[index] ? "Selected" : "Not Selected"
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        row.lastChild.className = result.selected[index]
            ? "selected"
            : "not-selected";

        resultTable.appendChild(row);
    });
}

// ==========================================
// RUN ALL FOUR ALGORITHMS
// ==========================================

document.getElementById("runAlgorithms").addEventListener("click", () => {

    try {

        errorMessage.textContent = "";

        const { capacity, vehicles } = getVehicleData();

        displayedVehicles = vehicles;

        algorithmResults = {
            brute: bruteForce(vehicles, capacity),
            backtracking: backtracking(vehicles, capacity),
            greedy: greedy(vehicles, capacity),
            dp: dynamicProgramming(vehicles, capacity)
        };

        showResult(currentAlgorithm);

        document.getElementById("algorithms").scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {
        errorMessage.textContent = error.message;
    }
});

// ==========================================
// ALGORITHM TAB CLICK EVENTS
// ==========================================

document.querySelectorAll(".tab").forEach(tab => {

    tab.addEventListener("click", () => {

        errorMessage.textContent = "";

        const selectedAlgorithm = tab.dataset.algorithm;

        showResult(selectedAlgorithm);

    });
});

// ==========================================
// INITIAL DISPLAY
// ==========================================

showResult("brute");
