
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Bot, User, Send, Loader2 } from 'lucide-react';
import { aiTutorAssistance } from '@/ai/flows/ai-tutor-assistance';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '../ui/card';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const handleAIError = (error: any, newMessages: Message[]) => {
    console.error('AI Tutor Error:', error);
    let errorMessage = 'An unexpected error occurred. Please try again.';
    
    // Convert the whole error to a string and check for keywords.
    const errorString = String(error).toLowerCase();
    
    if (errorString.includes('429') || errorString.includes('quota')) {
      errorMessage = 'The AI tutor has exceeded its daily quota. Please try again tomorrow.';
    } else if (errorString.includes('503') || errorString.includes('overloaded')) {
      errorMessage = 'The AI tutor is currently experiencing high demand. Please try again in a moment.';
    }
    
    return [
      ...newMessages,
      { role: 'assistant' as const, content: `Error: ${errorMessage}` },
    ];
};

export function AITutorWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiTutorAssistance({ query: input });
      setMessages([
        ...newMessages,
        { role: 'assistant', content: response.response },
      ]);
    } catch (error: any) {
      const errorMessages = handleAIError(error, newMessages);
      setMessages(errorMessages);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        size="icon"
        onClick={() => setIsOpen(true)}
      >
        <Sparkles className="h-7 w-7" />
        <span className="sr-only">Open AI Tutor</span>
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" />
              AI Tutor
            </SheetTitle>
            <SheetDescription>
              Ask me anything about SQL, and I'll do my best to help you out!
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-1 pr-4 -mr-6 my-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    message.role === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Bot className="size-5" />
                    </div>
                  )}
                  <Card className={`max-w-xs md:max-w-sm ${message.role === 'user' ? 'bg-secondary' : ''}`}>
                    <CardContent className="p-3 text-sm">
                      <p>{message.content}</p>
                    </CardContent>
                  </Card>
                  {message.role === 'user' && (
                    <div className="flex size-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                      <User className="size-5" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-start gap-3">
                   <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Bot className="size-5" />
                    </div>
                    <Card className="max-w-xs md:max-w-sm">
                      <CardContent className="p-3 text-sm flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Thinking...
                      </CardContent>
                    </Card>
                 </div>
              )}
            </div>
          </ScrollArea>
          <SheetFooter className="mt-auto">
            <div className="relative w-full">
              <Textarea
                placeholder="e.g. What is a FOREIGN KEY?"
                className="pr-12"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute bottom-2 right-2"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send Message</span>
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
