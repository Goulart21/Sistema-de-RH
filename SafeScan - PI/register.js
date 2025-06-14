const formAvaliacao = document.getElementById('avaliacao-form');

if (formAvaliacao) {
  formAvaliacao.addEventListener('submit', async function(event) {
    event.preventDefault();

    const id = document.getElementById('id_funcionario').value;
    const dados = {
      produtividade: document.getElementById('produtividade').value,
      qualidade: document.getElementById('qualidade').value,
      trabalho_equipe: document.getElementById('trabalho_equipe').value,
      comunicacao: document.getElementById('comunicacao').value,
      pontualidade: document.getElementById('pontualidade').value
    };

    try {
      const response = await fetch(`http://localhost:5000/avaliar/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      });

      const resultado = await response.json();
      const mensagemEl = document.getElementById('mensagem');

      if (response.ok) {
        mensagemEl.innerHTML = `<div class="alert alert-success">${resultado.mensagem}</div>`;
      } else {
        mensagemEl.innerHTML = `<div class="alert alert-danger">${resultado.erro}</div>`;
      }

    } catch (erro) {
      document.getElementById('mensagem').innerHTML = `<div class="alert alert-danger">Erro ao conectar ao servidor.</div>`;
    }
  });
}


