async function buscarDadosDashboard() {
            const baseUrl = 'http://127.0.0.1:5000'; 
            let departamentosChartInstance = null; 

            try {
               
                const responseFuncionarios = await fetch(`${baseUrl}/listar`);
                const dataFuncionarios = await responseFuncionarios.json();

                if (dataFuncionarios.cadastros) {
                    const totalFuncionarios = dataFuncionarios.cadastros.length;
                    document.getElementById('total-funcionarios-value').textContent = totalFuncionarios;

                 
                    const departamentosCount = dataFuncionarios.cadastros.reduce((acc, func) => {
                        acc[func.departamento] = (acc[func.departamento] || 0) + 1;
                        return acc;
                    }, {});

                    const labelsDepartamentos = Object.keys(departamentosCount);
                    const dataDepartamentos = Object.values(departamentosCount);

                   
                    const backgroundColors = labelsDepartamentos.map(() => 
                        `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.8)`
                    );

                    
                    const departamentosCtx = document.getElementById('departamentos-chart').getContext('2d');
                    if (departamentosChartInstance) {
                        departamentosChartInstance.destroy();
                    }
                    departamentosChartInstance = new Chart(departamentosCtx, {
                        type: 'doughnut',
                        data: {
                            labels: labelsDepartamentos,
                            datasets: [{
                                data: dataDepartamentos,
                                backgroundColor: backgroundColors,
                                borderColor: 'rgba(0, 0, 0, 0.1)',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'bottom'
                                }
                            }
                        }
                    });

                } else {
                    document.getElementById('total-funcionarios-value').textContent = 'Erro';
                    console.error('Erro ao buscar funcionários:', dataFuncionarios.erro);
                   
                }

            } catch (error) {
                document.getElementById('total-funcionarios-value').textContent = 'Erro';
                console.error('Erro na requisição /listar:', error);
                
            }

            try {
                
                const responsePontos = await fetch(`${baseUrl}/listar-ponto`);
                const dataPontos = await responsePontos.json();

                if (dataPontos.pontos) {
                    document.getElementById('total-pontos-value').textContent = dataPontos.pontos.length;
                } else {
                    document.getElementById('total-pontos-value').textContent = 'Erro';
                    console.error('Erro ao buscar pontos:', dataPontos.erro);
                }
            } catch (error) {
                document.getElementById('total-pontos-value').textContent = 'Erro';
                console.error('Erro na requisição /listar-ponto:', error);
            }
        }

        
        document.addEventListener('DOMContentLoaded', function() {
           
            const themeToggle = document.getElementById('toggle-theme');
            const iconImg = document.querySelector('header img');
            const savedTheme = localStorage.getItem('safescan-theme');
            if (savedTheme === 'light') {
                document.body.classList.add('light-theme');
                themeToggle.textContent = '☀️';
                if(iconImg) iconImg.src = 'reconhecimento_facial_preto.png';
            } else {
                 if(iconImg) iconImg.src = 'reconhecimento_facial_branco.png';
            }
            
            themeToggle.addEventListener('click', function() {
                const isLight = document.body.classList.toggle('light-theme');
                localStorage.setItem('safescan-theme', isLight ? 'light' : 'dark');
                themeToggle.textContent = isLight ? '☀️' : '🌙';
                 if(iconImg) iconImg.src = isLight ? 'reconhecimento_facial_preto.png' : 'reconhecimento_facial_branco.png';
            });
            
            
            const menuToggle = document.querySelector('.menu-toggle');
            const sidebar = document.querySelector('.sidebar');
            const sidebarOverlay = document.querySelector('.sidebar-overlay');
            
            if (menuToggle && sidebar && sidebarOverlay) {
                menuToggle.addEventListener('click', function() {
                    sidebar.classList.toggle('active');
                    sidebarOverlay.classList.toggle('active');
                });
                
                sidebarOverlay.addEventListener('click', function() {
                    sidebar.classList.remove('active');
                    sidebarOverlay.classList.remove('active');
                });
            }

           
            buscarDadosDashboard();
        });