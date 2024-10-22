const grades = ['mythic', 'legendary', 'epic', 'rare', 'common'];

const orbsTypes = [
    'orbs_great1',
    'orbs_great10',
    'orbs_epic1',
    'orbs_epic10',
    'orbs_epic_draft',
    'orbs_mythic1',
    'orbs_mythic3',
    'orbs_mythic6',
    'orbs_event4',
    'orbs_equip1',
    'orbs_equip2'
];


const itemsConfig = {
    xp: [{
        id: '52', value: 40, grade: 'common'
    }, {
        id: '47', value: 100, grade: 'rare'
    }, {
        id: '50', value: 120, grade: 'rare'
    }, {
        id: '53', value: 140, grade: 'rare'
    }, {
        id: '18', value: 180, grade: 'epic'
    }, {
        id: '48', value: 200, grade: 'epic'
    }, {
        id: '51', value: 250, grade: 'epic'
    }, {
        id: '54', value: 500, grade: 'epic'
    }, {
        id: '320', value: 1000, grade: 'legendary'
    }, {
        id: '321', value: 1500, grade: 'legendary'
    }, {
        id: '322', value: 2000, grade: 'legendary'
    }, {
        id: '323', value: 2500, grade: 'legendary'
    }],
    gifts: [{
        id: '22', value: 15, grade: 'common'
    }, {
        id: '25', value: 25, grade: 'common'
    }, {
        id: '14', value: 40, grade: 'rare'
    }, {
        id: '20', value: 60, grade: 'rare'
    }, {
        id: '23', value: 80, grade: 'rare'
    }, {
        id: '26', value: 100, grade: 'rare'
    }, {
        id: '15', value: 130, grade: 'epic'
    }, {
        id: '21', value: 250, grade: 'epic'
    }, {
        id: '24', value: 370, grade: 'epic'
    }, {
        id: '27', value: 490, grade: 'epic'
    }, {
        id: '181', value: 700, grade: 'legendary'
    }, {
        id: '182', value: 950, grade: 'legendary'
    }, {
        id: '183', value: 1200, grade: 'legendary'
    }, {
        id: '184', value: 1500, grade: 'legendary'
    }, {
        id: '624', value: 5000, grade: 'mythic'
    }]
};

const contestObjectivesTypeMapping = {
    'spend energy': 'energy',
    'defeat villains': 'villains',
    'defeat players in pvp (seasons &amp; leagues)': 'pvp',
    'play great pachinko 1 game': 'orbs_great1',
    'play great pachinko 10 games': 'orbs_great10',
    'play epic pachinko 1 game': 'orbs_epic1',
    'play epic pachinko 10 games': 'orbs_epic10',
    'play epic pachinko draft': 'orbs_epic_draft',
    'play mythic pachinko 1 game': 'orbs_mythic1',
    'play mythic pachinko 3 games': 'orbs_mythic3',
    'play mythic pachinko 6 games': 'orbs_mythic6',
    'play equipment pachinko 1 game': 'orbs_equip1',
    'play equipment pachinko 2 games': 'orbs_equip2',
    'play equipment pachinko 10 games': 'orbs_equip10',
    'use pachinko orbs': 'pachinko'
};

function createPachinkoObjectiveConfig(multiplier, orbsKey) {
    return {
        multiplier,
        getAvailable(resources) {
            return resources.orbs[orbsKey];
        }
    };
}

