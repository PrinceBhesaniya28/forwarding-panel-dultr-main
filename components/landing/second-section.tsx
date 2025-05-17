// eslint-disabled

import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

export default function SecondSection() {
  return (
    <div
      className="relative z-[2] flex w-full flex-col items-center bg-cover pt-[90px] md:pt-[140px] xl:pt-[180px]"
      id="features"
    >
      <div className="flex max-w-[1170px] flex-col items-center justify-center px-0 md:px-10 xl:px-0">
        <div className="flex w-[stretch] flex-col">
          <div className="mx-auto flex flex-col items-center text-center">
            <Badge
              variant="outline"
              className="mx-auto mb-2.5 w-max px-4 py-2 text-foreground dark:border-none dark:bg-zinc-800 dark:text-white"
            >
              HOW IT WORKS SECTION
            </Badge>
            <h1 className="mx-auto text-center text-3xl font-extrabold leading-[38px] text-foreground dark:text-white md:text-[48px] md:leading-[60px] xl:text-6xl xl:leading-[70px]">
              How it works?
            </h1>
          </div>
        </div>
        <div className="flex w-[86%] max-w-full flex-col items-center justify-center pt-10 md:w-[76%] md:pt-[60px] lg:w-[100%] lg:flex-row">
          <Card className="lg-0 mb-[50px] mr-0 flex flex-col p-6 dark:border-zinc-800 lg:mb-0 lg:mr-4">
            <h5 className="mb-3 text-center text-base font-semibold text-foreground dark:text-white md:text-left xl:text-lg">
              Step 1: This is an example
            </h5>
            <p className="w-[98%] text-center text-base font-normal text-foreground dark:text-zinc-400 md:text-left md:text-base md:leading-8">
              This is where your first step paragraph goes. For the moment, this
              is just an example to see what it will look like.
            </p>
          </Card>

          <Card className="lg-0 mb-[50px] mr-0 flex flex-col p-6 dark:border-zinc-800 lg:mb-0 lg:mr-4">
            <h5 className="mb-3 text-center text-base font-semibold text-foreground dark:text-white md:text-left xl:text-lg">
              Step 2: This is another example
            </h5>
            <p className="w-[98%] text-center text-base font-normal leading-7 text-foreground dark:text-zinc-400 md:text-left md:text-base md:leading-8">
              This is where your second step paragraph goes. For the moment,
              this is just an example to see what it will look like.
            </p>
          </Card>

          <Card className="lg-0 mb-[50px] mr-0 flex flex-col p-6 dark:border-zinc-800 lg:mb-0">
            <h5 className="mb-3 text-center text-base font-semibold text-foreground dark:text-white md:text-left xl:text-lg">
              Step 3: This is an example too
            </h5>
            <p className="w-[98%] text-center text-base font-normal leading-7 text-foreground dark:text-zinc-400 md:text-left md:text-base md:leading-8">
              This is where your third step paragraph goes. For the moment, this
              is just an example to see what it will look like.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
