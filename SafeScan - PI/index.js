document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('login-form');
    const reconhecimentoBtn = document.getElementById('btn-reconhecimento');
    const mensagem = document.getElementById('mensagem');

    let video = document.createElement('video');
    video.autoplay = true;
    video.style.display = 'none'; 
    document.body.appendChild(video);

    
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => {
            mensagem.textContent = "Erro ao acessar a webcam.";
            console.error("Erro na webcam:", err);
        });

    reconhecimentoBtn.addEventListener('click', async () => {
        mensagem.textContent = "Capturando imagem...";

        if (video.readyState < 2) {
            mensagem.textContent = "Esperando a webcam carregar...";
            await new Promise(resolve => {
                video.onloadeddata = () => resolve();
            });
        }

        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imagemBase64 = canvas.toDataURL('image/jpeg');
        const formData = new FormData();
        formData.append("imagem", imagemBase64);

        try {
            const response = await fetch("http://localhost:5000/login-reconhecimento", {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            mensagem.textContent = data.mensagem;

            if (data.status === "ok") {
                if (data.tipo === "admin") {
                    setTimeout(() => window.location.href = "incial.html", 2000);
                } else {
                    setTimeout(() => window.location.href = "ponto.html", 2000);
                }
            }
        } catch (error) {
            mensagem.textContent = "Erro ao fazer login por reconhecimento facial.";
            console.error(error);
        }
    });

});