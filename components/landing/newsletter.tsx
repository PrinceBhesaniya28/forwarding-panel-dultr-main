import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

// eslint-disable
export default function Newsletter() {
  return (
    <div className="mx-auto mb-20 flex max-w-full flex-col items-center text-center md:mb-8">
      <Badge
        variant="outline"
        className="mb-3.5 w-max px-4 py-2 text-foreground dark:border-none dark:bg-zinc-800 dark:text-white"
      >
        NEWSLETTER SECTION
      </Badge>
      <h1 className="mb-5 text-center text-3xl font-extrabold text-foreground dark:text-white md:text-5xl">
        Join our newsletter
      </h1>
      <p className="mb-8 px-2.5 text-center text-base font-normal leading-8 text-foreground dark:text-zinc-400 md:px-0 lg:text-lg">
        By subscribing, you&apos;ll be the first to know about the latest news
        and updates.
      </p>
      <form
        id="form-fbcaaaec-e795-4419-b112-06934fd0051d"
        action="https://api.encharge.io/v1/forms/fbcaaaec-e795-4419-b112-06934fd0051d/submission/plain"
        method="POST"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}
      >
        <div className="sc-jzJRlG kfekry">
          <div className="encharge-form-group sc-jTzLTM frRvjZ form-group">
            <Input
              className="encharge-form-input sc-kAzzGY kTMZCx form-control mb-0 mr-[14px] h-full w-[96%] max-w-full px-5 py-4 !outline-none placeholder:text-foreground focus:placeholder:border-zinc-200 dark:border-zinc-800 dark:bg-transparent dark:text-white dark:placeholder:text-zinc-400 focus:placeholder:dark:border-zinc-800 md:w-[420px]"
              placeholder="Enter your email*"
              name="email"
              id="31b6ea2a-d9c7-4b42-9a01-7677838f07e9"
              type="email"
            />
          </div>
        </div>
        <div className="sc-cSHVUG ebRkVm">
          <Button className="flex items-center justify-center px-4 py-7 text-sm font-medium">
            Subscribe
          </Button>
        </div>
      </form>
    </div>
  );
}
