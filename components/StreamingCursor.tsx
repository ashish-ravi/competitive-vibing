/**
 * Static "more is coming" marker shown at the end of text that is still
 * streaming in. Deliberately not animated: blinking carets are repetitive
 * motion that reads as decoration and is hard on motion-sensitive users.
 */
export function StreamingCursor() {
  return (
    <span aria-hidden className="ml-1 text-muted-foreground">
      …
    </span>
  );
}
