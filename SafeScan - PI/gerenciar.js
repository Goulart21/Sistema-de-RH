document.addEventListener("DOMContentLoaded", () => {
  const listaFuncionarios = document.getElementById("listaFuncionarios");

  

 async function carregarFuncionarios() {
  try {
    const response = await fetch('http://localhost:5000/listar');
    if (!response.ok) {
      throw new Error(`Erro HTTP! Status: ${response.status}`);
    }

    const dados = await response.json();
    const funcionarios = dados.cadastros; 

    const tbody = document.getElementById('listaFuncionarios');
    tbody.innerHTML = '';

    funcionarios.forEach(func => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${func.id}</td>
        <td>${func.nome}</td>
        <td>${func.cargo}</td>
        <td>${func.departamento}</td>
        <td>${func.data_contratacao}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="editarFuncionario(${func.id})">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="excluirFuncionario(${func.id})">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Erro ao carregar funcionários:', error);
  }
}


  window.excluirFuncionario = async (id) => {
    if (confirm("Tem certeza que deseja excluir este funcionário?")) {
      try {
        const response = await fetch(`http://localhost:5000/deletar/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          alert("Funcionário excluído com sucesso!");
          carregarFuncionarios();
        } else {
          alert("Erro ao excluir funcionário.");
        }
      } catch (error) {
        console.error("Erro:", error);
      }
    }
  };

 
  
window.editarFuncionario = async (id) => {
  const novoNome = prompt("Digite o novo nome:");
  const novoCargo = prompt("Digite o novo cargo:");
  const novoDepartamento = prompt("Digite o novo departamento:");
  const novaData = prompt("Digite a nova data de contratação (AAAA-MM-DD):");
  const novaSenha = prompt("Digite a nova senha:");

  if (novoNome && novoCargo && novoDepartamento && novaData && novaSenha) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      const modal = document.createElement("div");
      modal.style.position = "fixed";
      modal.style.top = "0";
      modal.style.left = "0";
      modal.style.width = "100%";
      modal.style.height = "100%";
      modal.style.backgroundColor = "rgba(0,0,0,0.8)";
      modal.style.display = "flex";
      modal.style.alignItems = "center";
      modal.style.justifyContent = "center";
      modal.style.flexDirection = "column";
      modal.style.zIndex = "9999";

      const tirarFotoBtn = document.createElement("button");
      tirarFotoBtn.innerText = "Tirar Foto";
      tirarFotoBtn.style.marginTop = "10px";
      tirarFotoBtn.style.padding = "10px";
      tirarFotoBtn.style.fontSize = "16px";

      modal.appendChild(video);
      modal.appendChild(tirarFotoBtn);
      document.body.appendChild(modal);

      tirarFotoBtn.onclick = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);

        stream.getTracks().forEach((track) => track.stop());
        document.body.removeChild(modal);

        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg"));

        const formData = new FormData();
        formData.append("nome", novoNome);
        formData.append("cargo", novoCargo);
        formData.append("departamento", novoDepartamento);
        formData.append("data_contratacao", novaData);
        formData.append("senha", novaSenha);
        formData.append("imagem", blob, "foto.jpg");

        const response = await fetch(`http://localhost:5000/atualizar/${id}`, {
          method: "PUT",
          body: formData,
        });

        if (response.ok) {
          alert("Funcionário atualizado com sucesso!");
          carregarFuncionarios();
        } else {
          const data = await response.json();
          alert("Erro ao atualizar funcionário: " + data.erro);
        }
      };
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao acessar a câmera.");
    }
  } else {
    alert("Todos os campos devem ser preenchidos.");
  }
};

  

 
  carregarFuncionarios();


});




