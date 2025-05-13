# 🎨 Daidi Game Design

## 💰 Economy
- The game will operate on a **zero-sum economy**
- Detailed rules for **money distribution** after each game are **TBD (To Be Decided)**

---

## 🕹️ Game Representation

### 📦 Card Array
- The game state is represented using a **length-52 array**
- Each index corresponds to a specific card:
  - **Index 0** → `3♦`
  - **Index 51** → `2♠`

### 🂠 Card Mapping
- **Suit** of a card = `index % 4`
  - `0 → ♦`, `1 → ♣`, `2 → ♥`, `3 → ♠`
- **Value** of a card = `(index // 4) + 3`
  - Special mapping:
    - `11 → J`
    - `12 → Q`
    - `13 → K`
    - `14 → A`
    - `15 → 2`

---

## 🧍 Player Win Condition
- Each player tracks their **card count**
- When a player's **card count reaches 0**, they are declared a **winner**

---

Possible follow-ups:
1. Define the card validation function using this array model
2. Implement zero-sum distribution logic for post-game economy
3. Extend data model for multiplayer + tournament support

HAND  
ChadGPT  
Replies to this chat will be posted as a reply to the announcement, which will be seen by everyone in the chat.
