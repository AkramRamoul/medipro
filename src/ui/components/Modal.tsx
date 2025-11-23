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
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => {}} // disables closing by outside click or Esc
      >
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" />

        {/* Full-Screen Modal */}
        <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
          <DialogPanel
            className="
          relative
          flex flex-col
          w-full h-[90vh]
          max-w-none sm:max-w-none
          overflow-hidden
          rounded-lg
          bg-card text-card-foreground
          shadow-xl transition-all
        "
          >
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={onClose}
                className="
              p-2 rounded-md
              bg-background text-foreground
              hover:bg-muted
              focus:outline-none focus:ring-2 focus:ring-ring
            "
              >
                <IoClose className="h-6 w-6" />
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
