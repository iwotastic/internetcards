const isProduction = location.origin === "https://internetcards.ianmorrill.com"

const $ = q => document.querySelector(q)

let ws = new WebSocket(isProduction ? "wss://internetcards.ianmorrill.com/ws" : "ws://127.0.0.1:8765")

function sendObj(obj) {
  ws.send(JSON.stringify(obj))
}

function showScene(scene) {
  document.querySelectorAll(".scene").forEach(el => {
    if (el.getAttribute("data-scene") === scene) {
      el.setAttribute("data-active-scene", "")
    }else{
      el.removeAttribute("data-active-scene")
    }
  })
}

function setNavbar(left, right) {
  if (left) $("#nav-left").textContent = left
  $("#nav-right").textContent = right
}

function copyText(text) {
  let textbox = document.createElement("input")
	textbox.style.position = "fixed"
	textbox.style.top = "0"
	textbox.style.left = "0"
	textbox.style.opacity = "0"
  document.body.appendChild(textbox)

	textbox.value = text
  textbox.select()
  document.execCommand("copy")
  textbox.remove()
}

function addChatMessage(sender, content, color) {
  let msg = document.createElement("div")
  msg.title = "Sent " + (new Date()).toLocaleString()
  msg.className = "message"
  
  let senderText = document.createElement("b")
  senderText.textContent = sender + ": "
  senderText.style.color = color ? color : "#000000"

  let contentText = document.createTextNode(content)

  msg.appendChild(senderText)
  msg.appendChild(contentText)
  $("#message-list").appendChild(msg)

  $("#message-list").scrollTop = $("#message-list").scrollHeight - $("#message-list").clientHeight
}

function setUpPacks(packs) {
  return packs.map(pack => {
    let packLabel = document.createElement("label")
    packLabel.htmlFor = "select-pack-" + pack

    let packLabelText = document.createTextNode(pack)
    packLabel.appendChild(packLabelText)

    let packCheckbox = document.createElement("input")
    packCheckbox.type = "checkbox"
    packCheckbox.id = "select-pack-" + pack
    packLabel.appendChild(packCheckbox)

    $("#mr-packs").appendChild(packLabel)

    return {name: pack, checkbox: packCheckbox}
  })
}
let packs = setUpPacks(["PG", "PG-13", "R"])
let customQuestions = []
let customAnswers = []

function updateCustomCardsEditor() {
  $("#ayoc-questions").textContent = ""
  $("#ayoc-answers").textContent = ""

  customQuestions.forEach((q, i) => {
    const questionRow = document.createElement("tr")

    const questionTextContainer = document.createElement("td")
    const questionText = document.createElement("input")
    questionText.value = q
    questionText.addEventListener("input", e => {
      customQuestions[i] = questionText.value
    })
    questionTextContainer.appendChild(questionText)
    questionRow.appendChild(questionTextContainer)

    const questionRemoverContainer = document.createElement("td")
    const questionRemover = document.createElement("button")
    questionRemover.textContent = "Remove"
    questionRemover.className = "btn danger"
    questionRemover.addEventListener("click", e => {
      customQuestions.splice(i, 1)
      updateCustomCardsEditor()
    })
    questionRemoverContainer.appendChild(questionRemover)
    questionRow.appendChild(questionRemoverContainer)

    $("#ayoc-questions").appendChild(questionRow)
  })

  customAnswers.forEach((q, i) => {
    const answerRow = document.createElement("tr")

    const answerTextContainer = document.createElement("td")
    const answerText = document.createElement("input")
    answerText.value = q
    answerText.addEventListener("input", e => {
      customAnswers[i] = answerText.value
    })
    answerTextContainer.appendChild(answerText)
    answerRow.appendChild(answerTextContainer)

    const answerRemoverContainer = document.createElement("td")
    const answerRemover = document.createElement("button")
    answerRemover.textContent = "Remove"
    answerRemover.className = "btn danger"
    answerRemover.addEventListener("click", e => {
      customAnswers.splice(i, 1)
      updateCustomCardsEditor()
    })
    answerRemoverContainer.appendChild(answerRemover)
    answerRow.appendChild(answerRemoverContainer)

    $("#ayoc-answers").appendChild(answerRow)
  })
}

