from figure.point import Point
from figure.figure import Figure


class Rectangle(Figure):
    def __init__(self, radius: float):
        super().__init__()
        self.radius = radius

    def check_point(self, point: Point) -> bool:
        return -self.radius <= point.x <= 0 <= point.y <= self.radius