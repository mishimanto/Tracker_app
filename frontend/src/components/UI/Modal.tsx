import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-[cubic-bezier(0.22,1,0.36,1)] duration-350"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-[cubic-bezier(0.4,0,0.2,1)] duration-250"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-2 text-center sm:items-center sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-[cubic-bezier(0.22,1,0.36,1)] duration-350"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95 sm:rotate-[0.25deg]"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-[cubic-bezier(0.4,0,0.2,1)] duration-250"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-3 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={`relative flex w-full transform flex-col overflow-hidden rounded-t-[5px] bg-white text-left shadow-2xl transition-all will-change-transform sm:my-8 sm:max-h-[90vh] sm:rounded-md sm:w-full ${sizes[size]}`}
              >
                <div className="flex items-center justify-between border border-slate-200 px-5 py-4 sm:px-6">
                  <div>
                    <Dialog.Title className="text-lg font-semibold text-slate-900 sm:text-xl">
                      {title}
                    </Dialog.Title>
                  </div>

                  <button
                    type="button"
                    className="rounded-2xl bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="max-h-[calc(100vh-88px)] overflow-y-auto px-5 py-5 sm:max-h-[calc(90vh-88px)] sm:px-6 sm:py-6">
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