let addCustomCardsButton = document.createElement("button")
addCustomCardsButton.className = "btn"
addCustomCardsButton.addEventListener("click", e => {
  updateCustomCardsEditor()
  showScene("add-your-own-cards")
})
$("#mr-packs").appendChild(addCustomCardsButton)

let score = 0

$("#make-room").addEventListener("click", e => {
  customQuestions = []
  customAnswers = []
  addCustomCardsButton.textContent = "Add Your Own Cards..."
  showScene("make-room")
})

$("#ayoc-add-question").addEventListener("click", e => {
  customQuestions.push("")
  updateCustomCardsEditor()
})

$("#ayoc-add-answer").addEventListener("click", e => {
  customAnswers.push("")
  updateCustomCardsEditor()
})

$("#ayoc-back").addEventListener("click", e => {
  if (customAnswers.length > 0 || customQuestions.length > 0) {
    addCustomCardsButton.textContent = "Edit Your Cards..."
  }else{
    addCustomCardsButton.textContent = "Add Your Own Cards..."
  }
  showScene("make-room")
})

$("#join-room").addEventListener("click", e => {
  showScene("join-room")
})

$("#mr-back").addEventListener("click", e => {
  showScene("start")
})

$("#jr-back").addEventListener("click", e => {
  showScene("start")
})

$("#hl-back").addEventListener("click", e => {
  showScene("start")
})

$("#rcl-cancel").addEventListener("click", e => {
  window.location.reload()
})

$("#mr-submit").addEventListener("click", e => {
  const name = $("#mr-name").value
  const packsSelected = packs.map(({name, checkbox}) => {
    if (checkbox.checked) {
      return name
    }
  }).filter(pack => !!pack)

  if (name.trim() !== "") {
    sendObj({
      action: "makeRoom",
      name,
      packs: packsSelected,
      questions: customQuestions.map(q => q.replace(/_+/, "[[BLANK]]")),
      answers: customAnswers
    })
  }
})

$("#jr-submit").addEventListener("click", e => {
  const name = $("#jr-name").value
  const joinCode = $("#jr-code").value

  if (name.trim() !== "") {
    if (joinCode.length === 6 && /[0-9]+/.test(joinCode)) {
      sendObj({action: "joinRoom", name, joinCode})
    }
  }
})

$("#rcl-start-game").addEventListener("click", e => {
  sendObj({action: "startGame"})
})

$("#open-chat").addEventListener("click", e => {
  $(".bottom-bar").classList.add("hidden")
  $(".content").classList.remove("sidebar-hidden")
})

$("#close-chat").addEventListener("click", e => {
  $(".bottom-bar").classList.remove("hidden")
  $(".content").classList.add("sidebar-hidden")
})

$("#msg-form").addEventListener("submit", e => {
  e.preventDefault()
  const content = $("#msg-content").value

  if (content.trim() !== "") {
    sendObj({action: "sendChat", content})
    addChatMessage("You", content, "#0000ff")
    $("#msg-content").value = ""
  }
})

