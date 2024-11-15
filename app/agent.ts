// agent.ts

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatOpenAI } from "@langchain/openai";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph/web";  // Must use the web version to run in the browser!

import { OPENAI_API_KEY, TAVILY_API_KEY } from "./config";

// Define the tools for the agent to use
const tools = [new TavilySearchResults({ maxResults: 3, apiKey: TAVILY_API_KEY })];
const toolNode = new ToolNode(tools);

// Create a model and give it access to the tools
const model = new ChatOpenAI({
    apiKey: OPENAI_API_KEY,
    model: "gpt-4o-mini",
    temperature: 0,
}).bindTools(tools);

// Define the function that determines whether to continue or not
function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
    const lastMessage = messages[messages.length - 1];

    // If the LLM makes a tool call, then we route to the "tools" node
    if (lastMessage.additional_kwargs.tool_calls) {
        return "tools";
    }
    // Otherwise, we stop (reply to the user) using the special "__end__" node
    return "__end__";
}

// Define the function that calls the model
async function callModel(state: typeof MessagesAnnotation.State) {
    const response = await model.invoke(state.messages);

    // We return a list, because this will get added to the existing list
    return { messages: [response] };
}

// Define a new graph
const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addEdge("__start__", "agent") // __start__ is a special name for the entrypoint
    .addNode("tools", toolNode)
    .addEdge("tools", "agent")
    .addConditionalEdges("agent", shouldContinue);

// Finally, we compile it into a LangChain Runnable.
export const agent = workflow.compile();
