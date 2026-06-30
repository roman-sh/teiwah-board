"use client"

import { EllipsisVertical, Loader2, Trash2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type SessionActionsMenuProps = {
  sessionId: string
  isDeleteDialogOpen: boolean
  isDeleting: boolean
  onDeleteDialogOpenChange: (open: boolean) => void
  onDelete: () => void
  onManageBilling: () => void
}

export function SessionActionsMenu({
  sessionId,
  isDeleteDialogOpen,
  isDeleting,
  onDeleteDialogOpenChange,
  onDelete,
  onManageBilling
}: SessionActionsMenuProps) {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Session actions"
          >
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => {
              // Let the menu finish closing before the dialog opens, so the
              // two Radix focus scopes don't collide (dialog flicker).
              requestAnimationFrame(() => onDeleteDialogOpenChange(true))
            }}
          >
            <Trash2 />
            Delete session
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={onDeleteDialogOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this session?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  This permanently removes session{" "}
                  <span className="font-mono text-foreground">{sessionId}</span>{" "}
                  and unlinks its WhatsApp number. This can&apos;t be undone.
                </p>
                <p>
                  Deleting a session won&apos;t change your subscription. To
                  reduce your paid slots or cancel,{" "}
                  <button
                    type="button"
                    onClick={onManageBilling}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    manage your subscription
                  </button>
                  .
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                // Keep the dialog open while the request is in flight;
                // onDelete closes it on failure, unmount on success.
                event.preventDefault()
                onDelete()
              }}
              disabled={isDeleting}
              className={cn(buttonVariants({ variant: "destructive" }), "gap-2")}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete session"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
