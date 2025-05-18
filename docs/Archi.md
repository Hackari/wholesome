# 🃏 Daidi Game - User & Admin Commands

## 🎮 User Commands

### `Start Game`
- Creates a new game lobby
- Prompts user to choose between:
  - **Casual Mode**
  - **Competitive Mode**

### `Join Game`
- Allows up to three other players to join an existing lobby

### `End Game`
- Terminates an ongoing game at any point

### `View Wallet`
- Displays:
  - Total money balance
  - Earned awards (if any)

---

## 🛠️ Administrator Commands

### `Create Tournament`
- Starts a tournament, mode selectable:
  - **Casual**
  - **Competitive**
- The **winner** of the tournament receives a **tournament award**

---

## 🃏 Game Mechanics

- Players may **place bets** before the game begins
- Each player is dealt **13 cards**
- Players can **sort** cards:
  - By **suit**
  - By **high card**
- On their turn, players can play:
  - **One**, **two**, or **five** cards (based on the current round pattern)
- **Validation** ensures that any cards played follow the rules and are a valid move
