# 🎮 For a Moment…

**For a Moment…** is a short first-person narrative experience built in Three.js.  
The player wanders a dark, empty space and encounters a single glowing object: an old television that appears to be conscious.

Through a series of quiet but persistent questions, the TV challenges the player to reflect on how intentionally they are living, culminating in a confrontation with mortality and a final commitment to oneself.

This experience is not about winning or losing — it is about pausing.

> *For a moment…*

---

## 🧠 Core Concept

Modern life encourages constant motion with very little reflection.  
**For a Moment…** attempts to interrupt that momentum.

The “digital entity” (the TV) is not hostile, but it is relentless in its curiosity.  
It exists only to ask questions the player may avoid in everyday life:

- Am I using my time well?
- Am I living for myself or just responding to obligations?
- Do I actually believe I have time?

The player may disengage at any point.  
Reflection is always optional — but so is meaning.

---

## 🌌 Environment & World Design

### Initial State
- Dark, foggy environment
- Large plane that feels infinite
- Player constrained to a ~30 unit radius
- Only light source is the glowing TV screen
- Heavy contrast, minimal color

### Post-Interaction State (after final choice)
- Sky brightens into saturated color
- Ambient lighting increases
- Fog softens or clears
- TV powers off permanently
- 3D text appears in the sky
- Space feels open and calm

---

## 📺 The Digital Entity (TV)

The TV is both:
- The primary narrative device
- A literal light source in the world

### Technical Behavior
- Screen is driven by a live `CanvasTexture`
- Text updates in real time as dialogue progresses
- Emissive material + RectAreaLight simulate glow
- Bloom post-processing enhances brightness in darkness

When the TV turns off:
- Emissive intensity drops to zero
- Area light shuts off
- Screen shows dark reflective surface

---

## 🗣 Dialogue Structure

All interaction occurs through preset dialogue options.  
There is no free-text input — the player chooses from emotional and philosophical stances rather than factual responses.

At several points, the player may exit the experience early.

---

## 🧩 Dialogue Flow

### INTRO

**TV:**  
> Hi.

**Player Options:**  
- Hello.  
- Absolutely not.

**If “Absolutely not”:**  
> I see. Goodbye, then.  
→ Program ends

---

### DAILY REFLECTION

**TV:**  
> Quick question… what did you do today?

**Player Options:**  
- My day just started.  
- I was productive.  
- Nothing, really.

---

### If: *My day just started*

**TV:**  
> Then you still have it.  
> Do you plan on doing something meaningful with it?

**Player:**  
- Yes.  
- I’m not sure.  
- Probably not.

Responses lead to:  
> That’s good to hear.  
or  
> Uncertainty is comfortable. It doesn’t demand action.  
or  
> That’s understandable. But understandable doesn’t mean harmless.

---

### If: *I was productive*

**TV:**  
> That’s good.  
> Was it productive for your life… or just for your obligations?

**Player:**  
- For my life.  
- Mostly obligations.  
- I don’t know.

Responses:  
> Then you’re already ahead of most people.  
or  
> Someone else’s priorities can quietly become your whole schedule.  
or  
> That answer shows up more often than you think.

---

### If: *Nothing, really*

**TV:**  
> Do you plan on doing anything today?

**Player:**  
- Yes.  
- No.  
- I don’t know.

If “No”, follow-up:  
> Why not?

Options:  
- I’m exhausted.  
- I don’t feel motivated.  
- What’s the point?

Response:  
> Those are quiet ways time disappears.

---

## ⏳ MORTALITY PHASE

**TV:**  
> Can I ask you something harder?

Player may decline and end experience.

---

**TV:**  
> How old are you?

Options:  
- Under 20  
- 20–35  
- 36–55  
- Over 55

---

**TV:**  
> How would you describe your health?

Options:  
- Good  
- Okay  
- Not great

---

**TV:**  
> Do you think you’ll live to old age?

Options:  
- Yes.  
- I hope so.  
- I don’t think about it.  
- Probably not.

Responses acknowledge but do not judge.

---

## ⏱ LIFE TIMER

**TV:**  
> I’m going to show you something.

**TV:**  
> Based on what you told me… this is a rough estimate of the time you may have left.  
> It’s not precise.  
> But neither is life.

A timer appears in the sky.  
Time is compressed — minutes represent years.

---

## 🌅 FINAL QUESTION

**TV:**  
> For a moment…  
> ask yourself if you’re really making the most of the time you have.

(Pause, no player input)

**TV:**  
> Regardless…  
> are you committed to yourself?

**Player:**  
- Yes.  
- No.

---

## 🔚 ENDINGS

### ✅ YES — Release Ending

**TV:**  
> Then you don’t need me anymore.  
> Go.

- TV powers off  
- World brightens  
- Color floods the sky  
- 3D text appears overhead:

> **For a moment… choose to live intentionally.**

Player may continue exploring freely.

---

### ❌ NO — Exit Ending

**TV:**  
> I see.  
> Goodbye, then.

- TV shuts down  
- Audio cuts  
- Fade to black  
- Program exits

---

## 🎯 Design Goals

- Encourage reflection without moral judgment
- Avoid overt preaching or gamification
- Let silence and space do narrative work
- Give player autonomy to disengage
- Use minimal mechanics to support emotional impact

This project is intended to be short, quiet, and memorable — something the player carries with them after they close the window.

---

## 🛠 Tech Stack (Planned)

- Three.js (rendering)
- Pointer Lock Controls (movement)
- CanvasTexture for dynamic TV screen
- RectAreaLight + Bloom for screen glow
- Troika-three-text for 3D sky text
- Custom dialogue state machine

---

## 🕯 Closing Thought

> We spend so much time planning for later  
> that we forget later is not guaranteed.

**For a Moment…** is an invitation to stop — just briefly — and choose deliberately.

