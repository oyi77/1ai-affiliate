import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Modal({ open, onOpenChange, title, description, children, size = 'md' }) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };
  // Mobile: full-screen with 0.5rem margin. Desktop: centered with max-width.
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={`fixed inset-2 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-auto sm:w-full ${sizes[size]} bg-surface-2 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl p-4 sm:p-6 z-50 overflow-y-auto max-h-[calc(100vh-1rem)] sm:max-h-[90vh]`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    {title && (
                      <Dialog.Title className="text-xl font-semibold text-white mb-1">
                        {title}
                      </Dialog.Title>
                    )}
                    {description && (
                      <Dialog.Description className="text-sm text-slate-400">
                        {description}
                      </Dialog.Description>
                    )}
                  </div>
                  
                  <Dialog.Close className="text-slate-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </Dialog.Close>
                </div>

                {children}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
