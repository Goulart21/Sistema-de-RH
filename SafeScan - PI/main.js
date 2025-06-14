window.addEventListener("DOMContentLoaded", () => {
  const API = "http://localhost:5000";

  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const preview = document.getElementById("preview");

  const formCadastro = document.getElementById("formCadastro");


  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((err) => {
      console.error("Erro ao acessar a webcam:", err);
    });

  function capturePhoto() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/png");

    preview.src = imageData;
    preview.style.display = "block";

    let imgInput = document.getElementById("imagemBase64");
    if (!imgInput) {
      imgInput = document.createElement("input");
      imgInput.type = "hidden";
      imgInput.name = "imagem";
      imgInput.id = "imagemBase64";
      formCadastro.appendChild(imgInput);
    }
    imgInput.value = imageData;
  }

  window.capturePhoto = capturePhoto;

  formCadastro.addEventListener("submit", async (e) => {
    e.preventDefault();

    const base64 = document.getElementById("imagemBase64").value;
    const blob = await (await fetch(base64)).blob();
    const file = new File([blob], "foto.png", { type: "image/png" });

    const formData = new FormData(formCadastro);
    formData.delete("imagem");
    formData.append("imagem", file);

    try {
      const res = await fetch(`${API}/cadastrar`, {
        method: "POST",
        body: formData
      });
      const json = await res.json();
      alert(json.mensagem || json.erro);
      formCadastro.reset();
      preview.style.display = "none";
      
    } catch (error) {
      alert("Erro ao cadastrar funcionário.");
      console.error(error);
    }
  
  });

});

 