const contestObjectives = {
    energy: {
        multiplier: 50,
        getAvailable(resources) {
            return resources.energies.quest.amount;
        }
    },
    villains: {
        multiplier: 200,
        getAvailable(resources) {
            return resources.energies.fight.amount;
        }
    },
    pvp: {
        multiplier: 150,
        getAvailable(resources) {
            return resources.energies.kiss.amount;
        }
    },
    pachinko: {
        multiplier: 3000,
        getAvailable(resources) {
            const enabledOrbsTypes = HHPlusPlus.Helpers.lsGet('HHKrtek_Contests_PachinkoFilter');
            return orbsTypes
                .filter((orbType) => enabledOrbsTypes[orbType])
                .map((orbType) => resources.orbs[orbType])
                .reduce((sum, count) => sum += count)
        }
    },
    orbs_great1: createPachinkoObjectiveConfig(500, 'orbs_great1'),
    orbs_great10: createPachinkoObjectiveConfig(8000, 'orbs_great10'),
    orbs_epic1: createPachinkoObjectiveConfig(9720, 'orbs_epic1'),
    orbs_epic10: createPachinkoObjectiveConfig(97200, 'orbs_epic10'),
    orbs_epic_draft: createPachinkoObjectiveConfig(108000, 'orbs_epic_draft'),
    orbs_mythic1: createPachinkoObjectiveConfig(2700, 'orbs_mythic1'),
    orbs_mythic3: createPachinkoObjectiveConfig(15200, 'orbs_mythic3'),
    orbs_mythic6: createPachinkoObjectiveConfig(35700, 'orbs_mythic6'),
    orbs_event4: createPachinkoObjectiveConfig(0, 'orbs_event4'),
    orbs_equip1: createPachinkoObjectiveConfig(1500, 'orbs_equip1'),
    orbs_equip2: createPachinkoObjectiveConfig(1620, 'orbs_equip2'),
    orbs_equip10: createPachinkoObjectiveConfig(8100, 'orbs_equip10')
};

const hhAjax = window.shared.general.hh_ajax;

const ajaxCalls = {
    getResources: {action: 'hero_get_resources'}
};

function getValueByItemId(id) {
    for (const itemCategory in itemsConfig) {
        const item = itemsConfig[itemCategory].find((item) => item.id === id);
        if (item) {
            return item.value;
        }
    }

    return null;
}

async function waitForSelector(selector) {
    return new Promise((resolve) => {
        HHPlusPlus.Helpers.doWhenSelectorAvailable(selector, () => resolve(document.querySelector(selector)));
    });
}

const sheet = (() => {
    const style = document.createElement('style');
    style.setAttribute('class', 'krtek-script-style');
    document.head.appendChild(style);
    style.sheet.insertRules = (rules) => {
        rules.replace(/ {4}/g, '').split(/(?<=})\n/g).map(rule => rule.replace(/\n/g, '')).forEach(rule => {
            try {
                style.sheet.insertRule(rule);
            } catch {
                console.log(`Error adding style rules:\n${rule}`);
            }
        });
    };
    return style.sheet;
})();

class HHModule {
    constructor({group, configSchema}) {
        this.group = group;
        this.configSchema = configSchema;
        this.hasRun = false;
    }

    runWhenPopupIsAvailableAfterAjaxAction(action, selectors, callback) {
        HHPlusPlus.Helpers.defer(() => {
            HHPlusPlus.Helpers.onAjaxResponse(new RegExp(`${action}`), (response) => {
                const observer = new MutationObserver(() => {
                    if (!Array.isArray(selectors)) {
                        selectors = [selectors];
                    }
                    if (selectors.some((selector) => $(selector).length)) {
                        callback(response);

                        observer.disconnect();
                    }
                });

                observer.observe($('#common-popups')[0], {childList: true});
            });
        });
    }
}

class ExtendedInfo extends HHModule {
    constructor() {
        const baseKey = 'extendedInfo';
        const configSchema = {
            baseKey, default: true, label: `Extend some info`, subSettings: [{
                key: 'orbs', label: `Spendable orbs detailed count`, default: true
            }, {
                key: 'maxXp', label: 'Girl XP upgrade total count', default: true
            }, {
                key: 'maxGifts', label: 'Girl grade upgrade total count', default: true
            }]
        };
        super({name: baseKey, configSchema, group: 'krtek'});
    }

    shouldRun() {
        return true;
    }

    run({orbs, maxXp, maxGifts}) {
        if (!this.shouldRun() || this.hasRun) {
            return;
        }

        if (orbs) {
            this.runWhenPopupIsAvailableAfterAjaxAction('hero_get_resources', '#hero_resources_popup', (response) => this.tweakOrbsCount(response.orbs));
        }

        if (maxXp) {
            this.runWhenPopupIsAvailableAfterAjaxAction('action=(get_girl_max_out_items|get_girl_fill_items)&type=potion', ['#girl_max_out_popup', '#girl_max_out_all_levels_popup'], (response) => this.tweakMaxXpInfo(response));
        }

        if (maxGifts) {
            this.runWhenPopupIsAvailableAfterAjaxAction('action=(get_girl_max_out_items|get_girl_fill_items)&type=gift', ['#girl_max_out_popup', '#girl_max_out_all_levels_popup'], (response) => this.tweakMaxXpInfo(response));
        }

        this.hasRun = true;
    }

