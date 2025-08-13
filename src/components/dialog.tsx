import { DialogContent } from "@/components/ui/dialog"

// Update DialogContent usage
<DialogContent className="sm:max-w-[425px]" aria-describedby="dialog-description">
  {/* Add hidden description for accessibility */}
  <p id="dialog-description" className="sr-only">
    Dialog content for {/* Add relevant description */}
  </p>
  {/* ...existing content... */}
</DialogContent>
