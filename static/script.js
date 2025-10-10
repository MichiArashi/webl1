document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('pointForm'); // Изменил ID формы
    const tableBody = document.querySelector('#resultsBody'); // Изменил селектор таблицы
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');

    function loadHistory() {
        fetch('/api/history')
            .then(response => response.json())
            .then(data => {
                updateTable(data.history);
                if (data.history.length > 0) {
                    const lastItem = data.history[data.history.length - 1];
                    drawPlotAndPoint(lastItem.x, lastItem.y, lastItem.r);
                } else {
                    drawPlot(getPlot(1), 1);
                }
            })
            .catch(error => console.error('Ошибка загрузки истории:', error));
    }

    function updateTable(historyData) {
        tableBody.innerHTML = '';
        
        if (historyData.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="no-results">Нет данных</td></tr>';
            return;
        }
        
        historyData.forEach(item => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${item.x}</td>
                <td>${item.y}</td>
                <td>${item.r}</td>
                <td>${item.hit ? '✅ Да' : '❌ Нет'}</td>
                <td>${item.currentTime}</td>
            `;
            tableBody.appendChild(newRow);
        });
    }

    function drawPlotAndPoint(x, y, r) {
        const point_data = {
            x: [parseFloat(x)],
            y: [parseFloat(y)],
            mode: 'markers',
            marker: {color: 'red', size: 10},
            name: 'Выбранная точка'
        };

        const plotInfo = getPlot(r);
        plotInfo.push(point_data);
        drawPlot(plotInfo, r);
    }

    function getPlot(r) {
        const rect_data = {
            x: [-r, -r, 0, 0, -r],
            y: [0, r, r, 0, 0],
            fill: "toself",
            fillcolor: 'rgba(0,100,255,0.6)',
            line: {color: 'rgba(0,0,0,0)'},
            type: 'scatter',
            name: 'rect'
        };

        const triangle_data = {
            x: [0, 0, r / 2, 0],
            y: [0, -r / 2, 0, 0],
            fill: "toself",
            fillcolor: 'rgba(0,100,255,0.6)',
            line: {color: 'rgba(0,0,0,0)'},
            type: 'scatter',
            name: 'triangle'
        };

        const theta = Array.from({length: 100}, (_, i) => -Math.PI + (Math.PI/2) * i / 99);
        const circle_x = theta.map(angle => (r / 2) * Math.cos(angle));
        const circle_y = theta.map(angle => (r / 2) * Math.sin(angle));
        const circle_data = {
            x: [0, ...circle_x, 0],
            y: [0, ...circle_y, 0],
            fill: "toself",
            fillcolor: 'rgba(0,100,255,0.6)',
            line: {color: 'rgba(0,0,0,0)'},
            type: 'scatter',
            name: 'circle'
        };
        
        return [rect_data, triangle_data, circle_data];
    }

    function drawPlot(data, r) {
        const layout = {
            title: 'Область для проверки точки',
            xaxis: {
                title: 'Y',
                range: [-r - 1, r + 1],
                zeroline: true,
                zerolinecolor: 'black',
                zerolinewidth: 2,
                gridcolor: 'lightgrey',
            },
            yaxis: {
                title: 'X',
                range: [-r - 1, r + 1],
                zeroline: true,
                zerolinecolor: 'black',
                zerolinewidth: 2,
                gridcolor: 'lightgrey',
                scaleanchor: 'x'
            },
            showlegend: false,
            width: 400,
            height: 400
        };

        const graphContainer = document.getElementById('graph');
        graphContainer.innerHTML = '<div id="external" style="width: 100%; height: 100%;"></div>';
        
        Plotly.newPlot('external', data, layout);
    }

    // Валидация формы
    function validateForm(x, y, r) {
        const xError = document.getElementById('xError');
        const yError = document.getElementById('yError');
        const rError = document.getElementById('rError');
        
        // Сброс ошибок
        xError.style.display = 'none';
        yError.style.display = 'none';
        rError.style.display = 'none';

        let isValid = true;

        // Проверка X
        if (!x) {
            xError.style.display = 'block';
            isValid = false;
        }

        // Проверка Y
        const yNum = parseFloat(y);
        if (isNaN(yNum) || yNum < -3 || yNum > 5) {
            yError.style.display = 'block';
            isValid = false;
        }

        // Проверка R
        const rNum = parseFloat(r);
        if (isNaN(rNum) || rNum < 1 || rNum > 4) {
            rError.style.display = 'block';
            isValid = false;
        }

        return isValid;
    }

    function playClearSound() {
        const sound = document.getElementById('clearSound');
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(error => {
                console.log('Не удалось воспроизвести звук:', error);
            });
        }
    }

    // Обработчик отправки формы
    form.addEventListener('submit', function(event) {
    event.preventDefault();

    const x = document.querySelector('#xSelect')?.value;
    console.log(x)
    const y = document.getElementById('y').value;
    const r = document.getElementById('r').value;

    if (!validateForm(x, y, r)) {
        return;
    }

    // Отправка данных в формате JSON
    fetch('/api/check', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ x, y, r })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error) });
        }
        return response.json();
    })
    .then(data => {
        updateTable(data.history);
        const lastItem = data.history[data.history.length - 1];
        drawPlotAndPoint(lastItem.x, lastItem.y, lastItem.r);
    })
    .catch(error => {
        console.error('Ошибка:', error);
        alert("Ошибка: " + error.message);
    });
});


    // Обработчик очистки истории
    clearHistoryBtn.addEventListener('click', function() {
        playClearSound();

        fetch('/api/clear-history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка при очистке истории');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                updateTable([]);
                drawPlot(getPlot(1), 1);
                alert('История очищена');
            }
        })
        .catch(error => {
            console.error('Ошибка очистки истории:', error);
            alert('Ошибка при очистке истории: ' + error.message);
        });
    });

    // Инициализация
    loadHistory();
});