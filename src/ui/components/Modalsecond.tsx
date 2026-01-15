"use client";

import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { IoClose } from "react-icons/io5";
import { cn } from "../lib/utils";

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
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="
              fixed inset-0
              bg-gray-500/75
              transition-opacity
            "
          />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
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
                  `
                  relative w-full transform overflow-hidden rounded-lg
                  bg-white dark:bg-[#222327]
                  text-gray-900 dark:text-gray-100
                  px-4 pb-4 pt-5
                  shadow-xl transition-all
                  sm:my-8 sm:max-w-lg sm:p-6
                  `,
                  panelClassName
                )}
              >
                {/* Close button */}
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block z-10">
                  <button
                    type="button"
                    onClick={onClose}
                    className="
                      rounded-md
                      bg-white dark:bg-[#222327]
                      text-gray-400 hover:text-gray-600
                      dark:text-gray-500 dark:hover:text-gray-300
                      focus:outline-none
                      focus:ring-2 focus:ring-indigo-500
                      focus:ring-offset-2
                      dark:focus:ring-offset-zinc-900
                    "
                  >
                    <span className="sr-only">Close</span>
                    <IoClose className="h-6 w-6" />
                  </button>
                </div>

                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ModalV2;
