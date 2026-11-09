const tabs = document.querySelectorAll(".tab");

const ungroupedBody = document.getElementById("ungroupedBody");
const groupedBody = document.getElementById("groupedBody");

const ungroupedForm = document.getElementById("ungroupedForm");
const groupedForm = document.getElementById("groupedForm");

const sectionTitle = document.getElementById("sectionTitle");
const instructions = document.getElementById("instructions");

const error = document.getElementById("error");
const results = document.getElementById("results");

let currentType = "ungrouped";


// ==================================
// CREATE UNGROUPED ROW
// ==================================

function addUngroupedRow(value = "") {

    const row = ungroupedBody.insertRow();

    const serial = ungroupedBody.rows.length;

    row.innerHTML = `
        <td>${serial}</td>

        <td>
            <input type="number"
                   step="any"
                   class="data-value"
                   value="${value}"
                   placeholder="Enter value">
        </td>

        <td>
            <button class="delete-btn"
                    type="button"
                    onclick="this.closest('tr').remove(); updateSerial(ungroupedBody)">
                Remove
            </button>
        </td>
    `;

}


// ==================================
// CREATE GROUPED ROW
// ==================================

function addGroupedRow(lower = "", upper = "", frequency = "") {

    const row = groupedBody.insertRow();

    const serial = groupedBody.rows.length;

    row.innerHTML = `
        <td>${serial}</td>

        <td>
            <input type="number"
                   step="any"
                   class="lower"
                   value="${lower}"
                   placeholder="Lower">
        </td>

        <td>
            <input type="number"
                   step="any"
                   class="upper"
                   value="${upper}"
                   placeholder="Upper">
        </td>

        <td>
            <input type="number"
                   step="1"
                   min="0"
                   class="frequency"
                   value="${frequency}"
                   placeholder="Frequency">
        </td>

        <td>
            <button class="delete-btn"
                    type="button"
                    onclick="this.closest('tr').remove(); updateSerial(groupedBody)">
                Remove
            </button>
        </td>
    `;

}


// ==================================
// UPDATE SERIAL NUMBERS
// ==================================

function updateSerial(body) {

    [...body.rows].forEach((row, index) => {
        row.cells[0].textContent = index + 1;
    });

}


// ==================================
// INITIAL ROWS
// ==================================

for (let i = 0; i < 5; i++) {
    addUngroupedRow();
}

for (let i = 0; i < 4; i++) {
    addGroupedRow();
}


// ==================================
// ADD ROW BUTTONS
// ==================================

document.getElementById("addUngrouped").onclick = () => {
    addUngroupedRow();
};

document.getElementById("addGrouped").onclick = () => {
    addGroupedRow();
};


// ==================================
// TAB SWITCHING
// ==================================

tabs.forEach(tab => {

    tab.addEventListener("click", () => {

        currentType = tab.dataset.type;

        tabs.forEach(t =>
            t.classList.toggle("active", t === tab)
        );

        ungroupedForm.hidden =
            currentType !== "ungrouped";

        groupedForm.hidden =
            currentType !== "grouped";

        sectionTitle.textContent =
            currentType === "grouped"
                ? "Grouped Data"
                : "Ungrouped Data";

        instructions.textContent =
            currentType === "grouped"
                ? "Enter class intervals and frequencies."
                : "Enter numerical values in the table.";

        error.textContent = "";

        results.hidden = true;

    });

});


// ==================================
// SAMPLE DATA
// ==================================

document.getElementById("sampleUngrouped").onclick = () => {

    ungroupedBody.innerHTML = "";

    [2, 4, 4, 5, 6, 7, 4, 8].forEach(value => {
        addUngroupedRow(value);
    });

};


document.getElementById("sampleGrouped").onclick = () => {

    groupedBody.innerHTML = "";

    const sample = [
        [0, 10, 5],
        [10, 20, 8],
        [20, 30, 12],
        [30, 40, 5]
    ];

    sample.forEach(row => {
        addGroupedRow(row[0], row[1], row[2]);
    });

};


// ==================================
// CALCULATE BUTTON
// ==================================

