# w1-first-call

Evening 2's lab for Bootcamp 1 — Foundations. You'll write a TypeScript
program that calls an LLM and prints the reply, and you'll learn to keep
your API key out of source control while you do it.

## Secrets before code — the rule, and how to practise it

Before you write anything, a rule you will use for the rest of your
career: **`.gitignore` before `.env`, every time.**

A `.gitignore` that excludes `.env` has to exist *before* an `.env` file
ever does. If it doesn't, there is a window — sometimes seconds,
sometimes days — where a real key can be staged and committed by
accident. And once a secret is in git history it is *in* git history:
deleting the file in a later commit does not remove it, and rotating the
key is the only real fix.

This lab already ships with its `.gitignore` in place, so there is
nothing to order here. Practise the ordering where it actually counts —
in the repo you create for your capstone this week:

```bash
mkdir my-capstone && cd my-capstone
git init
printf 'node_modules/\n.env\n' > .gitignore
git add .gitignore
git commit -m "chore: ignore secrets before writing any code"
git log --oneline
```

One commit, and it is the `.gitignore`. That is the habit. Everything you
add after that line is protected; anything you had added before it would
not have been.

## Setup

```bash
pnpm install
cp .env.example .env
```

Open `.env` and set your real key:

```
OPENAI_API_KEY=sk-...your-key...
```

`.env` is already covered by `.gitignore` — check it yourself:

```bash
git check-ignore -v .env
```

If that prints a line pointing at `.gitignore`, you're safe: git will
refuse to track `.env` even if you `git add .`. If it prints nothing,
**stop and fix your `.gitignore` before going any further.**

> Say it out loud once: your API key is a password. If it reaches a public
> GitHub repo, anyone can spend your money on it. `.env` is how you keep
> that from happening — never paste a key directly into `hello.ts` or any
> other file that gets committed.

## Run it

```bash
pnpm hello
```

With a real, funded key in `.env`, you should see a real two-sentence
answer printed to your terminal — that's a live model reply.

**No key yet?** You'll still see this fail, and exactly how it fails tells
you what's still missing:

- `.env` left blank (`OPENAI_API_KEY=` with nothing after it) →
  `OpenAIError: Missing credentials` — the SDK never found a key at all.
- `.env` filled with a fake or expired value → `AuthenticationError: 401
  Incorrect API key provided` — the key reached OpenAI's servers and was
  rejected there.

Neither is a bug in this lab — both are proof everything *except* the key
itself is wired correctly: the `.env` file loaded, the SDK found (or
didn't find) the `OPENAI_API_KEY` variable, and the request reached the
right place. Drop in a real, funded key and the same run should print an
actual reply instead.

### The third failure: it succeeds and prints nothing

There is one more way this can go wrong, and it looks nothing like the two
above — no error, no stack trace, just a blank line where the reply should
be. That's an empty `content` with `finish_reason: "length"`.

On this model family, `max_completion_tokens` bounds the model's *reasoning*
tokens as well as its visible output. If that budget is too small, the model
can spend all of it thinking and have nothing left to say out loud: the call
succeeds, you're billed for it, and `response.choices[0].message.content`
comes back empty or `null`. `src/hello.ts` sets a deliberately generous
budget together with `reasoning_effort: "low"` to keep this from happening —
if you lowered either while experimenting, that's the first thing to put
back.

To confirm the diagnosis rather than guess at it, print the two fields that
say so directly:

```ts
console.log(response.choices[0].finish_reason);
console.log(response.usage);
```

A `finish_reason` of `"length"` alongside a large
`completion_tokens_details.reasoning_tokens` in `usage` is the signature:
the budget was spent, and it was spent on reasoning.

## Check your types

```bash
pnpm typecheck
```

Runs `tsc --noEmit` — reports any type errors without producing output
files. Should report nothing.

## What's actually happening in `hello.ts`

Open `src/hello.ts` and read the comments top to bottom — they walk
through why `--env-file=.env` matters, how the SDK picks up your key
without you ever writing it in code, and what shape the response comes
back in. You don't need to memorize the response shape; you'll see this
same call pattern again in Week 2 to make the prompt more deliberate.

## Where this goes next

Week 2's prompting lab (`w2-prompting`) is its own standalone project —
not an edit to this one — but it reuses this exact call pattern: same
`--env-file=.env` mechanism, same `new OpenAI()` with no arguments, same
`.choices[0].message.content` shape. What's new there is structure around
the same kind of call, not a new project layout.
