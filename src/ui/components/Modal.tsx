import React, { Fragment, useEffect } from "react";
import { Dialog, DialogPanel, Transition } from "@headlessui/react";
import { IoClose } from "react-icons/io5";

interface ModalProps {
  isOpen?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen = false, onClose, children }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" static className="relative z-50" onClose={() => {}}>
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          onMouseDown={onClose}
        />

        <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
          <DialogPanel
            className="
              relative
              flex flex-col
              h-[90vh]
              w-full
              sm:max-w-6xl
              max-w-none
              overflow-hidden
              rounded-sm
              bg-card text-card-foreground
              shadow-xl
            "
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="absolute top-4 right-5 z-10">
              <button
                type="button"
                onClick={onClose}
                className="
                  rounded-md 
                  bg-white 
                  text-gray-400 
                  hover:text-gray-500 
                  focus:outline-none 
                  focus:ring-2 
                  focus:ring-indigo-500 
                  focus:ring-offset-2
                "
              >
                <span className="sr-only">Close</span>
                <IoClose className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">{children}</div>
          </DialogPanel>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
