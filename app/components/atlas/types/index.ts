export interface Message {
    id: string;
    role: "assistant" | "user";
    content: string;
}
