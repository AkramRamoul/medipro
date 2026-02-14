"use client";

import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { cn } from "../lib/utils";
import { X } from "lucide-react";

interface ModalProps {
  isOpen?: boolean;
  onClose: () => void;
  children: React.ReactNode;
  panelClassName?: string;
}

const ModalV2: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  panelClassName,
}) => {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop with premium blur */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:scale-95"
            >
              <Dialog.Panel
                className={cn(
                  `relative w-full rounded-2xl
                    max-h-[90vh] overflow-y-auto
                    scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent
                    bg-background
                    border border-border/50
                    shadow-2xl
                    px-4 pb-4 pt-5
                    sm:my-8 sm:max-w-lg sm:p-8
                    will-change-transform`,
                  panelClassName,
                )}
              >
                {/* Modern Close Button */}
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block z-10">
                  <button
                    type="button"
                    onClick={onClose}
                    className="
                      rounded-full
                      p-2
                      text-muted-foreground
                      hover:text-foreground
                      hover:bg-accent
                      focus:outline-none
                      focus:ring-2
                      focus:ring-ring
                      transition-colors
                      duration-200
                    "
                    aria-label="Fermer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="text-left">
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ModalV2;
