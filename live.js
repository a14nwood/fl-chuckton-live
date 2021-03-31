const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const notesReversed = [...notes].reverse();

const noteNamesToNumbers = {};
for (let i = 0; i < 12; ++i) {
    for (let j = 0; j < 10; ++j) {
        noteNamesToNumbers[notes[i] + j] = 12 * j + i;
    }
}

const playedNotes = {
    'sequence-synth0': new Array(32),
    'sequence-synth1': new Array(32),
    'sequence-synth2': new Array(32),
    'sequence-synth3': new Array(32)
};
playedNotes['sequence-synth0'].fill(-1);
playedNotes['sequence-synth1'].fill(-1);
playedNotes['sequence-synth2'].fill(-1);
playedNotes['sequence-synth3'].fill(-1);

const defaultTab = document.getElementById('default-tab');
defaultTab.click();

const sequenceIdToBaseOctave = {
    'sequence-synth0': 4,
    'sequence-synth1': 4,
    'sequence-synth2': 4,
    'sequence-synth3': 4
};
initSequence('sequence-synth0');
initSequence('sequence-synth1');
initSequence('sequence-synth2');
initSequence('sequence-synth3');

function changeTab(ev, tabId) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(element => element.style.display = 'none');

    const links = document.querySelectorAll('.tab-link');
    links.forEach(element => element.classList.remove('tab-link-active'));

    const content = document.querySelector('#' + tabId);
    content.style.display = 'block';
    const link = ev.currentTarget;
    link.classList.add('tab-link-active');
}

