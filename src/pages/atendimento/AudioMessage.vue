<template>
    <div class="custom-audio-player">
        <div class="controls">
            <q-btn flat round dense :icon="playOn ? 'pause_circle' : 'play_circle'" @click="playOrPauseAudio">
            </q-btn>
            <q-btn flat dense class="speed-control duration" @click="changePlaybackSpeed" >
                {{ playbackRate }}x
            </q-btn>
        </div>
        <div ref="waveform" class="audio-container"></div>
        <div class="duration">
            {{ audioLength }}
        </div>
    </div>
</template>
  
<script>

import WaveSurfer from 'wavesurfer.js';
const AUDIOSURFER = 'audioPlaybackRate';

export default {
props: {
    audioSrc: {
    type: String,
    required: true
    }
},
data() {
    return {
        audiowave: null,
        playOn: false,
        audioLength: '0s',
        playbackRate: parseFloat(localStorage.getItem(AUDIOSURFER) || '1'),
        // Sistema de gerenciamento de memória
        timers: [],
    };
},
methods: {
    // Sistema de gerenciamento de memória
    addTimer(timerId) {
      this.timers.push(timerId);
    },
    clearAllTimers() {
      this.timers.forEach(timerId => {
        clearTimeout(timerId);
        clearInterval(timerId);
      });
      this.timers = [];
    },
    cleanupMemory() {
      this.clearAllTimers();
      // Destruir instância WaveSurfer
      if (this.audiowave) {
        this.audiowave.destroy();
        this.audiowave = null;
      }
    },
    formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    },
    playOrPauseAudio() {
        if (this.audiowave) {
            this.audiowave.playPause();
        }
    },
    changePlaybackSpeed() {
        const rates = [1, 1.5, 2, ]; // Velocidades disponíveis
        const currentIndex = rates.indexOf(this.playbackRate);
        this.playbackRate = rates[(currentIndex + 1) % rates.length]; // Alterna entre as opções
        this.audiowave.setPlaybackRate(this.playbackRate);
        localStorage.setItem(AUDIOSURFER, this.playbackRate); // Salva no localStorage
    }
},
mounted() {
    this.$nextTick(() => {
        if (!this.$refs.waveform) {
            console.error("Elemento waveform não encontrado.");
            return;
        }

        this.audiowave = WaveSurfer.create({
            container: this.$refs.waveform,
            barWidth: 1,
            barGap: 1,
            height: 30,
            waveColor: '#ddd',
            progressColor: '#bbb',
            cursorColor: 'transparent',
            responsive: true,
            normalize: true,
            fillParent: true
        });

        this.audiowave.on('error', (err) => {
            console.error("Erro no WaveSurfer:", err);
        });

        // Adiciona um pequeno delay antes de carregar o áudio
        const timerId = setTimeout(() => {
            if (this.audiowave) {
                this.audiowave.load(this.audioSrc);
            }
        }, 500); // Delay de 500ms antes de carregar o áudio
        this.addTimer(timerId);

        this.audiowave.on('ready', () => {
            this.audioLength = this.formatTime(this.audiowave.getDuration());
            this.audiowave.setPlaybackRate(this.playbackRate);
        });

        this.audiowave.on('play', () => {
            this.playOn = true;
        });

        this.audiowave.on('pause', () => {
            this.playOn = false;
        });

        this.audiowave.on('finish', () => {
            this.playOn = false;
            this.audioLength = '0s';
        });

        this.audiowave.on('audioprocess', () => {
            const remainingTime = this.audiowave.getDuration() - this.audiowave.getCurrentTime();
            this.audioLength = this.formatTime(Math.max(remainingTime, 0));
        });
    });
},
beforeUnmount() {
    // Limpeza completa de memória
    this.cleanupMemory();
},
unmounted() {
    // Garantir que todos os recursos sejam limpos
    this.cleanupMemory();
}
};
</script>
  
<style lang="scss" scoped>

.custom-audio-player {
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 10px;
    
}

.audio-container {
    flex: 1;
    height: 35px;
}

.controls {
    display: flex;
    align-items: center;
}

.speed-control {
    font-size: 14px;
    color: var(--q-primary);
}

.duration {
    font-size: 12px;
    color: #555;
}
</style>
  
