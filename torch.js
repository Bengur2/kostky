const leftTorchCanvas = document.getElementById('leftTorch');
const rightTorchCanvas = document.getElementById('rightTorch');
const leftTorchCtx = leftTorchCanvas.getContext('2d');
const rightTorchCtx = rightTorchCanvas.getContext('2d');

function drawTorch(ctx, x, y) {
    ctx.fillStyle = '#555';
    ctx.fillRect(x + 20, y + 60, 10, 40); // Tyč
    ctx.fillStyle = '#ff9800';
    ctx.beginPath();
    ctx.moveTo(x + 25, y + 20);
    ctx.lineTo(x + 15, y + 60);
    ctx.lineTo(x + 35, y + 60);
    ctx.fill(); // Plamen
    ctx.fillStyle = '#ffc107';
    ctx.beginPath();
    ctx.arc(x + 25, y + 20, 10, 0, Math.PI * 2);
    ctx.fill(); // Jiskra
}

function animateTorch(ctx, x, y) {
    setInterval(() => {
        ctx.clearRect(x, y, 50, 100); // Vymazání plátna
        drawTorch(ctx, x, y + Math.random() * 5); // Náhodný pohyb plamene
    }, 100);
}

drawTorch(leftTorchCtx, 0, 0);
drawTorch(rightTorchCtx, 0, 0);
animateTorch(leftTorchCtx, 0, 0);
animateTorch(rightTorchCtx, 0, 0);