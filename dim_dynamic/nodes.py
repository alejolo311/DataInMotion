#!/usr/bin /python3
"""
Flask web server
"""


from flask import Flask
from flask_cors import CORS
from models import storage
from flask import render_template
from models.custom import CustomNode
import uuid
import json


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/boards/<board_id>', methods=['GET'], strict_slashes=False)
def board(board_id):
    """
    return a view for the board
    """
    return render_template('board.html', id=str(uuid.uuid4()), board_id=board_id)


@app.route('/nodes/<user_id>', methods=['GET'], strict_slashes=False)
def nodes(user_id):
    """
    return a list of nodes
    """
    nodes = storage.all(CustomNode)
    parsed = []
    for node in nodes.values():
        nd = json.loads(node.to_dict())
        nd['connections'] = []
        for n in nodes.values():
            for inp in json.loads(n.innodes):
                if inp == node.id:
                    nd['connections'].append((inp, 'in'))
            for inp in json.loads(n.outnodes):
                if inp == node.id:
                    nd['connections'].append((inp, 'out'))
        parsed.append(nd)
    war_cols = ['#cc3300', '#ff9966', '#ffcc00', '#99cc33', '#339900']
    pastel_rainbow = ['#a8e6cf', '#dcedc1', '#ffd3b6', '#ffaaa5', '#ff8b94']
    data = ['#010743', '#FE038C', '#FB7500', '#FEE70B', '#8AB6FE']
    cols = ['#f32e9c', '#932989', '#9bfa18', '#ef912f', '#f9463a', ]
    cols.extend(war_cols)
    cols.extend(pastel_rainbow)
    cols.extend(data)
    template = render_template('node.html', nodes=parsed, id=str(uuid.uuid4()), colors=cols)
    return template



if __name__ == '__main__':
    app.run(host='0.0.0.0', port='8001')