global Event startPlayback;
false => global int stopPlayback;
global Event step;

global float volume[4];
global int osc[4];
global float attack[4];
global float decay[4];
global float sustain[4];
global float release[4];
global int filter[4];
global float filterFreq[4];
global float filterQ[4];
global float echoDelay[4];
global float echoMax[4];
global float echoMix[4];
global int reverb[4];
global float reverbMix[4];

120 => float bpm;
.25 * (60 / bpm)::second => dur sixteenth;

// Note position in time -> note number
global int playedNotes0[32];
global int playedNotes1[32];
global int playedNotes2[32];
global int playedNotes3[32];
for (0 => int i; i < 32; ++i) {
    -1 => playedNotes0[i];
    -1 => playedNotes1[i];
    -1 => playedNotes2[i];
    -1 => playedNotes3[i];
}

fun void playNote(int playedNotes[], int idx, int idx2) {
    if (playedNotes[idx2] == -1) return;

    ADSR env;
    (attack[idx]::ms, decay[idx]::ms, sustain[idx], release[idx]::ms)
        => env.set;
    if (osc[idx] == 0) {
        SinOsc osc => env;
        playedNotes[idx2] => Std.mtof => osc.freq;
    } else if (osc[idx] == 1) {
        TriOsc osc => env;
        playedNotes[idx2] => Std.mtof => osc.freq;
    } else if (osc[idx] == 2) {
        SqrOsc osc => env;
        playedNotes[idx2] => Std.mtof => osc.freq;
    } else if (osc[idx] == 3) {
        SawOsc osc => env;
        playedNotes[idx2] => Std.mtof => osc.freq;
    } else if (osc[idx] == 4) {
        Noise osc => env;
    }
    Echo ech;
    echoDelay[idx]::ms => ech.delay;
    echoMax[idx]::ms => ech.max;
    echoMix[idx] => ech.mix;
    if (filter[idx] == 0) {
        env => LPF flt => ech;
        filterFreq[idx] => flt.freq;
        filterQ[idx] => flt.Q;
    } else if (filter[idx] == 1) {
        env => HPF flt => ech;
        filterFreq[idx] => flt.freq;
        filterQ[idx] => flt.Q;
    } else if (filter[idx] == 2) {
        env => BPF flt => ech;
        filterFreq[idx] => flt.freq;
        filterQ[idx] => flt.Q;
    }
    if (reverb[idx] == 0) {
        ech => JCRev rev => Gain g => dac;
        reverbMix[idx] => rev.mix;
        volume[idx] => g.gain;
    } else if (reverb[idx] == 1) {
        ech => NRev rev => Gain g => dac;
        reverbMix[idx] => rev.mix;
        volume[idx] => g.gain;
    } else if (reverb[idx] == 2) {
        ech => PRCRev rev => Gain g => dac;
        reverbMix[idx] => rev.mix;
        volume[idx] => g.gain;
    }
    env.keyOn();
    sixteenth => now;
    env.keyOff();
    sixteenth => now;
}

while (true) {
    startPlayback => now;
    until (stopPlayback) {
        for (0 => int i; i < 32; ++i) {
            if (stopPlayback) break;
            spork ~ playNote(playedNotes0, 0, i);
            spork ~ playNote(playedNotes1, 1, i);
            spork ~ playNote(playedNotes2, 2, i);
            spork ~ playNote(playedNotes3, 3, i);
            sixteenth => now;
            step.broadcast();
        }
    }
    false => stopPlayback;
}