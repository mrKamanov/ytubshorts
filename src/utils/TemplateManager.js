const templates = {
  'rainbow-text': {
    title: '🌈 Радужный текст',
    code: `<!DOCTYPE html>
<html>
<head>
<style>
  body {
    background: #000;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
    font-family: Arial;
  }
  
  .rainbow-text {
    font-size: 4rem;
    font-weight: bold;
    background: linear-gradient(
      45deg,
      #ff0000, #ff8000, #ffff00, #80ff00,
      #00ff00, #00ff80, #00ffff, #0080ff,
      #0000ff, #8000ff, #ff0080, #ff0000
    );
    background-size: 300% 300%;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: rainbow 3s ease-in-out infinite;
  }
  
  @keyframes rainbow {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
</style>
</head>
<body>
  <div class="rainbow-text">AMAZING!</div>
</body>
</html>`
  },
  'floating-cards': {
    title: '💫 Плавающие карточки',
    code: `<!DOCTYPE html>
<html>
<head>
<style>
  body {
    margin: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    height: 100vh;
    overflow-x: auto;
    overflow-y: hidden;
    display: flex;
    align-items: center;
    padding: 20px;
    box-sizing: border-box;
  }
  
  .container {
    display: flex;
    gap: 20px;
    min-width: 100%;
    justify-content: flex-start;
    align-items: center;
  }
  
  .card {
    min-width: 200px;
    height: 300px;
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
    animation: float 6s ease-in-out infinite;
    cursor: pointer;
    transition: all 0.3s ease;
    user-select: none;
  }
  
  .card:hover {
    transform: scale(1.05) translateY(-10px);
    background: rgba(255,255,255,0.2);
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  }
  
  .card:active {
    transform: scale(0.95);
  }
  
  .card-text {
    margin-top: 10px;
    font-size: 0.8rem;
    text-align: center;
  }
  
  .card:nth-child(1) { animation-delay: 0s; }
  .card:nth-child(2) { animation-delay: -2s; }
  .card:nth-child(3) { animation-delay: -4s; }
  .card:nth-child(4) { animation-delay: -1s; }
  .card:nth-child(5) { animation-delay: -3s; }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-30px); }
  }
</style>
</head>
<body>
  <div class="container">
    <div class="card" onclick="changeColor(this)">
      <div>✨</div>
      <div class="card-text">Magic</div>
    </div>
    <div class="card" onclick="changeColor(this)">
      <div>🚀</div>
      <div class="card-text">Rocket</div>
    </div>
    <div class="card" onclick="changeColor(this)">
      <div>💎</div>
      <div class="card-text">Diamond</div>
    </div>
    <div class="card" onclick="changeColor(this)">
      <div>🌟</div>
      <div class="card-text">Star</div>
    </div>
    <div class="card" onclick="changeColor(this)">
      <div>🎭</div>
      <div class="card-text">Theater</div>
    </div>
  </div>
  
  <script>
    function changeColor(card) {
      const colors = [
        'linear-gradient(135deg, #ff6b6b, #ee5a24)',
        'linear-gradient(135deg, #4834d4, #686de0)',
        'linear-gradient(135deg, #00d2d3, #54a0ff)',
        'linear-gradient(135deg, #5f27cd, #341f97)',
        'linear-gradient(135deg, #ff9ff3, #f368e0)'
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      card.style.background = randomColor;
      card.style.transform = 'scale(1.1) rotate(5deg)';
      setTimeout(() => {
        card.style.background = 'rgba(255,255,255,0.1)';
        card.style.transform = '';
      }, 300);
    }
    document.body.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        document.body.scrollLeft += e.deltaY;
      }
    });
  </script>
</body>
</html>`
  },
  'particle-system': {
    title: '⭐ Система частиц',
    code: `<!DOCTYPE html>
<html>
<head>
<style>
  body {
    margin: 0;
    background: #000;
    overflow: hidden;
  }
  #canvas {
    display: block;
  }
</style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = Math.random() * 3 + 1;
        this.color = 'hsl(' + (Math.random() * 360) + ', 70%, 60%)';
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }
    for (let i = 0; i < 100; i++) {
      particles.push(new Particle());
    }
    function animate() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animate);
    }
    animate();
  </script>
</body>
</html>`
  }
};

export default templates; 