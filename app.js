let players = [];

async function init() {

    const response =
        await fetch("../output/players.json");

    const data =
        await response.json();

    players = data.players;

    buildPlayerList();

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

    select.addEventListener(
        "change",
        e => {

            const player =
                players.find(
                    p => p.id == e.target.value
                );

            renderPlayer(player);
        }
    );
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

                <h2>${player.name}</h2>

                <p>
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