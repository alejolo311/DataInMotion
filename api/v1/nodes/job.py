#!/usr/bin/python3

import sys

sys.path.append('/usr/src/app')

from api.v1.nodes.nodes import run_node

nodeId = sys.argv[1]

print(nodeId)
res = run_node(nodeId)
print(res)