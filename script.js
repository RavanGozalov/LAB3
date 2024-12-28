// Вспомогательные функции
function toRad(deg) { return deg * Math.PI / 180; }
function toDeg(rad) { return rad * 180 / Math.PI; }
function format(n) { return Number(n).toFixed(2); }

// Преобразования координат
function polarToCartesian(radius, angle) {
    const x = radius * Math.cos(toRad(angle));
    const y = radius * Math.sin(toRad(angle));
    return [x, y];
}

function cartesianToPolar(x, y) {
    const radius = Math.sqrt(x * x + y * y);
    let angle = toDeg(Math.atan2(y, x));
    if (angle < 0) angle += 360;
    return [radius, angle];
}

function sphericalToCartesian(radius, azimuth, zenith) {
    const x = radius * Math.sin(toRad(zenith)) * Math.cos(toRad(azimuth));
    const y = radius * Math.sin(toRad(zenith)) * Math.sin(toRad(azimuth));
    const z = radius * Math.cos(toRad(zenith));
    return [x, y, z];
}

// Расчет расстояний
function distanceCartesian2D(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function distanceCartesian3D(x1, y1, z1, x2, y2, z2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));
}

function distancePolar(r1, theta1, r2, theta2) {
    return Math.sqrt(Math.pow(r1, 2) + Math.pow(r2, 2) - 
           2 * r1 * r2 * Math.cos(toRad(theta2 - theta1)));
}

function distanceSphericalVolume(r1, theta1, phi1, r2, theta2, phi2) {
    return Math.sqrt(
        Math.pow(r1, 2) + Math.pow(r2, 2) - 
        2 * r1 * r2 * (
            Math.sin(toRad(theta1)) * Math.sin(toRad(theta2)) * Math.cos(toRad(phi1 - phi2)) + 
            Math.cos(toRad(theta1)) * Math.cos(toRad(theta2))
        )
    );
}

function displayResults() {
    // Тест 1: Преобразования координат
    let output1 = 'Дослідження перетворень координат:\n\n';
    for(let i = 0; i < 3; i++) {
        const r = Math.random() * 10;
        const theta = Math.random() * 360;
        const [x, y] = polarToCartesian(r, theta);
        const [r2, theta2] = cartesianToPolar(x, y);
        
        output1 += `Дослідження ${i + 1}:\n`;
        output1 += `Початкові полярні координати: r=${format(r)}, θ=${format(theta)}°\n`;
        output1 += `Перетворені декартові координати: x=${format(x)}, y=${format(y)}\n`;
        output1 += `Зворотнє перетворення: r=${format(r2)}, θ=${format(theta2)}°\n\n`;
    }
    document.getElementById('output1').textContent = output1;

    // Тест 2: Расчет расстояний
    let output2 = 'Розрахунок відстаней між точками:\n\n';
    for(let i = 0; i < 3; i++) {
        const r1 = Math.random() * 10;
        const theta1 = Math.random() * 360;
        const phi1 = Math.random() * 180;
        const r2 = Math.random() * 10;
        const theta2 = Math.random() * 360;
        const phi2 = Math.random() * 180;

        const [x1, y1, z1] = sphericalToCartesian(r1, theta1, phi1);
        const [x2, y2, z2] = sphericalToCartesian(r2, theta2, phi2);

        output2 += `Вимірювання ${i + 1}:\n`;
        output2 += `Двовимірна відстань: ${format(distanceCartesian2D(x1, y1, x2, y2))}\n`;
        output2 += `Тривимірна відстань: ${format(distanceCartesian3D(x1, y1, z1, x2, y2, z2))}\n`;
        output2 += `Полярна відстань: ${format(distancePolar(r1, theta1, r2, theta2))}\n`;
        output2 += `Відстань у сферичних координатах: ${format(distanceSphericalVolume(r1, theta1, phi1, r2, theta2, phi2))}\n\n`;
    }
    document.getElementById('output2').textContent = output2;

    // Тест 3: Бенчмарк
    const points = Array.from({length: 500000}, () => ({
        r: Math.random() * 10,
        theta: Math.random() * 360,
        phi: Math.random() * 180
    }));

    let output3 = 'Результати вимірювання швидкодії:\n\n';
    
    // 2D тест
    let start = performance.now();
    for(let i = 0; i < points.length - 1; i++) {
        const [x1, y1] = polarToCartesian(points[i].r, points[i].theta);
        const [x2, y2] = polarToCartesian(points[i+1].r, points[i+1].theta);
        distanceCartesian2D(x1, y1, x2, y2);
    }
    output3 += `2D декартові обчислення: ${format(performance.now() - start)} мс\n`;

    // 3D тест
    start = performance.now();
    for(let i = 0; i < points.length - 1; i++) {
        const [x1, y1, z1] = sphericalToCartesian(points[i].r, points[i].theta, points[i].phi);
        const [x2, y2, z2] = sphericalToCartesian(points[i+1].r, points[i+1].theta, points[i+1].phi);
        distanceCartesian3D(x1, y1, z1, x2, y2, z2);
    }
    output3 += `3D декартові обчислення: ${format(performance.now() - start)} мс\n`;

    // Полярный тест
    start = performance.now();
    for(let i = 0; i < points.length - 1; i++) {
        distancePolar(points[i].r, points[i].theta, points[i+1].r, points[i+1].theta);
    }
    output3 += `Полярні обчислення: ${format(performance.now() - start)} мс\n`;

    // Сферический тест
    start = performance.now();
    for(let i = 0; i < points.length - 1; i++) {
        distanceSphericalVolume(
            points[i].r, points[i].theta, points[i].phi,
            points[i+1].r, points[i+1].theta, points[i+1].phi
        );
    }
    output3 += `Сферичні обчислення: ${format(performance.now() - start)} мс\n`;

    document.getElementById('output3').textContent = output3;
}

// Запускаем все тесты при загрузке страницы
window.onload = displayResults;