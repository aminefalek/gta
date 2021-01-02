from browser import document, window
import sys

TAB = ' ' * 4


class ConsoleOutput:
    def __init__(self):
        self.console = document['console']

    def write(self, text):
        self.console.text += text
        self.console.scrollTop = self.console.scrollHeight


def format_code(code, delay):
    code = code.replace('def', 'async def')
    code = code.replace('paint_vertex', 'window.paint_vertex')
    code = code.replace('paint_edge', 'window.paint_edge')

    line_number = 0
    lines = [line for line in code.split('\n') if line.strip() != '']
    formatted = "from browser import document, window, aio\n"
    formatted += "GRAPH = window.graph.to_dict()\n"
    formatted += 'async def main():\n'

    for line in lines:
        indentation = ' ' * ((len(line) - len(line.lstrip())))
        formatted += '{}while ((not window.step and window.paused) or (window.step and window.step != window.highlightedLine)): await aio.sleep(0.1)\n'.format(
            TAB + indentation)
        formatted += '{}if (not window.executing): return\n'.format(
            TAB + indentation)
        formatted += '{}window.resetLine(window.highlightedLine)\n'.format(
            TAB + indentation)
        formatted += '{}window.highlightLine({})\n'.format(
            TAB + indentation, line_number)
        formatted += '{}await aio.sleep({})\n'.format(TAB + indentation, delay)
        formatted += '{}{}\n'.format(TAB, line)
        line_number += 1

    formatted += 'aio.run(main())'
    return formatted


def run(event):
    if (not window.executing):
        window.executing = True
        code = format_code(document.querySelector(
            ".CodeMirror").CodeMirror.getValue(), document["slider"].attrs['value'])
        exec(code)


document["run-button"].bind("click", run)
sys.stdout = ConsoleOutput()
