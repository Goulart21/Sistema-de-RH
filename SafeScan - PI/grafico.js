
function buscarDesempenho() {
      const id = document.getElementById("funcionarioId").value;
      const url = `http://localhost:5000/classificacao_desempenho/${id}`;

      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error("Funcionário não encontrado ou erro na API.");
          }
          return response.json();
        })
        .then(data => {
          document.getElementById("resultado").innerHTML = `
            <p><strong>Média Geral:</strong> ${data.media_geral}</p>
            <p><strong>Nível de Desempenho:</strong> ${data.classificacao}</p>
          `;
        })
        .catch(error => {
          document.getElementById("resultado").innerHTML = `<p style="color: red;">Erro: ${error.message}</p>`;
        });
    }

    const baseURL = 'http://localhost:5000';

 
    let chartIndividual = null;
    let chartComparativo = null;

  
    function gerarGraficoIndividual(data) {
      const ctx = document.getElementById('canvas-individual').getContext('2d');

      if (chartIndividual) {
        chartIndividual.destroy();
      }

      chartIndividual = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Produtividade', 'Qualidade', 'Trabalho em Equipe', 'Comunicação', 'Pontualidade'],
          datasets: [{
            label: `Avaliações do Funcionário ID ${data.id_funcionario || ''}`,
            data: [
              data.produtividade || 0,
              data.qualidade || 0,
              data.trabalho_equipe || 0,
              data.comunicacao || 0,
              data.pontualidade || 0
            ],
            backgroundColor: 'rgba(54, 162, 235, 0.3)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          }]
        },
        options: {
          scales: {
            r: {
              min: 0,
              max: 10,
              ticks: {
                stepSize: 1
              }
            }
          },
          plugins: {
            legend: { display: true },
            title: {
              display: true,
              text: 'Avaliação Individual'
            }
          }
        }
      });
    }


    function gerarGraficoComparativo(data) {
      const ctx = document.getElementById('canvas-comparativo').getContext('2d');

      if (chartComparativo) {
        chartComparativo.destroy();
      }

      
      const nomes = data.map(f => f.nome || `ID ${f.id}`);


      const produtividade = data.map(f => f.produtividade || 0);
      const qualidade = data.map(f => f.qualidade || 0);
      const trabalhoEquipe = data.map(f => f.trabalho_equipe || 0);
      const comunicacao = data.map(f => f.comunicacao || 0);
      const pontualidade = data.map(f => f.pontualidade || 0);

      chartComparativo = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: nomes,
          datasets: [
            {
              label: 'Produtividade',
              data: produtividade,
              backgroundColor: 'rgba(255, 99, 132, 0.6)'
            },
            {
              label: 'Qualidade',
              data: qualidade,
              backgroundColor: 'rgba(54, 162, 235, 0.6)'
            },
            {
              label: 'Trabalho em Equipe',
              data: trabalhoEquipe,
              backgroundColor: 'rgba(255, 206, 86, 0.6)'
            },
            {
              label: 'Comunicação',
              data: comunicacao,
              backgroundColor: 'rgba(75, 192, 192, 0.6)'
            },
            {
              label: 'Pontualidade',
              data: pontualidade,
              backgroundColor: 'rgba(153, 102, 255, 0.6)'
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Comparativo de Desempenho dos Funcionários'
            },
            legend: {
              position: 'top',
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 10,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    }

    
    document.getElementById('form-consultar-avaliacoes').addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = e.target.elements['id_funcionario'].value;
      const msg = document.getElementById('msg-individual');
      msg.textContent = 'Carregando avaliações...';

      try {
        const res = await fetch(`${baseURL}/desempenho/${id}`);
        if (!res.ok) throw new Error('Funcionário não encontrado ou sem avaliações.');

        const json = await res.json();
        if (json.erro) throw new Error(json.erro);
        console.log('Dados recebidos:', json);

       
        const temDados = ['produtividade', 'qualidade', 'trabalho_equipe', 'comunicacao', 'pontualidade']
          .every(k => typeof json[k] === 'number');

        if (!temDados) throw new Error('Dados inválidos para o gráfico.');

        gerarGraficoIndividual(json);
        msg.textContent = '';
      } catch (err) {
        msg.textContent = 'Erro: ' + err.message;
        if (chartIndividual) {
          chartIndividual.destroy();
          chartIndividual = null;
        }
      }
    });


  
    document.getElementById('btn-comparativo').addEventListener('click', async () => {
      const msg = document.getElementById('msg-comparativo');
      msg.textContent = 'Carregando comparativo...';

      try {
        const res = await fetch(baseURL + '/comparativo_desempenho');
        if (!res.ok) throw new Error('Erro ao buscar comparativo.');

        const json = await res.json();

        gerarGraficoComparativo(json);
        msg.textContent = '';
      } catch (err) {
        msg.textContent = 'Erro: ' + err.message;
        if (chartComparativo) {
          chartComparativo.destroy();
          chartComparativo = null;
        }
      }
    });
