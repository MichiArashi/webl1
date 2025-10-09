from figure.point import Point
from figure.figure import Figure


class Triangle(Figure):
    def __init__(self, radius: float):
        super().__init__()
        self.radius = radius

    def check_point(self, point: Point) -> bool:
        return -point.x <= 0 and 0 >= point.y >= point.x - self.radius/2
