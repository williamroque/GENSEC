import datetime
import threading

import time

class ThreadClock(threading.Thread):
    def __init__(self, callback):
        super().__init__()
        self.callback = callback

    def clock_loop(self):
        try:
            self.callback()
        except Exception:
            return

        time.sleep(1)
        self.clock_loop()

    def run(self):
        self.clock_loop()
