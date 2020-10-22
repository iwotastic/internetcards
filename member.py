import asyncio
from utils import send_object, recv_object

class Member:
  def __init__(self, ws, name):
    self.ws = ws
    self.name = name

    self.hand = []
    self.handLimit = 7

    self.score = 0

    self.queuedBroadcasts = asyncio.Queue()
    self.queuedReplys = asyncio.Queue()

    self.chatMessageHandler = None

  def fillHand(self, deck):
    while len(self.hand) < self.handLimit:
      self.hand.append(deck.pop())

  async def addObj(self, obj):
    await self.queuedBroadcasts.put(obj)

  async def getObj(self):
    return await self.queuedReplys.get()

  async def manualBroadcast(self):
    await send_object(self.ws, await self.queuedBroadcasts.get())

  async def broadcastLoop(self):
    while True:
      await self.manualBroadcast()

  async def manualRead(self):
    obj = await recv_object(self.ws)
    if "action" in obj and obj["action"] == "sendChat" and self.chatMessageHandler != None:
      await self.chatMessageHandler(obj, self)
    else:
      await self.queuedReplys.put(obj)

  async def readLoop(self):
    while True:
      await self.manualRead()

  async def runGameLoop(self):
    broadcastLoop = asyncio.ensure_future(self.broadcastLoop())
    readLoop = asyncio.ensure_future(self.readLoop())

    done, pending = await asyncio.wait([broadcastLoop, readLoop], return_when=asyncio.FIRST_COMPLETED)
    for task in pending:
      task.cancel()