ws.addEventListener("open", () => {
  if (/#j\-([0-9]{6})/.test(location.hash)) {
    $("#jr-code").value = location.hash.match(/#j\-([0-9]{6})/)[1]
    location.hash = ""
    showScene("join-room")
  }else{
    showScene("start")
  }
})

ws.addEventListener("close", () => {
  showScene("closed")
})

ws.addEventListener("message", e => {
  const msgObj = JSON.parse(e.data)
  console.log(msgObj)
  if (msgObj.action === "roomMade") {
    score = 0
    setNavbar(msgObj.setName, "Room #" + msgObj.joinCode)

    $("#rcl-code").textContent = msgObj.joinCode
    $("#rcl-members").textContent = ""

    $("#rcl-copy-invite").addEventListener("click", () => {
      copyText(location.origin + location.pathname + "#j-" + msgObj.joinCode)
    })

    showScene("room-creator-lobby")
  }else if (msgObj.action === "roomJoined") {
    score = 0
    setNavbar(msgObj.setName, "Room #" + msgObj.joinCode)

    $("#rjl-members").textContent = ""
    msgObj.members.forEach(m => {
      const memberItem = document.createElement("li")
      memberItem.textContent = m
      $("#rjl-members").appendChild(memberItem)
    })
    showScene("room-joiner-lobby")
  }else if (msgObj.action === "memberJoined") {
    const rjlMemberItem = document.createElement("li")
    rjlMemberItem.textContent = msgObj.name
    $("#rjl-members").appendChild(rjlMemberItem)
    
    const rclMemberItem = document.createElement("li")
    rclMemberItem.textContent = msgObj.name
    $("#rcl-members").appendChild(rclMemberItem)
  }else if (msgObj.action === "memberLeft") {
    ["#rcl-members", "#rjl-members"].forEach(q => {
      $(q).childNodes[msgObj.id].remove()
    })
  }else if (msgObj.action === "gameStart") {
    $(".bottom-bar").classList.remove("hidden")
  }else if (msgObj.action === "newQuestion") {
    setNavbar(null, score + " Point" + (score == 1 ? "" : "s"))
    $("#q-question").textContent = msgObj.question
    $("#q-answers").textContent = ""
    $("#q-judge").textContent = msgObj.judge
    msgObj.hand.forEach(a => {
      const answerContent = document.createElement("div")
      answerContent.textContent = a

      const answerButton = document.createElement("button")
      answerButton.appendChild(answerContent)
      answerButton.addEventListener("click", () => {
        sendObj({action: "answerSubmission", answer: a})
        $("#wfo-question").textContent = msgObj.question
        $("#wfo-answer").textContent = a
        showScene("waiting-for-others")
      })

      $("#q-answers").appendChild(answerButton)
    })
    showScene("question")
  }else if (msgObj.action === "showAnswers") {
    $("#wfj-question").textContent = msgObj.question
    $("#wfj-answers").textContent = ""
    $("#wfj-judge").textContent = msgObj.judge
    msgObj.answers.forEach(a => {
      const answerItem = document.createElement("div")

      const answerCard = document.createElement("div")
      answerCard.classList.add("card")
      answerCard.classList.add("red")
      answerCard.textContent = a

      answerItem.appendChild(answerCard)

      $("#wfj-answers").appendChild(answerItem)
    })
    showScene("waiting-for-judge")
  }else if (msgObj.action === "selectAnswer") {
    $("#j-question").textContent = msgObj.question
    $("#j-answers").textContent = ""
    msgObj.answers.forEach(a => {
      const answerContent = document.createElement("div")
      answerContent.textContent = a

      const answerButton = document.createElement("button")
      answerButton.appendChild(answerContent)
      answerButton.addEventListener("click", () => {
        sendObj({action: "selectedAnswer", answer: a})
      })

      $("#j-answers").appendChild(answerButton)
    })
    showScene("judging")
  }else if (msgObj.action === "chatMessage") {
    addChatMessage(msgObj.from, msgObj.content, "#000000")
  }else if (msgObj.action === "updateScore") {
    score = msgObj.score
    setNavbar(null, score + " Point" + (score == 1 ? "" : "s"))
  }else if (msgObj.action === "judgeSelected") {
    $("#js-question").textContent = msgObj.question
    $("#js-answer").textContent = msgObj.answer
    $("#js-submitted-by").textContent = msgObj.submittedBy
    showScene("judge-selected")
  }else if (msgObj.action === "youAreTheJudge") {
    $("#yatj-question").textContent = msgObj.question
    showScene("you-are-the-judge")
  }else if (msgObj.action === "hostLeft") {
    setNavbar("Ian's Internet Cards", "")
    showScene("host-left")
  }else if (msgObj.action === "preparingGame") {
    showScene("preparing-game")
  }else if (msgObj.action === "error") {
    alert(msgObj.content)
  }
})