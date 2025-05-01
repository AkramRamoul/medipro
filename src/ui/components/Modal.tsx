import React, { Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { IoClose } from "react-icons/io5";

interface ModalProps {
  isOpen?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Background Overlay */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-black dark:bg-opacity-70 transition-opacity" />
        </TransitionChild>

        {/* Full-Screen Modal */}
        <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
          <DialogPanel
            className="
          relative 
          transform 
          overflow-hidden 
          bg-white 
          dark:bg-gray-900 
          text-left 
          text-black 
          shadow-xl 
          transition-all 
          w-full 
          h-full 
          max-w-none 
          sm:max-w-none 
          flex 
          flex-col 
          rounded-lg
        "
            onClick={(e) => e.stopPropagation()} // Prevents unwanted closing
          >
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-10">
              <button
                className="p-2 bg-white dark:bg-gray-800 text-gray-500 focus:outline-none"
                onClick={onClose}
              >
                <IoClose className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 flex-1 overflow-y-auto">{children}</div>
          </DialogPanel>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default Modal;
