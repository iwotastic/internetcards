import asyncio
from random import randint, shuffle
from utils import send_object, recv_object
from deck_manager import DeckManager

class GameManager:
  def __init__(self, packs, questions=[], answers=[]):
    self.joinCode = "".join(str(randint(0, 9)) for i in range(0, 6))
    self.members = []
    self.questions = []
    self.answers = []
    self.customQuestions = questions
    self.customAnswers = answers
    self.question = ""
    self.status = "open"
    self.judge = 0
    self.packs = packs

  def regenJoinCode(self):
    self.joinCode = "".join(str(randint(0, 9)) for i in range(0, 6))

  def addMember(self, member):
    memberId = len(self.members)
    member.chatMessageHandler = self.handleChatMessage
    self.members.append(member)
    return memberId

  async def broadcastToAll(self, obj):
    for member in self.members:
      await member.addObj(obj)

  async def broadcastToAllExcept(self, doNotInclude, obj):
    for member in self.members:
      if doNotInclude != member:
        await member.addObj(obj)

  async def handleChatMessage(self, obj, member):
    await self.broadcastToAllExcept(member, {
      "action": "chatMessage",
      "from": member.name,
      "content": obj["content"]
    })

  def setUpDecks(self, categories):
    self.questions = self.customQuestions
    self.answers = self.customAnswers
    for category in categories:
      self.questions = self.questions + DeckManager.default().getQuestions(category)
      self.answers = self.answers + DeckManager.default().getAnswers(category)
    shuffle(self.questions)
    shuffle(self.answers)

  def fillAllHands(self):
    for member in self.members:
      if len(self.answers) < 1:
        self.setUpDecks(self.packs)
      member.fillHand(self.answers)

  async def getAnswerFromMember(self, member):
    return {"answerObj": await member.getObj(), "member": member}

  async def getAllAnswers(self):
    membersToWaitFor = self.members[:self.judge] + self.members[self.judge + 1:]
    rawAnswerData = await asyncio.gather(*[self.getAnswerFromMember(m) for m in membersToWaitFor])

    result = []
    for answer in rawAnswerData:
      result.append({"answer": answer["answerObj"]["answer"], "member": answer["member"]})

    return result

  async def getJudgeSelection(self):
    return await self.members[self.judge].getObj()

  async def sendOutNewQuestion(self):
    self.fillAllHands()

    if len(self.questions) == 0:
      self.setUpDecks(self.packs)

    self.question = self.questions.pop().replace("[[BLANK]]", "___")

    for member in self.members:
      if member != self.members[self.judge]:
        await member.addObj({
          "action": "newQuestion",
          "question": self.question,
          "hand": member.hand,
          "judge": self.members[self.judge].name
        })
      else:
        await member.addObj({
          "action": "youAreTheJudge",
          "question": self.question
        })

  def clearSelectedCards(self, answerData):
    for answer in answerData:
      if answer["answer"] in answer["member"].hand:
        answer["member"].hand.remove(answer["answer"])

  async def startGame(self):
    await self.broadcastToAll({"action": "preparingGame"})

    self.judge = randint(0, len(self.members) - 1)
    self.status = "ingame"
    self.setUpDecks(self.packs)

    await self.broadcastToAll({"action": "gameStart"})

    while True:
      await self.sendOutNewQuestion()

      # gets all answer data as objects
      answerData = await self.getAllAnswers()

      # Begin judging
      answersToDisplay = [answer["answer"] for answer in answerData]
      shuffle(answersToDisplay)
      await self.broadcastToAllExcept(self.members[self.judge], {
        "action": "showAnswers",
        "answers": answersToDisplay,
        "question": self.question,
        "judge": self.members[self.judge].name
      })
      await self.members[self.judge].addObj({
        "action": "selectAnswer",
        "answers": answersToDisplay,
        "question": self.question
      })
      judgeSelection = await self.getJudgeSelection()

      # Figure out who the judge picked
      pickedMember = self.members[0]
      for answer in answerData:
        if answer["answer"] == judgeSelection["answer"]:
          pickedMember = answer["member"]
          break

      # Send out selection data
      await self.broadcastToAll({"action": "judgeSelected", "answer": judgeSelection["answer"], "question": self.question, "submittedBy": pickedMember.name})

      # Send out score data
      pickedMember.score += 1
      await pickedMember.addObj({
        "action": "updateScore",
        "score": pickedMember.score
      })

      # Wait a bit
      await asyncio.sleep(5)

      # Get ready for next round
      self.clearSelectedCards(answerData)
      self.judge = (self.judge + 1) % len(self.members)
    