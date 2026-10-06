// src/hello.ts
//
// Simple terminal chatbot using OpenAI.
// Run with:
//   pnpm hello

import OpenAI from "openai";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

const client = new OpenAI();

const rl = readline.createInterface({
  input,
  output,
});

// Conversation history.
// Keeping previous messages allows the chatbot to remember
// what was said earlier in the conversation.
const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "You are a helpful, friendly chatbot. Answer clearly and concisely.",
  },
];

async function chat(userMessage: string) {
  // Add the user's message to the conversation
  messages.push({
    role: "user",
    content: userMessage,
  });

  const response = await client.chat.completions.create({
    model: "gpt-5-mini",

    max_completion_tokens: 2000,
    reasoning_effort: "low",

    messages,
  });

  const assistantMessage = response.choices[0].message.content;

  if (!assistantMessage) {
    throw new Error("The model returned an empty response.");
  }

  // Save the assistant's response so the model
  // remembers it in future turns.
  messages.push({
    role: "assistant",
    content: assistantMessage,
  });

  return assistantMessage;
}

async function main() {
  console.log("🤖 Simple AI Chatbot");
  console.log("Type 'exit' or 'quit' to stop.\n");

  while (true) {
    const userMessage = await rl.question("You: ");

    const trimmedMessage = userMessage.trim();

    if (!trimmedMessage) {
      continue;
    }

    if (
      trimmedMessage.toLowerCase() === "exit" ||
      trimmedMessage.toLowerCase() === "quit"
    ) {
      console.log("\nGoodbye! 👋");
      break;
    }

    try {
      const reply = await chat(trimmedMessage);

      console.log(`\nAI: ${reply}\n`);
    } catch (error) {
      console.error("\n❌ Error:", error);
      console.log("Please check your API key and try again.\n");
    }
  }

  rl.close();
}

main();