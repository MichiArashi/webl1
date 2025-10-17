import sys

from figure.point import Point
from figure.triangle import Triangle
from figure.circle import Circle
from figure.rectangle import Rectangle
from figure.abstract_axis import AbstractAxis

from flask import Flask, request, jsonify, render_template
import time

app = Flask(__name__)

history = []

@app.route('/api/history', methods=['GET'])
def get_history():
    return jsonify({'history': history})


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/check', methods=['POST'])
def check_point():
    start_time = time.time()

    try:
        # Получаем данные из JSON тела запроса
        data = request.get_json()
        x = float(data.get('x'))
        y = float(data.get('y'))
        r = float(data.get('r'))

        if r <= 0 or r > 4:
            return jsonify({'error': 'Invalid R. R must be between 1 and 4.'}), 400
        if y < -3 or y > 5:
            return jsonify({'error': 'Invalid Y. Y must be between -3 and 5.'}), 400
        valid_x = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2]
        if x not in valid_x:
            return jsonify({'error': 'Invalid X value.'}), 400

        print(x, y, r)
        abstract_axis = AbstractAxis(Triangle(radius=r), Circle(radius=r), Rectangle(radius=r))
        is_hit = abstract_axis.check_points(Point(x, y))

        current_time = time.strftime('%H:%M:%S', time.localtime())
        script_execution_time = round((time.time() - start_time) * 1000, 4)

        result = {
            'x': x,
            'y': y,
            'r': r,
            'hit': is_hit,
            'currentTime': current_time,
            'executionTime': script_execution_time
        }

        history.append(result)

        return jsonify({'history': history})

    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid input data. Please provide numbers.'}), 400


@app.route('/api/clear-history', methods=['POST'])
def clear_history():
    try:
        history.clear()
        return jsonify({'success': True, 'message': 'History cleared successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':

    debug = False
    port = 3231

    try:
        if len(sys.argv) == 2:
            port = int(sys.argv[1])
    except Exception as exp:
        print("Error with port! It have to be a number!")

    try:
        if len(sys.argv) >= 3:
            port = int(sys.argv[1])
            debug = True if sys.argv[2] == "True" else False
    except Exception as exp:
        print("Error with port or debug mode!")

    print(f"Server started!\nPort: {port}\nDebug: {debug}\npython main.py {port} {debug}")

    app.run(debug=debug, port=port)