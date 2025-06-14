document.addEventListener("DOMContentLoaded", () => {fetch('http://localhost:5000/listar-ponto')
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao buscar os pontos.');
      }
      return response.json();
    })
    .then(data => {
      const tabela = document.getElementById("listaPontos");
      data.pontos.forEach(ponto => {
        const row = document.createElement("tr");

        const tdId = document.createElement("td");
        tdId.textContent = ponto.id;
        row.appendChild(tdId);

        const tdIdFuncionario = document.createElement("td");
        tdIdFuncionario.textContent = ponto.id_funcionario;
        row.appendChild(tdIdFuncionario);

        const tdData = document.createElement("td");
        tdData.textContent = ponto.data_ponto;
        row.appendChild(tdData);

        tabela.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Erro:', error);
    });
});