    /**
     * @param {{orbs_epic1: number, orbs_epic10: number, orbs_epic_draft: number, orbs_equip1: number, orbs_equip2: number, orbs_equip10: number, orbs_event4: number, orbs_great1: number, orbs_great10: number, orbs_mythic1: number, orbs_mythic3: number, orbs_mythic6: number}} orbs Orbs
     */
    tweakOrbsCount(orbs) {
        let totalOrbsLabel = document.querySelector('.total-orbs');
        totalOrbsLabel.innerHTML = totalOrbsLabel.innerHTML + ` (${orbs.orbs_great1} + ${orbs.orbs_great10} + ${orbs.orbs_mythic1} + ${orbs.orbs_epic1} = ${orbs.orbs_great1 + orbs.orbs_great10 + orbs.orbs_mythic1 + orbs.orbs_epic1})`;
    }

    /**
     * @param {{total_experience: number,target_level: number,selection: {}, excess: number, success: boolean}} response
     */
    tweakMaxXpInfo({selection}) {
        let totalCount = Object.keys(selection).reduce((accumulator, itemId) => accumulator + getValueByItemId(itemId) * selection[itemId], 0);
        let popupTitle = document.querySelector('#girl_max_out_popup .popup-explanation p') || document.querySelector('#girl_max_out_all_levels_popup .popup-explanation p');
        popupTitle.innerHTML = popupTitle.innerHTML + ` ${HHPlusPlus.I18n.nThousand(+totalCount)}`;
    }
}

class ChampionsExtendedInfo extends HHModule {
    static css = `
        .champion-total-power {
            display: inline-flex;
            margin-left: 40px;
            flex-direction: row;
            gap: 30px;
        }
    
        .champion-total-power .checked {
            color: #53af00;
        }
        
        .champion-total-power .unchecked {
            color: #b14;
        }
    `;

    constructor() {
        const baseKey = 'championsExtendedInfo';
        const configSchema = {
            baseKey, default: true, label: `Champions extended info`, subSettings: [{
                key: 'power', label: `Display checked and unchecked champions power`, default: true
            }]
        };
        super({name: baseKey, configSchema, group: 'krtek'});
    }

    shouldRun() {
        return ['champions', 'club-champion'].some(page => HHPlusPlus.Helpers.isCurrentPage(page));
    }

    run({power}) {
        if (this.hasRun || !this.shouldRun()) {
            return;
        }

        HHPlusPlus.Helpers.defer(async () => {
            if (power) {
                $(await waitForSelector('button.champions-bottom__draft-team')).click(this.tweakTotalPower.bind(this));
                sheet.insertRules(ChampionsExtendedInfo.css);
            }

            this.hasRun = true;
        });
    }

