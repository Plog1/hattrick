let players = [];

const HISTORY_METRICS = [
    { key: "tsi", label: "TSI", read: snapshot => snapshot.current.tsi },
    {
        key: "age",
        label: "Alder (år)",
        read: snapshot => {
            const years = Number(snapshot.current.age);
            const days = Number(snapshot.current.days);
            return Number.isFinite(years) && Number.isFinite(days)
                ? years + days / 112
                : null;
        }
    },
    { key: "salary", label: "Lønn", read: snapshot => snapshot.current.salary },
    {
        key: "weeksInClub",
        label: "Uker i klubben",
        read: snapshot => snapshot.current.weeksInClub
    },
    { key: "form", label: "Form", read: snapshot => snapshot.current.form },
    {
        key: "stamina",
        label: "Kondisjon",
        read: snapshot => snapshot.current.stamina
    },
    {
        key: "experience",
        label: "Rutine",
        read: snapshot => snapshot.current.experience
    },
    {
        key: "leadership",
        label: "Lederevne",
        read: snapshot => snapshot.current.leadership
    },
    {
        key: "loyalty",
        label: "Lojalitet",
        read: snapshot => snapshot.current.loyalty
    },
    { key: "keeper", label: "Målvakt", read: snapshot => snapshot.skills.keeper },
    {
        key: "defending",
        label: "Forsvar",
        read: snapshot => snapshot.skills.defending
    },
    {
        key: "playmaking",
        label: "Ballfordeling",
        read: snapshot => snapshot.skills.playmaking
    },
    { key: "winger", label: "Ving", read: snapshot => snapshot.skills.winger },
    {
        key: "passing",
        label: "Pasninger",
        read: snapshot => snapshot.skills.passing
    },
    {
        key: "scoring",
        label: "Målskåring",
        read: snapshot => snapshot.skills.scoring
    },
    {
        key: "setPieces",
        label: "Dødball",
        read: snapshot => snapshot.skills.setPieces
    },
    {
        key: "matchRating",
        label: "Forrige kamprating",
        read: snapshot => snapshot.lastMatch.rating
    }
];

const NUMBER_FORMAT = new Intl.NumberFormat("no-NO", {
    maximumFractionDigits: 2
});

async function init() {

    const response =
        await fetch("../output/players.json");

    if (!response.ok) {
        throw new Error("Kunne ikke lese players.json.");
    }

    const data =
        await response.json();

    players = data.players;

    if (!players.length) {
        document.getElementById("playerCard").textContent =
            "Ingen spillere funnet i players.json.";
        return;
    }

    buildPlayerList();
    buildMetricSelect();

    renderPlayer(players[0]);
}

function buildPlayerList() {

    const select =
        document.getElementById(
            "playerSelect"
        );

    players.forEach(player => {

        const option =
            document.createElement("option");

        option.value =
            player.id;

        option.textContent =
            player.name;

        select.appendChild(option);
    });

    select.value = String(players[0].id);

    select.addEventListener(
        "change",
        e => {

            const player =
                players.find(
                    p => String(p.id) === e.target.value
                );

            renderPlayer(player);
        }
    );
}

function buildMetricSelect() {

    const select =
        document.getElementById("historyMetric");

    HISTORY_METRICS.forEach(metric => {

        const option =
            document.createElement("option");

        option.value = metric.key;
        option.textContent = metric.label;
        select.appendChild(option);
    });

    select.addEventListener(
        "change",
        () => renderHistory(getSelectedPlayer())
    );
}

function getSelectedPlayer() {

    const playerId =
        document.getElementById("playerSelect").value;

    return players.find(
        player => String(player.id) === playerId
    );
}

function formatMetricValue(metric, value) {

    if (metric.key === "age") {
        return `${value.toFixed(2)} år`;
    }

    return NUMBER_FORMAT.format(value);
}

function shortDate(value, snapshot) {

    if (!value) {
        return `Uke ${snapshot.week}`;
    }

    const [year, month, day] = value.split("-");
    return `${day}.${month}.`;
}

