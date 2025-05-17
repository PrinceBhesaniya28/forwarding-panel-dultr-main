'use client';

/*eslint-disable*/
import DashboardLayout from '@/components/layout';
import MessageBoxChat from '@/components/MessageBoxChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Bgdark from '@/public/img/dark/ai-chat/bg-image.png';
import Bg from '@/public/img/light/ai-chat/bg-image.png';
import { Database } from '@/types/types_db';
import { User } from '@supabase/supabase-js';
import endent from 'endent';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useState } from 'react';
import { HiMiniPencilSquare, HiSparkles, HiUser } from 'react-icons/hi2';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type Price = Database['public']['Tables']['prices']['Row'];
interface ProductWithPrices extends Product {
  prices: Price[];
}
interface PriceWithProduct extends Price {
  products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

interface Props {
  user: User | null | undefined;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null;
  userDetails: { [x: string]: any } | null;
}
export default function Assistant(props: Props) {
  // *** If you use .env.local variable for your API key, method which we recommend, use the apiKey variable commented below
  // Input States
  const [inputMessage, setInputMessage] = useState<string>('');
  const [submitMessage, setSubmitMessage] = useState<string>('');
  // Loading state
  const [loading, setLoading] = useState<boolean>(false);
  const [open_ai_key, setOpenAIKey] = useState('');
  const [assistant_key, setAssistantKey] = useState('');
  const [assistant, setAssistant] = useState(Object);
  const [thread, setThread] = useState(Object);
  const [res_message, setResMessage] = useState(Object);
  const { theme, setTheme } = useTheme();

  const createPrompt = (inputMessage: string) => {
    const data = (inputMessage: string) => {
      return endent` do me this: 
   ${inputMessage}
  `;
    };

    if (inputMessage) {
      return data(inputMessage);
    }
  };

  const getAssistant = async () => {
    const gptResponse = await fetch(
      'https://api.openai.com/v1/assistants/' +
        process.env.NEXT_PUBLIC_OPENAI_ASSISTANT_KEY,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v1'
        }
      }
    );
    const assistant = await gptResponse.json();
    return assistant;
  };

  const createThread = async () => {
    const gptResponse = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      }
    });
    const thread = await gptResponse.json();
    return thread;
  };

  const createMessage = async (thread_id: string) => {
    const prompt = createPrompt(inputMessage);
    const gptResponse = await fetch(
      'https://api.openai.com/v1/threads/' + thread_id + '/messages',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v1'
        },
        body: JSON.stringify({
          role: 'user',
          // content: topic,
          content: prompt
        })
      }
    );

    const message = await gptResponse.json();
    return message;
  };

  const getMessage = async (thread_id: string, message_id: string) => {
    // https://api.openai.com/v1/threads/{thread_id}/messages/{message_id}

    const gptResponse = await fetch(
      'https://api.openai.com/v1/threads/' + thread_id + '/messages',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v1'
        }
      }
    );

    const message = await gptResponse.json();
    console.log('I get the message.');
    console.log(message);
    return message;
  };

  const runAssistant = async (thread_id: string, assistant_id: string) => {
    const gptResponse = await fetch(
      'https://api.openai.com/v1/threads/' + thread_id + '/runs',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v1'
        },
        body: JSON.stringify({
          assistant_id: assistant_id
        })
      }
    );

    const run_res = await gptResponse.json();
    return run_res;
  };

  const getRunAssistant = async (run_id: string, thread_id: string) => {
    const gptResponse = await fetch(
      'https://api.openai.com/v1/threads/' + thread_id + '/runs/' + run_id,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v1'
        }
      }
    );

    const run_res = await gptResponse.json();
    console.log('I get the status.');
    console.log(run_res);
    return run_res;
  };

  const deleteThread = async (thread_id: string) => {
    if (thread === undefined) {
      return;
    }
    const gptResponse = await fetch(
      'https://api.openai.com/v1/threads/' + thread_id,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v1'
        }
      }
    );
    const thread_res = await gptResponse.json();
    console.log(thread_res);
    return thread_res;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    // save the keys in storage browser
    localStorage.setItem('open_ai_key', process.env.NEXT_PUBLIC_OPENAI_API_KEY);
    localStorage.setItem(
      'assistant_key',
      process.env.NEXT_PUBLIC_OPENAI_ASSISTANT_KEY
    );

    const assistant_res = await getAssistant();
    setAssistant(assistant_res);
    const thread_res = await createThread();
    setThread(thread_res);

    const message = await createMessage(thread_res.id);
    let runAssistantResponse = await runAssistant(
      thread_res.id,
      assistant_res.id
    );
    console.log(runAssistantResponse);

    while (runAssistantResponse.status !== 'completed') {
      runAssistantResponse = await getRunAssistant(
        runAssistantResponse.id,
        thread_res.id
      );

      if (runAssistantResponse.status === 'completed') {
        console.log('Message is : ');
        const call_response = await getMessage(thread_res.id, message.id);
        setResMessage(call_response);
        console.log(await deleteThread(thread_res.id));
      } else {
        // sleep for 2 second
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    console.log(assistant);
    console.log(thread);
    console.log(message);
    console.log(runAssistantResponse);

    setSubmitMessage(inputMessage);
    setLoading(false);
  };

  // -------------- Copy Response --------------
  // const copyToClipboard = (text: string) => {
  //  const el = document.createElement('textarea');
  //  el.value = text;
  //  document.body.appendChild(el);
  //  el.select();
  //  document.execCommand('copy');
  //  document.body.removeChild(el);
  // };

  const handleChange = (Event: any) => {
    setInputMessage(Event.target.value);
  };

  return (
    <DashboardLayout
      userDetails={props.userDetails}
      user={props.user}
      products={props.products}
      subscription={props.subscription}
      title="AI Generator"
      description="AI Generator"
    >
      <div className="relative flex w-full flex-col pt-[20px] md:pt-0">
        <Image
          width="340"
          height="181"
          src={theme === 'dark' ? Bgdark.src : Bg.src}
          className="absolute left-[20%] top-[50%] z-[0] w-[200px] translate-y-[-50%] md:left-[35%] lg:left-[38%] xl:left-[38%] xl:w-[350px] "
          alt=""
        />
        <div className="mx-auto flex min-h-[75vh] w-full max-w-[1000px] flex-col xl:min-h-[85vh]">
          {/* Model Change */}
          <div
            className={`flex w-full flex-col ${
              res_message?.data?.[0]?.content?.[0].text?.value
                ? 'mb-5'
                : 'mb-auto'
            }`}
          >
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-500">
                Please make sure that you have set the environmental variable
                for the Assistant Key.
              </p>
            </div>
          </div>
          {/* Main Box */}
          <div
            className={`mx-auto flex w-full flex-col ${
              res_message?.data?.[0]?.content?.[0].text?.value
                ? 'flex'
                : 'hidden'
            } mb-auto`}
          >
            <div className="mb-2.5 flex w-full items-center text-center">
              <div className="mr-5 flex h-[40px] min-h-[40px] min-w-[40px] items-center justify-center rounded-full border border-zinc-200 bg-transparent dark:border-transparent dark:bg-white">
                <HiUser className="h-4 w-4" />
              </div>
              <div className="flex w-full">
                <div className="me-2.5 flex w-full rounded-md border border-zinc-200 bg-white/10 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950">
                  <p className="text-sm font-semibold leading-6 text-foreground dark:text-white md:text-base md:leading-[26px]">
                    {submitMessage}
                  </p>
                </div>
                <div className="flex w-[70px] cursor-pointer items-center justify-center rounded-md border border-zinc-200 bg-white/10 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950">
                  <HiMiniPencilSquare className="h-[20px] w-[20px] text-foreground dark:text-white" />
                </div>
              </div>
            </div>
            <div className="flex w-full">
              <div className="mr-5 flex h-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-full bg-zinc-950 dark:border dark:border-zinc-800">
                <HiSparkles className="h-4 w-4 text-white" />
              </div>
              <MessageBoxChat
                output={res_message?.data?.[0]?.content?.[0].text?.value}
              />
            </div>
          </div>
          {/* Chat Input */}
          <div className="mt-5 flex justify-end">
            <Input
              className="mr-2.5 h-full min-h-[54px] w-full px-5 py-5 text-sm focus:outline-0 dark:placeholder:text-zinc-400"
              placeholder="Type your message here..."
              onChange={handleChange}
            />
            <Button
              className="mt-auto flex h-[unset] w-[200px] items-center justify-center rounded-md px-4 py-5 text-base font-medium"
              onClick={handleSubmit}
            >
              {loading ? (
                <svg
                  aria-hidden="true"
                  role="status"
                  className="mr-2 inline h-4 w-4 animate-spin text-zinc-200 duration-75 dark:text-zinc-950"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="white"
                  ></path>
                </svg>
              ) : (
                'Submit'
              )}
            </Button>
          </div>

          <div className="mt-5 flex flex-col items-center justify-center md:flex-row">
            <p className="text-center text-xs text-zinc-500 dark:text-white">
              Free Research Preview. ChatGPT may produce inaccurate information
              about people, places, or facts. Consider checking important
              information.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
