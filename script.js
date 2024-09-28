document.addEventListener("DOMContentLoaded", function () {
    const cake = document.querySelector(".cake");
    const candleCountDisplay = document.getElementById("candleCount");
    const candleCountContainer = document.querySelector('.candle-count-display'); // Para ocultar el contenedor del contador
    const blowSound = document.getElementById("blow-sound");
    const applauseSound = document.getElementById("applause-sound");
    const modal = document.getElementById("modal");
    const span = document.getElementsByClassName("close")[0];
    const postBlowSong = document.getElementById("post-blow-song");
    const birthdaySong = document.getElementById("birthday-song");
    const imageHolder = document.getElementById("birthday-image");
    let candles = [];
    let audioContext;
    let analyser;
    let microphone;

    function updateCandleCount() {
        const activeCandles = candles.filter((candle) => !candle.classList.contains("out")).length;
        candleCountDisplay.textContent = activeCandles;
    }

    function addCandle(left, top) {
        const candle = document.createElement("div");
        candle.className = "candle";
        candle.style.left = left + "px";
        candle.style.top = top + "px";

        const flame = document.createElement("div");
        flame.className = "flame";
        candle.appendChild(flame);

        cake.appendChild(candle);
        candles.push(candle);
        updateCandleCount();
    }

    cake.addEventListener("click", function (event) {
        const rect = cake.getBoundingClientRect();
        const left = event.clientX - rect.left;
        const top = event.clientY - rect.top;
        addCandle(left, top);
    });

    function isBlowing() {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        return sum / bufferLength > 40;
    }

    function blowOutCandles() {
        let blownOut = 0;

        if (isBlowing()) {
            blowSound.play();
            candles.forEach((candle) => {
                if (!candle.classList.contains("out") && Math.random() > 0.5) {
                    candle.classList.add("out");
                    blownOut++;
                }
            });

            if (blownOut > 0) {
                updateCandleCount();
                if (candles.every((candle) => candle.classList.contains("out"))) {
                    // Detener la canción de cumpleaños
                    birthdaySong.pause();
                    birthdaySong.currentTime = 0; // Reiniciar la canción

                    // Reproducir la nueva canción
                    postBlowSong.play();

                    // Mostrar modal y reproducir sonido de aplausos
                    modal.style.display = "block";
                    applauseSound.play();

                    // Mostrar imagen
                    imageHolder.src = "FC.webp"; // Asegúrate de poner la ruta correcta
                    imageHolder.style.display = "block";

                    // Ocultar la torta y el contador de velas
                    cake.style.display = "none";
                    candleCountContainer.style.display = "none"; // Oculta el contador
                }
            }
        }
    }

    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(function (stream) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                microphone = audioContext.createMediaStreamSource(stream);
                microphone.connect(analyser);
                analyser.fftSize = 256;
                setInterval(blowOutCandles, 200);
            })
            .catch(function (err) {
                console.log("Unable to access microphone: " + err);
            });
    } else {
        console.log("getUserMedia not supported on your browser!");
    }

    // Close modal
    span.onclick = function () {
        modal.style.display = "none";
    };

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
});
