const leftTorchCanvas = document.getElementById('leftTorch');
const rightTorchCanvas = document.getElementById('rightTorch');
const leftTorchCtx = leftTorchCanvas.getContext('2d');
const rightTorchCtx = rightTorchCanvas.getContext('2d');

function drawTorch(ctx, x, y) {
    ctx.fillStyle = '#555';
    ctx.fillRect(x + 20, y + 60, 10, 40);
    ctx.fillStyle = '#ff9800';
    ctx.beginPath();
    ctx.moveTo(x + 25, y + 20);
    ctx