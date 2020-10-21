import json

async def send_object(ws, obj):
  await ws.send(json.dumps(obj))

async def recv_object(ws):
  data = await ws.recv()
  try: 
    res = json.loads(data)
    return res
  except json.JSONDecodeError as e:
    return {}