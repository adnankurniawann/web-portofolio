import { useEffect, useRef } from "react";

export default function ParticlesBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = Math.max(window.innerHeight, document.documentElement.scrollHeight);
    };
    
    setCanvasSize();

    const resizeObserver = new ResizeObserver(() => {
      setCanvasSize();
    });
    resizeObserver.observe(document.body);

    window.addEventListener("resize", setCanvasSize);

    let mouse = { x: null, y: null };
    const handleMouseMove = (event) => {
      mouse.x = event.pageX; 
      mouse.y = event.pageY;
    };
    const handleMouseOut = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseOut);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = Math.random() * 1 - 0.5; 
        this.speedY = Math.random() * 1 - 0.5; 
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;

        if (mouse.x != null && mouse.y != null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            this.x -= dx / 15;
            this.y -= dy / 15;
          }
        }
      }

      draw() {
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)"; 
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class Rocket {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = canvas.width * 0.1; 
        this.y = window.innerHeight * 0.85; 
        this.angle = -Math.PI / 3; 
        this.speed = 1.2;
        this.curveSpeed = 0.0015; 
        this.size = 14; 
        this.isFlying = true;
        this.trail = []; 
      }

      update() {
        if (this.isFlying) {
          this.angle += this.curveSpeed; 
          this.x += Math.cos(this.angle) * this.speed;
          this.y += Math.sin(this.angle) * this.speed;

          this.trail.push({ x: this.x, y: this.y });
          if (this.trail.length > 500) {
            this.trail.shift(); 
          }

          if (this.y < -150 || this.x > canvas.width + 150) {
            this.isFlying = false;
            setTimeout(() => this.reset(), 6000); 
          }
        }
      }

      draw() {
        if (this.trail.length > 1) {
          ctx.lineCap = "round";
          for (let i = 0; i < this.trail.length - 1; i++) {
            const point1 = this.trail[i];
            const point2 = this.trail[i + 1];
            const progress = i / this.trail.length; 
            
            ctx.beginPath();
            ctx.moveTo(point1.x, point1.y);
            ctx.lineTo(point2.x, point2.y);
            ctx.lineWidth = 1 + (progress * 2); 
            ctx.strokeStyle = `rgba(251, 146, 60, ${progress * 0.6})`; 
            ctx.stroke();
          }
        }

        if (!this.isFlying) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle); 

        ctx.shadowBlur = 15;
        ctx.shadowColor = "#ea580c"; 
        
        ctx.fillStyle = "#fef08a"; 
        ctx.beginPath();
        ctx.ellipse(-this.size * 1.2, 0, this.size * 0.8, this.size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0; 

        ctx.fillStyle = "#475569"; 
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.8, 0);
        ctx.lineTo(-this.size * 1.2, -this.size * 0.6); 
        ctx.lineTo(-this.size * 0.2, -this.size * 0.2);
        ctx.lineTo(-this.size * 0.2, this.size * 0.2);
        ctx.lineTo(-this.size * 1.2, this.size * 0.6); 
        ctx.closePath();
        ctx.fill();

        const grad = ctx.createLinearGradient(0, -this.size * 0.5, 0, this.size * 0.5);
        grad.addColorStop(0, "#f8fafc"); 
        grad.addColorStop(0.5, "#cbd5e1"); 
        grad.addColorStop(1, "#94a3b8"); 
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(this.size * 1.2, 0); 
        ctx.lineTo(this.size * 0.3, -this.size * 0.35); 
        ctx.lineTo(-this.size * 0.8, -this.size * 0.35); 
        ctx.lineTo(-this.size * 0.8, this.size * 0.35); 
        ctx.lineTo(this.size * 0.3, this.size * 0.35); 
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#38bdf8"; 
        ctx.beginPath();
        ctx.ellipse(this.size * 0.3, 0, this.size * 0.25, this.size * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    const particlesArray = [];
    const numberOfParticles = Math.min(250, Math.floor((canvas.width * canvas.height) / 15000));
    
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle());
    }

    const curvedRocket = new Rocket();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();

        for (let j = i; j < particlesArray.length; j++) {
          let dx = particlesArray[i].x - particlesArray[j].x;
          let dy = particlesArray[i].y - particlesArray[j].y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 80) { 
            ctx.beginPath();
            ctx.strokeStyle = `rgba(96, 165, 250, ${0.2 * (1 - distance / 80)})`;
            ctx.lineWidth = 0.5; 
            ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
            ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
            ctx.stroke();
          }
        }
      }

      curvedRocket.update();
      curvedRocket.draw();

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseOut);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full -z-10" 
    />
  );
}