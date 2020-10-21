import json

class DeckManager:
  __default = False

  @staticmethod
  def default():
    if DeckManager.__default:
      return DeckManager.__default
    else:
      DeckManager.__default = DeckManager()
      return DeckManager.__default
  
  def __init__(self):
    self.packs = None
    with open("./iic_cards.json", "r") as cardFile:
      self.packs = json.load(cardFile)
  
  def listPacks(self):
    return self.packs.keys()

  def getQuestions(self, pack):
    return self.packs[pack]["questions"]

  def getAnswers(self, pack):
    return self.packs[pack]["answers"]