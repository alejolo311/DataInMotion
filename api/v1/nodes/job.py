#!/usr/bin/python3

import sys
import requests

sys.path.append('/usr/src/app')

from api.v1.nodes.nodes import run_node

nodeId = sys.argv[1]

prot = 'http'
domain = 'localhost'
apiPort = ':8080'
print(nodeId)
requests.get(f'{prot}://{domain}{apiPort}/api/v1/nodes/{nodeId}/run')
# res = run_node(nodeId)
# print(res)