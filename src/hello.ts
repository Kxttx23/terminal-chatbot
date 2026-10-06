// src/hello.ts
//
// Evening 2 lab: your first real call to an LLM. Run it with `pnpm hello`.
//
// Look at that script in package.json before you run it:
//   "hello": "tsx --env-file=.env src/hello.ts"
// `--env-file=.env` is `tsx` loading every line of your local `.env` file
// into the process's environment *before* this file executes. That's the
// whole mechanism — there is no other wiring. If `.env` is missing, or the
// key inside it is missing or wrong, this file still runs; the failure
// shows up below, when the API call itself is rejected.
import OpenAI from "openai";

// `new OpenAI()` with no arguments reads the API key from the
// OPENAI_API_KEY environment variable automatically — that's the variable
// name in `.env.example`. You never type the key itself in this file.
const client = new OpenAI();

async function main() {
  const response = await client.chat.completions.create({
    // "gpt-5-mini" is this series' default model tier (see
    // CONVENTIONS.md#models) — good quality, fast, cheap. Use it unless a
    // later lab gives you a specific reason to reach for something else.
    model: "gpt-5-mini",
    // `max_completion_tokens` is a ceiling on everything the model
    // generates for this reply — and on this model family that includes
    // the *reasoning* tokens it spends thinking before it writes a word,
    // not just the visible answer. Those reasoning tokens are billed and
    // counted but never shown to you. Set the ceiling too low and the
    // model can burn the entire budget reasoning and hand back an empty
    // `content` with `finish_reason: "length"` — a reply that cost you
    // money and says nothing. So: a generous ceiling (2000, far more than
    // two sentences needs) plus `reasoning_effort: "low"`, which tells the
    // model not to spend much on thinking for a task this simple. Between
    // them there is always room left for the answer itself.
    max_completion_tokens: 2000,
    reasoning_effort: "low",
    messages: [
      { role: "user", content: "Explain what an AI agent is in two sentences." },
    ],
  });

  // The SDK's response shape mirrors the OpenAI REST API: `choices` is an
  // array (you only asked for one reply, so index 0 is it), and the reply
  // text you want is nested at .message.content.
  console.log(response.choices[0].message.content);
}

main();