    async tweakTotalPower() {
        let totalPowerElements;
        let checkChangeObserver;

        function insertTotalPowerElements() {
            $(`<span class="champion-total-power"><span class="checked"></span><span class="unchecked"></span></span>`).appendTo('.champions-middle__team-draft');
            return {
                checkedPowerElement: document.querySelector('.champion-total-power .checked'),
                uncheckedPowerElement: document.querySelector('.champion-total-power .unchecked')
            };
        }

        async function calculateTotalPower() {
            const {team, hero_damage} = window.championData;

            const girlSelectionBox = await waitForSelector('.champions-middle__girl-selection');
            const totalPower = Array.from(girlSelectionBox.querySelectorAll('[id_girl]'))
                .map((node) => ({
                    selected: node.classList.contains('selected'),
                    id_girl: node.getAttribute('id_girl'),
                    multiplier: node.querySelector('.script-pose-match.green-tick-icon:not(.empty)') ? 2 : 1
                }))
                .reduce((accumulator, currentGirl) => {
                    const {damage} = team.find((girl) => girl.id_girl === currentGirl.id_girl);
                    if (currentGirl.selected) {
                        accumulator.checked += (damage + hero_damage) * currentGirl.multiplier;
                    } else {
                        accumulator.unchecked += (damage + hero_damage) * currentGirl.multiplier;
                    }

                    return accumulator;
                }, {checked: 0, unchecked: 0});

            totalPowerElements.checkedPowerElement.innerHTML = `${HHPlusPlus.I18n.nThousand(Math.round(totalPower.checked / 1000))}K`;
            totalPowerElements.uncheckedPowerElement.innerHTML = `${HHPlusPlus.I18n.nThousand(Math.round(totalPower.unchecked / 1000))}K`;
        }

        const init = async () => {
            await waitForSelector('.champions-middle__team-draft');
            totalPowerElements = insertTotalPowerElements();
            calculateTotalPower();

            checkChangeObserver = new MutationObserver(() => calculateTotalPower());
            checkChangeObserver.observe(document.querySelector('.champions-middle__team-draft'), {
                attributes: true,
                subtree: true
            });

            $(await waitForSelector('button.champions-bottom__confirm-team')).click(async () => {
                checkChangeObserver.disconnect();

                $(await waitForSelector('button.champions-bottom__draft-team')).click(this.tweakTotalPower.bind(this));
            });
        };

        async function reinitAfterDraft() {
            new MutationObserver(async (mutations, observer) => {
                checkChangeObserver.disconnect();
                init();
                observer.disconnect();
            }).observe(document.querySelector('#contains_all > section'), {
                childList: true
            });
        }

        init();

        HHPlusPlus.Helpers.onAjaxResponse(/action=team_draft/, () => reinitAfterDraft());
        HHPlusPlus.Helpers.onAjaxResponse(/action=champion_team_draft/, () => reinitAfterDraft());
    }
}

class ContestsExtendedInfo extends HHModule {
    static css = `
        .additional-info-wrapper {
            display: flex;
        }
        
        .additional-info {
            display: flex;
            gap: 10px;
            flex: 1 1 auto;
            justify-content: flex-end;
        }
        
        .best-possible-ranking {
            display: flex;
            justify-content: center;
            align-items: center;
            min-width: 20px;
            text-align: center;
            font-size: 10px;
            border-radius: 5px;
            text-shadow: 0 0 1px #000, 0 0 1px #000, 0 0 1px #000, 0 0 1px #000, 0 0 1px #000, 0 0 1px #000, 0 0 1px #000, 0 0 1px #000, 0 0 1px #000, 0 0 1px #000, 0 0 1px #000;
            -moz-transform: rotate(0.05deg);
        }
        
        .best-possible-ranking.mythic {
            background: transparent radial-gradient(closest-side at 50% 50%, #f5a866 0%, #ec0039 51%, #9e0e27 100%) 0% 0% no-repeat padding-box;
        }
    
        .best-possible-ranking.legendary {
            background: url('https://hentaiheroes.com/images/legendary.png');
            background-size: contain;
        }
    
        .best-possible-ranking.epic {
            background-color: #ffb244;
        }
    
        .best-possible-ranking.rare {
            background-color: #23b56b;
        }
    
        .best-possible-ranking.common {
            background-color: #8d8e9f;
        }
    
        .total-available-points {
            justify-content: end;
        }
        
        .contest_objectives .percentage {
            position: relative;
        }
        
        .contest_objectives .percentage::after {
            content: '';
            height: 3px;
            background: linear-gradient(to right, #770022 0%, #ee1155 100%);
            position: absolute;
            bottom: -3px;       
            border-radius: 3px;    
        }
    `;

    constructor() {
        const baseKey = 'contestsExtendedInfo';
        const configSchema = {
            baseKey, default: true, label: `Contests extended info`, subSettings: [{
                key: 'objectivePoints', label: `Display available points per objective`, default: true
            }, {
                key: 'totalPoints', label: 'Display minimal total possible points and possible ranking.'
            }, {
                key: 'percentage', label: 'Display percentage of objective to the total.'
            }]
        };
        super({name: baseKey, configSchema, group: 'krtek'});
    }

    shouldRun() {
        return HHPlusPlus.Helpers.isCurrentPage('activities');
    }

    run(config) {
        if (this.hasRun || !this.shouldRun()) {
            return;
        }

        sheet.insertRules(ContestsExtendedInfo.css);

        if (config.objectivePoints || config.totalPoints || config.percentage) {
            HHPlusPlus.Helpers.defer(() => {
                this.tweakObjectives(config);
            });
        }

        this.hasRun = true;
    }

