const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        const captureBtn = document.getElementById('capture-btn');
        const message = document.getElementById('message');

        
        async function iniciarWebcam() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                video.srcObject = stream;
            } catch (err) {
                message.style.color = 'red';
                message.textContent = 'Erro ao acessar webcam: ' + err.message;
            }
        }

        
        async function registrarPonto() {
           
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

           
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    message.style.color = 'red';
                    message.textContent = 'Falha ao capturar a imagem.';
                    return;
                }

               
                const formData = new FormData();
                formData.append('imagem', blob, 'foto.jpg');

                message.style.color = 'black';
                message.textContent = 'Enviando imagem para reconhecimento...';

                try {
                    const response = await fetch('http://localhost:5000/registrar_ponto', {
                        method: 'POST',
                        body: formData
                    });

                    const data = await response.json();

                    if (response.ok) {
                        message.style.color = 'green';
                        message.textContent = data.mensagem || 'Ponto registrado com sucesso!';
                        setTimeout(() => {
                            window.location.href = 'incial.html'; 
                        }, 2000);
                    } else {
                        message.style.color = 'red';
                        message.textContent = 'Erro: ' + (data.erro || 'Erro desconhecido.');
                    }
                } catch (error) {
                    message.style.color = 'red';
                    message.textContent = 'Erro na requisição: ' + error.message;
                }
            }, 'image/jpeg');
        }

      
        captureBtn.addEventListener('click', registrarPonto);

       
        window.onload = iniciarWebcam;