import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SlideOver({ open, onOpenChange, title, description, children, width = 'md' }) {
  const widths = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

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
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={`fixed right-0 top-0 h-full w-full ${widths[width]} bg-surface-2 backdrop-blur-lg border-l border-white/10 shadow-2xl z-50 overflow-y-auto`}
              >
                <div className="sticky top-0 bg-surface-2/95 backdrop-blur-md border-b border-white/10 p-6 z-10">
                  <div className="flex items-start justify-between">
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
                </div>

                <div className="p-6">
                  {children}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
