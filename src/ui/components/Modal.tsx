import React, { Fragment } from "react";
import { Dialog, DialogPanel, Transition } from "@headlessui/react";
import { IoClose } from "react-icons/io5";

interface ModalProps {
  isOpen?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-background/80 backdrop:overflow-none backdrop-blur-sm transition-opacity" />

        {/* Full-Screen Modal */}
        <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
          <DialogPanel
            className="
          relative
          flex flex-col
          sm:max-w-6xl h-[90vh]
          w-full
          max-w-none 
          overflow-hidden
          rounded-sm
          bg-card text-card-foreground
          shadow-xl transition-all
        "
          >
            {/* Close Button */}
            <div className="absolute top-4 right-5 z-10">
              <button
                type="button"
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
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <IoClose className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 flex-1 overflow-y-auto">{children}</div>
          </DialogPanel>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
