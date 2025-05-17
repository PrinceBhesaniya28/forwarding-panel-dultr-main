/*eslint-disable*/

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Badge } from '../ui/badge';

export default function Home() {
  return (
    <div
      className="relative mx-auto mb-24 mt-12 flex w-[96vw] flex-col content-center items-center 
   rounded-lg bg-[linear-gradient(180deg,_#FFF_0%,_#F4F4F5_100%)] px-2 dark:bg-[linear-gradient(180deg,_rgba(255,_255,_255,_0.00)_0%,_rgba(255,_255,_255,_0.10)_100%)] md:mt-[90px]
   md:rounded-2xl
   md:px-0 lg:mt-[103px] 2xl:w-[94vw]"
      id="faqs"
    >
      <div className="mx-auto mb-10 flex max-w-[90%] flex-col items-center justify-center xl:max-w-[62%]">
        <Badge
          variant="outline"
          className="mb-3.5 w-max px-4 py-2 text-foreground dark:border-none dark:bg-zinc-800 dark:text-white"
        >
          FREQUENTLY ASKED QUESTIONS
        </Badge>
        <h1 className="mx-auto mb-5 text-center text-3xl font-extrabold text-foreground dark:text-white md:text-5xl">
          Frequently asked questions
        </h1>
        <p className="3xl:max-w-[56%] mx-auto mb-8 max-w-full text-center text-base font-normal leading-8 text-foreground dark:text-zinc-400 md:max-w-[80%] md:text-lg md:leading-8 2xl:max-w-[66%]">
          Looking for something else? Chat with us via{' '}
          <a className="underline" href="mailto:hello@horizon-ui.com">
            hello@horizon-ui.com
          </a>{' '}
          and we will try our best to help you with your questions!
        </p>
      </div>
      <div className="mx-auto mb-[60px] w-full max-w-full md:mb-[120px] md:max-w-[80%] lg:max-w-[860px]">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="dark:text-white">
              What is Horizon UI Boilerplate?
            </AccordionTrigger>
            <AccordionContent className="dark:text-white">
              This is an awesome example of how you can use our accordion
              component for your FAQs section to provide clear, concise answers
              while maintaining a clean and engaging user interface. The
              intuitive design allows users to easily navigate through common
              questions, expanding each section to find detailed information
              without overwhelming them with text. It's an ideal way to
              streamline your website's content and enhance user experience,
              ensuring that visitors have quick access to the answers they need.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="dark:text-white">
              Is Horizon UI Boilerplate Free?
            </AccordionTrigger>
            <AccordionContent className="dark:text-white">
              This is an awesome example of how you can use our accordion
              component for your FAQs section to provide clear, concise answers
              while maintaining a clean and engaging user interface. The
              intuitive design allows users to easily navigate through common
              questions, expanding each section to find detailed information
              without overwhelming them with text. It's an ideal way to
              streamline your website's content and enhance user experience,
              ensuring that visitors have quick access to the answers they need.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="dark:text-white">
              Pricing Page.
            </AccordionTrigger>
            <AccordionContent className="dark:text-white">
              This is an awesome example of how you can use our accordion
              component for your FAQs section to provide clear, concise answers
              while maintaining a clean and engaging user interface. The
              intuitive design allows users to easily navigate through common
              questions, expanding each section to find detailed information
              without overwhelming them with text. It's an ideal way to
              streamline your website's content and enhance user experience,
              ensuring that visitors have quick access to the answers they need.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger className="dark:text-white">
              How does Horizon UI Boilerplate work?
            </AccordionTrigger>
            <AccordionContent className="dark:text-white">
              This is an awesome example of how you can use our accordion
              component for your FAQs section to provide clear, concise answers
              while maintaining a clean and engaging user interface. The
              intuitive design allows users to easily navigate through common
              questions, expanding each section to find detailed information
              without overwhelming them with text. It's an ideal way to
              streamline your website's content and enhance user experience,
              ensuring that visitors have quick access to the answers they need.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger className="dark:text-white">
              Is Horizon UI Boilerplate suitable for all academic levels?
            </AccordionTrigger>
            <AccordionContent className="dark:text-white">
              This is an awesome example of how you can use our accordion
              component for your FAQs section to provide clear, concise answers
              while maintaining a clean and engaging user interface. The
              intuitive design allows users to easily navigate through common
              questions, expanding each section to find detailed information
              without overwhelming them with text. It's an ideal way to
              streamline your website's content and enhance user experience,
              ensuring that visitors have quick access to the answers they need.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-6">
            <AccordionTrigger className="dark:text-white">
              Can I trust the quality of the content generated by Horizon UI
              Boilerplate?
            </AccordionTrigger>
            <AccordionContent className="dark:text-white">
              This is an awesome example of how you can use our accordion
              component for your FAQs section to provide clear, concise answers
              while maintaining a clean and engaging user interface. The
              intuitive design allows users to easily navigate through common
              questions, expanding each section to find detailed information
              without overwhelming them with text. It's an ideal way to
              streamline your website's content and enhance user experience,
              ensuring that visitors have quick access to the answers they need.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-7">
            <AccordionTrigger className="dark:text-white">
              Is the content generated by Horizon UI Boilerplate
              plagiarism-free?
            </AccordionTrigger>
            <AccordionContent className="dark:text-white">
              This is an awesome example of how you can use our accordion
              component for your FAQs section to provide clear, concise answers
              while maintaining a clean and engaging user interface. The
              intuitive design allows users to easily navigate through common
              questions, expanding each section to find detailed information
              without overwhelming them with text. It's an ideal way to
              streamline your website's content and enhance user experience,
              ensuring that visitors have quick access to the answers they need.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        {/* <Accordion allowMultiple>
          <AccordionItem borderTop="0px solid">
            <h3>
              <AccordionButton
                py="25px"
                _hover={{ bg: 'none' }}
                fontSize="md"
                letterSpacing="0px"
                fontWeight={'700'}
                className="text-foreground"
                _active={{ boxShadow: 'none' }}
                _focus={{ boxShadow: 'none' }}
              >
                <span className="flex text-left">
                  
                </span>
                <AccordionIcon ml="auto" />
              </AccordionButton>
            </h3>
            <AccordionPanel pb={4}>
              <div className="flex flex-col gap-10">
                <p className="text-base font-normal text-foreground dark:text-zinc-400">
                  
                  
                </p>
              </div>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h3>
              <AccordionButton
                py="25px"
                _hover={{ bg: 'none' }}
                fontSize="md"
                letterSpacing="0px"
                fontWeight={'700'}
                className="text-foreground"
                _active={{ boxShadow: 'none' }}
                _focus={{ boxShadow: 'none' }}
              >
                <span className="flex text-left">
                  
                </span>
                <AccordionIcon ml="auto" />
              </AccordionButton>
            </h3>
            <AccordionPanel pb={4}>
              <div className="flex flex-col gap-10">
                <p className="text-base font-normal text-foreground dark:text-zinc-400">
                 
                </p>
                <p className="text-base font-normal text-foreground dark:text-zinc-400">
                  You can learn more on our{' '}
                  <a href="/pricing">
                    <span className="font-bold text-[#422afb]">
                      
                    </span>
                  </a>{' '}
                </p>
              </div>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h3>
              <AccordionButton
                py="25px"
                _hover={{ bg: 'none' }}
                fontSize="md"
                letterSpacing="0px"
                fontWeight={'700'}
                className="text-foreground"
                _active={{ boxShadow: 'none' }}
                _focus={{ boxShadow: 'none' }}
              >
                <span className="flex text-left">
                  
                </span>
                <AccordionIcon ml="auto" />
              </AccordionButton>
            </h3>
            <AccordionPanel pb={4}>
              <div className="flex flex-col gap-10">
                <p className="text-base font-normal text-foreground dark:text-zinc-400">
                  
                </p>
              </div>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h3>
              <AccordionButton
                py="25px"
                _hover={{ bg: 'none' }}
                fontSize="md"
                letterSpacing="0px"
                fontWeight={'700'}
                className="text-foreground"
                _active={{ boxShadow: 'none' }}
                _focus={{ boxShadow: 'none' }}
              >
                <p className="flex text-left">
                  How can I use Horizon UI Boilerplate?
                </p>
                <AccordionIcon ml="auto" />
              </AccordionButton>
            </h3>
            <AccordionPanel pb={4}>
              <div className="flex flex-col gap-10">
                <p className="text-base font-normal text-foreground dark:text-zinc-400">
                  
                </p>
              </div>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h3>
              <AccordionButton
                py="25px"
                _hover={{ bg: 'none' }}
                fontSize="md"
                letterSpacing="0px"
                fontWeight={'700'}
                className="text-foreground"
                _active={{ boxShadow: 'none' }}
                _focus={{ boxShadow: 'none' }}
              >
                <span className="flex text-left">
                 
                </span>
                <AccordionIcon ml="auto" />
              </AccordionButton>
            </h3>
            <AccordionPanel pb={4}>
              <div className="flex flex-col gap-10">
                <p className="text-base font-normal text-foreground dark:text-zinc-400">
                  
                </p>
              </div>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h3>
              <AccordionButton
                py="25px"
                _hover={{ bg: 'none' }}
                fontSize="md"
                letterSpacing="0px"
                fontWeight={'700'}
                className="text-foreground"
                _active={{ boxShadow: 'none' }}
                _focus={{ boxShadow: 'none' }}
              >
                <span className="flex text-left">
                 
                </span>
                <AccordionIcon ml="auto" />
              </AccordionButton>
            </h3>
            <AccordionPanel pb={4}>
              <div className="flex flex-col gap-10">
                <p className="text-base font-normal text-foreground dark:text-zinc-400">
                  
                </p>
              </div>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h3>
              <AccordionButton
                py="25px"
                _hover={{ bg: 'none' }}
                fontSize="md"
                letterSpacing="0px"
                fontWeight={'700'}
                className="text-foreground"
                _active={{ boxShadow: 'none' }}
                _focus={{ boxShadow: 'none' }}
              >
                <span className="flex text-left">
                
                </span>
                <AccordionIcon ml="auto" />
              </AccordionButton>
            </h3>
            <AccordionPanel pb={4}>
              <div className="flex flex-col gap-10">
                <p className="text-base font-normal text-foreground dark:text-zinc-400">
                 
                </p>
              </div>
            </AccordionPanel>
          </AccordionItem>
        </Accordion> */}
      </div>
    </div>
  );
}
