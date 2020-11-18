from browser import document, window
from tokenize import tokenize, NL
from io import BytesIO
import sys


class ConsoleOutput:
    def __init__(self):
        self.console = document['console']

    def write(self, text):
        self.console.text += text
        self.console.scrollTop = self.console.scrollHeight


def unwrap(code):
    unwrapped = ""
    g = tokenize(BytesIO(code.encode('utf-8')).readline)

    for toknum, tokval, (srow, scol), (erow, ecol), line in g:
        if tokval == '\n':
            if toknum != NL:
                unwrapped += line
            else:
                unwrapped += line[:-1]
    return unwrapped


def format(code, delay):
    code = code.replace('def', 'async def')
    code = code.replace('paint_vertex', 'window.paint_vertex')
    code = code.replace('paint_edge', 'window.paint_edge')

    lines = code.split('\n')
    formatted = TEMPLATE
    formatted += 'async def main():\n'
    for line in lines:

        if line.strip() != '' and not any(keyword in line for keyword in ['def', 'for', 'while', 'return']):
            indentation = ' ' * int((len(line) - len(line.lstrip())))
            formatted += '\t' + indentation + \
                'await aio.sleep({})\n'.format(delay)
        formatted += '\t' + line + '\n'

    formatted += 'aio.run(main())'

    return formatted


TEMPLATE = """from browser import document, window, aio

GRAPH = {}
for node in window.graph:
    GRAPH[node] = []
    for edge in window.graph[node]:
        GRAPH[node].append({'head': edge[0], 'cost': edge[1]})

"""


def run(event):
    code = format(document.querySelector(
        ".CodeMirror").CodeMirror.getValue(), document["slider"].attrs['value'])
    exec(code)


document["run-button"].bind("click", run)
sys.stdout = ConsoleOutput()
