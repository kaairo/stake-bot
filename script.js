let loadMoreClicked = false;
let lowRiskBets = 0;
let midRiskBets = 0;
let highRiskBets = 0;
let statsBadge;

let statusTimer;

function drawBadge() {
    const navbarSections = document.querySelectorAll('section.navigation-overrides');

    navbarSections.forEach(section => {
        const firstDiv = section.querySelector('div');

        if (firstDiv && !firstDiv.classList.contains('badge-applied')) {
            firstDiv.innerHTML += `<div class="badge variant-live size-sm text-size-sm is-inline svelte-1nsqxew" id="bot_stats_badge">Stake Bot Loaded</div>`;
            firstDiv.classList.add('badge-applied');

            clearInterval(statusTimer);
            statusTimer = setInterval(() => {
                statsBadge = document.getElementById("bot_stats_badge");
                statsBadge.innerHTML = `Stake Bot Loaded<br>HR: ${highRiskBets} MR: ${midRiskBets} LR: ${lowRiskBets}`;
            }, 1000);
        }
    });
}

function mutationUpdate() {
    drawBadge();

    if (window.location.href.includes('sports/upcoming/soccer')) {

        if (!loadMoreClicked) {
            const button = document.querySelector('button.button.variant-subtle-link.size-md.align-left.full-width.svelte-kd6t90');
            if (button) {
                loadMoreClicked = true;

                for (let i = 0; i < 20; i++) {
                    setTimeout(() => {
                        button.click();
                        console.log('Clicked "Load More".');
                    }, i * 2000);
                }
            }
        }

        const games = document.querySelectorAll('div.fixture-preview.svelte-h7s0dv');

        games.forEach(game => {
            if (!game.classList.contains('game-processed')) {
                let team1;
                let team2;

                let teamsElements = game.querySelectorAll('button.outcome.svelte-n71lms');

                teamsElements.forEach(team => {
                    let teamName = 'Sin nombre';
                    let teamQuota = 0.0;

                    if (team.ariaLabel != 'empate') {
                        teamName = team.ariaLabel;

                        let quotaContainer = team.querySelector('[data-test="fixture-odds"]');
                        if (quotaContainer) {
                            let quotaElement = quotaContainer.querySelector('.weight-bold.line-height-default.align-left.size-default.text-size-default.variant-action.with-icon-space.svelte-17v69ua');
                            teamQuota = parseFloat(quotaElement.innerHTML.replace(',', '.'));
                        }
                    }

                    if (team1 == undefined) {
                        team1 = [teamName, teamQuota, team];
                    }
                    else {
                        team2 = [teamName, teamQuota, team];
                    }
                });

                let favorite_odds = Math.min(team1[1], team2[1]);
                if (favorite_odds <= 1.70) {
                    let quotaDiff = Math.abs(team1[1] - team2[1]);

                    let riskLevel = "LOW RISK";
                    let quotaColor = '#3FC93D';
                    if (quotaDiff < 1.0) {
                        riskLevel = "HIGH RISK";
                        quotaColor = '#C93D3D';
                        highRiskBets++;
                    }
                    else if (quotaDiff < 3.0) {
                        riskLevel = "MID RISK";
                        quotaColor = '#DFC92C';
                        midRiskBets++;
                    }
                    else {
                        lowRiskBets++;
                    }

                    game.style.border = `1px solid ${quotaColor}`;

                    let timeElement = game.querySelector('[class="time svelte-1k0nl59"]');
                    if (!timeElement) {
                        timeElement = game.querySelector('[class="fixture-details svelte-19qis73"]');
                    }

                    if (timeElement && timeElement.innerHTML) {
                        timeElement.innerHTML += ` - <span style="color: ${quotaColor}">Quota diff: ${(quotaDiff).toFixed(2)} [<b>${riskLevel}</b>]</span>`;
                    }

                    let nameElement;
                    if (team1[1] < team2[1]) {
                        nameElement = team1[2].querySelector('[class="name svelte-n71lms"]');

                    }
                    else {
                        nameElement = team2[2].querySelector('[class="name svelte-n71lms"]')
                    }

                    if (nameElement) {
                        nameElement.innerHTML = '✨ ' + nameElement.innerHTML;
                    }

                    console.log(`[PARTIDO] ${team1} | ${team2}`);
                }
                else {
                    game.style.opacity = '0.2';
                }

                game.classList.add('game-processed');
            }
        });
    }
}

const mutationObserver = new MutationObserver(mutationUpdate);

mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
});

mutationUpdate();