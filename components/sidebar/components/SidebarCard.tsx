'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  PlanContext,
  // OpenContext,
  ProductsContext,
  SubscriptionContext
  // UserContext,
  // UserDetailsContext
} from '@/contexts/layout';
import modalImagedark from '@/public/img/dark/modal/modal.png';
import modalImage from '@/public/img/light/modal/modal.png';
import SidebarImage from '@/public/SidebarBadge.png';
import { Database } from '@/types/types_db';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useContext } from 'react';
import { BiSolidCheckSquare } from 'react-icons/bi';
import { IoIosStar } from 'react-icons/io';

type Price = Database['public']['Tables']['prices']['Row'];
interface SidebarCard {
  [x: string]: any;
}
export default function SidebarDocs(props: SidebarCard) {
  const { theme, setTheme } = useTheme();

  const { plan, setPlan } = useContext(PlanContext);
  // const { open, setOpen } = useContext(OpenContext);
  const products = useContext(ProductsContext);
  // const user = useContext(UserContext);
  // const userDetails = useContext(UserDetailsContext);
  const subscription = useContext(SubscriptionContext);
  if (subscription) {
    return (
      // <div className="relative flex w-[calc(100%_-_10px)] items-center   border border-zinc-200 px-4 py-4 dark:border-zinc-800">
      <div className="relative flex items-center w-full rounded-md border border-zinc-200 px-4 py-4 dark:border-zinc-800">
        <Image
          width="54"
          height="30"
          className="mr-2.5 w-[27px]"
          src={SidebarImage.src}
          alt=""
        />
        <div className="flex w-full flex-col justify-center">
          <p className="mb-0.5 text-sm font-bold text-foreground dark:text-white">
            PRO Member
          </p>
          <p className="text-sm font-medium text-foreground dark:text-white">
            Unlimited plan active
          </p>
        </div>
      </div>
    );
  } else {
    return (
      // <div className="relative flex flex-col items-center rounded-md border border-zinc-200 px-4 py-4 dark:border-white/10">
      //   <Image
      //     width="54"
      //     height="30"
      //     className="w-[54px]"
      //     src={SidebarImage.src}
      //     alt=""
      //   />
      //   <div className="mb-3 flex w-full flex-col pt-4">
      //     <p className="mb-2.5 text-center text-lg font-bold text-foreground dark:text-white">
      //       Upgrade to Unlimited
      //     </p>
      //     <p className="text-center text-sm font-medium text-zinc-500 dark:text-zinc-400 focus:dark:!bg-white/20 active:dark:!bg-white/20">
      //       Generate Premium Content by upgrading to an unlimited plan!
      //     </p>
      //   </div>
      //   <Dialog>
      //     <DialogTrigger asChild>
      //       <Button className="mb-1.5 mt-2.5 flex h-[unset] w-full items-center justify-center rounded-md px-4 py-4 text-sm font-medium">
      //         Get started with PRO
      //       </Button>
      //     </DialogTrigger>
      //     <DialogContent className="min-w-max border-0 bg-white p-0 dark:bg-zinc-900">
      //       <div className="hidden">
      //         <DialogTitle></DialogTitle>
      //       </div>
      //       <div className="flex">
      //         <Image
      //           width="340"
      //           height="681"
      //           src={theme === 'dark' ? modalImagedark.src : modalImage.src}
      //           className="z-[100] hidden w-[340px] rounded-l-[16px] md:block"
      //           alt="avatar"
      //         />
      //         <div className="dark:!bg-navy-800 flex flex-col rounded-l-2xl rounded-r-2xl bg-white px-[30px] py-[34px] dark:bg-zinc-900 md:w-[412px] md:min-w-[412px] md:rounded-l-[0px] md:px-[42px] lg:w-[456px] lg:min-w-[456px]">
      //           <p className="mb-3 text-[26px] font-extrabold text-foreground dark:text-white">
      //             Upgrade to Unlimited
      //           </p>
      //           <p className="mb-6 font-medium text-foreground dark:text-zinc-400">
      //             Join 80,000+ users now
      //           </p>
      //           {/* Features */}
      //           <div className="flex w-full flex-col xl:w-[80%]">
      //             <div className="mb-5 flex items-center">
      //               <BiSolidCheckSquare className="mr-2.5 h-[20px] w-[20px] text-foreground dark:text-white" />
      //               <span className="text-sm font-medium text-foreground dark:text-white">
      //                 Access to 12+ Essay types
      //               </span>
      //             </div>
      //             <div className="mb-5 flex items-center">
      //               <BiSolidCheckSquare className="mr-2.5 h-[20px] w-[20px] text-foreground dark:text-white" />
      //               <span className="text-sm font-medium text-foreground dark:text-white">
      //                 Up to 1500 words per Essay
      //               </span>
      //             </div>
      //             <div className="mb-5 flex items-center">
      //               <BiSolidCheckSquare className="mr-2.5 h-[20px] w-[20px] text-foreground dark:text-white" />
      //               <span className="text-sm font-medium text-foreground dark:text-white">
      //                 Academic Citation formats (APA, etc.)
      //               </span>
      //             </div>
      //             <div className="mb-5 flex items-center">
      //               <BiSolidCheckSquare className="mr-2.5 h-[20px] w-[20px] text-foreground dark:text-white" />
      //               <span className="text-sm font-medium text-foreground dark:text-white">
      //                 Academic Levels (Master, etc.)
      //               </span>
      //             </div>
      //             <div className="mb-6 flex items-center">
      //               <BiSolidCheckSquare className="mr-2.5 h-[20px] w-[20px] text-foreground dark:text-white" />
      //               <span className="text-sm font-medium text-foreground dark:text-white">
      //                 Essay Tones (Academic, etc.)
      //               </span>
      //             </div>
      //           </div>
      //           {/* YEARLY */}
      //           <div
      //             className={`relative flex items-center border ${
      //               plan.product === 'prod_QfhcnVrnDf2I75'
      //                 ? 'border-zinc-950 dark:border-white'
      //                 : 'border-zinc-200 dark:border-zinc-800'
      //             } mb-5 w-full cursor-pointer rounded-md px-4 py-[14px]`}
      //             onClick={() =>
      //               setPlan({
      //                 product: 'prod_QfhcnVrnDf2I75',
      //                 price: 'price_1PoMDDDWNoHJSR0zjpoiLOzj'
      //               })
      //             }
      //           >
      //             <p className="mb-0.5 ml-2 mr-2 text-sm font-bold text-foreground dark:text-white">
      //               Yearly
      //             </p>
      //             <Badge className="flex rounded-full bg-green-500 px-2 py-0.5 text-sm font-bold text-foreground hover:bg-green-500 dark:text-white lg:hidden xl:flex">
      //               Save 35%
      //             </Badge>
      //             <p className="ml-auto flex font-medium text-foreground dark:text-white">
      //               $69
      //               <span className="ml-1 mt-0.5 text-sm font-medium text-foreground dark:text-zinc-400">
      //                 /year
      //               </span>
      //             </p>
      //           </div>
      //           {/* END YEARLY */}
      //           {/* MONTHLY */}
      //           <div
      //             className={`relative flex items-center border ${
      //               plan.product === 'prod_QfhYC6AAtI5IKW'
      //                 ? 'border-zinc-950 dark:border-white'
      //                 : 'border-zinc-200 dark:border-zinc-800'
      //             } mb-7 w-full cursor-pointer rounded-md px-4 py-[14px]`}
      //             onClick={() =>
      //               setPlan({
      //                 product: 'prod_QfhYC6AAtI5IKW',
      //                 price: 'price_1PoM9GDWNoHJSR0zmwpicH8y'
      //               })
      //             }
      //           >
      //             <p className="mb-0.5 ml-2 mr-2 text-sm font-bold text-foreground dark:text-white">
      //               Monthly
      //             </p>
      //             <p className="ml-auto flex font-medium text-foreground dark:text-white">
      //               $9
      //               <span className="ml-1 mt-0.5 text-sm font-medium text-foreground dark:text-zinc-400">
      //                 /month
      //               </span>
      //             </p>
      //           </div>
      //           {/* END MONTHLY */}
      //           {(products || []).map((product: any, key: number) => {
      //             const price = product?.prices?.find(
      //               (price: any) => price.id === plan.price
      //             );
      //             if (product.id === plan.product) {
      //               if (!price) return null;
      //               return (
      //                 <Button
      //                   key={key}
      //                   className="mb-7 flex w-full items-center justify-center rounded-md px-4 py-5 text-sm font-medium"
      //                   onClick={() => props.handleCheckout(price)}
      //                 >
      //                   Upgrade now
      //                 </Button>
      //               );
      //             }
      //           })}
      //           <p className="mx-auto mb-[5px] text-xs font-semibold text-foreground dark:text-zinc-400">
      //             Used by 80,000+ customers monthly
      //           </p>
      //           <div className="mx-auto flex flex-row items-center">
      //             <IoIosStar className="mr-[1px] h-4 w-4 text-orange-500" />
      //             <IoIosStar className="mr-[1px] h-4 w-4 text-orange-500" />
      //             <IoIosStar className="mr-[1px] h-4 w-4 text-orange-500" />
      //             <IoIosStar className="mr-[1px] h-4 w-4 text-orange-500" />
      //             <IoIosStar className="mr-1.5 h-4 w-4 text-orange-500" />
      //             <p className="h-full text-sm  font-extrabold text-foreground dark:text-white">
      //               4.9
      //             </p>
      //           </div>
      //         </div>
      //       </div>
      //     </DialogContent>
      //   </Dialog>
      //   <p className="mb-1 mt-2 text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">
      //     Join 80,000+ users now
      //   </p>
      // </div>
      <div className="relative flex items-center w-full rounded-md border border-zinc-200 px-4 py-4 dark:border-zinc-800">
      <Image
        width="54"
        height="30"
        className="mr-2.5 w-[27px]"
        src={SidebarImage.src}
        alt=""
      />
      <div className="flex w-full flex-col justify-center">
        <p className="mb-0.5 text-sm font-bold text-foreground dark:text-white">
          PRO Member
        </p>
        <p className="text-sm font-medium text-foreground dark:text-white">
          Unlimited plan active
        </p>
      </div>
    </div>
    );
  }
}