document.getElementById("calculateBtn").onclick = () => {

    error.textContent = "";

    results.hidden = true;

    try {

        if (currentType === "ungrouped") {
            calculateUngrouped();
        } else {
            calculateGrouped();
        }

    } catch (e) {

        error.textContent = e.message;

    }

};


// ==================================
// DISPLAY RESULTS
// ==================================

function showResults(mean, median, mode, sd, details) {

    document.getElementById("mean").textContent =
        mean.toFixed(2);

    document.getElementById("median").textContent =
        median.toFixed(2);

    document.getElementById("mode").textContent =
        mode;

    document.getElementById("sd").textContent =
        sd.toFixed(2);

    document.getElementById("details").innerHTML =
        details;

    results.hidden = false;

}


// ==================================
// UNGROUPED DATA CALCULATION
// ==================================

function calculateUngrouped() {

    const inputs = [
        ...ungroupedBody.querySelectorAll(".data-value")
    ];

    const values = inputs.map(input => {

        const text = input.value.trim();

        if (text === "") {
            throw new Error("Please fill all data values.");
        }

        return Number(text);

    });

    if (values.length === 0) {
        throw new Error("Please enter some data.");
    }

    if (values.some(v => !Number.isFinite(v))) {
        throw new Error("Please enter valid numerical values.");
    }

    const n = values.length;

    const sorted = [...values].sort((a, b) => a - b);

    // Mean

    const sum = values.reduce((a, b) => a + b, 0);

    const mean = sum / n;

    // Median

    const median = n % 2 === 1
        ? sorted[Math.floor(n / 2)]
        : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;

    // Mode

    const counts = new Map();

    values.forEach(v => {
        counts.set(v, (counts.get(v) || 0) + 1);
    });

    const maxFrequency = Math.max(...counts.values());

    const modes = [...counts.entries()]
        .filter(([value, frequency]) =>
            frequency === maxFrequency
        )
        .map(([value]) => value);

    const mode = maxFrequency === 1
        ? "No mode"
        : modes.join(", ");

    // Population Variance

    const variance = values.reduce(
        (total, v) => total + (v - mean) ** 2,
        0
    ) / n;

    // Standard Deviation

    const sd = Math.sqrt(variance);

    // Sorted Data Table

    const rows = sorted.map((v, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${v}</td>
        </tr>
    `).join("");

    const details = `

        <p><b>Number of observations (n):</b> ${n}</p>

        <p><b>Sum of values (Σx):</b> ${sum}</p>

        <p><b>Mean:</b> Σx / n = ${sum} / ${n}</p>

        <p><b>Median:</b> Middle value of sorted data</p>

        <p><b>Mode:</b> Value with the highest frequency</p>

        <p><b>Population Variance:</b> ${variance.toFixed(4)}</p>

        <p><b>Standard Deviation:</b> √Variance</p>

        <h3>Sorted Data Table</h3>

        <table>

            <tr>
                <th>Position</th>
                <th>Value</th>
            </tr>

            ${rows}

        </table>

    `;

    showResults(mean, median, mode, sd, details);

}


// ==================================
// GROUPED DATA CALCULATION
// ==================================

function calculateGrouped() {

    const rows = [...groupedBody.rows];

    const classes = rows.map((row, index) => {

        const lowerText = row.querySelector(".lower").value.trim();
        const upperText = row.querySelector(".upper").value.trim();
        const frequencyText = row.querySelector(".frequency").value.trim();

        if (lowerText === "" || upperText === "" || frequencyText === "") {
            throw new Error(`Please fill all fields in row ${index + 1}.`);
        }

        const lower = Number(lowerText);
        const upper = Number(upperText);
        const f = Number(frequencyText);

        if (
            !Number.isFinite(lower) ||
            !Number.isFinite(upper) ||
            !Number.isFinite(f) ||
            upper <= lower ||
            f < 0 ||
            !Number.isInteger(f)
        ) {
            throw new Error(`Invalid data in row ${index + 1}.`);
        }

        return {
            lower,
            upper,
            f,
            mid: (lower + upper) / 2
        };

    });

    if (classes.length === 0) {
        throw new Error("Please enter grouped data.");
    }

    classes.sort((a, b) => a.lower - b.lower);

    // Check overlapping intervals

    for (let i = 1; i < classes.length; i++) {

        if (classes[i].lower < classes[i - 1].upper) {
            throw new Error("Class intervals must not overlap.");
        }

    }

    // Total Frequency

    const N = classes.reduce((s, c) => s + c.f, 0);

    if (N === 0) {
        throw new Error("Total frequency must be greater than zero.");
    }

    // Mean

    const sumFx = classes.reduce(
        (s, c) => s + c.f * c.mid,
        0
    );

    const mean = sumFx / N;

    // Variance

    const variance = classes.reduce(
        (s, c) => s + c.f * (c.mid - mean) ** 2,
        0
    ) / N;

    // Standard Deviation

    const sd = Math.sqrt(variance);

    // Median

    let cumulative = 0;
    let median = null;
    let medianClass = null;

    for (const c of classes) {

        const previous = cumulative;

        cumulative += c.f;

        if (
            median === null &&
            c.f > 0 &&
            cumulative >= N / 2
        ) {

            medianClass = {
                ...c,
                previous
            };

            median = c.lower +
                ((N / 2 - previous) / c.f) *
                (c.upper - c.lower);

        }

    }

    // Mode

    let mode = "Not defined";

    const modalIndex = classes.reduce(
        (best, c, i, arr) =>
            c.f > arr[best].f ? i : best,
        0
    );

    const modal = classes[modalIndex];

    if (modal.f > 0) {

        const previousF =
            modalIndex > 0
                ? classes[modalIndex - 1].f
                : 0;

        const nextF =
            modalIndex < classes.length - 1
                ? classes[modalIndex + 1].f
                : 0;

        const d1 = modal.f - previousF;
        const d2 = modal.f - nextF;

        const width = modal.upper - modal.lower;

        if (d1 + d2 !== 0) {

            mode = (
                modal.lower +
                (d1 / (d1 + d2)) * width
            ).toFixed(2);

        }

    }

    // Cumulative Frequency and Table

    let cf = 0;

    const tableRows = classes.map(c => {

        cf += c.f;

        return `
            <tr>
                <td>${c.lower} – ${c.upper}</td>
                <td>${c.f}</td>
                <td>${c.mid.toFixed(2)}</td>
                <td>${(c.f * c.mid).toFixed(2)}</td>
                <td>${cf}</td>
            </tr>
        `;

    }).join("");

    const details = `

        <p><b>Total Frequency (N):</b> ${N}</p>

        <p><b>Σfx:</b> ${sumFx.toFixed(2)}</p>

        <p><b>Mean:</b> Σfx / N =
            ${sumFx.toFixed(2)} / ${N}
        </p>

        <p><b>Median Formula:</b>
            L + [(N/2 - cf) / f] × h
        </p>

        <p><b>Median Class:</b>
            ${medianClass.lower} – ${medianClass.upper}
        </p>

        <p><b>Median:</b> ${median.toFixed(2)}</p>

        <p><b>Mode Formula:</b>
            L + [(f₁ - f₀) / (2f₁ - f₀ - f₂)] × h
        </p>

        <p><b>Population Variance:</b>
            ${variance.toFixed(4)}
        </p>

        <h3>Frequency Distribution Table</h3>

        <table>

            <tr>
                <th>Class Interval</th>
                <th>Frequency (f)</th>
                <th>Midpoint (x)</th>
                <th>fx</th>
                <th>Cumulative Frequency</th>
            </tr>

            ${tableRows}

        </table>

        <p>
            <i>
                Note: Grouped-data statistical measures
                are estimates based on class midpoints.
            </i>
        </p>

    `;
  

    showResults(mean, median, mode, sd, details);
      /* ==================================
   RESEARCH PAPER PDF FUNCTIONALITY
================================== */

document.addEventListener("DOMContentLoaded", function () {

    const pdfLinks = document.querySelectorAll(
        ".paper-btn"
    );

    pdfLinks.forEach(function (link) {

        link.addEventListener("click", function () {

            console.log(
                "Research Paper PDF link clicked."
            );

        });

    });

});

}
