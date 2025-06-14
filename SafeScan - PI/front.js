
  document.addEventListener('DOMContentLoaded', function () {
  const themeToggle = document.getElementById('toggle-theme');
  const iconImg = document.querySelector('header img');

  
  const savedTheme = localStorage.getItem('safescan-theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    themeToggle.textContent = '☀️';
    iconImg.src = 'reconhecimento_facial_preto.png';
  } else {
    themeToggle.textContent = '🌙';
    iconImg.src = 'reconhecimento_facial_branco.png';
  }


  themeToggle.addEventListener('click', function () {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('safescan-theme', isLight ? 'light' : 'dark');
    themeToggle.textContent = isLight ? '☀️' : '🌙';
    iconImg.src = isLight
      ? 'reconhecimento_facial_preto.png'
      : 'reconhecimento_facial_branco.png';
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
    });