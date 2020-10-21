<div align="center"><img src="logo.png" alt="Ian's Internet Cards" width="300"></div>
<div align="center">An internet-based, Cards Against Humanity-inspired party game.</div>
<div align="center">
  <a href="https://internetcards.ianmorrill.com">Play It!</a> |
  <a href="https://github.com/iwotastic/internetcards/issues/new">Report A Bug</a> |
  <a href="https://github.com/iwotastic/internetcards/wiki">Learn More...</a>
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
| `iic_cards.csv`, `iic_cards.json` | Provide card data for the game, use `python form_csv_sorter.py` to generate `iic_cards.json`. |
| `index.html`, `script.js`, `style.css` | Files loaded by the web that communicate with the Python-based WebSockets server. |
| `main.py` | The file run to start the WebSockets server. |
| All other python files | Get included by `main.py` to run the server. |