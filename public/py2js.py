from browser import document, window
import sys


class ConsoleOutput:
    def __init__(self):
        self.console = document['console']

    def write(self, text):
        self.console.text += text
        self.console.scrollTop = self.console.scrollHeight


sys.stdout = ConsoleOutput()


def run(event):
    code = 'from browser import document, window\n'
    code += document.querySelector(".CodeMirror").CodeMirror.getValue()
    print('executing..')
    exec(code)


document["run-button"].bind("click", run)

# window.addNode(18)
#window.paint(18, 'red')
