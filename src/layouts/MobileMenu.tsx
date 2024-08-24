import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

import { cn } from "@/lib/utils";

const MobileMenu = ({
  links,
}: {
  links: { href: string; label: string }[];
}) => {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  if (!visible) return <div className="h-[2rem] lg:hidden" />;
  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger className="mx-auto lg:hidden" aria-label="모바일 메뉴">
        <Menu
          className={cn(
            "size-8 stroke-white mx-auto lg:hidden group-hover:stroke-black"
          )}
        />
      </DrawerTrigger>
      <DrawerContent className="text-xl">
        <nav>
          
        </nav>
        <nav className="flex flex-col px-4 divide-y">
          {links.map((link) => {
            if (link.href === "/shipping-rate")
              return (
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1" className="border-0">
                    <AccordionTrigger className="no-underline border-0 hover:no-underline p-4">
                      Shipping rate
                    </AccordionTrigger>
                    <AccordionContent className="py-2 text-base">
                      <ul className="space-y-4">
                        <li>
                          <a
                            href="/shipping-rate/ems-kpacket"
                            className="p-4 hover:bg-gray-200 transition-colors duration-300"
                            onClick={() => setOpen(false)}
                          >
                            EMS & K-packet
                          </a>
                        </li>
                        <li>
                          <a
                            href="/shipping-rate/express"
                            className="p-4 hover:bg-gray-200 transition-colors duration-300"
                            onClick={() => setOpen(false)}
                          >
                            Express
                          </a>
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              );

            return (
              <a
                href={link.href}
                className="p-4 hover:bg-gray-200 transition-colors duration-300"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            );
          })}
        </nav>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileMenu;
