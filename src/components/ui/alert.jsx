"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"


import { cn } from "@/lib/utils"

function Alert({
  className,
  ...props
}) {
  return (
    <AlertDialogPrimitive.Root
      data-slot="alert-dialog"
      className={cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className)}
      {...props} />
  );
}

function AlertDescription({
    className,
    ...props
    }) {
    return (
        <AlertDialogPrimitive.Description
        data-slot="alert-dialog-description"
        className={cn("text-sm text-muted-foreground", className)}
        {...props} />
    );
    }

function AlertTitle({
    className,
    ...props
    }) {
    return (
        <AlertDialogPrimitive.Title
        data-slot="alert-dialog-title"
        className={cn("text-lg font-semibold leading-none tracking-tight", className)}
        {...props} />
    );
    }



    export { Alert, AlertDescription, AlertTitle }