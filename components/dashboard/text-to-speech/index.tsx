/*eslint-disable*/
'use client';

import AudioPlayer from '@/components/audio';
import DashboardLayout from '@/components/layout';
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
import { Database } from '@/types/types_db';
import { User } from '@supabase/supabase-js';
import { useEffect, useRef, useState } from 'react';

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
  updateCredits: any;
  userDetails: { [x: string]: any } | null;
}

export default function EssayGenerator(props: Props) {
  const { userDetails, subscription } = props;
  // -------------- States --------------
  const [mainInput, setMainInput] = useState<string>('');
  const [usedVoice, setUsedVoice] = useState<string>('onyx');
  const [playableAudio, setPlayableAudio] = useState<any>({});
  const [src, setSrc] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const isFirstRender = useRef(true);
  const [audioSrc, setAudioSrc] = useState('');
  // --------------  Ref to the audio element --------------
  const audioRef = useRef<any>(null);

  const maxTextLength = 4000;

  // Function to play a specific audio file
  const playAudio = (filePath: string) => {
    setAudioSrc(filePath);
    if (audioRef.current) {
      // Explicitly call load to reload the new source
      audioRef.current.load();
      audioRef.current.onloadeddata = () => {
        audioRef.current
          .play()
          .catch((error: any) => console.log('Error playing audio:', error));
      };
    }
  };

  // -------------- useEffect for creating download URL --------------
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      handleHistory();
      return;
    }
    // console.log(playableAudio);
    const array = new Uint8Array(Object.values(playableAudio));
    // console.log(array);
    const blob = new Blob([array], {
      type: 'audio/mp3'
    });
    const audioURL = URL.createObjectURL(blob);
    setSrc(audioURL); // after component is mount, src will change
  }, [playableAudio]);

  // -------------- Input Value Handler --------------
  const handleChange = (Event: any) => {
    setMainInput(Event.target.value);
  };
  const handleVoice = (Event: any) => {
    setUsedVoice(Event.target.value);
  };

  // -------------- Last Audio Generated / History / Init --------------
  const handleHistory = async () => {
    setLoading(true);
    const formData = new FormData();
    if (userDetails != null) {
      formData.append('userId', userDetails.id);
    }
    try {
      const response = await fetch('/api/s3-download', {
        method: 'POST',
        body: formData
      });
      const mp3Data = await response.json();
      if (mp3Data.error) {
        console.log(
          `The user doesn't exist or does not have anything generated yet!`
        );
        setLoading(false);
        return;
      }
      setPlayableAudio(mp3Data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // -------------- Button Handlers --------------
  const handlePost = async (e: any) => {
    e.preventDefault();
    if (!mainInput) return;
    if (mainInput.length > maxTextLength) {
      alert(
        `Please enter code less than ${maxTextLength} characters. You are currently at ${mainInput.length} characters.`
      );
      return;
    }
    if (subscription) {
      if (userDetails?.credits < 1) {
        // toast({
        //   title: 'Not enough credits! Upgrade to a PRO Plan!',
        //   status: 'error',
        //   duration: 9000,
        //   containerStyle: {
        //     borderRadius: '8px',
        //     color: 'white',
        //   },
        //   isClosable: true,
        //   position: 'top',
        // });
        return;
      }
    } else {
      if (userDetails?.trial_credits < 1) {
        // toast({
        //   title: 'Not enough credits! Upgrade to a PRO Plan!',
        //   status: 'error',
        //   duration: 9000,
        //   containerStyle: {
        //     borderRadius: '8px',
        //     color: 'white',
        //   },
        //   isClosable: true,
        //   position: 'top',
        // });
        return;
      }
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('text', mainInput);
    formData.append('voice', usedVoice);
    if (userDetails != null) {
      formData.append('userId', userDetails.id);
    }
    try {
      const response = await fetch('/api/s3-upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setPlayableAudio(data.buffer.data);
      props.updateCredits(
        subscription ? userDetails?.credits : userDetails?.trial_credits
      );
      setLoading(false);
      // toast({
      //   title: 'Speech generated!',
      //   status: 'success',
      //   duration: 9000,
      //   containerStyle: {
      //     borderRadius: '8px',
      //     color: 'white',
      //   },
      //   isClosable: true,
      //   position: 'top',
      // });
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleClick = (e: any) => {
    e.preventDefault();
    // This runs on client
    if (typeof window !== 'undefined') {
      // Create anchor with Blob URL and file name
      const link = document.createElement('a');
      link.href = src ? src : '#';
      link.download = 'speech.mp3';
      link.setAttribute('target', '_blank');
      // Temporarily add to the body
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  return (
    <DashboardLayout
      userDetails={userDetails}
      user={props.user}
      products={props.products}
      subscription={subscription}
      title="Premium Generator"
      description="Premium Generator"
    >
      <div className="relative flex w-full flex-col">
        <div className="mx-auto flex w-full max-w-full flex-col justify-center md:w-full xl:w-full xl:flex-row">
          <Card className="mb-5 me-0 min-h-full min-w-full max-w-full p-5 dark:border-zinc-800 md:me-5 xl:mb-0 xl:min-w-[50%] xl:max-w-[50%]">
            <p className="mb-2.5 text-3xl font-extrabold text-foreground dark:text-white">
              Text Content
            </p>
            <p className="mb-8 text-sm font-medium text-zinc-500 dark:text-zinc-400 md:text-base">
              Enter the text content you want to convert
            </p>
            <textarea
              className="mb-7 min-h-[224px] w-full rounded-md border-[1px] border-zinc-200 bg-white px-5 py-[15px] font-medium text-foreground !outline-none placeholder:text-foreground focus:placeholder:border-zinc-200 dark:border-zinc-800 dark:bg-transparent dark:text-white dark:text-white/60 dark:placeholder:text-gray-400 focus:placeholder:dark:border-white/20"
              placeholder="Type here your text content..."
              onChange={handleChange}
            />
            <label
              className="mb-2 ml-1.5 mr-2.5 flex cursor-pointer font-bold text-foreground dark:text-white"
              htmlFor="parag"
            >
              Select Voice Type
            </label>
            <Select>
              <SelectTrigger
                id="type"
                className="mb-7 h-[60px] w-full px-5 text-base font-medium"
              >
                <SelectValue placeholder="Select your speech voice" />
              </SelectTrigger>
              <SelectContent onChange={handleVoice}>
                <SelectGroup>
                  <SelectItem className="hover:dark:text-white" value={'onyx'}>
                    Mark Johnson
                  </SelectItem>
                  <SelectItem className="hover:dark:text-white" value={'alloy'}>
                    Adela Parkson
                  </SelectItem>
                  <SelectItem className="hover:dark:text-white" value={'fable'}>
                    George Will
                  </SelectItem>
                  <SelectItem className="hover:dark:text-white" value={'nova'}>
                    Esthera Hill
                  </SelectItem>
                  <SelectItem className="hover:dark:text-white" value={'echo'}>
                    Arthur Louis
                  </SelectItem>
                  <SelectItem
                    className="hover:dark:text-white"
                    value={'shimmer'}
                  >
                    Millie James
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button
              className="mt-auto flex h-[unset] w-full items-center justify-center rounded-md px-4 py-5 text-base font-medium"
              onClick={handlePost}
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
                'Convert your Text to Speech'
              )}
            </Button>
          </Card>
          <div className="flex h-full max-w-full flex-col xl:min-w-[50%] xl:max-w-[50%]">
            <Card className="h-full max-w-full p-5 dark:border-zinc-800">
              <p className="mb-1.5 text-2xl font-extrabold text-foreground dark:text-white">
                Generated Speech
              </p>
              <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400 md:text-base">
                Enjoy your outstanding generated speech!
              </p>
              <div className="flex flex-col">
                <AudioPlayer
                  handleClick={handleClick}
                  loading={loading}
                  src={src}
                />
                <Button
                  onClick={src ? handleClick : () => null}
                  variant="outline"
                  className="linear mt-5 h-[unset] w-full px-4 py-5 text-base font-[600] hover:dark:text-white"
                >
                  {loading ? (
                    <svg
                      aria-hidden="true"
                      role="status"
                      className="mr-2 inline h-4 w-4 animate-spin text-foreground duration-75 dark:text-white"
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
                  ) : src ? (
                    'Download MP3 File'
                  ) : (
                    'Generate something first!'
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
