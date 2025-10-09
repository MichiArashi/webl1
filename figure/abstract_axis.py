from figure.point import Point


class AbstractAxis:
    def __init__(self, *figures):
        self.figs = figures
        

    def check_points(self, point: Point):
        for figure in self.figs:
            if figure.check_point(point):
                return True
        return False

    def show(self, point: Point):
        ...