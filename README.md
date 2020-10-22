<div align="center"><img src="logo.png" alt="Ian's Internet Cards" width="300"></div>
<div align="center">An internet-based, Cards Against Humanity-inspired party game.</div>
<div align="center">
  <a href="https://internetcards.ianmorrill.com">Play It!</a> |
  <a href="https://github.com/iwotastic/internetcards/issues/new">Report A Bug</a>
</div>

---

## Running Locally
Clone the repo to your own computer and run the following (or the equivalent if on Windows) to set up Ian's Internet Cards:
```bash
# Initialize the venv
python3 -m venv .

# Activate the venv
source ./bin/activate

# Install requirements with pip
pip install -r ./requirements.txt
```

To run Ian's Internet Cards on your own machine run the following:
```bash
# Start the webserver
python3 -m http.server 8000

# Start the WebSockets server (in another terminal)
python3 main.py

# Now you can go to http://127.0.0.1:8000 to try it out.
```

## Code Organization
| Files | What do they do? |
|-------|---------|
| `iic_cards.json` | Provides raw machine-readable cards for Ian's Internet Cards. |
| `index.html`, `script.js`, `style.css` | Files loaded by the web that communicate with the Python-based WebSockets server. |
| `main.py` | The file run to start the WebSockets server. |
| `member.py` | A class that encapsulates all state of a member of a game room. |
| `deck_manager.py` | A singleton that keeps the main deck from `iic_cards.json` in memory. |
| `game_manager.py` | A class that encapsulates game state and is associated with the creator of a room. |
| `utils.py` | Contains utility function that make sending JSON data less annoying. |