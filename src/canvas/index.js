function getRandom(min, max,) {
  // 生成一个介于min（含）和max（含）之间的随机整数
  return Math.floor(Math.random() * (max + 1 - min) + min);
}

class Point {
  constructor(cvs, ctx) {
    this.cvs = cvs;
    this.ctx = ctx;
    this.r = 6;
    this.x = getRandom(0, cvs.width - this.r / 2);
    this.y = getRandom(0, cvs.height - this.r / 2);
    this.xSpeed = getRandom(-50, 50);
    this.ySpeed = getRandom(-50, 50);
    this.lastDrawTime = null;
  }

  draw() {
    if (this.lastDrawTime) {
      let duration = (Date.now() - this.lastDrawTime) / 1000;
      this.x += this.xSpeed * duration;
      this.y += this.ySpeed * duration;

      // 边界检测，如果小圆点超出画布范围，则反向速度
      if (this.x < 0 || this.x > this.cvs.width - this.r / 2) {
        this.x = this.x < 0 ? 0 : this.cvs.width - this.r / 2;
        this.xSpeed = -this.xSpeed;
      }
      if (this.y < 0 || this.y > this.cvs.height - this.r / 2) {
        this.y = this.y < 0 ? 0 : this.cvs.height - this.r / 2;
        this.ySpeed = -this.ySpeed;
      }
    }
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    this.ctx.fillStyle = '#fff';
    this.ctx.fill();
    this.lastDrawTime = Date.now();
  }
}

class Graph {
  constructor(cvs, ctx, pointNumber = 30, maxDistance = 300) {
    this.cvs = cvs;
    this.ctx = ctx;
    this.maxDistance = maxDistance;
    this.points = new Array(pointNumber).fill(0).map(() => new Point(cvs, ctx));
  }

  draw() {
    requestAnimationFrame(() => this.draw());
    this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
    // 这里是简化版的绘制逻辑，实际项目中应该考虑引入空间分割技术，如四叉树，以提高性能
    for (let i = 0; i < this.points.length; i++) {
      const p1 = this.points[i];
      p1.draw();

      for (let j = i + 1; j < this.points.length; j++) {
        const p2 = this.points[j];
        const d = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
        if (d > this.maxDistance) {
          continue;
        }

        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.closePath();
        this.ctx.strokeStyle = `rgba(200,200,200,${1 - d / this.maxDistance})`;
        this.ctx.stroke();
      }
    }
  }
}

// 优化初始化函数，增加异常处理和内存管理
function init() {
  const cvs = document.querySelector("canvas");
  if (!cvs) {
    console.error("Canvas element not found.");
    return;
  }

  const ctx = cvs.getContext("2d");
  if (!ctx) {
    console.error("Failed to getContext for canvas.");
    return;
  }

  cvs.width = window.innerWidth * devicePixelRatio;
  cvs.height = window.innerHeight * devicePixelRatio;

  const handleResize = () => {
    cvs.width = window.innerWidth * devicePixelRatio;
    cvs.height = window.innerHeight * devicePixelRatio;
    redraw();
  };
  window.addEventListener("resize", handleResize);
  window.addEventListener("beforeunload", () => {
    window.removeEventListener("resize", handleResize);
  });

  const g = new Graph(cvs, ctx);
  function redraw() {
    g.draw();
  }
  redraw();
}

init();
