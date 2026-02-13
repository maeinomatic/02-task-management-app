import * as React from "react"

import { cn } from "../../lib/utils"

type DialogContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  titleId?: string
  setTitleId: (id: string | undefined) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

const useDialogContext = () => {
  const ctx = React.useContext(DialogContext)
  if (!ctx) {
    throw new Error("Dialog components must be used within Dialog")
  }
  return ctx
}

type DialogProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const Dialog = ({ open, defaultOpen = false, onOpenChange, children }: DialogProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const [titleId, setTitleId] = React.useState<string | undefined>(undefined)
  const isControlled = typeof open === "boolean"
  const resolvedOpen = isControlled ? (open as boolean) : uncontrolledOpen

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange]
  )

  return (
    <DialogContext.Provider value={{ open: resolvedOpen, setOpen, titleId, setTitleId }}>
      {children}
    </DialogContext.Provider>
  )
}

type DialogTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
}

const DialogTrigger = ({ asChild, children, onClick, ...props }: DialogTriggerProps) => {
  const { setOpen } = useDialogContext()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (!event.defaultPrevented) {
      setOpen(true)
    }
  }

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>
    return React.cloneElement(child, {
      ...child.props,
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        child.props?.onClick?.(event)
        if (!event.defaultPrevented) {
          setOpen(true)
        }
      },
    })
  }

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  )
}

const DialogPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>

type DialogCloseProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
}

const DialogClose = ({ asChild, children, onClick, ...props }: DialogCloseProps) => {
  const { setOpen } = useDialogContext()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (!event.defaultPrevented) {
      setOpen(false)
    }
  }

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>
    return React.cloneElement(child, {
      ...child.props,
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        child.props?.onClick?.(event)
        if (!event.defaultPrevented) {
          setOpen(false)
        }
      },
    })
  }

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  )
}

type DialogOverlayProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Whether clicking on the overlay should close the dialog.
   * Defaults to true to preserve existing behavior.
   */
  closeOnOverlayClick?: boolean
}

const DialogOverlay = React.forwardRef<HTMLDivElement, DialogOverlayProps>(
  ({ className, closeOnOverlayClick = true, onClick, ...props }, ref) => {
    const { open, setOpen } = useDialogContext()

    if (!open) return null

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(event)
      if (!event.defaultPrevented && closeOnOverlayClick) {
        setOpen(false)
      }
    }

    return (
      <div
        ref={ref}
        className={cn("fixed inset-0 z-50 bg-black/80", className)}
        onClick={handleClick}
        {...props}
      />
    )
  }
)
DialogOverlay.displayName = "DialogOverlay"

type DialogContentProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Optional aria-label for the dialog when no DialogTitle is used.
   * If neither aria-label nor DialogTitle is provided, a default label will be used.
   */
  'aria-label'?: string
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, 'aria-label': ariaLabel, ...props }, ref) => {
    const { open, setOpen, titleId } = useDialogContext()
    const contentRef = React.useRef<HTMLDivElement>(null)
    const previousActiveElement = React.useRef<HTMLElement | null>(null)

    // Combine refs
    React.useImperativeHandle(ref, () => contentRef.current as HTMLDivElement)

    // Store the previously focused element and restore it when dialog closes
    React.useEffect(() => {
      if (open) {
        previousActiveElement.current = document.activeElement as HTMLElement
        // Focus the dialog content after a brief delay to ensure it's rendered
        requestAnimationFrame(() => {
          contentRef.current?.focus()
        })
      } else if (previousActiveElement.current) {
        previousActiveElement.current.focus()
        previousActiveElement.current = null
      }
    }, [open])

    // Trap focus within the dialog
    React.useEffect(() => {
      if (!open || !contentRef.current) return

      const handleFocusTrap = (event: FocusEvent) => {
        const target = event.target as Node
        if (contentRef.current && !contentRef.current.contains(target)) {
          event.preventDefault()
          contentRef.current.focus()
        }
      }

      document.addEventListener('focusin', handleFocusTrap)
      return () => document.removeEventListener('focusin', handleFocusTrap)
    }, [open])

    // Handle Escape key
    React.useEffect(() => {
      if (!open) return
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setOpen(false)
        }
      }
      window.addEventListener("keydown", onKeyDown)
      return () => window.removeEventListener("keydown", onKeyDown)
    }, [open, setOpen])

    // Prevent body scroll when dialog is open
    React.useEffect(() => {
      if (open) {
        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
          document.body.style.overflow = originalOverflow
        }
      }
    }, [open])

    if (!open) return null

    // Prepare aria labeling attributes for accessibility
    const ariaLabelProps: { "aria-labelledby"?: string; "aria-label"?: string } = {}
    if (titleId) {
      ariaLabelProps["aria-labelledby"] = titleId
    } else if (ariaLabel) {
      ariaLabelProps["aria-label"] = ariaLabel
    } else {
      // Fallback to ensure dialog always has an accessible name
      ariaLabelProps["aria-label"] = "Dialog"
    }

    return (
      <DialogPortal>
        <DialogOverlay />
        <div
          ref={contentRef}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          {...ariaLabelProps}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg sm:rounded-lg focus:outline-none",
            className
          )}
          onClick={(event) => event.stopPropagation()}
          {...props}
        >
          {children}
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100">
            <span className="h-4 w-4 flex items-center justify-center text-lg">×</span>
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>
      </DialogPortal>
    )
  }
)
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, id, ...props }, ref) => {
    const { setTitleId } = useDialogContext()
    const generatedId = React.useId()
    const titleId = id || generatedId

    React.useEffect(() => {
      setTitleId(titleId)
      return () => setTitleId(undefined)
    }, [titleId, setTitleId])

    return (
      <h2
        ref={ref}
        id={titleId}
        className={cn(
          "text-lg font-semibold leading-none tracking-tight",
          className
        )}
        {...props}
      />
    )
  }
)
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-gray-600", className)}
      {...props}
    />
  )
)
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