    async tweakObjectives(config) {
        const resources = await hhAjax(ajaxCalls.getResources);
        const contests = await waitForSelector('#contests');
        const activeContests = Array.from(contests.querySelectorAll('.contest:has(.in_progress)'));

        activeContests.forEach((contest) => {
            const contestId = contest.getAttribute('id_contest');

            let totalAvailablePoints = 0;
            const objectives = Array.from(contest.querySelectorAll('.contest_objectives > div'));

            objectives.forEach((objective) => {
                const description = objective.querySelector('.obj_desc').innerHTML.toLowerCase();
                const objectiveType = contestObjectivesTypeMapping[description];

                if (objectiveType) {
                    const availablePoints = contestObjectives[objectiveType].getAvailable(resources) * contestObjectives[objectiveType].multiplier;
                    totalAvailablePoints += availablePoints;

                    config['objectivePoints'] && $(objective).append(availablePoints).attr('data-available', availablePoints);
                }
            });
            config['objectivePoints'] && $(contest.querySelector('.contest_objectives')).append(`<div class="total-available-points">${totalAvailablePoints}</div>`);

            if (config.percentage) {
                objectives.forEach((objective) => {
                    const availablePoints = Number.parseInt(objective.getAttribute('data-available'));
                    const percentage = availablePoints / totalAvailablePoints * 100;
                    const uuid = `u${Math.random().toString(16).slice(2)}`;
                    objective.classList.add('percentage', uuid);
                    sheet.insertRules(`
                        .contest_objectives .percentage.${uuid}::after {
                            width: ${percentage}%;
                        }
                    `);
                });
            }

            if (config.totalPoints) {
                const ranking = document.querySelector(`.ranking[id_contest='${contestId}']`);

                const currentPoints = Number.parseInt(ranking.querySelector('.lead_table_default td.cont_points_number span').innerHTML.replace(',', ''));
                const potentialPoints = currentPoints + totalAvailablePoints;

                const rankingDistribution = Array.from(contest.querySelectorAll('[data-reward-index]'))
                    .map((rankElement) => Number.parseInt(rankElement.getAttribute('data-reward-index')));

                const rankings = Array.from(ranking.querySelectorAll('.leadTable [rank] .cont_points_number span'))
                    .map((rank) => Number.parseInt(rank.innerHTML.replace(',', '')));

                const bestPossibleRanking = rankingDistribution.find((currentRank) => potentialPoints >= rankings[currentRank - 1]);
                const bestPossibleGrade = grades[rankingDistribution.findIndex((currentRank) => potentialPoints >= rankings[currentRank - 1])];

                let playersNameCell = ranking.querySelector(`.lead_table_default td:has(.country)`);
                playersNameCell = $(playersNameCell).wrapInner('<div class="additional-info-wrapper"></div>')[0].querySelector('.additional-info-wrapper');

                $(playersNameCell).append(`
                <span class="additional-info">
                    <span class="best-possible-ranking ${bestPossibleGrade}">${bestPossibleRanking}</span>
                    <span class="potential-points">${HHPlusPlus.I18n.nThousand(potentialPoints)}</span>
                </span>
                `);
            }
        });
    }
}

const allModules = [new ExtendedInfo(), new ChampionsExtendedInfo(), new ContestsExtendedInfo()];

setTimeout(() => {
    if (window.HHPlusPlus) {
        const runScript = () => {
            const {hhPlusPlusConfig} = window;

            hhPlusPlusConfig.registerGroup({
                key: 'krtek', name: 'Krtek\'s Tweaks'
            });

            allModules.forEach(module => {
                hhPlusPlusConfig.registerModule(module);
            });

            hhPlusPlusConfig.loadConfig();
            hhPlusPlusConfig.runModules();
            HHPlusPlus.Helpers.runDeferred();
        };

        if (window.hhPlusPlusConfig) {
            runScript();
        } else {
            $(document).on('hh++-bdsm:loaded', runScript);
        }
    } else if (!(['/integrations/', '/index.php'].some(path => path === location.pathname) && location.hostname.includes('nutaku'))) {
        console.log('WARNING: HH++ BDSM not found. Ending the script here');
    }
}, 1);
