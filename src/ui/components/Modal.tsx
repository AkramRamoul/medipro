import React, { Fragment, useEffect } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { X } from "lucide-react";

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
      <Dialog as="div" static className="relative z-50" onClose={onClose}>
        {/* Backdrop with premium blur */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity"
            onMouseDown={onClose}
          />
        </TransitionChild>

        <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95 translate-y-4"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-4"
          >
            <DialogPanel
              className="
                relative
                flex flex-col
                h-[90vh]
                w-full
                sm:max-w-6xl
                max-w-none
                overflow-hidden
                rounded-2xl
                bg-background
                border border-border/50
                shadow-2xl
                ring-1 ring-black/5
                transition-all
              "
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Modern Close Button */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  type="button"
                  onClick={onClose}
                  className="
                    group
                    rounded-full
                    p-2.5
                    bg-background/80
                    backdrop-blur-sm
                    border border-border/50
                    text-muted-foreground
                    hover:text-foreground
                    hover:bg-accent
                    focus:outline-none
                    focus:ring-2
                    focus:ring-ring
                    transition-all
                    duration-200
                  "
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5 transition-transform group-hover:scale-110 group-active:scale-95" />
                </button>
              </div>

              <div className="p-8 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {children}
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;

