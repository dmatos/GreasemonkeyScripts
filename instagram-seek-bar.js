// ==UserScript==
// @name     Unnamed Script 191752
// @version  1
// @match    <all_urls>
// @grant    none
// ==/UserScript==

// ==UserScript==
// @name         Instagram Video Seek Bar
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Adiciona uma barra de seek/progresso nos vídeos do Instagram na web
// @author       Você
// @match        https://www.instagram.com/*
// @grant        none
// @run-at       document-end
// ====/UserScript==

(function() {
    'use strict';

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function addSeekBarToVideo(video) {
        // Evita duplicar a barra no mesmo vídeo
        if (video.dataset.hasSeekBar === "true") return;

        const container = video.closest('article') || video.parentElement;
        if (!container) return;

        // Marca que já foi adicionado
        video.dataset.hasSeekBar = "true";

        // Cria a estrutura da barra de controle
        const wrapper = document.createElement('div');
        wrapper.className = 'ig-seek-bar-wrapper';
        wrapper.style.cssText = `
            position: absolute;
            bottom: 12px;
            left: 12px;
            right: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(0, 0, 0, 0.6);
            padding: 6px 10px;
            border-radius: 8px;
            z-index: 999;
            opacity: 0;
            transition: opacity 0.2s ease;
            pointer-events: auto;
        `;

        const timeCurrent = document.createElement('span');
        timeCurrent.style.cssText = 'color: white; font-size: 11px; font-family: sans-serif; min-width: 32px; text-align: right;';
        timeCurrent.textContent = '0:00';

        const progressBar = document.createElement('input');
        progressBar.type = 'range';
        progressBar.min = 0;
        progressBar.max = 100;
        progressBar.value = 0;
        progressBar.step = 0.1;
        progressBar.style.cssText = `
            flex: 1;
            cursor: pointer;
            height: 4px;
            accent-color: #ffffff;
            appearance: none;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 2px;
        `;

        const timeDuration = document.createElement('span');
        timeDuration.style.cssText = 'color: white; font-size: 11px; font-family: sans-serif; min-width: 32px;';
        timeDuration.textContent = '0:00';

        wrapper.appendChild(timeCurrent);
        wrapper.appendChild(progressBar);
        wrapper.appendChild(timeDuration);

        // Garante que o container do vídeo aceite posicionamento absoluto
        const originalPosition = window.getComputedStyle(container).position;
        if (originalPosition === 'static') {
            container.style.position = 'relative';
        }
        container.appendChild(wrapper);

        // Mostra/oculta os controles ao passar o mouse no container do vídeo
        container.addEventListener('mouseenter', () => { wrapper.style.opacity = '1'; });
        container.addEventListener('mouseleave', () => { wrapper.style.opacity = '0'; });

        // Atualiza a barra de progresso conforme o vídeo toca
        video.addEventListener('timeupdate', () => {
            if (!video.duration) return;
            const percent = (video.currentTime / video.duration) * 100;
            progressBar.value = percent;
            timeCurrent.textContent = formatTime(video.currentTime);
            timeDuration.textContent = formatTime(video.duration);
        });

        video.addEventListener('loadedmetadata', () => {
            timeDuration.textContent = formatTime(video.duration);
        });

        // Evento para arrastar ou clicar na barra de progresso
        let isSeeking = false;

        progressBar.addEventListener('mousedown', () => { isSeeking = true; });
        progressBar.addEventListener('mouseup', () => { isSeeking = false; });

        progressBar.addEventListener('input', () => {
            if (!video.duration) return;
            const targetTime = (progressBar.value / 100) * video.duration;
            video.currentTime = targetTime;
            timeCurrent.textContent = formatTime(targetTime);
        });
    }

    // Observa o DOM para detectar novos vídeos carregados dinamicamente (feed infinito / reels)
    const observer = new MutationObserver((mutations) => {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => addSeekBarToVideo(video));
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Varre vídeos já presentes na página inicial
    document.querySelectorAll('video').forEach(video => addSeekBarToVideo(video));
})();