function initSequence(sequenceId) {
    const sequence = document.querySelector('#' + sequenceId);
    const oldTable = sequence.querySelector('.sequence-table');
    if (oldTable) sequence.removeChild(oldTable);
    const table = document.createElement('table');
    table.className = 'sequence-table';
    for (let i = 0; i < 24; ++i) {
        const row = document.createElement('tr');
        row.className = 'sequence-table-row';
        const noteLabel = document.createElement('td');
        noteLabel.className = 'sequence-note-label';
        noteLabel.textContent = (
            notesReversed[i % 12]
            + (
                i < 12
                    ? sequenceIdToBaseOctave[sequenceId] + 1
                    : sequenceIdToBaseOctave[sequenceId]
            )
        );
        row.appendChild(noteLabel);
        for (let j = 0; j < 32; ++j) {
            const cell = document.createElement('td');
            cell.className = 'sequence-table-cell';
            cell.id = `sequence-table-cell-${i}-${j}`;
            cell.onclick = ev => toggleCell(ev, sequenceId, i, j);
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    sequence.appendChild(table);
}

function octaveUp(sequenceId) {
    if (sequenceIdToBaseOctave[sequenceId] === 8) {
        return;
    }

    sequenceIdToBaseOctave[sequenceId] += 1;
    const sequence = document.querySelector('#' + sequenceId);
    const noteLabels = sequence.querySelectorAll('.sequence-note-label');
    for (let i = 0; i < 24; ++i) {
        noteLabels[i].textContent = (
            notesReversed[i % 12]
            + (
                i < 12
                    ? sequenceIdToBaseOctave[sequenceId] + 1
                    : sequenceIdToBaseOctave[sequenceId]
            )
        );
    }

    for (let i = 0; i < 32; ++i) {
        if (playedNotes[sequenceId][i] === -1) continue;
        playedNotes[sequenceId][i] += 12;
    }

    updateChuck();
}

function octaveDown(sequenceId) {
    if (sequenceIdToBaseOctave[sequenceId] === 0) {
        return;
    }

    sequenceIdToBaseOctave[sequenceId] -= 1;
    const sequence = document.querySelector('#' + sequenceId);
    const noteLabels = sequence.querySelectorAll('.sequence-note-label');
    for (let i = 0; i < 24; ++i) {
        noteLabels[i].textContent = (
            notesReversed[i % 12]
            + (
                i < 12
                    ? sequenceIdToBaseOctave[sequenceId] + 1
                    : sequenceIdToBaseOctave[sequenceId]
            )
        );
    }

    for (let i = 0; i < 32; ++i) {
        if (playedNotes[sequenceId][i] === -1) continue;
        playedNotes[sequenceId][i] -= 12;
    }

    updateChuck();
}

function toggleCell(ev, sequenceId, i, j) {
    ev.currentTarget.classList.toggle('sequence-table-cell-active');
    if (playedNotes[sequenceId][j] === -1) {
        if (i < 12) {
            playedNotes[sequenceId][j] = (
                noteNamesToNumbers[notesReversed[i % 12]
                + (sequenceIdToBaseOctave[sequenceId] + 1)]
            );
        } else {
            playedNotes[sequenceId][j] = (
                noteNamesToNumbers[notesReversed[i % 12]
                + sequenceIdToBaseOctave[sequenceId]]
            );
        }
    } else {
        playedNotes[sequenceId][j] = -1;
    }

    updateChuck();
}

let currStep = 0;
for (let i = 0; i < 24; ++i) {
    const cell = document.querySelector(`#sequence-table-cell-${i}-${0}`);
    cell.classList.add('sequence-table-cell-highlighted');
}
function sequencerStep() {
    const prevStep = currStep;
    currStep += 1;
    if (currStep === 32) currStep = 0;

    for (let i = 0; i < 24; ++i) {
        const prevCells = document.querySelectorAll(
            `#sequence-table-cell-${i}-${prevStep}`
        );
        for (const prevCell of prevCells) {
            prevCell.classList.remove('sequence-table-cell-highlighted');
        }
        const currCells = document.querySelectorAll(
            `#sequence-table-cell-${i}-${currStep}`
        );
        for (const currCell of currCells) {
            currCell.classList.add('sequence-table-cell-highlighted');
        }
    }
}

async function updateChuck() {
    for (const i of [0, 1, 2, 3]) {
        const volume = document.querySelector(`#synth${i}-volume`).value;
        const oscillator = document.querySelector(
            `input[name='synth${i}-waveform']:checked`
        ).value;
        const attack = document.querySelector(`#synth${i}-attack`).value;
        const decay = document.querySelector(`#synth${i}-decay`).value;
        const sustain = document.querySelector(`#synth${i}-sustain`).value;
        const release = document.querySelector(`#synth${i}-release`).value;
        const filter = document.querySelector(
            `input[name='synth${i}-filter']:checked`
        ).value;
        const filterFreq = document.querySelector(`#synth${i}-filter-freq`).value;
        const filterQ = document.querySelector(`#synth${i}-filter-q`).value;
        const echoDelay = document.querySelector(`#synth${i}-echo-delay`).value;
        const echoMax = document.querySelector(`#synth${i}-echo-max`).value;
        const echoMix = document.querySelector(`#synth${i}-echo-mix`).value;
        const reverb = document.querySelector(
            `input[name='synth${i}-reverb']:checked`
        ).value;
        const reverbMix = document.querySelector(`#synth${i}-reverb-mix`).value;

        await theChuck.setFloatArrayValue('volume', i, volume);
        await theChuck.setIntArrayValue('osc', i, oscillator);
        await theChuck.setFloatArrayValue('attack', i, attack);
        await theChuck.setFloatArrayValue('decay', i, decay);
        await theChuck.setFloatArrayValue('sustain', i, sustain);
        await theChuck.setFloatArrayValue('release', i, release);
        await theChuck.setIntArrayValue('filter', i, filter);
        await theChuck.setFloatArrayValue('filterFreq', i, filterFreq);
        await theChuck.setFloatArrayValue('filterQ', i, filterQ);
        await theChuck.setFloatArrayValue('echoDelay', i, echoDelay);
        await theChuck.setFloatArrayValue('echoMax', i, echoMax);
        await theChuck.setFloatArrayValue('echoMix', i, echoMix);
        await theChuck.setIntArrayValue('reverb', i, reverb);
        await theChuck.setFloatArrayValue('reverbMix', i, reverbMix);

        for (let j = 0; j < 32; ++j) {
            await theChuck.setIntArrayValue(
                `playedNotes${i}`, j, playedNotes[`sequence-synth${i}`][j]
            );
        }
    }
}