function renderHistory(player) {

    const chart =
        document.getElementById("historyChart");
    const summary =
        document.getElementById("historySummary");

    if (!player) {
        chart.textContent = "";
        summary.textContent = "";
        return;
    }

    const metric = HISTORY_METRICS.find(
        item => item.key === document.getElementById("historyMetric").value
    );
    const points = player.development
        .map(snapshot => ({
            snapshot,
            value: metric.read(snapshot)
        }))
        .filter(point => point.value !== null && point.value !== undefined)
        .map(point => ({
            ...point,
            value: Number(point.value)
        }))
        .filter(point => Number.isFinite(point.value));

    if (!points.length) {
        summary.textContent = "Ingen historikk for denne parameteren.";
        chart.innerHTML = "<p class=\"chart-empty\">Ingen målinger å vise.</p>";
        return;
    }

    const width = 800;
    const height = 280;
    const padding = { top: 18, right: 24, bottom: 42, left: 82 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const values = points.map(point => point.value);
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);
    const spread = maximum - minimum;
    const rangePadding = spread === 0
        ? Math.max(Math.abs(maximum) * 0.05, 0.5)
        : spread * 0.12;
    const lowerBound = minimum - rangePadding;
    const upperBound = maximum + rangePadding;
    const x = index => padding.left +
        index / Math.max(points.length - 1, 1) * plotWidth;
    const y = value => padding.top +
        (upperBound - value) / (upperBound - lowerBound) * plotHeight;
    const coordinates = points.map((point, index) => ({
        ...point,
        x: x(index),
        y: y(point.value)
    }));
    const path = coordinates.map((point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
    ).join(" ");
    const grid = Array.from({ length: 5 }, (_, index) => {
        const value = upperBound -
            index / 4 * (upperBound - lowerBound);
        const position = y(value);
        return `
            <line class="chart-grid" x1="${padding.left}" y1="${position}"
                x2="${width - padding.right}" y2="${position}"></line>
            <text class="chart-label chart-y-label" x="${padding.left - 12}"
                y="${position + 4}" text-anchor="end">${formatMetricValue(metric, value)}</text>
        `;
    }).join("");
    const dateLabels = coordinates
        .filter((_, index) => points.length <= 5 ||
            index === 0 || index === points.length - 1 || index % 2 === 0)
        .map(point => `
            <text class="chart-label chart-x-label" x="${point.x}"
                y="${height - 12}" text-anchor="middle">${shortDate(point.snapshot.snapshotDate, point.snapshot)}</text>
        `)
        .join("");
    const markers = coordinates.map(point => `
        <circle class="chart-point" cx="${point.x}" cy="${point.y}" r="5">
            <title>${shortDate(point.snapshot.snapshotDate, point.snapshot)}: ${formatMetricValue(metric, point.value)}</title>
        </circle>
    `).join("");
    const change = points[points.length - 1].value - points[0].value;
    const changeText = change > 0
        ? `+${formatMetricValue(metric, change)}`
        : formatMetricValue(metric, change);

    summary.textContent = `${points.length} målinger · ${formatMetricValue(metric, points[0].value)} → ${formatMetricValue(metric, points[points.length - 1].value)} (${changeText})`;
    chart.innerHTML = `
        <svg class="trend-chart" viewBox="0 0 ${width} ${height}"
            role="img" aria-label="${metric.label} over tid">
            ${grid}
            <path class="chart-line" d="${path}"></path>
            ${markers}
            ${dateLabels}
        </svg>
    `;
}

function skillRow(
    title,
    value
){

    return `

    <div class="skill">

        <div>${title}</div>

        <div class="bar">
            <div
                class="fill"
                style="width:${value*5}%"
            ></div>
        </div>

        <div>${value}</div>

    </div>
    `;
}

function renderPlayer(
    player
){

    const card =
        document.getElementById(
            "playerCard"
        );

    card.innerHTML = `

    <div class="card">

        <div class="top">

            <div>


            renderHistory(player);
                <h2>${player.name}</h2>

        init().catch(error => {
            document.getElementById("playerCard").textContent =
                "Kunne ikke laste spillerdata. Kjør scripts/sync.py først.";
            console.error(error);
        });
                  ${player.current.age} år ·
                  ${player.current.days} dager
                </p>

            </div>

            <div class="position">
                ${player.current.position}
            </div>

        </div>

        <div class="metrics">

            <div class="metric">
                <div class="metric-value">
                    ${player.current.tsi}
                </div>
                <div>TSI</div>
            </div>

            <div class="metric">
                <div class="metric-value">
                    ${player.current.salary}
                </div>
                <div>Lønn</div>
            </div>

            <div class="metric">
                <div class="metric-value">
                    ${player.current.weeksInClub}
                </div>
                <div>Uker i klubb</div>
            </div>

        </div>

        <div class="sections">

            <div>

                <h3>Spillerprofil</h3>

                <div class="info-row">
                <span>Form</span>
                <span>${player.current.form}</span>
                </div>

                <div class="info-row">
                <span>Kondisjon</span>
                <span>${player.current.stamina}</span>
                </div>

                <div class="info-row">
                <span>Rutine</span>
                <span>${player.current.experience}</span>
                </div>

                <div class="info-row">
                <span>Lojalitet</span>
                <span>${player.current.loyalty}</span>
                </div>

            </div>

            <div>

                <h3>Ferdigheter</h3>

                ${skillRow(
                    "Målvakt",
                    player.skills.keeper
                )}

                ${skillRow(
                    "Forsvar",
                    player.skills.defending
                )}

                ${skillRow(
                    "Ballford.",
                    player.skills.playmaking
                )}

                ${skillRow(
                    "Ving",
                    player.skills.winger
                )}

                ${skillRow(
                    "Pasninger",
                    player.skills.passing
                )}

                ${skillRow(
                    "Målskåring",
                    player.skills.scoring
                )}

                ${skillRow(
                    "Dødball",
                    player.skills.setPieces
                )}

            </div>

        </div>

    </div>
    `;
}

init();git 