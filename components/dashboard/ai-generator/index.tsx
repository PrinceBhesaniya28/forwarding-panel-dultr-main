/*eslint-disable*/
'use client';

import DashboardLayout from '@/components/layout';
import MessageBox from '@/components/MessageBox';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { EssayBody, OpenAIModel } from '@/types/types';
import { Database } from '@/types/types_db';
import { User } from '@supabase/supabase-js';
import { useState } from 'react';

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

export default function EssayGenerator(props: Props) {
  // *** If you use .env.local variable for your API key, method which we recommend, use the apiKey variable commented below

  // Input States
  const [words, setWords] = useState<'300' | '200'>('200');
  const [essayType, setEssayType] = useState<
    '' | 'Argumentative' | 'Classic' | 'Persuasive' | 'Critique'
  >('Argumentative');
  const [topic, setTopic] = useState<string>('');
  // Response message
  const [outputCode, setOutputCode] = useState<string>('');
  // ChatGPT model
  const [model, setModel] = useState<OpenAIModel>('gpt-3.5-turbo');
  // Loading state
  const [loading, setLoading] = useState<boolean>(false);

  // -------------- Main API Handler --------------
  const handleTranslate = async () => {
    const maxCodeLength = model === 'gpt-3.5-turbo' ? 700 : 700;

    // Chat post conditions(maximum number of characters, valid message etc.)

    // if (!apiKey?.includes('sk-') && !apiKey?.includes('sk-')) {
    //  alert('Please enter an API key.');
    //  return;
    // }

    if (!topic) {
      alert('Please enter your subject.');
      return;
    }
    if (!words) {
      alert('Please choose number of words.');
      return;
    }
    if (!essayType) {
      alert('Please choose a type of essay.');
      return;
    }
    if (topic.length > maxCodeLength) {
      alert(
        `Please enter code less than ${maxCodeLength} characters. You are currently at ${topic.length} characters.`
      );
      return;
    }

    setLoading(true);
    setOutputCode('');

    const controller = new AbortController();

    const body: EssayBody = {
      topic,
      words,
      essayType,
      model
    };

    // -------------- Fetch --------------
    const response = await fetch('/api/essayAPI', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      setLoading(false);
      if (response) {
        console.log(response);
        alert(
          'Something went wrong went fetching from the API. Make sure to use a valid API key.'
        );
      }
      return;
    }

    const data = response.body;

    if (!data) {
      setLoading(false);
      alert('Something went wrong');
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let code = '';

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      code += chunkValue;

      setOutputCode((prevCode) => prevCode + chunkValue);
    }

    setLoading(false);
    copyToClipboard(code);
  };

  // -------------- Copy Response --------------
  const copyToClipboard = (text: string) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  // *** Initializing apiKey with .env.local value
  // useEffect(() => {
  // ENV file verison
  //  const apiKeyENV = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  //  if (apiKey === undefined || null) {
  //   setApiKey(apiKeyENV);
  //  }
  // }, []);

  // -------------- Input Value Handler --------------
  const handleChange = (Event: any) => {
    setTopic(Event.target.value);
  };
  const handleChangeParagraphs = (Event: any) => {
    setWords(Event.target.value);
  };
  const handleChangeEssayType = (Event: any) => {
    setEssayType(Event.target.value);
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
      <div className="relative flex w-full flex-col">
        <div className="mx-auto flex w-full max-w-full flex-col justify-center md:w-full md:flex-row xl:w-full">
          <Card className="mb-5 mr-0 flex min-h-full min-w-full flex-col border-zinc-200 p-5 dark:border-zinc-800 md:mb-0 md:mr-5 md:min-w-[40%] xl:min-w-[476px]">
            <p className="mb-2.5 text-3xl font-extrabold text-foreground dark:text-white">
              Essay Topic
            </p>
            <p className="mb-6 font-medium text-zinc-500 dark:text-zinc-400">
              What your essay will be about?
            </p>
            <Textarea
              className="mb-7"
              placeholder="Type here your topic..."
              onChange={handleChange}
            />
            <label
              className="mb-2 ml-1.5 mr-2.5 flex cursor-pointer font-bold text-foreground dark:text-white"
              htmlFor="parag"
            >
              Number of Words
            </label>
            <Select>
              <SelectTrigger
                id="type"
                className="mb-7 h-[60px] w-full px-5 text-base font-medium text-foreground dark:text-white"
              >
                <SelectValue placeholder="Select number of words" />
              </SelectTrigger>
              <SelectContent onChange={handleChangeParagraphs}>
                <SelectGroup>
                  <SelectItem className="hover:dark:text-white" value={'200'}>
                    200
                  </SelectItem>
                  <SelectItem className="hover:dark:text-white" value={'300'}>
                    300
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <label
              className="mb-2 ml-1.5 mr-2.5 flex cursor-pointer font-bold text-foreground dark:text-white"
              htmlFor={'type'}
            >
              Essay Type
            </label>
            <Select>
              <SelectTrigger
                id="type"
                className="mb-7 h-[60px] w-full px-5 text-base font-medium text-foreground dark:text-white"
              >
                <SelectValue placeholder="Select your essay type" />
              </SelectTrigger>
              <SelectContent onChange={handleChangeEssayType}>
                <SelectGroup>
                  <SelectItem
                    className="hover:dark:text-white"
                    value="Argumentative"
                  >
                    Argumentative
                  </SelectItem>
                  <SelectItem className="hover:dark:text-white" value="Classic">
                    Classic
                  </SelectItem>
                  <SelectItem
                    className="hover:dark:text-white"
                    value="Persuasive"
                  >
                    Persuasive
                  </SelectItem>
                  <SelectItem
                    className="hover:dark:text-white"
                    value="Critique"
                  >
                    Critique
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button
              className="mt-auto flex h-[unset] w-full items-center justify-center rounded-md px-4 py-5 text-base font-medium"
              onClick={handleTranslate}
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
                'Generate your Essay'
              )}
            </Button>
          </Card>
          <Card className="w-stretch mb-5 mr-0 h-full w-full max-w-full border-zinc-200 p-5 dark:border-zinc-800 md:mb-0 md:mr-5 ">
            <p className="mb-2.5 text-3xl font-extrabold text-foreground dark:text-white">
              AI Output
            </p>
            <p className="mb-8 font-medium text-zinc-500 dark:text-zinc-400">
              Enjoy your outstanding essay!
            </p>
            <MessageBox output={outputCode} />
            <Button
              variant="outline"
              className="linear h-[unset] w-[200px] px-4 py-5 text-base font-semibold text-foreground dark:text-white hover:dark:text-white"
              onClick={() => {
                if (outputCode) navigator.clipboard.writeText(outputCode);
              }}
            >
              Copy Text
            </Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
