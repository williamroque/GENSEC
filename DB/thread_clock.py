import datetime
import threading

import time

class ThreadClock(threading.Thread):
    def __init__(self, callback):
        super().__init__()
        self.time_max = 5
        self.callback = callback

    def reset(self):
        self.t_begin = datetime.datetime.now()

    def clock_loop(self):
        t_offset = datetime.datetime.now() - self.t_begin

        if t_offset.seconds >= self.time_max:
            self.callback()
            return

        time.sleep(1)
        self.clock_loop()

    def run(self):
        self.t_begin = datetime.datetime.now()
        self.clock_loop()
