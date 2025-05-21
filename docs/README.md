# Lawrence's Big 2 (Dai Di) Ruleset

## Bot Setup
1. Clone the repo
```
git clone https://github.com/Hackari/wholesome.git
cd wholesome
```
2. Install dependencies
```
npm i
```
3. Development
```
npm run dev 
```
> recompiles and restarts the bot on file change

4. Build
```
npm run build
npm run start
```
> builds and starts the bot

---

## 🎯 Objective
Clear all your cards before the other players. The game ends when **only one player still has cards**. Ranks are determined by the order in which players clear their hands.

---

## 🃏 Game Setup
- **Players**: 4
- **Deck**: Standard 52-card deck
- **Deal**: Each player receives 13 cards
- **First move**: The player with the **3♦** starts and **must** play it as the opening move

---

## 🔁 Game Flow
- Play proceeds **clockwise**
- Cards can be played as:
  - **Singles**: one card
  - **Pairs**: two cards of the same rank
  - **Sets**: poker-style 5-card combinations (see `Valid Sets` section below)
- The type of card played (single/pair/set) sets the pattern for the round
- Players must beat the previous play with a **higher value** of the same pattern, or pass
- Round ends when 3 players pass consecutively
- The last player to play a card gains "control" and can play any valid single/pair/set to start the next round

---

## 📏 Card Ranking
- Card values (lowest to highest):  
  `3 < 4 < 5 < ... < K < A < 2`
- Suit values (lowest to highest):  
  `♦ < ♣ < ♥ < ♠`
- For same rank cards, suit decides the winner
- **Pairs**: Highest rank in the pair decides the winner; suit decides ties
- **Players cannot end on a single 2**

---

## 🧱 Valid Sets (5-card combinations)
Ranked from lowest to highest:

### 1. **Straight**
- 5 consecutive cards, different suits
- Value = highest card
- Exception: `2-3-4-5-6` is **lower** than `3-4-5-6-7` and judged by the **6's suit**

### 2. **Flush**
- 5 cards of the same suit, not in sequence
- Value = suit first, then highest card in flush

### 3. **Full House**
- 3-of-a-kind + pair
- Value determined by the rand of the 3-of-a-kind

### 4. **Four of a Kind**
- 4-of-a-kind + card
- Value determined by the rank of the 4-of-a-kind

### 5. **Straight Flush**
- 5 consecutive cards of the same suit, straight and flush
- Value determined by the **suit**

### 6. **Royal Flush**
- Must be exactly: `10-J-Q-K-A` of same suit
- Always ranked higher than any other straight flush

---

## 🔚 End of Round
- A player may pass if they cannot or do not want to play
- A round ends when all others pass
- Last player who played gains **control** of the next round

---

## 🏆 End of Game
- The **first player** to clear all cards is the **winner**
- Play continues for 2nd and 3rd place
- The **last player with cards** comes in last
- Game ends when only **one player** remains with cards

---

## 📌 Special Rules

### ❌ Disallowed:
- **3-of-a-kind not allowed** unless part of a full house
- **Cannot end** on a **single 2**
- **Cannot view** discard pile

### ⚠️ Must:
- Declare when you have **one card left**
- Reveal card count **when prompted**

---

## 🔄 Reshuffle Conditions
A reshuffle occurs when:

1. **3 out of 4 players vote** for a reshuffle  
2. A player holds **all four 2s**
3. A player has **≤6 material points** and opts to reshuffle  
   - Point values:
     - J = 1  
     - Q = 2  
     - K = 3  
     - A = 4  
     - 2 = 5  
     - Others = 0  
   - Suit does **not** matter
   - Player may choose not to reshuffle if eligible

---

## 🧠 Example Plays

- If `3♦` is played as a single, the rest of the round must be singles.
- If `3♦` + `3♣` is played, the round requires **pairs**
- If `3♦` is part of a straight, the round must follow **sets**

---

## 📝 Notes

- When playing pairs/sets, always compare the **highest** card
- For straights, suit of the **highest card** (or 6 in case of 23456) is the tie-breaker
- A Royal Flush **beats** any other set
